import { Button } from "@/components/ui/button";
import { Select, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { GeometryKind } from "@/domain/Geometry/Geometry";
import { getGeometryIcon } from "@/domain/Geometry/icons";
import { PlusIcon } from "lucide-react";


const REGISTERED_ITEMS = [
  {
    label: "Point",
    id: "point",
  },
  {
    label: "Line",
    id: "line",
  },
  {
    label: "Circle",
    id: "circle",
  },
  {
    label: "Parametric Curve",
    id: "parametric",
  },
]

const REGISTERED_GROUPS = [
  {
    label: "Group",
    id: "group",
  },
  {
    label: "Tessellation",
    id: "tessellation",
  },
  {
    label: "Imported SVG",
    id: "importedSvg",
  },
]

const itemStyle = "h-6 text-xs pl-2 rounded-none w-full";

const CreateItem = () => {
  return (
    <div>
      <span>
        Create new Item
      </span>
      <div className="flex gap-2 w-full">
        <div className="flex flex-1">
          <Select defaultValue="point">
            <SelectTrigger className="w-full !h-6 !py-0 text-xs [&_svg]:size-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-primary-foreground m-1 w-full">
              <SelectGroup className="w-full">
                <SelectLabel>Items</SelectLabel>
                {REGISTERED_ITEMS.map((e) => {
                  const { icon: Icon, color } = getGeometryIcon(e.id as GeometryKind);
                  return (
                    <SelectItem value={e.id} key={e.id} className={itemStyle}>
                      <Icon style={{ color }} />{e.label}
                    </SelectItem>
                  );
                })}
                <SelectLabel>Groups</SelectLabel>
                {REGISTERED_GROUPS.map((e) => {
                  const { icon: Icon, color } = getGeometryIcon(e.id as GeometryKind);
                  return (
                    <SelectItem value={e.id} key={e.id} className={itemStyle}>
                      <Icon style={{ color }} />{e.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button className="!h-6 !py-0 px-2">
          <PlusIcon className="size-3" />
        </Button>
      </div>
    </div>
  );
};

export default CreateItem;