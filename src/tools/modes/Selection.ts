import Konva from "konva";
import { state, applySelection } from "@/components/canvas/CanvasState";
import type { Id } from "@/lib/objects";
import { inflateRect, lineIntersectsRectWithTolerance } from "@/lib/math";
import Config from "@/tordie.config.json";
import { nodeRectScene, scenePoint, toScene } from "@/lib/scene";
import { ensureDebugLayer, clearDebug, drawRect, drawDot } from "@/components/debug/DebugLayer";

const DEBUG = Config.modes.debug_select;
let __dbgClicks = 0;

const geomIdOf = (n: Konva.Node): Id | null => (n.getAttr("geomId") as Id | undefined) ?? null;
const selectable = (n: Konva.Node) => n.hasName("selectable");
const dragLassoThreshold = () => Config.modes.drag_lasso_threshold ?? 4;
const isPrimary = (e: Konva.KonvaEventObject<any>) => ("button" in e.evt ? (e.evt as MouseEvent).button === 0 : true);


export type SelectModeDeps = { stage: Konva.Stage; layer: Konva.Layer; sel: Konva.Rect; ns: string; };

export function enableSelectMode({ stage, layer, sel, ns }: SelectModeDeps): () => void {
  void layer;

  let selecting = false, armed = false;
  let suppressClickOnce = false;
  let cancelClickFallback: number | null = null;
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0; // lasso scene endpoints

  stage.container().style.cursor = Config.viewport.cursor;

  const onDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPrimary(e)) return;

    if (e.target !== stage && selectable(e.target)) { // let node handlers take over
      selecting = false; armed = false; sel.visible(false); stage.batchDraw(); return;
    }

    const p = scenePoint(stage); if (!p) return;
    selecting = true; armed = true; suppressClickOnce = true;
    if (cancelClickFallback) { clearTimeout(cancelClickFallback); cancelClickFallback = null; }
    cancelClickFallback = window.setTimeout(() => { suppressClickOnce = false; cancelClickFallback = null; }, 300);

    x1 = x2 = p.x; y1 = y2 = p.y;
    sel.setAttrs({ x: p.x, y: p.y, width: 0, height: 0, visible: false, listening: false });
    stage.batchDraw();
  };

  const onMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    void e;
    if (!selecting) return;
    const p = scenePoint(stage); if (!p) return;
    x2 = p.x; y2 = p.y;

    const dx = x2 - x1, dy = y2 - y1;
    if (armed && Math.hypot(dx, dy) >= dragLassoThreshold()) { sel.visible(true); armed = false; }
    if (!sel.visible()) return;

    sel.setAttrs({ x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(dx), height: Math.abs(dy) });
    stage.batchDraw();
  };

  const onUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selecting || !isPrimary(e)) return;

    const wasVisible = sel.visible();
    selecting = false; armed = false;

    if (!wasVisible) { sel.visible(false); stage.batchDraw(); return; }

    const box = { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };

    if (DEBUG) {
      const dbg = ensureDebugLayer(stage);
      clearDebug(dbg);
      drawRect(dbg, box, "magenta");
      stage.find(".selectable").forEach(n => {
        if (n.getClassName() !== "Line") drawRect(dbg, nodeRectScene(n, stage), "orange");
      });
      dbg.batchDraw();
    }

    const hits = stage.find(".selectable").filter(n => {
      const cls = n.getClassName();

      if (cls === "Line") return hitTestLine(n as Konva.Line, box, stage, DEBUG);
      if (cls === "Circle") return hitTestCircle(n as Konva.Circle, box, stage, DEBUG);

      // generic fallback: bbox vs lasso in scene space
      return Konva.Util.haveIntersection(box, nodeRectScene(n, stage));
    });

    const ids = (hits as Konva.Node[]).filter(selectable).map(geomIdOf).filter((x): x is Id => !!x);
    applySelection(ids, e.evt);
    sel.visible(false);
    stage.batchDraw();
  };

  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPrimary(e)) return;

    if (DEBUG) console.log("CLICK", ++__dbgClicks, { suppressClickOnce });

    if (suppressClickOnce) {
      suppressClickOnce = false;
      if (cancelClickFallback) { clearTimeout(cancelClickFallback); cancelClickFallback = null; }
      e.cancelBubble = true;
      if (DEBUG) console.log("CLICK suppressed");
      return;
    }

    if (e.target === stage) { // clear on empty
      if (DEBUG) console.log("CLICK empty-stage -> clear");
      state.selection.clear(); stage.batchDraw(); return;
    }

    if (!selectable(e.target)) {
      if (DEBUG) console.log("CLICK non-selectable ignored", e.target.getClassName());
      return;
    }

    const id = geomIdOf(e.target); if (!id) return;
    if (DEBUG) console.log("CLICK node -> applySelection", id);
    applySelection([id], e.evt);
    stage.batchDraw();
  };

  const onWindowUp = () => {
    if (!selecting) return;
    const fake = { evt: { button: 0 } } as unknown as Konva.KonvaEventObject<MouseEvent>;
    onUp(fake);
  };

  // wire/unwire
  sel.listening(false); sel.draggable(false);
  stage.on("mousedown" + ns, onDown);
  stage.on("mousemove" + ns, onMove);
  stage.on("mouseup" + ns, onUp);
  stage.on("click" + ns, onClick);
  window.addEventListener("mouseup", onWindowUp);

  return () => {
    stage.off(ns);
    sel.visible(false);
    stage.batchDraw();
    window.removeEventListener("mouseup", onWindowUp);
    if (cancelClickFallback) clearTimeout(cancelClickFallback);
  };
}

export const pointSelectedViaLine = (pointId: Id) => {
  for (const g of state.diagram.geoms.values()) {
    if (g.payload.kind !== "line") continue;
    const { p0, p1 } = g.payload.data as { p0: Id; p1: Id };
    if (state.selection.has(g.id) && (p0 === pointId || p1 === pointId)) return true;
  }
  return false;
};

function hitTestLine(n: Konva.Line, box: Konva.RectConfig, stage: Konva.Stage, debug = false): boolean {
  const safeBox = {
    x: box.x ?? 0,
    y: box.y ?? 0,
    width: box.width ?? 0,
    height: box.height ?? 0
  };
  const ok = lineIntersectsRectWithTolerance(n, safeBox, stage);

  if (debug) {
    const dbg = ensureDebugLayer(stage);
    const T = toScene(n, stage);
    const pts = n.points();
    for (let i = 0; i + 1 < pts.length; i += 2) {
      const p = T.point({ x: pts[i], y: pts[i + 1] });
      drawDot(dbg, p.x, p.y, ok ? "lime" : "red");
    }
    dbg.batchDraw();
  }

  return ok;
}

function hitTestCircle(n: Konva.Circle, box: Konva.RectConfig, stage: Konva.Stage, debug = false): boolean {
  const absPos = n.getAbsolutePosition();
  const c = stage.getAbsoluteTransform().copy().invert().point(absPos);

  const sNode = n.getAbsoluteScale(), sStage = stage.getAbsoluteScale();
  const s = Math.max(Math.abs((sNode.x || 1) / (sStage.x || 1)), Math.abs((sNode.y || 1) / (sStage.y || 1)));
  const rScene = n.radius() * s;

  const R = inflateRect(box, Math.max(2, rScene));
  const ok = c.x >= R.x && c.x <= R.x + R.width && c.y >= R.y && c.y <= R.y + R.height;

  if (debug) {
    const dbg = ensureDebugLayer(stage);
    drawDot(dbg, c.x, c.y, ok ? "lime" : "red");
    if (ok) drawRect(dbg, R, "yellow");
    dbg.batchDraw();
  }

  return ok;
}
