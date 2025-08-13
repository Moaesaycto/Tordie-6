import { createContext, useContext, useRef, useCallback, type ReactNode, useState, useEffect } from 'react';
import Konva from 'konva';
import config from "@/tordie.config.json";
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from "@tauri-apps/api/window";

type DocumentCtx = {
  stage: React.RefObject<Konva.Stage | null>;
  title: string;
  setTitle: (title: string) => void;
  setStage: (stage: Konva.Stage | null) => void;
  dirty: boolean;
  markDirty: () => void;
  markClean: () => void;
};

const DocumentProviderContext = createContext<DocumentCtx | undefined>(undefined);

export function DocumentProvider({ children }: { children?: ReactNode }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const setStage = useCallback((stage: Konva.Stage | null) => { stageRef.current = stage; }, []);
  const [title, _setTitle] = useState<string>(config.document.default_name);

  const [dirty, setDirty] = useState(false);
  const markDirty = useCallback(() => setDirty(true), []);
  const markClean = useCallback(() => setDirty(false), []);
  const setTitle = useCallback((t: string) => {
    _setTitle(t);
    setDirty(true);
  }, []);

  // TODO: Prevent reloading when dirty
  /* useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]); */

  // Updating project name
  useEffect(() => {
    invoke("update_project_name", { newName: title })
      .then(() => console.log("Command sent"))
      .catch(err => console.error("Failed to send command", err));
  }, [title]);

  // Changing window title when title changes or is dirty
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
