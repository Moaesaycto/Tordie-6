import { useCallback } from 'react';
import Konva from 'konva';
import { useDocument } from '@/components/document-provider';

export function useExportLayerSVG() {
  const { stage: stageRef } = useDocument();

  return useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) { console.warn('No stage set'); return; }

    const layer = stage.getLayers()[0];
    const r = layer.getClientRect({ skipStroke: false, skipShadow: true });
    const w = Math.ceil(r.width), h = Math.ceil(r.height);

    const div = document.createElement('div');
    const tmp = new Konva.Stage({ container: div, width: w, height: h });
    const cloned = layer.clone({ x: -r.x, y: -r.y });
    tmp.add(cloned); tmp.draw();

    const { exportStageSVG } = await import('react-konva-to-svg');
    const svg = await exportStageSVG(tmp, false) as string;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'layer.svg',
    });
    document.body.appendChild(a); a.click(); a.remove();
  }, [stageRef]);
}
