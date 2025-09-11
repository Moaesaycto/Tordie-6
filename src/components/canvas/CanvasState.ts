import { proxy } from "valtio";
import { proxyMap, proxySet } from "valtio/utils";
import { Diagram } from "@/domain/Diagram/Diagram";
import { Geometry, GeometryData, PointData } from "@/domain/Geometry/Geometry";
import { Id } from "@/lib/objects";

// helper to create a Diagram whose maps are reactive
function makeDiagram() {
  const d = new Diagram();
  // @ts-expect-error intentional replacement with reactive maps
  d.geoms = proxyMap(d.geoms);
  // @ts-expect-error
  d.items = proxyMap(d.items);
  // @ts-expect-error
  d.mods = proxyMap(d.mods);
  return d;
}

export const state = proxy({
  zoom: 1,
  rotation: 0,
  pan: { x: 0, y: 0 },
  circle: { x: 100, y: 100 },
  dragging: false,
  dragOffset: { x: 0, y: 0 },
  middlePanning: false,
  lastMouse: { x: 0, y: 0 },
  viewport: { width: 0, height: 0 },
  document: { width: 1000, height: 1000 },
  mode: "select",
  selection: proxySet<Id>(),
  diagram: makeDiagram(),
});

export const clearSelection = () => state.selection.clear();
export const selectOnly = (id: Id) => { state.selection.clear(); state.selection.add(id); };
export const addSelect = (id: Id) => { state.selection.add(id); };
export const toggleSelect = (id: Id) => {
  if (state.selection.has(id)) state.selection.delete(id);
  else state.selection.add(id);
};

export function handleSelectClick(id: Id, evt: MouseEvent) {
  const { shiftKey, ctrlKey, metaKey } = evt;
  const toggleKey = ctrlKey || metaKey;
  if (toggleKey) toggleSelect(id);
  else if (shiftKey) addSelect(id);
  else selectOnly(id);
}

// A) Replace instance (simple)
export function loadDiagramReplace(json: any) {
  void json // FIXME: Actually implement this
  const d = makeDiagram();
  // hydrate d from json...
  // e.g. json.geoms.forEach(g => d.geoms.set(g.id, g));
  d.invalidate();
  state.diagram = d; // swap; subscribers update
}

// B) Mutate in place (preserve identity, selections)
export function loadDiagramInPlace(json: any) {
  void json // FIXME: Actually implement this
  const d = state.diagram;
  d.items.clear(); d.geoms.clear(); d.mods.clear();
  // hydrate in-place...
  d.invalidate();
}

// geometry helpers bound to current diagram

export function updatePoint(geomId: Id, xy: PointData) {
  const d = state.diagram;
  const g = d.geoms.get(geomId);
  if (!g || g.payload.kind !== "point") return;
  d.geoms.set(geomId, { ...g, payload: { kind: "point", data: xy } });
  d.invalidate(/* TODO: fine-grained dirty */);
}

export function resolvePoint(ref: Id | PointData): PointData {
  if (typeof ref === "string") {
    const g = state.diagram.geoms.get(ref) as Geometry;
    return (g.payload as GeometryData & { kind: "point" }).data as PointData;
  }
  return ref;
}

export function seedDiagramIfEmpty() {
  const d = state.diagram;
  if (d.geoms.size) return; // already populated

  const p0 = d.createGeometry({ kind: "point", data: { x: 140, y: 160 } });
  const p1 = d.createGeometry({ kind: "point", data: { x: 320, y: 240 } });
  const L = d.createGeometry({ kind: "line", data: { p0, p1 } });

  d.createItem({ name: "L", geometry: L });

  d.invalidate();
}

export function expandSelection(ids: Id[], geoms = state.diagram.geoms): Set<Id> {
  const out = new Set<Id>(ids);
  for (const id of ids) {
    const g = geoms.get(id);
    if (!g) continue;

    if (g.payload.kind === "line") {
      const { p0, p1 } = g.payload.data as { p0: Id | any; p1: Id | any };
      if (typeof p0 === "string") out.add(p0);
      if (typeof p1 === "string") out.add(p1);
    }

    if (g.payload.kind === "point") {
      for (const L of geoms.values()) {
        if (L.payload.kind !== "line") continue;
        const { p0, p1 } = L.payload.data as { p0: Id | any; p1: Id | any };
        if (p0 === id || p1 === id) {
          out.add(L.id);
          if (typeof p0 === "string") out.add(p0);
          if (typeof p1 === "string") out.add(p1);
        }
      }
    }
  }
  return out;
}

export function applySelection(baseIds: Id[], evt?: MouseEvent) {
  const ids = Array.from(expandSelection(baseIds));
  const toggleKey = !!(evt?.ctrlKey || evt?.metaKey);
  const shiftKey = !!evt?.shiftKey;

  if (!shiftKey && !toggleKey) {
    state.selection.clear();
    ids.forEach(id => state.selection.add(id));
    return;
  }
  if (toggleKey) {
    ids.forEach(id => {
      if (state.selection.has(id)) state.selection.delete(id);
      else state.selection.add(id);
    });
    return;
  }
  // shift-add
  ids.forEach(id => state.selection.add(id));
}