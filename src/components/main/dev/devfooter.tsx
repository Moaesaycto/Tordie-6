import { Separator } from "@/components/ui/separator"
import StatusDisplay from "@/components/main/dev/statusdisplay";
import KeyDisplay from "@/components/main/dev/keydisplay";
import CoordsDisplay from "@/components/main/dev/coordsdisplay";

const DevFooter = () => {
    return (
        <div className="w-full">
            <Separator />
            <div className="flex flex-row w-full justify-between">
                <KeyDisplay />
                <div className="flex flex-row">
                    <CoordsDisplay />
                    <StatusDisplay />
                </div>
            </div>
        </div>
    )
}

export default DevFooter;