import SelectMode from "@/assets/buttons/select-mode.svg?react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Sidebar = () => {
  return (
    <div className="flex flex-col items-center w-11 h-full px-1 py-2">
      <SelectModeButton />
    </div>
  )
}

type RibbonButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
};

const SidebarButton = ({ onClick, title, Icon, active }: RibbonButtonProps) => {
  const { resolvedTheme } = useTheme();

  const style = "h-8 w-8 rounded-xs bg-primary-foreground hover:bg-secondary text-secondary-foreground border hover:shadow active:opacity-50"
  
  const activeColor = resolvedTheme === "light" ? "bg-blue-200 hover:bg-blue-300" : "bg-blue-800 hover:bg-blue-900"

  return (
    <Button
      className={`${style} ${active ? activeColor : ""}`}
      onClick={onClick}
      title={title}
    >
      <Icon className="text-foreground" />
    </Button>
  );

}
const SelectModeButton = () => {
  const [toggle, setToggle] = useState<boolean>(false);

  const onClick = () => {
    setToggle(!toggle);
  }

  return (
    <SidebarButton
      title="Selector Tool"
      Icon={SelectMode}
      onClick={onClick}
      active={toggle}
    />
  );
}

export default Sidebar;