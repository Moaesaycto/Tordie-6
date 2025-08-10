import { useDocument } from '@/components/document-provider';
import Konva from 'konva';

export const exportLayerSVG = async () => {
    const { stage: stageRef  } = useDocument();

    if (stageRef == null) {
        console.log("Failed to download");
    }

    const stage = stageRef.current!;
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
};