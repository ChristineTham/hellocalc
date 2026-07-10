// src/components/calculator/models.ts
// Typed per-model faceplate data for the HP-calculator design system.
//
// SOURCE OF TRUTH: these arrays mirror the repo's verified `hp/` assets. In
// production, generate this file from `hp/mapping/mapping.json` (per model ->
// keys[] -> presses[] with access/color/function) at build time so faceplate
// rendering and keystroke dispatch never drift (PRD FR-MODEL-1/2). The literal
// data below matches the prototype (Hellocalc App.dc.html) for the four shipped
// models and is safe to use directly until the generator lands.

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

// ---- helpers -----------------------------------------------------------------
const v = (
  primary: string,
  f: string,
  g: string,
  col: number,
  row: number,
  kind: VoyagerKey["kind"],
  rowSpan = 1
): VoyagerKey => ({ primary, f, g, col, row, kind, rowSpan });

// ---- HP-12C (Voyager, financial) --------------------------------------------
const HP12C: VoyagerKey[] = [
  v("n","AMORT","12×",1,1,"fin"), v("i","INT","12÷",2,1,"fin"), v("PV","NPV","CFo",3,1,"fin"),
  v("PMT","RND","CFj",4,1,"fin"), v("FV","IRR","Nj",5,1,"fin"), v("CHS","","DATE",6,1,"std"),
  v("7","","BEG",7,1,"digit"), v("8","","END",8,1,"digit"), v("9","","MEM",9,1,"digit"), v("÷","","",10,1,"arith"),
  v("yˣ","PRICE","√x",1,2,"std"), v("1/x","YTM","eˣ",2,2,"std"), v("%T","SL","LN",3,2,"std"),
  v("Δ%","SOYD","FRAC",4,2,"std"), v("%","DB","INTG",5,2,"std"), v("EEX","","ΔDYS",6,2,"std"),
  v("4","","",7,2,"digit"), v("5","","",8,2,"digit"), v("6","","",9,2,"digit"), v("×","","",10,2,"arith"),
  v("R/S","P/R","PSE",1,3,"std"), v("SST","Σ","BST",2,3,"std"), v("R↓","PRGM","GTO",3,3,"std"),
  v("x⇄y","FIN","x≤y",4,3,"std"), v("CLx","REG","x=0",5,3,"std"), v("ENTER","PREFIX","LSTx",6,3,"enter",2),
  v("1","","x̂,r",7,3,"digit"), v("2","","ŷ,r",8,3,"digit"), v("3","","n!",9,3,"digit"), v("−","","",10,3,"arith"),
  v("ON","","",1,4,"on"), v("f","","",2,4,"pf"), v("g","","",3,4,"pg"),
  v("STO","","",4,4,"std"), v("RCL","","",5,4,"std"),
  v("0","","x̄",7,4,"digit"), v("•","","s",8,4,"digit"), v("Σ+","","Σ−",9,4,"std"), v("+","","",10,4,"arith"),
];

// ---- HP-15C (Voyager, scientific) -------------------------------------------
const HP15C: VoyagerKey[] = [
  v("√x","A","x²",1,1,"std"), v("eˣ","B","LN",2,1,"std"), v("10ˣ","C","LOG",3,1,"std"),
  v("yˣ","D","%",4,1,"std"), v("1/x","E","Δ%",5,1,"std"), v("CHS","MATRIX","ABS",6,1,"std"),
  v("7","FIX","DEG",7,1,"digit"), v("8","SCI","RAD",8,1,"digit"), v("9","ENG","GRD",9,1,"digit"), v("÷","SOLVE","x≤y",10,1,"arith"),
  v("SST","LBL","BST",1,2,"std"), v("GTO","HYP","HYP⁻¹",2,2,"std"), v("SIN","DIM","SIN⁻¹",3,2,"std"),
  v("COS","(i)","COS⁻¹",4,2,"std"), v("TAN","I","TAN⁻¹",5,2,"std"), v("EEX","RESULT","π",6,2,"std"),
  v("4","x≷","SF",7,2,"digit"), v("5","DSE","CF",8,2,"digit"), v("6","ISG","F?",9,2,"digit"), v("×","∫","x=0",10,2,"arith"),
  v("R/S","PSE","P/R",1,3,"std"), v("GSB","CLΣ","RTN",2,3,"std"), v("R↓","CLPRGM","R↑",3,3,"std"),
  v("x⇄y","CLREG","RND",4,3,"std"), v("←","CLPREF","CLx",5,3,"std"), v("ENTER","RAN#","LSTx",6,3,"enter",2),
  v("1","→R","→P",7,3,"digit"), v("2","→H.MS","→H",8,3,"digit"), v("3","→RAD","→DEG",9,3,"digit"), v("−","Re⇄Im","TEST",10,3,"arith"),
  v("ON","","",1,4,"on"), v("f","","",2,4,"pf"), v("g","","",3,4,"pg"),
  v("STO","FRAC","INT",4,4,"std"), v("RCL","USER","MEM",5,4,"std"),
  v("0","x!","x̄",7,4,"digit"), v("•","ŷ,r","s",8,4,"digit"), v("Σ+","L.R.","Σ−",9,4,"std"), v("+","Py,x","Cy,x",10,4,"arith"),
];

// ---- HP-35 (classic, red LED originally; rendered on the standard LCD) -------
const c = (legend: string, fn: string, cat: ClassicKey["cat"], flex = 1): ClassicKey => ({ legend, fn, cat, flex });
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
const r = (p: string, ls: string, rs: string, al: string, w = 1, kind: RplKey["kind"] = "std"): RplKey => ({ p, ls, rs, al, w, kind });
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
  "HP-35":  { id: "HP-35",  name: "HP-35",  family: "classic", sub: "RPN · LED",         angle: false, rows: HP35_ROWS },
  "HP-12C": { id: "HP-12C", name: "HP-12C", family: "voyager", sub: "RPN · FINANCIAL",   angle: false, keys: HP12C },
  "HP-15C": { id: "HP-15C", name: "HP-15C", family: "voyager", sub: "RPN · SCIENTIFIC",  angle: true,  keys: HP15C },
  "HP-48G": { id: "HP-48G", name: "HP-48G", family: "rpl",     sub: "RPL · GRAPHING",    angle: true,  rows: HP48G_ROWS },
};

export const MODEL_ORDER = ["HP-35", "HP-12C", "HP-15C", "HP-48G"] as const;
