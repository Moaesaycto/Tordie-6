import DevFooter from "./dev/devfooter";
import { useStatus } from "../status-provider";

const Footer = () => {
    const { devMode } = useStatus();
    return (
        <footer className="w-full">
            Footer
            {devMode && (<DevFooter />)}
        </footer>
    )
}

export default Footer;