import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "@/components/main/header";
import Footer from "@/components/main/footer";
import Canvas from "@/components/canvas/Canvas";
import { ControlPanel } from "@/components/controlpanel/ControlPanel";
import { invoke } from '@tauri-apps/api/core';
import Sidebar from "@/components/main/sidebar/Sidebar";

invoke("test_command");

function App() {

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto] font-mono overflow-hidden" >
      <Header />

      <main className="flex h-full flex-row overflow-hidden min-h-0">
        <Sidebar />
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
            className="flex flex-col min-h-0 h-dvh"
          >
            <ControlPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Footer />
    </div >
  );
}

export default App;