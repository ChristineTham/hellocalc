// src/lib/engine/rpl/menu.ts
// The RPL softkey MENU system (P12): 6-label pages resolved from the menu
// rosters in hp/functions/HP-28C.md (Owner's Manual Appendix C menu map).
// Model-agnostic by design — the 42S (P16) and 48/49/50g (P17–P20) reuse the
// same page/label machinery with their own rosters. Pure TS, no React.

/** Static menu rosters (manual order). USER / CATALOG / SOLVR are dynamic —
 * the engine substitutes variable names / the command catalog at call time. */
export const RPL_MENUS: Record<string, string[]> = {
  STACK: ["DUP", "OVER", "DUP2", "DROP2", "ROT", "LIST→", "ROLLD", "PICK", "DUPN", "DROPN", "DEPTH", "→LIST"],
  STORE: ["STO+", "STO−", "STO*", "STO/", "SNEG", "SINV", "SCONJ"],
  REAL: ["NEG", "FACT", "RAND", "RDZ", "MAXR", "MINR", "ABS", "SIGN", "MANT", "XPON", "IP", "FP", "FLOOR", "CEIL", "RND", "MAX", "MIN", "MOD", "%T"],
  LOGS: ["LOG", "ALOG", "LN", "EXP", "LNP1", "EXPM", "SINH", "ASINH", "COSH", "ACOSH", "TANH", "ATANH"],
  TRIG: ["SIN", "ASIN", "COS", "ACOS", "TAN", "ATAN", "P→R", "R→P", "R→C", "C→R", "ARG", "→HMS", "HMS→", "HMS+", "HMS−", "D→R", "R→D"],
  COMPLEX: ["R→C", "C→R", "RE", "IM", "CONJ", "SIGN", "R→P", "P→R", "ABS", "NEG", "ARG"],
  STRING: ["→STR", "STR→", "CHR", "NUM", "POS", "DISP", "SUB", "SIZE"],
  LIST: ["→LIST", "LIST→", "PUT", "GET", "PUTI", "GETI", "SUB", "SIZE"],
  ARRAY: ["→ARRY", "ARRY→", "PUT", "GET", "PUTI", "GETI", "SIZE", "RDM", "TRN", "CON", "IDN", "RSD", "CROSS", "DOT", "DET", "ABS", "RNRM", "CNRM", "R→C", "C→R", "RE", "IM", "CONJ", "NEG"],
  BINARY: ["DEC", "HEX", "OCT", "BIN", "STWS", "RCWS", "RL", "RR", "RLB", "RRB", "R→B", "B→R", "SL", "SR", "SLB", "SRB", "ASR", "AND", "OR", "XOR", "NOT"],
  MODE: ["STD", "FIX", "SCI", "ENG", "DEG", "RAD", "+CMD", "−CMD", "+LAST", "−LAST", "+UND", "−UND", "+ML", "−ML", "RDX.", "RDX,", "PRMD"],
  TEST: ["SF", "CF", "FS?", "FC?", "FS?C", "FC?C", "AND", "OR", "XOR", "NOT", "SAME", "==", "STOF", "RCLF", "TYPE"],
  BRANCH: ["IF", "IFERR", "THEN", "ELSE", "END", "START", "FOR", "NEXT", "STEP", "IFT", "IFTE", "DO", "UNTIL", "WHILE", "REPEAT"],
  CTRL: ["SST", "HALT", "ABORT", "KILL", "WAIT", "KEY", "BEEP", "CLLCD", "DISP", "CLMF", "ERRN", "ERRM"],
  STAT: ["Σ+", "Σ−", "NΣ", "CLΣ", "STOΣ", "RCLΣ", "TOT", "MEAN", "SDEV", "VAR", "MAXΣ", "MINΣ", "COLΣ", "CORR", "COV", "LR", "PREDV", "UTPC", "UTPF", "UTPN", "UTPT", "COMB", "PERM", "LINFIT", "LOGFIT", "EXPFIT", "PWRFIT", "BESTFIT", "PREDX", "PREDY", "SCATRPLOT", "BARPLOT", "HISTPLOT"],
  PLOT: ["STEQ", "RCEQ", "PMIN", "PMAX", "INDEP", "DRAW", "PPAR", "RES", "AXES", "CENTR", "*W", "*H", "STOΣ", "RCLΣ", "COLΣ", "SCLΣ", "DRWΣ", "CLLCD", "DISP", "PRLCD", "XRNG", "YRNG", "AUTO", "WIREFRAME", "ERASE"],
  PRINT: ["PR1", "PRST", "PRVAR", "PRLCD", "TRACE", "NORM", "PRSTC", "PRUSR", "PRMD", "CR"],
  SOLVE: ["STEQ", "RCEQ", "SOLVR", "ISOL", "QUAD", "SHOW", "ROOT", "TVM", "AMORT"],
  // labels render; execution defers to the P14 CAS (delivery note)
  ALGEBRA: ["COLCT", "EXPAN", "SIZE", "FORM", "OBSUB", "EXSUB", "TAYLR", "ISOL", "QUAD", "SHOW", "OBGET", "EXGET"],
  // ---- 48-series menus (P17) — labels naming another roster OPEN it ----------
  MTH: ["PARTS", "PROB", "HYP", "MATR", "VECTR", "BASE"],
  PARTS: ["ABS", "SIGN", "IP", "FP", "FLOOR", "CEIL", "RND", "MANT", "XPON", "MAX", "MIN", "MOD", "%T", "%CH"],
  PROB: ["COMB", "PERM", "!", "RAND", "RDZ", "UTPC", "UTPF", "UTPN", "UTPT"],
  HYP: ["SINH", "ASINH", "COSH", "ACOSH", "TANH", "ATANH", "EXPM", "LNP1"],
  MATR: ["DET", "TRN", "INV", "RSD", "RNRM", "CNRM", "→ARRY", "ARRY→", "RDM", "CON", "IDN", "PROOT", "PEVAL"],
  VECTR: ["→V2", "→V3", "V→", "CROSS", "DOT", "ABS"],
  BASE: ["HEX", "DEC", "OCT", "BIN", "STWS", "RCWS", "R→B", "B→R"],
  PRG: ["STACK", "OBJ", "DSPL", "CTRL", "BRANCH", "TEST"],
  OBJ: ["→STR", "STR→", "→LIST", "LIST→", "→ARRY", "ARRY→", "OBJ→", "TYPE", "→Q"],
  LIST48: ["DOLIST", "STREAM", "SEQ", "SORT", "REVLIST", "ΣLIST", "ΠLIST", "ΔLIST"],
  MATR48: ["RREF", "RANK", "LU", "QR", "SVD", "EGV", "EGVL"],
  TVMM: ["TVMROOT", "TVMBEG", "TVMEND", "AMORT"],
  DSPL: ["PIXON", "PIXOFF", "LINE", "BOX", "→GROB", "PVIEW", "CLLCD", "DISP", "→LCD", "LCD→"],
  IO: ["SEND", "RECV", "SERVER", "KGET", "FINISH"],
  LIBRARY: ["PORTS", "ATTACH", "DETACH"],
  TIME48: ["DATE", "TIME", "DDAYS", "TSTR", "→DATE", "→TIME"],
  PLOTP: ["STEQ", "RCEQ", "PTYPE", "DRAW", "ERASE", "PVIEW"],
  SYMBOLIC: ["COLCT", "EXPAN", "ISOL", "QUAD", "TAYLR", "SHOW", "d/dx", "∫"],
};

/** Every command the static rosters mention — the CATALOG's inventory. */
export const CATALOG_COMMANDS: string[] = [
  ...new Set(Object.values(RPL_MENUS).flat()),
].sort();

export const PAGE_SIZE = 6;

export const pageCount = (labels: string[]): number =>
  Math.max(1, Math.ceil(labels.length / PAGE_SIZE));

/** The six labels visible on `page` (wraps handled by the caller's paging). */
export function pageLabels(labels: string[], page: number): string[] {
  const p = ((page % pageCount(labels)) + pageCount(labels)) % pageCount(labels);
  const out = labels.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);
  while (out.length < PAGE_SIZE) out.push("");
  return out;
}
