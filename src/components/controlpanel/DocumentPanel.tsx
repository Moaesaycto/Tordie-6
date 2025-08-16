import { Separator } from "@/components/ui/separator";
import { useDocument } from "@/components/document-provider";
import { InputRow, PanelPage } from "./ControlPanel";
import { ColorPopover } from "@/components/main/ColorPopover";

const DocumentPanel = () => {
  const {
    title,
    setTitle,
    backgroundColor,
    setBackgroundColor,
    backgroundLocked,
    setBackgroundLocked,
  } = useDocument();

  return (
    <PanelPage>
      <InputRow
        label="Title"
        onCommit={setTitle}
        defaultValue={title}
        title="This is the project title"
      />
      <Separator />
      <InputRow
        label="Background"
        value={backgroundColor}
        onChange={setBackgroundColor}
        onCommit={setBackgroundColor}
        end={
          <div className="rounded-r-lg overflow-visible relative">
            <ColorPopover
              value={backgroundColor}
              onChange={setBackgroundColor}
              presets={["#F9FAFB", "#161719"]}
              locked={backgroundLocked}
              onToggleLock={() => setBackgroundLocked(v => !v)}
            />
          </div>
        }
      />
    </PanelPage>
  );
};

export default DocumentPanel;
