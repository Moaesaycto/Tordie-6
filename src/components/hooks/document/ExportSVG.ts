import { useCallback } from 'react';
import { useDocument } from '@/components/document-provider';
import Konva from 'konva';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

export const useExportLayerSVG = () => {
  const { stage: stageRef, title } = useDocument();

  return useCallback(async () => {
    console.log("[export] Called");

    if (!stageRef) {
      console.error("[export] stageRef is null/undefined");
      return;
    }
    if (!stageRef.current) {
      console.error("[export] stageRef.current is null");
      return;
    }
    console.log("[export] Stage object found:", stageRef.current);

    const stage = stageRef.current;
    const layer = stage.getLayers()[0];
    if (!layer) {
      console.error("[export] No layers found in stage");
      return;
    }
    console.log("[export] Using layer:", layer);

    const r = layer.getClientRect({ skipStroke: false, skipShadow: true });
    const w = Math.ceil(r.width), h = Math.ceil(r.height);
    console.log(`[export] Layer rect:`, r, `Width: ${w}`, `Height: ${h}`);

    const div = document.createElement('div');
    const tmp = new Konva.Stage({ container: div, width: w, height: h });
    const cloned = layer.clone({ x: -r.x, y: -r.y });
    tmp.add(cloned);
    tmp.draw();
    console.log("[export] Temporary stage created/cloned");

    const { exportStageSVG } = await import('react-konva-to-svg');
    console.log("[export] react-konva-to-svg loaded");
    const svg = await exportStageSVG(tmp, false) as string;
    console.log("[export] SVG export complete, length:", svg.length);

    try {
      console.log("[export] Opening save dialog…");
      const path = await save({
        defaultPath: `${title}.svg`,
        filters: [{ name: 'SVG', extensions: ['svg'] }]
      });
      console.log("[export] Dialog returned path:", path);

      if (!path) {
        console.warn("[export] User cancelled save");
        return;
      }

      await writeTextFile(path, svg);
      console.log("[export] File written successfully:", path);
    } catch (err) {
      console.error("[export] Error during save/write:", err);
    }
  }, [stageRef, title]);
};


