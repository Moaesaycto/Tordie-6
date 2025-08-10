import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import Konva from 'konva';

type DocumentCtx = {
  stage: React.RefObject<Konva.Stage | null>;
  setStage: (stage: Konva.Stage | null) => void; // note: no re-render
};

const DocumentProviderContext = createContext<DocumentCtx | undefined>(undefined);

export function DocumentProvider({ children }: { children?: ReactNode }) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const setStage = useCallback((stage: Konva.Stage | null) => { stageRef.current = stage; }, []);
  return (
    <DocumentProviderContext.Provider value={{ stage: stageRef, setStage }}>
      {children}
    </DocumentProviderContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentProviderContext);
  if (!ctx) throw new Error('useDocument must be used inside DocumentProvider');
  return ctx;
}
