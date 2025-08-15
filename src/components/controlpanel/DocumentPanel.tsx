import { Separator } from "@/components/ui/separator";
import { useDocument } from "@/components/document-provider";
import { InputRow, PanelPage } from "./ControlPanel";
import { useState } from "react";
import { ColorPopover } from "@/components/main/ColorPopover";

const PRESETS = [
  "#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F9FAFB",
  "#EF4444", "#F59E0B", "#FBBF24", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#14B8A6", "#22D3EE", "#F97316"
];

const DocumentPanel = () => {
  const { title, setTitle } = useDocument();
  const [color, setColor] = useState("#ff0055");

  return (
    <PanelPage>
      <InputRow
        label="Title"
        onCommit={setTitle}
        defaultValue={title}
        title="This is the project title"
      />
      <Separator className="my-3" />
      <InputRow
        label="Background"
        value={color}
        onChange={setColor}
        onCommit={setColor}
        end={<div className="rounded-r-lg overflow-hidden">
          <ColorPopover value={color} onChange={setColor} presets={PRESETS} />
        </div>}
      />
    </PanelPage>
  );
};

export default DocumentPanel;
