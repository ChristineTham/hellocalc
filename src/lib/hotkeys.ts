// src/lib/hotkeys.ts
// Physical-keyboard map (docs/responsive-layout.md §12.2, FR-UI-2). Pure data:
// a KeyboardEvent.key resolves to a faceplate target — either aria-label
// candidates (key legends) or a data-kind (RPL shift keys share glyphs with
// the cursor keys, so labels are ambiguous there). The hook dispatches by
// CLICKING the matched on-screen key: the literal same model-adapter path as
// a pointer press, so behaviour can never diverge and new models get typing
// for free. No React/DOM here — unit-testable.

import type { Family } from "@/components/calculator/models";

export type HotkeyTarget =
  | { type: "key"; labels: readonly string[] }
  | { type: "kind"; kind: string };

const DIGITS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

/** Resolve an event key to a faceplate target for the given family. */
export function hotkeyTarget(key: string, family: Family): HotkeyTarget | null {
  if (DIGITS.has(key)) return { type: "key", labels: [key] };
  switch (key) {
    case ".":
    case ",":
      return { type: "key", labels: [".", "•", "·"] };
    case "+":
      return { type: "key", labels: ["+"] };
    case "-":
      return { type: "key", labels: ["−", "-"] };
    case "*":
      return { type: "key", labels: ["×"] };
    case "/":
      return { type: "key", labels: ["÷"] };
    case "Enter":
      return { type: "key", labels: ["ENTER", "ENTER↑"] };
    case "Backspace":
      return family === "rpl"
        ? { type: "kind", kind: "bksp" }
        : { type: "key", labels: ["CLx", "CLX", "CL X"] }; // era spellings
    case "e":
    case "E":
      return { type: "key", labels: ["EEX"] };
    case "n":
    case "N":
      return family === "rpl"
        ? { type: "key", labels: ["+/−"] }
        : { type: "key", labels: ["CHS"] };
    case "x":
    case "X":
      return family === "rpl" ? null : { type: "key", labels: ["x⇄y"] };
    case "r":
    case "R":
      return family === "rpl" ? null : { type: "key", labels: ["R↓"] };
    // prefix arming — the delightful ones (§12.2). Classic-era models carry
    // f (45+), g (25+) and h (67); models without the key simply have no
    // matching button, so the dispatch no-ops (the HP-35 stays inert).
    case "f":
      return family !== "rpl" ? { type: "key", labels: ["f"] } : null;
    case "g":
      return family !== "rpl" ? { type: "key", labels: ["g"] } : null;
    case "h":
      return family === "classic" ? { type: "key", labels: ["h"] } : null;
    case "[":
      return family === "rpl" ? { type: "kind", kind: "ls" } : null;
    case "]":
      return family === "rpl" ? { type: "kind", kind: "rs" } : null;
    default:
      return null;
  }
}

export interface CheatsheetRow {
  keys: string;
  action: string;
}

/** Rows for the `?` cheat-sheet — generated from the same map's semantics. */
export function cheatsheetRows(family: Family): CheatsheetRow[] {
  const rows: CheatsheetRow[] = [
    { keys: "0–9 · .", action: "digits / decimal point" },
    { keys: "+ − * /", action: "arithmetic" },
    { keys: "Enter", action: family === "classic" ? "ENTER↑" : "ENTER" },
    { keys: "Backspace", action: family === "rpl" ? "DROP" : "CLx" },
    { keys: "E", action: "EEX (exponent)" },
    { keys: "N", action: family === "rpl" ? "+/− (negate)" : "CHS (negate)" },
  ];
  if (family !== "rpl") {
    rows.push({ keys: "X", action: "x⇄y (swap)" }, { keys: "R", action: "R↓ (roll down)" });
  }
  if (family === "voyager") {
    rows.push({ keys: "F / G", action: "arm the gold f / blue g prefix" });
  }
  if (family === "classic") {
    rows.push({ keys: "F / G / H", action: "arm a shift prefix (models that have one)" });
  }
  if (family === "rpl") {
    rows.push({ keys: "[ / ]", action: "arm left (purple) / right (green) shift" });
  }
  rows.push(
    { keys: "Esc", action: "disarm prefix · close panel" },
    { keys: "⌘K / Ctrl+K", action: "model picker" },
    { keys: "?", action: "this cheat-sheet" },
  );
  return rows;
}
