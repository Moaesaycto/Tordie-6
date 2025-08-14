import { useCallback, useMemo, useState } from "react";
import { PanelPage } from "./ControlPanel";
import { useScene } from "@/components/scene-provider";
import SceneListTable from "./scene/SceneListTable";
import { SceneItemLabel } from "@/types/scene";
import CreateItem from "./scene/CreateItem";
import EditItem from "./scene/EditItem";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const ScenePanel = () => {
  const scene = useScene();

  const items: SceneItemLabel[] = useMemo(() => {
    try { return scene.displayList() as SceneItemLabel[]; } catch { return []; }
  }, [scene]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = useMemo(
    () => items.find(i => i.id === selectedId) ?? null,
    [items, selectedId]
  );

  const handleEditChange = useCallback((patch: Partial<SceneItemLabel>) => {
    if (!selectedItem) return;
    if (patch.name !== undefined) {
      // e.g. scene.updateItem / scene.rename / scene.setLabel — use your real method
      scene.updateItem(selectedItem.id, { name: patch.name });
    }
  }, [scene, selectedItem]);

  return (
    <PanelPage>
      <div className="h-full min-h-0 rounded">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={20} minSize={20} className="flex flex-col min-h-0">
            <SceneListTable
              items={items}
              selectedId={selectedId}
              onSelect={(item) => setSelectedId(item?.id ?? null)}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={20} minSize={20} className="flex flex-col min-h-0">
            <div className="p-2">
              {selectedItem === null
                ? <CreateItem />
                : <EditItem item={selectedItem} onChange={handleEditChange} />}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={60} minSize={20} className="flex flex-col min-h-0">
            Third panel?
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PanelPage>
  );
};


export default ScenePanel;
