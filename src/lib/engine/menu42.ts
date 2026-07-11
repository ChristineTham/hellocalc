// src/lib/engine/menu42.ts
// The HP-42S RPN menu rosters (P16): shifted keys open menus whose six
// labels ride the TOP KEY ROW (unlike the RPL machines' dedicated soft
// keys). Distinct from rpl/menu.ts — a 4-level RPN machine pages menus with
// ▲/▼ and pops with EXIT. Labels resolve to engine command ids (or nested
// menu names, prefixed "@"). Pure data.

export const MENUS42: Record<string, string[]> = {
  // top-row STAT: accumulate + descriptive + the CFIT submenu
  STAT: ["Σ+", "SUM", "MEAN", "WMN", "SDEV", "@CFIT"],
  CFIT: ["FCSTX", "FCSTY", "SLOPE", "YINT", "CORR", "@MODL"],
  MODL: ["LINF", "LOGF", "EXPF", "PWRF", "BEST"],
  PROB: ["COMB", "PERM", "N!", "GAMMA", "RAN", "SEED"],
  CONVERT: ["→DEG", "→RAD", "→HR", "→HMS", "→REC", "→POL"],
  BASE: ["HEX", "DEC", "OCT", "BIN", "@LOGIC"],
  LOGIC: ["AND", "OR", "XOR", "NOT"],
  MODES: ["DEG", "RAD", "GRAD"],
  DISP: ["FIX", "SCI", "ENG", "ALL"],
  FLAGS: ["SF", "CF", "FS?", "FC?"],
  CLEAR: ["CLΣ", "CLP", "CLST", "CLA", "CLX"],
  MATRIX: ["DIM", "DET", "TRN", "INV", "RESULT"],
  "PGM.FCN": ["LBL", "RTN", "GTO", "XEQ", "MVAR", "@VARMENU"],
  "TOP.FCN": ["Σ+", "1/x", "√x", "LOG", "LN", "XEQ"],
  PRINT: ["PRX", "PRSTK", "PRΣ", "PRP"],
  // SOLVER / ∫f(x) / CATALOG / CUSTOM / ALPHA / VARMENU resolve dynamically
};

/** The ALPHA menu types into the alpha register — letter pages. */
export const ALPHA_PAGES: string[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  "␣", // space
];

/** Menus whose labels the engine resolves at call time. */
export const DYNAMIC_MENUS = new Set(["SOLVER", "∫f(x)", "CUSTOM", "ALPHA", "VARMENU", "CATALOG"]);

/** Every shifted key id that opens a menu. */
export const MENU42_OPEN = new Set([
  ...Object.keys(MENUS42),
  ...DYNAMIC_MENUS,
]);
