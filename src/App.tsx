import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "@/components/main/header";
import Footer from "@/components/main/footer";
import Canvas from "@/Canvas";
import { Controller } from "@/components/controller/controller";
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from "react";


function App() {
  const [projectName, setProjectName] = useState<string>("New Project")

useEffect(() => {
  invoke("update_project_name", { newName: projectName });
}, [projectName]);

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto] font-mono overflow-hidden" >
      <Header />

      <main className="flex h-full flex-col overflow-hidden min-h-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 overflow-hidden h-full min-h-0"
        >
          <ResizablePanel
            defaultSize={70}
            minSize={30}
            className="h-full"
          >
            <Canvas />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            id="controller-home"
            defaultSize={30}
            minSize={20}
            className="h-full flex flex-col min-h-0"
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