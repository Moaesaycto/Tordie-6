import { GeometryKind } from "@domain/Geometry/Geometry";

export type SceneItemLabel = {
    id: string;
    type: GeometryKind;
    name: string;
    visible: boolean;
    children?: SceneItemLabel[];
}