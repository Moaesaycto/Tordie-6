import { useCallback } from 'react';
import { useDocument } from '@/components/document-provider';
import Konva from 'konva';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

type RasterFormat = 'png' | 'jpg';
type Options = {
    pixelRatio?: number;         // upscaling (e.g. 2 for 2x)
    quality?: number;            // 0..1 (JPG only)
    backgroundColor?: string;    // JPG background (default white)
    fileBaseName?: string;       // override title
};

export const useExportLayerRaster = () => {
    const { stage: stageRef, title } = useDocument();

    return useCallback(async (format: RasterFormat = 'png', opts: Options = {}) => {
        console.log('[raster] start', { format, opts });
        if (!stageRef?.current) return console.error('[raster] no stage');

        const stage = stageRef.current;
        const layer = stage.getLayers()[0];
        if (!layer) return console.error('[raster] no layer');

        const r = layer.getClientRect({ skipStroke: false, skipShadow: true });
        const w = Math.ceil(r.width), h = Math.ceil(r.height);
        console.log('[raster] bounds', { w, h, r });

        // temp stage containing just this layer content
        const div = document.createElement('div');
        const tmp = new Konva.Stage({ container: div, width: w, height: h });

        // optional white background for JPEG (since it has no alpha)
        if (format === 'jpg') {
            const bg = new Konva.Layer();
            bg.add(new Konva.Rect({ x: 0, y: 0, width: w, height: h, fill: opts.backgroundColor ?? '#ffffff' }));
            tmp.add(bg);
        }

        const cloned = layer.clone({ x: -r.x, y: -r.y });
        tmp.add(cloned);
        tmp.draw();
        console.log('[raster] temp stage ready');

        const pixelRatio = opts.pixelRatio ?? 1;
        const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? (opts.quality ?? 0.92) : undefined;

        const dataUrl = tmp.toDataURL({ mimeType: mime, quality, pixelRatio });
        console.log('[raster] dataUrl length', dataUrl.length);

        // convert data URL -> bytes
        const toBytes = (url: string) => {
            const b64 = url.split(',')[1];
            const bin = atob(b64);
            const u8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            return u8;
        };
        const bytes = toBytes(dataUrl);

        const base = ((opts.fileBaseName ?? title) || 'export').replace(/[\\/:*?"<>|]+/g, '_');
        const ext = format === 'jpg' ? 'jpg' : 'png';

        console.log('[raster] opening save dialog…');
        const path = await save({
            defaultPath: `${base}.${ext}`,
            filters: [{ name: ext.toUpperCase(), extensions: [ext] }]
        });
        console.log('[raster] chosen path', path);
        if (!path) return console.warn('[raster] user cancelled');

        await writeFile(path, bytes);
        console.log('[raster] file written', path);
    }, [stageRef, title]);
};
