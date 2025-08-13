import { Button } from "@/components/ui/button";
import SelectAllIcon from "@/assets/buttons/select-all.svg?react";

const Ribbon = () => (
  <div className="flex flex-row gap-2 items-center w-full p-1 h-12">
    <SelectAllButton />
  </div>
);

type RibbonButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const RibbonButton = ({ onClick, title, Icon }: RibbonButtonProps) => (
  <Button
    className="h-8 w-8 rounded-xs bg-primary-foreground hover:bg-secondary text-secondary-foreground border hover:shadow active:opacity-50"
    onClick={onClick}
    title={title}
  >
    <Icon className="text-foreground" />
  </Button>
);

const SelectAllButton = () => {
  const onClick = () => {
    console.log("Select all...");
  }

  return (
    <RibbonButton
      title="Select All"
      Icon={SelectAllIcon}
      onClick={onClick}
    />
  );
}

export default Ribbon;
