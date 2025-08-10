import DevFooter from "./dev/devfooter";
import { useApp } from "@/components/app-provider";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
    const { devMode } = useApp();
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