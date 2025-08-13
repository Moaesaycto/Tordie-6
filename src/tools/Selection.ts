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
  // visual prefs (keep 1px on screen, dashed)
  sel.strokeScaleEnabled(false);
  sel.strokeWidth(1);
  sel.dash([4, 4]);

  const scenePos = () => {
    const p = stage.getPointerPosition();
    if (!p) return null;
    const inv = stage.getAbsoluteTransform().copy().invert();
    return inv.point(p);
  };

  const isLeft = (e: Konva.KonvaEventObject<any>) =>
    e.evt instanceof MouseEvent && e.evt.button === 0;

  const onDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isLeft(e)) return;
    if (e.target !== stage) return; // start only from empty stage
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
    if (!selecting || !isLeft(e)) return;
    selecting = false;

    const box = sel.getClientRect({ skipTransform: false });
    const selected = layer.find('.selectable').filter(n =>
      Konva.Util.haveIntersection(box, n.getClientRect({ skipTransform: false }))
    ) as Konva.Node[];

    tr.nodes(selected);
    sel.visible(false);
    layer.batchDraw();
  };

  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isLeft(e)) return;
    if (e.target === stage || selecting) return;
    const multi = (e.evt as MouseEvent).ctrlKey || (e.evt as MouseEvent).metaKey;
    const nodes = multi ? [...tr.nodes(), e.target] : [e.target];
    tr.nodes(nodes.filter(n => n.hasName('selectable')));
    layer.batchDraw();
  };

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
  };
}
