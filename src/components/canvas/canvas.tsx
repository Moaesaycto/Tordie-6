import Ruler from "@/components/canvas/guide/ruler";
import CanvasRenderer from "@/components/canvas/render/canvasrenderer";

const RULER_SIZE = 20;

const Canvas = () => {
    return (
        <div className="h-full w-full" id="main-canvas">
            <div className="bg-muted h-full flex items-center justify-center">
                <div
                    className="grid h-full w-full"
                    style={{
                        gridTemplateColumns: `${RULER_SIZE}px 1fr`,
                        gridTemplateRows: `${RULER_SIZE}px 1fr`,
                    }}
                >
                    <div className="bg-neutral-500 border-3 border-neutral-600" />
                    <Ruler orientation="horizontal" />

                    <Ruler
                        orientation="vertical"
                    />
                    <CanvasRenderer />
                </div>
            </div>
        </div>
    );
};

export default Canvas;
