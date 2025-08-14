import { createContext, useContext, useRef } from "react";
import { Diagram } from "@domain/Diagram/Diagram";

const DiagramCtx = createContext<Diagram | null>(null);

export function DiagramProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<Diagram | null>(null);
  if (!ref.current) ref.current = new Diagram();      // construct once, stable identity
  return <DiagramCtx.Provider value={ref.current}>{children}</DiagramCtx.Provider>;
}

export function useDiagram() {
  const s = useContext(DiagramCtx);
  if (!s) throw new Error("useDiagram must be used within a DiagramProvider");
  return s;
}
