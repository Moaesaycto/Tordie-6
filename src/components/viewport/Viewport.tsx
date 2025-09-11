import { useRef, useEffect, useCallback, useState } from 'react';
import { useSnapshot } from 'valtio';
import { Stage, Layer, Circle, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { seedDiagramIfEmpty, state, updatePoint } from '@/components/canvas/CanvasState';
import { useApp } from '@/components/app-provider';
import { useViewportControls } from '@/components/hooks/viewport/useViewportControls';
import { useDocument } from '@/components/document-provider';
import { readableTextColour } from '@/lib/color';
import type { Geometry } from '@/domain/Geometry/Geometry';
import { RenderCtx, renderGeometry } from '@/components/canvas/geometryRenderers';
import Config from "@/tordie.config.json";
import { useTheme } from '@/components/theme-provider';

const strokeFor = (resolved?: string) =>
  Config.geometry.stroke[resolved === "dark" ? "dark" : "light"];

export function DiagramLayer({ geoms, ctx }: { geoms: Geometry[]; ctx: RenderCtx }) {
  const { resolvedTheme } = useTheme();
  const stroke = strokeFor(resolvedTheme); // updates automatically when theme changes
  const ui = useSnapshot(state);
  const rawZoom = ui?.zoom;
  const zoom = Number.isFinite(rawZoom as number) && (rawZoom as number) > 0
    ? (rawZoom as number)
    : 1; // safe fallback

  return <>{geoms.map(g => renderGeometry(g, ctx, stroke, zoom))}</>;
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

  const dSnap = useSnapshot(state.diagram);                 // subscribe to diagram
  const geoms = Array.from(dSnap.geoms.values());           // Geometry[]
  const ctx: RenderCtx = {
    getGeom: (id) => dSnap.geoms.get(id),
    onPointMove: (id, xy) => updatePoint(id, xy),
  };

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
          <DiagramLayer geoms={geoms} ctx={ctx} />
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
