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

export type Family = "voyager" | "classic" | "rpl";

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
  flex?: number; // ENTER = 2
  f?: string; // gold f-shift legend, as printed
  g?: string; // blue g-shift legend, as printed
  h?: string; // black h-shift legend, as printed (HP-67)
  kind?: "pf" | "pfi" | "pg" | "ph"; // prefix keys (f / f⁻¹ / g / h)
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
}
export type Model =
  | (ModelBase & { family: "voyager"; keys: VoyagerKey[] })
  | (ModelBase & { family: "classic"; rows: ClassicKey[][] })
  | (ModelBase & { family: "rpl"; rows: RplKey[][] });

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
  opts: Partial<Pick<ClassicKey, "f" | "g" | "h" | "kind" | "flex">> = {},
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
  [ck("x⇄y","x⇄y","black",{f:"n!"}),ck("R↓","R↓","black",{f:"x̄,s"}),ck("STO","STO","black",{f:"→D.MS"}),ck("RCL","RCL","black",{f:"D.MS→"}),ck("%","%","black",{f:"Δ%"})],
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
  [ck("x⇄y","x⇄y","black",{f:"x̄",g:"%"}),ck("R↓","R↓","black",{f:"s",g:"1/x"}),ck("STO","STO","black"),ck("RCL","RCL","black"),ck("Σ+","Σ+","black",{f:"Σ−"})],
  [ck("ENTER↑","ENTER","black",{flex:2,f:"PREFIX"}),ck("CHS","CHS","black",{f:"PRGM",g:"DEG"}),ck("EEX","EEX","black",{f:"REG",g:"RAD"}),ck("CLX","CLx","black",{f:"STK",g:"GRD"})],
  [ck("−","−","black",{f:"x<y",g:"x<0"}),ck("7","7","black",{f:"ln",g:"eˣ"}),ck("8","8","black",{f:"log",g:"10ˣ"}),ck("9","9","black",{f:"→R",g:"→P"})],
  [ck("+","+","black",{f:"x≥y",g:"x≥0"}),ck("4","4","black",{f:"sin",g:"sin⁻¹"}),ck("5","5","black",{f:"cos",g:"cos⁻¹"}),ck("6","6","black",{f:"tan",g:"tan⁻¹"})],
  [ck("×","×","black",{f:"x≠y",g:"x≠0"}),ck("1","1","black",{f:"INT",g:"FRAC"}),ck("2","2","black",{f:"√x",g:"x²"}),ck("3","3","black",{f:"yˣ",g:"ABS"})],
  [ck("÷","÷","black",{f:"x=y",g:"x=0"}),ck("0","0","black",{f:"→H.MS",g:"→H"}),ck(".",".","black",{f:"LAST x",g:"π"}),ck("R/S","R/S","black",{f:"PAUSE",g:"NOP"})],
];

// ---- HP-67 (classic programmable: f gold / g blue / h black) -----------------
const HP67_ROWS: ClassicKey[][] = [
  [ck("A","A","black",{f:"a"}),ck("B","B","black",{f:"b"}),ck("C","C","black",{f:"c"}),ck("D","D","black",{f:"d"}),ck("E","E","black",{f:"e"})],
  [ck("Σ+","Σ+","black",{f:"x̄",g:"s",h:"Σ−"}),ck("GTO","GTO","black",{f:"GSB",h:"RTN"}),ck("DSP","DSP","black",{f:"FIX",g:"SCI",h:"ENG"}),ck("(i)","(i)","black",{f:"RND",h:"x⇄I"}),ck("SST","SST","black",{f:"LBL",h:"BST"})],
  [ck("f","f","gold",{kind:"pf"}),ck("g","g","blue",{kind:"pg"}),ck("STO","STO","black",{f:"DSZ",g:"DSZ (i)",h:"ST I"}),ck("RCL","RCL","black",{f:"ISZ",g:"ISZ (i)",h:"RC I"}),ck("h","h","black",{kind:"ph"})],
  [ck("ENTER↑","ENTER","black",{flex:2,f:"W/DATA",g:"MERGE",h:"DEG"}),ck("CHS","CHS","black",{f:"P⇄S",h:"RAD"}),ck("EEX","EEX","black",{f:"CL REG",h:"GRD"}),ck("CL X","CLx","black",{f:"CL PRGM",h:"DEL"})],
  [ck("−","−","black",{f:"x=0",g:"x=y",h:"SF"}),ck("7","7","black",{f:"LN",g:"eˣ",h:"x⇄y"}),ck("8","8","black",{f:"LOG",g:"10ˣ",h:"R↓"}),ck("9","9","black",{f:"√x",g:"x²",h:"R↑"})],
  [ck("+","+","black",{f:"x≠0",g:"x≠y",h:"CF"}),ck("4","4","black",{f:"SIN",g:"SIN⁻¹",h:"1/x"}),ck("5","5","black",{f:"COS",g:"COS⁻¹",h:"yˣ"}),ck("6","6","black",{f:"TAN",g:"TAN⁻¹",h:"ABS"})],
  [ck("×","×","black",{f:"x<0",g:"x≤y",h:"F?"}),ck("1","1","black",{f:"→R",g:"→P",h:"PAUSE"}),ck("2","2","black",{f:"D→R",g:"R→D",h:"π"}),ck("3","3","black",{f:"→H",g:"→H.MS",h:"REG"})],
  [ck("÷","÷","black",{f:"x>0",g:"x>y",h:"N!"}),ck("0","0","black",{f:"%",g:"%CH",h:"LST X"}),ck(".",".","black",{f:"INT",g:"FRAC",h:"H.MS+"}),ck("R/S","R/S","black",{f:"−x−",g:"STK",h:"SPACE"})],
];

// ---- HP-48G (RPL, graphing) --------------------------------------------------
const r = (
  p: string,
  ls: string,
  rs: string,
  al: string,
  w = 1,
  kind: RplKey["kind"] = "std",
): RplKey => ({ p, ls, rs, al, w, kind });
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

// Geometry is DERIVED per model from its key data (never hand-tuned): the
// 10×4 Voyagers land ≈2.89 (landscape); HP-35 5×8 ≈0.70 and HP-48G 6×9 ≈0.72
// (both portrait — just above the 0.68 tall threshold).
const GEOM = {
  "HP-35": computeKeyboardGeometry({ rows: HP35_ROWS }, "classic"),
  "HP-45": computeKeyboardGeometry({ rows: HP45_ROWS }, "classic"),
  "HP-65": computeKeyboardGeometry({ rows: HP65_ROWS }, "classic"),
  "HP-25": computeKeyboardGeometry({ rows: HP25_ROWS }, "classic"),
  "HP-67": computeKeyboardGeometry({ rows: HP67_ROWS }, "classic"),
  "HP-11C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-11C"] }, "voyager"),
  "HP-12C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-12C"] }, "voyager"),
  "HP-15C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-15C"] }, "voyager"),
  "HP-16C": computeKeyboardGeometry({ keys: GENERATED_VOYAGER["HP-16C"] }, "voyager"),
  // Per-model aspectClass override (§11 #4, §14 rev 5): at A≈0.722 the 48G is
  // numerically just above the 0.68 tall threshold, but its 9-row keyboard
  // BEHAVES tall — stacked on a desktop it starves the glass. Classing it
  // tall sends it side-by-side on desktops while true portrait classics
  // (HP-35, 8 rows) keep the LCD-above-keys look.
  "HP-48G": computeKeyboardGeometry({ rows: HP48G_ROWS }, "rpl", { aspectClass: "tall" }),
} satisfies Record<string, KeyboardGeometry>;

export const MODELS: Record<string, Model> = {
  "HP-35":  { id: "HP-35",  name: "HP-35",  family: "classic", sub: "RPN · LED",        angle: false, geometry: GEOM["HP-35"],  rows: HP35_ROWS },
  "HP-45":  { id: "HP-45",  name: "HP-45",  family: "classic", sub: "RPN · SCIENTIFIC", angle: true,  geometry: GEOM["HP-45"],  rows: HP45_ROWS },
  "HP-65":  { id: "HP-65",  name: "HP-65",  family: "classic", sub: "RPN · MAG CARD",   angle: true,  geometry: GEOM["HP-65"],  rows: HP65_ROWS },
  "HP-25":  { id: "HP-25",  name: "HP-25",  family: "classic", sub: "RPN · PROGRAM",    angle: true,  geometry: GEOM["HP-25"],  rows: HP25_ROWS },
  "HP-67":  { id: "HP-67",  name: "HP-67",  family: "classic", sub: "RPN · MAG CARD",   angle: true,  geometry: GEOM["HP-67"],  rows: HP67_ROWS },
  "HP-11C": { id: "HP-11C", name: "HP-11C", family: "voyager", sub: "RPN · SCIENTIFIC", angle: true,  geometry: GEOM["HP-11C"], keys: GENERATED_VOYAGER["HP-11C"] },
  "HP-12C": { id: "HP-12C", name: "HP-12C", family: "voyager", sub: "RPN · FINANCIAL",  angle: false, geometry: GEOM["HP-12C"], keys: GENERATED_VOYAGER["HP-12C"] },
  "HP-15C": { id: "HP-15C", name: "HP-15C", family: "voyager", sub: "RPN · SCIENTIFIC", angle: true,  geometry: GEOM["HP-15C"], keys: GENERATED_VOYAGER["HP-15C"] },
  "HP-16C": { id: "HP-16C", name: "HP-16C", family: "voyager", sub: "RPN · PROGRAMMER", angle: false, geometry: GEOM["HP-16C"], keys: GENERATED_VOYAGER["HP-16C"] },
  "HP-48G": { id: "HP-48G", name: "HP-48G", family: "rpl",     sub: "RPL · GRAPHING",   angle: true,  geometry: GEOM["HP-48G"], rows: HP48G_ROWS },
};

export const MODEL_ORDER = [
  "HP-35", "HP-45", "HP-65", "HP-25", "HP-67",
  "HP-11C", "HP-12C", "HP-15C", "HP-16C",
  "HP-48G",
] as const;
