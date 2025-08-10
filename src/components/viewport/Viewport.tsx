import { useRef, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { Stage, Layer, Circle } from 'react-konva'
import { state } from '@/CanvasState'
import { useStatus } from '../status-provider'
import { useViewportControls } from '@/components/hooks/viewport/useViewportControls'
import Konva from 'konva'

export default function Viewport() {
  const snap = useSnapshot(state)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)

  // inside your component (renderer window)
  const exportLayerSVG = async () => {
    const stage = stageRef.current!;
    const layer = stage.getLayers()[0];

    // tight bbox incl. invisible nodes, ignore shadows to avoid huge rects
    const r = layer.getClientRect({ skipStroke: false, skipShadow: true });
    const w = Math.ceil(r.width), h = Math.ceil(r.height);

    // build a temporary off-DOM stage with the layer offset so (0,0) = bbox min
    const div = document.createElement('div');
    const tmp = new Konva.Stage({ container: div, width: w, height: h });
    const cloned = layer.clone({ x: -r.x, y: -r.y });
    tmp.add(cloned); tmp.draw();

    // dynamic import avoids any bundler quirk
    const { exportStageSVG } = await import('react-konva-to-svg');
    const svg = await exportStageSVG(tmp, false) as string;

    // download
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'layer.svg',
    });
    document.body.appendChild(a); a.click(); a.remove();
  };


  const {
    viewport: {
      setViewportCursorCoords,
      setViewportWidth,
      setViewportHeight,
    },
  } = useStatus()

  useViewportControls(stageRef, setViewportCursorCoords)

  useEffect(() => {
    const resize = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return

      const { width, height } = wrapper.getBoundingClientRect()
      setViewportWidth(width)
      setViewportHeight(height)
      state.viewport.width = width
      state.viewport.height = height
    }

    const observer = new ResizeObserver(resize)
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    resize()

    return () => observer.disconnect()
  }, [setViewportWidth, setViewportHeight])

  return (
    <div ref={wrapperRef} className="flex flex-col min-w-0 min-h-0 w-full h-full">
      {/* Temporary test button */}
      <button
        onClick={exportLayerSVG}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: '4px 8px',
          background: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Export SVG
      </button>

      <Stage
        ref={stageRef}
        width={snap.viewport.width}
        height={snap.viewport.height}
        scaleX={snap.zoom}
        scaleY={snap.zoom}
        x={snap.pan.x}
        y={snap.pan.y}
        style={{
          background: '#f8f8f8',
          touchAction: 'none',
          cursor: snap.middlePanning ? 'grabbing' : 'default',
          display: 'block',
        }}
      >
        <Layer>
          <Circle
            x={snap.circle.x}
            y={snap.circle.y}
            radius={20}
            fill="tomato"
            draggable
            onDragMove={(e) => {
              state.circle.x = e.target.x()
              state.circle.y = e.target.y()
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
      </Stage>
    </div>
  );

}
