import { useRef, useEffect, useCallback, useState } from 'react';
import { useSnapshot } from 'valtio';
import { Stage, Layer, Circle, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { seedDiagramIfEmpty, state } from '@/components/canvas/CanvasState';
import { useApp } from '@/components/app-provider';
import { useViewportControls } from '@/components/hooks/viewport/useViewportControls';
import { useDocument } from '@/components/document-provider';
import { readableTextColour } from '@/lib/color';
import { Line as KLine } from 'react-konva';
import type { Geometry, GeometryData, PointData } from '@/domain/Geometry/Geometry';
import type { Id } from '@/lib/objects';
import { updatePoint } from '@/components/canvas/CanvasState';


const resolvePoint = (getGeom: (id: Id) => Geometry | undefined, ref: Id | PointData): PointData =>
  typeof ref === "string"
    ? ((getGeom(ref)?.payload as GeometryData & { kind: "point" })?.data ?? { x: 0, y: 0 })
    : ref;

function DiagramLayer() {
  const dSnap = useSnapshot(state.diagram);
  const geoms = Array.from(dSnap.geoms.values());
  const points = geoms.filter(g => g.payload.kind === "point");
  const lines = geoms.filter(g => g.payload.kind === "line");

  return (
    <>
      {lines.map(L => {
        const { p0, p1 } = (L.payload as any).data;
        const a = resolvePoint(id => dSnap.geoms.get(id), p0);
        const b = resolvePoint(id => dSnap.geoms.get(id), p1);
        return <KLine key={L.id} name="selectable" points={[a.x, a.y, b.x, b.y]} stroke="black" strokeWidth={2} />;
      })}
      {points.map(P => {
        const { x, y } = (P.payload as any).data as PointData;
        return (
          <Circle
            key={P.id}
            name="selectable"
            x={x}
            y={y}
            radius={6}
            draggable
            hitStrokeWidth={20}
            stroke="black"
            fill="white"
            onDragMove={(e) => updatePoint(P.id as Id, e.target.position())}
          />
        );
      })}
    </>
  );
}

export default function Viewport() {
  useEffect(() => {
    seedDiagramIfEmpty();
  }, []);
  const snap = useSnapshot(state);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const { backgroundColor } = useDocument();
  const [selectBorderColor, setSelectBorderColor] = useState<string>("#ffffff");

  useEffect(() => {
    setSelectBorderColor(readableTextColour(backgroundColor));
  })

  const { setStage, tools: { layerRef, selRef, trRef } } = useDocument();

  const {
    viewport: { setViewportCursorCoords, setViewportWidth, setViewportHeight },
  } = useApp();

  const handleStageRef = useCallback((node: Konva.Stage | null) => {
    stageRef.current = node ?? null;
    setStage(node);
  }, [setStage]);

  useEffect(() => {
    if (stageRef.current) setStage(stageRef.current);
  }, [setStage]);

  useViewportControls(stageRef, setViewportCursorCoords);

  useEffect(() => {
    const resize = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const { width, height } = wrapper.getBoundingClientRect();
      setViewportWidth(width);
      setViewportHeight(height);
      state.viewport.width = width;
      state.viewport.height = height;
    };
    const observer = new ResizeObserver(resize);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    resize();
    return () => observer.disconnect();
  }, [setViewportWidth, setViewportHeight]);

  return (
    <div ref={wrapperRef} className="flex flex-col min-w-0 min-h-0 w-full h-full">
      <Stage
        ref={handleStageRef}
        width={snap.viewport.width}
        height={snap.viewport.height}
        scaleX={snap.zoom}
        scaleY={snap.zoom}
        x={snap.pan.x}
        y={snap.pan.y}
        style={{
          background: backgroundColor,
          touchAction: 'none',
          cursor: snap.middlePanning ? 'grabbing' : 'default',
          display: 'block',
        }}
      >
        <Layer ref={layerRef}>
          {/* Debug circle (might make it into a cursor-type thing like Blender) */}
          <Circle
            name="selectable"
            x={snap.circle.x}
            y={snap.circle.y}
            radius={20}
            fill="tomato"
            draggable
            onDragMove={(e) => {
              state.circle.x = e.target.x();
              state.circle.y = e.target.y();
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              const container = stage && stage.container();
              if (container) container.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              const container = stage && stage.container();
              if (container) {
                container.style.cursor = snap.middlePanning ? 'grabbing' : 'default';
              }
            }}
          />

          {/* render from the Diagram domain */}
          <DiagramLayer />
        </Layer>

        <Layer listening={false}>
          <Rect
            ref={selRef}
            visible={false}
            stroke={selectBorderColor}
            strokeWidth={1}
            dash={[4, 4]}
            strokeScaleEnabled={false}
          />
        </Layer>
        <Layer>
          <Transformer
            ref={trRef}
            ignoreStroke
            rotateEnabled={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}
