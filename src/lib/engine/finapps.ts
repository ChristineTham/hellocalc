// src/lib/engine/finapps.ts
// The menu-driven financial applications of the 17B/17BII/18C/19B/19BII/27S/30b
// beyond TVM: each is a set of VARIABLES you store into (softkeys) plus RESULT
// variables computed from them — ICNV (interest conversion), BOND, DEPRC
// (depreciation), and Black–Scholes options. The maths already lives in
// finance.ts / business.ts; this file just declares each app's variable set and
// how a result is computed from the stored inputs. Pure TS — no React/DOM.

import { bn, type Value } from "./config";
import { effToNom, nomToEff } from "./business";
import {
  addDays,
  blackScholes,
  bondPrice,
  bondYTM,
  daysBetween,
  decodeDate,
  depDB,
  depSL,
  depSOYD,
  encodeDate,
} from "./finance";

export interface FinApp {
  /** heading for the variable panel */
  title: string;
  /** every variable, in menu order (inputs then results) */
  vars: string[];
  /** the RESULT variables — pressing one computes it from the stored inputs
   * (all others are input variables you store into) */
  results: Set<string>;
  /** results that ALWAYS compute, even right after a keyed number (the key is
   * an argument, not a value to store) — e.g. DEPRC's per-year methods and the
   * Black–Scholes prices. Interchangeable results (YLD%⇄PRICE) are NOT here:
   * keying a number stores them so the reverse can be computed. */
  computeOnly?: Set<string>;
  /** variables that hold a date (M.DYYYYY) — shown/echoed as a readable date. */
  dates?: Set<string>;
  /** compute a result variable from the current variable store; `x` is the
   * value currently in the X register (used where an app needs a live argument,
   * e.g. the DEPRC year). Returns null when required inputs are missing. */
  compute(store: Record<string, Value>, target: string, x: Value): Value | null;
}

/** The financial applications, keyed by app id. */
export const FIN_APPS: Record<string, FinApp> = {
  // ---- ICNV: nominal ⇄ effective interest conversion --------------------------
  ICNV: {
    title: "Interest Conversion",
    vars: ["NOM%", "EFF%", "P"],
    results: new Set(["NOM%", "EFF%"]),
    compute(s, t) {
      const p = s["P"] ?? bn(1);
      if (t === "EFF%" && s["NOM%"] !== undefined) return nomToEff(s["NOM%"], p);
      if (t === "NOM%" && s["EFF%"] !== undefined) return effToNom(s["EFF%"], p);
      return null;
    },
  },

  // ---- BOND: price ⇄ yield (semiannual, actual/actual) ------------------------
  // SETT / MAT are keyed as M.DYYYYY dates (the 12C convention); CPN% is the
  // annual coupon. Store four of {SETT, MAT, CPN%, YLD%, PRICE} and compute the
  // fifth (YLD% ⇄ PRICE).
  BOND: {
    title: "Bond",
    vars: ["SETT", "MAT", "CPN%", "YLD%", "PRICE", "ACCRU"],
    results: new Set(["YLD%", "PRICE", "ACCRU"]),
    computeOnly: new Set(["ACCRU"]),
    dates: new Set(["SETT", "MAT"]),
    compute(s, t) {
      const settle = s["SETT"] !== undefined ? decodeDate(s["SETT"], false) : null;
      const mat = s["MAT"] !== undefined ? decodeDate(s["MAT"], false) : null;
      const cpn = s["CPN%"];
      if (!settle || !mat || cpn === undefined) return null;
      if (t === "PRICE" && s["YLD%"] !== undefined)
        return bondPrice(settle, mat, s["YLD%"], cpn).price;
      if (t === "YLD%" && s["PRICE"] !== undefined) return bondYTM(settle, mat, s["PRICE"], cpn);
      // accrued interest since the last coupon (uses the yield if known)
      if (t === "ACCRU") return bondPrice(settle, mat, s["YLD%"] ?? bn(0), cpn).accrued;
      return null;
    },
  },

  // ---- DEPRC: depreciation for the year in X ---------------------------------
  // Store BASIS (cost), SALV (salvage), LIFE (years); key the year into X then
  // press SL / SOYD / DB to get that year's depreciation.
  DEPRC: {
    title: "Depreciation",
    vars: ["BASIS", "SALV", "LIFE", "SL", "SOYD", "DB"],
    results: new Set(["SL", "SOYD", "DB"]),
    computeOnly: new Set(["SL", "SOYD", "DB"]),
    compute(s, t, x) {
      const cost = s["BASIS"];
      const salv = s["SALV"];
      const life = s["LIFE"];
      if (cost === undefined || salv === undefined || life === undefined) return null;
      const yr = x.isZero() ? bn(1) : x; // the year to depreciate (default 1)
      if (t === "SL") return depSL(cost, salv, life, yr).dep;
      if (t === "SOYD") return depSOYD(cost, salv, life, yr).dep;
      if (t === "DB") return depDB(cost, salv, life, bn(200), yr).dep; // 200% declining
      return null;
    },
  },

  // ---- TIME: date arithmetic -------------------------------------------------
  // DATE1 / DATE2 are keyed as M.DYYYYY numbers; DDAYS is the count of days
  // between them. Store any two and compute the third.
  TIME: {
    title: "Date Calc",
    vars: ["DATE1", "DATE2", "DDAYS"],
    results: new Set(["DATE1", "DATE2", "DDAYS"]),
    dates: new Set(["DATE1", "DATE2"]),
    compute(s, t) {
      const d1 = s["DATE1"] !== undefined ? decodeDate(s["DATE1"], false) : null;
      const d2 = s["DATE2"] !== undefined ? decodeDate(s["DATE2"], false) : null;
      const days = s["DDAYS"];
      if (t === "DDAYS" && d1 && d2) return bn(daysBetween(d1, d2));
      if (t === "DATE2" && d1 && days !== undefined)
        return encodeDate(addDays(d1, days.toNumber()), false);
      if (t === "DATE1" && d2 && days !== undefined)
        return encodeDate(addDays(d2, -days.toNumber()), false);
      return null;
    },
  },

  // ---- CURRX: currency conversion --------------------------------------------
  // RATE = units of currency 2 per unit of currency 1. Store RATE + an amount
  // in one currency, compute the other.
  CURRX: {
    title: "Currency",
    vars: ["RATE", "#1", "#2"],
    results: new Set(["#1", "#2"]),
    compute(s, t) {
      const rate = s["RATE"];
      if (rate === undefined || rate.isZero()) return null;
      if (t === "#2" && s["#1"] !== undefined) return s["#1"].times(rate);
      if (t === "#1" && s["#2"] !== undefined) return s["#2"].div(rate);
      return null;
    },
  },

  // ---- Black–Scholes European options ----------------------------------------
  // RATE and VOL are entered as percentages; TIME in years.
  BS: {
    title: "Black–Scholes",
    vars: ["SPOT", "STRIKE", "RATE", "VOL", "TIME", "CALL", "PUT"],
    results: new Set(["CALL", "PUT"]),
    computeOnly: new Set(["CALL", "PUT"]),
    compute(s, t) {
      const spot = s["SPOT"];
      const strike = s["STRIKE"];
      const rate = s["RATE"];
      const vol = s["VOL"];
      const time = s["TIME"];
      if (spot === undefined || strike === undefined || rate === undefined) return null;
      if (vol === undefined || time === undefined) return null;
      const { call, put } = blackScholes(spot, strike, rate.div(100), vol.div(100), time);
      return t === "CALL" ? call : t === "PUT" ? put : null;
    },
  },
};

/** Which app each financial menu drives — routing is by the ACTIVE MENU (not by
 * label) so a shared label like RATE resolves to Black–Scholes on the BS menu
 * and to Currency on the CURRX menu. */
export const FIN_APP_MENUS: Record<string, string> = {
  PER: "ICNV",
  CONT: "ICNV",
  BOND: "BOND",
  DEPRC: "DEPRC",
  DMETH: "DEPRC",
  BS: "BS",
  BSCALC: "BS",
  TIME: "TIME",
  CURRX: "CURRX",
};
