import { Line as KLine, Circle } from "react-konva";
import type { Geometry, GeometryData, PointData } from "@/domain/Geometry/Geometry";
import type { Id } from "@/lib/objects";
import { state } from "@/components/canvas/CanvasState";

const BASE_R = 6;
const BASE_HIT = 20;

export type RenderCtx = {
  getGeom: (id: Id) => Geometry | undefined;
  onPointMove: (id: Id, xy: PointData) => void;
};

const resolvePoint = (ctx: RenderCtx, ref: Id | PointData): PointData =>
  typeof ref === "string"
    ? ((ctx.getGeom(ref)?.payload as GeometryData & { kind: "point" })!.data)
    : ref;

const isPointSelectedByLine = (ctx: RenderCtx, pointId: Id): boolean => {
  for (const g of state.diagram.geoms.values()) {
    if (g.payload.kind !== "line") continue;
    const { p0, p1 } = g.payload.data as { p0: Id; p1: Id };
    if (state.selection.has(g.id) && (p0 === pointId || p1 === pointId)) {
      return true;
    }
  }
  return false;
};

export const renderGeometry = (
  g: Geometry,
  ctx: RenderCtx,
  stroke: string,
  zoom: number
) => {
  const { kind, data } = g.payload as any;
  switch (kind) {
    case "point": {
      const { x, y } = data as PointData;
      const selected = state.selection.has(g.id) || isPointSelectedByLine(ctx, g.id);
      const radius = selected ? Math.max((BASE_R * 1.5) / zoom, 2) : Math.max(BASE_R / zoom, 1);

      return (
        <Circle
          key={g.id}
          name="selectable"
          x={x}
          y={y}
          radius={radius}
          draggable
          hitStrokeWidth={BASE_HIT / zoom}
          stroke={selected ? "blue" : stroke}
          strokeWidth={1}
          strokeScaleEnabled={false}
          fill={selected ? "blue" : "white"}
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
          stroke={state.selection.has(g.id) ? "blue" : stroke}
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
