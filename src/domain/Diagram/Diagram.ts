import { genId, Id } from "@/lib/objects";
import { Item } from "@domain/Item/Item";
import { Geometry, GeometryData } from "@domain/Geometry/Geometry";
import { GeometryEvaluator, Modifier, ModifierType } from "@domain/Modifiers/Modifier";
import { identityTransform } from "@domain/Math/Math";
import { DiagramItemLabel } from "@/types/diagram";


// TODO: Make these real
const MODIFIERS = [
  "Reflect",
  "Array",
  "Twist"
]

  type MutableProps = {
    name?: string;
  }

export class Diagram {
  // stores
  readonly items = new Map<Id, Item>();
  readonly geoms = new Map<Id, Geometry>();
  readonly mods = new Map<Id, Modifier>();

  // item -> modifier stack (ordered)
  readonly itemMods = new Map<Id, Id[]>();

  // modifier type registry
  private readonly evalRegistry = new Map<ModifierType, GeometryEvaluator>();

  // cache for evaluated geometry per item revision
  private evalCache = new Map<Id, Geometry>();

  // REGISTRY
  registerModifier(type: ModifierType, fn: GeometryEvaluator) {
    this.evalRegistry.set(type, fn);
  }

  constructor() {
    MODIFIERS.map((e) => this.registerModifier(e, (g) => g)) // identity evaluator default (no-op)
  }


  displayList(): DiagramItemLabel[] {
    return [
      {
        id: "1",
        type: "point",
        name: "Point",
        visible: true,
      },
      {
        id: "2",
        type: "line",
        name: "Line",
        visible: true,
      },
      {
        id: "3",
        type: "circle",
        name: "Circle",
        visible: true,
      },
      {
        id: "4",
        type: "parametric",
        name: "Parametric",
        visible: true,
      },
      {
        id: "5",
        type: "group",
        name: "Group",
        children: [],
        visible: true,
      },
      {
        id: "6",
        type: "tessellation",
        name: "Tessellation",
        visible: true,
      },
      {
        id: "7",
        type: "importedSvg",
        name: "Imported SVG",
        visible: true,
      },
    ]
  }

  updateItem(id: string, info: MutableProps) {
    console.log(`Updating: ${id} to: `, info)
  }

  createGeometry(payload: GeometryData, meta?: Record<string, unknown>): Id {
    const id = genId("geom");
    this.geoms.set(id, { id, payload, meta });
    return id;
  }

  createItem(opts: Partial<Omit<Item, "id" | "children" | "transform" | "tags" | "modifiers">> & { geometry?: Id | null } = {}): Id {
    const id = genId("item");
    const item: Item = {
      id,
      name: opts.name,
      parent: opts.parent ?? null, // Will sort this out later if needed
      children: [],
      transform: identityTransform(),
      tags: [],
      geometry: opts.geometry ?? null,
      render: opts.render,
      measurement: opts.measurement,
      modifiers: [],
    };
    this.items.set(id, item);
    this.itemMods.set(id, []);
    return id;
  }

  createModifier(type: ModifierType, params: Record<string, unknown> = {}, inputs: Id[] = []): Id {
    const id = genId("mod");
    const mod: Modifier = { id, type, params, inputs };
    this.mods.set(id, mod);
    return id;
  }

  invalidate(itemId?: Id) {
    if (!itemId) this.evalCache.clear();
    else this.evalCache.delete(itemId);
  }
}