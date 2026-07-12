// src/lib/rpl/keywords.ts
// The RPL command vocabulary — the union of every menu roster (CATALOG_COMMANDS)
// plus the words the engine's evaluator handles that aren't on a menu (branch
// structures, the CAS/number-theory/plot/list families added across P14–P20).
// Pure data — used both for the code editor's syntax highlighting (is this
// word a command?) and its completion list. Kept in sync with the engine's
// execWord/execToken surface in src/lib/engine/rpl.ts.

import { CATALOG_COMMANDS } from "@/lib/engine/rpl/menu";

/** Commands the evaluator handles beyond the softkey menu rosters. */
const EXTRA: string[] = [
  // arithmetic / operators (highlight the bare glyphs too)
  "+", "-", "−", "*", "×", "/", "÷", "^", "√", "√x", "x²", "1/x", "ˣ√y",
  // branch & control structures
  "IF", "IFERR", "THEN", "ELSE", "END", "START", "FOR", "NEXT", "STEP",
  "DO", "UNTIL", "WHILE", "REPEAT", "IFT", "IFTE", "HALT", "ABORT", "KILL",
  "WAIT", "KEY", "BEEP", "SST", "→",
  // stack
  "DUP", "DUP2", "DUPN", "DROP", "DROP2", "DROPN", "SWAP", "OVER", "ROT",
  "PICK", "ROLL", "ROLLD", "DEPTH", "CLEAR", "LAST", "UNDO",
  // store / directories
  "STO", "RCL", "PURGE", "STO+", "STO−", "STO*", "STO/", "SNEG", "SINV",
  "SCONJ", "ORDER", "CLUSR", "MEM", "CRDIR", "HOME", "UP", "UPDIR", "PATH",
  "VARS", "MENU", "DEF",
  // reals / logs / trig
  "NEG", "INV", "ABS", "SIGN", "FACT", "!", "RAND", "RDZ", "IP", "FP",
  "FLOOR", "CEIL", "RND", "MAX", "MIN", "MOD", "%", "%CH", "%T", "MANT",
  "XPON", "MAXR", "MINR", "LN", "LOG", "EXP", "ALOG", "LNP1", "EXPM",
  "SINH", "ASINH", "COSH", "ACOSH", "TANH", "ATANH", "SIN", "COS", "TAN",
  "ASIN", "ACOS", "ATAN", "D→R", "R→D", "→HMS", "HMS→", "HMS+", "HMS−",
  // complex
  "R→C", "C→R", "RE", "IM", "CONJ", "ARG", "R→P", "P→R",
  // string / list / array
  "→STR", "STR→", "CHR", "NUM", "POS", "SUB", "SIZE", "→LIST", "LIST→",
  "GET", "PUT", "GETI", "PUTI", "DISP", "→ARRY", "ARRY→", "RDM", "TRN",
  "CON", "IDN", "CROSS", "DOT", "DET", "RNRM", "CNRM", "RREF", "RANK",
  "LU", "QR", "SVD", "EGV", "EGVL", "→V2", "→V3", "V→", "OBJ→", "PROOT",
  "PEVAL", "→Q", "TYPE", "SAME",
  // binary
  "DEC", "HEX", "OCT", "BIN", "STWS", "RCWS", "R→B", "B→R", "SL", "SR",
  "SLB", "SRB", "ASR", "RL", "RR", "RLB", "RRB", "AND", "OR", "XOR", "NOT",
  // flags / modes
  "SF", "CF", "FS?", "FC?", "FS?C", "FC?C", "STOF", "RCLF", "STD", "FIX",
  "SCI", "ENG", "DEG", "RAD", "GRD",
  // statistics
  "Σ+", "Σ−", "NΣ", "CLΣ", "STOΣ", "RCLΣ", "TOT", "MEAN", "SDEV", "VAR",
  "COLΣ", "CORR", "COV", "LR", "PREDV", "UTPC", "UTPF", "UTPN", "UTPT",
  "COMB", "PERM", "LINFIT", "LOGFIT", "EXPFIT", "PWRFIT", "BESTFIT",
  "PREDX", "PREDY",
  // solve / CAS
  "STEQ", "RCEQ", "SOLVR", "ISOL", "QUAD", "SHOW", "ROOT", "EVAL", "→NUM",
  "COLCT", "EXPAN", "FACTOR", "TAYLR", "d/dx", "∂", "∫", "DERVX", "INTVX",
  "SIMPLIFY", "SOLVEVX", "ZEROS", "SUBST", "lim", "SERIES", "PARTFRAC",
  "TEXPAND", "RISCH", "DESOLVE", "LAP", "ILAP", "GRAD", "LINSOLVE",
  // units
  "CONVERT", "→UNIT", "UBASE", "UVAL", "UFACT",
  // plotting / graphics
  "DRAW", "DRAX", "ERASE", "PMIN", "PMAX", "INDEP", "RES", "AXES", "CENTR",
  "PPAR", "*W", "*H", "PIXON", "PIXOFF", "LINE", "BOX", "PVIEW", "PX→C",
  "C→PX", "→GROB", "→LCD", "LCD→", "XRNG", "YRNG", "AUTO", "ATICK",
  "WIREFRAME", "SCLΣ", "DRWΣ", "PTYPE",
  // number theory / time / finance / lists
  "GCD", "LCM", "ISPRIME?", "NEXTPRIME", "FACTORS", "EULER", "TIME", "DATE",
  "DDAYS", "TSTR", "TVMROOT", "TVMBEG", "TVMEND", "AMORT", "DOLIST",
  "STREAM", "SEQ", "SORT", "REVLIST", "ΣLIST", "ΠLIST", "ΔLIST", "MSGBOX",
];

/** Every RPL command word, sorted and de-duplicated (the completion pool). */
export const RPL_COMMANDS: string[] = [
  ...new Set([...CATALOG_COMMANDS, ...EXTRA]),
].sort((a, b) => a.localeCompare(b));

/** Fast membership test for the syntax highlighter (is this word a command?). */
export const RPL_COMMAND_SET: ReadonlySet<string> = new Set(RPL_COMMANDS);
