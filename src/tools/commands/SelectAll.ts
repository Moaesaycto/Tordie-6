// tools/selectAll.ts (no hooks here)
import Konva from "konva";

export function selectAll(layer: Konva.Layer, tr: Konva.Transformer): void {
  const nodes: Konva.Node[] = [];
  layer.find(".selectable").forEach((n: Konva.Node) => {
    if (n.isVisible()) nodes.push(n);
  });
  tr.nodes(nodes);
  layer.batchDraw();
}
