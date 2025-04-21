type RulerProps = {
    start: number,
    end: number,
    orientation?: "vertical" | "horizontal"
    minorTicks?: number,
    minorSteps?: number,
    subMinorTicks?: number,
    className?: string,
};

const Ruler = ({
    start,
    end,
    orientation = "vertical",
    minorTicks = 10,
    minorSteps = 2,
    subMinorTicks = 5,
    className = "",
}: RulerProps) => {
    const isVertical = orientation === "vertical";

    // Total length in pixels of the ruler
    const length = end - start;

    const viewBox = isVertical
        ? `0 0 100 ${length}`
        : `0 0 ${length} 100`;

    return (
        <div className={`w-full h-full border border-red-500 ${className ?? ""}`}>

        </div>
    );
};

export default Ruler;
