import Konva from 'konva';

type SelectModeDeps = {
  stage: Konva.Stage;
  layer: Konva.Layer;
  sel: Konva.Rect;
  tr: Konva.Transformer;
  ns: string; // e.g. '.selectTool'
};

export function enableSelectMode({ stage, layer, sel, tr, ns }: SelectModeDeps): () => void {
  let selecting = false;
  let x1 = 0, y1 = 0;

  stage.container().style.cursor = 'crosshair';

  const onWindowUp = () => selecting && onUp({ evt: { button: 0 } } as any);
  window.addEventListener('mouseup', onWindowUp);

  const scenePos = () => {
    const p = stage.getPointerPosition();
    if (!p) return null;
    const inv = stage.getAbsoluteTransform().copy().invert();
    return inv.point(p);
  };

  const isPrimary = (e: Konva.KonvaEventObject<any>) =>
    'button' in e.evt ? e.evt.button === 0 : true;

  const onDown = (e: Konva.KonvaEventObject<any>) => {
    if (!isPrimary(e)) return;
    const p = scenePos(); if (!p) return;
    selecting = true;
    x1 = p.x; y1 = p.y;
    sel.setAttrs({ x: p.x, y: p.y, width: 0, height: 0, visible: true });
    layer.batchDraw();
  };

  const onMove = () => {
    if (!selecting) return;
    const p = scenePos(); if (!p) return;
    sel.setAttrs({
      x: Math.min(x1, p.x),
      y: Math.min(y1, p.y),
      width: Math.abs(p.x - x1),
      height: Math.abs(p.y - y1),
    });
    layer.batchDraw();
  };

  const onUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selecting || !isPrimary(e)) return;
    selecting = false;

    const box = sel.getClientRect({ skipTransform: false });
    const selected = layer.find('.selectable').filter(n =>
      Konva.Util.haveIntersection(box, n.getClientRect({ skipTransform: false }))
    ) as Konva.Node[];

    tr.nodes(selected);
    sel.visible(false);
    layer.batchDraw();
    console.log(tr.nodes().length);
  };

  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPrimary(e)) return;
    if (e.target === stage || selecting) return;
    const multi = (e.evt as MouseEvent).ctrlKey || (e.evt as MouseEvent).metaKey;
    const nodes = multi ? [...tr.nodes(), e.target] : [e.target];
    tr.nodes(nodes.filter(n => n.hasName('selectable')));
    layer.batchDraw();
  };

  sel.listening(false);  // don't intercept events
  sel.draggable(false);

  stage.on('mousedown' + ns, onDown);
  stage.on('mousemove' + ns, onMove);
  stage.on('mouseup' + ns, onUp);
  stage.on('click' + ns, onClick);

  // cleanup
  return () => {
    stage.off(ns);
    sel.visible(false);
    tr.nodes([]);
    layer.getStage()?.batchDraw();
    window.removeEventListener('mouseup', onWindowUp);
  };
}
