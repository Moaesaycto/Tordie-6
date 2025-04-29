import { useRef } from "react";
import { useCanvasViewportControls } from "@/components/canvas/hooks/viewportcontrols";
import { useStatus } from "@/components/status-provider";

const CanvasRenderer = () => {
    const { documentWidth, documentHeight, offsetX, offsetY, zoom, rotation } = useStatus().canvas;
    const viewportRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null); // NEW: page ref

    useCanvasViewportControls(viewportRef, pageRef);

    return (
        <div
            ref={viewportRef}
            id="canvasViewport"
            className="relative w-full h-full overflow-hidden bg-neutral-700"
        >
            <div
                ref={pageRef} // Attach pageRef here
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
