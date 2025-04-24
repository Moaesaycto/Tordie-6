import React, { useLayoutEffect, useState, useRef, useMemo } from 'react';
import { useStatus } from '@/components/status-provider';
import { formatLabel } from '@/lib/format';
import Config from '@/tordie.config.json';
import { getNiceStepSize, rotatePoint } from '@/lib/math';
import { useTheme } from '@/components/theme-provider';

const {
    ruler: { minorDivisions, subMinorDivisions, thickness, majorLength, minorLength, subLength },
} = Config;

const colourSchemes = {
    dark: { background: '#262626', overlap: '#404040', text: 'white' },
    light: { background: '#dbdbdb', overlap: '#bababa', text: 'black' },
};

type RulerProps = { orientation?: 'vertical' | 'horizontal'; className?: string };
type Tick = { posPx: number; level: 'major' | 'minor' | 'sub'; label?: string };

const Ruler: React.FC<RulerProps> = ({ orientation = 'horizontal', className = '' }) => {
    const { offsetX = 0, offsetY = 0, zoom = 1, rotation = 0, documentHeight = 0, documentWidth = 0 } = useStatus().canvas;
    const { viewportCursorCoords } = useStatus().canvas.cursor;
    const { resolvedTheme } = useTheme();
    const isVertical = orientation === 'vertical';

    // Memoise colours lookup
    const colours = useMemo(
        () => colourSchemes[resolvedTheme as keyof typeof colourSchemes] || colourSchemes.light,
        [resolvedTheme]
    );

    // Observe viewport size
    const viewportRef = useRef<HTMLElement | null>(null);
    const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const el = (viewportRef.current = document.getElementById('canvasViewport'));
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width && height) setSize({ width, height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const lengthPx = isVertical ? height : width;
    const tickEnd = lengthPx;

    // Precompute ticks and pixel positions
    const ticks = useMemo<Tick[]>(() => {
        const majorInterval = getNiceStepSize(lengthPx, zoom);

        if (!lengthPx || zoom <= 0) return [];
        const screenOffset = isVertical ? offsetY : offsetX;
        const viewStart = -screenOffset / zoom;
        const viewEnd = (tickEnd - screenOffset) / zoom;
        const startIdx = Math.floor(viewStart / majorInterval);
        const endIdx = Math.ceil(viewEnd / majorInterval);
        const out: Tick[] = [];

        for (let i = startIdx; i <= endIdx; i++) {
            const baseVal = i * majorInterval;
            const majorPos = baseVal * zoom + screenOffset;
            if (majorPos < -majorLength || majorPos > tickEnd + majorLength) continue;
            out.push({ posPx: majorPos, level: 'major', label: formatLabel(baseVal) });

            for (let j = -minorDivisions; j < minorDivisions; j++) {
                const pos = (baseVal + (j * majorInterval) / minorDivisions) * zoom + screenOffset;
                if (pos < -minorLength || pos > tickEnd + minorLength) continue;
                out.push({ posPx: pos, level: 'minor' });
            }
            for (let j = -minorDivisions * subMinorDivisions; j < minorDivisions * subMinorDivisions; j++) {
                const pos = (baseVal + (j * majorInterval) / (minorDivisions * subMinorDivisions)) * zoom + screenOffset;
                if (pos < -subLength || pos > tickEnd + subLength) continue;
                out.push({ posPx: pos, level: 'sub' });
            }
        }
        return out;
    }, [lengthPx, zoom, offsetX, offsetY, isVertical]);

    // Compute overlap box
    const overlap = useMemo(() => {
        const coords = [
            rotatePoint(0, 0, rotation),
            rotatePoint(0, documentHeight, rotation),
            rotatePoint(documentWidth, 0, rotation),
            rotatePoint(documentWidth, documentHeight, rotation),
        ].map(p => (isVertical ? p.y : p.x));
        const min = Math.min(...coords);
        const max = Math.max(...coords);
        const start = min * zoom + (isVertical ? offsetY : offsetX);
        const len = Math.max(0, (max - min) * zoom);
        return { start, len };
    }, [rotation, documentHeight, documentWidth, zoom, offsetX, offsetY, isVertical]);

    const svgW = isVertical ? thickness : width;
    const svgH = isVertical ? height : thickness;

    const cursorPosPx = isVertical ? viewportCursorCoords?.y : viewportCursorCoords?.x;

    return (
        <div style={{ overflow: 'hidden' }} className={className}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} className="block flex-none">
                <rect width="100%" height="100%" fill={colours.background} />
                {overlap.len > 0 && (
                    <rect
                        x={!isVertical ? overlap.start : 0}
                        y={isVertical ? overlap.start : 0}
                        width={!isVertical ? overlap.len : thickness}
                        height={isVertical ? overlap.len : thickness}
                        fill={colours.overlap}
                    />
                )}
                {ticks.map((t, idx) => {
                    const len = t.level === 'major' ? majorLength : t.level === 'minor' ? minorLength : subLength;
                    return (
                        <g key={idx}>
                            <line
                                x1={isVertical ? 0 : t.posPx}
                                y1={isVertical ? t.posPx : 0}
                                x2={isVertical ? len : t.posPx}
                                y2={isVertical ? t.posPx : len}
                                stroke={colours.text}
                                strokeWidth={1}
                            />
                            {t.level === 'major' &&
                                (isVertical ? (
                                    <text
                                        x={12}
                                        y={t.posPx}
                                        fontSize={10}
                                        fill={colours.text}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(-90,12,${t.posPx})`}
                                    >
                                        {t.label}
                                    </text>
                                ) : (
                                    <text x={t.posPx} y={18} fontSize={10} fill={colours.text} textAnchor="middle">
                                        {t.label}
                                    </text>
                                ))}
                        </g>
                    );
                })}
                {cursorPosPx && (
                    isVertical ? (
                        <polygon
                            points={`0,${cursorPosPx - 5} 0,${cursorPosPx + 5} 6,${cursorPosPx}`}
                            fill={resolvedTheme === "dark" ? "white" : "black"}
                        />
                    ) : (
                        <polygon
                            points={`${cursorPosPx - 5},0 ${cursorPosPx + 5},0 ${cursorPosPx},6`}
                            fill={resolvedTheme === "dark" ? "white" : "black"}
                        />
                    )
                )}

            </svg>
        </div>
    );
};

export default React.memo(Ruler);
