import { Id } from "@/lib/objects";
import { RenderStyle } from "@domain/Components/RenderStyle";
import { Transform } from "@domain/Math/Math";
import { MeasurementSpec } from "@domain/Components/MeasurementSpec";

export type Item = {
  id: Id;
  name?: string;
  parent?: Id | null;
  children: Id[];
  transform: Transform;
  tags: string[];
  geometry?: Id | null; // reference to a Geometry (shareable)
  render?: RenderStyle; // optional: if absent or visible===false -> considered non-rendered
  measurement?: MeasurementSpec; // optional helper semantics
  modifiers: Id[]; // stack of Modifier ids, applied in order
};