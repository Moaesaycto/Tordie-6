# Tordie Object Structure
## Developer reference only

```
Scene
├─ Items (instances in the scene; aka nodes)
│  ├─ Item (id)
│  │  ├─ parent: ItemId | null
│  │  ├─ children: ItemId[]
│  │  ├─ components
│  │  │  ├─ Transform (mat3 or pos/rot/scale)
│  │  │  ├─ GeometryRef (geomId | null)          // links to Geometry store
│  │  │  ├─ Render (stroke/fill/opacity/z/etc.)  // optional; if absent = non-rendered
│  │  │  ├─ Measurement (grids/dividers/rulers)  // optional; purely helper semantics
│  │  │  ├─ Constraints (locks, relations)
│  │  │  └─ Tags/Meta (name, layers, selection flags)
│  │  └─ modifiers: ModifierId[]                 // stack applied to the referenced geometry
│  └─ …
│
├─ Geometries (pure math definitions; shareable)
│  ├─ Geometry (geomId, kind, data)
│  │  ├─ kind: "point"        → { x, y }
│  │  ├─ kind: "line"         → { p0, p1 | point+dir }
│  │  ├─ kind: "circle"       → { center: PointRef, r }
│  │  ├─ kind: "parametric"   → { t:[t0,t1], f(t) }
│  │  ├─ kind: "group"        → { children: geomId[] }     // not a scene group; a geo aggregate
│  │  ├─ kind: "tessellation" → { cell: geomId, rules… }
│  │  └─ kind: "importedSvg"  → { paths… }
│  └─ …
│
├─ Modifiers (non-destructive; pure functions Geometry→Geometry)
│  ├─ Modifier (modId, type, params, inputs)
│  │  ├─ type: "Reflect"  → { line: ItemId|geomId }
│  │  ├─ type: "Array"    → { count, offset | angle }
│  │  ├─ type: "Twist"    → { angle, center }
│  │  ├─ type: "Offset"   → { d }
│  │  ├─ type: "Boolean"  → { op: union|intersect|… , a: geomId, b: geomId }
│  │  └─ …
│  └─ …
│
├─ DependencyGraph (recompute order)
│  ├─ nodes: ItemId | geomId | modId
│  └─ edges: references (GeometryRef, modifier inputs, param refs)
│
├─ Systems
│  ├─ Evaluator: topo-sort deps → apply modifier stacks → cache results
│  ├─ Renderer: model → Konva nodes (adapter; view-only)
│  ├─ Serializer: stable JSON of Scene/Geometries/Modifiers
│  └─ Undo/Redo: command log over Scene mutations
└─
```