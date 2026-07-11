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
  // HP-45 mapping prints the gold digit constants/LAST-x as composites
  "7→cm/in": "cm/in",
  "8→kg/lb": "kg/lb",
  "9→ltr/gal": "ltr/gal",
  "0→LAST x": "LSTx",
  "R→P": "→P", // HP-65 prints rect→polar this way
  "P→R": "→R",
  "x≷y": "x⇄y", // HP-41 print
  "FS?": "F?",
  // HP-25 parenthetical prints + hour-angle spellings (same math as D.MS)
  "x̄ (mean)": "x̄",
  "s (std dev)": "s",
  "% (percent)": "%",
  "→H.MS": "→D.MS",
  "→H": "D.MS→",
  "H.MS→": "D.MS→",
  "H.MS+": "D.MS+",
  // 97 conditional spellings carry a question mark
  "x=y?": "x=y",
  "x≠y?": "x≠y",
  "x≤y?": "x≤y",
  "x>y?": "x>y",
  "x=0?": "x=0",
  "x≠0?": "x≠0",
  "x<0?": "x<0",
  "x>0?": "x>0",
  // 97 flag spellings; the 67's print-x pauses (a tape line here)
  STF: "SF",
  CLF: "CF",
  "−x−": "PRINT x",
  "CL PRGM": "CLEAR PRGM",
  "CL REG": "CLEAR REG",
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

/**
 * Per-MODEL dispatch overrides for prints whose meaning differs across
 * machines and therefore must NOT get a global alias (the "STK" rule above).
 * The faceplate data mirrors these via per-key `fFn`/`gFn`/`hFn` fields —
 * adapter.test.ts guards that the two stay in sync.
 */
export const MODEL_FN_OVERRIDES: Record<string, Record<string, string>> = {
  "HP-25": {
    PRGM: "CLEAR PRGM", // the f-row under the 25's CLEAR bracket
    REG: "CLEAR REG",
    STK: "CLEAR STK",
  },
  "HP-67": {
    DSZ: "DSZ I", // the 67/97 count on the I register (the 65 uses R8)
    ISZ: "ISZ I",
    REG: "REVIEW REG", // h-3: review registers → printed to the tape
    STK: "PRINT STACK", // g of R/S (97-compatible print command)
    SPACE: "PRINT SPACE",
  },
  "HP-97": {
    DSZ: "DSZ I",
    ISZ: "ISZ I",
    I: "RC I", // the desk unit's dedicated I key recalls the index register
  },
};
