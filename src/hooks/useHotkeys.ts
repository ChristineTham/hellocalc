// src/hooks/useHotkeys.ts
// Global physical-keyboard layer (docs/responsive-layout.md §12.2, FR-UI-2).
// Dispatches by clicking the matching on-screen key (same path as a pointer
// press) and stamps data-pressed for ~130ms so the faceplate key visibly
// depresses — the typewriter echo. Guards: text inputs, open dialogs, armed
// RPL alpha mode, and modifier chords (except ⌘/Ctrl+K → model picker).
"use client";

import { useEffect, useRef } from "react";
import { hotkeyTarget, type HotkeyTarget } from "@/lib/hotkeys";
import type { Family } from "@/components/calculator/models";

export interface HotkeysOptions {
  family: Family;
  /** current armed prefix ("none" when idle) — Escape disarms it first */
  prefix: string;
  /** toggle the armed prefix off (arm() toggles, so re-arm the current one) */
  disarm: () => void;
  /** open the `?` shortcut cheat-sheet */
  openCheatsheet: () => void;
}

const PRESS_ECHO_MS = 130;

function findButton(target: HotkeyTarget): HTMLElement | null {
  const root = document.querySelector('[data-slot="machine-kbd"]');
  if (!root) return null;
  if (target.type === "kind") {
    return root.querySelector<HTMLElement>(`[data-kind="${target.kind}"]`);
  }
  for (const label of target.labels) {
    const el = root.querySelector<HTMLElement>(`button[aria-label="${label}"]`);
    if (el) return el;
  }
  return null;
}

export function useHotkeys(opts: HotkeysOptions): void {
  // refs so the document listener binds once and never goes stale; updated in
  // an effect (not during render) per react-hooks/refs — key events always
  // arrive after commit, so the listener never sees a stale value
  const ref = useRef(opts);
  useEffect(() => {
    ref.current = opts;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { family, prefix, disarm, openCheatsheet } = ref.current;
      if (e.defaultPrevented) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        t.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return; // the model-picker search box etc. keep their keystrokes
      }

      // ⌘K / Ctrl+K — model picker, from anywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const picker = document.querySelector<HTMLElement>(
          '[aria-label="Select calculator model"]',
        );
        if (picker) {
          e.preventDefault();
          picker.click();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Escape ladder (§12.2): disarm an armed prefix first; otherwise leave
      // it to Base UI (sheets/dialogs close themselves).
      if (e.key === "Escape") {
        if (prefix !== "none") {
          e.preventDefault();
          disarm();
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        openCheatsheet();
        return;
      }

      // with any dialog/sheet open, keystrokes belong to it — not the faceplate
      if (document.querySelector('[role="dialog"]')) return;

      // RPL alpha mode reserves letters for (future) alpha entry (§12.2 guard)
      if (family === "rpl" && prefix === "alpha" && /^[a-z]$/i.test(e.key)) return;

      const target = hotkeyTarget(e.key, family);
      if (!target) return;
      const btn = findButton(target);
      if (!btn) return;

      e.preventDefault();
      // press echo: the on-screen key visibly depresses (§12.2)
      btn.setAttribute("data-pressed", "");
      window.setTimeout(() => btn.removeAttribute("data-pressed"), PRESS_ECHO_MS);
      btn.click();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
