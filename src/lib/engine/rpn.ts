// src/lib/engine/rpn.ts
// Fixed 4-level RPN stack engine (X/Y/Z/T + LAST X) with the HP lift / drop /
// no-lift semantics documented in hp/README.md, computing on the BigNumber
// value tower (config.ts) so arithmetic is exact (Phase 1). Pure TypeScript,
// framework-agnostic (per docs/architecture.md §3) so it is unit-testable in
// isolation and Web-Worker safe.

import { asReal, bn, math, num, PI, type Value } from "./config";
import { DEFAULT_FORMAT, type DisplayFormat } from "./format";
import { appendDigit, backspace, parseEntry, startExponent, toggleSign } from "./entry";
import { bestFit, fit as cfit, forecastX, forecastY } from "./stats-fit";
import { ALPHA_PAGES, CONST_VALUES, DYNAMIC_MENUS, MENUS42 } from "./menu42";
import { determinant as det, inverse, Matrix } from "ml-matrix";
import {
  digitOk,
  freshInt,
  intAdd,
  intAnd,
  intAsr,
  intCountBits,
  intDblDiv,
  intDblMul,
  intDiv,
  intFormat,
  intLj,
  intMask,
  intMul,
  intNot,
  intOr,
  intParse,
  intRmd,
  intRotate,
  intSetBit,
  intShift,
  intSub,
  intTestBit,
  intXor,
  type IntMode,
  type WordResult,
} from "./integer";
import {
  addDays,
  bondPrice,
  bondYTM,
  daysBetween,
  decodeDate,
  depDB,
  depSL,
  depSOYD,
  encodeDate,
  freshFin,
  irr,
  npv,
  solveFV,
  solveI,
  solveN,
  solvePMT,
  solvePV,
  type FinRegs,
} from "./finance";

export type Angle = "DEG" | "RAD" | "GRD";

/** Injectable wall clock (P11, HP-41CX time module): the engine never calls
 * Date directly, so tests pin time and the module stays worker-safe. */
let clock: () => Date = () => new Date();
export function setClock(fn: () => Date): void {
  clock = fn;
}

/** One history-tape entry: the op and the exact post-op X (raw BigNumber
 * string, so recall loses nothing to display rounding). */
export interface HistEntry {
  op: string;
  raw: string;
}

/** Argument-taking keys (P2/P3): `STO n`/`RCL n` await a register digit (with
 * an optional register-arithmetic operator between), FIX/SCI/DSP await a
 * digits count, GTO awaits a label (digit or A–E). Transient — never
 * persisted. */
export interface PendingArg {
  op:
    | "STO"
    | "RCL"
    | "FIX"
    | "SCI"
    | "ENG"
    | "DSP"
    | "GTO"
    | "LBL"
    | "GSB"
    | "SF"
    | "CF"
    | "F?"
    | "ASN"
    | "VIEW"
    | "ISG"
    | "DSE"
    | "HYP"
    | "HYP⁻¹"
    | "DIM"
    | "MATRIX"
    | "RESULT"
    | "X⇄"
    | "TEST"
    | "SOLVE"
    | "∫"
    | "WINDOW"
    | "SHOW"
    | "DET"
    | "TRN"
    | "INV";
  /** the XEQ name being assigned (ASN) */
  name?: string;
  arith?: "+" | "−" | "×" | "÷";
}

export type PrgmMode = "RUN" | "PRGM";

/** Keystroke program store (P3, HP-65): steps ARE key ids — recording is key
 * capture, playback is dispatch replay, exactly like the hardware. */
export interface PrgmState {
  steps: string[];
  pc: number; // record cursor (PRGM) / execution pointer (RUN)
  mode: PrgmMode;
  flags: boolean[]; // F0–F3 (65: SF/TF 1–2; 67/97: SF/CF/F? 0–3)
  ret: number[]; // GSB return stack (P5)
}

const freshPrgm = (): PrgmState => ({
  steps: [],
  pc: 0,
  mode: "RUN",
  flags: [false, false, false, false],
  ret: [],
});

/** Σ summation registers (HP-45 descriptive statistics, FR-STAT-1). */
export interface SumRegs {
  n: Value;
  x: Value;
  x2: Value;
  y: Value;
  y2: Value;
  xy: Value;
}

export interface RpnEngine {
  x: Value;
  y: Value;
  z: Value;
  t: Value;
  lastX: Value;
  mem: Value; // single memory register (HP-35 STO/RCL, no argument)
  regs: Value[]; // addressable registers R0–R9 (HP-45 uses R1–R9)
  regsS: Value[]; // secondary registers RS0–RS9 (HP-67/97 P⇄S)
  iReg: Value; // the I index register (HP-67/97 indirect addressing)
  sum: SumRegs; // Σ+ accumulation
  prgm: PrgmState; // keystroke program (P3)
  fin: FinRegs; // financial registers (P7, HP-12C)
  rng: number; // RAN# LCG seed (deterministic, persisted)
  cpx: boolean; // complex mode (15C f-I); imag mirrors the stack
  imag: { x: Value; y: Value; z: Value; t: Value };
  /** matrix store A–E (P9, HP-15C) — float64 rows via ml-matrix; the 15C
   * itself carried 10 digits, so float64 ≥ hardware precision */
  mats: Record<string, number[][]>;
  matResult: string; // RESULT descriptor target
  int: IntMode; // the 16C integer universe (P10)
  fresh: boolean; // a value was just keyed/recalled — TVM keys STORE, not solve
  alpha: string; // the ALPHA register (P6, HP-41) — typed via α-prefixed ids
  userOn: boolean; // USER mode (P6): key assignments intercept dispatch
  userAsn: Record<string, string>; // key id → XEQ name (ASN)
  pending: PendingArg | null; // argument-taking key in progress
  /** the 42S RPN menu system (P16): active menu + nesting stack */
  menu: { name: string; page: number } | null;
  menuStack: string[];
  /** CUSTOM row assignments (ASSIGN); assignPend captures the next key */
  custom42: string[];
  assignPend: boolean;
  /** CFIT state: active model + the raw Σ points behind the fits */
  fit: "LINF" | "LOGF" | "EXPF" | "PWRF";
  pts: [number, number][];
  entry: string | null; // in-progress digit buffer (null = show x)
  lift: boolean; // stack lifts before the next number is keyed
  angle: Angle;
  disp: DisplayFormat;
  error: string | null;
  hist: HistEntry[]; // engine-side history (FR-EXP-5), capped at 50
}

const zeroSum = (): SumRegs => ({ n: bn(0), x: bn(0), x2: bn(0), y: bn(0), y2: bn(0), xy: bn(0) });

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
    regsS: Array.from({ length: 10 }, () => zero),
    iReg: zero,
    sum: zeroSum(),
    menu: null,
    menuStack: [],
    custom42: [],
    assignPend: false,
    fit: "LINF",
    pts: [],
    prgm: freshPrgm(),
    fin: freshFin(),
    rng: 12345,
    cpx: false,
    imag: { x: zero, y: zero, z: zero, t: zero },
    mats: {},
    matResult: "C",
    int: freshInt(),
    fresh: false,
    alpha: "",
    userOn: false,
    userAsn: {},
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
  if (s.entry === null) return s.x;
  return s.int.on ? intParse(s.entry, s.int) : parseEntry(s.entry);
}

function commit(s: RpnEngine): void {
  if (s.entry !== null) {
    s.x = s.int.on ? intParse(s.entry, s.int) : parseEntry(s.entry);
    s.entry = null;
  }
}

function liftIfEnabled(s: RpnEngine): void {
  if (s.lift) {
    s.t = s.z;
    s.z = s.y;
    s.y = s.x;
    s.imag.t = s.imag.z;
    s.imag.z = s.imag.y;
    s.imag.y = s.imag.x;
    s.imag.x = bn(0); // a freshly keyed number is real
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
  if (s.int.on) {
    // base entry (P10): digits legal for the base append, no point, no EEX
    if (d === "." || !digitOk(d, s.int.base)) return;
    if (s.entry === null) {
      liftIfEnabled(s);
      s.entry = d;
      s.lift = false;
    } else {
      s.entry += d;
    }
    return;
  }
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
  s.imag.t = s.imag.z;
  s.imag.z = s.imag.y;
  s.imag.y = s.imag.x;
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
  s.imag.x = bn(0);
  s.imag.y = s.imag.z;
  s.imag.z = s.imag.t;
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
  const ai = s.imag.x;
  s.imag.x = s.imag.y;
  s.imag.y = ai;
  s.lift = true;
}

export function rollDown(s: RpnEngine): void {
  commit(s);
  const a = s.x;
  s.x = s.y;
  s.y = s.z;
  s.z = s.t;
  s.t = a;
  const ai = s.imag.x;
  s.imag.x = s.imag.y;
  s.imag.y = s.imag.z;
  s.imag.z = s.imag.t;
  s.imag.t = ai;
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
  const ai = s.imag.t;
  s.imag.t = s.imag.z;
  s.imag.z = s.imag.y;
  s.imag.y = s.imag.x;
  s.imag.x = ai;
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

/** decimal degrees → D.MMSS encoding (30.5 → 30.30). */
function dec2dms(x: Value): Value {
  const sign = x.isNegative() ? bn(-1) : bn(1);
  const a = x.abs();
  const d = a.trunc();
  const minFull = a.minus(d).times(60);
  const m = minFull.trunc();
  const sec = minFull.minus(m).times(60);
  return sign.times(d.plus(m.div(100)).plus(sec.div(10000)));
}

/** D.MMSS encoding → decimal degrees (30.30 → 30.5). */
function dms2dec(x: Value): Value {
  const sign = x.isNegative() ? bn(-1) : bn(1);
  const a = x.abs();
  const d = a.trunc();
  const rest = a.minus(d).times(100);
  const m = rest.trunc();
  const sec = rest.minus(m).times(100);
  return sign.times(d.plus(m.div(60)).plus(sec.div(3600)));
}

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
const isLabel = (fn: string): boolean => /^[0-9A-Fa-e]$/.test(fn);

function resolvePending(s: RpnEngine, fn: string): boolean {
  const p = s.pending;
  if (p === null) return false;
  if (p.op === "GTO" && isLabel(fn)) {
    // RUN-mode GTO label: park the pointer after the matching LBL
    s.pending = null;
    const at = findLabel(s.prgm.steps, fn);
    if (at === null) {
      s.error = "Error";
      return true;
    }
    s.prgm.pc = at;
    return true;
  }
  if (p.op === "LBL" && isLabel(fn)) {
    // a label pressed in RUN mode marks nothing — consume and move on
    s.pending = null;
    return true;
  }
  if (p.op === "GSB" && isLabel(fn)) {
    // keyboard GSB = run the subroutine from its label
    s.pending = null;
    runLabel(s, fn);
    return true;
  }
  if ((p.op === "SF" || p.op === "CF" || p.op === "F?") && /^[0-5]$/.test(fn)) {
    s.pending = null;
    const i = Number(fn);
    // the 16C mirrors flag 4 to CARRY and flag 5 to out-of-range
    if (p.op === "SF") {
      if (i === 4) s.int = { ...s.int, carry: true };
      else if (i === 5) s.int = { ...s.int, oor: true };
      else s.prgm.flags[i] = true;
    } else if (p.op === "CF") {
      if (i === 4) s.int = { ...s.int, carry: false };
      else if (i === 5) s.int = { ...s.int, oor: false };
      else s.prgm.flags[i] = false;
    }
    return true;
  }
  if (p.op === "WINDOW" && /^[0-9]$/.test(fn)) {
    s.pending = null; // display windowing accepted (glass concern)
    return true;
  }
  if (p.op === "SHOW" && (fn === "HEX" || fn === "DEC" || fn === "OCT" || fn === "BIN")) {
    // flash X in another base — printed to the tape, like the 16C flashing it
    s.pending = null;
    const base = fn === "HEX" ? 16 : fn === "DEC" ? 10 : fn === "OCT" ? 8 : 2;
    s.hist = [
      ...s.hist.slice(-49),
      {
        op: `🖨 ${intFormat(xval(s), { ...s.int, base: base as 2 | 8 | 10 | 16 })}`,
        raw: xval(s).trunc().toFixed(0),
      },
    ];
    return true;
  }
  if (p.op === "ASN") {
    // ANY next key becomes the assignment target (USER mode intercepts it)
    s.pending = null;
    if (p.name) s.userAsn = { ...s.userAsn, [fn]: p.name };
    return true;
  }
  if (p.op === "VIEW" && /^[0-9]$/.test(fn)) {
    // view a register — printed to the tape, like the 41 flashing it
    s.pending = null;
    const i = Number(fn);
    s.hist = [...s.hist.slice(-49), { op: `🖨 R${i}`, raw: s.regs[i].toString() }];
    return true;
  }
  if ((p.op === "ISG" || p.op === "DSE") && /^[0-9]$/.test(fn)) {
    s.pending = null;
    const i = Number(fn);
    s.regs[i] = p.op === "ISG" ? isgStep(s.regs[i]) : dseStep(s.regs[i]);
    return true;
  }
  if ((p.op === "HYP" || p.op === "HYP⁻¹") && (fn === "SIN" || fn === "COS" || fn === "TAN")) {
    // hyperbolic prefix (11C/15C): HYP SIN → sinh, HYP⁻¹ TAN → atanh …
    const inv = p.op === "HYP⁻¹";
    s.pending = null;
    unary(s, (x) =>
      fn === "SIN"
        ? (inv ? math.asinh(x) : math.sinh(x))
        : fn === "COS"
          ? (inv ? math.acosh(x) : math.cosh(x))
          : inv
            ? math.atanh(x)
            : math.tanh(x),
    );
    return true;
  }
  if (p.op === "DIM" && /^[A-E]$/.test(fn)) {
    // rows in Y, cols in X (2 ENTER 3 f DIM A → 2×3 zero matrix)
    s.pending = null;
    commit(s);
    const rows = Math.max(1, Math.trunc(num(s.y)));
    const cols = Math.max(1, Math.trunc(num(s.x)));
    s.mats = { ...s.mats, [fn]: Matrix.zeros(rows, cols).to2DArray() };
    s.lift = true;
    return true;
  }
  if (p.op === "RESULT" && /^[A-E]$/.test(fn)) {
    s.pending = null;
    s.matResult = fn;
    return true;
  }
  if ((p.op === "DET" || p.op === "TRN" || p.op === "INV") && /^[A-E]$/.test(fn)) {
    // P16 (42S MATRIX menu) on the P9 store: DET pushes the determinant;
    // TRN/INV rewrite the named matrix in place
    s.pending = null;
    const m = s.mats[fn];
    if (!m) {
      s.error = "Error";
      return true;
    }
    try {
      if (p.op === "DET") {
        if (m.length !== (m[0]?.length ?? 0)) throw new Error("dim");
        pushX(s, bn(String(det(new Matrix(m)))));
      } else if (p.op === "TRN") {
        s.mats = { ...s.mats, [fn]: new Matrix(m).transpose().to2DArray() };
      } else {
        if (m.length !== (m[0]?.length ?? 0)) throw new Error("dim");
        s.mats = { ...s.mats, [fn]: inverse(new Matrix(m)).to2DArray() };
      }
    } catch {
      s.error = "Error";
    }
    return true;
  }
  if (p.op === "MATRIX" && /^[0-9]$/.test(fn)) {
    s.pending = null;
    matrixMenu(s, Number(fn));
    return true;
  }
  if (p.op === "X⇄" && /^[0-9]$/.test(fn)) {
    // x≷ n: exchange X with a storage register
    s.pending = null;
    commit(s);
    const i = Number(fn);
    const a = s.x;
    s.x = s.regs[i];
    s.regs[i] = a;
    s.lift = true;
    return true;
  }
  if (p.op === "TEST" && /^[0-9]$/.test(fn)) {
    // TEST n outside a program: consume the digit (flow control only)
    s.pending = null;
    return true;
  }
  if ((p.op === "SOLVE" || p.op === "∫") && isLabel(fn)) {
    s.pending = null;
    if (p.op === "SOLVE") solveLabel(s, fn);
    else integrateLabel(s, fn);
    return true;
  }
  if ((p.op === "STO" || p.op === "RCL") && /^[A-E]$/.test(fn) && s.mats[fn]) {
    // matrix element access via the R0/R1 counters (the 15C protocol):
    // row = R0, col = R1, auto-incrementing column-then-row
    s.pending = null;
    const m = s.mats[fn];
    const r0 = Math.max(1, Math.trunc(num(s.regs[0])));
    const r1 = Math.max(1, Math.trunc(num(s.regs[1])));
    if (r0 > m.length || r1 > m[0].length) {
      s.error = "Error";
      return true;
    }
    if (p.op === "STO") {
      commit(s);
      const rows = m.map((row) => [...row]);
      rows[r0 - 1][r1 - 1] = num(s.x);
      s.mats = { ...s.mats, [fn]: rows };
      s.lift = true;
    } else {
      pushX(s, bn(m[r0 - 1][r1 - 1]));
    }
    // advance the element counters with wrap (col-first)
    if (r1 < m[0].length) s.regs[1] = bn(r1 + 1);
    else {
      s.regs[1] = bn(1);
      s.regs[0] = r0 < m.length ? bn(r0 + 1) : bn(1);
    }
    return true;
  }
  if ((p.op === "STO" || p.op === "RCL" || p.op === "GTO") && fn === "(i)") {
    // indirect addressing through I (HP-67/97): the argument comes from the
    // I register — register index for STO/RCL, a digit label for GTO
    const i = Math.abs(Math.trunc(num(s.iReg)));
    s.pending = null;
    if (p.op === "GTO") {
      const at = findLabel(s.prgm.steps, String(i % 10));
      if (at === null) s.error = "Error";
      else s.prgm.pc = at;
      return true;
    }
    const idx = i % 10;
    if (p.op === "STO") {
      commit(s);
      const r = p.arith ? tryReal(() => arith(s.regs[idx], s.x, p.arith as ArithOp)) : s.x;
      s.error = r === null ? "Error" : null;
      s.regs[idx] = r ?? bn(0);
      s.lift = true;
    } else {
      pushX(s, s.regs[idx]);
    }
    return true;
  }
  if (/^[0-9]$/.test(fn)) {
    const i = Number(fn);
    s.pending = null;
    if (p.op === "FIX" || p.op === "SCI" || p.op === "ENG") {
      s.disp = { mode: p.op, digits: i };
      return true;
    }
    if (p.op === "DSP") {
      // HP-65 DSP n: digit count only, format mode unchanged
      s.disp = { ...s.disp, digits: i };
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

// ---- keystroke program interpreter (P3) --------------------------------------

/** Index just past `LBL <label>` in the step list, or null. */
function findLabel(steps: string[], label: string): number | null {
  for (let i = 0; i + 1 < steps.length; i++) {
    if (steps[i] === "LBL" && steps[i + 1] === label) return i + 2;
  }
  return null;
}

/** Steps whose next step is an argument (skip both on a false conditional). */
const ARG_TAKERS = new Set([
  "GTO", "LBL", "GSB", "STO n", "RCL n", "FIX", "SCI", "ENG", "DSP", "SF", "CF", "F?", "ISG", "DSE", "VIEW", "TEST", "SOLVE", "∫ˣy", "DIM", "MATRIX", "RESULT", "x≷",
]);

const CONDITIONALS = new Set(["x=y", "x≠y", "x≤y", "x>y", "x<y", "x≥y", "x<0", "x=0", "x≠0", "x>0", "x≥0"]);

/** Evaluate an HP conditional against the live stack. */
function testCondition(s: RpnEngine, fn: string): boolean {
  const x = xval(s);
  const y = s.y;
  switch (fn) {
    case "x=y": return x.eq(y);
    case "x≠y": return !x.eq(y);
    case "x≤y": return x.lte(y);
    case "x<y": return x.lt(y);
    case "x≥y": return x.gte(y);
    case "x>y": return x.gt(y);
    case "x=0": return x.isZero();
    case "x≠0": return !x.isZero();
    case "x<0": return x.isNegative() && !x.isZero();
    case "x≥0": return !x.isNegative() || x.isZero();
    case "x>0": return !x.isNegative() && !x.isZero();
    default: return true;
  }
}

/** Complex arithmetic (15C complex mode): route through mathjs Complex —
 * float64, which exceeds the hardware's 10 digits. Returns [re, im] or null. */
function cpxBinary(
  yre: Value, yim: Value, xre: Value, xim: Value,
  op: "+" | "−" | "×" | "÷" | "yˣ",
): [Value, Value] | null {
  try {
    const a = math.complex(num(yre), num(yim));
    const b = math.complex(num(xre), num(xim));
    const r: unknown =
      op === "+" ? math.add(a, b)
      : op === "−" ? math.subtract(a, b)
      : op === "×" ? math.multiply(a, b)
      : op === "÷" ? math.divide(a, b)
      : math.pow(a, b);
    // results come back as Complex or (purely real) number/BigNumber
    if (math.isComplex(r)) {
      if (!Number.isFinite(r.re) || !Number.isFinite(r.im)) return null;
      return [bn(r.re), bn(r.im)];
    }
    if (typeof r === "number") {
      return Number.isFinite(r) ? [bn(r), bn(0)] : null;
    }
    if (math.isBigNumber(r)) {
      return r.isFinite() ? [r, bn(0)] : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Least-squares line over the Σ registers: y = A + Bx (12C estimates). */
function linReg(sum: SumRegs): { A: Value; B: Value; r: Value } | null {
  if (sum.n.lt(2)) return null;
  const dx = sum.n.times(sum.x2).minus(sum.x.times(sum.x));
  const dy = sum.n.times(sum.y2).minus(sum.y.times(sum.y));
  if (dx.isZero() || dy.isZero()) return null;
  const B = sum.n.times(sum.xy).minus(sum.x.times(sum.y)).div(dx);
  const A = sum.y.minus(B.times(sum.x)).div(sum.n);
  const r = sum.n.times(sum.xy).minus(sum.x.times(sum.y)).div(dx.times(dy).sqrt());
  return { A, B, r };
}

/** HP loop encoding iiiii.fffcc: counter int part, fff target, cc step. */
function isgParts(v: Value): { i: Value; target: number; step: number } {
  const i = v.trunc();
  const frac = v.abs().minus(v.abs().trunc());
  const digits = frac.toFixed(5).slice(2); // "fffcc"
  const target = Number(digits.slice(0, 3));
  const step = Number(digits.slice(3, 5)) || 1;
  return { i, target, step };
}

/** ISG: counter += step, keeping the encoded fraction. */
function isgStep(v: Value): Value {
  const { i, step } = isgParts(v);
  const frac = v.abs().minus(v.abs().trunc());
  const next = i.plus(step);
  return next.isNegative() ? next.minus(frac) : next.plus(frac);
}

/** DSE: counter −= step, keeping the encoded fraction (skip when ≤ target). */
function dseStep(v: Value): Value {
  const { i, step } = isgParts(v);
  const frac = v.abs().minus(v.abs().trunc());
  const next = i.minus(step);
  return next.isNegative() ? next.minus(frac) : next.plus(frac);
}

/** Runaway guard (NFR-9): a GTO loop without exit halts with Error instead of
 * freezing — the interpreter is pure TS and Web-Worker-ready, and this hard
 * budget guarantees the UI thread can never hang before that isolation lands
 * (P12, where user programs become unbounded RPL). */
const MAX_PROGRAM_OPS = 10_000;

/** Execute one program step at pc (skip-on-false handles argument widths). */
function execStep(s: RpnEngine): void {
  const { steps } = s.prgm;
  const fn = steps[s.prgm.pc];
  if (fn === undefined) return;
  if (fn === "LBL") {
    s.prgm.pc += 2; // marker + label
    return;
  }
  if (fn === "GTO" || fn === "GSB") {
    const at = findLabel(steps, steps[s.prgm.pc + 1] ?? "");
    if (at === null) {
      s.error = "Error";
      s.prgm.pc = steps.length;
      return;
    }
    if (fn === "GSB") s.prgm.ret.push(s.prgm.pc + 2); // return past the call
    s.prgm.pc = at;
    return;
  }
  if (fn === "F?") {
    // flag test with a digit argument: consume both, skip-on-false
    const d = Number(steps[s.prgm.pc + 1] ?? "0");
    const pass = s.prgm.flags[d] === true;
    s.prgm.pc += 2;
    if (!pass) {
      const next = steps[s.prgm.pc];
      s.prgm.pc += next !== undefined && ARG_TAKERS.has(next) ? 2 : 1;
    }
    return;
  }
  if (fn === "TEST") {
    // TEST n: the 15C's numbered comparison set
    const d = Number(steps[s.prgm.pc + 1] ?? "0");
    const table = ["x≠0", "x>0", "x<0", "x≥0", "x≤0", "x=y", "x≠y", "x>y", "x<y", "x≥y"];
    const cond = table[d] ?? "x≠0";
    const pass = cond === "x≤0" ? !testCondition(s, "x>0") : testCondition(s, cond);
    s.prgm.pc += 2;
    if (!pass) {
      const next = steps[s.prgm.pc];
      s.prgm.pc += next !== undefined && ARG_TAKERS.has(next) ? 2 : 1;
    }
    return;
  }
  if (fn === "ISG" || fn === "DSE") {
    // increment/decrement loop control over an encoded register
    const d = Number(steps[s.prgm.pc + 1] ?? "0");
    s.regs[d] = fn === "ISG" ? isgStep(s.regs[d]) : dseStep(s.regs[d]);
    const { i, target } = isgParts(s.regs[d]);
    const pass = fn === "ISG" ? !i.gt(target) : i.gt(target); // skip past target
    s.prgm.pc += 2;
    if (!pass) {
      const next = steps[s.prgm.pc];
      s.prgm.pc += next !== undefined && ARG_TAKERS.has(next) ? 2 : 1;
    }
    return;
  }
  if (
    CONDITIONALS.has(fn) ||
    fn === "TF 1" ||
    fn === "TF 2" ||
    fn === "DSZ" ||
    fn === "DSZ I" ||
    fn === "ISZ I"
  ) {
    let pass: boolean;
    if (fn === "TF 1") pass = s.prgm.flags[1];
    else if (fn === "TF 2") pass = s.prgm.flags[2];
    else if (fn === "DSZ") {
      // decrement-skip-on-zero over R8 (HP-65 manual)
      s.regs[8] = s.regs[8].minus(1);
      pass = !s.regs[8].isZero();
    } else if (fn === "DSZ I" || fn === "ISZ I") {
      // the 67/97 count on the I register
      s.iReg = fn === "DSZ I" ? s.iReg.minus(1) : s.iReg.plus(1);
      pass = !s.iReg.isZero();
    } else pass = testCondition(s, fn);
    s.prgm.pc += 1;
    if (!pass) {
      // "do if true": skip the next instruction, argument included
      const next = steps[s.prgm.pc];
      s.prgm.pc += next !== undefined && ARG_TAKERS.has(next) ? 2 : 1;
    }
    return;
  }
  applyFunction(s, fn);
  s.prgm.pc += 1;
}

/** Apply a word-op result to X with flags (unary shape). */
function applyWord(s: RpnEngine, r: WordResult): void {
  const x = xval(s);
  commit(s);
  s.lastX = x;
  s.x = r.value;
  s.int = { ...s.int, carry: r.carry, oor: r.oor };
  s.lift = true;
}

/** Unary word transform without flag changes. */
function applyWordFrom(s: RpnEngine, f: (x: Value) => Value): void {
  const x = xval(s);
  commit(s);
  s.lastX = x;
  s.x = f(x);
  s.lift = true;
}

/** The 15C MATRIX menu (P9 subset — faithful where implemented):
 * 0 clear all · 1 reset R0/R1 · 4 transpose RESULT · 5 AᵀB → RESULT ·
 * 9 det(RESULT). Residuals/norms (6–8) and complex transforms (2–3) are
 * deferred with the descriptor-stack work — noted in plan/phase-09. */
function matrixMenu(s: RpnEngine, n: number): void {
  if (n === 0) {
    s.mats = {};
    return;
  }
  if (n === 1) {
    s.regs[0] = bn(1);
    s.regs[1] = bn(1);
    return;
  }
  if (n === 4) {
    const m = s.mats[s.matResult];
    if (!m) {
      s.error = "Error";
      return;
    }
    s.mats = { ...s.mats, [s.matResult]: new Matrix(m).transpose().to2DArray() };
    return;
  }
  if (n === 5) {
    const a = s.mats["A"];
    const b = s.mats["B"];
    if (!a || !b) {
      s.error = "Error";
      return;
    }
    try {
      const r = new Matrix(a).transpose().mmul(new Matrix(b));
      s.mats = { ...s.mats, [s.matResult]: r.to2DArray() };
    } catch {
      s.error = "Error";
    }
    return;
  }
  if (n === 9) {
    const m = s.mats[s.matResult];
    if (!m || m.length !== m[0].length) {
      s.error = "Error";
      return;
    }
    try {
      pushX(s, bn(det(new Matrix(m))));
    } catch {
      s.error = "Error";
    }
    return;
  }
  // 2/3/6/7/8: accepted, deferred (see plan/phase-09 notes)
}

/** f(x) through a program label: x → X, run, read X. */
function evalLabel(s: RpnEngine, label: string, x: Value): Value | null {
  pushX(s, x);
  runLabel(s, label);
  return s.error ? null : xval(s);
}

/** SOLVE (15C): secant iterations from the guesses in Y (a) and X (b). */
function solveLabel(s: RpnEngine, label: string): void {
  commit(s);
  let a = s.y;
  let b = s.x;
  if (a.eq(b)) a = b.plus(1);
  let fa = evalLabel(s, label, a);
  let fb = evalLabel(s, label, b);
  if (fa === null || fb === null) {
    s.error = "Error";
    return;
  }
  for (let it = 0; it < 100; it++) {
    if (fb.abs().lt(bn("1e-12"))) {
      pushX(s, b);
      return;
    }
    const denom = fb.minus(fa);
    if (denom.isZero()) break;
    const c = b.minus(fb.times(b.minus(a)).div(denom));
    a = b;
    fa = fb;
    b = c;
    fb = evalLabel(s, label, b);
    if (fb === null) {
      s.error = "Error";
      return;
    }
  }
  s.error = "Error"; // no root found (the 15C shows Error 8)
}

/** ∫ˣy (15C): composite Simpson over [Y, X] with 128 panels. */
function integrateLabel(s: RpnEngine, label: string): void {
  commit(s);
  const lo = s.y;
  const hi = s.x;
  const nPanels = 128;
  const h = hi.minus(lo).div(nPanels);
  let acc = bn(0);
  for (let k = 0; k <= nPanels; k++) {
    const xk = lo.plus(h.times(k));
    const fx = evalLabel(s, label, xk);
    if (fx === null) {
      s.error = "Error";
      return;
    }
    const w = k === 0 || k === nPanels ? 1 : k % 2 === 1 ? 4 : 2;
    acc = acc.plus(fx.times(w));
  }
  const result = acc.times(h).div(3);
  // stack like a binary op: limits consumed, integral to X
  s.lastX = hi;
  s.x = result;
  s.y = s.z;
  s.z = s.t;
  s.lift = true;
}

/** RUN from the current pointer until R/S, RTN, the end, or the op budget. */
export function runProgram(s: RpnEngine): void {
  commit(s); // R/S is a function key — it terminates digit entry first
  let ops = 0;
  const { steps } = s.prgm;
  while (s.prgm.pc < steps.length) {
    if (++ops > MAX_PROGRAM_OPS) {
      s.error = "Error";
      break;
    }
    const fn = steps[s.prgm.pc];
    if (fn === "R/S") {
      s.prgm.pc += 1; // pause; resume from here
      return;
    }
    if (fn === "RTN") {
      const back = s.prgm.ret.pop();
      if (back !== undefined) {
        s.prgm.pc = back; // subroutine return (P5)
        continue;
      }
      s.prgm.pc = 0;
      return;
    }
    execStep(s);
    if (s.error) break;
  }
  s.prgm.pc = 0; // ran off the end (or halted on error) — reset like RTN
}

/** Jump to `LBL <label>` and run (the HP-65 A–E user keys). */
export function runLabel(s: RpnEngine, label: string): void {
  const at = findLabel(s.prgm.steps, label);
  if (at === null) return; // no program under this key — silently inert
  s.prgm.pc = at;
  s.prgm.ret = []; // a keyboard start owns a fresh call stack
  runProgram(s);
}

/**
 * Dispatch a function id (a legend from hp/mapping.json) to a stack operation.
 * Returns true if handled. Unimplemented ids (financial TVM, programming, RPL,
 * etc.) return false so the UI can no-op them until later milestones.
 */
export function applyFunction(s: RpnEngine, fn: string): boolean {
  if (s.pending) return resolvePending(s, fn);
  if (s.int.on && /^[A-F]$/.test(fn) && s.int.base === 16) {
    inputDigit(s, fn);
    return true;
  }
  if (fn.length === 2 && fn.startsWith("α")) {
    // ALPHA-mode character (P6): append to the alpha register (24-char cap)
    if (s.alpha.length < 24) s.alpha += fn.slice(1);
    return true;
  }
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
    case "ENG":
      s.disp = { ...s.disp, mode: "ENG" };
      s.pending = { op: "ENG" };
      return true;
    case "+":
    case "−":
    case "×":
    case "÷":
    case "yˣ": {
      if (s.int.on && fn !== "yˣ") {
        // 16C word arithmetic with carry / out-of-range flags
        const x = xval(s);
        commit(s);
        s.lastX = x;
        const r =
          fn === "+"
            ? intAdd(s.y, x, s.int)
            : fn === "−"
              ? intSub(s.y, x, s.int)
              : fn === "×"
                ? intMul(s.y, x, s.int)
                : intDiv(s.y, x, s.int);
        if (r === null) {
          s.error = "Error";
          return true;
        }
        s.x = r.value;
        s.int = { ...s.int, carry: r.carry, oor: r.oor };
        s.y = s.z;
        s.z = s.t;
        s.lift = true;
        return true;
      }
      if (s.cpx && (!s.imag.x.isZero() || !s.imag.y.isZero())) {
        // complex mode with imaginary content: parallel-stack arithmetic
        const x = xval(s);
        commit(s);
        s.lastX = x;
        const r = cpxBinary(s.y, s.imag.y, x, s.imag.x, fn);
        s.error = r === null ? "Error" : null;
        s.x = r ? r[0] : bn(0);
        s.imag.x = r ? r[1] : bn(0);
        s.y = s.z;
        s.z = s.t;
        s.imag.y = s.imag.z;
        s.imag.z = s.imag.t;
        s.lift = true;
        return true;
      }
      if (fn === "+") binary(s, (y, x) => math.add(y, x));
      else if (fn === "−") binary(s, (y, x) => math.subtract(y, x));
      else if (fn === "×") binary(s, (y, x) => math.multiply(y, x));
      else if (fn === "÷") binary(s, (y, x) => math.divide(y, x));
      else binary(s, (y, x) => math.pow(y, x));
      return true;
    }
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
    // ── keystroke programmability (P3, HP-65) ─────────────────────────────
    case "W/PRGM":
      // the W/PRGM–RUN slide switch (UI chip dispatches this id)
      s.prgm.mode = s.prgm.mode === "RUN" ? "PRGM" : "RUN";
      s.prgm.pc = 0;
      return true;
    case "R/S":
      if (s.prgm.steps.length) runProgram(s);
      return true;
    case "SST":
      // RUN mode: execute a single program step
      if (s.prgm.steps.length) execStep(s);
      return true;
    case "BST":
      s.prgm.pc = Math.max(0, s.prgm.pc - 1);
      return true;
    case "RTN":
      s.prgm.pc = 0;
      return true;
    case "GTO":
      s.pending = { op: "GTO" };
      return true;
    case "LBL":
      s.pending = { op: "LBL" };
      return true;
    case "A":
    case "B":
    case "C":
    case "D":
    case "E":
    case "F": // the 16C's label space reaches F (hex digits win in int mode)
      // user keys: run from LBL <letter> (inert without a program, like a
      // freshly cleared machine)
      runLabel(s, fn);
      return true;
    case "DSP":
      s.pending = { op: "DSP" };
      return true;
    case "SF 1":
      s.prgm.flags[1] = true;
      return true;
    case "SF 2":
      s.prgm.flags[2] = true;
      return true;
    case "SF":
      s.pending = { op: "SF" };
      return true;
    case "CF":
      s.pending = { op: "CF" };
      return true;
    case "F?":
      s.pending = { op: "F?" };
      return true;
    case "GSB":
      s.pending = { op: "GSB" };
      return true;
    case "a":
    case "b":
    case "c":
    case "d":
    case "e":
      // the 97's second label set
      runLabel(s, fn);
      return true;
    case "ST I":
      commit(s);
      s.iReg = s.x;
      s.lift = true;
      return true;
    case "RC I":
      pushX(s, s.iReg);
      return true;
    case "x⇄I": {
      commit(s);
      const a = s.x;
      s.x = s.iReg;
      s.iReg = a;
      s.lift = true;
      return true;
    }
    case "DSZ I":
      s.iReg = s.iReg.minus(1);
      return true;
    case "ISZ I":
      s.iReg = s.iReg.plus(1);
      return true;
    case "DSZ (i)": {
      // decrement the register ADDRESSED BY I (program flow handles skips)
      const idx = Math.abs(Math.trunc(num(s.iReg))) % 10;
      s.regs[idx] = s.regs[idx].minus(1);
      return true;
    }
    case "ISZ (i)": {
      const idx = Math.abs(Math.trunc(num(s.iReg))) % 10;
      s.regs[idx] = s.regs[idx].plus(1);
      return true;
    }
    case "(i)":
      // meaningful as a pending argument (resolvePending); alone a no-op
      return true;
    case "P⇄S": {
      // primary ⇄ secondary register file (HP-67/97)
      const a = s.regs;
      s.regs = s.regsS;
      s.regsS = a;
      return true;
    }
    case "RND":
      // round X to the DISPLAYED value (FIX: places; SCI/ENG: mantissa digits)
      unary(s, (x) =>
        s.disp.mode === "FIX" ? bn(x.toFixed(s.disp.digits)) : x.toSD(s.disp.digits + 1),
      );
      return true;
    case "PRINT x":
      // the 97's printer IS our paper tape (FR-EXP-5 poetry)
      commit(s);
      s.hist = [...s.hist.slice(-49), { op: "🖨 x", raw: xval(s).toString() }];
      return true;
    case "PRINT STACK": {
      commit(s);
      const rows: HistEntry[] = [
        { op: "🖨 T", raw: s.t.toString() },
        { op: "🖨 Z", raw: s.z.toString() },
        { op: "🖨 Y", raw: s.y.toString() },
        { op: "🖨 X", raw: s.x.toString() },
      ];
      s.hist = [...s.hist, ...rows].slice(-50);
      return true;
    }
    case "PRINT REG": {
      const rows: HistEntry[] = s.regs
        .map((r, i) => ({ op: `🖨 R${i}`, raw: r.toString() }))
        .filter((r) => r.raw !== "0");
      s.hist = [...s.hist, ...rows].slice(-50);
      return true;
    }
    case "PRINT SPACE":
      s.hist = [...s.hist.slice(-49), { op: "⋯", raw: "0" }];
      return true;
    case "PRINT PRGM":
      s.hist = [
        ...s.hist.slice(-49),
        { op: "🖨 PRGM", raw: String(s.prgm.steps.length) },
      ];
      return true;
    case "W/DATA":
    case "WRITE DATA":
    case "MERGE":
      // magnetic-card ops — persistence (P1) is the card deck now
      return true;
    case "TF 1":
    case "TF 2":
      // flag tests steer program flow (execStep); a direct press is a no-op
      return true;
    case "REVIEW REG":
      // the 67's h-REG reviews registers — on the tape, like the 97 prints
      return applyFunction(s, "PRINT REG");
    case "DSZ":
      // decrement R8 (skip-on-zero applies inside a program)
      s.regs[8] = s.regs[8].minus(1);
      return true;
    case "x=y":
    case "x≠y":
    case "x≤y":
    case "x<y":
    case "x≥y":
    case "x>y":
    case "x=0":
    case "x≠0":
    case "x<0":
    case "x≥0":
    case "x>0":
      // conditionals steer program flow (execStep); direct press is a no-op
      return true;
    case "CLEAR STK":
      clearAll(s);
      return true;
    case "CLEAR REG":
      s.regs = s.regs.map(() => bn(0));
      return true;
    case "CLEAR PRGM":
      s.prgm.steps = [];
      s.prgm.pc = 0;
      return true;
    case "DEL":
      // program-edit key — meaningful in PRGM mode (dispatch); RUN no-op
      return true;
    case "CLA":
      s.alpha = "";
      return true;
    case "CL x/A":
      // the 41's ← f-shift: clears ALPHA when it holds text, else X
      if (s.alpha) s.alpha = "";
      else clx(s);
      return true;
    case "XEQ": {
      // execute by NAME: the typed ALPHA spells a program label or any
      // engine function id ("SIN", "x!", …) — the whole id space is XEQable
      if (s.alpha) {
        const name = s.alpha;
        s.alpha = "";
        if (name.length === 1 && findLabel(s.prgm.steps, name) !== null) {
          runLabel(s, name);
          return true;
        }
        // the XEQ catalog resolves FIRST (P11): names like DATE mean the
        // 41CX time functions here, not another model's key ops
        if (xeqCatalog(s, name)) return true;
        const ok = applyFunction(s, name);
        if (!ok) s.error = "NONEXISTENT"; // the 41's own message
        return true;
      }
      s.pending = { op: "GSB" }; // XEQ label = subroutine-style run
      return true;
    }
    case "ASN":
      // assign the typed ALPHA name to the NEXT key pressed (USER mode)
      if (s.alpha) {
        s.pending = { op: "ASN", name: s.alpha };
        s.alpha = "";
      }
      return true;
    case "USER":
      s.userOn = !s.userOn;
      return true;
    case "VIEW":
      s.pending = { op: "VIEW" };
      return true;
    case "ISG":
      s.pending = { op: "ISG" };
      return true;
    case "DSE":
      s.pending = { op: "DSE" };
      return true;
    case "HYP":
      s.pending = { op: "HYP" };
      return true;
    case "HYP⁻¹":
      s.pending = { op: "HYP⁻¹" };
      return true;
    case "Py,x":
      // permutations of y items taken x at a time: y!/(y−x)!
      binary(s, (y, x) =>
        y.isNegative() || x.isNegative() || !y.isInteger() || !x.isInteger() || x.gt(y)
          ? null
          : math.factorial(y).div(math.factorial(y.minus(x))),
      );
      return true;
    case "Cy,x":
      binary(s, (y, x) =>
        y.isNegative() || x.isNegative() || !y.isInteger() || !x.isInteger() || x.gt(y)
          ? null
          : math.factorial(y).div(math.factorial(x).times(math.factorial(y.minus(x)))),
      );
      return true;
    case "RAN#": {
      // deterministic LCG (Numerical Recipes constants) — seeded, persisted,
      // test-stable; a uniform in [0, 1)
      s.rng = (Math.imul(1664525, s.rng) + 1013904223) >>> 0;
      pushX(s, bn(s.rng).div(bn(4294967296)));
      return true;
    }
    case "L.R.": {
      // linear regression: intercept A to X, slope B to Y (11C convention)
      const lr = linReg(s.sum);
      if (lr === null) {
        s.error = "Error";
        return true;
      }
      pushX(s, lr.B);
      pushX(s, lr.A);
      return true;
    }
    case "x⇄(i)": {
      commit(s);
      const idx = Math.abs(Math.trunc(num(s.iReg))) % 10;
      const a = s.x;
      s.x = s.regs[idx];
      s.regs[idx] = a;
      s.lift = true;
      return true;
    }
    case "CATALOG":
      // the catalog browser arrives with the CX polish; the tape notes it
      s.hist = [...s.hist.slice(-49), { op: "🖨 CATALOG", raw: String(s.prgm.steps.length) }];
      return true;
    case "CLΣ":
      s.sum = zeroSum();
      s.pts = [];
      return true;
    case "BEEP":
    case "ON":
      return true;
    // ---- HP-35s commands (P21) -------------------------------------------------
    case "→cm":
      unary(s, (x) => x.times("2.54"));
      return true;
    case "→in":
      unary(s, (x) => x.div("2.54"));
      return true;
    case "→KM":
      unary(s, (x) => x.times("1.609344"));
      return true;
    case "→MILE":
      unary(s, (x) => x.div("1.609344"));
      return true;
    case "→kg":
      unary(s, (x) => x.times("0.45359237"));
      return true;
    case "→lb":
      unary(s, (x) => x.div("0.45359237"));
      return true;
    case "→l":
      unary(s, (x) => x.times("3.785411784"));
      return true;
    case "→gal":
      unary(s, (x) => x.div("3.785411784"));
      return true;
    case "→°C":
      unary(s, (x) => x.minus(32).times(5).div(9));
      return true;
    case "→°F":
      unary(s, (x) => x.times(9).div(5).plus(32));
      return true;
    case ",": // the 35s complex separator ≈ stack separation (documented)
      return applyFunction(s, "ENTER");
    case "ARG": {
      // argument of the complex X (P9 pair model); real X → 0 or 180°
      commit(s);
      const re = s.x;
      const im = s.cpx ? s.imag.x : bn(0);
      const th = bigAtan2(im, re) ?? bn(0); // atan2(0,0) — the 35s shows 0
      s.lastX = s.x;
      s.x = s.angle === "DEG" ? th.times(180).div(PI) : s.angle === "GRD" ? th.times(200).div(PI) : th;
      s.lift = true;
      return true;
    }
    case "x̄,ȳ": {
      // both means: ȳ to Y, x̄ to X (the 35s pair push)
      if (s.sum.n.isZero()) {
        s.error = "Error";
        return true;
      }
      commit(s);
      liftIfEnabled(s);
      liftIfEnabled(s);
      s.y = s.sum.y.div(s.sum.n);
      s.x = s.sum.x.div(s.sum.n);
      return true;
    }
    case "S,σ":
      return applyFunction(s, "s");
    case "Σx":
      pushX(s, s.sum.x);
      return true;
    case "Σy":
      pushX(s, s.sum.y);
      return true;
    case "Σx²":
      pushX(s, s.sum.x2);
      return true;
    case "Σy²":
      pushX(s, s.sum.y2);
      return true;
    case "Σxy":
      pushX(s, s.sum.xy);
      return true;
    case "nΣ":
      pushX(s, s.sum.n);
      return true;
    // ---- HP-42S menu commands (P16) -------------------------------------------
    case "SUM":
      commit(s);
      liftIfEnabled(s);
      liftIfEnabled(s);
      s.y = s.sum.y;
      s.x = s.sum.x;
      return true;
    case "MEAN":
      return applyFunction(s, "x̄");
    case "SDEV":
      return applyFunction(s, "s");
    case "WMN": // weighted mean: Σxy / Σy
      unary(s, () => (s.sum.y.isZero() ? null : s.sum.xy.div(s.sum.y)));
      return true;
    case "LINF":
    case "LOGF":
    case "EXPF":
    case "PWRF":
      s.fit = fn;
      return true;
    case "BEST": {
      try {
        s.fit = bestFit(s.pts).model;
      } catch {
        s.error = "Insufficient Data";
      }
      return true;
    }
    case "SLOPE":
    case "YINT":
    case "CORR": {
      try {
        const f = cfit(s.pts, s.fit);
        const v = fn === "SLOPE" ? f.slope : fn === "YINT" ? f.yint : f.corr;
        pushX(s, bn(String(v)));
      } catch (e) {
        s.error = e instanceof Error ? e.message : "Error";
      }
      return true;
    }
    case "FCSTY":
    case "FCSTX": {
      commit(s);
      try {
        const f = cfit(s.pts, s.fit);
        const at = num(xval(s));
        const v = fn === "FCSTY" ? forecastY(f, at) : forecastX(f, at);
        if (!Number.isFinite(v)) throw new Error("Error");
        s.lastX = xval(s);
        s.x = bn(String(v));
      } catch (e) {
        s.error = e instanceof Error ? e.message : "Error";
      }
      return true;
    }
    // PROB menu prints (reuse the P8 core)
    case "COMB":
      return applyFunction(s, "Cy,x");
    case "PERM":
      return applyFunction(s, "Py,x");
    case "N!":
      return applyFunction(s, "x!");
    case "GAMMA":
      unary(s, (x) => math.gamma(bn(String(num(x)))));
      return true;
    case "RAN":
      return applyFunction(s, "RAN#");
    case "SEED": {
      const x = xval(s);
      s.rng = Math.max(1, Math.trunc(Math.abs(num(x)) * 2147483647) % 2147483647);
      return true;
    }
    // CONVERT menu — the 42S prints for the P2 conversions
    case "→DEG":
      return applyFunction(s, "R→D");
    case "→RAD":
      return applyFunction(s, "D→R");
    case "→HR":
      return applyFunction(s, "D.MS→");
    case "→HMS":
      return applyFunction(s, "→D.MS");
    case "→REC":
      return applyFunction(s, "→R");
    case "→POL":
      return applyFunction(s, "→P");
    // MODES / DISP
    case "GRAD":
      s.angle = "GRD";
      return true;
    case "COMPLEX": // the 42S key: form a complex from Y,X (the 15C's I op)
      return applyFunction(s, "I");
    case "ALL": // the 42S's ALL display = minimal-digits STD
      s.disp = { mode: "STD", digits: s.disp.digits };
      return true;
    // CLEAR menu
    case "CLP":
      s.prgm = { ...s.prgm, steps: [], pc: 0 };
      return true;
    case "CLST": {
      s.entry = null;
      const zero = bn(0);
      s.x = zero;
      s.y = zero;
      s.z = zero;
      s.t = zero;
      return true;
    }
    case "CLX":
      return applyFunction(s, "CLx");
    // MATRIX menu (P9 store): DET/TRN/INV act on a named matrix A–E
    case "DET":
    case "TRN":
    case "INV":
      s.pending = { op: fn };
      return true;
    case "MVAR": // program declaration — a no-op at run time (delivery note)
      return true;
    case "PRX":
      s.hist = [...s.hist.slice(-49), { op: "🖨 x", raw: xval(s).toString() }];
      return true;
    case "PRSTK":
      s.hist = [
        ...s.hist.slice(-49),
        { op: `🖨 T:${s.t} Z:${s.z} Y:${s.y} X:${s.x}`, raw: "" },
      ];
      return true;
    case "PRΣ":
      s.hist = [...s.hist.slice(-49), { op: `🖨 n=${s.sum.n} Σx=${s.sum.x} Σy=${s.sum.y}`, raw: "" }];
      return true;
    case "PRP":
      s.hist = [...s.hist.slice(-49), { op: `🖨 PRGM ${s.prgm.steps.length} steps`, raw: "" }];
      return true;
    case "OFF":
      return true;
    case "PREFIX":
    case "NOP":
    case "PAUSE":
      // PAUSE shows the intermediate result ~1s on hardware; the tape and
      // synchronous runs make it a no-op here
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
      const sgn = (a: Value, b: Value) => (sign === 1 ? a.plus(b) : a.minus(b));
      s.sum = {
        n: s.sum.n.plus(sign),
        x: sgn(s.sum.x, x),
        x2: sgn(s.sum.x2, x.times(x)),
        y: sgn(s.sum.y, s.y),
        y2: sgn(s.sum.y2, s.y.times(s.y)),
        xy: sgn(s.sum.xy, x.times(s.y)),
      };
      s.x = s.sum.n;
      // CFIT keeps the raw pairs too (P16) — better conditioned than the
      // 42S's summation registers, same UX
      if (sign === 1) s.pts = [...s.pts, [num(x), num(s.y)]];
      else s.pts = s.pts.slice(0, -1);
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
      unary(s, dec2dms);
      return true;
    case "D.MS→":
      // D.MMSS → decimal degrees (30.30 → 30.5)
      unary(s, dms2dec);
      return true;
    case "D.MS+":
      // HP-65: add in degrees-minutes-seconds space
      binary(s, (y, x) => dec2dms(dms2dec(y).plus(dms2dec(x))));
      return true;
    case "→OCT":
      // decimal integer → its octal digits shown as a number (8 → 10)
      unary(s, (x) => {
        const i = x.trunc();
        const digits = BigInt(i.abs().toFixed(0)).toString(8);
        return bn((i.isNegative() ? "-" : "") + digits);
      });
      return true;
    case "OCT→":
      // octal digits shown as a number → decimal (10 → 8); non-octal → Error
      unary(s, (x) => {
        const i = x.trunc();
        const digits = i.abs().toFixed(0);
        if (!/^[0-7]+$/.test(digits)) return null;
        const dec = [...digits].reduce(
          (acc, d) => acc * BigInt(8) + BigInt(d),
          BigInt(0),
        );
        return bn((i.isNegative() ? "-" : "") + dec.toString());
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
    case "n":
    case "i":
    case "PV":
    case "PMT":
    case "FV": {
      // 12C TVM keys: a freshly keyed/recalled number STORES; otherwise SOLVE
      const store = s.entry !== null || s.fresh;
      commit(s);
      const put = (v: Value) => {
        if (fn === "n") s.fin.n = v;
        else if (fn === "i") s.fin.i = v;
        else if (fn === "PV") s.fin.pv = v;
        else if (fn === "PMT") s.fin.pmt = v;
        else s.fin.fv = v;
      };
      if (store) {
        put(s.x);
        s.lift = true;
        return true;
      }
      const r =
        fn === "n"
          ? (() => {
              const v = solveN(s.fin);
              return v === null ? null : v.ceil(); // the 12C rounds n UP
            })()
          : fn === "i"
            ? solveI(s.fin)
            : fn === "PV"
              ? tryReal(() => solvePV(s.fin))
              : fn === "PMT"
                ? tryReal(() => solvePMT(s.fin))
                : tryReal(() => solveFV(s.fin));
      if (r === null || !r.isFinite()) {
        s.error = "Error";
        return true;
      }
      put(r);
      pushX(s, r);
      return true;
    }
    case "12×":
      // store 12·x into n and show it
      commit(s);
      s.fin.n = s.x.times(12);
      s.x = s.fin.n;
      s.lift = true;
      return true;
    case "12÷":
      commit(s);
      s.fin.i = s.x.div(12);
      s.x = s.fin.i;
      s.lift = true;
      return true;
    case "BEG":
      s.fin.beg = true;
      return true;
    case "END":
      s.fin.beg = false;
      return true;
    case "CFo":
      commit(s);
      s.fin.cfs = [{ amt: s.x.toString(), count: 1 }];
      s.lift = true;
      return true;
    case "CFj":
      commit(s);
      s.fin.cfs = [...s.fin.cfs, { amt: s.x.toString(), count: 1 }];
      s.lift = true;
      return true;
    case "Nj": {
      commit(s);
      const last = s.fin.cfs[s.fin.cfs.length - 1];
      if (last) {
        const count = Math.max(1, Math.min(99, Math.trunc(num(s.x))));
        s.fin.cfs = [...s.fin.cfs.slice(0, -1), { ...last, count }];
      }
      s.lift = true;
      return true;
    }
    case "NPV":
      unary(s, () => npv(s.fin.cfs, s.fin.i));
      return true;
    case "IRR": {
      const r = irr(s.fin.cfs);
      if (r === null) {
        s.error = "Error";
        return true;
      }
      s.fin.i = r;
      pushX(s, r);
      return true;
    }
    case "AMORT": {
      // amortize x payments against PV at i (rounded to the display, like
      // the 12C): X = interest total, Y = principal total, PV reduced
      commit(s);
      const count = Math.max(0, Math.trunc(num(s.x)));
      s.lastX = s.x;
      let pv = s.fin.pv;
      let intTot = bn(0);
      let prinTot = bn(0);
      const iFrac = s.fin.i.div(100);
      for (let j = 0; j < count; j++) {
        const interest = bn(pv.times(iFrac).toFixed(s.disp.digits));
        const principal = s.fin.pmt.neg().minus(interest);
        intTot = intTot.plus(interest);
        prinTot = prinTot.plus(principal);
        pv = pv.minus(principal);
      }
      s.fin.pv = pv;
      s.fin.n = s.fin.n.plus(count);
      s.y = prinTot.neg();
      s.x = intTot.neg();
      s.lift = true;
      return true;
    }
    case "D.MY":
      s.fin.dmy = true;
      return true;
    case "M.DY":
      s.fin.dmy = false;
      return true;
    case "DATE": {
      // date in Y, days in X → the future/past date (stack drops)
      binary(s, (y, x) => {
        const d = decodeDate(y, s.fin.dmy);
        return d === null ? null : encodeDate(addDays(d, Math.trunc(num(x))), s.fin.dmy);
      });
      return true;
    }
    case "ΔDYS":
      binary(s, (y, x) => {
        const a = decodeDate(y, s.fin.dmy);
        const b = decodeDate(x, s.fin.dmy);
        return a === null || b === null ? null : bn(daysBetween(a, b));
      });
      return true;
    case "DEPR SL": // the 12C prints SL — model-override renames it to
    case "SOYD": //     dodge the 16C's shift-left (same print, other machine)
    case "DB": {
      // cost=PV, salvage=FV, life=n (factor=i for DB); x = year number
      commit(s);
      const j = s.x;
      s.lastX = j;
      const out =
        fn === "DEPR SL"
          ? depSL(s.fin.pv, s.fin.fv, s.fin.n, j)
          : fn === "SOYD"
            ? depSOYD(s.fin.pv, s.fin.fv, s.fin.n, j)
            : depDB(s.fin.pv, s.fin.fv, s.fin.n, s.fin.i, j);
      s.y = out.remaining;
      s.x = out.dep;
      s.lift = true;
      return true;
    }
    case "PRICE": {
      // settlement in Y, maturity in X; yield=i, coupon=PMT → X=price, Y=accrued
      commit(s);
      const settle = decodeDate(s.y, s.fin.dmy);
      const mat = decodeDate(s.x, s.fin.dmy);
      if (settle === null || mat === null || mat.getTime() <= settle.getTime()) {
        s.error = "Error";
        return true;
      }
      const out = bondPrice(settle, mat, s.fin.i, s.fin.pmt);
      s.lastX = s.x;
      s.y = out.accrued;
      s.x = out.price;
      s.lift = true;
      return true;
    }
    case "YTM": {
      // dates as PRICE; price from PV → yield to X (and into i)
      commit(s);
      const settle = decodeDate(s.y, s.fin.dmy);
      const mat = decodeDate(s.x, s.fin.dmy);
      if (settle === null || mat === null || mat.getTime() <= settle.getTime()) {
        s.error = "Error";
        return true;
      }
      const r = bondYTM(settle, mat, s.fin.pv.abs(), s.fin.pmt);
      if (r === null) {
        s.error = "Error";
        return true;
      }
      s.fin.i = r;
      s.lastX = s.x;
      s.y = s.z;
      s.z = s.t;
      s.x = r;
      s.lift = true;
      return true;
    }
    case "CLEAR FIN":
      s.fin = { ...freshFin(), dmy: s.fin.dmy, beg: s.fin.beg };
      return true;
    case "%T": {
      // percent of total: 100·x/y (Y stays)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = tryReal(() => (s.y.isZero() ? null : x.times(100).div(s.y)));
      s.error = r === null ? "Error" : null;
      s.x = r ?? bn(0);
      s.lift = true;
      return true;
    }
    case "x̄w":
      // weighted mean: Σxy/Σy (x weighted by y)
      unary(s, () => (s.sum.y.isZero() ? null : s.sum.xy.div(s.sum.y)));
      return true;
    case "ŷ,r": {
      const lr = linReg(s.sum);
      if (lr === null) {
        s.error = "Error";
        return true;
      }
      const x = xval(s);
      commit(s);
      s.lastX = x;
      s.y = lr.r;
      s.x = lr.A.plus(lr.B.times(x));
      s.lift = true;
      return true;
    }
    case "x̂,r": {
      const lr = linReg(s.sum);
      if (lr === null || lr.B.isZero()) {
        s.error = "Error";
        return true;
      }
      const y = xval(s);
      commit(s);
      s.lastX = y;
      s.y = lr.r;
      s.x = y.minus(lr.A).div(lr.B);
      s.lift = true;
      return true;
    }
    case "MEM":
      s.hist = [...s.hist.slice(-49), { op: "🖨 MEM", raw: String(s.prgm.steps.length) }];
      return true;
    case "HEX":
    case "DEC":
    case "OCT":
    case "BIN":
      commit(s);
      s.int = {
        ...s.int,
        on: true,
        base: fn === "HEX" ? 16 : fn === "DEC" ? 10 : fn === "OCT" ? 8 : 2,
      };
      return true;
    case "FLOAT":
      // leave the integer universe; a following digit sets FIX digits
      commit(s);
      s.int = { ...s.int, on: false };
      s.disp = { ...s.disp, mode: "FIX" };
      s.pending = { op: "FIX" };
      return true;
    case "1'S":
      s.int = { ...s.int, comp: "1S" };
      return true;
    case "2'S":
      s.int = { ...s.int, comp: "2S" };
      return true;
    case "UNSGN":
      s.int = { ...s.int, comp: "UNSGN" };
      return true;
    case "WSIZE": {
      // pops X as the new word size (1–64), like the 16C
      commit(s);
      const ws = Math.max(1, Math.min(64, Math.trunc(num(s.x))));
      s.int = { ...s.int, ws };
      s.lastX = s.x;
      s.x = s.y;
      s.y = s.z;
      s.z = s.t;
      s.lift = true;
      return true;
    }
    case "AND":
    case "OR":
    case "XOR":
    case "RMD": {
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r: WordResult | null =
        fn === "AND"
          ? intAnd(s.y, x, s.int)
          : fn === "OR"
            ? intOr(s.y, x, s.int)
            : fn === "XOR"
              ? intXor(s.y, x, s.int)
              : intRmd(s.y, x, s.int);
      if (r === null) {
        s.error = "Error";
        return true;
      }
      s.x = r.value;
      s.int = { ...s.int, carry: r.carry, oor: r.oor };
      s.y = s.z;
      s.z = s.t;
      s.lift = true;
      return true;
    }
    case "NOT":
      applyWord(s, intNot(xval(s), s.int));
      return true;
    case "SL":
      applyWord(s, intShift(xval(s), 1, "L", s.int));
      return true;
    case "SR":
      applyWord(s, intShift(xval(s), 1, "R", s.int));
      return true;
    case "ASR":
      applyWord(s, intAsr(xval(s), s.int));
      return true;
    case "RL":
      applyWord(s, intRotate(xval(s), 1, "L", s.int, false, s.int.carry));
      return true;
    case "RR":
      applyWord(s, intRotate(xval(s), 1, "R", s.int, false, s.int.carry));
      return true;
    case "RLC":
      applyWord(s, intRotate(xval(s), 1, "L", s.int, true, s.int.carry));
      return true;
    case "RRC":
      applyWord(s, intRotate(xval(s), 1, "R", s.int, true, s.int.carry));
      return true;
    case "RLn":
    case "RRn":
    case "RLCn":
    case "RRCn": {
      // count in X, value in Y (stack drops)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const count = Math.abs(Math.trunc(num(x)));
      const dir = fn.includes("L") ? "L" : "R";
      const thru = fn.includes("C");
      const r = intRotate(s.y, count, dir, s.int, thru, s.int.carry);
      s.x = r.value;
      s.int = { ...s.int, carry: r.carry };
      s.y = s.z;
      s.z = s.t;
      s.lift = true;
      return true;
    }
    case "SB":
    case "CB": {
      // bit number in X, value in Y (stack drops)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = intSetBit(s.y, Math.abs(Math.trunc(num(x))), fn === "SB", s.int);
      s.x = r.value;
      s.y = s.z;
      s.z = s.t;
      s.lift = true;
      return true;
    }
    case "B?": {
      // direct press: the carry flag reports the bit (programs skip on it)
      const x = xval(s);
      commit(s);
      s.int = { ...s.int, carry: intTestBit(s.y, Math.abs(Math.trunc(num(x))), s.int) };
      return true;
    }
    case "MASKL":
      applyWordFrom(s, (x) => intMask(Math.trunc(num(x)), "L", s.int));
      return true;
    case "MASKR":
      applyWordFrom(s, (x) => intMask(Math.trunc(num(x)), "R", s.int));
      return true;
    case "#B":
      applyWordFrom(s, (x) => intCountBits(x, s.int));
      return true;
    case "LJ": {
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = intLj(x, s.int);
      pushX(s, r.shifts);
      pushX(s, r.value);
      return true;
    }
    case "DBL×": {
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = intDblMul(s.y, x, s.int);
      s.y = r.high;
      s.x = r.low;
      s.lift = true;
      return true;
    }
    case "DBL÷":
    case "DBLR": {
      // (Y high : Z low? — the 16C keeps the double dividend in Y and Z)
      const x = xval(s);
      commit(s);
      s.lastX = x;
      const r = intDblDiv(s.y, s.z, x, s.int, fn === "DBL÷" ? "Q" : "R");
      if (r === null) {
        s.error = "Error";
        return true;
      }
      s.x = r.value;
      s.y = s.t;
      s.z = s.t;
      s.lift = true;
      return true;
    }
    case "WINDOW":
      s.pending = { op: "WINDOW" };
      return true;
    case "SHOW":
      s.pending = { op: "SHOW" };
      return true;
    case "STATUS":
      s.hist = [
        ...s.hist.slice(-49),
        {
          op: `🖨 ${s.int.comp} ws${s.int.ws} ${s.int.carry ? "C" : "·"}${s.int.oor ? " G" : ""}`,
          raw: "0",
        },
      ];
      return true;
    case "<":
    case ">":
      // window scroll keys — display windowing is a glass concern, accepted
      return true;
    case "I": {
      // 15C f-I: Y + Xi forms a complex number (stack drops), complex mode on
      const im = xval(s);
      commit(s);
      s.lastX = im;
      s.cpx = true;
      s.x = s.y;
      s.imag.x = im;
      s.y = s.z;
      s.z = s.t;
      s.imag.y = s.imag.z;
      s.imag.z = s.imag.t;
      s.lift = true;
      return true;
    }
    case "Re≷Im": {
      commit(s);
      const a = s.x;
      s.x = s.imag.x;
      s.imag.x = a;
      s.cpx = true;
      s.lift = true;
      return true;
    }
    case "(i) cpx":
      // 15C f-(i): toggle complex mode (clears the imaginary stack on exit)
      s.cpx = !s.cpx;
      if (!s.cpx) s.imag = { x: bn(0), y: bn(0), z: bn(0), t: bn(0) };
      return true;
    case "DIM":
      s.pending = { op: "DIM" };
      return true;
    case "MATRIX":
      s.pending = { op: "MATRIX" };
      return true;
    case "RESULT":
      s.pending = { op: "RESULT" };
      return true;
    case "x≷":
      s.pending = { op: "X⇄" };
      return true;
    case "TEST":
      s.pending = { op: "TEST" };
      return true;
    case "SOLVE":
      s.pending = { op: "SOLVE" };
      return true;
    case "∫ˣy":
      s.pending = { op: "∫" };
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

/** The 41CX's XEQ-only function catalog (P11): the time module. Extended
 * memory (file system) stays deferred — see plan/phase-11 delivery notes. */
function xeqCatalog(s: RpnEngine, name: string): boolean {
  switch (name) {
    case "TIME": {
      // HH.MMSS from the injectable clock
      const d = clock();
      const v = bn(d.getHours())
        .plus(bn(d.getMinutes()).div(100))
        .plus(bn(d.getSeconds()).div(10000));
      pushX(s, v);
      return true;
    }
    case "DATE": {
      const d = clock();
      const enc = encodeDate(
        new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())),
        s.fin.dmy,
      );
      pushX(s, enc);
      return true;
    }
    case "DOW": {
      // day of week of the date in X (0 = Sunday, like the CX)
      const d = decodeDate(xval(s), s.fin.dmy);
      if (d === null) {
        s.error = "Error";
        return true;
      }
      pushX(s, bn(d.getUTCDay()));
      return true;
    }
    case "DDAYS":
      // days between dates in Y and X — the CX name for ΔDYS
      return applyFunction(s, "ΔDYS");
    case "CLK12":
    case "CLK24":
      return true; // display-format toggles, accepted
    default:
      return false;
  }
}

/** Entry-editing keys that shouldn't print a history line. */
const ENTRY_OPS = new Set(["•", ".", "EEX", "←", "CHS"]);
/** Argument-taking arms — the tape prints the RESOLVED composite instead. */
const PENDING_ARMS = new Set(["STO n", "RCL n", "FIX", "SCI", "ENG", "DSP", "GTO", "LBL"]);
/** Mode/edit keys that shouldn't print either. */
const EDIT_OPS = new Set(["W/PRGM", "SST", "BST", "DEL"]);

const noTape = (fn: string): boolean =>
  /^[0-9]$/.test(fn) || ENTRY_OPS.has(fn) || PENDING_ARMS.has(fn) || EDIT_OPS.has(fn);

/** Keys after which a TVM key should STORE (a value was just produced). */
const VALUE_PRODUCERS = new Set([
  "ENTER", "RCL", "RCL n", "LSTx", "π", "cm/in", "kg/lb", "ltr/gal", "RC I", "CHS",
]);

/**
 * Dispatch + record: applies the function and, for committed operations,
 * prints a history entry (op + exact post-op X) into the engine state —
 * the substrate the paper tape and Phase-23's expression library read.
 * Argument-taking sequences print once, composed ("STO + 1", "GTO A").
 *
 * In PRGM mode this is the RECORDER (P3): keys append as program steps —
 * steps ARE key ids, so playback is dispatch replay, like the hardware.
 */
function openMenu42(s: RpnEngine, name: string): void {
  if (s.menu && s.menu.name !== name) s.menuStack = [...s.menuStack, s.menu.name];
  s.menu = { name, page: 0 };
}

/** The six labels of the active 42S menu page (dynamic menus resolved). */
export function menu42Labels(s: RpnEngine): string[] {
  if (!s.menu) return [];
  const roster =
    s.menu.name === "SOLVER" || s.menu.name === "∫f(x)"
      ? programLabels(s)
      : s.menu.name === "CUSTOM"
        ? s.custom42
        : s.menu.name === "ALPHA"
          ? ALPHA_PAGES
          : s.menu.name === "VARMENU"
            ? [] // named-variable menus arrive with the 48 workflow (note)
            : s.menu.name === "CATALOG"
              ? CATALOG42
              : MENUS42[s.menu.name] ?? [];
  const pages = Math.max(1, Math.ceil(roster.length / 6));
  const pg = ((s.menu.page % pages) + pages) % pages;
  const out = roster.slice(pg * 6, pg * 6 + 6);
  while (out.length < 6) out.push("");
  return out;
}

/** Labels defined in the program store (the SOLVER / ∫f(x) target list). */
function programLabels(s: RpnEngine): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.prgm.steps.length - 1; i++) {
    if (s.prgm.steps[i] === "LBL") out.push(s.prgm.steps[i + 1]);
  }
  return out;
}

const CATALOG42: string[] = [
  ...new Set(Object.values(MENUS42).flat().filter((l) => !l.startsWith("@"))),
].sort();

/** A 42S softkey press: the top-row key i resolves the active menu label. */
export function pressSoft42(s: RpnEngine, i: number): void {
  const label = menu42Labels(s)[i];
  if (!label) return;
  if (label.startsWith("@")) {
    openMenu42(s, label.slice(1));
    return;
  }
  if (s.menu?.name === "ALPHA") {
    s.alpha += label === "␣" ? " " : label;
    return;
  }
  if (s.menu?.name === "CONST") {
    pushX(s, bn(CONST_VALUES[label] ?? "0"));
    return;
  }
  if (s.menu?.name === "SOLVER") {
    dispatch(s, "SOLVE");
    dispatch(s, label);
    return;
  }
  if (s.menu?.name === "∫f(x)") {
    dispatch(s, "∫");
    dispatch(s, label);
    return;
  }
  dispatch(s, label);
}

/** Pioneer/35s mapping prints → canonical engine ids (P21). */
const RPN_PRINTS: Record<string, string> = {
  "∫ (integral)": "∫ˣy", "E (exponent)": "E", ", (comma)": ",", ". (decimal)": ".",
  "▲ (up)": "▲", "▼ (down)": "▼", "◄ (left)": "◄", "► (right)": "►",
  "x↔y": "x⇄y", "HMS→": "D.MS→", "→HMS": "→D.MS", nCr: "Cy,x", nPr: "Py,x",
  RAND: "RAN#", "!": "x!", "L.R": "L.R.", "→RAD": "D→R", "→DEG": "R→D",
  "%CHG": "Δ%", LASTx: "LSTx", INTG: "INT", "x√y": "ˣ√y",
};

/** 35s affordances tied to EQUATION mode / fraction display — accepted, with
 * the capability documented as arriving with the native phase (P23 notes). */
const ACCEPTED_35S = new Set([
  "EQN", "FN=", "INPUT", "UNDO", "←ENG", "ENG→", "( )", "[ ]", "=", "θ",
  "/c", "FDISP", "SPACE", "◄", "►", "PSE",
]);

export function dispatch(s: RpnEngine, fn: string): boolean {
  fn = RPN_PRINTS[fn] ?? fn;
  if (ACCEPTED_35S.has(fn)) return true;
  // ---- the 42S RPN menu layer (P16) — navigation never records as steps ----
  if (fn === "EXIT") {
    s.assignPend = false;
    if (s.menuStack.length) {
      s.menu = { name: s.menuStack[s.menuStack.length - 1], page: 0 };
      s.menuStack = s.menuStack.slice(0, -1);
    } else s.menu = null;
    return true;
  }
  if (fn === "▲" || fn === "▼") {
    if (s.menu) s.menu = { ...s.menu, page: s.menu.page + (fn === "▼" ? 1 : -1) };
    return true; // outside a menu the cursor keys are display motion — accepted
  }
  if (fn === "ASSIGN") {
    s.assignPend = true; // the NEXT key's function lands on the CUSTOM row
    return true;
  }
  if (s.assignPend && fn !== "EXIT") {
    s.assignPend = false;
    if (!MENUS42[fn] && !DYNAMIC_MENUS.has(fn) && fn !== "CLEARM") {
      s.custom42 = [...s.custom42.slice(0, 17), fn];
    }
    return true;
  }
  const menu35 = { MODE: "MODES", DISPLAY: "DISP", "x?y": "TESTXY", "x?0": "TESTX0", "x≤?": "TESTXY" }[fn];
  if (menu35) {
    openMenu42(s, menu35);
    return true;
  }
  if (MENUS42[fn] || DYNAMIC_MENUS.has(fn) || fn === "CLEARM") {
    openMenu42(s, fn === "CLEARM" ? "CLEAR" : fn);
    return true;
  }
  if (s.prgm.mode === "PRGM") {
    const p = s.prgm;
    switch (fn) {
      case "W/PRGM":
        p.mode = "RUN";
        p.pc = 0;
        return true;
      case "SST":
        p.pc = Math.min(p.pc + 1, p.steps.length);
        return true;
      case "BST":
        p.pc = Math.max(0, p.pc - 1);
        return true;
      case "DEL":
        if (p.pc > 0) {
          p.steps = [...p.steps.slice(0, p.pc - 1), ...p.steps.slice(p.pc)];
          p.pc -= 1;
        }
        return true;
      case "CLEAR PRGM":
        p.steps = [];
        p.pc = 0;
        return true;
      default:
        // record the keystroke at the cursor (insert-mode, like the 65)
        p.steps = [...p.steps.slice(0, p.pc), fn, ...p.steps.slice(p.pc)];
        p.pc += 1;
        return true;
    }
  }
  // USER mode (P6): an assigned key executes its assignment instead
  if (s.userOn && s.pending === null && s.userAsn[fn] !== undefined) {
    const name = s.userAsn[fn];
    if (name.length === 1 && findLabel(s.prgm.steps, name) !== null) runLabel(s, name);
    else if (!applyFunction(s, name)) s.error = "NONEXISTENT";
    s.hist = [...s.hist.slice(-49), { op: `USER ${name}`, raw: xval(s).toString() }];
    return true;
  }
  const before = s.pending;
  const handled = applyFunction(s, fn);
  if (!handled) return false;
  // TVM store-vs-solve context (P7): true right after digits/ENTER/recalls
  s.fresh = /^[0-9]$/.test(fn) || ENTRY_OPS.has(fn) || VALUE_PRODUCERS.has(fn) ||
    (before !== null && before.op === "RCL");
  if (before !== null) {
    if (s.pending === null) {
      if (/^[0-9A-E]$/.test(fn)) {
        // resolution argument → one composed line ("STO + 1", "GTO A")
        const op = `${before.op}${before.arith ? ` ${before.arith}` : ""} ${fn}`;
        s.hist = [...s.hist.slice(-49), { op, raw: xval(s).toString() }];
      } else if (!noTape(fn)) {
        // the key canceled the pending arg and ran normally — print it
        s.hist = [...s.hist.slice(-49), { op: fn, raw: xval(s).toString() }];
      }
    }
    return true;
  }
  if (!noTape(fn)) {
    s.hist = [...s.hist.slice(-49), { op: fn, raw: xval(s).toString() }];
  }
  return true;
}
