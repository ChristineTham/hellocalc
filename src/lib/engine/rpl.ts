// src/lib/engine/rpl.ts
// RPL dynamic (unlimited) object stack — the HP-28/48/49/50g model, contrasted
// with the fixed 4-level stack in rpn.ts (see hp/README.md). Pure TypeScript,
// framework-agnostic, unit-testable. Numeric-only for now (a full object stack
// with symbolics/lists is a later milestone); numbers are pushed bottom -> top,
// so the top of the stack is the last element (level 1).

export type Angle = "DEG" | "RAD" | "GRD";

export interface RplEngine {
  stack: number[]; // bottom -> top (top = level 1)
  entry: string | null;
  angle: Angle;
  error: string | null;
}

export function createRpl(): RplEngine {
  return { stack: [], entry: null, angle: "DEG", error: null };
}

/** Commit an in-progress entry by pushing it as a new stack level. */
function commit(s: RplEngine): void {
  if (s.entry !== null) {
    const n = parseFloat(s.entry);
    s.stack.push(Number.isFinite(n) ? n : 0);
    s.entry = null;
  }
}

export function inputDigit(s: RplEngine, d: string): void {
  s.error = null;
  if (s.entry === null) {
    s.entry = d === "." ? "0." : d;
    return;
  }
  if (d === "." && s.entry.includes(".")) return;
  s.entry = s.entry === "0" && d !== "." ? d : s.entry + d;
}

export function chs(s: RplEngine): void {
  if (s.entry !== null) {
    s.entry = s.entry.startsWith("-") ? s.entry.slice(1) : "-" + s.entry;
  } else if (s.stack.length) {
    s.stack[s.stack.length - 1] = -s.stack[s.stack.length - 1];
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

export function binary(s: RplEngine, op: (a: number, b: number) => number): void {
  commit(s);
  if (s.stack.length < 2) {
    s.error = "Too Few Arguments";
    return;
  }
  const b = s.stack.pop()!;
  const a = s.stack.pop()!;
  const r = op(a, b);
  s.error = Number.isFinite(r) ? null : "Error";
  s.stack.push(Number.isFinite(r) ? r : 0);
}

export function unary(s: RplEngine, op: (a: number) => number): void {
  commit(s);
  if (s.stack.length < 1) {
    s.error = "Too Few Arguments";
    return;
  }
  const a = s.stack.pop()!;
  const r = op(a);
  s.error = Number.isFinite(r) ? null : "Error";
  s.stack.push(Number.isFinite(r) ? r : 0);
}

const toRad = (s: RplEngine, v: number) =>
  s.angle === "DEG" ? (v * Math.PI) / 180 : s.angle === "GRD" ? (v * Math.PI) / 200 : v;
const fromRad = (s: RplEngine, v: number) =>
  s.angle === "DEG" ? (v * 180) / Math.PI : s.angle === "GRD" ? (v * 200) / Math.PI : v;

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
      chs(s);
      return true;
    case "+":
      binary(s, (a, b) => a + b);
      return true;
    case "−":
      binary(s, (a, b) => a - b);
      return true;
    case "×":
      binary(s, (a, b) => a * b);
      return true;
    case "÷":
      binary(s, (a, b) => a / b);
      return true;
    case "yˣ":
      binary(s, (a, b) => Math.pow(a, b));
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
      unary(s, (a) => 1 / a);
      return true;
    case "√x":
      unary(s, Math.sqrt);
      return true;
    case "x²":
      unary(s, (a) => a * a);
      return true;
    case "LN":
      unary(s, Math.log);
      return true;
    case "LOG":
      unary(s, Math.log10);
      return true;
    case "eˣ":
      unary(s, Math.exp);
      return true;
    case "10ˣ":
      unary(s, (a) => Math.pow(10, a));
      return true;
    case "SIN":
      unary(s, (a) => Math.sin(toRad(s, a)));
      return true;
    case "COS":
      unary(s, (a) => Math.cos(toRad(s, a)));
      return true;
    case "TAN":
      unary(s, (a) => Math.tan(toRad(s, a)));
      return true;
    case "ASIN":
      unary(s, (a) => fromRad(s, Math.asin(a)));
      return true;
    case "ACOS":
      unary(s, (a) => fromRad(s, Math.acos(a)));
      return true;
    case "ATAN":
      unary(s, (a) => fromRad(s, Math.atan(a)));
      return true;
    case "π":
      commit(s);
      s.stack.push(Math.PI);
      return true;
    default:
      return false;
  }
}
