// src/lib/engine/entry.ts
// The digit-entry buffer shared by both stack machines: plain mantissa entry
// plus real EEX exponent entry (FR-NUM entry semantics). The buffer is a
// string like "12.5", "5e3" or "5e-12"; a trailing "e"/"e-" is a legal
// in-progress state (the exponent is being keyed). Pure TS — no React/DOM.

import { bn, type Value } from "./config";

/** Append a digit / decimal point per HP entry rules. */
export function appendDigit(entry: string, d: string): string {
  const ei = entry.indexOf("e");
  if (ei >= 0) {
    if (d === ".") return entry; // no decimal point in an exponent
    const mant = entry.slice(0, ei + 1);
    const exp = entry.slice(ei + 1);
    const sign = exp.startsWith("-") ? "-" : "";
    let ds = sign ? exp.slice(1) : exp;
    // 2-digit exponent field; a third digit shifts left (HP behavior)
    ds = ds.length >= 2 ? ds.slice(1) + d : ds + d;
    return mant + sign + ds;
  }
  if (d === "." && entry.includes(".")) return entry;
  return entry === "0" && d !== "." ? d : entry + d;
}

/** CHS during entry: negate the exponent when one is being keyed (HP rule),
 * otherwise the mantissa. */
export function toggleSign(entry: string): string {
  const ei = entry.indexOf("e");
  if (ei >= 0) {
    const mant = entry.slice(0, ei + 1);
    const exp = entry.slice(ei + 1);
    return exp.startsWith("-") ? mant + exp.slice(1) : mant + "-" + exp;
  }
  return entry.startsWith("-") ? entry.slice(1) : "-" + entry;
}

/** EEX pressed: start an exponent ("1e" when nothing is keyed, per HP-35). */
export function startExponent(entry: string | null): string {
  if (entry === null || entry === "0") return "1e";
  return entry.includes("e") ? entry : entry + "e";
}

/** Backspace one character; null when the buffer empties. */
export function backspace(entry: string): string | null {
  const next = entry.slice(0, -1);
  return next === "" || next === "-" ? null : next;
}

/** Parse the buffer to a Value, tolerating in-progress states ("5e", "5e-"). */
export function parseEntry(entry: string): Value {
  const clean = entry.replace(/e[+-]?$/, "").replace(/\.$/, "");
  if (clean === "" || clean === "-") return bn(0);
  try {
    return bn(clean);
  } catch {
    return bn(0);
  }
}
