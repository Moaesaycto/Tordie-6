import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRef, useEffect, useState, type ComponentType } from "react";
import { useAppState } from "@/components/state-provider";
import type { Panel } from "@/types/state";
import { useFontSize } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import DocumentController from "./DocumentPanel";
import ExportPanel from "./ExportPanel";
import ScenePanel from "./ScenePanel";

type PanelDef = { label: string; component: ComponentType };
const PANELS: Record<Panel, PanelDef> = {
  document: { label: "Document", component: DocumentController },
  export: { label: "Export", component: ExportPanel },
  scene: { label: "Scene", component: ScenePanel },
};

export function ControlPanel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  const { currentState } = useAppState(); // currentState.panelState: Panel
  const [value, setValue] = useState<Panel>(currentState.panelState);

  // keep select synced with external state
  useEffect(() => setValue(currentState.panelState), [currentState.panelState]);

  // compute scroll height
  useEffect(() => {
    const updateHeight = () => {
      if (!wrapperRef.current || !headerRef.current) return;
      setScrollHeight(wrapperRef.current.clientHeight - headerRef.current.clientHeight);
    };
    requestAnimationFrame(updateHeight);
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(updateHeight, 100); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, []);

  const PanelComponent = PANELS[value].component;

  return (
    <div ref={wrapperRef} className="flex flex-col w-full h-full overflow-hidden">
      <div ref={headerRef} className="shrink-0 border-b p-2">
        <Select value={value} onValueChange={(v) => setValue(v as Panel)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select panel" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PANELS) as Panel[]).map((id) => (
              <SelectItem key={id} value={id}>
                {PANELS[id].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className=" flex-1 w-full" style={{ height: scrollHeight }}>
        <div style={{ height: scrollHeight }}>
          <PanelComponent />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}

type PanelPageProps = { children: React.ReactNode };
export const PanelPage = ({ children }: PanelPageProps) => {
  const fontSize = useFontSize();
  return (
    <div className={`flex h-full min-h-0 flex-col w-full space-y-1 ${fontSize} gap-4 p-1`}>
      {children}
    </div>
  );
};
