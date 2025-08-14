import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getGeometryIcon } from "@/domain/Geometry/icons";
import { InfoIcon } from "lucide-react";
import type { DiagramItemLabel } from "@/types/diagram";

export default function EditItem({ item, onChange }: { item: DiagramItemLabel; onChange?: (patch: Partial<DiagramItemLabel>) => void }) {
  const { icon: Icon, color, label } = getGeometryIcon(item.type);
  const nameId = `name-${item.id}`;

  const [name, setName] = useState(item.name);
  useEffect(() => {
    setName(item.name);
  }, [item.id, item.name]);

  const commitName = useCallback(() => {
    if (name !== item.name) onChange?.({ name });
  }, [name, item.name, onChange]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs">Item Inspector</span>
      </div>
      <div className="flex h-6 w-full overflow-hidden text-xs">
        <div
          className="flex items-center justify-center w-6 bg-accent border-1"
          title={`Item Type: ${label}`}
        >
          <Icon color={color} className="h-4 w-4" />
        </div>
        <Input
          id={nameId}
          className="flex-1 h-full border-1 rounded-none focus-visible:ring-0 focus:outline-none px-2 text-xs sm:text-xs md:text-xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <button
          type="button"
          title={`ID: ${item.id}`}
          aria-label={`Item ID ${item.id}`}
          className="p-1"
        >
          <InfoIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}