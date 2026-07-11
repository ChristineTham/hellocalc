// src/lib/engine/integer.ts
// The HP-16C integer universe (P10): word-size arithmetic on BigInt with
// 1's/2's-complement/unsigned encodings, carry + out-of-range flags, and
// base-4 display formatting. Pure TS — the engine converts X/Y values
// (BigNumber integers) to machine words at the op boundary and back.

import { bn, type Value } from "./config";

export type IntBase = 2 | 8 | 10 | 16;
export type Complement = "1S" | "2S" | "UNSGN";

export interface IntMode {
  on: boolean;
  base: IntBase;
  ws: number; // word size, 1–64
  comp: Complement;
  carry: boolean;
  oor: boolean; // out-of-range (overflow) flag
}

export const freshInt = (): IntMode => ({
  on: false,
  base: 16,
  ws: 16,
  comp: "2S",
  carry: false,
  oor: false,
});

const big = (n: number) => BigInt(n);
export const maskOf = (ws: number): bigint => (big(1) << big(ws)) - big(1);

/** Signed Value → raw machine word (bit pattern) under the mode. */
export function toWord(v: Value, m: IntMode): bigint {
  const i = BigInt(v.trunc().toFixed(0));
  const mask = maskOf(m.ws);
  if (i >= big(0)) return i & mask;
  if (m.comp === "2S") return (i + (mask + big(1))) & mask;
  if (m.comp === "1S") return ~(-i) & mask;
  return -i & mask; // UNSGN: magnitude
}

/** Raw word → signed Value under the mode. */
export function fromWord(w: bigint, m: IntMode): Value {
  const mask = maskOf(m.ws);
  const word = w & mask;
  if (m.comp === "UNSGN") return bn(word.toString());
  const sign = big(1) << big(m.ws - 1);
  if ((word & sign) === big(0)) return bn(word.toString());
  if (m.comp === "2S") return bn((word - (mask + big(1))).toString());
  return bn((-(~word & mask)).toString()); // 1's complement
}

/** Display the WORD bits in the active base (DEC shows the signed value). */
export function intFormat(v: Value, m: IntMode): string {
  if (m.base === 10) return v.trunc().toFixed(0);
  const w = toWord(v, m);
  const s = w.toString(m.base).toUpperCase();
  return m.base === 16 ? `${s} h` : m.base === 8 ? `${s} o` : `${s} b`;
}

/** Parse an entry string typed in the active base to a signed Value. */
export function intParse(entry: string, m: IntMode): Value {
  if (entry === "" || entry === "-") return bn(0);
  try {
    const neg = entry.startsWith("-");
    const digits = neg ? entry.slice(1) : entry;
    const w = [...digits.toUpperCase()].reduce(
      (acc, d) => acc * big(m.base) + big(parseInt(d, m.base)),
      big(0),
    );
    const v = fromWord(w & maskOf(m.ws), m);
    return neg ? v.neg() : v;
  } catch {
    return bn(0);
  }
}

/** A digit is legal for the active base. */
export const digitOk = (d: string, base: IntBase): boolean =>
  parseInt(d, 16) < base && /^[0-9A-F]$/i.test(d);

export interface WordResult {
  value: Value;
  carry: boolean;
  oor: boolean;
}

const wrap = (raw: bigint, m: IntMode): WordResult => {
  const mask = maskOf(m.ws);
  const word = ((raw % (mask + big(1))) + (mask + big(1))) & mask;
  const oor = raw > mask || raw < -(mask + big(1)) / big(2) - big(1);
  return { value: fromWord(word, m), carry: false, oor };
};

export function intAdd(y: Value, x: Value, m: IntMode): WordResult {
  const raw = toWord(y, m) + toWord(x, m);
  const out = wrap(raw, m);
  return { ...out, carry: raw > maskOf(m.ws) };
}

export function intSub(y: Value, x: Value, m: IntMode): WordResult {
  const raw = toWord(y, m) - toWord(x, m);
  const out = wrap(raw, m);
  return { ...out, carry: raw < big(0) }; // borrow sets carry, like the 16C
}

export function intMul(y: Value, x: Value, m: IntMode): WordResult {
  const raw = toWord(y, m) * toWord(x, m);
  return wrap(raw, m);
}

export function intDiv(y: Value, x: Value, m: IntMode): WordResult | null {
  const xv = toWord(x, m);
  if (xv === big(0)) return null;
  const yv = BigInt(y.trunc().toFixed(0));
  const xs = BigInt(x.trunc().toFixed(0));
  if (xs === big(0)) return null;
  const q = yv / xs; // signed truncating divide
  const r = yv % xs;
  const out = wrap(q, m);
  return { ...out, carry: r !== big(0) }; // remainder sets carry
}

export function intRmd(y: Value, x: Value, m: IntMode): WordResult | null {
  const xs = BigInt(x.trunc().toFixed(0));
  if (xs === big(0)) return null;
  const ys = BigInt(y.trunc().toFixed(0));
  return wrap(ys % xs, m);
}

export const intAnd = (y: Value, x: Value, m: IntMode): WordResult =>
  wrap(toWord(y, m) & toWord(x, m), m);
export const intOr = (y: Value, x: Value, m: IntMode): WordResult =>
  wrap(toWord(y, m) | toWord(x, m), m);
export const intXor = (y: Value, x: Value, m: IntMode): WordResult =>
  wrap(toWord(y, m) ^ toWord(x, m), m);
export const intNot = (x: Value, m: IntMode): WordResult =>
  wrap(~toWord(x, m) & maskOf(m.ws), m);

/** Shift left/right by count; carry carries the last bit shifted out. */
export function intShift(x: Value, count: number, dir: "L" | "R", m: IntMode): WordResult {
  let w = toWord(x, m);
  let carry = false;
  const mask = maskOf(m.ws);
  const top = big(1) << big(m.ws - 1);
  for (let i = 0; i < count; i++) {
    if (dir === "L") {
      carry = (w & top) !== big(0);
      w = (w << big(1)) & mask;
    } else {
      carry = (w & big(1)) !== big(0);
      w = w >> big(1);
    }
  }
  return { value: fromWord(w, m), carry, oor: false };
}

/** Arithmetic shift right preserves the sign bit. */
export function intAsr(x: Value, m: IntMode): WordResult {
  const w = toWord(x, m);
  const top = big(1) << big(m.ws - 1);
  const carry = (w & big(1)) !== big(0);
  const shifted = (w >> big(1)) | (w & top);
  return { value: fromWord(shifted, m), carry, oor: false };
}

/** Rotate left/right by count (through carry when `thruCarry`). */
export function intRotate(
  x: Value,
  count: number,
  dir: "L" | "R",
  m: IntMode,
  thruCarry: boolean,
  carryIn: boolean,
): WordResult {
  let w = toWord(x, m);
  let carry = carryIn;
  const mask = maskOf(m.ws);
  const top = big(1) << big(m.ws - 1);
  for (let i = 0; i < count; i++) {
    if (dir === "L") {
      const outBit = (w & top) !== big(0);
      w = (w << big(1)) & mask;
      const inBit = thruCarry ? carry : outBit;
      if (inBit) w |= big(1);
      carry = outBit;
    } else {
      const outBit = (w & big(1)) !== big(0);
      w = w >> big(1);
      const inBit = thruCarry ? carry : outBit;
      if (inBit) w |= top;
      carry = outBit;
    }
  }
  return { value: fromWord(w, m), carry, oor: false };
}

export function intSetBit(y: Value, bit: number, set: boolean, m: IntMode): WordResult {
  const w = toWord(y, m);
  const b = big(1) << big(bit);
  return wrap(set ? w | b : w & ~b, m);
}

export const intTestBit = (y: Value, bit: number, m: IntMode): boolean =>
  (toWord(y, m) & (big(1) << big(bit))) !== big(0);

export function intMask(count: number, side: "L" | "R", m: IntMode): Value {
  const c = Math.max(0, Math.min(m.ws, count));
  const maskBits = (big(1) << big(c)) - big(1);
  const w = side === "R" ? maskBits : (maskBits << big(m.ws - c)) & maskOf(m.ws);
  return fromWord(w, m);
}

export function intCountBits(x: Value, m: IntMode): Value {
  let w = toWord(x, m);
  let count = 0;
  while (w > big(0)) {
    if ((w & big(1)) === big(1)) count++;
    w >>= big(1);
  }
  return bn(count);
}

/** Left-justify: shift until the top bit is set; returns shifts + value. */
export function intLj(x: Value, m: IntMode): { value: Value; shifts: Value } {
  let w = toWord(x, m);
  const top = big(1) << big(m.ws - 1);
  let shifts = 0;
  if (w === big(0)) return { value: bn(0), shifts: bn(0) };
  while ((w & top) === big(0)) {
    w <<= big(1);
    shifts++;
  }
  return { value: fromWord(w & maskOf(m.ws), m), shifts: bn(shifts) };
}

/** Double multiply: full 2-word product (low, high). */
export function intDblMul(y: Value, x: Value, m: IntMode): { low: Value; high: Value } {
  const raw = toWord(y, m) * toWord(x, m);
  const mask = maskOf(m.ws);
  return { low: fromWord(raw & mask, m), high: fromWord(raw >> big(m.ws), m) };
}

/** Double divide/remainder: (high:low) ÷ x. */
export function intDblDiv(
  high: Value,
  low: Value,
  x: Value,
  m: IntMode,
  want: "Q" | "R",
): WordResult | null {
  const xs = toWord(x, m);
  if (xs === big(0)) return null;
  const dividend = (toWord(high, m) << big(m.ws)) | toWord(low, m);
  return wrap(want === "Q" ? dividend / xs : dividend % xs, m);
}
