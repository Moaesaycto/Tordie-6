import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "@/components/main/header";
import Footer from "@/components/main/footer";
import Canvas from "@/Canvas";
import { Controller } from "./components/controller/controller";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

function App() {
  const [controllerHeight, setControllerHeight] = useState<number>(0);

  const headerEl = useRef<HTMLElement | null>(null);
  const footerEl = useRef<HTMLElement | null>(null);

  const recalc = useCallback(() => {
    if (!headerEl.current) headerEl.current = document.querySelector("header");
    if (!footerEl.current) footerEl.current = document.querySelector("footer");

    const headerH = headerEl.current?.getBoundingClientRect().height ?? 0;
    const footerH = footerEl.current?.getBoundingClientRect().height ?? 0;

    setControllerHeight(Math.max(window.innerHeight - headerH - footerH, 0));
  }, []);

  useLayoutEffect(() => {
    recalc();

    window.addEventListener("resize", recalc);

    const ro = new ResizeObserver(recalc);
    headerEl.current && ro.observe(headerEl.current);
    footerEl.current && ro.observe(footerEl.current);

    return () => {
      window.removeEventListener("resize", recalc);
      ro.disconnect();
    };
  }, [recalc]);

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto] font-mono overflow-hidden" >
      <Header />

      <main className="flex h-full flex-col overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          <ResizablePanel defaultSize={70} minSize={30}>
            <Canvas />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            id="controller-home"
            defaultSize={30}
            minSize={20}
            className="flex flex-col"
            style={{ height: controllerHeight }}
          >
            <Controller />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Footer />
    </div >
  );
}

export default App;
