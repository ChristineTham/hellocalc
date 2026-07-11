// src/lib/engine/rpl.ts
// RPL dynamic (unlimited) object stack — the HP-28/48/49/50g model, contrasted
// with the fixed 4-level stack in rpn.ts (see hp/README.md). Computes on the
// BigNumber value tower (config.ts) so arithmetic is exact (Phase 1). Pure
// TypeScript, framework-agnostic, unit-testable. Numeric-only for now (the
// full object stack with symbolics/lists is Phase 12); values are pushed
// bottom -> top, so the top of the stack is the last element (level 1).

import { asReal, bn, math, PI, type Value } from "./config";
import { DEFAULT_FORMAT, type DisplayFormat } from "./format";
import { appendDigit, parseEntry, startExponent, toggleSign } from "./entry";
import type { HistEntry } from "./rpn";

export type Angle = "DEG" | "RAD" | "GRD";

export interface RplEngine {
  stack: Value[]; // bottom -> top (top = level 1)
  entry: string | null;
  angle: Angle;
  disp: DisplayFormat; // carried for persistence symmetry; FIX/SCI args are P12+
  error: string | null;
  hist: HistEntry[]; // engine-side history (FR-EXP-5), capped at 50
}

export function createRpl(): RplEngine {
  return {
    stack: [],
    entry: null,
    angle: "DEG",
    disp: { ...DEFAULT_FORMAT },
    error: null,
    hist: [],
  };
}

/** Commit an in-progress entry by pushing it as a new stack level. */
function commit(s: RplEngine): void {
  if (s.entry !== null) {
    s.stack.push(parseEntry(s.entry));
    s.entry = null;
  }
}

export function inputDigit(s: RplEngine, d: string): void {
  s.error = null;
  if (s.entry === null) {
    s.entry = d === "." ? "0." : d;
    return;
  }
  s.entry = appendDigit(s.entry, d);
}

export function chs(s: RplEngine): void {
  if (s.entry !== null) {
    s.entry = toggleSign(s.entry);
  } else if (s.stack.length) {
    s.stack[s.stack.length - 1] = s.stack[s.stack.length - 1].neg();
  }
}

/** ENTER: commit an entry, or DUP the top when there is no entry. */
export function enter(s: RplEngine): void {
  if (s.entry !== null) {
    commit(s);
  } else if (s.stack.length) {
    s.stack.push(s.stack[s.stack.length - 1]);
  }
}

export function dup(s: RplEngine): void {
  commit(s);
  if (s.stack.length) s.stack.push(s.stack[s.stack.length - 1]);
}

export function drop(s: RplEngine): void {
  if (s.entry !== null) {
    s.entry = null;
    return;
  }
  s.stack.pop();
}

export function swap(s: RplEngine): void {
  commit(s);
  const n = s.stack.length;
  if (n >= 2) [s.stack[n - 1], s.stack[n - 2]] = [s.stack[n - 2], s.stack[n - 1]];
}

export function clear(s: RplEngine): void {
  s.stack = [];
  s.entry = null;
  s.error = null;
}

/** Push a value onto the stack (history recall / constants). */
export function push(s: RplEngine, v: Value): void {
  commit(s);
  s.stack.push(v);
}

/** Run an op to a finite real Value or null — Complex results and decimal.js
 * domain throws both mean Error on the glass (complex objects arrive P12). */
function tryReal(op: () => unknown): Value | null {
  try {
    return asReal(op());
  } catch {
    return null;
  }
}

export function binary(s: RplEngine, op: (a: Value, b: Value) => unknown): void {
  commit(s);
  if (s.stack.length < 2) {
    s.error = "Too Few Arguments";
    return;
  }
  const b = s.stack.pop();
  const a = s.stack.pop();
  if (a === undefined || b === undefined) return; // length-checked above
  const r = tryReal(() => op(a, b));
  s.error = r === null ? "Error" : null;
  s.stack.push(r ?? bn(0));
}

export function unary(s: RplEngine, op: (a: Value) => unknown): void {
  commit(s);
  if (s.stack.length < 1) {
    s.error = "Too Few Arguments";
    return;
  }
  const a = s.stack.pop();
  if (a === undefined) return; // length-checked above
  const r = tryReal(() => op(a));
  s.error = r === null ? "Error" : null;
  s.stack.push(r ?? bn(0));
}

const toRad = (s: RplEngine, v: Value): Value =>
  s.angle === "DEG"
    ? v.times(PI).div(180)
    : s.angle === "GRD"
      ? v.times(PI).div(200)
      : v;
const fromRad = (s: RplEngine, v: Value): Value =>
  s.angle === "DEG"
    ? v.times(180).div(PI)
    : s.angle === "GRD"
      ? v.times(200).div(PI)
      : v;

/** Dispatch a legend/command id to a stack op. Returns true if handled. */
export function applyRplFunction(s: RplEngine, fn: string): boolean {
  if (/^[0-9]$/.test(fn)) {
    inputDigit(s, fn);
    return true;
  }
  switch (fn) {
    case ".":
      inputDigit(s, ".");
      return true;
    case "ENTER":
      enter(s);
      return true;
    case "+/−":
    case "CHS": // HP-28 prints CHS
      chs(s);
      return true;
    case "EEX":
      s.error = null;
      s.entry = startExponent(s.entry);
      return true;
    case "+":
      binary(s, (a, b) => math.add(a, b));
      return true;
    case "−":
      binary(s, (a, b) => math.subtract(a, b));
      return true;
    case "×":
      binary(s, (a, b) => math.multiply(a, b));
      return true;
    case "÷":
      binary(s, (a, b) => math.divide(a, b));
      return true;
    case "yˣ":
    case "^": // HP-28 red shift of ×
      binary(s, (a, b) => math.pow(a, b));
      return true;
    case "DUP":
      dup(s);
      return true;
    case "SWAP":
      swap(s);
      return true;
    case "DROP":
      drop(s);
      return true;
    case "CLEAR":
      clear(s);
      return true;
    case "1/x":
      unary(s, (a) => math.divide(bn(1), a));
      return true;
    case "√x":
    case "√": // HP-28C prints bare √
      unary(s, (a) => math.sqrt(a));
      return true;
    case "x²":
      unary(s, (a) => a.times(a));
      return true;
    case "LN":
      unary(s, (a) => math.log(a));
      return true;
    case "LOG":
      unary(s, (a) => math.log10(a));
      return true;
    case "eˣ":
      unary(s, (a) => math.exp(a));
      return true;
    case "10ˣ":
      unary(s, (a) => math.pow(bn(10), a));
      return true;
    case "SIN":
      unary(s, (a) => math.sin(toRad(s, a)));
      return true;
    case "COS":
      unary(s, (a) => math.cos(toRad(s, a)));
      return true;
    case "TAN":
      unary(s, (a) => math.tan(toRad(s, a)));
      return true;
    case "ASIN":
      unary(s, (a) => {
        const r = asReal(math.asin(a));
        return r === null ? r : fromRad(s, r);
      });
      return true;
    case "ACOS":
      unary(s, (a) => {
        const r = asReal(math.acos(a));
        return r === null ? r : fromRad(s, r);
      });
      return true;
    case "ATAN":
      unary(s, (a) => {
        const r = asReal(math.atan(a));
        return r === null ? r : fromRad(s, r);
      });
      return true;
    case "π":
      push(s, PI);
      return true;
    case "ˣ√y":
      // XROOT: level-1-th root of level 2 (48/49/50 right-shift of √x)
      binary(s, (a, b) => math.pow(a, bn(1).div(b)));
      return true;
    case "ABS":
      unary(s, (a) => a.abs());
      return true;
    case "RAD":
    case "DEG":
    case "GRD":
      s.angle = fn;
      return true;
    default:
      return false;
  }
}

/** Entry-editing keys that shouldn't print a history line. */
const ENTRY_OPS = new Set([".", "EEX", "CHS", "+/−"]);

/** Dispatch + record onto the engine-side history tape (FR-EXP-5). */
export function dispatchRpl(s: RplEngine, fn: string): boolean {
  const handled = applyRplFunction(s, fn);
  if (handled && !/^[0-9]$/.test(fn) && !ENTRY_OPS.has(fn)) {
    const top = s.stack.length ? s.stack[s.stack.length - 1] : bn(0);
    s.hist = [...s.hist.slice(-49), { op: fn, raw: top.toString() }];
  }
  return handled;
}
