import { GeometryKind } from "@domain/Geometry/Geometry";

export type SceneItemLabel = {
    id: string;
    type: GeometryKind
    name: string;
    children?: SceneItemLabel[];
}