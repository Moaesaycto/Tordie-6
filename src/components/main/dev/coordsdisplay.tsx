import { useStatus } from "@/components/status-provider";
import { Separator } from "@/components/ui/separator";
import { CoordsBlock } from "@/components/main/helpers";
import { useSnapshot } from "valtio";
import { state } from "@/CanvasState";

const CoordsDisplay = () => {
  const { viewportCursorCoords } = useStatus().viewport;
  const snap = useSnapshot(state);

  const px = viewportCursorCoords ?? { x: null, y: null };
  const rel =
    viewportCursorCoords && snap.zoom !== 0
      ? {
          x: (viewportCursorCoords.x - snap.pan.x) / snap.zoom,
          y: (viewportCursorCoords.y - snap.pan.y) / snap.zoom,
        }
      : { x: null, y: null };

  return (
    <div className="flex flex-row gap-2 items-start">
      <Separator orientation="vertical" />
      <CoordsBlock x={rel.x} y={rel.y} label="Rel" />
      <Separator orientation="vertical" />
      <CoordsBlock x={px.x} y={px.y} label="T" />
      <Separator orientation="vertical" />
    </div>
  );
};

export default CoordsDisplay;
