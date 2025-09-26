import Konva from "konva";

export const ensureDebugLayer = (stage: Konva.Stage) => {
    let layer = stage.findOne("#__debug__") as Konva.Layer | null;
    if (!layer) { layer = new Konva.Layer({ id: "__debug__", listening: false }); stage.add(layer); layer.moveToTop(); }
    return layer;
};

export const drawRect = (L: Konva.Layer, r: Konva.RectConfig, stroke = "magenta") =>
    L.add(new Konva.Rect({ ...r, fillEnabled: false, stroke, strokeWidth: 1, listening: false }));

export const drawDot = (L: Konva.Layer, x: number, y: number, stroke = "cyan") =>
    L.add(new Konva.Circle({ x, y, radius: 3, stroke, strokeWidth: 1, listening: false }));

export const clearDebug = (L: Konva.Layer) => L.destroyChildren();
