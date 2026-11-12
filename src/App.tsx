import { GraphCanvas } from "./components/GraphCanvas.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { ThoughtPanel } from "./components/ThoughtPanel.tsx";
import { ThoughtProvider } from "./state/ThoughtProvider.tsx";

export default function App() {
  return (
    <ThoughtProvider>
      <div className="flex h-full min-h-0 overflow-hidden bg-zinc-950 text-zinc-200">
        <Sidebar />
        <GraphCanvas />
        <ThoughtPanel />
      </div>
    </ThoughtProvider>
  );
}
