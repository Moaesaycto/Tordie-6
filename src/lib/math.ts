// NOTE: This file is not intended for optimized mathematical operations. These are
//       ONLY to be used in the context of rendering and not official calculations.

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
