import { Separator } from "@/components/ui/separator";
import { useDocument } from "@/components/document-provider";
import { InputRow, PanelPage } from "./ControlPanel";
import { ColorPopover } from "@/components/main/ColorPopover";
import Config from "@/tordie.config.json";
import { Button } from "@/components/ui/button";
import { useSave } from "@/services/save";
import { useLoad } from "@/services/load";

const DocumentPanel = () => {
  const {
    title,
    setTitle,
    backgroundColor,
    setBackgroundColor,
    backgroundLocked,
    setBackgroundLocked,
  } = useDocument();

  const { save, saveAs } = useSave();
  const { load } = useLoad();

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
              presets={[
                Config.document.default_light_background,
                Config.document.default_dark_background,
              ]}
              locked={backgroundLocked}
              onToggleLock={() => setBackgroundLocked(v => !v)}
            />
          </div>
        }
      />
      <Button onClick={save}>Save</Button>
      <Button onClick={saveAs}>Save As</Button>
      <Button onClick={load}>Open…</Button>
    </PanelPage>
  );
};

export default DocumentPanel;
