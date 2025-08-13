import { Id } from "@/lib/objects";

export type GeometryKind = "point" | "line" | "circle" | "parametric" | "group" | "tessellation" | "importedSvg";

// Storing theme here for now, but the classes will be in their own files
export type PointData = { x: number; y: number };
export type LineData = { p0: Id | PointData; p1: Id | PointData };
export type CircleData = { center: Id | PointData; r: number };
export type ParametricData = { t0: number; t1: number; fExpr: string };
export type GroupData = { children: Id[] };
export type TessellationData = { cell: Id; rules?: Record<string, unknown> };
export type ImportedSvgData = { paths: string }; // raw path string or svg fragment

export type GeometryData =
  | { kind: "point"; data: PointData }
  | { kind: "line"; data: LineData }
  | { kind: "circle"; data: CircleData }
  | { kind: "parametric"; data: ParametricData }
  | { kind: "group"; data: GroupData }
  | { kind: "tessellation"; data: TessellationData }
  | { kind: "importedSvg"; data: ImportedSvgData };

export type Geometry = { id: Id; payload: GeometryData; meta?: Record<string, unknown> };