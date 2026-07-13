// src/lib/engine/listapps.ts
// The LIST-based financial/stat apps of the 17B/17BII/18C/19B/19BII/27S: CFLO
// (an uneven cash-flow list → IRR/NPV/NFV/NUS) and SUM (a statistics data list
// → total/mean/median/std-dev/range). Unlike TVM/BOND (fixed variable sets),
// these accumulate a LIST you build with INPUT, then a CALC submenu computes
// results from it. The maths lives in finance.ts; this declares each list app's
// results. Pure TS — no React/DOM.

import { bn, type Value } from "./config";
import { irr, npv } from "./finance";

export interface ListApp {
  title: string;
  /** the menu whose INPUT key appends the X register to this list */
  menu: string;
  /** result label → compute from the items (rate = discount rate for CFLO) */
  results: Record<string, (items: Value[], rate: Value) => Value | null>;
}

const total = (xs: Value[]): Value => xs.reduce((a, b) => a.plus(b), bn(0));
const asCfs = (items: Value[]) => items.map((v) => ({ amt: v.toString(), count: 1 }));

export const LIST_APPS: Record<string, ListApp> = {
  // ---- CFLO: uneven cash flows -----------------------------------------------
  CFLO: {
    title: "Cash Flows",
    menu: "CFLO",
    results: {
      "IRR%": (items) => (items.length ? irr(asCfs(items)) : null),
      NPV: (items, rate) => (items.length ? npv(asCfs(items), rate) : null),
      // Net Future Value: the NPV carried to the last period.
      NFV: (items, rate) => {
        if (!items.length) return null;
        const p = npv(asCfs(items), rate);
        const n = items.length - 1;
        return p.times(rate.div(100).plus(1).pow(n));
      },
      // Net Uniform Series: the level annuity equivalent of the NPV.
      NUS: (items, rate) => {
        if (!items.length) return null;
        const p = npv(asCfs(items), rate);
        const i = rate.div(100);
        const n = items.length - 1;
        if (n <= 0) return p;
        if (i.isZero()) return p.div(n);
        const af = bn(1).minus(i.plus(1).pow(-n)).div(i); // annuity present-value factor
        return p.div(af);
      },
    },
  },

  // ---- SUM: single-variable statistics ---------------------------------------
  SUM: {
    title: "Statistics",
    menu: "SUM",
    results: {
      TOTAL: (items) => (items.length ? total(items) : null),
      MEAN: (items) => (items.length ? total(items).div(items.length) : null),
      MEDN: (items) => {
        if (!items.length) return null;
        const s = [...items].sort((a, b) => (a.minus(b).isNegative() ? -1 : 1));
        const m = Math.floor(s.length / 2);
        return s.length % 2 === 1 ? s[m] : s[m - 1].plus(s[m]).div(2);
      },
      STDEV: (items) => {
        const n = items.length;
        if (n < 2) return null;
        const mean = total(items).div(n);
        const ss = items.reduce((a, v) => a.plus(v.minus(mean).pow(2)), bn(0));
        return ss.div(n - 1).sqrt();
      },
      RANG: (items) => {
        if (!items.length) return null;
        let lo = items[0];
        let hi = items[0];
        for (const v of items) {
          if (v.minus(lo).isNegative()) lo = v;
          if (hi.minus(v).isNegative()) hi = v;
        }
        return hi.minus(lo);
      },
    },
  },
};

/** Menus whose INPUT key appends to a list. */
export const LIST_MENUS = new Set(Object.values(LIST_APPS).map((a) => a.menu));

/** A result label → its list-app id (results live on the "<APP>CALC" submenu). */
export const LIST_RESULT_APP: Record<string, string> = Object.fromEntries(
  Object.entries(LIST_APPS).flatMap(([k, a]) => Object.keys(a.results).map((r) => [r, k])),
);
