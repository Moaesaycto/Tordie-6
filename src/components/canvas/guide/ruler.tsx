import { useEffect, useState } from "react";
import { useStatus } from "@/components/status-provider";
import { formatLabel } from "@/lib/format";

type RulerProps = {
    start: number,
    end: number,
    orientation?: "vertical" | "horizontal",
    className?: string,
};

const Ruler = ({
    orientation = "horizontal",
    className = ""
}: RulerProps) => {
    const { offsetX, offsetY } = useStatus().canvas;
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

    const tickInterval = 100;
    const ticks = Array.from(
        { length: Math.ceil(tickEnd / tickInterval) * 2 + 1 },
        (_, i) => (i - Math.ceil(tickEnd / tickInterval)) * tickInterval
    );

    return (
        <svg
            viewBox={isVertical
                ? `0 0 20 ${tickEnd}`
                : `0 0 ${tickEnd} 20`}
            className={className}
            width={isVertical ? "20" : "100%"}
            height={isVertical ? "100%" : "20"}
        >
            {ticks.map((pos, idx) => {
                const visiblePos = isVertical ? pos + offsetY : pos + offsetX;
                const label = formatLabel(pos);
                return (
                    <g key={idx}>
                        <line
                            key={idx}
                            x1={isVertical ? 0 : visiblePos}
                            y1={isVertical ? visiblePos : 0}
                            x2={isVertical ? 10 : visiblePos}
                            y2={isVertical ? visiblePos : 10}
                            stroke="white"
                            strokeWidth="1"
                        />
                        {isVertical ? (
                            <text
                                x={12}
                                y={visiblePos}
                                fontSize="10"
                                fill="white"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(-90, 12, ${visiblePos})`}
                            >
                                {label}
                            </text>
                        ) : (
                            <text
                                x={visiblePos}
                                y={18}
                                fontSize="10"
                                fill="white"
                                textAnchor="middle"
                            >
                                {label}
                            </text>
                        )}
                    </g>

                );
            })}

        </svg >
    );
};

export default Ruler;
