// src/services/load.ts
import { open as openDialog, confirm as confirmDialog } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import Config from "@/tordie.config.json";
import { UUID } from "@/types";
import { useDocument } from "@/components/document-provider";

/** Must match what you persist in save.ts */
export type SaveDoc = {
  version: string;
  documentUUID: UUID;
  backgroundColor: string;
  items: any[]; // extend when you wire items
};

/* ---------- IPC wrappers ---------- */

async function loadTd6(path: string): Promise<SaveDoc> {
  console.log("[loadTd6] ←", path);
  return (await invoke("td6_load", { path })) as SaveDoc;
}

/* ---------- helpers ---------- */

const MAJOR = (() => {
  const v = Config.application.version ?? "1.0.0";
  return Number.parseInt(String(v).split(".")[0] || "1", 10) || 1;
})();
const schemaMajor = (ver?: string) =>
  Number.parseInt((ver ?? "1").split(".")[0] || "1", 10) || 1;

const keyFor = (uuid: UUID) => `tordie:lastPath:${uuid}`;
const rememberPath = (uuid: UUID, path: string) => {
  console.log("[rememberPath] uuid:", uuid, "→", path);
  localStorage.setItem(keyFor(uuid), path);
};

const basenameNoExt = (p: string) => {
  const base = p.replace(/\\/g, "/").split("/").pop() ?? "Untitled";
  return base.replace(/\.td6$/i, "");
};

/** File picker for .td6; returns path or undefined when cancelled. */
async function pickTd6Path(): Promise<string | undefined> {
  console.log("[pickTd6Path] opening file dialog…");
  const chosen = await openDialog({
    multiple: false,
    directory: false,
    filters: [{ name: "Tordie", extensions: ["td6"] }],
  });
  const path = Array.isArray(chosen) ? chosen[0] : chosen ?? undefined;
  console.log("[pickTd6Path] chosen:", path);
  return path;
}

/** Confirm with Tauri permission fallback. */
async function confirmProceed(message: string, title = "Confirm"): Promise<boolean> {
  try {
    return await confirmDialog(message, { title });
  } catch (e) {
    console.warn("[confirmProceed] dialog.confirm not allowed; window.confirm fallback", e);
    return window.confirm(message);
  }
}

/* ---------- Public hook: prompts and hydrates context ---------- */

export function useLoad() {
  const {
    setTitle,
    setDocumentUUID,
    setBackgroundColor,
    backgroundLocked,
    setBackgroundLocked,
    markClean,
  } = useDocument();

  /**
   * Prompts user to pick a .td6 file, loads it, hydrates context, and
   * remembers the path for silent saves. Returns the loaded doc or undefined.
   */
  const load = async (): Promise<SaveDoc | undefined> => {
    console.log("[useLoad.load] start");

    const path = await pickTd6Path();
    if (!path) {
      console.log("[useLoad.load] cancelled");
      return undefined;
    }

    const doc = await loadTd6(path);

    // Version guard
    const fileMajor = schemaMajor(doc.version);
    console.log("[useLoad.load] fileMajor:", fileMajor, "appMajor:", MAJOR);
    if (fileMajor !== MAJOR) {
      const proceed = await confirmProceed(
        `This file was created with schema v${fileMajor}.x, but this app is v${MAJOR}.x.\n` +
          `Loading may be lossy or unsupported. Continue?`,
        "Schema version mismatch"
      );
      if (!proceed) {
        console.log("[useLoad.load] user declined load due to schema mismatch");
        return undefined;
      }
    }

    // Hydrate context
    const newTitle = basenameNoExt(path);
    console.log("[useLoad.load] hydrating → title:", newTitle, "uuid:", doc.documentUUID);

    // Ensure we can set background even if locked; restore lock after.
    const wasLocked = backgroundLocked;
    if (wasLocked) setBackgroundLocked(false);
    try {
      setTitle(newTitle);
      setDocumentUUID(doc.documentUUID);
      setBackgroundColor(doc.backgroundColor);
      // TODO: hydrate items here when you wire them
      markClean();
    } finally {
      if (wasLocked) setBackgroundLocked(true);
    }

    // Remember path for this UUID so Save() can be silent
    rememberPath(doc.documentUUID, path);

    console.log("[useLoad.load] done");
    return doc;
  };

  return { load };
}

/* ---------- Non-hook utility: load a specific path and hydrate ---------- */
/** Use when you already have a path (e.g., recent files list). */
export function useLoadAtPath() {
  const {
    setTitle,
    setDocumentUUID,
    setBackgroundColor,
    backgroundLocked,
    setBackgroundLocked,
    markClean,
  } = useDocument();

  const loadAtPath = async (path: string): Promise<SaveDoc> => {
    console.log("[useLoad.loadAtPath] start →", path);
    const doc = await loadTd6(path);

    const fileMajor = schemaMajor(doc.version);
    if (fileMajor !== MAJOR) {
      const proceed = await confirmProceed(
        `This file was created with schema v${fileMajor}.x, but this app is v${MAJOR}.x.\n` +
          `Loading may be lossy or unsupported. Continue?`,
        "Schema version mismatch"
      );
      if (!proceed) throw new Error("Load aborted due to schema mismatch");
    }

    const newTitle = basenameNoExt(path);
    const wasLocked = backgroundLocked;
    if (wasLocked) setBackgroundLocked(false);
    try {
      setTitle(newTitle);
      setDocumentUUID(doc.documentUUID);
      setBackgroundColor(doc.backgroundColor);
      markClean();
    } finally {
      if (wasLocked) setBackgroundLocked(true);
    }

    rememberPath(doc.documentUUID, path);
    console.log("[useLoad.loadAtPath] done");
    return doc;
  };

  return { loadAtPath };
}
