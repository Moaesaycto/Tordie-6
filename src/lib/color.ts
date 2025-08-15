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

export function readableTextColour(bg: string): "black" | "white" {
  const [r, g, b] = parseColor(bg);
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  // choose the text (white vs black) that gives the higher contrast with bg
  const contrastWhite = (1.0 + 0.05) / (L + 0.05);
  const contrastBlack = (L + 0.05) / 0.05;
  return contrastWhite >= contrastBlack ? "white" : "black";
}

export function parseColor(s: string): [number, number, number] {
  s = s.trim();
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split("").map(ch => ch + ch).join("");
    const hasA = h.length === 8;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (!hasA) return [r, g, b];
    const a = parseInt(h.slice(6, 8), 16) / 255;
    // composite over white
    return [
      Math.round(r * a + 255 * (1 - a)),
      Math.round(g * a + 255 * (1 - a)),
      Math.round(b * a + 255 * (1 - a)),
    ];
  }
  const m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const [r, g, b, aRaw] = m[1].split(/\s*,\s*/).map(Number);
    const a = isFinite(aRaw as number) ? Math.max(0, Math.min(1, aRaw as number)) : 1;
    return [
      Math.round(r * a + 255 * (1 - a)),
      Math.round(g * a + 255 * (1 - a)),
      Math.round(b * a + 255 * (1 - a)),
    ];
  }
  throw new Error("Unsupported colour format");
}
