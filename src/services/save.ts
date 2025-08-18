import { useMemo } from "react";
import { useDocument } from "@/components/document-provider";
import { save as saveDialog, confirm as confirmDialog } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import Config from "@/tordie.config.json";
import { SaveDoc, UUID } from "@/types";


async function saveTd6(path: string, doc: SaveDoc) {
  const major = Number.parseInt(doc.version.split(".")[0] ?? "1", 10) || 1;
  await invoke("td6_save", { path, schemaMajor: major, doc });
}

async function loadTd6(path: string): Promise<SaveDoc> {
  return (await invoke("td6_load", { path })) as SaveDoc;
}

const keyFor = (uuid: UUID) => `tordie:lastPath:${uuid}`;
const safeFilename = (s: string) => (s || "Untitled").replace(/[\\/:*?"<>|]/g, "_").trim();
const ensureTd6 = (p: string) => (p.toLowerCase().endsWith(".td6") ? p : `${p}.td6`);

const readRemembered = (uuid: UUID): string | undefined => {
  const k = keyFor(uuid);
  const v = localStorage.getItem(k) ?? undefined;
  return v;
};

const remember = (uuid: UUID, path: string) => {
  localStorage.setItem(keyFor(uuid), path);
};

const forget = (uuid: UUID) => {
  localStorage.removeItem(keyFor(uuid));
};

async function sameUuidOnDisk(path: string, uuid: UUID) {
  try {
    const existing = await loadTd6(path);
    return existing?.documentUUID === uuid;
  } catch (err) {
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
    const chosen = await saveDialog({
      defaultPath: `${safeFilename(title)}.td6`,
      filters: [{ name: "Tordie", extensions: ["td6"] }],
    });
    return chosen ? ensureTd6(chosen) : undefined;
  };

  const save = async () => {
    const doc = buildDoc();
    const rememberedPath = readRemembered(doc.documentUUID);

    if (rememberedPath) {
      const ok = await sameUuidOnDisk(rememberedPath, doc.documentUUID);
      if (ok) {
        await saveTd6(rememberedPath, doc);
        markClean();
        return;
      }
      forget(doc.documentUUID);
    }

    await saveAs();
  };

  const saveAs = async () => {
    const doc = buildDoc();
    const path = await promptForPath();
    if (!path) {
      return;
    }

    // Pre-remember for this exact UUID so the next Save can be silent.
    remember(doc.documentUUID, path);

    const same = await sameUuidOnDisk(path, doc.documentUUID);

    if (!same) {
      let proceed = true;
      try {
        proceed = await confirmDialog(
          "The selected file looks like a different document (UUID mismatch). Overwrite it?",
          { title: "Overwrite confirmation" }
        );
      } catch (e) {
        proceed = window.confirm(
          "The selected file looks like a different document (UUID mismatch). Overwrite it?"
        );
      }
      if (!proceed) {
        forget(doc.documentUUID);
        return;
      }
    }

    try {
      await saveTd6(path, doc);
      markClean();
    } catch (e) {
      forget(doc.documentUUID);
      throw e;
    }
  };

  return { save, saveAs };
}

export default useSave;
