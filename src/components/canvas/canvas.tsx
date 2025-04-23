import Ruler from "@/components/canvas/guide/ruler";
import CanvasRenderer from "@/components/canvas/render/canvasrenderer";
import OffsetScale from "./scales/offsetscale";

const RULER_SIZE = 20;
const SCROLL_SIZE = 17;

const Canvas = () => {
    const corner = <div className="bg-neutral-500 border-3 border-neutral-600" />

    return (
        <div className="h-full w-full" id="main-canvas">
            <div className="bg-muted h-full flex items-center justify-center">
                <div
                    className="grid h-full w-full"
                    style={{
                        gridTemplateColumns: `${RULER_SIZE}px 1fr ${SCROLL_SIZE}px`,
                        gridTemplateRows: `${RULER_SIZE}px 1fr ${SCROLL_SIZE}px`,
                    }}
                >
                    {/* Top-left corner */}
                    {corner}

                    {/* Top ruler */}
                    <Ruler orientation="horizontal" />

                    {/* Top-right corner */}
                    {corner}

                    {/* Left ruler */}
                    <Ruler orientation="vertical" />

                    {/* Main canvas */}
                    <CanvasRenderer />

                    {/* Right ruler */}
                    <OffsetScale />

                    {/* Bottom-left corner */}
                    {corner}

                    {/* Bottom ruler */}
                    <OffsetScale orientation="horizontal" />

                    {/* Bottom-right corner */}
                    {corner}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
