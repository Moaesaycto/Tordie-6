import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "@/components/main/header";
import Footer from "@/components/main/footer";
import Canvas from "@/components/canvas/canvas";
import { Controller } from "./components/controller/controller";
import { useEffect, useState } from "react";

function App() {
  const [controllerHeight, setControllerHeight] = useState<number>(0)

  useEffect(() => {
    const updateHeight = () => {
      const headerElement = document.querySelector("header");
      const footerElement = document.querySelector("footer");
      const headerHeight = headerElement ? headerElement.clientHeight : 0;
      const footerHeight = footerElement ? footerElement.clientHeight : 0;
      setControllerHeight(window.innerHeight - headerHeight - footerHeight);
    };

    // Initial run
    updateHeight();

    // Window resize
    window.addEventListener("resize", updateHeight);

    // ResizeObserver for header/footer
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const observer = new ResizeObserver(updateHeight);
    if (header) observer.observe(header);
    if (footer) observer.observe(footer);

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-mono">
      <Header />

      <main className="flex-1 flex flex-col h-0">
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-0">
          <ResizablePanel defaultSize={70} minSize={30}>
            <Canvas />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel
            defaultSize={30}
            minSize={20}
            id="controller-home"
            className="flex flex-col"
            style={{ height: controllerHeight }}
          >
            <Controller />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <Footer />
    </div>
  );
}

export default App;
