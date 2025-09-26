import { useEffect } from 'react';
import Konva from 'konva';
import { useDocument } from '@/components/document-provider';
import { Mode } from '@/types/state';
import { enableSelectMode } from './Selection';

const NS = '.selectTool';

export function useSetMode(mode: Mode | null) {
  const { stage: stageRef, tools: { layerRef, selRef, trRef } } = useDocument();

  useEffect(() => {
    const stage = stageRef.current as Konva.Stage | null;
    const layer = layerRef.current as Konva.Layer | null;
    const sel = selRef.current as Konva.Rect | null;
    const tr = trRef.current as Konva.Transformer | null;

    if (!stage || !layer || !sel || !tr) return; // wait until mounted

    // global reset before enabling a tool
    stage.off(NS);
    stage.container().style.cursor = 'default';
    sel.visible(false);
    sel.strokeScaleEnabled(false);
    sel.strokeWidth(1);
    tr.nodes([]);
    layer.getStage()?.batchDraw();

    if (!mode) return;

    let cleanup: () => void = () => { };

    switch (mode) {
      case 'select':
        cleanup = enableSelectMode({ stage, layer, sel, ns: NS });
        break;

      // add other modes here (pan/draw/etc.)
      // case 'pan':
      //   cleanup = enablePanMode({ stage, ns: NS });
      //   break;

      default:
        // no-op; cursor already reset
        cleanup = () => { };
    }

    return () => cleanup();
  }, [mode, stageRef, layerRef, selRef, trRef]);
}
