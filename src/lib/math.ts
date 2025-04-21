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
