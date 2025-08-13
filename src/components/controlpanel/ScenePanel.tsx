import { useMemo } from "react";
import { PanelPage } from "./ControlPanel";
import { useScene } from "@/components/scene-provider";
import SceneListTable from "./scene/SceneListTable";
import { SceneItemLabel } from "@/types/scene";

const ScenePanel = () => {
  const scene = useScene();

  const items: SceneItemLabel[] = useMemo(() => {
    try { return scene.displayList() as SceneItemLabel[]; } catch { return []; }
  }, [scene]);

  return (
    <PanelPage>
      <div className="overflow-visible min-w-0">
        <SceneListTable items={items} />
      </div>
    </PanelPage>
  );
};

export default ScenePanel;
