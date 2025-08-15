export function normaliseHex(s: string) {
    const x = s.startsWith("#") ? s : `#${s}`;
    return x.length === 4 ? ("#" + [...x.slice(1)].map((c) => c + c).join("")).toLowerCase() : x.toLowerCase();
}

export function toHex(input: string): string | null {
    if (!input) return null;
    const s = input.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return normaliseHex(s);
    const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i);
    if (rgb) return rgbToHex(+rgb[1], +rgb[2], +rgb[3]);
    const hsl = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)$/i);
    if (hsl) {
        const [h, sPct, lPct] = [+hsl[1], +hsl[2] / 100, +hsl[3] / 100];
        const { r, g, b } = hslToRgb(h, sPct, lPct);
        return rgbToHex(r, g, b);
    }
    if (typeof window !== "undefined" && "document" in window) {
        const el = document.createElement("span");
        el.style.color = s;
        document.body.appendChild(el);
        const m = getComputedStyle(el).color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
        document.body.removeChild(el);
        if (m) return rgbToHex(+m[1], +m[2], +m[3]);
    }
    return null;
}

export function rgbToHex(r: number, g: number, b: number) {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

export function hslToRgb(h: number, s: number, l: number) {
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - C / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) [r, g, b] = [C, X, 0];
    else if (60 <= h && h < 120) [r, g, b] = [X, C, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, C, X];
    else if (180 <= h && h < 240) [r, g, b] = [0, X, C];
    else if (240 <= h && h < 300) [r, g, b] = [X, 0, C];
    else[r, g, b] = [C, 0, X];
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
