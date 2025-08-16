import { useRef, useEffect, useCallback, useState } from 'react';
import { useSnapshot } from 'valtio';
import { Stage, Layer, Circle, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { state } from '@/components/canvas/CanvasState';
import { useApp } from '../app-provider';
import { useViewportControls } from '@/components/hooks/viewport/useViewportControls';
import { useDocument } from '@/components/document-provider';
import { readableTextColour } from '@/lib/color';

export default function Viewport() {
  const snap = useSnapshot(state);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const { backgroundColor } = useDocument();
  const [ selectBorderColor, setSelectBorderColor ] = useState<string>("#ffffff");

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
