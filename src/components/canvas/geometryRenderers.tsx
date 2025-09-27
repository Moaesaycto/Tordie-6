import { Line as KLine, Circle } from "react-konva";
import type { Geometry, GeometryData, PointData } from "@/domain/Geometry/Geometry";
import type { Id } from "@/lib/objects";
import { applySelection, selectedPointIds, selectOnly, state } from "@/components/canvas/CanvasState";
import { KonvaEventObject } from "konva/lib/Node";
import Config from "@/tordie.config.json";
import { pointSelectedViaLine } from "@/tools/modes/Selection";
import { setCursor } from "@/lib/utils";
import { flushSync } from "react-dom";
import { useSnapshot } from "valtio";

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
const _onMouseDown = (e: KonvaEventObject<MouseEvent>, g: Geometry) => {
  flushSync?.(() => applySelection([g.id], e.evt as MouseEvent));
  e.cancelBubble = true;
  e.target.getLayer()?.batchDraw();
}

type RendererProps = {
  g: Geometry,
  ctx: RenderCtx,
  style: GeometryStyle,
  zoom: number,
  selected: boolean,
}

export function renderLine({ g, ctx, style, zoom, selected }: RendererProps) {
  void zoom;
  const { p0, p1 } = (g.payload as any).data;
  const a = resolvePoint(ctx, p0);
  const b = resolvePoint(ctx, p1);

  return (
    <KLine
      key={g.id}
      name="selectable"
      points={[a.x, a.y, b.x, b.y]}
      stroke={selected ? style.selectedStroke : style.stroke}
      strokeWidth={selected ? style.selectedWidth : style.width}
      strokeScaleEnabled={false}
      hitStrokeWidth={style.baseHit}
      attrs={{ geomId: g.id }}
      draggable
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onDragStart={(e) => _onDragStart(e, g)}
      onDragEnd={_onDragEnd}
      onMouseDown={(e) => _onMouseDown(e, g)}
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

export function renderPoint({ g, ctx, style, zoom, selected }: RendererProps) {
  const { x, y } = (g.payload as any).data as PointData;
  const z = Math.max(Number.isFinite(zoom) ? zoom : 1, 0.01);
  const baseR = Number(selected ? style.selectedRadius : style.radius) || 6;
  const radius = baseR / z;

  return (
    <Circle
      key={g.id}
      name="selectable"
      x={x} y={y}
      radius={radius}
      draggable
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onDragStart={(e) => _onDragStart(e, g)}
      onDragEnd={_onDragEnd}
      onDragMove={(e) => ctx.onPointMove(g.id as Id, e.target.position())}
      hitStrokeWidth={style.baseHit}
      stroke={selected ? style.selectedStroke : style.stroke}
      strokeWidth={1}
      strokeScaleEnabled={false}
      fill={selected ? style.selectedStroke : style.stroke}
      attrs={{ geomId: g.id }}
    />
  );
}



export function GeometryNode({ g, ctx, style, zoom }: Omit<RendererProps, "selected">) {
  const snap = useSnapshot(state);
  const selected = snap.selection.has(g.id) || pointSelectedViaLine(g.id); // include line-linked

  const props = { g, ctx, style, zoom, selected };
  switch (g.payload.kind) {
    case "line": return renderLine(props);
    case "point": return renderPoint(props);
    default: return null;
  }
}