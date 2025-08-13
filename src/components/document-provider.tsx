import { createContext, useContext, useRef, useCallback, type ReactNode, useState, useEffect } from 'react';
import Konva from 'konva';
import config from "@/tordie.config.json";
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from "@tauri-apps/api/window";

type ToolsRefs = {
  layerRef: React.RefObject<Konva.Layer | null>;
  selRef: React.RefObject<Konva.Rect | null>;
  trRef: React.RefObject<Konva.Transformer | null>;
};

type DocumentCtx = {
  // stage
  stage: React.RefObject<Konva.Stage | null>;
  setStage: (stage: Konva.Stage | null) => void;

  // tools (selection UI etc.)
  tools: ToolsRefs;

  // doc meta
  title: string;
  setTitle: (title: string) => void;
  dirty: boolean;
  markDirty: () => void;
  markClean: () => void;
};

const DocumentProviderContext = createContext<DocumentCtx | undefined>(undefined);

export function DocumentProvider({ children }: { children?: ReactNode }) {
  // stage ref
  const stageRef = useRef<Konva.Stage | null>(null);
  const setStage = useCallback((stage: Konva.Stage | null) => { stageRef.current = stage; }, []);

  // tool refs (shared across app)
  const layerRef = useRef<Konva.Layer | null>(null);
  const selRef = useRef<Konva.Rect | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  // title/dirty
  const [title, _setTitle] = useState<string>(config.document.default_name);
  const [dirty, setDirty] = useState(false);
  const markDirty = useCallback(() => setDirty(true), []);
  const markClean = useCallback(() => setDirty(false), []);
  const setTitle = useCallback((t: string) => { _setTitle(t); setDirty(true); }, []);

  // notify backend (Tauri) on title change
  useEffect(() => {
    invoke("update_project_name", { newName: title })
      .catch(err => console.error("Failed to send command", err));
  }, [title]);

  // window title
  useEffect(() => {
    (async () => {
      try {
        const win = getCurrentWindow();
        await win.setTitle(`Tordie 6 | ${title}${dirty ? " *" : ""}`);
      } catch (err) {
        console.error("setTitle failed (likely missing capability or not in Tauri):", err);
      }
    })();
  }, [title, dirty]);

  return (
    <DocumentProviderContext.Provider
      value={{
        stage: stageRef,
        setStage,
        tools: { layerRef, selRef, trRef },
        title,
        setTitle,
        dirty,
        markDirty,
        markClean,
      }}
    >
      {children}
    </DocumentProviderContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentProviderContext);
  if (!ctx) throw new Error('useDocument must be used inside DocumentProvider');
  return ctx;
}
