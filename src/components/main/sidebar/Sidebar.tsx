// Sidebar.tsx
import SelectMode from "@/assets/buttons/select-mode.svg?react";
import { useAppState } from "@/components/state-provider";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import type { Mode } from "@/types/state";

const Sidebar = () => {
  return (
    <div className="flex flex-col items-center w-11 h-full px-1 py-2">
      <SelectModeButton />
      {/* Add more mode buttons here */}
    </div>
  );
};

type RibbonButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  mode: Mode;
};

const SidebarButton = ({ onClick, title, Icon, mode }: RibbonButtonProps) => {
  const { resolvedTheme } = useTheme();
  const { mode: currentMode } = useAppState().currentState;

  const base = "h-8 w-8 rounded-xs bg-primary-foreground hover:bg-secondary text-secondary-foreground border hover:shadow active:opacity-50";
  const active = resolvedTheme === "light" ? "bg-blue-200 hover:bg-blue-300" : "bg-blue-800 hover:bg-blue-900";

  return (
    <Button className={`${base} ${mode === currentMode ? active : ""}`} onClick={onClick} title={title}>
      <Icon className="text-foreground" />
    </Button>
  );
};

const SelectModeButton = () => {
  const { setCurrentState } = useAppState();

  const onClick = () => {
    setCurrentState((s) => ({ ...s, mode: "select" }));
  };

  return <SidebarButton title="Selector Tool" Icon={SelectMode} onClick={onClick} mode={"select"} />;
};

export default Sidebar;
