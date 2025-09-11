import Konva from "konva";
import { state, applySelection } from "@/components/canvas/CanvasState";
import type { Id } from "@/lib/objects";
import { absScaleX, inflateRect, lineIntersectsRectWithTolerance, pointInRect } from "@/lib/math";
import Config from "@/tordie.config.json";

const geomIdOf = (n: Konva.Node): Id | null => (n.getAttr("geomId") as Id) ?? null;
const selectable = (n: Konva.Node) => n.hasName("selectable");
const dragLassoThreshold = () => Config.modes.drag_lasso_threshold ?? 4;

type SelectModeDeps = {
  stage: Konva.Stage;
  layer: Konva.Layer;     // kept for the rect; hit-testing uses stage
  sel: Konva.Rect;
  ns: string;             // e.g. ".selectTool"
};

export function enableSelectMode({ stage, layer, sel, ns }: SelectModeDeps): () => void {
  void layer; // Unused for now

  let selecting = false;      // we are in potential lasso interaction
  let armed = false;          // armed but not visible until threshold
  let x1 = 0, y1 = 0;

  stage.container().style.cursor = "crosshair";

  const onWindowUp = () => selecting && onUp({ evt: { button: 0 } } as any);
  window.addEventListener("mouseup", onWindowUp);

  const scenePos = () => {
    const p = stage.getPointerPosition();
    if (!p) return null;
    const inv = stage.getAbsoluteTransform().copy().invert();
    return inv.point(p);
  };
  const isPrimary = (e: Konva.KonvaEventObject<any>) =>
    "button" in e.evt ? e.evt.button === 0 : true;

  const onDown = (e: Konva.KonvaEventObject<any>) => {
    if (!isPrimary(e)) return;

    // If clicking a selectable node, DO NOT arm the lasso (user intends to drag/select that node)
    if (e.target !== stage && selectable(e.target)) {
      selecting = false;
      armed = false;
      sel.visible(false);
      stage.batchDraw();
      return;
    }

    const p = scenePos(); if (!p) return;
    selecting = true;
    armed = true; // will show after threshold
    x1 = p.x; y1 = p.y;

    // start hidden; will become visible once user moves enough
    sel.setAttrs({ x: p.x, y: p.y, width: 0, height: 0, visible: false });
    stage.batchDraw();
  };

  const onMove = () => {
    if (!selecting) return;
    const p = scenePos(); if (!p) return;

    const dx = p.x - x1;
    const dy = p.y - y1;

    // show the lasso only after a small movement
    if (armed && Math.hypot(dx, dy) >= dragLassoThreshold()) {
      sel.visible(true);
      armed = false;
    }

    if (!sel.visible()) return;

    sel.setAttrs({
      x: Math.min(x1, p.x),
      y: Math.min(y1, p.y),
      width: Math.abs(dx),
      height: Math.abs(dy),
    });
    stage.batchDraw();
  };

  const onUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selecting || !isPrimary(e)) return;
    selecting = false;
    armed = false;

    // If lasso never became visible, treat as click-on-empty handled elsewhere
    if (!sel.visible()) {
      sel.visible(false);
      stage.batchDraw();
      return;
    }

    // selection rect in absolute (stage) coords
    const box = sel.getClientRect({ skipTransform: false });

    // Hit-test across the entire stage (multiple layers supported)
    const hits = stage.find(".selectable").filter(n => {
      const cls = n.getClassName();
      if (cls === "Line") {
        return lineIntersectsRectWithTolerance(n as Konva.Line, box, stage);
      }
      if (cls === "Circle") {
        // treat handle as centre-in-inflated-rect by screen radius
        const t = n.getAbsoluteTransform();
        const c = t.point({ x: (n as Konva.Circle).x(), y: (n as Konva.Circle).y() });
        const rPx = (n as Konva.Circle).radius() * absScaleX(stage);
        const worldTol = Math.max(4, rPx) / absScaleX(stage);
        const R = inflateRect(box, worldTol);
        return pointInRect(c.x, c.y, R);
      }
      // fallback: bbox
      return Konva.Util.haveIntersection(box, n.getClientRect({ skipTransform: false }));
    });

    const ids = (hits as Konva.Node[])
      .filter(selectable)
      .map(geomIdOf)
      .filter((x): x is Id => !!x);

    // Expand + apply selection (line ↔ endpoints, shift/ctrl logic inside)
    applySelection(ids, e.evt);

    sel.visible(false);
    stage.batchDraw();
  };

  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPrimary(e)) return;

    // Click on empty stage clears selection
    if (e.target === stage || selecting) {
      if (e.target === stage) {
        state.selection.clear();
        stage.batchDraw();
      }
      return;
    }

    if (!selectable(e.target)) return;
    const id = geomIdOf(e.target); if (!id) return;

    // Click selection with expansion + modifiers
    applySelection([id], e.evt);
    stage.batchDraw();
  };

  sel.listening(false);
  sel.draggable(false);

  stage.on("mousedown" + ns, onDown);
  stage.on("mousemove" + ns, onMove);
  stage.on("mouseup" + ns, onUp);
  stage.on("click" + ns, onClick);

  return () => {
    stage.off(ns);
    sel.visible(false);
    stage.batchDraw();
    window.removeEventListener("mouseup", onWindowUp);
  };
}
