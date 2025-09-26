import { Line as KLine, Circle } from "react-konva";
import type { Geometry, GeometryData, PointData } from "@/domain/Geometry/Geometry";
import type { Id } from "@/lib/objects";
import { selectedPointIds, selectOnly, state } from "@/components/canvas/CanvasState";
import { KonvaEventObject } from "konva/lib/Node";
import Config from "@/tordie.config.json";
import { pointSelectedViaLine } from "@/tools/modes/Selection";
import { setCursor } from "@/lib/utils";

export type GeometryStyle = {
  stroke: string,
  selectedStroke: string,
  width: number,
  selectedWidth: number,
  radius: number,
  selectedRadius: number,
  baseHit: number,
}

export type RenderCtx = {
  getGeom: (id: Id) => Geometry | undefined;
  onPointMove: (id: Id, xy: PointData) => void;
};

const resolvePoint = (ctx: RenderCtx, ref: Id | PointData): PointData =>
  typeof ref === "string"
    ? ((ctx.getGeom(ref)?.payload as GeometryData & { kind: "point" })!.data)
    : ref;


// Global functions for each render
const _onMouseEnter = (e: KonvaEventObject<MouseEvent>) => { setCursor(e, "grab") }
const _onMouseLeave = (e: KonvaEventObject<MouseEvent>) => { setCursor(e, Config.viewport.cursor) }
const _onDragStart = (e: KonvaEventObject<MouseEvent>, g: Geometry) => {
  setCursor(e, "grabbing");
  if (state.selection.has(g.id)) {
    // Move all selection logic
  } else {
    selectOnly(g.id);
  }
}
const _onDragEnd = (e: KonvaEventObject<MouseEvent>) => { setCursor(e, "grab") }

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
      hitStrokeWidth={Math.max((style.baseHit * 0.2) / Math.max(zoom, 0.01), 1)}
      attrs={{ geomId: g.id }}
      draggable
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onDragStart={(e) => _onDragStart(e, g)}
      onDragEnd={_onDragEnd}
      onDragMove={(e) => {
        const stage = e.target.getStage();
        const scale = stage ? stage.scaleX() || 1 : 1;
        const dx = e.evt.movementX / scale;
        const dy = e.evt.movementY / scale;

        const pts = selectedPointIds();
        if (pts.size === 0) {
          // fallback: only the grabbed line's endpoints
          const { p0, p1 } = (ctx.getGeom(g.id)!.payload as any).data;
          if (typeof p0 === "string") pts.add(p0);
          if (typeof p1 === "string") pts.add(p1);
        }

        for (const pid of pts) {
          const P = (ctx.getGeom(pid)!.payload as any).data as PointData;
          ctx.onPointMove(pid, { x: P.x + dx, y: P.y + dy });
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
  const selected = state.selection.has(g.id) || pointSelectedViaLine(g.id);

  const z = Math.max(Number.isFinite(zoom) ? zoom : 1, 0.01);
  const baseR = Number(selected ? style.selectedRadius : style.radius) || 6; // from config
  const radius = baseR / z; // screen-fixed size
  const hit = Math.max((baseR * 3) / z, 6); // comfy hit area

  return (
    <Circle
      key={g.id}
      name="selectable"
      x={x}
      y={y}
      radius={radius}
      draggable
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onDragStart={(e) => _onDragStart(e, g)}
      onDragEnd={_onDragEnd}
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
