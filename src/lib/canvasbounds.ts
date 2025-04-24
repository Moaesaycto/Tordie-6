import { rotatePoint } from "@/lib/math";

export function getRotatedDocumentBounds({
    width,
    height,
    rotation,
    zoom,
    offset,
    isVertical
}: {
    width: number,
    height: number,
    rotation: number,
    zoom: number,
    offset: number,
    isVertical: boolean,
}): { start: number, len: number } {
    const coords = [
        rotatePoint(0, 0, rotation),
        rotatePoint(0, height, rotation),
        rotatePoint(width, 0, rotation),
        rotatePoint(width, height, rotation),
    ].map(p => isVertical ? p.y : p.x);

    const min = Math.min(...coords);
    const max = Math.max(...coords);
    const start = min * zoom + offset;
    const len = Math.max(0, (max - min) * zoom);
    return { start, len };
}
