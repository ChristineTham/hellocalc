// src/lib/engine/format.ts
// Display formatting (FR-NUM-7): FIX / SCI with configurable digits, straight
// from BigNumber so the display never round-trips through IEEE floats. FIX
// auto-falls-back to SCI outside the classic HP display range (too many
// integer digits, or a nonzero value that would round to all zeros) — the
// "auto SCI" behavior of the real machines. Pure TS — no React/DOM.

import { bn, type Value } from "./config";

export interface DisplayFormat {
  mode: "FIX" | "SCI" | "ENG";
  digits: number; // decimal places (FIX) / mantissa places (SCI/ENG)
}

export const DEFAULT_FORMAT: DisplayFormat = { mode: "FIX", digits: 2 };

/** 10-digit integer field — beyond it FIX overflows to SCI (HP-35 manual). */
const FIX_MAX = bn("1e10");

/** "5e+3" → "5e3" (keep the sign only when negative, like HP sci output). */
const sci = (v: Value, digits: number): string =>
  v.toExponential(digits).replace("e+", "e");

/** Engineering notation: exponent snapped to a multiple of 3 (HP-25 ENG). */
function eng(v: Value, digits: number): string {
  if (v.isZero()) return `${bn(0).toFixed(digits)}e0`;
  const e = v.abs().log(10).floor().toNumber();
  const engE = 3 * Math.floor(e / 3);
  const mant = v.div(bn(10).pow(engE));
  return `${mant.toFixed(digits)}e${engE}`;
}

export function formatValue(v: Value, f: DisplayFormat): string {
  if (!v.isFinite()) return "Error";
  if (f.mode === "SCI") return sci(v, f.digits);
  if (f.mode === "ENG") return eng(v, f.digits);
  const a = v.abs();
  if (a.gte(FIX_MAX)) return sci(v, f.digits); // integer field overflow
  // nonzero value that FIX would display as 0.00… → auto SCI (underflow)
  if (!v.isZero() && a.lt(bn(10).pow(-(f.digits + 1)).times(5))) {
    return sci(v, f.digits);
  }
  return v.toFixed(f.digits);
}
