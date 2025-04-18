import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Header from "./components/main/header";

function App() {
  return (
    <div className="h-screen w-screen bg-background text-foreground font-mono">
      <Header />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel: Canvas Area */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full w-full p-4 border-r border-border">
            <div className="canvas-frame bg-muted text-muted-foreground border border-border rounded">
              [ Canvas Area ]
            </div>
          </div>
        </ResizablePanel>

        {/* Handle */}
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
    </div>
  );
}

export default App;
