import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelPage } from "./ControlPanel";
import { useState } from "react";
import { useExportLayerSVG } from "@/components/hooks/document/ExportSVG";
import { useExportLayerRaster } from "@/components/hooks/document/ExportRaster";

type Format = "svg" | "png" | "jpg";

const ExportPanel = () => {
  const exportLayerSVG = useExportLayerSVG();
  const exportPng = useExportLayerRaster();
  const exportJpg = useExportLayerRaster();

  const [format, setFormat] = useState<Format>("svg");
  const [scale, setScale] = useState<number>(2);
  const [jpgQuality, setJpgQuality] = useState<number>(0.92);

  const onExport = async () => {
    if (format === "svg") return exportLayerSVG();
    if (format === "png") return exportPng("png", { pixelRatio: scale });
    return exportJpg("jpg", { pixelRatio: scale, quality: jpgQuality });
  };

  return (
    <PanelPage>
      <div>
        <span className="block mb-2 text-sm font-medium">Export Options</span>
        <div className="flex flex-col gap-2 w-full rounded border border-neutral-700/60 bg-neutral-800/40 p-3">
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
                setScale(Number.isFinite(n) ? Math.max(1, Math.min(8, Math.floor(n))) : 1);
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
                setJpgQuality(Number.isFinite(n) ? Math.min(1, Math.max(0.1, n)) : 0.92);
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