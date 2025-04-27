import { useStatus } from "@/components/status-provider";
import { HomeIcon } from "lucide-react"
import Config from "@/tordie.config.json";

const ToOriginButton = () => {
    const { setOffsetX, setOffsetY, setZoom, setRotation } = useStatus().canvas
    const { defaultOffsetX, defaultOffsetY, defaultZoom, defaultRotation } = Config.canvas

    const onClick = () => {
        setOffsetX(defaultOffsetX);
        setOffsetY(defaultOffsetY);
        setZoom(defaultZoom);
        setRotation(defaultRotation);
    }

    return (
        <button
            className="p-[3px]"
            onClick={onClick}
        >
            <HomeIcon className="w-full h-full" />
        </button>
    )
}

export default ToOriginButton;