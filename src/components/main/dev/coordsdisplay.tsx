import { useStatus } from "@/components/status-provider";
import { Separator } from "@/components/ui/separator";
import { formatRounded } from "@/lib/format";

const CoordsBlock = ({
    x,
    y,
    unit = "px",
    label = "",
}: {
    x: number | null;
    y: number | null;
    unit?: string;
    label?: string;
}) => {
    const format = (val: number | null) => (val !== null ? formatRounded(val) : "---.---");

    return (
        <div className="text-xs min-w-[100px]">
            {["x", "y"].map((axis) => (
                <div key={axis} className="flex justify-between">
                    <span className="text-muted-foreground">{label}{axis}:</span>
                    <span>
                        <span>{format(axis === "x" ? x : y)}</span>
                        <span className="text-muted-foreground">{unit}</span>
                    </span>
                </div>
            ))}
        </div>
    );
};

const CoordsDisplay = () => {
    const { cursor } = useStatus().canvas;
    const px = cursor.viewportCursorCoords ?? { x: null, y: null };
    const rel = cursor.relativeViewportCursorCoords ?? { x: null, y: null };

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
