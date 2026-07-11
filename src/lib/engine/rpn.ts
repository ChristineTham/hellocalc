// src/lib/engine/rpn.ts
// Fixed 4-level RPN stack engine (X/Y/Z/T + LAST X) with the HP lift / drop /
// no-lift semantics documented in hp/README.md, computing on the BigNumber
// value tower (config.ts) so arithmetic is exact (Phase 1). Pure TypeScript,
// framework-agnostic (per docs/architecture.md §3) so it is unit-testable in
// isolation and Web-Worker safe.

import { asReal, bn, math, PI, type Value } from "./config";
import { DEFAULT_FORMAT, type DisplayFormat } from "./format";
import { appendDigit, backspace, parseEntry, startExponent, toggleSign } from "./entry";

export type Angle = "DEG" | "RAD" | "GRD";

/** One history-tape entry: the op and the exact post-op X (raw BigNumber
 * string, so recall loses nothing to display rounding). */
export interface HistEntry {
  op: string;
  raw: string;
}

export interface RpnEngine {
  x: Value;
  y: Value;
  z: Value;
  t: Value;
  lastX: Value;
  mem: Value; // single memory register (HP-35 STO/RCL; registers arrive P2)
  entry: string | null; // in-progress digit buffer (null = show x)
  lift: boolean; // stack lifts before the next number is keyed
  angle: Angle;
  disp: DisplayFormat;
  error: string | null;
  hist: HistEntry[]; // engine-side history (FR-EXP-5), capped at 50
}

export function createRpn(): RpnEngine {
  const zero = bn(0);
  return {
    x: zero,
    y: zero,
    z: zero,
    t: zero,
    lastX: zero,
    mem: zero,
    entry: null,
    lift: false,
    angle: "DEG",
    disp: { ...DEFAULT_FORMAT },
    error: null,
    hist: [],
  };
}

/** Current value of X, honouring an in-progress entry. */
export function xval(s: RpnEngine): Value {
  return s.entry === null ? s.x : parseEntry(s.entry);
}

function commit(s: RpnEngine): void {
  if (s.entry !== null) {
    s.x = parseEntry(s.entry);
    s.entry = null;
  }
}

function liftIfEnabled(s: RpnEngine): void {
  if (s.lift) {
    s.t = s.z;
    s.z = s.y;
    s.y = s.x;
  }
}

/** Push a computed constant/value as a fresh X (lifts when enabled). */
export function pushX(s: RpnEngine, v: Value): void {
  liftIfEnabled(s);
  s.x = v;
  s.entry = null;
  s.lift = true;
}

export function inputDigit(s: RpnEngine, d: string): void {
  s.error = null;
  if (s.entry === null) {
    liftIfEnabled(s);
    s.entry = d === "." ? "0." : d;
    s.lift = false; // subsequent digits append, no further lift
    return;
  }
  s.entry = appendDigit(s.entry, d);
}

export function enter(s: RpnEngine): void {
  commit(s);
  s.t = s.z;
  s.z = s.y;
  s.y = s.x;
  s.lift = false; // next digit overwrites X (no lift)
}

export function chs(s: RpnEngine): void {
  if (s.entry !== null) {
    s.entry = toggleSign(s.entry);
  } else {
    s.x = s.x.neg();
  }
}

export function clx(s: RpnEngine): void {
  s.x = bn(0);
  s.entry = null;
  s.lift = false;
  s.error = null;
}

/** Clear the entire stack (HP-35 `CLR`). */
export function clearAll(s: RpnEngine): void {
  const zero = bn(0);
  s.x = zero;
  s.y = zero;
  s.z = zero;
  s.t = zero;
  s.entry = null;
  s.lift = false;
  s.error = null;
}

/** Run an op to a finite real Value or null — domain errors may surface as
 * Complex results OR as decimal.js throws; both mean Error on the glass. */
function tryReal(op: () => unknown): Value | null {
  try {
    return asReal(op());
  } catch {
    return null;
  }
}

/** Binary op: y ∘ x → X, stack drops (T duplicates), LAST X = old x.
 * A non-real / non-finite result (√-1 territory) flags Error, X shows 0. */
export function binary(s: RpnEngine, op: (y: Value, x: Value) => unknown): void {
  const x = xval(s);
  const y = s.y;
  commit(s);
  s.lastX = x;
  const r = tryReal(() => op(y, x));
  s.error = r === null ? "Error" : null;
  s.x = r ?? bn(0);
  s.y = s.z;
  s.z = s.t; // T duplicated
  s.lift = true;
}

/** Unary op: op(x) → X, LAST X = old x. Stack does not drop. */
export function unary(s: RpnEngine, op: (x: Value) => unknown): void {
  const x = xval(s);
  commit(s);
  s.lastX = x;
  const r = tryReal(() => op(x));
  s.error = r === null ? "Error" : null;
  s.x = r ?? bn(0);
  s.lift = true;
}

export function swap(s: RpnEngine): void {
  commit(s);
  const a = s.x;
  s.x = s.y;
  s.y = a;
  s.lift = true;
}

export function rollDown(s: RpnEngine): void {
  commit(s);
  const a = s.x;
  s.x = s.y;
  s.y = s.z;
  s.z = s.t;
  s.t = a;
  s.lift = true;
}

/** R↑: inverse roll — X→Y, Y→Z, Z→T, T→X (HP-65g / HP-67h / HP-97f). */
export function rollUp(s: RpnEngine): void {
  commit(s);
  const a = s.t;
  s.t = s.z;
  s.z = s.y;
  s.y = s.x;
  s.x = a;
  s.lift = true;
}

export function lastx(s: RpnEngine): void {
  pushX(s, s.lastX);
}

const toRad = (s: RpnEngine, v: Value): Value =>
  s.angle === "DEG"
    ? v.times(PI).div(180)
    : s.angle === "GRD"
      ? v.times(PI).div(200)
      : v;
const fromRad = (s: RpnEngine, v: Value): Value =>
  s.angle === "DEG"
    ? v.times(180).div(PI)
    : s.angle === "GRD"
      ? v.times(200).div(PI)
      : v;

/**
 * Dispatch a function id (a legend from hp/mapping.json) to a stack operation.
 * Returns true if handled. Unimplemented ids (financial TVM, programming, RPL,
 * etc.) return false so the UI can no-op them until later milestones.
 */
export function applyFunction(s: RpnEngine, fn: string): boolean {
  if (/^[0-9]$/.test(fn)) {
    inputDigit(s, fn);
    return true;
  }
  switch (fn) {
    case "•":
    case ".":
      inputDigit(s, ".");
      return true;
    case "ENTER":
      enter(s);
      return true;
    case "CHS":
      chs(s);
      return true;
    case "CLx":
      clx(s);
      return true;
    case "CLR":
      clearAll(s);
      return true;
    case "←":
      // true backspace (42S/35s/41/Prime): trim the in-progress entry;
      // with no entry it clears X like CLx
      if (s.entry !== null) {
        s.entry = backspace(s.entry);
        if (s.entry === null) s.x = bn(0);
      } else {
        clx(s);
      }
      return true;
    case "EEX":
      // real exponent entry (HP-35: EEX with nothing keyed means 1×10^x)
      s.error = null;
      if (s.entry === null) {
        liftIfEnabled(s);
        s.lift = false;
      }
      s.entry = startExponent(s.entry);
      return true;
    case "STO":
      // single memory register (HP-35). Register arguments arrive in P2.
      commit(s);
      s.mem = s.x;
      s.lift = true;
      return true;
    case "RCL":
      pushX(s, s.mem);
      return true;
    case "FIX":
      s.disp = { ...s.disp, mode: "FIX" };
      return true;
    case "SCI":
      s.disp = { ...s.disp, mode: "SCI" };
      return true;
    case "+":
      binary(s, (y, x) => math.add(y, x));
      return true;
    case "−":
      binary(s, (y, x) => math.subtract(y, x));
      return true;
    case "×":
      binary(s, (y, x) => math.multiply(y, x));
      return true;
    case "÷":
      binary(s, (y, x) => math.divide(y, x));
      return true;
    case "yˣ":
      binary(s, (y, x) => math.pow(y, x));
      return true;
    case "ˣ√y":
      // x-th root of y — the HP-65 f⁻¹ of yˣ
      binary(s, (y, x) => math.pow(y, bn(1).div(x)));
      return true;
    case "1/x":
      unary(s, (x) => math.divide(bn(1), x));
      return true;
    case "√x":
      unary(s, (x) => math.sqrt(x));
      return true;
    case "x²":
      unary(s, (x) => x.times(x));
      return true;
    case "LN":
      unary(s, (x) => math.log(x));
      return true;
    case "LOG":
      unary(s, (x) => math.log10(x));
      return true;
    case "eˣ":
      unary(s, (x) => math.exp(x));
      return true;
    case "10ˣ":
      unary(s, (x) => math.pow(bn(10), x));
      return true;
    case "SIN":
      unary(s, (x) => math.sin(toRad(s, x)));
      return true;
    case "COS":
      unary(s, (x) => math.cos(toRad(s, x)));
      return true;
    case "TAN":
      unary(s, (x) => math.tan(toRad(s, x)));
      return true;
    case "SIN⁻¹":
      unary(s, (x) => {
        const r = asReal(math.asin(x));
        return r === null ? r : fromRad(s, r);
      });
      return true;
    case "COS⁻¹":
      unary(s, (x) => {
        const r = asReal(math.acos(x));
        return r === null ? r : fromRad(s, r);
      });
      return true;
    case "TAN⁻¹":
      unary(s, (x) => {
        const r = asReal(math.atan(x));
        return r === null ? r : fromRad(s, r);
      });
      return true;
    case "x⇄y":
      swap(s);
      return true;
    case "R↓":
      rollDown(s);
      return true;
    case "R↑":
      rollUp(s);
      return true;
    case "LSTx":
      lastx(s);
      return true;
    case "π":
      pushX(s, PI);
      return true;
    case "ABS":
      unary(s, (x) => x.abs());
      return true;
    case "INT":
      unary(s, (x) => x.trunc());
      return true;
    case "FRAC":
      unary(s, (x) => x.minus(x.trunc()));
      return true;
    case "x!":
      // integer factorial (HP-45/65/67 x!: non-negative integers only)
      unary(s, (x) =>
        x.isNegative() || !x.isInteger() ? null : math.factorial(x),
      );
      return true;
    case "D→R":
      unary(s, (x) => x.times(PI).div(180));
      return true;
    case "R→D":
      unary(s, (x) => x.times(180).div(PI));
      return true;
    case "DEG":
    case "RAD":
    case "GRD":
      s.angle = fn;
      return true;
    case "%": {
      // x% of y (HP-12C leaves Y in place)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      s.x = s.y.times(x).div(100);
      s.lift = true;
      return true;
    }
    case "Δ%": {
      // percent change from y to x (Y stays, like %)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = asReal(s.y.isZero() ? null : x.minus(s.y).div(s.y).times(100));
      s.error = r === null ? "Error" : null;
      s.x = r ?? bn(0);
      s.lift = true;
      return true;
    }
    default:
      return false;
  }
}

/** Entry-editing keys that shouldn't print a history line. */
const ENTRY_OPS = new Set(["•", ".", "EEX", "←", "CHS"]);

/**
 * Dispatch + record: applies the function and, for committed operations,
 * prints a history entry (op + exact post-op X) into the engine state —
 * the substrate the paper tape and Phase-23's expression library read.
 */
export function dispatch(s: RpnEngine, fn: string): boolean {
  const handled = applyFunction(s, fn);
  if (handled && !/^[0-9]$/.test(fn) && !ENTRY_OPS.has(fn)) {
    s.hist = [...s.hist.slice(-49), { op: fn, raw: xval(s).toString() }];
  }
  return handled;
}
