import { GeometryKind } from "@domain/Geometry/Geometry";
import { TbCircle, TbLine, TbWaveSine, TbTopologyStar3 } from "react-icons/tb";
import { MdOutlineGroupWork } from "react-icons/md";
import { VscSymbolNamespace } from "react-icons/vsc";
import { IconType } from "react-icons/lib";
import { GoDotFill } from "react-icons/go";


type GeometryIcon = {
    icon: IconType;
    color: string;
    label: string;
};

export const GEOMETRY_MAP_ICONS: Record<GeometryKind, GeometryIcon> = {
    point: { icon: GoDotFill, color: "#ffb703", label: "Point" }, // warm yellow/orange
    line: { icon: TbLine, color: "#219ebc", label: "Line" }, // blue
    circle: { icon: TbCircle, color: "#8ecae6", label: "Circle"}, // light blue
    parametric: { icon: TbWaveSine, color: "#fb8500", label: "Parametric Curve"}, // orange
    group: { icon: MdOutlineGroupWork, color: "#9b5de5", label: "Group"}, // purple
    tessellation: { icon: TbTopologyStar3, color: "#00bbf9", label: "Tessellation"}, // bright cyan
    importedSvg: { icon: VscSymbolNamespace, color: "#38b000", label: "Imported SVG"}, // green
};

export const getGeometryIcon = (kind: GeometryKind) => GEOMETRY_MAP_ICONS[kind] ?? { icon: GoDotFill, color: "#888" };
