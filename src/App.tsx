import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "./components/main/header";
import Footer from "./components/main/footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen w-screen bg-background text-foreground font-mono">
      <Header />
      <main className="flex-1 flex flex-col">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 h-0"
        >
          {/* Left Panel: Canvas Area */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full w-full p-4 border-r border-border">
              <div className="canvas-frame bg-muted text-muted-foreground border border-border rounded h-full">
                [ Canvas Area ]
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: Controls */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full p-4 bg-card text-card-foreground space-y-4">
              <h2 className="text-lg font-semibold">Controls</h2>

              <div className="space-y-2">
                <label htmlFor="input" className="block text-sm font-medium">
                  Input
                </label>
                <input
                  id="input"
                  type="number"
                  placeholder="e.g. 3.14"
                  className="w-full px-2 py-1 rounded border border-input bg-background text-foreground"
                />
              </div>

              <button className="w-full px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition">
                Apply
              </button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Footer />
    </div>
  );
}

export default App;
