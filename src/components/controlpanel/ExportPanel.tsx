import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelPage } from "./ControlPanel";
import { useCallback, useState } from "react";
import { writeTextFile, writeFile } from "@tauri-apps/plugin-fs";
import { useDocument } from "@/components/document-provider";
import Konva from "konva";
import { save } from "@tauri-apps/plugin-dialog";

type Format = "svg" | "png" | "jpg";
type RasterFormat = "png" | "jpg";

type Options = {
  pixelRatio?: number; // upscaling (e.g. 2 for 2x)
  quality?: number; // 0..1 (JPG only)
  backgroundColor?: string; // JPG background (default white)
  fileBaseName?: string; // override title
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const toIntInRange = (n: number, min: number, max: number) => Math.floor(clamp(n, min, max));
const sanitizeBase = (s?: string) => (s ?? "export").replace(/[\\/:*?"<>|]+/g, "_");

const dataUrlToBytes = (url: string) => {
  const b64 = url.split(",")[1] ?? "";
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
};

const getStageAndFirstLayer = (
  stageRef: React.MutableRefObject<Konva.Stage | null | undefined>
): { stage: Konva.Stage; layer: Konva.Layer } | null => {
  const stage = stageRef?.current;
  if (!stage) {
    console.error("[export] no stage");
    return null;
  }
  const layer = stage.getLayers()[0];
  if (!layer) {
    console.error("[export] no layer");
    return null;
  }
  return { stage, layer };
};

const cloneLayerIntoTempStage = (layer: Konva.Layer) => {
  const r = layer.getClientRect({ skipStroke: false, skipShadow: true });
  const w = Math.ceil(r.width);
  const h = Math.ceil(r.height);

  const div = document.createElement("div");
  const tmp = new Konva.Stage({ container: div, width: w, height: h });

  const cloned = layer.clone({ x: -r.x, y: -r.y });
  tmp.add(cloned);
  tmp.draw();

  return { tmp, w, h } as const;
};

const promptSavePath = async (
  defaultBase: string,
  ext: "svg" | "png" | "jpg",
  filterName?: string
) => {
  const base = sanitizeBase(defaultBase);
  return save({
    defaultPath: `${base}.${ext}`,
    filters: [{ name: filterName ?? ext.toUpperCase(), extensions: [ext] }],
  });
};


const useExportLayerRaster = () => {
  const { stage: stageRef, title } = useDocument();

  return useCallback(
    async (format: RasterFormat = "png", opts: Options = {}) => {
      console.log("[raster] start", { format, opts });

      const ctx = getStageAndFirstLayer(stageRef);
      if (!ctx) return;
      const { layer } = ctx;

      const { tmp, w, h } = cloneLayerIntoTempStage(layer);

      // Optional white/colour background for JPEG (no alpha)
      if (format === "jpg") {
        const bg = new Konva.Layer();
        bg.add(
          new Konva.Rect({ x: 0, y: 0, width: w, height: h, fill: opts.backgroundColor ?? "#ffffff" })
        );
        // Put background first
        tmp.add(bg);
        bg.moveToBottom();
        tmp.draw();
      }

      const pixelRatio = opts.pixelRatio ?? 1;
      const mime = format === "jpg" ? "image/jpeg" : "image/png";
      const quality = format === "jpg" ? opts.quality ?? 0.92 : undefined;

      const dataUrl = tmp.toDataURL({ mimeType: mime, quality, pixelRatio });
      const bytes = dataUrlToBytes(dataUrl);

      const base = opts.fileBaseName ?? title ?? "export";
      console.log("[raster] opening save dialog…");
      const path = await promptSavePath(base, format);
      console.log("[raster] chosen path", path);
      if (!path) return console.warn("[raster] user cancelled");

      await writeFile(path, bytes);
      console.log("[raster] file written", path);
    },
    [stageRef, title]
  );
};


const useExportLayerSVG = () => {
  const { stage: stageRef, title } = useDocument();

  return useCallback(async () => {
    console.log("[export] svg start");

    const ctx = getStageAndFirstLayer(stageRef);
    if (!ctx) return;
    const { layer } = ctx;

    const { tmp } = cloneLayerIntoTempStage(layer);

    const { exportStageSVG } = await import("react-konva-to-svg");
    const svg = (await exportStageSVG(tmp, false)) as string;
    console.log("[export] SVG length:", svg.length);

    try {
      console.log("[export] Opening save dialog…");
      const path = await promptSavePath(title ?? "export", "svg", "SVG");
      console.log("[export] Dialog returned path:", path);
      if (!path) return console.warn("[export] User cancelled save");

      await writeTextFile(path, svg);
      console.log("[export] File written successfully:", path);
    } catch (err) {
      console.error("[export] Error during save/write:", err);
    }
  }, [stageRef, title]);
};


const ExportPanel = () => {
  const exportLayerSVG = useExportLayerSVG();
  const exportRaster = useExportLayerRaster();

  const [format, setFormat] = useState<Format>("svg");
  const [scale, setScale] = useState<number>(2);
  const [jpgQuality, setJpgQuality] = useState<number>(0.92);

  const onExport = async () => {
    if (format === "svg") return exportLayerSVG();
    if (format === "png") return exportRaster("png", { pixelRatio: scale });
    return exportRaster("jpg", { pixelRatio: scale, quality: jpgQuality });
  };

  return (
    <PanelPage>
      <div>
        <span className="block mb-2 text-sm font-medium">Export Options</span>
        <div className="flex flex-col gap-2 w-full rounded border border-neutral-700/60 bg-neutral-500/40 p-3">
          <div className="flex items-center gap-3">
            <span>Scale</span>
            <Input
              type="number"
              min={1}
              max={8}
              step={1}
              value={scale}
              onChange={(e) => {
                const n = Number(e.target.value);
                setScale(Number.isFinite(n) ? toIntInRange(n, 1, 8) : 1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span>JPEG Quality</span>
            <Input
              type="number"
              min={0.1}
              max={1}
              step={0.01}
              value={jpgQuality}
              disabled={format !== "jpg"}
              onChange={(e) => {
                const n = Number(e.target.value);
                setJpgQuality(Number.isFinite(n) ? clamp(n, 0.1, 1) : 0.92);
              }}
            />
          </div>
        </div>
      </div>
      <Separator className="my-2" />
      <div>
        <span className="block mb-2 text-sm font-medium">Export</span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span>File format</span>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a format" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Global format</SelectLabel>
                  <SelectItem value="svg">SVG (*.svg)</SelectItem>
                  <SelectItem value="png">PNG (*.png)</SelectItem>
                  <SelectItem value="jpg">JPEG (*.jpg)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full justify-end">
            <Button size="sm" onClick={onExport}>
              Export
            </Button>
          </div>
        </div>
      </div>
    </PanelPage>
  );
};

export default ExportPanel;
