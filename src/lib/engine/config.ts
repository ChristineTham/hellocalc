// src/lib/engine/config.ts
// The value tower (architecture §3/§4, AGENTS §3): ONE math.js instance,
// globally configured to BigNumber so standard arithmetic carries no IEEE-754
// error — `0.1 + 0.2` is exactly `0.3`. Every engine module computes through
// this instance; UI code only ever sees formatted strings (format.ts).
// Pure TS — no React/DOM.

import { create, all } from "mathjs";
import type { BigNumber } from "mathjs";

/** 40 significant digits: HP hardware carried 10–13; the headroom keeps
 * chained reference computations exact to the displayed precision. */
export const math = create(all, { number: "BigNumber", precision: 40 });

/** The engine's numeric type — mathjs BigNumber (a decimal.js Decimal). */
export type Value = BigNumber;

/** Construct a Value from a number or exact decimal string. */
export const bn = (v: number | string): Value => math.bignumber(v);

/** Down-convert for tests/interop (lossy — never used for display). */
export const num = (v: Value): number => v.toNumber();

/** π at full configured precision (math.pi IS a BigNumber under this config;
 * bignumber() is identity on BigNumber inputs, so nothing is lost). */
export const PI: Value = math.bignumber(math.pi);

/**
 * Narrow a mathjs result to a finite real Value. Under BigNumber config,
 * out-of-domain results (√-1, ln(-1), asin(2), (-8)^0.5 …) come back as
 * Complex — until the complex phase (P9) those are engine errors, exactly
 * like the real machines flashed Error.
 */
export const asReal = (r: unknown): Value | null =>
  math.isBigNumber(r) && r.isFinite() ? r : null;
