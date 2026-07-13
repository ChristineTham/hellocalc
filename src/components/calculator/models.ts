// src/components/calculator/models.ts
// Typed per-model faceplate data for the HP-calculator design system.
//
// Voyager (HP-12C / HP-15C) key grids are GENERATED from the verified
// hp/mapping/mapping.json — see scripts/gen-models.ts -> models.generated.ts —
// so faceplate legends never drift from keystroke dispatch (PRD FR-MODEL-1/2).
// Classic (HP-35) and RPL (HP-48G) have irregular column widths / extra shift
// layers, so their rows are authored here, mirroring hp/layouts/<MODEL>.md.

import { GENERATED_VOYAGER } from "./models.generated";
import {
  computeKeyboardGeometry,
  type KeyboardGeometry,
} from "@/lib/layout/keyboardGeometry";

// "pioneer" is the MECHANICAL archetype for the menu-driven RPN machines —
// HP-42S (1988) and the moderns (HP-35s, HP Prime) ride it: row-authored keys
// with up to f/g planes + alpha letters, a dot-matrix glass, the RPN engine.
// (Catalog-facing era grouping lives in modelCatalog.ts, not here.)
export type Family = "voyager" | "classic" | "hp41" | "pioneer" | "rpl";

/** Voyager (HP-12C / HP-15C): fixed 4x10 grid, gold f / blue g, tall ENTER. */
export interface VoyagerKey {
  primary: string;
  f: string; // gold f-shift legend ("" = none)
  g: string; // blue g-shift legend ("" = none)
  col: number; // 1..10
  row: number; // 1..4
  rowSpan?: number; // ENTER spans 2
  kind: "digit" | "arith" | "enter" | "pf" | "pg" | "on" | "fin" | "std";
}

/** Classic era (HP-35/45/65/25/67): row-authored keys with 0–3 shift planes.
 * The 35 is shiftless (`arc` is a local prefix); the 45 adds gold f; the 25
 * f + blue g; the 65 f + f⁻¹ (gold inverse) + g; the 67 f + g + black h.
 * Legends are authored AS PRINTED — dispatch normalizes them to engine ids
 * (lib/models/normalize.ts). */
export interface ClassicKey {
  legend: string; // as printed
  fn: string; // engine function id (primary)
  cat: "black" | "beige" | "blue" | "gold";
  flex?: number; // column span — ENTER = 2
  hspan?: number; // row span — the HP-97's double-height `+` = 2
  f?: string; // gold f-shift legend, as printed
  g?: string; // blue g-shift legend, as printed
  h?: string; // black h-shift legend, as printed (HP-67)
  al?: string; // ALPHA character (HP-41), printed lower-right like h
  /** dispatch overrides for prints whose meaning is model-specific (e.g. the
   * 25's PRGM/REG/STK under its CLEAR bracket) — must mirror
   * MODEL_FN_OVERRIDES in lib/models/normalize.ts (guarded by adapter.test) */
  fFn?: string;
  gFn?: string;
  hFn?: string;
  kind?: "pf" | "pfi" | "pg" | "ph" | "alpha" | "gap"; // prefix/toggle keys · gap = bare plate
}

/** RPL (HP-48G): purple left-shift / green right-shift / white ALPHA. */
export interface RplKey {
  p: string; // primary
  ls: string; // left-shift (purple)
  rs: string; // right-shift (green)
  al: string; // ALPHA letter
  w?: number; // ENTER = 2
  kind:
    | "digit"
    | "arith"
    | "enter"
    | "on"
    | "ls"
    | "rs"
    | "alpha"
    | "cur"
    | "bksp"
    | "soft"
    | "gap" // bare faceplate spacer (49G/50g cursor-diamond corners) — no key
    | "std";
}

export interface ModelBase {
  id: string;
  name: string;
  sub: string; // display sub-label
  angle: boolean; // exposes DEG/RAD/GRD
  // Keyboard-block geometry (docs/responsive-layout.md §4): cols/rows/aspect
  // DERIVED from the key data via computeKeyboardGeometry — drives the
  // aspect-locked fitter (--kbd-a) and template selection (data-aspect).
  geometry: KeyboardGeometry;
  /** Per-model shift-key palette override (RPL siblings): CSS colour values
   * (theme-token var() refs) that MachineUnit sets as --color-hp-shift-*
   * on the bezel, re-theming every ls/rs surface inside. */
  shift?: { ls: string; rs: string; lsFg?: string; rsFg?: string };
  /** Per-model glass proportions (e.g. the 50g's 131×80 vs the 48's 131×64). */
  lcdAspect?: string;
  /** Desktop PRINTER models (HP-97): render the top as a deck — compact
   * display LEFT, printer paper-tape RIGHT, keyboard below (§14 desktop deck). */
  printer?: boolean;
  /* clamshell deck (HP-28C/28S): the display parks over the RIGHT keyboard
   * half of the opened book (§14.5) — drives the `data-deck="clam"` CSS */
  clam?: boolean;
  /** Physical slide switches printed above the keyboard (power / mode / trace)
   * — the classic programmables and the HP-97 desk unit (§ toggle-switch audit).
   * Decorative, in their rest positions. */
  switches?: SwitchSpec[];
}

/** One two-position slide switch printed on the faceplate. */
export interface SwitchSpec {
  caption: string;
  left: string;
  right: string;
  /** which end the nub rests at (the machine's default / powered-on state) */
  pos: "left" | "right";
  /** what the switch controls, so DeckSwitches can wire it live:
   *  power → LCD on/off · mode → PRGM/RUN program entry · trace → printer echo */
  kind: "power" | "mode" | "trace";
}

/** Shared switch presets. */
const POWER: SwitchSpec = {
  caption: "Power",
  left: "Off",
  right: "On",
  pos: "right",
  kind: "power",
};
const RUN_MODE = (left: string): SwitchSpec => ({
  caption: "Mode",
  left,
  right: "Run",
  pos: "right",
  kind: "mode",
});
export type Model =
  | (ModelBase & { family: "voyager"; keys: VoyagerKey[] })
  | (ModelBase & { family: "classic"; rows: ClassicKey[][] })
  | (ModelBase & { family: "hp41"; rows: ClassicKey[][] })
  | (ModelBase & { family: "pioneer"; rows: ClassicKey[][] })
  | (ModelBase & { family: "rpl"; rows: RplKey[][] });

/** Which annunciator lamps a model's real hardware actually has (audit fix):
 * drives the LCD annunciator row so each model lights ONLY its own lamps — no
 * phantom `g` on a single-shift machine, no BEG/END on a non-financial unit. */
export interface AnnunSet {
  f: boolean; // gold / left shift
  g: boolean; // blue / right shift
  h: boolean; // black shift (HP-67)
  alpha: boolean; // ALPHA mode (HP-41, RPL, Prime)
  begEnd: boolean; // payment-timing BEGIN (HP-12C only)
}

/** Derive the annunciator set from a model's real key data. */
export function annunSet(model: Model): AnnunSet {
  // RPL: purple/green shifts + α (no begin/end)
  if (model.family === "rpl") return { f: true, g: true, h: false, alpha: true, begEnd: false };
  // Voyagers: gold f + blue g; only the 12C is a financial (begin/end) machine
  if (model.family === "voyager")
    return { f: true, g: true, h: false, alpha: false, begEnd: model.id === "HP-12C" };
  // classic / hp41 / pioneer: read the shift planes present in the actual keys
  const keys = model.rows.flat();
  const some = (p: (k: ClassicKey) => boolean) => keys.some(p);
  return {
    f: some((k) => k.kind === "pf" || k.kind === "pfi" || Boolean(k.f)),
    g: some((k) => k.kind === "pg" || Boolean(k.g)),
    h: some((k) => k.kind === "ph" || Boolean(k.h)),
    alpha: some((k) => k.kind === "alpha" || Boolean(k.al)),
    begEnd: false,
  };
}

// ---- HP-35 (classic, red LED originally; rendered on the standard LCD) -------
const c = (
  legend: string,
  fn: string,
  cat: ClassicKey["cat"],
  flex = 1,
): ClassicKey => ({ legend, fn, cat, flex });
/** Shift-plane classic key: opts carry f/g/h legends, kind, flex. */
const ck = (
  legend: string,
  fn: string,
  cat: ClassicKey["cat"],
  opts: Partial<
    Pick<
      ClassicKey,
      "f" | "g" | "h" | "al" | "fFn" | "gFn" | "hFn" | "kind" | "flex" | "hspan"
    >
  > = {},
): ClassicKey => ({ legend, fn, cat, flex: 1, ...opts });
const HP35_ROWS: ClassicKey[][] = [
  [c("xʸ","yˣ","black"),c("log","LOG","black"),c("ln","LN","black"),c("eˣ","eˣ","black"),c("CLR","CLR","blue")],
  [c("√x","√x","black"),c("arc","arc","black"),c("sin","SIN","black"),c("cos","COS","black"),c("tan","TAN","black")],
  [c("1/x","1/x","black"),c("x⇄y","x⇄y","black"),c("R↓","R↓","black"),c("STO","STO","black"),c("RCL","RCL","black")],
  [c("ENTER↑","ENTER","blue",2),c("CHS","CHS","blue"),c("EEX","EEX","blue"),c("CLx","CLx","blue")],
  [c("−","−","blue"),c("7","7","beige"),c("8","8","beige"),c("9","9","beige")],
  [c("+","+","blue"),c("4","4","beige"),c("5","5","beige"),c("6","6","beige")],
  [c("×","×","blue"),c("1","1","beige"),c("2","2","beige"),c("3","3","beige")],
  [c("÷","÷","blue"),c("0","0","beige"),c("·","•","beige"),c("π","π","beige")],
];

// ---- HP-45 (classic + the single gold shift; hp/layouts/HP-45.md) ------------
const HP45_ROWS: ClassicKey[][] = [
  [ck("1/x","1/x","black",{f:"yˣ"}),ck("ln","LN","black",{f:"log"}),ck("eˣ","eˣ","black",{f:"10ˣ"}),ck("FIX","FIX","black",{f:"SCI"}),ck("","f","gold",{kind:"pf"})],
  [ck("x²","x²","black",{f:"√x"}),ck("→P","→P","black",{f:"→R"}),ck("SIN","SIN","black",{f:"SIN⁻¹"}),ck("COS","COS","black",{f:"COS⁻¹"}),ck("TAN","TAN","black",{f:"TAN⁻¹"})],
  [ck("x⇄y","x⇄y","black",{f:"n!"}),ck("R↓","R↓","black",{f:"x̄,s"}),ck("STO","STO n","black",{f:"→D.MS"}),ck("RCL","RCL n","black",{f:"D.MS→"}),ck("%","%","black",{f:"Δ%"})],
  [ck("ENTER↑","ENTER","blue",{flex:2,f:"DEG"}),ck("CHS","CHS","blue",{f:"RAD"}),ck("EEX","EEX","blue",{f:"GRD"}),ck("CLx","CLx","blue",{f:"CLEAR"})],
  [ck("−","−","blue"),ck("7","7","beige",{f:"cm/in"}),ck("8","8","beige",{f:"kg/lb"}),ck("9","9","beige",{f:"ltr/gal"})],
  [ck("+","+","blue"),ck("4","4","beige"),ck("5","5","beige"),ck("6","6","beige")],
  [ck("×","×","blue"),ck("1","1","beige"),ck("2","2","beige"),ck("3","3","beige")],
  [ck("÷","÷","blue"),ck("0","0","beige",{f:"LAST x"}),ck("·","•","beige",{f:"π"}),ck("Σ+","Σ+","black",{f:"Σ−"})],
];

// ---- HP-65 (classic programmable: f / f⁻¹ / g; hp/layouts/HP-65.md) ----------
const HP65_ROWS: ClassicKey[][] = [
  [ck("A","A","black",{f:"1/x"}),ck("B","B","black",{f:"√x"}),ck("C","C","black",{f:"yˣ"}),ck("D","D","black",{f:"R↓"}),ck("E","E","black",{f:"x⇄y"})],
  [ck("DSP","DSP","black",{g:"x≠y"}),ck("GTO","GTO","black",{g:"x≤y"}),ck("LBL","LBL","black",{g:"x=y"}),ck("RTN","RTN","black",{g:"x>y"}),ck("SST","SST","black")],
  [ck("f","f","gold",{kind:"pf"}),ck("f⁻¹","f⁻¹","gold",{kind:"pfi"}),ck("STO","STO","black"),ck("RCL","RCL","black"),ck("g","g","blue",{kind:"pg"})],
  [ck("ENTER↑","ENTER","blue",{flex:2,f:"PREFIX",g:"DEG"}),ck("CHS","CHS","blue",{f:"CLEAR STK",g:"RAD"}),ck("EEX","EEX","blue",{f:"CLEAR REG",g:"GRD"}),ck("CLX","CLx","blue",{f:"CLEAR PRGM",g:"DEL"})],
  [ck("−","−","blue",{f:"SF 1"}),ck("7","7","beige",{f:"LN",g:"x⇄y"}),ck("8","8","beige",{f:"LOG",g:"R↓"}),ck("9","9","beige",{f:"√x",g:"R↑"})],
  [ck("+","+","blue",{f:"TF 1"}),ck("4","4","beige",{f:"SIN",g:"1/x"}),ck("5","5","beige",{f:"COS",g:"yˣ"}),ck("6","6","beige",{f:"TAN",g:"ABS"})],
  [ck("×","×","blue",{f:"SF 2"}),ck("1","1","beige",{f:"R→P",g:"NOP"}),ck("2","2","beige",{f:"D.MS+",g:"π"}),ck("3","3","beige",{f:"→D.MS",g:"n!"})],
  [ck("÷","÷","blue",{f:"TF 2"}),ck("0","0","beige",{f:"→OCT",g:"LST X"}),ck("·","•","beige",{f:"INT",g:"DSZ"}),ck("R/S","R/S","black")],
];

// ---- HP-25 (Woodstock: gold f above, blue g on the key slant) ----------------
const HP25_ROWS: ClassicKey[][] = [
  [ck("SST","SST","black",{f:"FIX"}),ck("BST","BST","black",{f:"SCI"}),ck("GTO","GTO","black",{f:"ENG"}),ck("f","f","gold",{kind:"pf"}),ck("g","g","blue",{kind:"pg"})],
  [ck("x⇄y","x⇄y","black",{f:"x̄",g:"%"}),ck("R↓","R↓","black",{f:"s",g:"1/x"}),ck("STO","STO n","black"),ck("RCL","RCL n","black"),ck("Σ+","Σ+","black",{f:"Σ−"})],
  [ck("ENTER↑","ENTER","black",{flex:2,f:"PREFIX"}),ck("CHS","CHS","black",{f:"PRGM",fFn:"CLEAR PRGM",g:"DEG"}),ck("EEX","EEX","black",{f:"REG",fFn:"CLEAR REG",g:"RAD"}),ck("CLX","CLx","black",{f:"STK",fFn:"CLEAR STK",g:"GRD"})],
  [ck("−","−","black",{f:"x<y",g:"x<0"}),ck("7","7","black",{f:"ln",g:"eˣ"}),ck("8","8","black",{f:"log",g:"10ˣ"}),ck("9","9","black",{f:"→R",g:"→P"})],
  [ck("+","+","black",{f:"x≥y",g:"x≥0"}),ck("4","4","black",{f:"sin",g:"sin⁻¹"}),ck("5","5","black",{f:"cos",g:"cos⁻¹"}),ck("6","6","black",{f:"tan",g:"tan⁻¹"})],
  [ck("×","×","black",{f:"x≠y",g:"x≠0"}),ck("1","1","black",{f:"INT",g:"FRAC"}),ck("2","2","black",{f:"√x",g:"x²"}),ck("3","3","black",{f:"yˣ",g:"ABS"})],
  [ck("÷","÷","black",{f:"x=y",g:"x=0"}),ck("0","0","black",{f:"→H.MS",g:"→H"}),ck(".",".","black",{f:"LAST x",g:"π"}),ck("R/S","R/S","black",{f:"PAUSE",g:"NOP"})],
];

// ---- HP-67 (classic programmable: f gold / g blue / h black) -----------------
const HP67_ROWS: ClassicKey[][] = [
  [ck("A","A","black",{f:"a"}),ck("B","B","black",{f:"b"}),ck("C","C","black",{f:"c"}),ck("D","D","black",{f:"d"}),ck("E","E","black",{f:"e"})],
  [ck("Σ+","Σ+","black",{f:"x̄",g:"s",h:"Σ−"}),ck("GTO","GTO","black",{f:"GSB",h:"RTN"}),ck("DSP","DSP","black",{f:"FIX",g:"SCI",h:"ENG"}),ck("(i)","(i)","black",{f:"RND",h:"x⇄I"}),ck("SST","SST","black",{f:"LBL",h:"BST"})],
  [ck("f","f","gold",{kind:"pf"}),ck("g","g","blue",{kind:"pg"}),ck("STO","STO n","black",{f:"DSZ",fFn:"DSZ I",g:"DSZ (i)",h:"ST I"}),ck("RCL","RCL n","black",{f:"ISZ",fFn:"ISZ I",g:"ISZ (i)",h:"RC I"}),ck("h","h","black",{kind:"ph"})],
  [ck("ENTER↑","ENTER","black",{flex:2,f:"W/DATA",g:"MERGE",h:"DEG"}),ck("CHS","CHS","black",{f:"P⇄S",h:"RAD"}),ck("EEX","EEX","black",{f:"CL REG",h:"GRD"}),ck("CL X","CLx","black",{f:"CL PRGM",h:"DEL"})],
  [ck("−","−","black",{f:"x=0",g:"x=y",h:"SF"}),ck("7","7","black",{f:"LN",g:"eˣ",h:"x⇄y"}),ck("8","8","black",{f:"LOG",g:"10ˣ",h:"R↓"}),ck("9","9","black",{f:"√x",g:"x²",h:"R↑"})],
  [ck("+","+","black",{f:"x≠0",g:"x≠y",h:"CF"}),ck("4","4","black",{f:"SIN",g:"SIN⁻¹",h:"1/x"}),ck("5","5","black",{f:"COS",g:"COS⁻¹",h:"yˣ"}),ck("6","6","black",{f:"TAN",g:"TAN⁻¹",h:"ABS"})],
  [ck("×","×","black",{f:"x<0",g:"x≤y",h:"F?"}),ck("1","1","black",{f:"→R",g:"→P",h:"PAUSE"}),ck("2","2","black",{f:"D→R",g:"R→D",h:"π"}),ck("3","3","black",{f:"→H",g:"→H.MS",h:"REG",hFn:"REVIEW REG"})],
  [ck("÷","÷","black",{f:"x>0",g:"x>y",h:"N!"}),ck("0","0","black",{f:"%",g:"%CH",h:"LST X"}),ck(".",".","black",{f:"INT",g:"FRAC",h:"H.MS+"}),ck("R/S","R/S","black",{f:"−x−",g:"STK",gFn:"PRINT STACK",h:"SPACE",hFn:"PRINT SPACE"})],
];

// ---- HP-41C/CV/CX (gold shift + ALPHA letters; hp/layouts/HP-41C-CV.md) ------
// Row 0 is the real unit's toggle strip (ON / USER / PRGM / ALPHA) below the
// display; the C/CV and CX share this keyplate exactly (grids diffed equal).
const HP41_ROWS: ClassicKey[][] = [
  [ck("ON","ON","black"),ck("USER","USER","black"),ck("PRGM","W/PRGM","black"),ck("ALPHA","ALPHA","black",{kind:"alpha"})],
  [ck("Σ+","Σ+","black",{f:"Σ−",al:"A"}),ck("1/x","1/x","black",{f:"yˣ",al:"B"}),ck("√x","√x","black",{f:"x²",al:"C"}),ck("LOG","LOG","black",{f:"10ˣ",al:"D"}),ck("LN","LN","black",{f:"eˣ",al:"E"})],
  [ck("x≷y","x⇄y","black",{f:"CLΣ",al:"F"}),ck("R↓","R↓","black",{f:"%",al:"G"}),ck("SIN","SIN","black",{f:"SIN⁻¹",al:"H"}),ck("COS","COS","black",{f:"COS⁻¹",al:"I"}),ck("TAN","TAN","black",{f:"TAN⁻¹",al:"J"})],
  [ck("","f","gold",{kind:"pf"}),ck("XEQ","XEQ","black",{f:"ASN",al:"K"}),ck("STO","STO","black",{f:"LBL",al:"L"}),ck("RCL","RCL","black",{f:"GTO",al:"M"}),ck("SST","SST","black",{f:"BST"})],
  [ck("ENTER↑","ENTER","black",{flex:2,f:"CATALOG",al:"N"}),ck("CHS","CHS","black",{f:"ISG",al:"O"}),ck("EEX","EEX","black",{f:"RTN",al:"P"}),ck("←","CLx","black",{f:"CL x/A"})],
  [ck("−","−","black",{f:"x=y?",al:"Q"}),ck("7","7","black",{f:"SF",al:"R"}),ck("8","8","black",{f:"CF",al:"S"}),ck("9","9","black",{f:"FS?",al:"T"})],
  [ck("+","+","black",{f:"x≤y?",al:"U"}),ck("4","4","black",{f:"BEEP",al:"V"}),ck("5","5","black",{f:"P→R",al:"W"}),ck("6","6","black",{f:"R→P",al:"X"})],
  [ck("×","×","black",{f:"x>y?",al:"Y"}),ck("1","1","black",{f:"FIX",al:"Z"}),ck("2","2","black",{f:"SCI",al:"="}),ck("3","3","black",{f:"ENG",al:"?"})],
  [ck("÷","÷","black",{f:"x=0?",al:":"}),ck("0","0","black",{f:"π",al:"SPC"}),ck("•","•","black",{f:"LASTx",al:","}),ck("R/S","R/S","black",{f:"VIEW"})],
];

// ---- HP-42S (Pioneer: single orange shift, 2-line dot glass) -----------------
const HP42S_ROWS: ClassicKey[][] = [
  [ck("Σ+","Σ+","black",{f:"Σ−"}),ck("1/x","1/x","black",{f:"yˣ"}),ck("√x","√x","black",{f:"x²"}),ck("LOG","LOG","black",{f:"10ˣ"}),ck("LN","LN","black",{f:"eˣ"}),ck("XEQ","XEQ","black",{f:"GTO"})],
  [ck("STO","STO","black",{f:"COMPLEX"}),ck("RCL","RCL","black",{f:"%"}),ck("R↓","R↓","black",{f:"π"}),ck("SIN","SIN","black",{f:"ASIN"}),ck("COS","COS","black",{f:"ACOS"}),ck("TAN","TAN","black",{f:"ATAN"})],
  [ck("ENTER","ENTER","black",{flex:2,f:"ALPHA"}),ck("x⇄y","x⇄y","black",{f:"LAST x",fFn:"LSTx"}),ck("+/−","CHS","black",{f:"MODES"}),ck("E","EEX","black",{f:"DISP"}),ck("←","←","black",{f:"CLEAR",fFn:"CLEARM"})],
  [ck("▲","▲","black",{f:"BST"}),ck("7","7","black",{f:"SOLVER"}),ck("8","8","black",{f:"∫f(x)"}),ck("9","9","black",{f:"MATRIX"}),ck("÷","÷","black",{f:"STAT"})],
  [ck("▼","▼","black",{f:"SST"}),ck("4","4","black",{f:"BASE"}),ck("5","5","black",{f:"CONVERT"}),ck("6","6","black",{f:"FLAGS"}),ck("×","×","black",{f:"PROB"})],
  [ck("","f","gold",{kind:"pf"}),ck("1","1","black",{f:"ASSIGN"}),ck("2","2","black",{f:"CUSTOM"}),ck("3","3","black",{f:"PGM.FCN"}),ck("−","−","black",{f:"PRINT"})],
  [ck("EXIT","EXIT","black",{f:"OFF"}),ck("0","0","black",{f:"TOP.FCN"}),ck(".",".","black",{f:"SHOW"}),ck("R/S","R/S","black",{f:"PRGM",fFn:"W/PRGM"}),ck("+","+","black",{f:"CATALOG"})],
];

// ---- HP-35s (modern: yellow ls above / blue rs bottom-left / letters) --------
// The 4-way pad (rows 1–3 top-right on the real unit) compacts to ▲▼ then ◄►
// in the two rightmost columns [judgment].
const HP35S_ROWS: ClassicKey[][] = [
  [ck("R/S","R/S","black",{f:"FN=",g:"PRGM",gFn:"W/PRGM",al:"A"}),ck("GTO","GTO","black",{f:"ISG",g:"DSE",al:"B"}),ck("XEQ","XEQ","black",{f:"RTN",g:"LBL",al:"C"}),ck("MODE","MODE","black",{f:"x?y",g:"x?0",al:"D"}),ck("▲","▲","black",{f:"FLAGS"}),ck("▼","▼","black",{f:"MEM"})],
  [ck("RCL","RCL","black",{f:"x≤?",g:"STO"}),ck("R↓","R↓","black",{f:"VIEW",g:"R↑",al:"E"}),ck("x↔y","x⇄y","black",{f:"INPUT",g:"PSE",al:"F"}),ck("i","i","black",{f:"ARG",g:"θ",al:"G"}),ck("◄","◄","black",{f:"DISPLAY"}),ck("►","►","black",{f:"CONST"})],
  [ck("SIN","SIN","black",{f:"HYP",g:"ASIN",al:"H"}),ck("COS","COS","black",{f:"π",g:"ACOS",al:"I"}),ck("TAN","TAN","black",{f:"INTG",g:"ATAN",al:"J"}),ck("√x","√x","black",{f:"x√y",g:"x²",al:"K"}),ck("yˣ","yˣ","black",{f:"LOG",g:"LN",al:"L"}),ck("1/x","1/x","black",{f:"10ˣ",g:"eˣ",al:"M"})],
  [ck("ENTER","ENTER","black",{flex:2,f:"SHOW",g:"LASTx"}),ck("+/−","CHS","black",{f:"=",g:"ABS",al:"N"}),ck("E","EEX","black",{f:"←ENG",g:"RND",al:"O"}),ck("( )","( )","black",{f:"ENG→",g:"[ ]",al:"P"}),ck("←","←","black",{f:"UNDO",g:"CLEAR"})],
  [ck("EQN","EQN","black",{f:"∫",g:"SOLVE",al:"Q"}),ck("7","7","black",{f:"→°F",g:"→°C",al:"R"}),ck("8","8","black",{f:"HMS→",g:"→HMS",al:"S"}),ck("9","9","black",{f:"→RAD",g:"→DEG",al:"T"}),ck("÷","÷","black",{f:"%CHG",g:"%"})],
  [ck("","f","gold",{kind:"pf"}),ck("4","4","black",{f:"→lb",g:"→kg",al:"U"}),ck("5","5","black",{f:"→MILE",g:"→KM",al:"V"}),ck("6","6","black",{f:"→in",g:"→cm",al:"W"}),ck("×","×","black",{f:"nCr",g:"nPr"})],
  [ck("","g","blue",{kind:"pg"}),ck("1","1","black",{f:"LOGIC",g:"BASE",al:"X"}),ck("2","2","black",{f:"→gal",g:"→l",al:"Y"}),ck("3","3","black",{f:"SEED",g:"RAND",al:"Z"}),ck("−","−","black",{f:"L.R",g:"SUMS"})],
  [ck("C","CLx","black",{f:"OFF"}),ck("0","0","black",{f:",",g:"SPACE",al:"I"}),ck(".",".","black",{f:"/c",g:"FDISP",al:"J"}),ck("Σ+","Σ+","black",{f:"Σ−",g:"!"}),ck("+","+","black",{f:"x̄,ȳ",g:"S,σ"})],
];

// ---- HP Prime (modern touchscreen: blue Shift + orange ALPHA) ----------------
// Upper view keys flank a rocker wheel on the real unit — modelled as two
// 5-key rows; the toolbox/template icon keys print as text [judgment].
const HPPRIME_ROWS: ClassicKey[][] = [
  [ck("Apps","Apps","black",{g:"Info"}),ck("Symb","Symb","black",{g:"Setup"}),ck("Plot","Plot","black",{g:"Setup"}),ck("Num","Num","black",{g:"Setup"}),ck("Home","Home","black",{g:"Settings"})],
  [ck("Help","Help","black",{g:"User"}),ck("View","View","black",{g:"Copy"}),ck("Menu","Menu","black",{g:"Paste"}),ck("Esc","Esc","black",{g:"Clear"}),ck("CAS","CAS","black",{g:"Settings"})],
  [ck("Vars","Vars","black",{g:"Chars",al:"A"}),ck("Tool","Tool","black",{g:"Mem",al:"B"}),ck("Tmpl","Tmpl","black",{g:"Units",al:"C"}),ck("x t θ n","xtθn","black",{g:"Define",al:"D"}),ck("a b/c","ab/c","black",{g:"e i π",al:"E"}),ck("⌫","←","black",{g:"Del"})],
  [ck("xʸ","yˣ","black",{g:"√",al:"F"}),ck("SIN","SIN","black",{g:"ASIN",al:"G"}),ck("COS","COS","black",{g:"ACOS",al:"H"}),ck("TAN","TAN","black",{g:"ATAN",al:"I"}),ck("LN","LN","black",{g:"eˣ",al:"J"}),ck("LOG","LOG","black",{g:"10ˣ",al:"K"})],
  [ck("x²","x²","black",{g:"√",al:"L"}),ck("+/−","CHS","black",{g:"|x|",al:"M"}),ck("( )","( )","black",{al:"N"}),ck(",",",","black",{g:"Eval",al:"O"}),ck("Enter","ENTER","black",{flex:2,g:"≈"})],
  [ck("EEX","EEX","black",{g:"Sto▸",al:"P"}),ck("7","7","black",{g:"List",al:"Q"}),ck("8","8","black",{g:"[ ]",al:"R"}),ck("9","9","black",{g:"! ≠ →",al:"S"}),ck("÷","÷","black",{g:"x⁻¹",al:"T"})],
  [ck("ALPHA","ALPHA","black",{kind:"alpha"}),ck("4","4","black",{g:"Matrix",al:"U"}),ck("5","5","black",{g:"[ ]",al:"V"}),ck("6","6","black",{g:"≤ ≥ ≠",al:"W"}),ck("×","×","black",{g:"∡",al:"X"})],
  [ck("Shift","Shift","blue",{kind:"pg"}),ck("1","1","black",{g:"Program",al:"Y"}),ck("2","2","black",{g:"i",al:"Z"}),ck("3","3","black",{g:"π",al:"#"}),ck("−","−","black",{g:"Base",al:":"})],
  [ck("On","On","black",{g:"Off"}),ck("0","0","black",{g:"Notes",al:"\" \""}),ck(".",".","black",{g:"="}),ck("␣","SPC","black",{g:"_"}),ck("+","+","black",{g:"Ans",al:";"})],
];

// ---- HP-17B / HP-17BII (Pioneer financial: single gold shift, 2-line dot glass,
// six menu softkeys on the top row; hp/layouts/HP-17B.md) ----------------------
// Same Pioneer chassis as the 42S (6 cols; rows 1–3 six keys, rows 4–7 five
// keys on the lcm subgrid). The top row is SIX BLANK menu/soft keys (fn SK1…SK6)
// — the active menu's labels ride the display's bottom line (Display MenuRow),
// and ClassicKeyboard turns these top keys into softkeys when a menu is open.
// Shared by the algebraic-only 17B and the RPN/ALG 17BII (identical keyplate;
// the 17BII's "=" doubles as ENTER in RPN mode, handled by the engine).
const sk = (n: number): ClassicKey => ({ legend: "", fn: `SK${n}`, cat: "black" });
const HP17B_ROWS: ClassicKey[][] = [
  [sk(1),sk(2),sk(3),sk(4),sk(5),sk(6)],
  [ck("STO","STO","black"),ck("RCL","RCL","black"),ck("%","%","black",{f:"MATH"}),ck("DSP","DSP","black",{f:"MODES"}),ck("PRT","PRT","black",{f:"PRINTER"}),ck("EXIT","EXIT","black",{f:"MAIN"})],
  [ck("▲","▲","black"),ck("INPUT","INPUT","black",{f:"CLEAR DATA",fFn:"CLEARM"}),ck("+/−","CHS","black",{f:"E",fFn:"EEX"}),ck("(","(","black"),ck(")",")","black"),ck("←","←","black")],
  [ck("▼","▼","black"),ck("7","7","black"),ck("8","8","black"),ck("9","9","black"),ck("÷","÷","black",{f:"1/x"})],
  [ck("","f","gold",{kind:"pf"}),ck("4","4","black"),ck("5","5","black"),ck("6","6","black"),ck("×","×","black",{f:"yˣ"})],
  [ck("CLR","CLx","black",{f:"OFF"}),ck("1","1","black"),ck("2","2","black"),ck("3","3","black"),ck("−","−","black",{f:"√x"})],
  [ck("","","black",{kind:"gap"}),ck("0","0","black",{f:"MEM"}),ck(".","•","black",{f:"SHOW"}),ck("=","=","black",{f:"LAST",fFn:"LSTx"}),ck("+","+","black",{f:"x²"})],
];

// ---- HP-18C / HP-19B / HP-19BII (clamshell financial; hp/layouts/HP-18C.md …)
// Two hinged panels merged into ONE Pioneer grid (the HP-97/28C pattern): a LEFT
// alphabetic keyboard (types Solver-equation text into the α register via the
// engine's α-append) + a hinge gap + the RIGHT calc panel (6 menu softkeys,
// STO/RCL, INPUT, numeric pad, arithmetic). Every merged row is exactly 13 units
// — the hinge gap absorbs the panels' differing widths — so both halves keep
// internally uniform columns. Landscape (open-book posture); RPN/menu engine.
/** A left-panel alpha key — types its character into the α register. */
const al = (c: string): ClassicKey => ({ legend: c, fn: "α" + c, cat: "black" });
/** A bare-plate spacer of `w` grid units (the hinge / left-panel pad). */
const gp = (w: number): ClassicKey => ({ legend: "", fn: "", cat: "black", kind: "gap", flex: w });
const HP18C_ROWS: ClassicKey[][] = [
  [al("A"),al("B"),al("C"),al("D"),al("E"),al("F"),gp(1),sk(1),sk(2),sk(3),sk(4),sk(5),sk(6)],
  [al("G"),al("H"),al("I"),al("J"),al("K"),al("L"),gp(1),ck("","f","gold",{kind:"pf"}),ck("STO","STO","black"),ck("RCL","RCL","black"),ck("DSP","DSP","black"),ck("PRT","PRT","black",{f:"PRINTER"}),ck("EXIT","EXIT","black",{f:"MAIN"})],
  [al("M"),al("N"),al("O"),al("P"),al("Q"),al("R"),gp(1),ck("INPUT","INPUT","black",{flex:2,f:"CLEAR ALL",fFn:"CLEARM"}),ck("+/−","CHS","black",{f:"E",fFn:"EEX"}),ck("(","(","black"),ck(")",")","black"),ck("◆","←","black",{f:"CLEAR"})],
  [al("S"),al("T"),al("U"),al("V"),al("W"),al("X"),gp(2),ck("▲","▲","black"),ck("7","7","black"),ck("8","8","black"),ck("9","9","black"),ck("÷","÷","black",{f:"1/x"})],
  [al("Y"),al("Z"),al("?"),al("$"),al("#"),al(":"),gp(2),ck("▼","▼","black"),ck("4","4","black"),ck("5","5","black"),ck("6","6","black"),ck("×","×","black",{f:"yˣ"})],
  [ck("SPACE","α ","black",{flex:2}),ck("INS","INS","black"),ck("DEL","DEL","black"),ck("◄","◄","black"),ck("►","►","black"),gp(2),ck("%","%","black"),ck("1","1","black"),ck("2","2","black"),ck("3","3","black"),ck("−","−","black",{f:"√x"})],
  [gp(8),ck("ON","ON","black"),ck("0","0","black"),ck(".","•","black"),ck("=","=","black",{f:"LAST",fFn:"LSTx"}),ck("+","+","black",{f:"x²"})],
];

// ---- HP-20b / HP-30b (modern algebraic/RPN financial; hp/layouts/HP-30b.md) --
// Pioneer-chassis 6×7 dot-matrix financial with the TVM registers + finance
// menus on DIRECT keys (not softkeys) and a single (blue) shift plane. The math
// secondaries resolve to real engine functions; the finance-menu openers are
// accepted-inert (FIN_MENU_ACCEPTED in rpn.ts). Shared by the 20b and 30b.
const HP30B_ROWS: ClassicKey[][] = [
  [ck("N","N","black",{f:"xP/YR"}),ck("I/YR","I/YR","black",{f:"IConv"}),ck("PV","PV","black",{f:"Beg"}),ck("PMT","PMT","black",{f:"P/YR"}),ck("FV","FV","black",{f:"End"}),ck("Amort","Amort","black",{f:"Depr"})],
  [ck("CshFl","CshFl","black",{f:"Data"}),ck("IRR","IRR","black",{f:"Stats"}),ck("NPV","NPV","black",{f:"BrkEv"}),ck("Bond","Bond","black",{f:"Date"}),ck("%","%","black",{f:"%calc"}),ck("RCL","RCL","black",{f:"STO"})],
  [ck("INPUT","INPUT","black",{flex:2,f:"Memory"}),ck("(","(","black",{f:"Mode"}),ck(")",")","black",{f:"PRGM"}),ck("+/−","CHS","black",{f:"E",fFn:"EEX"}),ck("←","←","black",{f:"Reset"})],
  [ck("▲","▲","black",{f:"INS"}),ck("7","7","black",{f:"SIN"}),ck("8","8","black",{f:"COS"}),ck("9","9","black",{f:"TAN"}),ck("÷","÷","black",{f:"Math"})],
  [ck("▼","▼","black",{f:"DEL"}),ck("4","4","black",{f:"LN",fFn:"ln"}),ck("5","5","black",{f:"eˣ"}),ck("6","6","black",{f:"x²"}),ck("×","×","black",{f:"√x"})],
  [ck("","f","gold",{kind:"pf"}),ck("1","1","black",{f:"RAND",fFn:"RAN#"}),ck("2","2","black",{f:"!",fFn:"x!"}),ck("3","3","black",{f:"yˣ"}),ck("−","−","black",{f:"1/x"})],
  [ck("ON/CE","CLx","black",{f:"OFF"}),ck("0","0","black",{f:"nPr",fFn:"Py,x"}),ck(".","•","black",{f:"nCr",fFn:"Cy,x"}),ck("=","=","black",{f:"ANS",fFn:"LSTx"}),ck("+","+","black",{f:"RND",fFn:"RND"})],
];

// ---- HP-10BII (algebraic financial, single-line; hp/layouts/HP-10BII.md) -----
// A 5×8 Voyager-scale financial on the CLASSIC family (7-segment glass). TWO
// prefix planes: f = orange SHIFT (function printed below each key), g = mauve
// STATISTICS (the Σ registers above keys 4–9). TVM keys reuse the 12C engine;
// the business/stat legends are accepted-inert (FIN_MENU_ACCEPTED).
const HP10BII_ROWS: ClassicKey[][] = [
  [ck("N","N","black",{f:"xP/YR"}),ck("I/YR","I/YR","black",{f:"NOM%"}),ck("PV","PV","black",{f:"EFF%"}),ck("PMT","PMT","black",{f:"P/YR"}),ck("FV","FV","black",{f:"AMORT",fFn:"Amort"})],
  [ck("INPUT","INPUT","black"),ck("MU","MU","black"),ck("CST","CST","black",{f:"IRR/YR"}),ck("PRC","PRC","black",{f:"NPV"}),ck("MAR","MAR","black",{f:"BEG/END"})],
  [ck("K","K","black",{f:"SWAP"}),ck("%","%","black",{f:"%CHG",fFn:"Δ%"}),ck("CFj","CFj","black",{f:"Nj"}),ck("Σ+","Σ+","black",{f:"Σ−"}),ck("←","←","black",{f:"RND",fFn:"RND"})],
  [ck("+/−","CHS","black",{f:"E",fFn:"EEX"}),ck("RCL","RCL","black",{f:"STO"}),ck("→M","→M","black",{f:"CLΣ"}),ck("RM","RM","black",{f:"("}),ck("M+","M+","black",{f:")"})],
  [ck("","STATS","blue",{kind:"pg"}),ck("7","7","black",{f:"x̄,ȳ",g:"Σx²"}),ck("8","8","black",{f:"Sx,Sy",g:"Σy²"}),ck("9","9","black",{f:"σx,σy",g:"Σxy"}),ck("÷","÷","black",{f:"1/x"})],
  [ck("","SHIFT","gold",{kind:"pf"}),ck("4","4","black",{f:"x̂,r",g:"n"}),ck("5","5","black",{f:"ŷ,m",g:"Σx"}),ck("6","6","black",{f:"x̄w",g:"Σy"}),ck("×","×","black",{f:"yˣ"})],
  [ck("C","CLx","black",{f:"C ALL"}),ck("1","1","black",{f:"eˣ"}),ck("2","2","black",{f:"LN",fFn:"ln"}),ck("3","3","black",{f:"n!",fFn:"x!"}),ck("−","−","black",{f:"√x"})],
  [ck("ON","ON","black",{f:"OFF"}),ck("0","0","black"),ck(".","•","black",{f:"./,"}),ck("=","=","black",{f:"DISP"}),ck("+","+","black",{f:"x²"})],
];

/** RPL key helper (shared by every RPL-family board). */
const r = (
  p: string,
  ls: string,
  rs: string,
  al: string,
  w = 1,
  kind: RplKey["kind"] = "std",
): RplKey => ({ p, ls, rs, al, w, kind });

// ---- HP-28C / HP-28S (RPL clamshell; hp/layouts/HP-28C.md, HP-28S.md) --------
// Two physical keypads under one lid. Modelled as ONE aspect-locked grid:
// each row pairs the left (alpha/menu) half with the right (numeric) half
// across a bare-plate hinge gap whose width absorbs the halves' differing
// row units — every merged row is exactly 13 units, so both halves keep
// internally uniform columns. Single RED shift = the ls plane.
const g28 = (w: number): RplKey => r("", "", "", "", w, "gap");
const hp28Rows = (v: "C" | "S"): RplKey[][] => [
  [g28(7),r("","INS","","",1,"soft"),r("","DEL","","",1,"soft"),r("","▲","","",1,"soft"),r("","▼","","",1,"soft"),r("","◄","","",1,"soft"),r("","►","","",1,"soft")],
  [r("A",v==="C"?"ARRAY":"ARRAY","","" ),r("B","BINARY","",""),r("C",v==="C"?"CMPLX":"COMPLX","",""),r("D","STRING","",""),r("E","LIST","",""),r("F","REAL","",""),g28(1),r("◄","","","",1,"ls"),r("◄▶","MODE","",""),r("TRIG","LOGS","",""),r("SOLV",v==="C"?"STAT":"PLOT","",""),r("USER",v==="C"?"PLOT":"CUSTOM","",""),r("NEXT","PREV","","")],
  [r("G","STACK","",""),r("H","STORE","",""),r("I",v==="C"?"":"MEMORY","",""),r("J",v==="C"?"ALGEBRA":"ALGBRA","",""),r("K",v==="C"?"":"STAT","",""),r("L","PRINT","",""),g28(1),r("ENTER","EDIT","","",2,"enter"),r("CHS","VIEW▲","",""),r("EEX","VIEW▼","",""),r("DROP","ROLL","",""),r("◆","SWAP","","")],
  [r("M",v==="C"?"CTRL":"CONTRL","",""),r("N","BRANCH","",""),r("O","TEST","",""),r("P","","",""),r("Q","CATALOG","",""),r("R","UNITS","",""),g28(2),r("|","VISIT","",""),r("7","COMMAND","","",1,"digit"),r("8","UNDO","","",1,"digit"),r("9","LAST","","",1,"digit"),r("÷","1/x","","",1,"arith")],
  [r("S","≤","",""),r("T","≥","",""),r("U","→","",""),r("V","Σ","",""),r("W","°","",""),r("X","µ","",""),g28(2),r("STO","RCL","",""),r("4","PURGE","","",1,"digit"),r("5","∫","","",1,"digit"),r("6","d/dx","","",1,"digit"),r("×","^","","",1,"arith")],
  [r("Y","<","",""),r("Z",">","",""),r("#","\"","",""),r("{","}","",""),r("[","]","",""),r("(",")","",""),g28(2),r("EVAL","→NUM","",""),r("1","CONT","","",1,"digit"),r("2","%","","",1,"digit"),r("3","%CH","","",1,"digit"),r("−",v==="C"?"√":"√x","","",1,"arith")],
  [r("SPACE","NEWLINE","","",2),r("«","≫","",""),r("=","≠","",""),r("LC","?","",""),r("α",v==="C"?"α LOCK":"MENUS","",""),g28(2),r("ON","OFF","","",1,"on"),r("0","CLEAR","","",1,"digit"),r(".","π","",""),r(",","CONVERT","",""),r("+","x²","","",1,"arith")],
];
const HP28C_ROWS = hp28Rows("C");
const HP28S_ROWS = hp28Rows("S");

// ---- HP-97 (desktop printer; hp/layouts/HP-97.md) ----------------------------
// Two side-by-side clusters merged the same way (every row 12 units): ENTER↑
// and 0 are double-WIDTH, PRINT x is double-width (right cluster squares to 5
// units), and + is double-HEIGHT (hspan:2, spans R5–R6). Single gold f prefix;
// printing keys stay inert.
const HP97_ROWS: ClassicKey[][] = [
  [ck("A","A","black",{f:"a"}),ck("B","B","black",{f:"b"}),ck("C","C","black",{f:"c"}),ck("D","D","black",{f:"d"}),ck("E","E","black",{f:"e"}),ck("","f","gold",{kind:"pf"}),ck("","","black",{kind:"gap",flex:1}),ck("FIX","FIX","black",{f:"PRINT SPACE"}),ck("SCI","SCI","black",{f:"PRINT PRGM"}),ck("ENG","ENG","black",{f:"PRINT REG"}),ck("PRINT x","PRINT x","black",{flex:2,f:"PRINT STACK"})],
  [ck("LBL","LBL","black",{f:"STF"}),ck("GTO","GTO","black",{f:"CLF"}),ck("GSB","GSB","black",{f:"F?"}),ck("RTN","RTN","black",{f:"RND"}),ck("BST","BST","black",{f:"DSZ"}),ck("SST","SST","black",{f:"ISZ"}),ck("","","black",{kind:"gap"}),ck("ENTER↑","ENTER","blue",{flex:2,f:"DEG"}),ck("CHS","CHS","blue",{f:"RAD"}),ck("EEX","EEX","blue",{f:"GRD"}),ck("÷","÷","blue",{f:"π"})],
  [ck("yˣ","yˣ","black",{f:"ABS"}),ck("LN","LN","black",{f:"LOG"}),ck("eˣ","eˣ","black",{f:"10ˣ"}),ck("→P","→P","black",{f:"INT"}),ck("STO","STO n","black",{f:"→H.MS"}),ck("RCL","RCL n","black",{f:"H.MS→"}),ck("","","black",{kind:"gap"}),ck("R↓","R↓","black",{f:"R↑"}),ck("7","7","beige",{f:"x≠y?"}),ck("8","8","beige",{f:"x=y?"}),ck("9","9","beige",{f:"x>y?"}),ck("×","×","blue",{f:"x≤y?"})],
  [ck("SIN","SIN","black",{f:"SIN⁻¹"}),ck("COS","COS","black",{f:"COS⁻¹"}),ck("TAN","TAN","black",{f:"TAN⁻¹"}),ck("→R","→R","black",{f:"FRAC"}),ck("(i)","(i)","black",{f:"D→R"}),ck("I","RC I","black",{f:"R→D"}),ck("","","black",{kind:"gap"}),ck("x⇄y","x⇄y","black",{f:"x⇄I"}),ck("4","4","beige",{f:"x≠0?"}),ck("5","5","beige",{f:"x=0?"}),ck("6","6","beige",{f:"x>0?"}),ck("−","−","blue",{f:"x<0?"})],
  [ck("R/S","R/S","black",{f:"PAUSE"}),ck("1/x","1/x","black",{f:"N!"}),ck("x²","x²","black",{f:"x̄"}),ck("√x","√x","black",{f:"s"}),ck("%","%","black",{f:"%CH"}),ck("Σ+","Σ+","black",{f:"Σ−"}),ck("","","black",{kind:"gap"}),ck("CL X","CLx","black",{f:"P⇄S"}),ck("1","1","beige",{f:"DEL"}),ck("2","2","beige",{f:"CL REG"}),ck("3","3","beige",{f:"CL PRGM"}),ck("+","+","blue",{f:"H.MS+",hspan:2})],
  // R6: the `+` above spans down into this row's last column (hspan:2), so the
  // gap is one unit shorter (7) and 0/./DSP fill the columns to its left
  [ck("","","black",{kind:"gap",flex:7}),ck("0","0","beige",{flex:2,f:"WRITE DATA"}),ck(".",".","beige",{f:"MERGE"}),ck("DSP","DSP","beige",{f:"LAST X"})],
];

// ---- HP-48G (RPL, graphing) --------------------------------------------------
const HP48G_ROWS: RplKey[][] = [
  [r("","","","A",1,"soft"),r("","","","B",1,"soft"),r("","","","C",1,"soft"),r("","","","D",1,"soft"),r("","","","E",1,"soft"),r("","","","F",1,"soft")],
  [r("MTH","","","G"),r("PRG","I/O","I/O","H"),r("CST","MODES","MODES","I"),r("VAR","MEM","MEM","J"),r("▲","LIB","LIB","K",1,"cur"),r("NXT","PREV","","L")],
  [r("′","","","M"),r("STO","DEF","RCL","N"),r("EVAL","→Q","→NUM","O"),r("◄","GRAPH","","P",1,"cur"),r("▼","REVIEW","","Q",1,"cur"),r("►","SWAP","","R",1,"cur")],
  [r("SIN","ASIN","∂","S"),r("COS","ACOS","∫","T"),r("TAN","ATAN","Σ","U"),r("√x","x²","ˣ√y","V"),r("yˣ","10ˣ","LOG","W"),r("1/x","eˣ","LN","X")],
  [r("ENTER","EQUATION","MATRIX","",2,"enter"),r("+/−","EDIT","VISIT","Y"),r("EEX","","","Z"),r("DEL","PURGE","",""),r("◄","DROP","CLEAR","",1,"bksp")],
  [r("α","USR","ENTRY","",1,"alpha"),r("7","SOLVE","SOLVE","",1,"digit"),r("8","PLOT","PLOT","",1,"digit"),r("9","SYMB","SYMB","",1,"digit"),r("÷","( )","#","",1,"arith")],
  [r("◄","","","",1,"ls"),r("4","TIME","TIME","",1,"digit"),r("5","STAT","STAT","",1,"digit"),r("6","UNITS","",""),r("×","[ ]","_","",1,"arith")],
  [r("►","","","",1,"rs"),r("1","RAD","POLAR","",1,"digit"),r("2","STACK","STACK","",1,"digit"),r("3","CMD","MENU","",1,"digit"),r("−","« »","\" \"","",1,"arith")],
  [r("ON","CONT","OFF","",1,"on"),r("0","=","→","",1,"digit"),r(".","","↵",""),r("SPC","π","∡",""),r("+","{ }","::","",1,"arith")],
];

// ---- HP-48SX (RPL, same keyplate as the 48G; orange/blue shifts) -------------
const HP48SX_ROWS: RplKey[][] = [
  [r("","","","A",1,"soft"),r("","","","B",1,"soft"),r("","","","C",1,"soft"),r("","","","D",1,"soft"),r("","","","E",1,"soft"),r("","","","F",1,"soft")],
  [r("MTH","PRINT","","G"),r("PRG","I/O","","H"),r("CST","MODES","","I"),r("VAR","MEMORY","","J"),r("▲","LIBRARY","","K",1,"cur"),r("NXT","PREV","","L")],
  [r("′","UP","HOME","M"),r("STO","DEF","RCL","N"),r("EVAL","→Q","→NUM","O"),r("◄","GRAPH","","P",1,"cur"),r("▼","REVIEW","","Q",1,"cur"),r("►","SWAP","","R",1,"cur")],
  [r("SIN","ASIN","∂","S"),r("COS","ACOS","∫","T"),r("TAN","ATAN","Σ","U"),r("√x","x²","ˣ√y","V"),r("yˣ","10ˣ","LOG","W"),r("1/x","eˣ","LN","X")],
  [r("ENTER","EQUATION","MATRIX","",2,"enter"),r("+/−","EDIT","VISIT","Y"),r("EEX","2D","3D","Z"),r("DEL","PURGE","",""),r("◄","DROP","CLR","",1,"bksp")],
  [r("α","USR","ENTRY","",1,"alpha"),r("7","SOLVE","","",1,"digit"),r("8","PLOT","","",1,"digit"),r("9","ALGEBRA","","",1,"digit"),r("÷","( )","#","",1,"arith")],
  [r("◄","","","",1,"ls"),r("4","TIME","","",1,"digit"),r("5","STAT","","",1,"digit"),r("6","UNITS","","",1,"digit"),r("×","[ ]","_","",1,"arith")],
  [r("►","","","",1,"rs"),r("1","RAD","POLAR","",1,"digit"),r("2","STACK","ARG","",1,"digit"),r("3","CMD","MENU","",1,"digit"),r("−","« »","\" \"","",1,"arith")],
  [r("ON","CONT","OFF","",1,"on"),r("0","=","→","",1,"digit"),r(".",",","↵",""),r("SPC","π","∡",""),r("+","{ }","::","",1,"arith")],
];

// ---- HP-49G / HP-50g (RPL CAS: 10 rows, cursor diamond, bottom-right ENTER) --
// Rows 2–3 approximate the round 4-way pad as a plus cluster on the 6-col
// grid (◄ ▲ ► over a centred ▼) with bare-plate gaps at the corners.
const HP49G_ROWS: RplKey[][] = [
  [r("F1","Y=","","A",1,"soft"),r("F2","WIN","","B",1,"soft"),r("F3","GRAPH","","C",1,"soft"),r("F4","2D/3D","","D",1,"soft"),r("F5","TBLSET","","E",1,"soft"),r("F6","TABLE","","F",1,"soft")],
  [r("APPS","FILES","BEGIN","G"),r("MODE","CUSTOM","END","H"),r("TOOL","i","|","I"),r("◄","","","",1,"cur"),r("▲","","","",1,"cur"),r("►","","","",1,"cur")],
  [r("VAR","UPDIR","COPY","J"),r("STO▶","RCL","CUT","K"),r("NXT","PREV","PASTE","L"),r("","","","",1,"gap"),r("▼","","","",1,"cur"),r("","","","",1,"gap")],
  [r("HIST","CMD","UNDO","M"),r("Cα","PRG","CHARS","N"),r("EQW","MTRW","′","O"),r("SYMB","MTH","EVAL","P"),r("←","DEL","CLEAR","",1,"bksp")],
  [r("yˣ","eˣ","LN","Q"),r("√x","x²","ˣ√y","R"),r("SIN","ASIN","Σ","S"),r("COS","ACOS","∂","T"),r("TAN","ATAN","∫","U")],
  [r("EEX","10ˣ","LOG","V"),r("+/−","≠","=","W"),r("X","≤","<","X"),r("1/x","≥",">","Y"),r("÷","ABS","ARG","Z",1,"arith")],
  [r("ALPHA","USER","ENTRY","",1,"alpha"),r("7","S.SLV","NUM.SLV","",1,"digit"),r("8","EXP&LN","TRIG","",1,"digit"),r("9","FINANCE","TIME","",1,"digit"),r("×","[ ]","\" \"","",1,"arith")],
  [r("◄","","","",1,"ls"),r("4","CALC","ALG","",1,"digit"),r("5","MATRICES","STAT","",1,"digit"),r("6","CONVERT","UNITS","",1,"digit"),r("−","( )","_","",1,"arith")],
  [r("→","","","",1,"rs"),r("1","ARITH","CMPLX","",1,"digit"),r("2","DEF","LIB","",1,"digit"),r("3","#","BASE","",1,"digit"),r("+","{ }","« »","",1,"arith")],
  [r("ON","CONT","OFF","",1,"on"),r("0","∞","→","",1,"digit"),r(".","::","↵",""),r("SPC","π",",",""),r("ENTER","ANS","→NUM","",1,"enter")],
];
const HP50G_ROWS: RplKey[][] = [
  [r("F1","Y=","","A",1,"soft"),r("F2","WIN","","B",1,"soft"),r("F3","GRAPH","","C",1,"soft"),r("F4","2D/3D","","D",1,"soft"),r("F5","TBLSET","","E",1,"soft"),r("F6","TABLE","","F",1,"soft")],
  [r("APPS","FILES","BEGIN","G"),r("MODE","CUSTOM","END","H"),r("TOOL","i","|","I"),r("◄","","","",1,"cur"),r("▲","","","",1,"cur"),r("►","","","",1,"cur")],
  [r("VAR","UPDIR","COPY","J"),r("STO▸","RCL","CUT","K"),r("NXT","PREV","PASTE","L"),r("","","","",1,"gap"),r("▼","","","",1,"cur"),r("","","","",1,"gap")],
  [r("HIST","CMD","UNDO","M"),r("EVAL","PRG","CHARS","N"),r("′","MTRW","EQW","O"),r("SYMB","MTH","CAT","P"),r("←","DEL","CLEAR","",1,"bksp")],
  [r("yˣ","eˣ","LN","Q"),r("√x","x²","ˣ√y","R"),r("SIN","ASIN","Σ","S"),r("COS","ACOS","∂","T"),r("TAN","ATAN","∫","U")],
  [r("EEX","10ˣ","LOG","V"),r("+/−","≠","=","W"),r("X","≤","<","X"),r("1/X","≥",">","Y"),r("÷","ABS","ARG","Z",1,"arith")],
  [r("ALPHA","USER","ENTRY","",1,"alpha"),r("7","S.SLV","NUM.SLV","",1,"digit"),r("8","EXP&LN","TRIG","",1,"digit"),r("9","FINANCE","TIME","",1,"digit"),r("×","[ ]","\" \"","",1,"arith")],
  [r("◄","","","",1,"ls"),r("4","CALC","ALG","",1,"digit"),r("5","MATRICES","STAT","",1,"digit"),r("6","CONVERT","UNITS","",1,"digit"),r("−","( )","_","",1,"arith")],
  [r("→","","","",1,"rs"),r("1","ARITH","CMPLX","",1,"digit"),r("2","DEF","LIB","",1,"digit"),r("3","#","BASE","",1,"digit"),r("+","{ }","« »","",1,"arith")],
  [r("ON","CONT","OFF","",1,"on"),r("0","∞","→","",1,"digit"),r(".","::","↵",""),r("SPC","π",",",""),r("ENTER","ANS","→NUM","",1,"enter")],
];

// Geometry is DERIVED per model from its key data (never hand-tuned): the
// 10×4 Voyagers land ≈2.89 (landscape); HP-35 5×8 ≈0.70 and HP-48G 6×9 ≈0.72
// (both portrait — just above the 0.68 tall threshold).
const GEOM = {
  "HP-35": computeKeyboardGeometry({ rows: HP35_ROWS }, "classic"),
  "HP-45": computeKeyboardGeometry({ rows: HP45_ROWS }, "classic"),
  "HP-65": computeKeyboardGeometry({ rows: HP65_ROWS }, "classic"),
  "HP-25": computeKeyboardGeometry({ rows: HP25_ROWS }, "classic"),
  "HP-67": computeKeyboardGeometry({ rows: HP67_ROWS }, "classic"),
  // Toggle strip makes 9 rows → A≈0.624 (numerically tall), but the real 41
  // is a classic handheld — half-height toggles inflate the computed height.
  // Deliberate portrait override keeps the LCD-above-keys posture (§11 #4).
  "HP-41": computeKeyboardGeometry({ rows: HP41_ROWS }, "hp41", { aspectClass: "portrait" }),
  // Merged two-block machines derive LANDSCAPE naturally — the open
  // clamshell / desk posture (§14.5): wide machine band, LCD above.
  "HP-97": computeKeyboardGeometry({ rows: HP97_ROWS }, "classic"),
  "HP-28C": computeKeyboardGeometry({ rows: HP28C_ROWS }, "rpl"),
  "HP-28S": computeKeyboardGeometry({ rows: HP28S_ROWS }, "rpl"),
  "HP-42S": computeKeyboardGeometry({ rows: HP42S_ROWS }, "pioneer"),
  "HP-35s": computeKeyboardGeometry({ rows: HP35S_ROWS }, "pioneer"),
  "HP-Prime": computeKeyboardGeometry({ rows: HPPRIME_ROWS }, "pioneer"),
  // 17B/17BII share the Pioneer chassis (same rows) → one geometry entry.
  "HP-17B": computeKeyboardGeometry({ rows: HP17B_ROWS }, "pioneer"),
  // 18C/19B/19BII share the merged clamshell chassis → one geometry entry.
  "HP-18C": computeKeyboardGeometry({ rows: HP18C_ROWS }, "pioneer"),
  // 20b/30b share the modern-financial chassis; the 10bII is a classic 5×8.
  "HP-30b": computeKeyboardGeometry({ rows: HP30B_ROWS }, "pioneer"),
  "HP-10BII": computeKeyboardGeometry({ rows: HP10BII_ROWS }, "classic"),
  "HP-11C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-11C"] }, "voyager"),
  "HP-12C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-12C"] }, "voyager"),
  "HP-15C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-15C"] }, "voyager"),
  "HP-16C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-16C"] }, "voyager"),
  // Per-model aspectClass override (§11 #4, §14 rev 5): at A≈0.722 the 48-series
  // is numerically just above the 0.68 tall threshold, but its 9-row keyboard
  // BEHAVES tall — stacked on a desktop it starves the glass. Classing it
  // tall sends it side-by-side on desktops while true portrait classics
  // (HP-35, 8 rows) keep the LCD-above-keys look.
  "HP-48SX": computeKeyboardGeometry({ rows: HP48SX_ROWS }, "rpl", { aspectClass: "tall" }),
  "HP-48G": computeKeyboardGeometry({ rows: HP48G_ROWS }, "rpl", { aspectClass: "tall" }),
  // 49G/50g: 10 rows → A≈0.649, tall by derivation (no override needed).
  "HP-49G": computeKeyboardGeometry({ rows: HP49G_ROWS }, "rpl"),
  "HP-50g": computeKeyboardGeometry({ rows: HP50G_ROWS }, "rpl"),
} satisfies Record<string, KeyboardGeometry>;

export const MODELS: Record<string, Model> = {
  "HP-35":  { id: "HP-35",  name: "HP-35",  family: "classic", sub: "RPN · LED",        angle: false, geometry: GEOM["HP-35"],  rows: HP35_ROWS, switches: [POWER] },
  "HP-45":  { id: "HP-45",  name: "HP-45",  family: "classic", sub: "RPN · SCIENTIFIC", angle: true,  geometry: GEOM["HP-45"],  rows: HP45_ROWS, switches: [POWER] },
  "HP-65":  { id: "HP-65",  name: "HP-65",  family: "classic", sub: "RPN · MAG CARD",   angle: true,  geometry: GEOM["HP-65"],  rows: HP65_ROWS, switches: [POWER, RUN_MODE("W/Prgm")] },
  "HP-25":  { id: "HP-25",  name: "HP-25",  family: "classic", sub: "RPN · PROGRAM",    angle: true,  geometry: GEOM["HP-25"],  rows: HP25_ROWS, switches: [POWER, RUN_MODE("Prgm")] },
  "HP-67":  { id: "HP-67",  name: "HP-67",  family: "classic", sub: "RPN · MAG CARD",   angle: true,  geometry: GEOM["HP-67"],  rows: HP67_ROWS, switches: [POWER, RUN_MODE("W/Prgm")] },
  "HP-97":  { id: "HP-97",  name: "HP-97",  family: "classic", sub: "RPN · PRINTER",  angle: true, geometry: GEOM["HP-97"],  rows: HP97_ROWS, printer: true,
    switches: [POWER, RUN_MODE("Prgm"), { caption: "Trace", left: "Man", right: "Norm", pos: "right", kind: "trace" }] },
  "HP-41C-CV": { id: "HP-41C-CV", name: "HP-41C/CV", family: "hp41", sub: "RPN · ALPHA", angle: true, geometry: GEOM["HP-41"], rows: HP41_ROWS },
  "HP-41CX":   { id: "HP-41CX",   name: "HP-41CX",   family: "hp41", sub: "RPN · ALPHA · TIME", angle: true, geometry: GEOM["HP-41"], rows: HP41_ROWS },
  "HP-11C": { id: "HP-11C", name: "HP-11C", family: "voyager", sub: "RPN · SCIENTIFIC", angle: true,  geometry: GEOM["HP-11C"], keys: GENERATED_VOYAGER["HP-11C"] },
  "HP-12C": { id: "HP-12C", name: "HP-12C", family: "voyager", sub: "RPN · FINANCIAL",  angle: false, geometry: GEOM["HP-12C"], keys: GENERATED_VOYAGER["HP-12C"] },
  "HP-15C": { id: "HP-15C", name: "HP-15C", family: "voyager", sub: "RPN · SCIENTIFIC", angle: true,  geometry: GEOM["HP-15C"], keys: GENERATED_VOYAGER["HP-15C"] },
  "HP-16C": { id: "HP-16C", name: "HP-16C", family: "voyager", sub: "RPN · PROGRAMMER", angle: false, geometry: GEOM["HP-16C"], keys: GENERATED_VOYAGER["HP-16C"] },
  // the 28-series dot-matrix panel is wider + shorter than the 48-series glass
  // (a ~137×32 4-line display), not the 131×64 the family default assumes
  "HP-28C": { id: "HP-28C", name: "HP-28C", family: "rpl", sub: "RPL · CLAMSHELL", angle: true, geometry: GEOM["HP-28C"], rows: HP28C_ROWS, lcdAspect: "137 / 40", clam: true,
    shift: { ls: "var(--hp-shift-ls-28)", rs: "var(--hp-shift-ls-28)" } },
  "HP-28S": { id: "HP-28S", name: "HP-28S", family: "rpl", sub: "RPL · CLAMSHELL", angle: true, geometry: GEOM["HP-28S"], rows: HP28S_ROWS, lcdAspect: "137 / 40", clam: true,
    shift: { ls: "var(--hp-shift-ls-28)", rs: "var(--hp-shift-ls-28)" } },
  "HP-42S":  { id: "HP-42S",  name: "HP-42S",  family: "pioneer", sub: "RPN · MENU",       angle: true, geometry: GEOM["HP-42S"],  rows: HP42S_ROWS },
  "HP-35s":  { id: "HP-35s",  name: "HP-35s",  family: "pioneer", sub: "RPN · SCIENTIFIC", angle: true, geometry: GEOM["HP-35s"],  rows: HP35S_ROWS },
  "HP-Prime":{ id: "HP-Prime",name: "HP Prime",family: "pioneer", sub: "CAS · TOUCH",      angle: true, geometry: GEOM["HP-Prime"],rows: HPPRIME_ROWS },
  "HP-17B":  { id: "HP-17B",  name: "HP-17B",  family: "pioneer", sub: "ALG · FINANCIAL",  angle: false, geometry: GEOM["HP-17B"],  rows: HP17B_ROWS },
  "HP-17BII":{ id: "HP-17BII",name: "HP-17BII",family: "pioneer", sub: "RPN · ALG · FINANCIAL", angle: false, geometry: GEOM["HP-17B"], rows: HP17B_ROWS },
  "HP-18C":  { id: "HP-18C",  name: "HP-18C",  family: "pioneer", sub: "ALG · CLAMSHELL",  angle: false, geometry: GEOM["HP-18C"],  rows: HP18C_ROWS },
  "HP-19B":  { id: "HP-19B",  name: "HP-19B",  family: "pioneer", sub: "ALG · CLAMSHELL",  angle: false, geometry: GEOM["HP-18C"],  rows: HP18C_ROWS },
  "HP-19BII":{ id: "HP-19BII",name: "HP-19BII",family: "pioneer", sub: "RPN · ALG · CLAMSHELL", angle: false, geometry: GEOM["HP-18C"], rows: HP18C_ROWS },
  // 12C Platinum: the 12C Voyager chassis (its additions — RPN/ALG mode, a
  // backspace key, faster CPU — are mostly non-keyboard), with ALG entry on.
  "HP-12C-Platinum": { id: "HP-12C-Platinum", name: "HP-12C Platinum", family: "voyager", sub: "RPN · ALG · FINANCIAL", angle: false, geometry: GEOM["HP-12C"], keys: GENERATED_VOYAGER["HP-12C"] },
  "HP-10BII": { id: "HP-10BII", name: "HP-10BII", family: "classic", sub: "ALG · FINANCIAL", angle: false, geometry: GEOM["HP-10BII"], rows: HP10BII_ROWS },
  "HP-20b":   { id: "HP-20b",   name: "HP-20b",   family: "pioneer", sub: "ALG · RPN · FINANCIAL", angle: false, geometry: GEOM["HP-30b"], rows: HP30B_ROWS },
  "HP-30b":   { id: "HP-30b",   name: "HP-30b",   family: "pioneer", sub: "ALG · RPN · PROGRAM", angle: false, geometry: GEOM["HP-30b"], rows: HP30B_ROWS },
  "HP-48SX": { id: "HP-48SX", name: "HP-48SX", family: "rpl", sub: "RPL · GRAPHING", angle: true, geometry: GEOM["HP-48SX"], rows: HP48SX_ROWS,
    shift: { ls: "var(--hp-shift-ls-sx)", rs: "var(--hp-shift-rs-sx)" } },
  "HP-48G": { id: "HP-48G", name: "HP-48G", family: "rpl",     sub: "RPL · GRAPHING",   angle: true,  geometry: GEOM["HP-48G"], rows: HP48G_ROWS },
  "HP-49G": { id: "HP-49G", name: "HP-49G", family: "rpl", sub: "RPL · CAS", angle: true, geometry: GEOM["HP-49G"], rows: HP49G_ROWS,
    shift: { ls: "var(--hp-shift-ls-49)", rs: "var(--hp-shift-rs-49)" } },
  "HP-50g": { id: "HP-50g", name: "HP-50g", family: "rpl", sub: "RPL · CAS", angle: true, geometry: GEOM["HP-50g"], rows: HP50G_ROWS, lcdAspect: "131 / 80",
    shift: { ls: "var(--hp-shift-ls-50)", rs: "var(--hp-shift-rs-50)", lsFg: "var(--hp-shift-f-fg)" } },
};

export const MODEL_ORDER = [
  "HP-35", "HP-45", "HP-65", "HP-25", "HP-67", "HP-97",
  "HP-41C-CV", "HP-41CX",
  "HP-11C", "HP-12C", "HP-15C", "HP-16C",
  "HP-28C", "HP-28S", "HP-42S",
  "HP-48SX", "HP-48G", "HP-49G", "HP-50g",
  "HP-35s", "HP-Prime",
  "HP-17B", "HP-17BII", "HP-18C", "HP-19B", "HP-19BII",
  "HP-12C-Platinum", "HP-10BII", "HP-20b", "HP-30b",
] as const;
