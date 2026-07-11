// src/lib/engine/notebook.ts
// The native-mode notebook (P23, FR-UI-4): an ordered list of source blocks
// evaluated top-to-bottom into ONE fresh RPL engine, so later blocks see
// earlier definitions (shared scope) and re-running re-evaluates everything
// downstream — the simplest correct spreadsheet semantics. Pure TS.

import { createRpl, dispatchRpl } from "./rpl";
import { formatObj } from "./rpl/object";

export interface BlockResult {
  ok: boolean;
  /** the block's level-1 result (or its error) after evaluation */
  text: string;
}

export function evalNotebook(blocks: string[]): BlockResult[] {
  const s = createRpl();
  return blocks.map((src) => {
    const trimmed = src.trim();
    if (!trimmed) return { ok: true, text: "" };
    s.entry = trimmed;
    dispatchRpl(s, "ENTER");
    if (s.error) {
      const text = s.error;
      s.error = null;
      s.entry = null; // a bad block must not poison the next one
      return { ok: false, text };
    }
    const top = s.stack[s.stack.length - 1];
    return { ok: true, text: top ? formatObj(top, s.disp, s.base) : "" };
  });
}
