// src/lib/models/normalize.ts
// Model-adapter normalization (docs/architecture.md §6): faceplates author key
// legends EXACTLY as printed on the real machine (hp/layouts/*.md); the engine
// speaks one canonical id per operation. This table maps print → id at
// dispatch time so legends never bend to the engine and vice versa. Only
// UNAMBIGUOUS spellings belong here — a string whose meaning differs across
// models (e.g. "STK": clear-stack on the HP-25, print-stack on the HP-67)
// must stay unmapped (inert) rather than guess. Pure data, no React.

const ALIAS: Record<string, string> = {
  // entry / clear
  "ENTER↑": "ENTER",
  CLX: "CLx",
  "CL X": "CLx",
  "CL x": "CLx",
  CLEAR: "CLR",
  "·": "•",
  "+/−": "CHS",
  // last-x spellings across eras
  "LAST x": "LSTx",
  "LAST X": "LSTx",
  "LST X": "LSTx",
  "LST x": "LSTx",
  // lowercase legends (Woodstock era prints lowercase trig/logs)
  ln: "LN",
  log: "LOG",
  sin: "SIN",
  cos: "COS",
  tan: "TAN",
  "sin⁻¹": "SIN⁻¹",
  "cos⁻¹": "COS⁻¹",
  "tan⁻¹": "TAN⁻¹",
  // caret spellings (as some layout tables print them)
  "e^x": "eˣ",
  "10^x": "10ˣ",
  "y^x": "yˣ",
  "x^y": "yˣ", // the HP-35 prints the power key as x^y
  "x^2": "x²",
  // factorial / percent-change spellings
  "n!": "x!",
  "N!": "x!",
  "%CH": "Δ%",
  "%CHG": "Δ%",
  // 42S/35s/Prime spellings
  ASIN: "SIN⁻¹",
  ACOS: "COS⁻¹",
  ATAN: "TAN⁻¹",
  "x√y": "ˣ√y",
  INTG: "INT",
  "→RAD": "D→R",
  "→DEG": "R→D",
  LASTx: "LSTx",
  "|x|": "ABS",
};

/** Canonical engine id for a printed key legend (identity when unmapped). */
export function normalizeFn(printed: string): string {
  return ALIAS[printed] ?? printed;
}

/**
 * HP-65 `f⁻¹` prefix: the inverse of each gold-shifted function (manual p.4 —
 * "f⁻¹ SIN = SIN⁻¹"). Identity-inverse keys map to themselves; anything not
 * listed falls back to the gold function itself (harmless — the engine
 * no-ops unimplemented ids).
 */
export const INVERSE_OF: Record<string, string> = {
  "1/x": "1/x",
  "x⇄y": "x⇄y",
  "√x": "x²",
  "x²": "√x",
  "yˣ": "ˣ√y",
  "R↓": "R↑",
  "R↑": "R↓",
  SIN: "SIN⁻¹",
  COS: "COS⁻¹",
  TAN: "TAN⁻¹",
  sin: "sin⁻¹",
  cos: "cos⁻¹",
  tan: "tan⁻¹",
  LN: "eˣ",
  LOG: "10ˣ",
  ln: "eˣ",
  log: "10ˣ",
  INT: "FRAC",
  "→R": "→P",
  "→P": "→R",
};
