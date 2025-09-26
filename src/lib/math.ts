// NOTE: This file is not intended for optimized mathematical operations. These are
//       ONLY to be used in the context of rendering and not official calculations.

import Konva from "konva";

export const rotatePoint = (x: number, y: number, angleDeg: number) => {
    const angleRad = angleDeg * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
};


export function getNiceStepSize(pixelRange: number, zoom: number, targetPxPerTick = 100) {
    const worldRange = pixelRange / zoom;
    const approxStep = worldRange / (pixelRange / targetPxPerTick);

    const exponent = Math.floor(Math.log10(approxStep));
    const base = approxStep / Math.pow(10, exponent);

    let niceBase: number;
    if (base < 1.5) niceBase = 1;
    else if (base < 3.5) niceBase = 2;
    else if (base < 7.5) niceBase = 5;
    else niceBase = 10;

    return niceBase * Math.pow(10, exponent);
}


export const absScaleX = (stage: Konva.Stage) => stage.getAbsoluteScale()?.x ?? 1;


export const inflateRect = (r: Konva.RectConfig, d: number) => ({
    x: r.x! - d, y: r.y! - d, width: r.width! + 2 * d, height: r.height! + 2 * d
});


export const pointInRect = (px: number, py: number, r: { x: number; y: number; width: number; height: number }) =>
    px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;


export const segsIntersect = (
    ax: number, ay: number, bx: number, by: number,
    cx: number, cy: number, dx: number, dy: number
) => {
    // robust 2D segment intersection
    const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (d === 0) return false;
    const u = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d;
    const v = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
    return u >= 0 && u <= 1 && v >= 0 && v <= 1;
};


export const segIntersectsRect = (
    ax: number, ay: number, bx: number, by: number,
    r: { x: number; y: number; width: number; height: number }
) => {
    if (pointInRect(ax, ay, r) || pointInRect(bx, by, r)) return true;
    const x0 = r.x, y0 = r.y, x1 = r.x + r.width, y1 = r.y + r.height;
    return (
        segsIntersect(ax, ay, bx, by, x0, y0, x1, y0) || // top
        segsIntersect(ax, ay, bx, by, x1, y0, x1, y1) || // right
        segsIntersect(ax, ay, bx, by, x1, y1, x0, y1) || // bottom
        segsIntersect(ax, ay, bx, by, x0, y1, x0, y0)    // left
    );
};


export const lineIntersectsRectWithTolerance = (
  line: Konva.Line,
  rStage: { x: number; y: number; width: number; height: number },
  stage: Konva.Stage
) => {
  const toStage = stage.getAbsoluteTransform().copy().invert()
    .multiply(line.getAbsoluteTransform().copy()); // node -> stage

  const pts = line.points(); // local coords
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const p0 = toStage.point({ x: pts[i],     y: pts[i + 1] });
    const p1 = toStage.point({ x: pts[i + 2], y: pts[i + 3] });
    if (segIntersectsRect(p0.x, p0.y, p1.x, p1.y, rStage)) return true;
  }
  return false;
};
