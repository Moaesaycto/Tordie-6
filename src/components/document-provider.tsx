import { createContext, useContext, useRef, useCallback, type ReactNode, useState, useEffect } from 'react';
import Konva from 'konva';
import config from "@/tordie.config.json";
import { invoke } from '@tauri-apps/api/core';

type DocumentCtx = {
  stage: React.RefObject<Konva.Stage | null>;
  title: string;
  setTitle: (title: string) => void;
  setStage: (stage: Konva.Stage | null) => void;
};

const DocumentProviderContext = createContext<DocumentCtx | undefined>(undefined);

export function DocumentProvider({ children }: { children?: ReactNode }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const setStage = useCallback((stage: Konva.Stage | null) => { stageRef.current = stage; }, []);
  const [title, setTitle] = useState<string>(config.document.default_name);

  useEffect(() => {
    invoke("update_project_name", { newName: title })
      .then(() => console.log("Command sent"))
      .catch(err => console.error("Failed to send command", err));
  }, [title]);

  return (
    <DocumentProviderContext.Provider
      value={{
        stage: stageRef,
        setStage,
        title,
        setTitle,
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
