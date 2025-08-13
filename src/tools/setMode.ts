import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { useDocument } from '@/components/document-provider';
import { Mode } from '@/types/state';

const selNS = '.selectTool';

export function useSetMode(mode: Mode) {
    const { stage: stageRef, tools: {selRef, layerRef, trRef} } = useDocument();
    const selectingRef = useRef(false);
    const x1 = useRef(0), y1 = useRef(0);

    useEffect(() => {
        const stage = stageRef.current;
        const layer = layerRef.current;
        const sel = selRef.current;
        const tr = trRef.current;
        if (!stage || !layer || !sel || !tr) return; // <- wait until mounted

        // reset
        stage.off(selNS);
        stage.container().style.cursor = 'default';
        sel.visible(false);
        sel.strokeScaleEnabled(false);
        sel.strokeWidth(1);
        tr.nodes([]);
        layer.getStage()?.batchDraw();

        if (mode !== 'select') return;

        stage.container().style.cursor = 'crosshair';

        const scenePos = () => {
            const p = stage.getPointerPosition(); if (!p) return null;
            const inv = stage.getAbsoluteTransform().copy().invert();
            return inv.point(p);
        };

        const isLeft = (e: Konva.KonvaEventObject<any>) =>
            e.evt instanceof MouseEvent && e.evt.button === 0;

        const onDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!isLeft(e)) return; // left click only
            if (e.target !== stage) return;
            const p = scenePos(); if (!p) return;
            x1.current = p.x; y1.current = p.y; selectingRef.current = true;
            sel.setAttrs({ x: p.x, y: p.y, width: 0, height: 0, visible: true });
            layer.batchDraw();
        };

        const onMove = () => {
            if (!selectingRef.current) return;
            const p = scenePos(); if (!p) return;
            sel.setAttrs({
                x: Math.min(x1.current, p.x),
                y: Math.min(y1.current, p.y),
                width: Math.abs(p.x - x1.current),
                height: Math.abs(p.y - y1.current),
            });
            layer.batchDraw();
        };

        const onUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!selectingRef.current) return;
            if (!isLeft(e)) return; // finish only on left up
            selectingRef.current = false;
            const box = sel.getClientRect({ skipTransform: false });
            const selected = layer.find('.selectable').filter(n =>
                Konva.Util.haveIntersection(box, n.getClientRect({ skipTransform: false }))
            ) as Konva.Node[];
            tr.nodes(selected);
            sel.visible(false);
            layer.batchDraw();
        };

        const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!isLeft(e)) return; // ignore right/middle click
            if (e.target === stage || selectingRef.current) return;
            const multi = e.evt.ctrlKey || e.evt.metaKey;
            const nodes = multi ? [...tr.nodes(), e.target] : [e.target];
            tr.nodes(nodes.filter(n => n.hasName('selectable')));
            layer.batchDraw();
        };

        stage.on('mousedown' + selNS, onDown);
        stage.on('mousemove' + selNS, onMove);
        stage.on('mouseup' + selNS, onUp);
        stage.on('click' + selNS, onClick);

        return () => { stage.off(selNS); };
    }, [mode, stageRef, layerRef, selRef, trRef]);
}
