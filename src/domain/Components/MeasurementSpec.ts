export type MeasurementSpec =
    | { kind: "Grid"; spacing: number; subdivisions?: number }
    | { kind: "Divider"; step?: number }
    | { kind: "Guide"; label?: string };
