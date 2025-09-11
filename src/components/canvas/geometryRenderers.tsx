import { Line as KLine, Circle } from "react-konva";
import type { Geometry, GeometryData, PointData } from "@/domain/Geometry/Geometry";
import type { Id } from "@/lib/objects";
import { state } from "@/components/canvas/CanvasState";

const BASE_R = 6;     // px on screen
const BASE_HIT = 20;  // px on screen

export type RenderCtx = {
  getGeom: (id: Id) => Geometry | undefined;
  onPointMove: (id: Id, xy: PointData) => void;
};

const resolvePoint = (ctx: RenderCtx, ref: Id | PointData): PointData =>
  typeof ref === "string"
    ? ((ctx.getGeom(ref)?.payload as GeometryData & { kind: "point" })!.data)
    : ref;

export const renderGeometry = (g: Geometry, ctx: RenderCtx, stroke: string, zoom: number) => {
  const { kind, data } = g.payload as any;
  switch (kind) {
    case "point": {
      const { x, y } = data as PointData;
      const radius = Math.max(BASE_R / zoom, 1);           // avoid 0/NaN
      const hit = zoom > 0 ? BASE_HIT / zoom : "auto";     // keep hit area usable

      return (
        <Circle
          key={g.id}
          name="selectable"
          x={x}
          y={y}
          radius={radius}
          draggable
          hitStrokeWidth={hit}
          stroke={stroke}
          strokeWidth={1}
          strokeScaleEnabled={false}
          fill="white"
          onDragMove={(e) => ctx.onPointMove(g.id as Id, e.target.position())}
          attrs={{ geomId: g.id }}
        />
      );
    }

    case "line": {
      const { p0, p1 } = data;
      const a = resolvePoint(ctx, p0);
      const b = resolvePoint(ctx, p1);
      return (
        <KLine
          key={g.id}
          name="selectable"
          points={[a.x, a.y, b.x, b.y]}
          stroke={state.selection.has(g.id) ? "blue" : stroke} // ← highlight if selected
          strokeWidth={2}
          strokeScaleEnabled={false}
          hitStrokeWidth={BASE_HIT / zoom}
          attrs={{ geomId: g.id }}
        />
      );
    }
    default:
      return null;
  }
};
