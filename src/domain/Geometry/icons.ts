import { GeometryKind } from "@domain/Geometry/Geometry";
import { TbCircle, TbLine, TbWaveSine, TbTopologyStar3 } from "react-icons/tb";
import { MdOutlineGroupWork } from "react-icons/md";
import { VscSymbolNamespace } from "react-icons/vsc";
import { IconType } from "react-icons/lib";
import { GoDotFill } from "react-icons/go";


type GeometryIcon = {
    icon: IconType;
    color: string;
};

export const GEOMETRY_MAP_ICONS: Record<GeometryKind, GeometryIcon> = {
    point: { icon: GoDotFill, color: "#ffb703" }, // warm yellow/orange
    line: { icon: TbLine, color: "#219ebc" }, // blue
    circle: { icon: TbCircle, color: "#8ecae6" }, // light blue
    parametric: { icon: TbWaveSine, color: "#fb8500" }, // orange
    group: { icon: MdOutlineGroupWork, color: "#9b5de5" }, // purple
    tessellation: { icon: TbTopologyStar3, color: "#00bbf9" }, // bright cyan
    importedSvg: { icon: VscSymbolNamespace, color: "#38b000" }, // green
};

export const getGeometryIcon = (kind: GeometryKind) => GEOMETRY_MAP_ICONS[kind] ?? { icon: GoDotFill, color: "#888" };
