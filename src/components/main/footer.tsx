import DevFooter from "./dev/devfooter";
import { useStatus } from "../status-provider";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
    const { devMode } = useStatus();
    return (
        <footer className="w-full">
            <Separator />
            <div>
                {devMode && (<DevFooter />)}
            </div>
        </footer>
    )
}

export default Footer;