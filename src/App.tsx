import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function App() {
  return (
    <div className="h-screen w-screen bg-[var(--bg)] text-[var(--text)] font-mono">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel: Canvas Area */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full w-full p-4 border-r border-[var(--border)]">
            <div className="canvas-frame">
              [ Canvas Area ]
            </div>
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel: Controls */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full p-4">
            <h2 className="text-lg mb-4 font-semibold">Controls</h2>
            <div className="mb-4">
              <label htmlFor="input" className="block mb-1">
                Input
              </label>
              <input
                id="input"
                type="number"
                placeholder="e.g. 3.14"
                className="w-full"
              />
            </div>
            <button className="w-full">Apply</button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
