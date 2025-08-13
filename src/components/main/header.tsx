import { HeaderMenubar } from "./menubar/menubar";
import Ribbon from "./ribbon/Ribbon";

const Header = () => {
  return (
    <header className="w-full border-b">
      <HeaderMenubar />
      <Ribbon />
    </header>
  )
}

export default Header;