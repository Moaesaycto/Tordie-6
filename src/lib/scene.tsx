import Konva from "konva";

export const scenePoint = (stage: Konva.Stage) => {
    const p = stage.getPointerPosition(); if (!p) return null;
    return stage.getAbsoluteTransform().copy().invert().point(p);
};

// node local -> scene transform
export const toScene = (node: Konva.Node, stage: Konva.Stage) =>
    stage.getAbsoluteTransform().copy().invert().multiply(node.getAbsoluteTransform().copy());

// bbox in scene for generic nodes (skip stroke/shadow)
export const nodeRectScene = (n: Konva.Node, stage: Konva.Stage) =>
    n.getClientRect({ relativeTo: stage, skipTransform: false, skipStroke: true, skipShadow: true });
