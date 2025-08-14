import { useCallback, useMemo, useState } from "react";
import { PanelPage } from "./ControlPanel";
import { useDiagram } from "@/components/diagram-provider";
import DiagramListTable from "./diagram/DiagramListTable";
import { DiagramItemLabel } from "@/types/diagram";
import CreateItem from "./diagram/CreateItem";
import EditItem from "./diagram/EditItem";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const ScenePanel = () => {
  const scene = useDiagram();

  const items: DiagramItemLabel[] = useMemo(() => {
    try { return scene.displayList() as DiagramItemLabel[]; } catch { return []; }
  }, [scene]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = useMemo(
    () => items.find(i => i.id === selectedId) ?? null,
    [items, selectedId]
  );

  const handleEditChange = useCallback((patch: Partial<DiagramItemLabel>) => {
    if (!selectedItem) return;
    if (patch.name !== undefined) {
      scene.updateItem(selectedItem.id, { name: patch.name });
    }
  }, [scene, selectedItem]);

  return (
    <PanelPage>
      <div className="h-full min-h-0 rounded">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={20} minSize={20} className="flex flex-col min-h-0">
            <DiagramListTable
              items={items}
              selectedId={selectedId}
              onSelect={(item) => setSelectedId(item?.id ?? null)}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={20} minSize={10} className="flex flex-col min-h-0">
            <div className="p-2 h-full">
              {selectedItem === null
                ? <CreateItem />
                : <EditItem item={selectedItem} onChange={handleEditChange} />}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={20} className="flex flex-col min-h-0">
            Third panel?
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PanelPage>
  );
};


export default ScenePanel;
