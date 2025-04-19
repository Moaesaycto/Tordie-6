import { Separator } from "@/components/ui/separator"
import StatusDisplay from "./statusdisplay";
import KeyDisplay from "./keydisplay";

const DevFooter = () => {
    return (
        <div className="w-full">
            <Separator />
            <div className="flex flex-row w-full justify-between">
                <KeyDisplay />

                <StatusDisplay />
            </div>
        </div>
    )
}

export default DevFooter;