// src/components/calculator/models.ts
// Typed per-model faceplate data for the HP-calculator design system.
//
// Voyager (HP-12C / HP-15C) key grids are GENERATED from the verified
// hp/mapping/mapping.json — see scripts/gen-models.ts -> models.generated.ts —
// so faceplate legends never drift from keystroke dispatch (PRD FR-MODEL-1/2).
// Classic (HP-35) and RPL (HP-48G) have irregular column widths / extra shift
// layers, so their rows are authored here, mirroring hp/layouts/<MODEL>.md.

import { GENERATED_VOYAGER } from "./models.generated";

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

/** Classic (HP-35): shiftless; blue/black/beige key categories; `arc` prefix. */
export interface ClassicKey {
  legend: string; // as printed
  fn: string; // engine function id
  cat: "black" | "beige" | "blue";
  flex?: number; // ENTER = 2
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

export const MODELS: Record<string, Model> = {
  "HP-35":  { id: "HP-35",  name: "HP-35",  family: "classic", sub: "RPN · LED",        angle: false, rows: HP35_ROWS },
  "HP-12C": { id: "HP-12C", name: "HP-12C", family: "voyager", sub: "RPN · FINANCIAL",  angle: false, keys: GENERATED_VOYAGER["HP-12C"] },
  "HP-15C": { id: "HP-15C", name: "HP-15C", family: "voyager", sub: "RPN · SCIENTIFIC", angle: true,  keys: GENERATED_VOYAGER["HP-15C"] },
  "HP-48G": { id: "HP-48G", name: "HP-48G", family: "rpl",     sub: "RPL · GRAPHING",   angle: true,  rows: HP48G_ROWS },
};

export const MODEL_ORDER = ["HP-35", "HP-12C", "HP-15C", "HP-48G"] as const;
