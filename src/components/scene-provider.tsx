import { createContext, useContext, useRef } from "react";
import { Scene } from "@domain/Scene/Scene";

const SceneCtx = createContext<Scene | null>(null);

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<Scene | null>(null);
  if (!ref.current) ref.current = new Scene();      // construct once, stable identity
  return <SceneCtx.Provider value={ref.current}>{children}</SceneCtx.Provider>;
}

export function useScene() {
  const s = useContext(SceneCtx);
  if (!s) throw new Error("useScene must be used within a SceneProvider");
  return s;
}
