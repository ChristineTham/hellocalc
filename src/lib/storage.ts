// src/lib/storage.ts
// Browser side of persistence (FR-STATE-1/4): the localStorage adapter and
// the export/import file helpers. Separated from src/lib/engine/persistence.ts
// so the engine stays DOM-free (architecture §3) — this module owns every
// window/document touch, all guarded for prerender.

import type { StorageAdapter } from "@/lib/engine/persistence";

export const STORAGE_KEY = "hellocalc-state";

export const localStorageAdapter: StorageAdapter = {
  load() {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null; // storage disabled (private mode etc.) — run stateless
    }
  },
  save(value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // quota/disabled — autosave silently degrades; export still works
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

/** Download the serialized state as a versioned JSON file (FR-STATE-4). */
export function downloadStateFile(json: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hellocalc-state-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read a user-picked state file back to its JSON text. */
export function readStateFile(file: File): Promise<string> {
  return file.text();
}
