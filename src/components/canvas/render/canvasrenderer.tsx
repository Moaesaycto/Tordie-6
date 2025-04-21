import { useStatus } from "@/components/status-provider";

const CanvasRenderer = () => {
    const { documentWidth, documentHeight, offsetX, offsetY, zoom, rotation } = useStatus().canvas;

    return (
        <div className="relative w-full h-full overflow-hidden bg-neutral-700">
            <div
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
