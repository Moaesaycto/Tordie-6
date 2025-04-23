import { useStatus } from "@/components/status-provider";
import { Vector2 } from "@/types";
import { useRef } from "react";


const CanvasRenderer = () => {
    const { documentWidth, documentHeight, offsetX, offsetY, zoom, rotation, cursor } = useStatus().canvas;

    const lastCoordsRef = useRef<Vector2 | null>(null);
    const ticking = useRef(false);

    const viewportRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (ticking.current) return;
        ticking.current = true;

        requestAnimationFrame(() => {
            const rect = viewportRef.current?.getBoundingClientRect();
            if (!rect) return;

            const newCoords = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            const currentCoords = lastCoordsRef.current;

            if (!currentCoords || newCoords.x !== currentCoords.x || newCoords.y !== currentCoords.y) {
                lastCoordsRef.current = newCoords;
                cursor.setViewportCursorCoords(newCoords);
            }

            ticking.current = false;
        });
    };


    const handleMouseLeave = () => {
        cursor.setViewportCursorCoords(null);
    };

    return (
        <div
            ref={viewportRef}
            id="canvasViewport"
            className="relative w-full h-full overflow-hidden bg-neutral-700"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                id="canvasPage"
                className="absolute bg-white"
                style={{
                    width: `${documentWidth}px`,
                    height: `${documentHeight}px`,
                    transform: `
                        translate(${offsetX}px, ${offsetY}px)
                        scale(${zoom})
                        rotate(${rotation}deg)
                    `,
                    transformOrigin: "top left",
                }}
            />
        </div>
    );
};

export default CanvasRenderer;
