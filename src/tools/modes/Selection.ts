import Konva from "konva";
import { clearSelection, addSelect, toggleSelect, state, applySelection } from "@/components/canvas/CanvasState";
import type { Id } from "@/lib/objects";
import { absScaleX, inflateRect, lineIntersectsRectWithTolerance, pointInRect } from "@/lib/math";

const geomIdOf = (n: Konva.Node): Id | null => (n.getAttr("geomId") as Id) ?? null;
const selectable = (n: Konva.Node) => n.hasName("selectable");

type SelectModeDeps = {
  stage: Konva.Stage;
  layer: Konva.Layer;
  sel: Konva.Rect;
  ns: string; // e.g. '.selectTool'
};

export function enableSelectMode({ stage, layer, sel, ns }: SelectModeDeps): () => void {
  let selecting = false;
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
    const p = scenePos(); if (!p) return;
    selecting = true;
    x1 = p.x; y1 = p.y;
    sel.setAttrs({ x: p.x, y: p.y, width: 0, height: 0, visible: true });
    layer.batchDraw();
  };

  const onMove = () => {
    if (!selecting) return;
    const p = scenePos(); if (!p) return;
    sel.setAttrs({
      x: Math.min(x1, p.x),
      y: Math.min(y1, p.y),
      width: Math.abs(p.x - x1),
      height: Math.abs(p.y - y1),
    });
    layer.batchDraw();
  };

  const onUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selecting || !isPrimary(e)) return;
    selecting = false;

    // selection rect in absolute (stage) coords
    const box = sel.getClientRect({ skipTransform: false });

    // pick by actual geometry overlap
    const hits = layer.find(".selectable").filter(n => {
      if (n.getClassName() === "Line") {
        return lineIntersectsRectWithTolerance(n as Konva.Line, box, stage);
      }
      // points / circles: center-in-rect (inflate by screen radius)
      if (n.getClassName() === "Circle") {
        const t = n.getAbsoluteTransform();
        const c = t.point({ x: (n as Konva.Circle).x(), y: (n as Konva.Circle).y() });
        const rPx = (n as Konva.Circle).radius() * absScaleX(stage) * ((n as any).strokeScaleEnabled?.() === false ? 1 : 1);
        // treat handles as a small square in screen space -> inflate rect in world space
        const worldTol = Math.max(4, rPx) / absScaleX(stage);
        const R = inflateRect(box, worldTol);
        return pointInRect(c.x, c.y, R);
      }
      // default fallback: bbox
      return Konva.Util.haveIntersection(box, n.getClientRect({ skipTransform: false }));
    });

    const ids = (hits as Konva.Node[])
      .filter(n => n.hasName("selectable"))
      .map(n => n.getAttr("geomId") as Id)
      .filter(Boolean);

    const { shiftKey, ctrlKey, metaKey } = e.evt;
    const toggleKey = ctrlKey || metaKey;
    if (!shiftKey && !toggleKey) clearSelection();
    for (const id of ids) {
      if (toggleKey) toggleSelect(id);
      else addSelect(id);
    }

    applySelection(ids, e.evt);

    sel.visible(false);
    layer.batchDraw();
  };


  // ...
  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPrimary(e)) return;
    if (e.target === stage || selecting) {
      if (e.target === stage) { state.selection.clear(); layer.batchDraw(); }
      return;
    }
    if (!selectable(e.target)) return;
    const id = geomIdOf(e.target); if (!id) return;
    applySelection([id], e.evt);   // expands line <-> points
    layer.batchDraw();
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
    layer.getStage()?.batchDraw();
    window.removeEventListener("mouseup", onWindowUp);
  };
}
