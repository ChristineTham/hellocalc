// src/lib/engine/menuFin.ts
// The HP-17B/17BII/19B/19BII/18C menu rosters — the MAIN → FIN/BUS/SUM/TIME/
// SOLVE tree that rides the six softkeys on the top display line, exactly like
// menu42.ts does for the 42S. Labels resolve to engine command ids, or to a
// nested menu ("@NAME"), or are filled in dynamically (SOLVER equation list,
// CFLO cash-flow list, SUM statistics list). Pure data.

export const MENUS_FIN: Record<string, string[]> = {
  // top level — the machine wakes into MAIN. The 6th label is model-specific
  // (MATH on the 18C, TEXT on the 19B/19BII, CURRX on the 17BII); the shared
  // engine is model-agnostic, so MAIN keeps the five common apps and the sixth
  // slot stays blank (per-model sixth-label refinement tracked as follow-up).
  MAIN: ["@FIN", "@BUS", "@SUM", "@TIME", "SOLVE", ""],

  // ---- FIN: the financial applications --------------------------------------
  FIN: ["@TVM", "@ICNV", "@CFLO", "@BOND", "@DEPRC"],
  // Time value of money: five registers + an OTHER page (payments/yr, mode)
  TVM: ["N", "I%YR", "PV", "PMT", "FV", "@OTHER"],
  OTHER: ["P/YR", "BEG", "END", "AMORT"],
  // Interest-rate conversion (periodic ⇄ effective; continuous)
  ICNV: ["@PER", "@CONT"],
  PER: ["NOM%", "EFF%", "P"],
  CONT: ["NOM%", "EFF%"],
  // Cash flows: the list is dynamic; CALC yields the four results
  CFLO: ["CALC"],
  CFLOCALC: ["IRR%", "NPV", "NUS", "NFV"],
  // Bonds
  BOND: ["SETT", "MAT", "CPN%", "@BTYPE", "MORE"],
  BTYPE: ["YLD%", "PRICE", "ACCRU"],
  // Depreciation
  DEPRC: ["BASIS", "SALV", "LIFE", "@DMETH"],
  DMETH: ["SL", "DB", "SOYD", "ACRS"],

  // ---- BUS: business percentages (+ CURRX/UNITS sub-items, per 19BII) -------
  BUS: ["%CHG", "%TOTL", "MU%C", "MU%P", "@CURRX", "UNITS"],

  // ---- SUM: statistics (the list is dynamic) --------------------------------
  SUM: ["CALC"],
  SUMCALC: ["TOTAL", "MEAN", "MEDN", "STDEV", "RANG", "MORE"],

  // ---- TIME: clock / calendar -----------------------------------------------
  TIME: ["@CALC", "ADJST", "SET"],
  TIMECALC: ["DATE", "DDAYS"],

  // ---- CURRX: currency conversion -------------------------------------------
  CURRX: ["#1", "#2", "RATE", "STORE"],
};

/** Menus whose labels the engine fills in at call time (equation list, cash-
 * flow list, statistics list). */
export const DYNAMIC_FIN = new Set(["SOLVER", "CFLO", "SUM"]);

/** The MAIN-menu label a machine wakes into. */
export const FIN_HOME = "MAIN";

/** Every menu name reachable in the financial tree (for validation/tests). */
export const FIN_MENU_NAMES = Object.keys(MENUS_FIN);
