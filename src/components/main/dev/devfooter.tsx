import { Separator } from "@/components/ui/separator"
import StatusDisplay from "@/components/main/dev/statusdisplay";
import KeyDisplay from "@/components/main/dev/keydisplay";
import CoordsDisplay from "@/components/main/dev/coordsdisplay";
import DimensionsDisplay from "@/components/main/dev/dimensionsdisplay";

const DevFooter = () => {
    return (
        <div className="w-full">
            <Separator />
            <div className="flex flex-row w-full justify-between items-center">
                <div className="flex flex-row items-center">
                    <KeyDisplay />
                </div>
                <div className="flex flex-row items-center text-xs">
                    TORDIE © Moae {new Date().getFullYear()}
                </div>
                <div className="flex flex-row items-center justify-between ">
                    <CoordsDisplay />
                    <DimensionsDisplay />
                    <StatusDisplay />
                </div>
            </div>
        </div>
    );
};

export default DevFooter;