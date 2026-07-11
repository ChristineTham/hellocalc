// src/lib/engine/units.ts
// Unit quantities on the value tower (P13, FR-UNIT-1/2/3): thin helpers over
// math.js's dimensional tracking (architecture §4.4 — the core is already
// configured to BigNumber, so magnitudes stay exact end-to-end). The RPL
// object `{ k: "unit", mag, u }` carries the magnitude and a math.js unit
// EXPRESSION ("cm", "m/s^2", "(kg m) / s^2") — HP's `5_cm` syntax normalizes
// to this at the parse boundary. Pure TS — no React/DOM.

import type { Unit } from "mathjs";
import { math, type Value } from "./config";

/** Dimensionally incompatible operation (FR-UNIT-2) — surfaced as the 28C's
 * "Inconsistent Units", never a silent NaN. */
export class DimensionError extends Error {
  constructor() {
    super("Inconsistent Units");
  }
}

export interface UnitQty {
  mag: Value;
  u: string;
}

/** Is `u` a unit expression math.js accepts? (parse-boundary validation) */
export function validUnit(u: string): boolean {
  try {
    math.unit(1, u);
    return true;
  } catch {
    return false;
  }
}

const toMU = (q: UnitQty): Unit => math.unit(q.mag, q.u);

const magOf = (x: unknown): Value => {
  if (math.isBigNumber(x)) return x;
  if (typeof x === "number") return math.bignumber(String(x));
  throw new DimensionError();
};

/** Unit → engine quantity via the unit's own printable expression (verified
 * to round-trip through math.unit). Dimensionless results collapse to null-u. */
function fromMU(u: Unit): UnitQty {
  const us = u.formatUnits();
  if (us === "") return { mag: magOf(u.toNumeric("")), u: "" };
  return { mag: magOf(u.toNumeric(us)), u: us };
}

const wrap = <T>(op: () => T): T => {
  try {
    return op();
  } catch {
    throw new DimensionError();
  }
};

/** a + b in a's unit (the 28C keeps the left operand's unit). */
export function addU(a: UnitQty, b: UnitQty): UnitQty {
  return wrap(() => ({ mag: a.mag.plus(magOf(toMU(b).toNumeric(a.u))), u: a.u }));
}

export function subU(a: UnitQty, b: UnitQty): UnitQty {
  return wrap(() => ({ mag: a.mag.minus(magOf(toMU(b).toNumeric(a.u))), u: a.u }));
}

/** Multiply/divide compose units; a dimensionless result has u === "". */
const lift = (q: UnitQty): Unit | Value => (q.u === "" ? q.mag : toMU(q));

export function mulU(a: UnitQty, b: UnitQty): UnitQty {
  return wrap(() => {
    const r = math.multiply(lift(a), lift(b));
    return math.isUnit(r) ? fromMU(r) : { mag: magOf(r), u: "" };
  });
}

export function divU(a: UnitQty, b: UnitQty): UnitQty {
  return wrap(() => {
    const r = math.divide(lift(a), lift(b));
    return math.isUnit(r) ? fromMU(r) : { mag: magOf(r), u: "" };
  });
}

export function scaleU(a: UnitQty, k: Value): UnitQty {
  return { mag: a.mag.times(k), u: a.u };
}

/** unit^n — bare unit names raise symbolically ("m"→"m^3"); compounds fold
 * by repeated multiplication (math.js auto-"simplifies" pow to odd units). */
export function powU(a: UnitQty, n: number): UnitQty {
  if (!Number.isInteger(n) || n === 0) throw new DimensionError();
  if (/^[A-Za-z]+$/.test(a.u)) {
    const abs = { mag: a.mag.abs().pow(n).times(a.mag.isNegative() && n % 2 ? -1 : 1), u: `${a.u}^${n}` };
    return validUnit(abs.u) ? abs : foldPow(a, n);
  }
  return foldPow(a, n);
}

function foldPow(a: UnitQty, n: number): UnitQty {
  let acc = a;
  const inv = n < 0;
  for (let i = 1; i < Math.abs(n); i++) acc = mulU(acc, a);
  return inv ? divU({ mag: math.bignumber(1), u: "" }, acc) : acc;
}

/** CONVERT: q expressed in the target's unit (FR-UNIT-3). */
export function convertU(q: UnitQty, target: string): UnitQty {
  return wrap(() => ({ mag: magOf(toMU(q).toNumeric(target)), u: target }));
}

/** UBASE: reduce to SI base units. */
export function ubaseU(q: UnitQty): UnitQty {
  return wrap(() => fromMU(toMU(q).toSI()));
}
