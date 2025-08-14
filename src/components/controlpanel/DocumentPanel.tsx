import { Separator } from "@/components/ui/separator";
import { useDocument } from "@/components/document-provider";
import { InputRow, PanelPage } from "./ControlPanel";

const DocumentPanel = () => {
  const { title, setTitle } = useDocument();

  return (
    <PanelPage>
      <InputRow
        label="Title"
        onCommit={setTitle}
        defaultValue={title}
        title="This is the project title"
      />
      <Separator />
    </PanelPage>
  );
};

export default DocumentPanel;
