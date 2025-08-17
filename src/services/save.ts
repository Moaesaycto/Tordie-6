import { useMemo } from "react";
import { useDocument } from "@/components/document-provider";
import { save as saveDialog, confirm as confirmDialog } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import Config from "@/tordie.config.json";
import { UUID } from "@/types";

type SaveDoc = {
  version: string;
  documentUUID: UUID;
  backgroundColor: string;
  items: any[]; // TODO: serialise your items
};

async function saveTd6(path: string, doc: SaveDoc) {
  console.log("[saveTd6] →", path, "uuid:", doc.documentUUID);
  const major = Number.parseInt(doc.version.split(".")[0] ?? "1", 10) || 1;
  await invoke("td6_save", { path, schemaMajor: major, doc });
}

async function loadTd6(path: string): Promise<SaveDoc> {
  console.log("[loadTd6] ←", path);
  return (await invoke("td6_load", { path })) as SaveDoc;
}

const keyFor = (uuid: UUID) => `tordie:lastPath:${uuid}`;
const safeFilename = (s: string) => (s || "Untitled").replace(/[\\/:*?"<>|]/g, "_").trim();
const ensureTd6 = (p: string) => (p.toLowerCase().endsWith(".td6") ? p : `${p}.td6`);

const readRemembered = (uuid: UUID): string | undefined => {
  const k = keyFor(uuid);
  const v = localStorage.getItem(k) ?? undefined;
  console.log("[readRemembered]", k, "→", v);
  return v;
};

const remember = (uuid: UUID, path: string) => {
  console.log("[remember] uuid:", uuid, "→", path);
  localStorage.setItem(keyFor(uuid), path);
};

const forget = (uuid: UUID) => {
  console.log("[forget] uuid:", uuid);
  localStorage.removeItem(keyFor(uuid));
};

async function sameUuidOnDisk(path: string, uuid: UUID) {
  try {
    const existing = await loadTd6(path);
    console.log("[sameUuidOnDisk] file:", existing?.documentUUID, "expected:", uuid);
    return existing?.documentUUID === uuid;
  } catch (err) {
    console.warn("[sameUuidOnDisk] load failed → false", err);
    return false;
  }
}

export function useSave() {
  const { title, backgroundColor, documentUUID, markClean } = useDocument();
  const { version } = Config.application;

  const buildDoc = useMemo(
    () => (): SaveDoc => ({
      version,
      documentUUID,
      backgroundColor,
      items: [], // TODO: real items
    }),
    [version, documentUUID, backgroundColor]
  );

  const promptForPath = async () => {
    console.log("[promptForPath] opening dialog…");
    const chosen = await saveDialog({
      defaultPath: `${safeFilename(title)}.td6`,
      filters: [{ name: "Tordie", extensions: ["td6"] }],
    });
    console.log("[promptForPath] chosen:", chosen);
    return chosen ? ensureTd6(chosen) : undefined;
  };

  const save = async () => {
    console.log("[save] start");
    const doc = buildDoc();
    const rememberedPath = readRemembered(doc.documentUUID);

    if (rememberedPath) {
      const ok = await sameUuidOnDisk(rememberedPath, doc.documentUUID);
      if (ok) {
        console.log("[save] silent →", rememberedPath);
        await saveTd6(rememberedPath, doc);
        markClean();
        return;
      }
      console.warn("[save] remembered mismatch → forget & Save As");
      forget(doc.documentUUID);
    }

    await saveAs();
  };

  const saveAs = async () => {
    console.log("[saveAs] start");
    const doc = buildDoc();
    console.log("[saveAs] uuid:", doc.documentUUID, "version:", doc.version);

    const path = await promptForPath();
    if (!path) {
      console.log("[saveAs] cancelled");
      return;
    }

    // Pre-remember for this exact UUID so the next Save can be silent.
    console.log("[saveAs] pre-remember", path);
    remember(doc.documentUUID, path);

    const same = await sameUuidOnDisk(path, doc.documentUUID);
    console.log("[saveAs] uuid check:", same ? "MATCH" : "MISMATCH");

    if (!same) {
      let proceed = true;
      try {
        proceed = await confirmDialog(
          "The selected file looks like a different document (UUID mismatch). Overwrite it?",
          { title: "Overwrite confirmation" }
        );
      } catch (e) {
        console.warn("[saveAs] dialog.confirm not allowed → window.confirm fallback", e);
        proceed = window.confirm(
          "The selected file looks like a different document (UUID mismatch). Overwrite it?"
        );
      }
      if (!proceed) {
        console.log("[saveAs] overwrite declined → forget");
        forget(doc.documentUUID);
        return;
      }
    }

    try {
      console.log("[saveAs] saving →", path);
      await saveTd6(path, doc);
      console.log("[saveAs] done");
      markClean();
    } catch (e) {
      console.warn("[saveAs] failed → forget", e);
      forget(doc.documentUUID);
      throw e;
    }
  };

  return { save, saveAs };
}

export default useSave;
