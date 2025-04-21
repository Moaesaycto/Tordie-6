import { useEffect, useState } from "react";
import { useStatus } from "@/components/status-provider";
import { formatLabel } from "@/lib/format";
import Config from "@/tordie.config.json";
import { rotatePoint } from "@/lib/math";
import { useTheme } from "@/components/theme-provider";

type RulerProps = {
    orientation?: "vertical" | "horizontal",
    className?: string,
};

type Tick = {
    pos: number;
    level: "major" | "minor" | "sub";
};

const colorScheme = {
    "dark": {
        "background": "#262626",
        "overlap": "#404040",
        "text": "white"
    },
    "light": {
        "background": "#dbdbdb",
        "overlap": "#bababa",
        "text": "black"
    }
}

const Ruler = ({
    orientation = "horizontal",
    className = ""
}: RulerProps) => {
    const { offsetX, offsetY, zoom, rotation, documentHeight, documentWidth } = useStatus().canvas;
    const { resolvedTheme } = useTheme();

    const colors = colorScheme[resolvedTheme as keyof typeof colorScheme];

    void rotation; // Currently no scaling is applied from the rotation

    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateViewportSize = () => {
            const canvasViewport = document.getElementById("canvasViewport");
            if (canvasViewport) {
                setViewportSize({
                    width: canvasViewport.offsetWidth,
                    height: canvasViewport.offsetHeight,
                });
            }
        };

        updateViewportSize();
        window.addEventListener("resize", updateViewportSize);

        return () => window.removeEventListener("resize", updateViewportSize);
    }, []);

    const isVertical = orientation === "vertical";
    const tickEnd = isVertical
        ? viewportSize.height
        : viewportSize.width;

    const majorInterval = 100;
    const minorDivisions = 3;
    const subMinorDivisions = 4;

    const ticks: Tick[] = [];
    const range = Math.ceil(tickEnd / (majorInterval * zoom)) * 2 + 1;
    const half = Math.floor(range / 2);

    for (let i = -half; i <= half; i++) {
        const base = i * majorInterval;
        ticks.push({ pos: base, level: "major" });

        for (let j = 1; j < minorDivisions; j++)
            ticks.push({ pos: base + (j * majorInterval) / minorDivisions, level: "minor" });

        for (let j = 0; j < minorDivisions; j++)
            for (let k = 1; k < subMinorDivisions; k++)
                ticks.push({ pos: base + (j * majorInterval) / minorDivisions + (k * majorInterval) / (minorDivisions * subMinorDivisions), level: "sub" });
    }


    // Efficient finding of document overlap
    let min = Infinity;
    let max = -Infinity;

    for (const point of [
        rotatePoint(0, 0, rotation),
        rotatePoint(0, documentHeight, rotation),
        rotatePoint(documentWidth, 0, rotation),
        rotatePoint(documentWidth, documentHeight, rotation)
    ]) {
        const { x, y } = point;
        const val = isVertical ? y : x;
        if (val < min) min = val;
        if (val > max) max = val;
    }

    const offset = isVertical ? offsetY : offsetX;
    const visibleDocStart = (min * zoom) + offset;
    const visibleDocEnd = (max * zoom) + offset;
    const docLength = visibleDocEnd - visibleDocStart;

    const svgWidth = isVertical ? 20 : viewportSize.width;
    const svgHeight = isVertical ? viewportSize.height : 20;
    return (
        <div
            style={{ overflow: "hidden" }}
            className={className}
        >
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width={svgWidth}
                height={svgHeight}
                className="block flex-none"
            >
                <rect width="100%" height="100%" fill={colors.background} />
                <rect
                    x={isVertical ? 0 : visibleDocStart}
                    y={isVertical ? visibleDocStart : 0}
                    width={isVertical ? 20 : docLength}
                    height={isVertical ? docLength : 20}
                    fill={colors.overlap}
                />
                {ticks.map((tick, idx) => {
                    const { pos, level } = tick;
                    const visiblePos = isVertical ? pos * zoom + offsetY : pos * zoom + offsetX;

                    const length = Config.ruler[`${level}Length`];

                    return (
                        <g key={idx}>
                            <line
                                x1={isVertical ? 0 : visiblePos}
                                y1={isVertical ? visiblePos : 0}
                                x2={isVertical ? length : visiblePos}
                                y2={isVertical ? visiblePos : length}
                                stroke={colors.text}
                                strokeWidth="1"
                            />
                            {level === "major" && (
                                isVertical ? (
                                    <text
                                        x={12}
                                        y={visiblePos}
                                        fontSize="10"
                                        fill={colors.text}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(-90, 12, ${visiblePos})`}
                                    >
                                        {formatLabel(pos)}
                                    </text>
                                ) : (
                                    <text
                                        x={visiblePos}
                                        y={18}
                                        fontSize="10"
                                        fill={colors.text}
                                        textAnchor="middle"
                                    >
                                        {formatLabel(pos)}
                                    </text>
                                )
                            )}
                        </g>
                    );
                })}
            </svg >
        </div>
    );
};

export default Ruler;
