import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRef, useEffect, useState, type ComponentType } from "react";
import { useAppState } from "@/components/state-provider";
import type { Panel } from "@/types/state";

import DocumentController from "./DocumentPanel";
import ExportPanel from "./ExportPanel";

type PanelDef = { label: string; component: ComponentType };

// Map panels by identifier (matches your union)
const PANELS: Record<Panel, PanelDef> = {
  document: { label: "Document", component: DocumentController },
  export: { label: "Export", component: ExportPanel },
};

export function ControlPanel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  const { currentState } = useAppState(); // currentState.panelState: Panel
  const [tabValue, setTabValue] = useState<Panel>(currentState.panelState);

  // keep tab synced with external state
  useEffect(() => setTabValue(currentState.panelState), [currentState.panelState]);

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

  return (
    <div ref={wrapperRef} className="flex flex-col w-full h-full overflow-hidden">
      <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as Panel)} className="w-full h-full">
        <div ref={headerRef} className="shrink-0 border-b">
          <TabsList className="grid grid-cols-2 w-full p-0 rounded-none">
            {(Object.keys(PANELS) as Panel[]).map((id) => (
              <TabsTrigger key={id} value={id} className="rounded-none">
                {PANELS[id].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="w-full" style={{ height: scrollHeight }}>
          <div className="p-2">
            {(Object.keys(PANELS) as Panel[]).map((id) => {
              const C = PANELS[id].component;
              return (
                <TabsContent key={id} value={id}>
                  <C />
                </TabsContent>
              );
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </Tabs>
    </div>
  );
}
