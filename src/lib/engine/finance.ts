// src/lib/engine/finance.ts
// The HP-12C financial module (P7, FR-FIN-*): TVM with solve-any-variable,
// cash-flow NPV/IRR, amortization, calendar math, depreciation and bond
// pricing — all computed on high-precision decimals (the value tower's
// BigNumber IS decimal.js, per architecture §4: financial formulas never
// touch IEEE floats). Pure TS — no React/DOM.

import { bn, type Value } from "./config";

export interface FinRegs {
  n: Value;
  i: Value; // percent per period, as the 12C stores it
  pv: Value;
  pmt: Value;
  fv: Value;
  beg: boolean; // annuity-due (BEG) vs ordinary (END)
  dmy: boolean; // date format D.MY vs M.DY
  cfs: { amt: string; count: number }[]; // cash flows (exact strings)
}

export const freshFin = (): FinRegs => ({
  n: bn(0),
  i: bn(0),
  pv: bn(0),
  pmt: bn(0),
  fv: bn(0),
  beg: false,
  dmy: false,
  cfs: [],
});

const one = bn(1);
const hundred = bn(100);

/** (1+i)^n and the annuity factor, i as a decimal fraction. */
const compound = (i: Value, n: Value): Value => one.plus(i).pow(n);

/** The TVM balance: pv·k + pmt·a·(k−1)/i + fv, k=(1+i)^n, a=1(END)/(1+i)(BEG).
 * A root (=0) is a consistent TVM solution — the 12C's cash-flow convention. */
function tvmBalance(f: FinRegs, iFrac: Value): Value {
  const k = compound(iFrac, f.n);
  const a = f.beg ? one.plus(iFrac) : one;
  if (iFrac.isZero()) return f.pv.plus(f.pmt.times(f.n)).plus(f.fv);
  return f.pv.times(k).plus(f.pmt.times(a).times(k.minus(one)).div(iFrac)).plus(f.fv);
}

export function solveFV(f: FinRegs): Value {
  const i = f.i.div(hundred);
  const k = compound(i, f.n);
  const a = f.beg ? one.plus(i) : one;
  if (i.isZero()) return f.pv.plus(f.pmt.times(f.n)).neg();
  return f.pv.times(k).plus(f.pmt.times(a).times(k.minus(one)).div(i)).neg();
}

export function solvePV(f: FinRegs): Value {
  const i = f.i.div(hundred);
  const k = compound(i, f.n);
  const a = f.beg ? one.plus(i) : one;
  if (i.isZero()) return f.pmt.times(f.n).plus(f.fv).neg();
  return f.pmt.times(a).times(k.minus(one)).div(i).plus(f.fv).div(k).neg();
}

export function solvePMT(f: FinRegs): Value {
  const i = f.i.div(hundred);
  const k = compound(i, f.n);
  const a = f.beg ? one.plus(i) : one;
  if (i.isZero()) return f.pv.plus(f.fv).div(f.n).neg();
  return f.pv.times(k).plus(f.fv).div(a.times(k.minus(one)).div(i)).neg();
}

export function solveN(f: FinRegs): Value | null {
  const i = f.i.div(hundred);
  if (i.isZero()) {
    if (f.pmt.isZero()) return null;
    return f.pv.plus(f.fv).div(f.pmt).neg();
  }
  const a = f.beg ? one.plus(i) : one;
  const pa = f.pmt.times(a);
  const num = pa.minus(f.fv.times(i));
  const den = pa.plus(f.pv.times(i));
  if (den.isZero() || num.div(den).lte(0)) return null;
  return num.div(den).ln().div(one.plus(i).ln());
}

/** Solve the periodic rate (percent) by bisection on the TVM balance —
 * robust over the 12C's whole domain, no derivative pathologies. */
export function solveI(f: FinRegs): Value | null {
  const g = (iFrac: Value) => tvmBalance(f, iFrac);
  let lo = bn("-0.999999");
  let hi = bn(10); // 1000% per period is beyond any sane input
  let flo = g(lo);
  const fhi = g(hi);
  if (flo.isZero()) return lo.times(hundred);
  if (fhi.isZero()) return hi.times(hundred);
  if (flo.isNegative() === fhi.isNegative()) return null; // no bracketed root
  for (let it = 0; it < 200; it++) {
    const mid = lo.plus(hi).div(2);
    const fm = g(mid);
    if (fm.abs().lt(bn("1e-18"))) return mid.times(hundred);
    if (fm.isNegative() === flo.isNegative()) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return lo.plus(hi).div(2).times(hundred);
}

// ---- cash flows ---------------------------------------------------------------

export function npv(cfs: FinRegs["cfs"], iPct: Value): Value {
  const i = iPct.div(hundred);
  let t = 0;
  let acc = bn(0);
  for (const cf of cfs) {
    for (let j = 0; j < cf.count; j++) {
      acc = t === 0 ? acc.plus(bn(cf.amt)) : acc.plus(bn(cf.amt).div(compound(i, bn(t))));
      t++;
    }
  }
  return acc;
}

export function irr(cfs: FinRegs["cfs"]): Value | null {
  const g = (iPct: Value) => npv(cfs, iPct);
  let lo = bn("-99.9999");
  let hi = bn(1000);
  let flo = g(lo);
  const fhi = g(hi);
  if (flo.isNegative() === fhi.isNegative()) return null;
  for (let it = 0; it < 200; it++) {
    const mid = lo.plus(hi).div(2);
    const fm = g(mid);
    if (fm.abs().lt(bn("1e-15"))) return mid;
    if (fm.isNegative() === flo.isNegative()) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return lo.plus(hi).div(2);
}

// ---- calendar (actual days) ----------------------------------------------------

/** Decode the 12C date number (M.DYYYYY or D.MYYYYY per mode) to UTC. */
export function decodeDate(v: Value, dmy: boolean): Date | null {
  const intPart = v.abs().trunc().toNumber();
  const frac = v.abs().minus(v.abs().trunc());
  const digits = frac.toFixed(6).slice(2); // "ddyyyy" (or mmyyyy)
  const two = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 6));
  const month = dmy ? two : intPart;
  const day = dmy ? intPart : two;
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1583) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  // reject rollovers (Feb 31 → Mar 3)
  if (d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return d;
}

export function encodeDate(d: Date, dmy: boolean): Value {
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  const intPart = dmy ? day : month;
  const two = dmy ? month : day;
  return bn(`${intPart}.${String(two).padStart(2, "0")}${String(year).padStart(4, "0")}`);
}

const DAY_MS = 86_400_000;

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

// ---- depreciation ---------------------------------------------------------------

/** Straight line: constant (cost−salvage)/life; X=dep for year j, Y=remaining
 * depreciable value after it. */
export function depSL(cost: Value, salvage: Value, life: Value, j: Value) {
  const dep = cost.minus(salvage).div(life);
  const remaining = cost.minus(salvage).minus(dep.times(j));
  return { dep, remaining };
}

export function depSOYD(cost: Value, salvage: Value, life: Value, j: Value) {
  const soyd = life.times(life.plus(1)).div(2);
  const dep = cost.minus(salvage).times(life.minus(j).plus(1)).div(soyd);
  // remaining after year j: base × Σ(1..life−j)/soyd
  const rem = life.minus(j);
  const remaining = cost.minus(salvage).times(rem.times(rem.plus(1)).div(2)).div(soyd);
  return { dep, remaining };
}

/** Declining balance at `factor` percent (the 12C keeps the factor in i). */
export function depDB(cost: Value, salvage: Value, life: Value, factor: Value, j: Value) {
  const rate = factor.div(hundred).div(life);
  let book = cost;
  let dep = bn(0);
  for (let y = 0; y < Math.max(1, Math.trunc(j.toNumber())); y++) {
    dep = book.times(rate);
    if (book.minus(dep).lt(salvage)) dep = book.minus(salvage); // floor at salvage
    book = book.minus(dep);
  }
  return { dep, remaining: book.minus(salvage) };
}

// ---- bonds (semiannual, actual/actual — US treasury convention) ----------------

/** Walk coupon dates back from maturity to bracket the settlement. */
function couponDates(settle: Date, maturity: Date): { prev: Date; next: Date; remaining: number } {
  let next = maturity;
  let remaining = 1;
  for (;;) {
    const prev = stepMonths(next, -6);
    if (prev.getTime() <= settle.getTime()) return { prev, next, remaining };
    next = prev;
    remaining++;
  }
}

function stepMonths(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const out = new Date(Date.UTC(y, m, day));
  if (out.getUTCDate() !== day) return new Date(Date.UTC(y, m + 1, 0)); // month-end clamp
  return out;
}

/** Price per 100 of face for yield% and coupon% (annual); X=price, accrued
 * interest returned alongside (the 12C leaves it in Y). */
export function bondPrice(settle: Date, maturity: Date, yieldPct: Value, couponPct: Value) {
  const { prev, next, remaining } = couponDates(settle, maturity);
  const period = daysBetween(prev, next);
  const toNext = daysBetween(settle, next);
  const w = bn(toNext).div(period); // fraction of a period to the next coupon
  const c = couponPct.div(2); // semiannual coupon per 100
  const y = one.plus(yieldPct.div(hundred).div(2)); // per-period growth
  let price = bn(100).div(y.pow(bn(remaining - 1).plus(w)));
  for (let k = 0; k < remaining; k++) {
    price = price.plus(c.div(y.pow(bn(k).plus(w))));
  }
  const accrued = c.times(bn(daysBetween(prev, settle)).div(period));
  return { price: price.minus(accrued), accrued };
}

/** Yield to maturity by bisection on bondPrice = target price. */
export function bondYTM(settle: Date, maturity: Date, price: Value, couponPct: Value): Value | null {
  const g = (yPct: Value) => bondPrice(settle, maturity, yPct, couponPct).price.minus(price);
  let lo = bn("0.0001");
  let hi = bn(500);
  let flo = g(lo);
  const fhi = g(hi);
  if (flo.isNegative() === fhi.isNegative()) return null;
  for (let it = 0; it < 200; it++) {
    const mid = lo.plus(hi).div(2);
    const fm = g(mid);
    if (fm.abs().lt(bn("1e-12"))) return mid;
    if (fm.isNegative() === flo.isNegative()) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return lo.plus(hi).div(2);
}
