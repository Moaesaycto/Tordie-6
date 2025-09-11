import { Line as KLine, Circle } from "react-konva";
import type { Geometry, GeometryData, PointData } from "@/domain/Geometry/Geometry";
import type { Id } from "@/lib/objects";
import { state } from "@/components/canvas/CanvasState";

export type GeometryStyle = {
  stroke: string,
  selectedStroke: string,
  width: number,
  selectedWidth: number,
  radius: number,
  selectedRadius: number,
  baseHit: number,
}

const setCursor = (e: any, v: string) => {
  const el = e?.target?.getStage()?.container();
  if (el) el.style.cursor = v;
};

export type RenderCtx = {
  getGeom: (id: Id) => Geometry | undefined;
  onPointMove: (id: Id, xy: PointData) => void;
};

const resolvePoint = (ctx: RenderCtx, ref: Id | PointData): PointData =>
  typeof ref === "string"
    ? ((ctx.getGeom(ref)?.payload as GeometryData & { kind: "point" })!.data)
    : ref;

const pointSelectedViaLine = (ctx: RenderCtx, pointId: Id) => {
  void ctx;
  for (const g of state.diagram.geoms.values()) {
    if (g.payload.kind !== "line") continue;
    const { p0, p1 } = g.payload.data as { p0: Id; p1: Id };
    if (state.selection.has(g.id) && (p0 === pointId || p1 === pointId)) return true;
  }
  return false;
};

export function renderLine(
  g: Geometry,
  ctx: RenderCtx,
  style: GeometryStyle,
  zoom: number
) {
  const { p0, p1 } = (g.payload as any).data;
  const a = resolvePoint(ctx, p0);
  const b = resolvePoint(ctx, p1);

  const selected = state.selection.has(g.id);

  return (
    <KLine
      key={g.id}
      name="selectable"
      points={[a.x, a.y, b.x, b.y]}
      stroke={selected ? style.selectedStroke : style.stroke}
      strokeWidth={selected ? style.selectedWidth : style.width}
      strokeScaleEnabled={false}
      hitStrokeWidth={Math.max(style.baseHit / Math.max(zoom, 0.01), 1)}
      attrs={{ geomId: g.id }}
      draggable
      onMouseEnter={(e) => setCursor(e, "grab")}
      onMouseLeave={(e) => setCursor(e, "default")}
      onDragStart={(e) => setCursor(e, "grabbing")}
      onDragEnd={(e) => setCursor(e, "grab")}
      onDragMove={(e) => {
        const stage = e.target.getStage();
        const scale = stage ? stage.scaleX() || 1 : 1;     // zoom
        const dx = e.evt.movementX / scale;
        const dy = e.evt.movementY / scale;

        const line = ctx.getGeom(g.id)!;
        const { p0, p1 } = (line.payload as any).data;
        if (typeof p0 === "string" && typeof p1 === "string") {
          const P0 = (ctx.getGeom(p0)!.payload as any).data as PointData;
          const P1 = (ctx.getGeom(p1)!.payload as any).data as PointData;
          ctx.onPointMove(p0, { x: P0.x + dx, y: P0.y + dy });
          ctx.onPointMove(p1, { x: P1.x + dx, y: P1.y + dy });
        }

        e.target.position({ x: 0, y: 0 }); // keep node anchored
      }
      }
    />
  );
}

export function renderPoint(
  g: Geometry,
  ctx: RenderCtx,
  style: GeometryStyle,
  zoom: number
) {
  const { x, y } = (g.payload as any).data as PointData;
  const selected = state.selection.has(g.id) || pointSelectedViaLine(ctx, g.id);

  const z = Math.max(Number.isFinite(zoom) ? zoom : 1, 0.01);
  const baseR = Number(selected ? style.selectedRadius : style.radius) || 6; // from config
  const radius = baseR / z;                             // screen-fixed size
  const hit = Math.max((baseR * 3) / z, 6);             // comfy hit area

  return (
    <Circle
      key={g.id}
      name="selectable"
      x={x}
      y={y}
      radius={radius}
      draggable
      onMouseEnter={(e) => setCursor(e, "pointer")}  // or "move" if you prefer
      onMouseLeave={(e) => setCursor(e, "default")}
      onDragStart={(e) => setCursor(e, "grabbing")}
      onDragEnd={(e) => setCursor(e, "pointer")}
      onDragMove={(e) => ctx.onPointMove(g.id as Id, e.target.position())}
      hitStrokeWidth={hit}
      stroke={selected ? style.selectedStroke : style.stroke}
      strokeWidth={1}
      strokeScaleEnabled={false} // 1px stroke stays 1px
      fill={selected ? style.selectedStroke : style.stroke}
      attrs={{ geomId: g.id }}
    />
  );
}


// Optional registry if you want a single entry point
export function renderGeometry(
  g: Geometry,
  ctx: RenderCtx,
  style: GeometryStyle,
  zoom: number
) {
  switch ((g.payload as any).kind) {
    case "line": return renderLine(g, ctx, style, zoom);
    case "point": return renderPoint(g, ctx, style, zoom);
    default: return null;
  }
}
