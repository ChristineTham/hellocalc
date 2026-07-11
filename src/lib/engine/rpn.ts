// src/lib/engine/rpn.ts
// Fixed 4-level RPN stack engine (X/Y/Z/T + LAST X) with the HP lift / drop /
// no-lift semantics documented in hp/README.md. Pure TypeScript, framework-
// agnostic (per docs/architecture.md §3) so it is unit-testable in isolation.
//
// NOTE: uses JS numbers for now. A BigNumber upgrade (AGENTS.md §3, math.js
// configured to BigNumber) is a tracked follow-up — the UI already formats
// through fmt(), so the number type is the only thing that changes.

export type Angle = "DEG" | "RAD" | "GRD";

export interface RpnEngine {
  x: number;
  y: number;
  z: number;
  t: number;
  lastX: number;
  entry: string | null; // in-progress digit buffer (null = show x)
  lift: boolean; // stack lifts before the next number is keyed
  angle: Angle;
  error: string | null;
}

export function createRpn(): RpnEngine {
  return { x: 0, y: 0, z: 0, t: 0, lastX: 0, entry: null, lift: false, angle: "DEG", error: null };
}

/** Current value of X, honouring an in-progress entry. */
export function xval(s: RpnEngine): number {
  if (s.entry === null) return s.x;
  const n = parseFloat(s.entry);
  return Number.isFinite(n) ? n : 0;
}

function commit(s: RpnEngine): void {
  if (s.entry !== null) {
    s.x = xval(s);
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
function pushValue(s: RpnEngine, v: number): void {
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
  if (d === "." && s.entry.includes(".")) return;
  s.entry = s.entry === "0" && d !== "." ? d : s.entry + d;
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
    s.entry = s.entry.startsWith("-") ? s.entry.slice(1) : "-" + s.entry;
  } else {
    s.x = -s.x;
  }
}

export function clx(s: RpnEngine): void {
  s.x = 0;
  s.entry = null;
  s.lift = false;
  s.error = null;
}

/** Clear the entire stack (HP-35 `CLR`). */
export function clearAll(s: RpnEngine): void {
  s.x = 0;
  s.y = 0;
  s.z = 0;
  s.t = 0;
  s.entry = null;
  s.lift = false;
  s.error = null;
}

/** Binary op: y ∘ x → X, stack drops (T duplicates), LAST X = old x. */
export function binary(s: RpnEngine, op: (y: number, x: number) => number): void {
  const x = xval(s);
  const y = s.y;
  commit(s);
  s.lastX = x;
  const r = op(y, x);
  s.error = Number.isFinite(r) ? null : "Error";
  s.x = Number.isFinite(r) ? r : 0;
  s.y = s.z;
  s.z = s.t; // T duplicated
  s.lift = true;
}

/** Unary op: op(x) → X, LAST X = old x. Stack does not drop. */
export function unary(s: RpnEngine, op: (x: number) => number): void {
  const x = xval(s);
  commit(s);
  s.lastX = x;
  const r = op(x);
  s.error = Number.isFinite(r) ? null : "Error";
  s.x = Number.isFinite(r) ? r : 0;
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
  pushValue(s, s.lastX);
}

const toRad = (s: RpnEngine, v: number) =>
  s.angle === "DEG" ? (v * Math.PI) / 180 : s.angle === "GRD" ? (v * Math.PI) / 200 : v;
const fromRad = (s: RpnEngine, v: number) =>
  s.angle === "DEG" ? (v * 180) / Math.PI : s.angle === "GRD" ? (v * 200) / Math.PI : v;

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
    case "←":
      // true backspace (42S/35s/41/Prime): trim the in-progress entry;
      // with no entry it clears X like CLx
      if (s.entry !== null) {
        s.entry = s.entry.length > 1 ? s.entry.slice(0, -1) : null;
        if (s.entry === null) s.x = 0;
      } else {
        clx(s);
      }
      return true;
    case "CLR":
      clearAll(s);
      return true;
    case "+":
      binary(s, (y, x) => y + x);
      return true;
    case "−":
      binary(s, (y, x) => y - x);
      return true;
    case "×":
      binary(s, (y, x) => y * x);
      return true;
    case "÷":
      binary(s, (y, x) => y / x);
      return true;
    case "yˣ":
      binary(s, (y, x) => Math.pow(y, x));
      return true;
    case "1/x":
      unary(s, (x) => 1 / x);
      return true;
    case "√x":
      unary(s, Math.sqrt);
      return true;
    case "x²":
      unary(s, (x) => x * x);
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
      unary(s, (x) => Math.pow(10, x));
      return true;
    case "SIN":
      unary(s, (x) => Math.sin(toRad(s, x)));
      return true;
    case "COS":
      unary(s, (x) => Math.cos(toRad(s, x)));
      return true;
    case "TAN":
      unary(s, (x) => Math.tan(toRad(s, x)));
      return true;
    case "SIN⁻¹":
      unary(s, (x) => fromRad(s, Math.asin(x)));
      return true;
    case "COS⁻¹":
      unary(s, (x) => fromRad(s, Math.acos(x)));
      return true;
    case "TAN⁻¹":
      unary(s, (x) => fromRad(s, Math.atan(x)));
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
      pushValue(s, Math.PI);
      return true;
    case "ABS":
      unary(s, Math.abs);
      return true;
    case "INT":
      unary(s, Math.trunc);
      return true;
    case "FRAC":
      unary(s, (x) => x - Math.trunc(x));
      return true;
    case "x!":
      // integer factorial (HP-45/65/67 x!: non-negative integers only)
      unary(s, (x) => {
        if (x < 0 || !Number.isInteger(x)) return NaN;
        let r = 1;
        for (let i = 2; i <= x; i++) r *= i;
        return r;
      });
      return true;
    case "ˣ√y":
      // x-th root of y — the HP-65 f⁻¹ of yˣ
      binary(s, (y, x) => Math.pow(y, 1 / x));
      return true;
    case "D→R":
      unary(s, (x) => (x * Math.PI) / 180);
      return true;
    case "R→D":
      unary(s, (x) => (x * 180) / Math.PI);
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
      s.x = (s.y * x) / 100;
      s.lift = true;
      return true;
    }
    case "Δ%": {
      // percent change from y to x (Y stays, like %)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = ((x - s.y) / s.y) * 100;
      s.error = Number.isFinite(r) ? null : "Error";
      s.x = Number.isFinite(r) ? r : 0;
      s.lift = true;
      return true;
    }
    default:
      return false;
  }
}
