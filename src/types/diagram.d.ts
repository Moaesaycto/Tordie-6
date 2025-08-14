import { GeometryKind } from "@domain/Geometry/Geometry";

export type DiagramItemLabel = {
    id: string;
    type: GeometryKind;
    name: string;
    visible: boolean;
    children?: DiagramItemLabel[];
}