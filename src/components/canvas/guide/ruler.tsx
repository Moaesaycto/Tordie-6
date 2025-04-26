import React, { useMemo } from 'react';
import { useStatus } from '@/components/status-provider';
import { formatLabel } from '@/lib/format';
import Config from '@/tordie.config.json';
import { getNiceStepSize } from '@/lib/math';
import { useTheme } from '@/components/theme-provider';
import { generateTicks } from '@/lib/ticks';
import { getRotatedDocumentBounds } from '@/lib/canvasbounds';

const {
    ruler: { minorDivisions, subMinorDivisions, thickness, majorLength, minorLength, subLength },
} = Config;

const colourSchemes = {
    dark: { background: '#262626', overlap: '#404040', text: 'white' },
    light: { background: '#dbdbdb', overlap: '#bababa', text: 'black' },
};

type RulerProps = { orientation?: 'vertical' | 'horizontal'; className?: string };

const Ruler: React.FC<RulerProps> = ({ orientation = 'horizontal', className = '' }) => {
    const {
        offsetX,
        offsetY,
        zoom,
        rotation,
        documentHeight,
        documentWidth,
        cursor: { viewportCursorCoords },
    } = useStatus().canvas;

    const {
        viewportWidth,
        viewportHeight,
    } = useStatus().viewport;

    const { resolvedTheme } = useTheme();
    const isVertical = orientation === 'vertical';

    const colours = useMemo(
        () => colourSchemes[resolvedTheme as keyof typeof colourSchemes] || colourSchemes.light,
        [resolvedTheme]
    );

    const lengthPx = isVertical ? viewportHeight : viewportWidth;

    const ticks = useMemo(() => generateTicks({
        lengthPx,
        zoom,
        offset: isVertical ? offsetY : offsetX,
        getNiceStepSize,
        majorLength,
        minorLength,
        subLength,
        minorDivisions,
        subMinorDivisions,
        formatLabel
    }), [lengthPx, zoom, offsetX, offsetY, isVertical]);


    const overlap = useMemo(() =>
        getRotatedDocumentBounds({
            width: documentWidth,
            height: documentHeight,
            rotation,
            zoom,
            offset: isVertical ? offsetY : offsetX,
            isVertical
        }), [rotation, documentHeight, documentWidth, zoom, offsetX, offsetY, isVertical]
    );


    const svgW = isVertical ? thickness : viewportWidth;
    const svgH = isVertical ? viewportHeight : thickness;
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
                            fill={resolvedTheme === 'dark' ? 'white' : 'black'}
                        />
                    ) : (
                        <polygon
                            points={`${cursorPosPx - 5},0 ${cursorPosPx + 5},0 ${cursorPosPx},6`}
                            fill={resolvedTheme === 'dark' ? 'white' : 'black'}
                        />
                    )
                )}
            </svg>
        </div>
    );
};

export default React.memo(Ruler);
