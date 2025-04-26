import { formatRounded } from "@/lib/format";

export const CoordsBlock = ({
    x,
    y,
    unit = "px",
    label = "",
    icons = ["x", "y"],
}: {
    x: number | null;
    y: number | null;
    unit?: string;
    label?: string;
    icons?: string[];
}) => {
    const format = (val: number | null) => (val !== null ? formatRounded(val) : "---.---");

    return (
        <div className="text-xs min-w-[100px]">
            {icons.map((axis) => (
                <div key={axis} className="flex justify-between">
                    <span className="text-muted-foreground">{label}{axis}:</span>
                    <span>
                        <span>{format(axis === icons[0] ? x : y)}</span>
                        <span className="text-muted-foreground">{unit}</span>
                    </span>
                </div>
            ))}
        </div>
    );
};
