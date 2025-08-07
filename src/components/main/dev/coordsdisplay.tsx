import { useStatus } from "@/components/status-provider";
import { Separator } from "@/components/ui/separator";
import { CoordsBlock } from "@/components/main/helpers";

const CoordsDisplay = () => {
    const {
        viewportCursorCoords,
        relativeViewportCursorCoords,
    } = useStatus().viewport;

    const px = viewportCursorCoords ?? { x: null, y: null };
    const rel = relativeViewportCursorCoords ?? { x: null, y: null };

    return (
        <div className="flex flex-row gap-2 items-start">
            <Separator orientation="vertical" />
            <CoordsBlock x={rel.x} y={rel.y} label="Rel" />
            <Separator orientation="vertical" />
            <CoordsBlock x={px.x} y={px.y} label="T" />
            <Separator orientation="vertical" />
        </div>
    );
};

export default CoordsDisplay;
