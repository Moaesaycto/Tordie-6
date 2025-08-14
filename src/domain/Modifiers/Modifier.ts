import { Id } from "@/lib/objects";
import { Diagram } from "@/domain/Diagram/Diagram";
import { Geometry } from "@domain/Geometry/Geometry";
import { Item } from "@domain/Item/Item";

export type ModifierType = "Reflect" | "Array" | "Twist" | string; // extensible
export type Modifier = { id: Id; type: ModifierType; params: Record<string, unknown>; inputs: Id[] };

// Runtime registry for modifier evaluators (pure functions)
export type GeometryEvaluator = (geom: Geometry, params: Record<string, unknown>, inputs: ReadonlyArray<Geometry | Item>, ctx: Diagram) => Geometry;
