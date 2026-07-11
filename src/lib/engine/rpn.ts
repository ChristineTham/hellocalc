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

/** Argument-taking keys (P2): `STO n`/`RCL n` await a register digit (with an
 * optional register-arithmetic operator between), FIX/SCI await a digits
 * count. Transient — never persisted. */
export interface PendingArg {
  op: "STO" | "RCL" | "FIX" | "SCI";
  arith?: "+" | "−" | "×" | "÷";
}

/** Σ summation registers (HP-45 descriptive statistics, FR-STAT-1). */
export interface SumRegs {
  n: Value;
  x: Value;
  x2: Value;
  y: Value;
}

export interface RpnEngine {
  x: Value;
  y: Value;
  z: Value;
  t: Value;
  lastX: Value;
  mem: Value; // single memory register (HP-35 STO/RCL, no argument)
  regs: Value[]; // addressable registers R0–R9 (HP-45 uses R1–R9)
  sum: SumRegs; // Σ+ accumulation
  pending: PendingArg | null; // argument-taking key in progress
  entry: string | null; // in-progress digit buffer (null = show x)
  lift: boolean; // stack lifts before the next number is keyed
  angle: Angle;
  disp: DisplayFormat;
  error: string | null;
  hist: HistEntry[]; // engine-side history (FR-EXP-5), capped at 50
}

const zeroSum = (): SumRegs => ({ n: bn(0), x: bn(0), x2: bn(0), y: bn(0) });

export function createRpn(): RpnEngine {
  const zero = bn(0);
  return {
    x: zero,
    y: zero,
    z: zero,
    t: zero,
    lastX: zero,
    mem: zero,
    regs: Array.from({ length: 10 }, () => zero),
    sum: zeroSum(),
    pending: null,
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

/** Sample standard deviation from the Σ registers: √((Σx² − (Σx)²/n)/(n−1)). */
function sdev(sum: SumRegs): unknown {
  if (sum.n.lt(2)) return null;
  const variance = sum.x2.minus(sum.x.times(sum.x).div(sum.n)).div(sum.n.minus(1));
  return math.sqrt(variance);
}

/** atan2 on BigNumbers — mathjs types no BigNumber overload, so build it from
 * atan with the standard quadrant correction (full precision preserved). */
function bigAtan2(y: Value, x: Value): Value | null {
  if (x.isZero()) {
    if (y.isZero()) return bn(0);
    return y.isNegative() ? PI.div(-2) : PI.div(2);
  }
  const base = asReal(math.atan(y.div(x)));
  if (base === null) return null;
  if (!x.isNegative()) return base;
  return y.isNegative() ? base.minus(PI) : base.plus(PI);
}

type ArithOp = "+" | "−" | "×" | "÷";
const isArith = (fn: string): fn is ArithOp =>
  fn === "+" || fn === "−" || fn === "×" || fn === "÷";

const arith = (a: Value, b: Value, op: ArithOp): unknown =>
  op === "+"
    ? math.add(a, b)
    : op === "−"
      ? math.subtract(a, b)
      : op === "×"
        ? math.multiply(a, b)
        : math.divide(a, b);

/** Consume the next key(s) for an argument-taking op (`STO n` / `RCL n` with
 * optional register arithmetic; FIX/SCI digit counts). Any key that can't be
 * part of the argument cancels the pending state and dispatches normally —
 * pressing STO then ENTER just ENTERs, exactly like walking away mid-prefix. */
function resolvePending(s: RpnEngine, fn: string): boolean {
  const p = s.pending;
  if (p === null) return false;
  if (/^[0-9]$/.test(fn)) {
    const i = Number(fn);
    s.pending = null;
    if (p.op === "FIX" || p.op === "SCI") {
      s.disp = { mode: p.op, digits: i };
      return true;
    }
    if (p.op === "STO") {
      commit(s);
      const r = p.arith ? tryReal(() => arith(s.regs[i], s.x, p.arith as ArithOp)) : s.x;
      s.error = r === null ? "Error" : null;
      s.regs[i] = r ?? bn(0);
      s.lift = true;
      return true;
    }
    // RCL n — recall lifts the stack (register arithmetic on RCL arrives with
    // the models that print it)
    pushX(s, s.regs[i]);
    return true;
  }
  if ((p.op === "STO" || p.op === "RCL") && !p.arith && isArith(fn)) {
    s.pending = { ...p, arith: fn };
    return true;
  }
  s.pending = null;
  return applyFunction(s, fn);
}

/**
 * Dispatch a function id (a legend from hp/mapping.json) to a stack operation.
 * Returns true if handled. Unimplemented ids (financial TVM, programming, RPL,
 * etc.) return false so the UI can no-op them until later milestones.
 */
export function applyFunction(s: RpnEngine, fn: string): boolean {
  if (s.pending) return resolvePending(s, fn);
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
      // single memory register (HP-35 — no argument on the real device)
      commit(s);
      s.mem = s.x;
      s.lift = true;
      return true;
    case "RCL":
      pushX(s, s.mem);
      return true;
    case "STO n":
      // argument-taking store (HP-45+): next digit picks R0–R9; an arithmetic
      // key in between does register arithmetic (5 STO + 1 → R1 += 5)
      commit(s);
      s.pending = { op: "STO" };
      return true;
    case "RCL n":
      s.pending = { op: "RCL" };
      return true;
    case "FIX":
      // mode flips immediately; a following digit sets the digit count
      s.disp = { ...s.disp, mode: "FIX" };
      s.pending = { op: "FIX" };
      return true;
    case "SCI":
      s.disp = { ...s.disp, mode: "SCI" };
      s.pending = { op: "SCI" };
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
    case "CLEAR":
      // HP-45 gold CLEAR: stack + registers + Σ (M stays — it's the 35's)
      clearAll(s);
      s.regs = s.regs.map(() => bn(0));
      s.sum = zeroSum();
      return true;
    case "Σ+":
    case "Σ−": {
      // accumulate n, Σx, Σx², Σy; n lands in X and — like ENTER — the next
      // keyed number overwrites it (HP stack-lift-disable after Σ+)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const sign = fn === "Σ+" ? 1 : -1;
      s.sum = {
        n: s.sum.n.plus(sign),
        x: sign === 1 ? s.sum.x.plus(x) : s.sum.x.minus(x),
        x2: sign === 1 ? s.sum.x2.plus(x.times(x)) : s.sum.x2.minus(x.times(x)),
        y: sign === 1 ? s.sum.y.plus(s.y) : s.sum.y.minus(s.y),
      };
      s.x = s.sum.n;
      s.lift = false;
      return true;
    }
    case "x̄":
      unary(s, () => (s.sum.n.isZero() ? null : s.sum.x.div(s.sum.n)));
      return true;
    case "s":
      unary(s, () => sdev(s.sum));
      return true;
    case "x̄,s": {
      // HP-45 f R↓: mean to X, sample std dev to Y (two lifts)
      const dev = tryReal(() => sdev(s.sum));
      const mean = tryReal(() => (s.sum.n.isZero() ? null : s.sum.x.div(s.sum.n)));
      if (dev === null || mean === null) {
        s.error = "Error";
        return true;
      }
      pushX(s, dev);
      pushX(s, mean);
      return true;
    }
    case "→P": {
      // rectangular→polar: x in X, y in Y ⇒ r in X, θ in Y (angle-mode aware)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = tryReal(() => math.sqrt(x.times(x).plus(s.y.times(s.y))));
      const theta = tryReal(() => {
        const a = bigAtan2(s.y, x);
        return a === null ? null : fromRad(s, a);
      });
      s.error = r === null || theta === null ? "Error" : null;
      s.x = r ?? bn(0);
      s.y = theta ?? bn(0);
      s.lift = true;
      return true;
    }
    case "→R": {
      // polar→rectangular: r in X, θ in Y ⇒ x in X, y in Y
      const r = xval(s);
      commit(s);
      s.lastX = r;
      const rad = toRad(s, s.y);
      const nx = tryReal(() => r.times(math.cos(rad)));
      const ny = tryReal(() => r.times(math.sin(rad)));
      s.error = nx === null || ny === null ? "Error" : null;
      s.x = nx ?? bn(0);
      s.y = ny ?? bn(0);
      s.lift = true;
      return true;
    }
    case "→D.MS":
      // decimal degrees → D.MMSS (30.5 → 30.30)
      unary(s, (x) => {
        const sign = x.isNegative() ? bn(-1) : bn(1);
        const a = x.abs();
        const d = a.trunc();
        const minFull = a.minus(d).times(60);
        const m = minFull.trunc();
        const sec = minFull.minus(m).times(60);
        return sign.times(d.plus(m.div(100)).plus(sec.div(10000)));
      });
      return true;
    case "D.MS→":
      // D.MMSS → decimal degrees (30.30 → 30.5)
      unary(s, (x) => {
        const sign = x.isNegative() ? bn(-1) : bn(1);
        const a = x.abs();
        const d = a.trunc();
        const rest = a.minus(d).times(100);
        const m = rest.trunc();
        const sec = rest.minus(m).times(100);
        return sign.times(d.plus(m.div(60)).plus(sec.div(3600)));
      });
      return true;
    case "cm/in":
      // HP-45 metric constants: the CONSTANT is pushed (the user multiplies
      // or divides) — never auto-converted, per the real machine
      pushX(s, bn("2.54"));
      return true;
    case "kg/lb":
      pushX(s, bn("0.45359237"));
      return true;
    case "ltr/gal":
      pushX(s, bn("3.785411784"));
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
/** Argument-taking arms — the tape prints the RESOLVED composite instead. */
const PENDING_ARMS = new Set(["STO n", "RCL n", "FIX", "SCI"]);

/**
 * Dispatch + record: applies the function and, for committed operations,
 * prints a history entry (op + exact post-op X) into the engine state —
 * the substrate the paper tape and Phase-23's expression library read.
 * Argument-taking sequences print once, composed ("STO + 1", "FIX 4").
 */
export function dispatch(s: RpnEngine, fn: string): boolean {
  const before = s.pending;
  const handled = applyFunction(s, fn);
  if (!handled) return false;
  if (before !== null) {
    if (s.pending === null) {
      if (/^[0-9]$/.test(fn)) {
        // resolution digit → one composed line ("STO + 1", "FIX 4")
        const op = `${before.op}${before.arith ? ` ${before.arith}` : ""} ${fn}`;
        s.hist = [...s.hist.slice(-49), { op, raw: xval(s).toString() }];
      } else if (!ENTRY_OPS.has(fn) && !PENDING_ARMS.has(fn)) {
        // the key canceled the pending arg and ran normally — print it
        s.hist = [...s.hist.slice(-49), { op: fn, raw: xval(s).toString() }];
      }
    }
    return true;
  }
  if (!/^[0-9]$/.test(fn) && !ENTRY_OPS.has(fn) && !PENDING_ARMS.has(fn)) {
    s.hist = [...s.hist.slice(-49), { op: fn, raw: xval(s).toString() }];
  }
  return true;
}
