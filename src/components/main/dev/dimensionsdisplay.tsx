import { useStatus } from "@/components/status-provider";
import { Separator } from "@/components/ui/separator";
import { CoordsBlock } from "@/components/main/helpers";

const DimensionsDisplay = () => {
    const { viewportWidth, viewportHeight } = useStatus().viewport;

    return (
        <div className="flex flex-row gap-2 items-start">
            <Separator orientation="vertical" />
            <CoordsBlock x={viewportWidth} y={viewportHeight} label="VP_" icons={["W", "H"]}/>
            <Separator orientation="vertical" />
        </div>
    );
};

export default DimensionsDisplay;
