import { createContext, useContext, useRef, useCallback, type ReactNode, useState, useEffect } from "react";
import Konva from "konva";
import config from "@/tordie.config.json";
import { ToOrigin } from "@/components/viewport/ToOriginButton";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTheme } from "@/components/theme-provider";
import Config from "@/tordie.config.json";
import { UUID } from "@/types";
import { v4 as uuidv4 } from "uuid";

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

  // background colour
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  backgroundLocked: boolean;
  setBackgroundLocked: (v: boolean | ((p: boolean) => boolean)) => void;

  // doc meta
  title: string;
  setTitle: (title: string) => void;
  documentUUID: UUID;
  setDocumentUUID: (uuid: UUID) => void;
  dirty: boolean;
  markDirty: () => void;
  markClean: () => void;

  // actions
  resetDocument: () => void; // “New”
};

const DocumentProviderContext = createContext<DocumentCtx | undefined>(undefined);

export function DocumentProvider({ children }: { children?: ReactNode }) {
  // stage ref
  const stageRef = useRef<Konva.Stage | null>(null);
  const setStage = useCallback((stage: Konva.Stage | null) => {
    stageRef.current = stage;
  }, []);

  // tool refs (shared across app)
  const layerRef = useRef<Konva.Layer | null>(null);
  const selRef = useRef<Konva.Rect | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  // title/dirty
  const [title, _setTitle] = useState<string>(config.document.default_name);
  const [documentUUID, setDocumentUUID] = useState<UUID>(uuidv4() as UUID);
  const [dirty, setDirty] = useState(false);
  const markDirty = useCallback(() => setDirty(true), []);
  const markClean = useCallback(() => setDirty(false), []);
  const setTitle = useCallback((t: string) => {
    _setTitle(t);
    setDirty(true);
  }, []);

  // theme
  const { resolvedTheme } = useTheme();

  // background colour + lock
  const [backgroundLocked, setBackgroundLocked] = useState(false);
  const [backgroundColor, __setBackgroundColor] = useState<string>("#ffffff");

  // public setter gated by lock
  const setBackgroundColor = useCallback(
    (c: string) => {
      if (backgroundLocked) return;
      __setBackgroundColor(c);
      setDirty(true);
    },
    [backgroundLocked]
  );


  // sync theme -> background unless locked
  useEffect(() => {
    if (!backgroundLocked) {
      __setBackgroundColor(
        resolvedTheme === "light"
          ? Config.document.default_light_background
          : Config.document.default_dark_background
      );
    }
  }, [resolvedTheme, backgroundLocked]);

  // notify backend (Tauri) on title change
  useEffect(() => {
    invoke("update_project_name", { newName: title }).catch((err) =>
      console.error("Failed to send command", err)
    );
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

  // reset to a fresh document
  const resetDocument = useCallback(() => {
    // Clear canvas content if you want a true fresh slate
    try {
      const stage = stageRef.current;
      if (stage) {
        // Optional: wipe all layers; keep refs valid
        stage.find("Layer").forEach((n) => n.destroy());
        stage.draw();
      }
    } catch (e) {
      console.warn("resetDocument: failed to clear stage (ignored):", e);
    }

    // Fresh UUID and metadata
    setDocumentUUID(uuidv4() as UUID);
    _setTitle(config.document.default_name);

    // Temporarily unlock to force default background, then restore lock
    const wasLocked = backgroundLocked;
    if (wasLocked) setBackgroundLocked(false);
    __setBackgroundColor(
      resolvedTheme === "light"
        ? Config.document.default_light_background
        : Config.document.default_dark_background
    );
    if (wasLocked) setBackgroundLocked(true);

    // Clean state
    setDirty(false);

    ToOrigin();
  }, [backgroundLocked, resolvedTheme]);

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
        backgroundColor,
        setBackgroundColor,
        backgroundLocked,
        setBackgroundLocked,
        documentUUID,
        setDocumentUUID,
        resetDocument,
      }}
    >
      {children}
    </DocumentProviderContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentProviderContext);
  if (!ctx) throw new Error("useDocument must be used inside DocumentProvider");
  return ctx;
}
