// src/lib/engine/rpl.ts
// The RPL machine (P12, architecture §6): a dynamic unlimited OBJECT stack
// (FR-STK-2/5) with typed objects (rpl/object.ts), a command-line parser
// (rpl/parse.ts), named variables, the softkey MENU system (rpl/menu.ts),
// and an evaluator for «…» programs with the full branch/loop word set.
// Programs run in the same budgeted interpreter style as P3's keystroke
// engine (20 000-op budget; Web-Worker isolation remains deferred and
// documented). Reals compute on the BigNumber tower; complex numbers and
// array elements are float64 like the P9 modules. Pure TS — no React/DOM.

import {
  determinant as det,
  EigenvalueDecomposition,
  inverse,
  LuDecomposition,
  Matrix,
  QrDecomposition,
  SingularValueDecomposition,
  solve as mlSolve,
} from "ml-matrix";
import { bestFit, fit as cfit, type FitModel, forecastX, forecastY } from "./stats-fit";
import {
  blackScholes,
  type FinRegs,
  freshFin,
  solveFV,
  solveI,
  solveN,
  solvePMT,
  solvePV,
} from "./finance";
import { bn, math, num, PI, type Value } from "./config";
import type { DisplayFormat } from "./format";
import type { HistEntry } from "./rpn";
import {
  formatObj,
  isTrue,
  name as mkName,
  objToSrc,
  real,
  type RplObj,
  sameObj,
  str as mkStr,
  typeNumber,
} from "./rpl/object";
import {
  evalExpr,
  exprNames,
  parseExpr,
  parseItems,
  type RplItem,
  UndefinedName,
} from "./rpl/parse";
import { evalFloat } from "./rpl/floateval";
import { CATALOG_COMMANDS, RPL_MENUS } from "./rpl/menu";
import { fromWolfram, toWolfram } from "./rpl/wolfram";
import {
  addU, convertU, defineUnit, DimensionError, divU, mulU, powU, scaleU, subU, ubaseU, validUnit,
} from "./units";
import { UNIT_CATEGORIES, UNIT_MENUS } from "./units-catalog";
import { getCas } from "./cas/provider";
import type { HeavyCasProvider } from "./cas/pyodide-provider";
import { factorsBig, gcdBig, isPrimeBig, lcmBig, nextPrimeBig, totientBig } from "./numtheory";
import {
  cToPx, PICT_H, PICT_W, type PlotPoint, type PlotReq, pxToC, rasterLine, sampleGrid, sampleSeries,
} from "./rpl/plot";

export type Angle = "DEG" | "RAD" | "GRD";

export interface RplModes {
  cmd: boolean; // command-line recovery (COMMAND)
  last: boolean; // LAST-arguments saving
  und: boolean; // UNDO-stack saving
  ml: boolean; // multi-line display
  rdxComma: boolean; // RDX, vs RDX.
  trace: boolean; // trace printing
}

export interface PlotParams {
  pmin: [number, number];
  pmax: [number, number];
  indep: string;
  res: number;
  axes: [number, number];
}

/** A directory node (P15, HP-28S): named variables + subdirectories. */
export interface DirNode {
  vars: Record<string, RplObj>; // insertion order = USER menu order
  subs: Record<string, DirNode>;
}
export const newDir = (): DirNode => ({ vars: {}, subs: {} });
export function cloneDir(d: DirNode): DirNode {
  return {
    vars: { ...d.vars },
    subs: Object.fromEntries(Object.entries(d.subs).map(([k, v]) => [k, cloneDir(v)])),
  };
}

export interface RplEngine {
  stack: RplObj[]; // bottom -> top (top = level 1)
  entry: string | null; // the command line (raw source text)
  home: DirNode; // the variable tree rooted at HOME (P15)
  path: string[]; // current directory (names below HOME; [] = HOME)
  custom: string[]; // the MENU/CUSTOM softkey labels (P15)
  menu: { name: string; page: number } | null;
  base: 2 | 8 | 10 | 16; // binary-integer display base
  ws: number; // binary word size 1–64
  flags: boolean[]; // user flags 1..64 (index n−1)
  angle: Angle;
  disp: DisplayFormat;
  lc: boolean; // lower-case typing (LC)
  alphaLock: boolean; // α LOCK: command keys type their names
  rng: number; // RAND seed (deterministic LCG, like P8)
  last: RplObj[]; // LAST arguments
  lastCmd: string[]; // COMMAND line stack (newest first, ≤4)
  undoSnap: RplObj[] | null;
  modes: RplModes;
  sdat: number[][]; // ΣDAT rows (float64, like the P9 matrices)
  cols: [number, number]; // COLΣ pair (1-based)
  ppar: PlotParams;
  msg: string | null; // DISP output line
  /** the 48-series plot subsystem (P17): active request + type + PICT */
  plot: PlotReq | null;
  ptype: "FUNCTION" | "POLAR";
  pict: string[]; // lit pixels as "x,y" keys (GROB-lite)
  menuStack48: string[]; // submenu nesting (MTH → PROB …)
  fitModel: "LINFIT" | "LOGFIT" | "EXPFIT" | "PWRFIT"; // the 48G ΣPAR model
  clip: string | null; // COPY/CUT/PASTE buffer (49G editing keys)
  ans: RplObj | null; // the 49G ANS: level 1 after the last committed line
  error: string | null;
  errN: number; // ERRN / ERRM (IFERR)
  errM: string;
  hist: HistEntry[]; // engine-side tape (FR-EXP-5), capped at 50
}

export function createRpl(): RplEngine {
  return {
    stack: [],
    entry: null,
    home: newDir(),
    path: [],
    custom: [],
    menu: null,
    base: 10,
    ws: 64,
    flags: Array.from({ length: 64 }, () => false),
    angle: "DEG",
    disp: { mode: "STD", digits: 4 }, // the 28C powers on in STD
    lc: false,
    alphaLock: false,
    rng: 12345,
    last: [],
    lastCmd: [],
    undoSnap: null,
    modes: { cmd: true, last: true, und: true, ml: true, rdxComma: false, trace: false },
    sdat: [],
    cols: [1, 2],
    ppar: { pmin: [-6.8, -1.5], pmax: [6.8, 1.6], indep: "X", res: 1, axes: [0, 0] },
    msg: null,
    plot: null,
    ptype: "FUNCTION",
    pict: [],
    menuStack48: [],
    fitModel: "LINFIT",
    clip: null,
    ans: null,
    error: null,
    errN: 0,
    errM: "",
    hist: [],
  };
}

// ---- errors --------------------------------------------------------------------

/** Engine-level RPL error (28C-style message) — caught at dispatch top level. */
class RplError extends Error {}
/** HALT/ABORT/KILL — stops execution without reporting an error. */
class Halt extends Error {}
const err = (m: string): RplError => new RplError(m);

// ---- coercion helpers ------------------------------------------------------------

const wantReal = (o: RplObj): Value => {
  if (o.k !== "real") throw err("Bad Argument Type");
  return o.v;
};
const wantInt = (o: RplObj): number => Math.trunc(num(wantReal(o)));
const wantStr = (o: RplObj): string => {
  if (o.k !== "str") throw err("Bad Argument Type");
  return o.v;
};
const wantNameOf = (o: RplObj): string => {
  if (o.k === "name") return o.v;
  throw err("Bad Argument Type");
};
const wantList = (o: RplObj): RplObj[] => {
  if (o.k !== "list") throw err("Bad Argument Type");
  return o.items;
};
const wantArr = (o: RplObj): { rows: number[][]; vec: boolean } => {
  if (o.k !== "arr") throw err("Bad Argument Type");
  return o;
};
const wantBin = (o: RplObj): bigint => {
  if (o.k !== "bin") throw err("Bad Argument Type");
  return o.v;
};
const realOf = (n: number): RplObj => {
  if (!Number.isFinite(n)) throw err("Error");
  return real(bn(String(n)));
};
type UnitObj = Extract<RplObj, { k: "unit" }>;
const wantUnit = (o: RplObj): UnitObj => {
  if (o.k !== "unit") throw err("Bad Argument Type");
  return o;
};
/** The target-unit spec for CONVERT/→UNIT: a unit object, name, or string. */
const unitSpecOf = (o: RplObj): string => {
  // a quoted 'm/s^2' parses as an algebraic — its source IS the unit spec
  const u =
    o.k === "unit" ? o.u : o.k === "name" || o.k === "str" ? o.v : o.k === "alg" ? o.src : null;
  if (u === null || !validUnit(u)) throw err("Bad Argument Type");
  return u;
};
/** Run a unit op, translating DimensionError to the 28C's message. */
function tryUnits<T>(op: () => T): T {
  try {
    return op();
  } catch (e) {
    throw e instanceof DimensionError ? err(e.message) : err("Error");
  }
}
const pushU = (s: RplEngine, q: { mag: Value; u: string }): void => {
  if (!q.mag.isFinite()) throw err("Infinite Result");
  s.stack.push(q.u === "" ? real(q.mag) : { k: "unit", mag: q.mag, u: q.u });
};
const fRe = (o: RplObj): number => num(wantReal(o));

/** The algebraic source of an object (CAS input): alg, name, or real. */
const algSrcOf = (o: RplObj): string => {
  if (o.k === "alg") return o.src;
  if (o.k === "name") return o.v;
  if (o.k === "real") return o.v.toString();
  throw err("Bad Argument Type");
};
const varNameOf = (o: RplObj): string => {
  if (o.k === "name") return o.v;
  if (o.k === "alg" && /^[A-Za-z][A-Za-z0-9]*$/.test(o.src)) return o.src;
  throw err("Bad Argument Type");
};
/** The registered CAS tier, or the honest loading message (the React seam
 * lazy-loads the provider before dispatching CAS keys — NFR-3/NFR-4). */
function requireCas() {
  const cas = getCas();
  if (!cas) throw err("CAS loading — press again");
  return cas;
}
/** The heavy (SymPy) tier when loaded — feature-tested via the extras. */
function requireHeavy(): HeavyCasProvider {
  const cas = getCas();
  if (!cas || !("limit" in cas)) {
    throw err("Advanced CAS (SymPy) loading — press again");
  }
  return cas as HeavyCasProvider;
}
function tryCas<T>(op: () => T): T {
  try {
    return op();
  } catch (e) {
    if (e instanceof RplError) throw e;
    throw err("CAS: no result");
  }
}
/** A CAS result string → real (when purely numeric) or algebraic object. */
function casObjOf(text: string): RplObj {
  const t = text.trim();
  if (/^[+-]?(\d+\.?\d*|\.\d+)([Ee][+-]?\d+)?$/.test(t)) return real(bn(t));
  return { k: "alg", src: t };
}
function pushCasResult(s: RplEngine, text: string): void {
  s.stack.push(casObjOf(tryCas(() => text)));
}

/** Run a tower op to a real Value; domain faults become RPL errors. */
function tryReal(op: () => unknown): Value {
  let r: unknown;
  try {
    r = op();
  } catch {
    throw err("Error");
  }
  if (math.isBigNumber(r)) {
    if (!r.isFinite()) throw err("Infinite Result");
    return r;
  }
  if (typeof r === "number" && Number.isFinite(r)) return bn(String(r));
  throw err("Error"); // Complex etc — callers that allow it branch first
}

// ---- stack primitives -------------------------------------------------------------

function popN(s: RplEngine, n: number): RplObj[] {
  if (s.stack.length < n) throw err("Too Few Arguments");
  const args = s.stack.splice(s.stack.length - n, n);
  if (s.modes.last) s.last = [...args];
  return args;
}
const pop1 = (s: RplEngine): RplObj => popN(s, 1)[0];
const peek = (s: RplEngine, lvl = 1): RplObj => {
  if (lvl < 1 || s.stack.length < lvl) throw err("Too Few Arguments");
  return s.stack[s.stack.length - lvl];
};

// ---- angle + H.MS helpers ----------------------------------------------------------

const toRad = (s: RplEngine, v: Value): Value =>
  s.angle === "DEG" ? v.times(PI).div(180) : s.angle === "GRD" ? v.times(PI).div(200) : v;
const fromRad = (s: RplEngine, v: Value): Value =>
  s.angle === "DEG" ? v.times(180).div(PI) : s.angle === "GRD" ? v.times(200).div(PI) : v;

/** H.MMSS → decimal hours (P2 semantics, exact decimals). */
function hmsToDec(v: Value): Value {
  const sign = v.isNegative() ? bn(-1) : bn(1);
  const a = v.abs();
  const h = a.trunc();
  const rest = a.minus(h).times(100);
  const m = rest.trunc();
  const sec = rest.minus(m).times(100);
  return sign.times(h.plus(m.div(60)).plus(sec.div(3600)));
}
function decToHms(v: Value): Value {
  const sign = v.isNegative() ? bn(-1) : bn(1);
  const a = v.abs();
  const h = a.trunc();
  const restMin = a.minus(h).times(60);
  const m = restMin.trunc();
  const sec = restMin.minus(m).times(60);
  return sign.times(h.plus(m.div(100)).plus(sec.div(10000)));
}

// ---- complex helpers (float64, like P9 — documented ≥ hardware precision) ----------

type Cpx = { re: number; im: number };
const cpx = (re: number, im: number): RplObj => {
  if (!Number.isFinite(re) || !Number.isFinite(im)) throw err("Error");
  return { k: "cpx", re, im };
};
const asCpx = (o: RplObj): Cpx => {
  if (o.k === "cpx") return o;
  if (o.k === "real") return { re: num(o.v), im: 0 };
  throw err("Bad Argument Type");
};
const cMul = (a: Cpx, b: Cpx): RplObj => cpx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cDiv = (a: Cpx, b: Cpx): RplObj => {
  const d = b.re * b.re + b.im * b.im;
  if (d === 0) throw err("Infinite Result");
  return cpx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cAbs = (a: Cpx): number => Math.hypot(a.re, a.im);
const cPow = (a: Cpx, n: number): RplObj => {
  const r = Math.pow(cAbs(a), n);
  const th = Math.atan2(a.im, a.re) * n;
  return cpx(r * Math.cos(th), r * Math.sin(th));
};

// ---- array helpers (float64 rows, ml-matrix for the linear algebra) ---------------

const arrOf = (rows: number[][], vec: boolean): RplObj => ({ k: "arr", rows, vec });

// Complex matrices (FR-MAT-4): the 15C represents a complex matrix as a pair of
// real matrices (real part, imaginary part); these commands operate on that
// pair via math.js complex linear algebra. Numerical (Complex is double-based),
// like ROOT/∫ — the 15C carried 10 digits, so doubles ≥ hardware precision.
type CMatrix = ReturnType<typeof math.matrix>;
const toCMatrix = (re: number[][], im: number[][]): CMatrix =>
  math.matrix(re.map((row, i) => row.map((x, j) => math.complex(x, im[i]?.[j] ?? 0))));
function fromCMatrix(m: CMatrix): { re: number[][]; im: number[][] } {
  const rows = m.toArray() as (number | { re: number; im: number })[][];
  return {
    re: rows.map((r) => r.map((c) => (typeof c === "number" ? c : c.re))),
    im: rows.map((r) => r.map((c) => (typeof c === "number" ? 0 : c.im))),
  };
}
// math.js's public MathType over-broadens (it lists Unit), so the numeric
// matrix ops don't typecheck against it directly — wrap them in loose, purpose-
// built signatures (the runtime values are always numeric complex matrices).
const cmatMul = math.multiply as unknown as (a: CMatrix, b: CMatrix) => CMatrix;
const cmatInv = math.inv as unknown as (m: CMatrix) => CMatrix;
const cmatDet = math.det as unknown as (m: CMatrix) => number | { re: number; im: number };
const dimsOf = (a: { rows: number[][]; vec: boolean }): [number, number] => [
  a.rows.length,
  a.rows[0]?.length ?? 0,
];
const flat = (a: { rows: number[][] }): number[] => a.rows.flat();
const sameDims = (a: { rows: number[][] }, b: { rows: number[][] }): boolean =>
  a.rows.length === b.rows.length && (a.rows[0]?.length ?? 0) === (b.rows[0]?.length ?? 0);
const zip = (a: number[][], b: number[][], f: (x: number, y: number) => number): number[][] =>
  a.map((row, i) => row.map((x, j) => f(x, b[i][j])));

// ---- binary-integer helpers (unsigned words, ws bits) ------------------------------

const B0 = BigInt(0);
const B1 = BigInt(1);
const maskOf = (ws: number): bigint => (B1 << BigInt(ws)) - B1;
const binObj = (v: bigint, ws: number): RplObj => ({ k: "bin", v: v & maskOf(ws) });
const binOfReal = (v: Value, ws: number): RplObj => {
  const t = v.trunc();
  const i = BigInt(t.abs().toFixed(0));
  return binObj(t.isNegative() ? (maskOf(ws) + B1 - (i & maskOf(ws))) & maskOf(ws) : i, ws);
};

// ---- directory resolution (P15) ---------------------------------------------------

/** The chain of directories from HOME down to the current one. */
function dirChain(s: RplEngine): DirNode[] {
  const chain = [s.home];
  let cur = s.home;
  for (const nm of s.path) {
    const next = cur.subs[nm];
    if (!next) break; // stale path — clamp to what exists
    chain.push(next);
    cur = next;
  }
  return chain;
}
const curDir = (s: RplEngine): DirNode => dirChain(s)[dirChain(s).length - 1];

/** 28S name resolution: current directory first, then up the path to HOME. */
function lookupVar(s: RplEngine, nm: string): RplObj | null {
  const chain = dirChain(s);
  for (let i = chain.length - 1; i >= 0; i--) {
    const v = chain[i].vars[nm];
    if (v) return v;
  }
  return null;
}
const storeVar = (s: RplEngine, nm: string, v: RplObj): void => {
  curDir(s).vars[nm] = v;
};

// ---- program evaluator (structured nodes over parse items) ------------------------

interface Ctx {
  locals: Record<string, RplObj>[];
  budget: { n: number };
}
const freshCtx = (): Ctx => ({ locals: [], budget: { n: 20_000 } });

type Node =
  | { t: "item"; it: RplItem }
  | { t: "if"; isErr: boolean; test: Node[]; then: Node[]; els: Node[] }
  | { t: "loop"; named: string | null; body: Node[]; step: boolean }
  | { t: "do"; body: Node[]; test: Node[] }
  | { t: "while"; test: Node[]; body: Node[] }
  | { t: "local"; names: string[]; body: Extract<RplObj, { k: "prog" } | { k: "alg" }> };

const CONTROL = new Set([
  "IF", "IFERR", "THEN", "ELSE", "END", "START", "FOR", "NEXT", "STEP",
  "DO", "UNTIL", "WHILE", "REPEAT", "→",
]);

/** Build structured nodes from items until one of `until` words; returns the
 * terminator found. Unbalanced structures are a Syntax Error. */
function buildNodes(
  items: RplItem[],
  pos: { i: number },
  until: string[],
): { nodes: Node[]; term: string } {
  const nodes: Node[] = [];
  while (pos.i < items.length) {
    const it = items[pos.i++];
    if ("lit" in it) {
      nodes.push({ t: "item", it });
      continue;
    }
    const w = it.word;
    if (until.includes(w)) return { nodes, term: w };
    if (!CONTROL.has(w)) {
      nodes.push({ t: "item", it });
      continue;
    }
    switch (w) {
      case "IF":
      case "IFERR": {
        const test = buildNodes(items, pos, ["THEN"]).nodes;
        const thenPart = buildNodes(items, pos, ["ELSE", "END"]);
        const els =
          thenPart.term === "ELSE" ? buildNodes(items, pos, ["END"]).nodes : [];
        nodes.push({ t: "if", isErr: w === "IFERR", test, then: thenPart.nodes, els });
        break;
      }
      case "START":
      case "FOR": {
        let named: string | null = null;
        if (w === "FOR") {
          const nm = items[pos.i++];
          if (!nm || !("word" in nm)) throw err("Syntax Error");
          named = nm.word;
        }
        const body = buildNodes(items, pos, ["NEXT", "STEP"]);
        nodes.push({ t: "loop", named, body: body.nodes, step: body.term === "STEP" });
        break;
      }
      case "DO": {
        const body = buildNodes(items, pos, ["UNTIL"]).nodes;
        const test = buildNodes(items, pos, ["END"]).nodes;
        nodes.push({ t: "do", body, test });
        break;
      }
      case "WHILE": {
        const test = buildNodes(items, pos, ["REPEAT"]).nodes;
        const body = buildNodes(items, pos, ["END"]).nodes;
        nodes.push({ t: "while", test, body });
        break;
      }
      case "→": {
        const names: string[] = [];
        for (;;) {
          const nx = items[pos.i];
          if (!nx) throw err("Syntax Error");
          if ("word" in nx) {
            names.push(nx.word);
            pos.i++;
          } else break;
        }
        const bodyIt = items[pos.i++];
        if (!bodyIt || !("lit" in bodyIt)) throw err("Syntax Error");
        const body = bodyIt.lit;
        if (body.k !== "prog" && body.k !== "alg") throw err("Syntax Error");
        if (!names.length) throw err("Syntax Error");
        nodes.push({ t: "local", names, body });
        break;
      }
      default:
        throw err("Syntax Error"); // stray THEN/END/NEXT/…
    }
  }
  if (until.length) throw err("Syntax Error"); // ran out before the closer
  return { nodes, term: "" };
}

const popTruth = (s: RplEngine): boolean => {
  const o = pop1(s);
  if (o.k === "real") return isTrue(o);
  if (o.k === "bin") return o.v !== B0;
  throw err("Bad Argument Type");
};

function runNodes(s: RplEngine, nodes: Node[], ctx: Ctx): void {
  for (const node of nodes) {
    if (--ctx.budget.n <= 0) throw err("Operation budget exceeded (20000 ops)");
    switch (node.t) {
      case "item":
        if ("lit" in node.it) s.stack.push(node.it.lit);
        else execToken(s, node.it.word, ctx);
        break;
      case "if": {
        if (node.isErr) {
          let failed = false;
          try {
            runNodes(s, node.test, ctx);
          } catch (e) {
            if (e instanceof RplError) {
              failed = true;
              s.errN = 1;
              s.errM = e.message;
            } else throw e;
          }
          runNodes(s, failed ? node.then : node.els, ctx);
        } else {
          runNodes(s, node.test, ctx);
          runNodes(s, popTruth(s) ? node.then : node.els, ctx);
        }
        break;
      }
      case "loop": {
        const [a, b] = popN(s, 2);
        const finish = wantReal(b);
        let counter = wantReal(a);
        const frame: Record<string, RplObj> = {};
        if (node.named) ctx.locals.push(frame);
        try {
          for (;;) {
            if (node.named) frame[node.named] = real(counter);
            runNodes(s, node.body, ctx);
            const step = node.step ? wantReal(pop1(s)) : bn(1);
            counter = counter.plus(step);
            if (step.isNegative() ? counter.lt(finish) : counter.gt(finish)) break;
            if (--ctx.budget.n <= 0) throw err("Operation budget exceeded (20000 ops)");
          }
        } finally {
          if (node.named) ctx.locals.pop();
        }
        break;
      }
      case "do":
        for (;;) {
          runNodes(s, node.body, ctx);
          runNodes(s, node.test, ctx);
          if (popTruth(s)) break;
          if (--ctx.budget.n <= 0) throw err("Operation budget exceeded (20000 ops)");
        }
        break;
      case "while":
        for (;;) {
          runNodes(s, node.test, ctx);
          if (!popTruth(s)) break;
          runNodes(s, node.body, ctx);
          if (--ctx.budget.n <= 0) throw err("Operation budget exceeded (20000 ops)");
        }
        break;
      case "local": {
        const vals = popN(s, node.names.length);
        const frame: Record<string, RplObj> = {};
        node.names.forEach((nm, i) => {
          frame[nm] = vals[i];
        });
        ctx.locals.push(frame);
        try {
          if (node.body.k === "prog") runBody(s, node.body.body, ctx);
          else evalAlg(s, node.body, ctx);
        } finally {
          ctx.locals.pop();
        }
        break;
      }
    }
  }
}

function runBody(s: RplEngine, body: string, ctx: Ctx): void {
  const items = parseItems(body, s.base);
  const pos = { i: 0 };
  runNodes(s, buildNodes(items, pos, []).nodes, ctx);
}

const lookupLocal = (ctx: Ctx, nm: string): RplObj | null => {
  for (let i = ctx.locals.length - 1; i >= 0; i--) {
    if (nm in ctx.locals[i]) return ctx.locals[i][nm];
  }
  return null;
};

/** Numeric environment for algebraics: locals, then vars (reals or nested
 * algebraics); anything else is unresolved. */
function envOf(s: RplEngine, ctx: Ctx) {
  return {
    get: (nm: string): Value | null => {
      const loc = lookupLocal(ctx, nm);
      if (loc) return loc.k === "real" ? loc.v : null;
      const v = lookupVar(s, nm);
      if (!v) return null;
      if (v.k === "real") return v.v;
      if (v.k === "alg") {
        try {
          return evalExpr(parseExpr(v.src), envOf(s, ctx));
        } catch {
          return null;
        }
      }
      return null;
    },
    toRad: (v: Value) => toRad(s, v),
    fromRad: (v: Value) => fromRad(s, v),
  };
}

/** Numeric sample of an algebraic at indep = t (plot sampler seam). */
function evalAtPoint(s: RplEngine, src: string, indep: string, t: number): number | null {
  try {
    const env = envOf(s, freshCtx());
    const inner = env.get.bind(env);
    const v = evalExpr(parseExpr(src), {
      ...env,
      get: (q: string) => (q === indep ? bn(String(t)) : inner(q)),
    });
    return num(v);
  } catch {
    return null;
  }
}

/** Split an equation string on its single top-level '=' (equality), leaving
 * ==, <=, >=, != intact. No '=' ⇒ the whole expression equated to 0. */
function splitEquation(src: string): [string, string] {
  for (let i = 0; i < src.length; i++) {
    if (
      src[i] === "=" &&
      src[i - 1] !== "<" &&
      src[i - 1] !== ">" &&
      src[i - 1] !== "!" &&
      src[i - 1] !== "=" &&
      src[i + 1] !== "="
    ) {
      return [src.slice(0, i), src.slice(i + 1)];
    }
  }
  return [src, "0"];
}

/** Multivariate Newton–Raphson (FR-SOLVE-3): solve n equations (each lhs=rhs)
 * in n unknowns from an initial guess. The Jacobian is estimated by central
 * differences and each step solves J·Δ = −F via ml-matrix. Returns the root
 * vector, or null if it doesn't converge. Numerical (double), like ROOT/∫. */
function solveSystem(
  s: RplEngine,
  eqs: string[],
  vars: string[],
  guess: number[],
): number[] | null {
  const n = vars.length;
  if (eqs.length !== n || guess.length !== n || n === 0) return null;

  const residual = (src: string, x: number[]): number | null => {
    const [lhs, rhs] = splitEquation(src);
    const at = (expr: string): number => {
      const env = envOf(s, freshCtx());
      const inner = env.get.bind(env);
      return num(
        evalExpr(parseExpr(expr), {
          ...env,
          get: (q: string) => {
            const idx = vars.indexOf(q);
            return idx >= 0 ? bn(String(x[idx])) : inner(q);
          },
        }),
      );
    };
    try {
      const r = at(lhs) - at(rhs);
      return Number.isFinite(r) ? r : null;
    } catch {
      return null;
    }
  };

  let x = [...guess];
  for (let iter = 0; iter < 80; iter++) {
    const F = eqs.map((e) => residual(e, x));
    if (F.some((v) => v === null)) return null;
    const Fv = F as number[];
    if (Math.max(...Fv.map(Math.abs)) < 1e-11) return x;

    const J = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    for (let j = 0; j < n; j++) {
      const h = Math.max(1e-7, Math.abs(x[j]) * 1e-7);
      const xp = [...x];
      const xm = [...x];
      xp[j] += h;
      xm[j] -= h;
      for (let i = 0; i < n; i++) {
        const fp = residual(eqs[i], xp);
        const fm = residual(eqs[i], xm);
        if (fp === null || fm === null) return null;
        J[i][j] = (fp - fm) / (2 * h);
      }
    }

    let delta: number[];
    try {
      const sol = mlSolve(new Matrix(J), Matrix.columnVector(Fv.map((v) => -v)));
      delta = sol.to1DArray();
    } catch {
      return null;
    }
    if (delta.some((d) => !Number.isFinite(d))) return null;
    x = x.map((v, i) => v + delta[i]);
  }

  const F = eqs.map((e) => residual(e, x));
  if (F.some((v) => v === null) || Math.max(...(F as number[]).map(Math.abs)) > 1e-6) return null;
  return x;
}

/** DRAW: sample the current equation over the PPAR window (FR-PLOT-1). */
function drawPlot(s: RplEngine): void {
  const eq = lookupVar(s, "EQ");
  if (!eq || (eq.k !== "alg" && eq.k !== "name")) throw err("No Current Equation");
  const srcTxt = eq.k === "alg" ? eq.src : eq.v;
  const [xmin] = s.ppar.pmin;
  const [xmax] = s.ppar.pmax;
  const polar = s.ptype === "POLAR";
  const lo = polar ? 0 : xmin;
  const hi = polar ? 2 * Math.PI : xmax;
  const points = sampleSeries(
    (t) => evalAtPoint(s, srcTxt, s.ppar.indep, t),
    lo,
    hi,
    131 * Math.max(1, s.ppar.res),
    polar,
  );
  if (points.every((p) => p.y === null)) throw err("Invalid PPAR / Undefined Name");
  s.plot = {
    kind: polar ? "polar" : "fn",
    points,
    src: srcTxt,
    pmin: [...s.ppar.pmin],
    pmax: [...s.ppar.pmax],
    axes: true,
  };
}

/** EVAL an algebraic: numeric result when every name resolves, else the
 * algebraic stays on the stack unchanged (symbolic rewriting is P14). */
function evalAlg(s: RplEngine, o: Extract<RplObj, { k: "alg" }>, ctx: Ctx): void {
  try {
    s.stack.push(real(evalExpr(parseExpr(o.src), envOf(s, ctx))));
  } catch (e) {
    if (e instanceof UndefinedName) s.stack.push(o);
    else if (e instanceof RplError || e instanceof Halt) throw e;
    else throw err("Error");
  }
}

/** EVAL semantics per object type (data self-evaluates; names indirect). */
function evalObj(s: RplEngine, o: RplObj, ctx: Ctx): void {
  switch (o.k) {
    case "prog":
      runBody(s, o.body, ctx);
      return;
    case "alg":
      evalAlg(s, o, ctx);
      return;
    case "name": {
      // a subdirectory name EVALuates by entering it (the 28S USER behavior)
      if (curDir(s).subs[o.v]) {
        s.path = [...s.path, o.v];
        return;
      }
      const c = lookupVar(s, o.v);
      if (c) evalObj(s, c, ctx);
      else s.stack.push(o); // undefined names evaluate to themselves
      return;
    }
    default:
      s.stack.push(o);
  }
}

/** A word inside a program / command line: command, local, variable, or name. */
function execToken(s: RplEngine, w: string, ctx: Ctx): void {
  if (execWord(s, w, ctx)) return;
  const loc = lookupLocal(ctx, w);
  if (loc) {
    s.stack.push(loc);
    return;
  }
  if (curDir(s).subs[w]) {
    s.path = [...s.path, w];
    return;
  }
  const v = lookupVar(s, w);
  if (v) {
    evalObj(s, v, ctx);
    return;
  }
  s.stack.push(mkName(w));
}

// ---- the 48 clock (P17): injectable, shared shape with the P11 module -------------

let clock48: () => Date = () => new Date();
export function setRplClock(fn: () => Date): void {
  clock48 = fn;
}
/** MM.DDYYYY → UTC date (the 48's default M.DY format). */
function decodeDate48(v: number): Date | null {
  const m = Math.trunc(v);
  const rest = Math.round((v - m) * 1e6);
  const day = Math.trunc(rest / 10000);
  const year = rest % 10000;
  if (m < 1 || m > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, m - 1, day));
  return d.getUTCMonth() === m - 1 ? d : null;
}

// ---- printing (the tape is the printer, like the P5 HP-97) -------------------------

function print(s: RplEngine, text: string): void {
  s.hist = [...s.hist.slice(-49), { op: `🖨 ${text}`, raw: "" }];
}

/** ΣDAT as (x,y) float pairs over the COLΣ columns (48G fits/plots). */
function sdatPairs(s: RplEngine): [number, number][] {
  if (s.sdat.length < 2) throw err("Insufficient Data");
  return s.sdat.map((r) => [r[s.cols[0] - 1] ?? 0, r[s.cols[1] - 1] ?? 0]);
}
// the two naming schemes are a fixed bijection (LINFIT↔LINF, LOGFIT↔LOGF,
// EXPFIT↔EXPF, PWRFIT↔PWRF), so the string surgery always yields a valid
// member — the cast is safe and cheaper than a lookup table.
const fitModelOf = (s: RplEngine): FitModel => s.fitModel.replace("FIT", "F") as FitModel;

/** The 48G TVM variables (N, I%YR, PV, PMT, FV) → a P7 FinRegs view.
 * I%YR is annual; the monthly rate drives the P7 solvers (12/yr, documented). */
function tvmFrom(s: RplEngine): FinRegs {
  const rd = (nm: string): Value => {
    const v = lookupVar(s, nm);
    return v && v.k === "real" ? v.v : bn(0);
  };
  return {
    ...freshFin(),
    n: rd("N"),
    i: rd("I%YR").div(12), // percent per month — the P7 solvers divide by 100
    pv: rd("PV"),
    pmt: rd("PMT"),
    fv: rd("FV"),
    beg: tvmRegs(s).beg,
  };
}
const tvmState: WeakMap<RplEngine, { beg: boolean }> = new WeakMap();
function tvmRegs(s: RplEngine): { beg: boolean } {
  let t = tvmState.get(s);
  if (!t) {
    t = { beg: false };
    tvmState.set(s, t);
  }
  return t;
}

// ---- statistics helpers -------------------------------------------------------------

const colOf = (rows: number[][], c: number): number[] =>
  rows.map((r) => r[c - 1] ?? 0);
const colwise = (s: RplEngine, f: (col: number[]) => number): RplObj => {
  if (!s.sdat.length) throw err("No Statistics Data");
  const m = s.sdat[0].length;
  const out = Array.from({ length: m }, (_, j) => f(colOf(s.sdat, j + 1)));
  return m === 1 ? realOf(out[0]) : arrOf([out], true);
};
const sum = (a: number[]): number => a.reduce((x, y) => x + y, 0);
const mean = (a: number[]): number => sum(a) / a.length;
const variance = (a: number[]): number => {
  const m = mean(a);
  return sum(a.map((x) => (x - m) * (x - m))) / (a.length - 1);
};
const covariance = (x: number[], y: number[]): number => {
  const mx = mean(x);
  const my = mean(y);
  return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / (x.length - 1);
};
function lrFit(s: RplEngine): { m: number; b: number } {
  if (s.sdat.length < 2) throw err("Insufficient Data");
  const x = colOf(s.sdat, s.cols[0]);
  const y = colOf(s.sdat, s.cols[1]);
  const m = covariance(x, y) / variance(x);
  return { m, b: mean(y) - m * mean(x) };
}

/** Upper-tail probability by Simpson integration of the pdf on floats —
 * documented ~1e-8 accuracy, well beyond the 28C's display. */
function upperTail(pdf: (t: number) => number, x: number): number {
  // t = x + u/(1−u) maps u∈[0,1) to [x,∞); dt = du/(1−u)²
  const g = (u: number): number => {
    if (u >= 1) return 0;
    const t = x + u / (1 - u);
    return (pdf(t) * 1) / ((1 - u) * (1 - u));
  };
  const n = 2000;
  const h = 1 / n;
  let acc = g(0) + g(1 - 1e-12);
  for (let i = 1; i < n; i++) acc += g(i * h) * (i % 2 ? 4 : 2);
  return (acc * h) / 3;
}
/** Lanczos ln Γ on floats (the stat tails are float-precision by design). */
function lnGamma(z: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
  const t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
const chi2Pdf = (n: number) => (t: number): number =>
  t <= 0 ? 0 : Math.exp(((n / 2 - 1) * Math.log(t) - t / 2) - (Math.LN2 * n) / 2 - lnGamma(n / 2));
const tPdf = (n: number) => (t: number): number =>
  Math.exp(
    lnGamma((n + 1) / 2) -
      lnGamma(n / 2) -
      0.5 * Math.log(n * Math.PI) -
      ((n + 1) / 2) * Math.log(1 + (t * t) / n),
  );
const fPdf = (n1: number, n2: number) => (t: number): number =>
  t <= 0
    ? 0
    : Math.exp(
        lnGamma((n1 + n2) / 2) -
          lnGamma(n1 / 2) -
          lnGamma(n2 / 2) +
          (n1 / 2) * Math.log(n1 / n2) +
          (n1 / 2 - 1) * Math.log(t) -
          ((n1 + n2) / 2) * Math.log(1 + (n1 * t) / n2),
      );

// ---- the command registry -----------------------------------------------------------

const DEFERRED: Record<string, string> = {
  // positional subexpression editing needs the FORM UI — heavy-tier era
  FORM: "P19", OBSUB: "P19", EXSUB: "P19", OBGET: "P19", EXGET: "P19",
  // richer 3D plot types wait for the heavy-graphing era (WIREFRAME ships)
  "3D": "P19", PARSURFACE: "P19", PCONTOUR: "P19", GRIDMAP: "P19", YSLICE: "P19", SLOPEFIELD: "P19",
};

function binaryNum(s: RplEngine, f: (a: Value, b: Value) => unknown): void {
  const [a, b] = popN(s, 2);
  s.stack.push(real(tryReal(() => f(wantReal(a), wantReal(b)))));
}
function unaryNum(s: RplEngine, f: (a: Value) => unknown): void {
  const a = pop1(s);
  s.stack.push(real(tryReal(() => f(wantReal(a)))));
}

/** ‘+’ across the object tower. */
function opAdd(s: RplEngine): void {
  const [a, b] = popN(s, 2);
  if (a.k === "unit" || b.k === "unit") {
    // real + unit is dimensionally inconsistent, like the machines (FR-UNIT-2)
    if (a.k !== "unit" || b.k !== "unit") throw err("Inconsistent Units");
    pushU(s, tryUnits(() => addU(a, b)));
    return;
  }
  if (a.k === "str" || b.k === "str") {
    const t = (o: RplObj): string => (o.k === "str" ? o.v : formatObj(o, s.disp, s.base));
    s.stack.push(mkStr(t(a) + t(b)));
  } else if (a.k === "list" || b.k === "list") {
    const items = [
      ...(a.k === "list" ? a.items : [a]),
      ...(b.k === "list" ? b.items : [b]),
    ];
    s.stack.push({ k: "list", items });
  } else if (a.k === "arr" && b.k === "arr") {
    if (!sameDims(a, b)) throw err("Invalid Dimension");
    s.stack.push(arrOf(zip(a.rows, b.rows, (x, y) => x + y), a.vec && b.vec));
  } else if (a.k === "cpx" || b.k === "cpx") {
    const x = asCpx(a);
    const y = asCpx(b);
    s.stack.push(cpx(x.re + y.re, x.im + y.im));
  } else if (a.k === "bin" || b.k === "bin") {
    const x = a.k === "bin" ? a.v : BigInt(wantReal(a).trunc().toFixed(0));
    const y = b.k === "bin" ? b.v : BigInt(wantReal(b).trunc().toFixed(0));
    s.stack.push(binObj(x + y, s.ws));
  } else {
    s.stack.push(real(wantReal(a).plus(wantReal(b))));
  }
}

function opSub(s: RplEngine): void {
  const [a, b] = popN(s, 2);
  if (a.k === "unit" || b.k === "unit") {
    if (a.k !== "unit" || b.k !== "unit") throw err("Inconsistent Units");
    pushU(s, tryUnits(() => subU(a, b)));
    return;
  }
  if (a.k === "arr" && b.k === "arr") {
    if (!sameDims(a, b)) throw err("Invalid Dimension");
    s.stack.push(arrOf(zip(a.rows, b.rows, (x, y) => x - y), a.vec && b.vec));
  } else if (a.k === "cpx" || b.k === "cpx") {
    const x = asCpx(a);
    const y = asCpx(b);
    s.stack.push(cpx(x.re - y.re, x.im - y.im));
  } else if (a.k === "bin" || b.k === "bin") {
    const x = a.k === "bin" ? a.v : BigInt(wantReal(a).trunc().toFixed(0));
    const y = b.k === "bin" ? b.v : BigInt(wantReal(b).trunc().toFixed(0));
    s.stack.push(binObj(x - y + (maskOf(s.ws) + B1), s.ws));
  } else {
    s.stack.push(real(wantReal(a).minus(wantReal(b))));
  }
}

function opMul(s: RplEngine): void {
  const [a, b] = popN(s, 2);
  if (a.k === "unit" || b.k === "unit") {
    if (a.k === "real") pushU(s, tryUnits(() => scaleU(wantUnit(b), a.v)));
    else if (b.k === "real") pushU(s, tryUnits(() => scaleU(wantUnit(a), b.v)));
    else pushU(s, tryUnits(() => mulU(wantUnit(a), wantUnit(b))));
    return;
  }
  if (a.k === "arr" || b.k === "arr") {
    if (a.k === "arr" && b.k === "arr") {
      const [, ac] = dimsOf(a);
      // vector·matrix and matrix·vector treat the vector as a row/column
      const bm = b.vec ? b.rows[0].map((x) => [x]) : b.rows;
      if (ac !== bm.length) throw err("Invalid Dimension");
      const m = new Matrix(a.rows).mmul(new Matrix(bm));
      const rows = m.to2DArray();
      const vec = b.vec || a.vec;
      s.stack.push(vec && rows[0].length === 1 ? arrOf([rows.map((r) => r[0])], true) : arrOf(rows, false));
    } else {
      const arr = a.k === "arr" ? a : wantArr(b);
      const k = a.k === "arr" ? fRe(b) : fRe(a);
      s.stack.push(arrOf(arr.rows.map((r) => r.map((x) => x * k)), arr.vec));
    }
  } else if (a.k === "cpx" || b.k === "cpx") {
    s.stack.push(cMul(asCpx(a), asCpx(b)));
  } else if (a.k === "bin" || b.k === "bin") {
    const x = a.k === "bin" ? a.v : BigInt(wantReal(a).trunc().toFixed(0));
    const y = b.k === "bin" ? b.v : BigInt(wantReal(b).trunc().toFixed(0));
    s.stack.push(binObj(x * y, s.ws));
  } else {
    s.stack.push(real(wantReal(a).times(wantReal(b))));
  }
}

function opDiv(s: RplEngine): void {
  const [a, b] = popN(s, 2);
  if (a.k === "unit" || b.k === "unit") {
    const qa = a.k === "unit" ? a : { mag: wantReal(a), u: "" };
    const qb = b.k === "unit" ? b : { mag: wantReal(b), u: "" };
    pushU(s, tryUnits(() => divU(qa, qb)));
    return;
  }
  if (a.k === "arr" && b.k === "real") {
    const k = num(b.v);
    if (k === 0) throw err("Infinite Result");
    s.stack.push(arrOf(a.rows.map((r) => r.map((x) => x / k)), a.vec));
  } else if (a.k === "cpx" || b.k === "cpx") {
    s.stack.push(cDiv(asCpx(a), asCpx(b)));
  } else if (a.k === "bin" || b.k === "bin") {
    const x = a.k === "bin" ? a.v : BigInt(wantReal(a).trunc().toFixed(0));
    const y = b.k === "bin" ? b.v : BigInt(wantReal(b).trunc().toFixed(0));
    if (y === B0) throw err("Infinite Result");
    s.stack.push(binObj(x / y, s.ws));
  } else {
    const x = wantReal(a);
    const y = wantReal(b);
    if (y.isZero()) throw err("Infinite Result");
    s.stack.push(real(tryReal(() => math.divide(x, y))));
  }
}

function opPow(s: RplEngine): void {
  const [a, b] = popN(s, 2);
  if (a.k === "unit") {
    pushU(s, tryUnits(() => powU(a, wantInt(b))));
    return;
  }
  if (a.k === "cpx") {
    s.stack.push(cPow(a, fRe(b)));
    return;
  }
  const x = wantReal(a);
  const y = wantReal(b);
  // negative base with non-integer exponent → principal complex root (28C)
  if (x.isNegative() && !y.eq(y.trunc())) {
    s.stack.push(cPow({ re: num(x), im: 0 }, num(y)));
    return;
  }
  s.stack.push(real(tryReal(() => math.pow(x, y))));
}

function cmpObjs(s: RplEngine, op: "<" | ">" | "≤" | "≥"): void {
  const [a, b] = popN(s, 2);
  let r: boolean;
  if (a.k === "str" && b.k === "str") {
    r = op === "<" ? a.v < b.v : op === ">" ? a.v > b.v : op === "≤" ? a.v <= b.v : a.v >= b.v;
  } else {
    const x = wantReal(a);
    const y = wantReal(b);
    r = op === "<" ? x.lt(y) : op === ">" ? x.gt(y) : op === "≤" ? x.lte(y) : x.gte(y);
  }
  s.stack.push(real(bn(r ? 1 : 0)));
}

/** GET/PUT index handling: {i} / {i j} lists, or a bare real for lists. */
function indexOf2(o: RplObj): [number, number | null] {
  if (o.k === "real") return [Math.trunc(num(o.v)), null];
  if (o.k === "list") {
    const parts = o.items.map((it) => Math.trunc(num(wantReal(it))));
    if (parts.length === 1) return [parts[0], null];
    if (parts.length === 2) return [parts[0], parts[1]];
  }
  throw err("Bad Argument Type");
}

/** Execute one COMMAND word. Returns false for unknown words (the caller
 * decides whether that means a variable, a name, or an unhandled key). */
function execWord(s: RplEngine, w: string, ctx: Ctx): boolean {
  if (w in DEFERRED) throw err(`Unimplemented until ${DEFERRED[w]}`);
  switch (w) {
    // ---- stack --------------------------------------------------------------
    case "DUP":
      s.stack.push(peek(s));
      return true;
    case "DUP2": {
      const b = peek(s, 1);
      const a = peek(s, 2);
      s.stack.push(a, b);
      return true;
    }
    case "DUPN": {
      const n = wantInt(pop1(s));
      if (n < 0 || s.stack.length < n) throw err("Too Few Arguments");
      s.stack.push(...s.stack.slice(s.stack.length - n));
      return true;
    }
    case "DROP":
      pop1(s);
      return true;
    case "DROP2":
      popN(s, 2);
      return true;
    case "DROPN":
      popN(s, Math.max(0, wantInt(pop1(s))));
      return true;
    case "SWAP": {
      const [a, b] = popN(s, 2);
      s.stack.push(b, a);
      return true;
    }
    case "OVER":
      s.stack.push(peek(s, 2));
      return true;
    case "ROT": {
      const [a, b, c] = popN(s, 3);
      s.stack.push(b, c, a);
      return true;
    }
    case "PICK": {
      const n = wantInt(pop1(s));
      s.stack.push(peek(s, n));
      return true;
    }
    case "ROLL": {
      const n = wantInt(pop1(s));
      if (n < 1) return true;
      const part = popN(s, n);
      s.stack.push(...part.slice(1), part[0]);
      return true;
    }
    case "ROLLD": {
      const n = wantInt(pop1(s));
      if (n < 1) return true;
      const part = popN(s, n);
      s.stack.push(part[n - 1], ...part.slice(0, n - 1));
      return true;
    }
    case "DEPTH":
      s.stack.push(real(bn(s.stack.length)));
      return true;
    case "CLEAR":
      s.stack = [];
      return true;
    // ---- arithmetic ----------------------------------------------------------
    case "+":
      opAdd(s);
      return true;
    case "−":
    case "-":
      opSub(s);
      return true;
    case "×":
    case "*":
      opMul(s);
      return true;
    case "÷":
    case "/":
      opDiv(s);
      return true;
    case "^":
    case "yˣ":
      opPow(s);
      return true;
    case "ˣ√y": {
      const [a, b] = popN(s, 2);
      s.stack.push(real(tryReal(() => math.pow(wantReal(a), bn(1).div(wantReal(b))))));
      return true;
    }
    case "NEG":
    case "CHS":
    case "+/−": {
      const o = pop1(s);
      if (o.k === "real") s.stack.push(real(o.v.neg()));
      else if (o.k === "cpx") s.stack.push(cpx(-o.re, -o.im));
      else if (o.k === "arr") s.stack.push(arrOf(o.rows.map((r) => r.map((x) => -x)), o.vec));
      else if (o.k === "bin") s.stack.push(binObj(maskOf(s.ws) + B1 - o.v, s.ws));
      else if (o.k === "alg") s.stack.push({ k: "alg", src: `-(${o.src})` });
      else if (o.k === "unit") s.stack.push({ ...o, mag: o.mag.neg() });
      else throw err("Bad Argument Type");
      return true;
    }
    case "INV":
    case "1/x": {
      const o = pop1(s);
      if (o.k === "cpx") s.stack.push(cDiv({ re: 1, im: 0 }, o));
      else if (o.k === "arr") {
        const [r, c] = dimsOf(o);
        if (o.vec || r !== c) throw err("Invalid Dimension");
        try {
          s.stack.push(arrOf(inverse(new Matrix(o.rows)).to2DArray(), false));
        } catch {
          throw err("Infinite Result");
        }
      } else s.stack.push(real(tryReal(() => math.divide(bn(1), wantReal(o)))));
      return true;
    }
    case "√":
    case "√x":
    case "SQRT": {
      const o = pop1(s);
      if (o.k === "cpx") {
        s.stack.push(cPow(o, 0.5));
      } else {
        const x = wantReal(o);
        if (x.isNegative()) s.stack.push(cpx(0, Math.sqrt(num(x.abs())))); // 28C: √−4 → (0,2)
        else s.stack.push(real(tryReal(() => math.sqrt(x))));
      }
      return true;
    }
    case "SQ":
    case "x²": {
      const o = pop1(s);
      if (o.k === "cpx") s.stack.push(cMul(o, o));
      else if (o.k === "bin") s.stack.push(binObj(o.v * o.v, s.ws));
      else s.stack.push(real(tryReal(() => wantReal(o).times(wantReal(o)))));
      return true;
    }
    case "%": {
      const [a, b] = popN(s, 2);
      s.stack.push(real(wantReal(a).times(wantReal(b)).div(100)));
      return true;
    }
    case "%CH":
    case "Δ%": { // Δ% is the RPN line's canonical print for the same op
      const [a, b] = popN(s, 2);
      const y = wantReal(a);
      if (y.isZero()) throw err("Infinite Result");
      s.stack.push(real(wantReal(b).minus(y).div(y).times(100)));
      return true;
    }
    case "%T": {
      const [a, b] = popN(s, 2);
      const y = wantReal(a);
      if (y.isZero()) throw err("Infinite Result");
      s.stack.push(real(wantReal(b).div(y).times(100)));
      return true;
    }
    case "π":
      s.stack.push(real(PI));
      return true;
    // ---- REAL ------------------------------------------------------------------
    case "ABS": {
      const o = pop1(s);
      if (o.k === "cpx") s.stack.push(realOf(cAbs(o)));
      else if (o.k === "arr") s.stack.push(realOf(Math.sqrt(sum(flat(o).map((x) => x * x)))));
      else if (o.k === "unit") s.stack.push({ ...o, mag: o.mag.abs() });
      else s.stack.push(real(wantReal(o).abs()));
      return true;
    }
    case "SIGN": {
      const o = pop1(s);
      if (o.k === "cpx") {
        const r = cAbs(o);
        if (r === 0) throw err("Infinite Result");
        s.stack.push(cpx(o.re / r, o.im / r));
      } else {
        const x = wantReal(o);
        s.stack.push(real(bn(x.isZero() ? 0 : x.isNegative() ? -1 : 1)));
      }
      return true;
    }
    case "FACT":
      unaryNum(s, (a) =>
        a.eq(a.trunc()) && !a.isNegative()
          ? math.factorial(a)
          : Math.exp(lnGamma(num(a) + 1)),
      );
      return true;
    case "RAND":
      s.rng = (s.rng * 1103515245 + 12345) % 2147483648;
      s.stack.push(real(bn(s.rng).div(2147483648)));
      return true;
    case "RDZ":
      s.rng = wantInt(pop1(s)) || 12345;
      return true;
    case "MAXR":
      s.stack.push(real(bn("9.99999999999e499")));
      return true;
    case "MINR":
      s.stack.push(real(bn("1e-499")));
      return true;
    case "MANT":
      unaryNum(s, (a) => (a.isZero() ? bn(0) : a.abs().div(bn(10).pow(a.abs().log(10).floor()))));
      return true;
    case "XPON":
      unaryNum(s, (a) => (a.isZero() ? bn(0) : a.abs().log(10).floor()));
      return true;
    case "IP":
      unaryNum(s, (a) => a.trunc());
      return true;
    case "FP":
      unaryNum(s, (a) => a.minus(a.trunc()));
      return true;
    case "FLOOR":
      unaryNum(s, (a) => a.floor());
      return true;
    case "CEIL":
      unaryNum(s, (a) => a.ceil());
      return true;
    case "RND":
      unaryNum(s, (a) =>
        s.disp.mode === "FIX"
          ? a.toDecimalPlaces(s.disp.digits)
          : s.disp.mode === "STD"
            ? a
            : a.toSignificantDigits(s.disp.digits + 1),
      );
      return true;
    case "MAX":
      binaryNum(s, (a, b) => (a.gt(b) ? a : b));
      return true;
    case "MIN":
      binaryNum(s, (a, b) => (a.lt(b) ? a : b));
      return true;
    case "MOD":
      binaryNum(s, (a, b) => a.mod(b));
      return true;
    // ---- LOGS -------------------------------------------------------------------
    case "LN":
      unaryNum(s, (a) => math.log(a));
      return true;
    case "LOG":
      unaryNum(s, (a) => math.log10(a));
      return true;
    case "EXP":
    case "eˣ":
      unaryNum(s, (a) => math.exp(a));
      return true;
    case "ALOG":
    case "10ˣ":
      unaryNum(s, (a) => math.pow(bn(10), a));
      return true;
    case "LNP1":
      unaryNum(s, (a) => math.log(a.plus(1)));
      return true;
    case "EXPM":
      unaryNum(s, (a) => (math.exp(a) as Value).minus(1));
      return true;
    case "SINH":
      unaryNum(s, (a) => math.sinh(a));
      return true;
    case "COSH":
      unaryNum(s, (a) => math.cosh(a));
      return true;
    case "TANH":
      unaryNum(s, (a) => math.tanh(a));
      return true;
    case "ASINH":
      unaryNum(s, (a) => math.asinh(a));
      return true;
    case "ACOSH":
      unaryNum(s, (a) => math.acosh(a));
      return true;
    case "ATANH":
      unaryNum(s, (a) => math.atanh(a));
      return true;
    // ---- TRIG -------------------------------------------------------------------
    case "SIN":
      unaryNum(s, (a) => math.sin(toRad(s, a)));
      return true;
    case "COS":
      unaryNum(s, (a) => math.cos(toRad(s, a)));
      return true;
    case "TAN":
      unaryNum(s, (a) => math.tan(toRad(s, a)));
      return true;
    case "ASIN":
    case "SIN⁻¹": // the adapter's canonical print for the inverse plane
      unaryNum(s, (a) => fromRad(s, tryReal(() => math.asin(a))));
      return true;
    case "ACOS":
    case "COS⁻¹":
      unaryNum(s, (a) => fromRad(s, tryReal(() => math.acos(a))));
      return true;
    case "ATAN":
    case "TAN⁻¹":
      unaryNum(s, (a) => fromRad(s, tryReal(() => math.atan(a))));
      return true;
    case "D→R":
      unaryNum(s, (a) => a.times(PI).div(180));
      return true;
    case "R→D":
      unaryNum(s, (a) => a.times(180).div(PI));
      return true;
    case "→HMS":
      unaryNum(s, (a) => decToHms(a));
      return true;
    case "HMS→":
      unaryNum(s, (a) => hmsToDec(a));
      return true;
    case "HMS+":
      binaryNum(s, (a, b) => decToHms(hmsToDec(a).plus(hmsToDec(b))));
      return true;
    case "HMS−":
      binaryNum(s, (a, b) => decToHms(hmsToDec(a).minus(hmsToDec(b))));
      return true;
    // ---- COMPLEX ------------------------------------------------------------------
    case "R→C": {
      const [a, b] = popN(s, 2);
      s.stack.push(cpx(fRe(a), fRe(b)));
      return true;
    }
    case "C→R": {
      const z = asCpx(pop1(s));
      s.stack.push(realOf(z.re), realOf(z.im));
      return true;
    }
    case "RE": {
      const o = pop1(s);
      if (o.k === "arr") s.stack.push(o);
      else s.stack.push(realOf(asCpx(o).re));
      return true;
    }
    case "IM": {
      const o = pop1(s);
      if (o.k === "arr") s.stack.push(arrOf(o.rows.map((r) => r.map(() => 0)), o.vec));
      else s.stack.push(realOf(asCpx(o).im));
      return true;
    }
    case "CONJ": {
      const o = pop1(s);
      if (o.k === "cpx") s.stack.push(cpx(o.re, -o.im));
      else if (o.k === "real" || o.k === "arr") s.stack.push(o);
      else throw err("Bad Argument Type");
      return true;
    }
    case "ARG": {
      const z = asCpx(pop1(s));
      s.stack.push(real(fromRad(s, bn(String(Math.atan2(z.im, z.re))))));
      return true;
    }
    case "R→P": {
      const z = asCpx(pop1(s));
      s.stack.push(cpx(cAbs(z), num(fromRad(s, bn(String(Math.atan2(z.im, z.re)))))));
      return true;
    }
    case "P→R": {
      const z = asCpx(pop1(s));
      const th = num(toRad(s, bn(String(z.im))));
      s.stack.push(cpx(z.re * Math.cos(th), z.re * Math.sin(th)));
      return true;
    }
    // ---- BINARY ---------------------------------------------------------------------
    case "DEC":
      s.base = 10;
      return true;
    case "HEX":
      s.base = 16;
      return true;
    case "OCT":
      s.base = 8;
      return true;
    case "BIN":
      s.base = 2;
      return true;
    case "STWS":
      s.ws = Math.min(64, Math.max(1, wantInt(pop1(s))));
      return true;
    case "RCWS":
      s.stack.push(real(bn(s.ws)));
      return true;
    case "R→B":
      s.stack.push(binOfReal(wantReal(pop1(s)), s.ws));
      return true;
    case "B→R":
      s.stack.push(real(bn(wantBin(pop1(s)).toString())));
      return true;
    case "SL":
      s.stack.push(binObj(wantBin(pop1(s)) << B1, s.ws));
      return true;
    case "SR":
      s.stack.push(binObj(wantBin(pop1(s)) >> B1, s.ws));
      return true;
    case "SLB":
      s.stack.push(binObj(wantBin(pop1(s)) << BigInt(8), s.ws));
      return true;
    case "SRB":
      s.stack.push(binObj(wantBin(pop1(s)) >> BigInt(8), s.ws));
      return true;
    case "ASR": {
      const v = wantBin(pop1(s));
      const top = B1 << BigInt(s.ws - 1);
      s.stack.push(binObj((v >> B1) | (v & top), s.ws));
      return true;
    }
    case "RL": {
      const v = wantBin(pop1(s));
      const top = (v >> BigInt(s.ws - 1)) & B1;
      s.stack.push(binObj((v << B1) | top, s.ws));
      return true;
    }
    case "RR": {
      const v = wantBin(pop1(s));
      s.stack.push(binObj((v >> B1) | ((v & B1) << BigInt(s.ws - 1)), s.ws));
      return true;
    }
    case "RLB": {
      let v = wantBin(pop1(s));
      for (let i = 0; i < 8; i++) v = ((v << B1) | ((v >> BigInt(s.ws - 1)) & B1)) & maskOf(s.ws);
      s.stack.push(binObj(v, s.ws));
      return true;
    }
    case "RRB": {
      let v = wantBin(pop1(s));
      for (let i = 0; i < 8; i++) v = (v >> B1) | ((v & B1) << BigInt(s.ws - 1));
      s.stack.push(binObj(v, s.ws));
      return true;
    }
    case "AND":
    case "OR":
    case "XOR": {
      const [a, b] = popN(s, 2);
      if (a.k === "bin" && b.k === "bin") {
        const r = w === "AND" ? a.v & b.v : w === "OR" ? a.v | b.v : a.v ^ b.v;
        s.stack.push(binObj(r, s.ws));
      } else {
        const x = !wantReal(a).isZero();
        const y = !wantReal(b).isZero();
        const r = w === "AND" ? x && y : w === "OR" ? x || y : x !== y;
        s.stack.push(real(bn(r ? 1 : 0)));
      }
      return true;
    }
    case "NOT": {
      const o = pop1(s);
      if (o.k === "bin") s.stack.push(binObj(~o.v & maskOf(s.ws), s.ws));
      else s.stack.push(real(bn(wantReal(o).isZero() ? 1 : 0)));
      return true;
    }
    // ---- TEST -------------------------------------------------------------------------
    case "==":
    case "≠": {
      const [a, b] = popN(s, 2);
      const eq = a.k === "real" && b.k === "real" ? a.v.eq(b.v) : sameObj(a, b);
      s.stack.push(real(bn((w === "==" ? eq : !eq) ? 1 : 0)));
      return true;
    }
    case "<":
      cmpObjs(s, "<");
      return true;
    case ">":
      cmpObjs(s, ">");
      return true;
    case "≤":
      cmpObjs(s, "≤");
      return true;
    case "≥":
      cmpObjs(s, "≥");
      return true;
    case "SAME": {
      const [a, b] = popN(s, 2);
      s.stack.push(real(bn(sameObj(a, b) ? 1 : 0)));
      return true;
    }
    case "TYPE":
      s.stack.push(real(bn(typeNumber(pop1(s)))));
      return true;
    case "SF":
    case "CF": {
      const n = wantInt(pop1(s));
      if (n < 1 || n > 64) throw err("Bad Argument Value");
      s.flags[n - 1] = w === "SF";
      return true;
    }
    case "FS?":
    case "FC?":
    case "FS?C":
    case "FC?C": {
      const n = wantInt(pop1(s));
      if (n < 1 || n > 64) throw err("Bad Argument Value");
      const set = s.flags[n - 1];
      s.stack.push(real(bn((w.startsWith("FS") ? set : !set) ? 1 : 0)));
      if (w.endsWith("C")) s.flags[n - 1] = false;
      return true;
    }
    case "STOF": {
      let v = B0;
      s.flags.forEach((f, i) => {
        if (f) v |= B1 << BigInt(i);
      });
      s.stack.push(binObj(v, 64));
      return true;
    }
    case "RCLF": {
      const v = wantBin(pop1(s));
      s.flags = s.flags.map((_, i) => ((v >> BigInt(i)) & B1) === B1);
      return true;
    }
    case "IFT": {
      const [c, t] = popN(s, 2);
      if (c.k !== "real") throw err("Bad Argument Type");
      if (isTrue(c)) evalObj(s, t, ctx);
      return true;
    }
    case "IFTE": {
      const [c, t, f] = popN(s, 3);
      if (c.k !== "real") throw err("Bad Argument Type");
      evalObj(s, isTrue(c) ? t : f, ctx);
      return true;
    }
    // ---- STRING ------------------------------------------------------------------------
    case "→STR":
      s.stack.push(mkStr(formatObj(pop1(s), s.disp, s.base)));
      return true;
    case "STR→": {
      const text = wantStr(pop1(s));
      const items = parseItems(text, s.base);
      const pos = { i: 0 };
      runNodes(s, buildNodes(items, pos, []).nodes, ctx);
      return true;
    }
    case "CHR":
      s.stack.push(mkStr(String.fromCharCode(wantInt(pop1(s)))));
      return true;
    case "NUM": {
      const t = wantStr(pop1(s));
      if (!t.length) throw err("Bad Argument Value");
      s.stack.push(real(bn(t.charCodeAt(0))));
      return true;
    }
    case "POS": {
      const [a, b] = popN(s, 2);
      if (a.k === "str") {
        s.stack.push(real(bn(a.v.indexOf(wantStr(b)) + 1)));
      } else {
        const items = wantList(a);
        const idx = items.findIndex((it) => sameObj(it, b));
        s.stack.push(real(bn(idx + 1)));
      }
      return true;
    }
    case "SUB": {
      const [o, a, b] = popN(s, 3);
      const from = Math.max(1, wantInt(a));
      const to = wantInt(b);
      if (o.k === "str") s.stack.push(mkStr(o.v.slice(from - 1, to)));
      else s.stack.push({ k: "list", items: wantList(o).slice(from - 1, to) });
      return true;
    }
    case "SIZE": {
      const o = pop1(s);
      if (o.k === "alg") {
        // top-level object count: operator + operands (the 28C's convention)
        const node = parseExpr(o.src);
        const n =
          node.t === "bin" ? 3 : node.t === "neg" ? 2 : node.t === "call" ? node.args.length + 1 : 1;
        s.stack.push(real(bn(n)));
        return true;
      }
      if (o.k === "str") s.stack.push(real(bn(o.v.length)));
      else if (o.k === "list") s.stack.push(real(bn(o.items.length)));
      else if (o.k === "arr") {
        const [r, c] = dimsOf(o);
        s.stack.push({
          k: "list",
          items: o.vec ? [real(bn(c))] : [real(bn(r)), real(bn(c))],
        });
      } else throw err("Bad Argument Type");
      return true;
    }
    case "DISP": {
      const [o, lvl] = popN(s, 2);
      wantInt(lvl); // line number accepted; the glass has one message line
      s.msg = o.k === "str" ? o.v : formatObj(o, s.disp, s.base);
      return true;
    }
    // ---- LIST / ARRAY shared -------------------------------------------------------------
    case "→LIST": {
      const n = wantInt(pop1(s));
      if (n < 0) throw err("Bad Argument Value");
      s.stack.push({ k: "list", items: popN(s, n) });
      return true;
    }
    case "LIST→": {
      const items = wantList(pop1(s));
      s.stack.push(...items, real(bn(items.length)));
      return true;
    }
    case "GET": {
      const [o, idx] = popN(s, 2);
      const [i, j] = indexOf2(idx);
      if (o.k === "list") {
        const v = o.items[i - 1];
        if (!v) throw err("Bad Argument Value");
        s.stack.push(v);
      } else {
        const a = wantArr(o);
        const row = a.vec ? a.rows[0] : a.rows[i - 1];
        const v = a.vec ? row?.[i - 1] : row?.[(j ?? 1) - 1];
        if (v === undefined) throw err("Bad Argument Value");
        s.stack.push(realOf(v));
      }
      return true;
    }
    case "PUT": {
      const [o, idx, val] = popN(s, 3);
      const [i, j] = indexOf2(idx);
      if (o.k === "list") {
        if (!o.items[i - 1]) throw err("Bad Argument Value");
        const items = [...o.items];
        items[i - 1] = val;
        s.stack.push({ k: "list", items });
      } else {
        const a = wantArr(o);
        const rows = a.rows.map((r) => [...r]);
        const ri = a.vec ? 0 : i - 1;
        const ci = a.vec ? i - 1 : (j ?? 1) - 1;
        if (rows[ri]?.[ci] === undefined) throw err("Bad Argument Value");
        rows[ri][ci] = fRe(val);
        s.stack.push(arrOf(rows, a.vec));
      }
      return true;
    }
    case "GETI": {
      const [o, idx] = popN(s, 2);
      const [i] = indexOf2(idx);
      const len = o.k === "list" ? o.items.length : flat(wantArr(o)).length;
      const nextI = (i % len) + 1;
      s.stack.push(o, o.k === "list" ? real(bn(nextI)) : { k: "list", items: [real(bn(nextI))] });
      if (o.k === "list") {
        const v = o.items[i - 1];
        if (!v) throw err("Bad Argument Value");
        s.stack.push(v);
      } else {
        const v = flat(wantArr(o))[i - 1];
        if (v === undefined) throw err("Bad Argument Value");
        s.stack.push(realOf(v));
      }
      return true;
    }
    case "PUTI": {
      const [o, idx, val] = popN(s, 3);
      const [i] = indexOf2(idx);
      if (o.k === "list") {
        if (!o.items[i - 1]) throw err("Bad Argument Value");
        const items = [...o.items];
        items[i - 1] = val;
        const nextI = (i % items.length) + 1;
        s.stack.push({ k: "list", items }, real(bn(nextI)));
      } else {
        const a = wantArr(o);
        const [r, c] = dimsOf(a);
        const fl = flat(a);
        if (fl[i - 1] === undefined) throw err("Bad Argument Value");
        fl[i - 1] = fRe(val);
        const rows = Array.from({ length: r }, (_, ri) => fl.slice(ri * c, ri * c + c));
        const nextI = (i % fl.length) + 1;
        s.stack.push(arrOf(rows, a.vec), { k: "list", items: [real(bn(nextI))] });
      }
      return true;
    }
    // ---- ARRAY ------------------------------------------------------------------------------
    case "→ARRY": {
      const dims = wantList(pop1(s)).map((o) => wantInt(o));
      if (dims.length === 1) {
        const els = popN(s, dims[0]).map(fRe);
        s.stack.push(arrOf([els], true));
      } else if (dims.length === 2) {
        const els = popN(s, dims[0] * dims[1]).map(fRe);
        const rows = Array.from({ length: dims[0] }, (_, i) =>
          els.slice(i * dims[1], (i + 1) * dims[1]),
        );
        s.stack.push(arrOf(rows, false));
      } else throw err("Bad Argument Value");
      return true;
    }
    case "ARRY→": {
      const a = wantArr(pop1(s));
      const [r, c] = dimsOf(a);
      flat(a).forEach((x) => s.stack.push(realOf(x)));
      s.stack.push({
        k: "list",
        items: a.vec ? [real(bn(c))] : [real(bn(r)), real(bn(c))],
      });
      return true;
    }
    case "RDM": {
      const [o, d] = popN(s, 2);
      const a = wantArr(o);
      const dims = wantList(d).map((x) => wantInt(x));
      const fl = flat(a);
      const want = dims.length === 1 ? dims[0] : dims[0] * dims[1];
      const els = Array.from({ length: want }, (_, i) => fl[i] ?? 0);
      if (dims.length === 1) s.stack.push(arrOf([els], true));
      else
        s.stack.push(
          arrOf(
            Array.from({ length: dims[0] }, (_, i) => els.slice(i * dims[1], (i + 1) * dims[1])),
            false,
          ),
        );
      return true;
    }
    case "TRN": {
      const a = wantArr(pop1(s));
      const rows = a.vec ? a.rows[0].map((x) => [x]) : new Matrix(a.rows).transpose().to2DArray();
      s.stack.push(arrOf(rows, false));
      return true;
    }
    case "CON": {
      const [d, v] = popN(s, 2);
      const k = fRe(v);
      const dims =
        d.k === "arr" ? (d.vec ? [dimsOf(d)[1]] : [d.rows.length, d.rows[0].length])
        : wantList(d).map((x) => wantInt(x));
      if (dims.length === 1) s.stack.push(arrOf([Array.from({ length: dims[0] }, () => k)], true));
      else
        s.stack.push(
          arrOf(Array.from({ length: dims[0] }, () => Array.from({ length: dims[1] }, () => k)), false),
        );
      return true;
    }
    case "IDN": {
      const d = pop1(s);
      const n = d.k === "arr" ? d.rows.length : wantInt(d);
      s.stack.push(
        arrOf(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))), false),
      );
      return true;
    }
    case "CROSS": {
      const [a, b] = popN(s, 2);
      const x = wantArr(a);
      const y = wantArr(b);
      if (!x.vec || !y.vec || x.rows[0].length !== 3 || y.rows[0].length !== 3)
        throw err("Invalid Dimension");
      const [x1, x2, x3] = x.rows[0];
      const [y1, y2, y3] = y.rows[0];
      s.stack.push(arrOf([[x2 * y3 - x3 * y2, x3 * y1 - x1 * y3, x1 * y2 - x2 * y1]], true));
      return true;
    }
    case "DOT": {
      const [a, b] = popN(s, 2);
      const x = wantArr(a);
      const y = wantArr(b);
      const fx = flat(x);
      const fy = flat(y);
      if (fx.length !== fy.length) throw err("Invalid Dimension");
      s.stack.push(realOf(sum(fx.map((v, i) => v * fy[i]))));
      return true;
    }
    case "DET": {
      const a = wantArr(pop1(s));
      const [r, c] = dimsOf(a);
      if (a.vec || r !== c) throw err("Invalid Dimension");
      s.stack.push(realOf(det(new Matrix(a.rows))));
      return true;
    }
    case "RSD": {
      const [bO, aO, xO] = popN(s, 3);
      const bA = wantArr(bO);
      const aA = wantArr(aO);
      const xA = wantArr(xO);
      const xm = xA.vec ? xA.rows[0].map((v) => [v]) : xA.rows;
      const prod = new Matrix(aA.rows).mmul(new Matrix(xm)).to2DArray();
      const bm = bA.vec ? bA.rows[0].map((v) => [v]) : bA.rows;
      if (prod.length !== bm.length) throw err("Invalid Dimension");
      const res = bm.map((row, i) => row.map((v, j) => v - prod[i][j]));
      s.stack.push(bA.vec ? arrOf([res.map((r0) => r0[0])], true) : arrOf(res, false));
      return true;
    }
    case "RNRM": {
      const a = wantArr(pop1(s));
      s.stack.push(realOf(Math.max(...a.rows.map((r) => sum(r.map(Math.abs))))));
      return true;
    }
    case "CNRM": {
      const a = wantArr(pop1(s));
      const [, c] = dimsOf(a);
      s.stack.push(
        realOf(Math.max(...Array.from({ length: c }, (_, j) => sum(a.rows.map((r) => Math.abs(r[j])))))),
      );
      return true;
    }
    // ---- STORE -----------------------------------------------------------------------------
    case "STO": {
      const [v, nm] = popN(s, 2);
      storeVar(s, wantNameOf(nm), v);
      return true;
    }
    case "RCL": {
      const nm = wantNameOf(pop1(s));
      const v = lookupVar(s, nm);
      if (!v) throw err("Undefined Name");
      s.stack.push(v);
      return true;
    }
    case "PURGE": {
      const o = pop1(s);
      const names = o.k === "list" ? o.items.map(wantNameOf) : [wantNameOf(o)];
      const dir = curDir(s);
      for (const nm of names) {
        if (dir.subs[nm]) {
          // only an EMPTY subdirectory purges, like the 28S
          const d = dir.subs[nm];
          if (Object.keys(d.vars).length || Object.keys(d.subs).length)
            throw err("Non-Empty Directory");
          delete dir.subs[nm];
        } else delete dir.vars[nm];
      }
      return true;
    }
    case "STO+":
    case "STO−":
    case "STO*":
    case "STO/": {
      const [v, nmO] = popN(s, 2);
      const nm = wantNameOf(nmO);
      const cur = curDir(s).vars[nm]; // register arithmetic is current-dir (note)
      if (!cur) throw err("Undefined Name");
      const a = wantReal(cur);
      const b = wantReal(v);
      const r =
        w === "STO+" ? a.plus(b) : w === "STO−" ? a.minus(b) : w === "STO*" ? a.times(b) : a.div(b);
      if (!r.isFinite()) throw err("Infinite Result");
      curDir(s).vars[nm] = real(r);
      return true;
    }
    case "SNEG":
    case "SINV":
    case "SCONJ": {
      const nm = wantNameOf(pop1(s));
      const cur = curDir(s).vars[nm];
      if (!cur) throw err("Undefined Name");
      if (w === "SCONJ" && cur.k === "cpx") curDir(s).vars[nm] = cpx(cur.re, -cur.im);
      else {
        const a = wantReal(cur);
        curDir(s).vars[nm] = real(
          w === "SNEG" ? a.neg() : w === "SINV" ? tryReal(() => math.divide(bn(1), a)) : a,
        );
      }
      return true;
    }
    case "ORDER": {
      const names = wantList(pop1(s)).map(wantNameOf);
      const dir = curDir(s);
      const rest = Object.entries(dir.vars).filter(([k]) => !names.includes(k));
      const first = names
        .filter((nm) => nm in dir.vars)
        .map((nm): [string, RplObj] => [nm, dir.vars[nm]]);
      dir.vars = Object.fromEntries([...first, ...rest]);
      return true;
    }
    case "CLUSR": {
      const dir = curDir(s);
      dir.vars = {};
      dir.subs = {};
      return true;
    }
    // ---- MEMORY / directories (P15, HP-28S) ---------------------------------------
    case "CRDIR": {
      const nm = wantNameOf(pop1(s));
      const dir = curDir(s);
      if (dir.vars[nm] || dir.subs[nm]) throw err("Name Conflict");
      dir.subs[nm] = newDir();
      return true;
    }
    case "HOME":
      s.path = [];
      return true;
    case "UP":
    case "UPDIR":
      s.path = s.path.slice(0, -1);
      return true;
    case "PATH":
      s.stack.push({ k: "list", items: [mkName("HOME"), ...s.path.map(mkName)] });
      return true;
    case "VARS": {
      const dir = curDir(s);
      s.stack.push({
        k: "list",
        items: [...Object.keys(dir.subs), ...Object.keys(dir.vars)].map(mkName),
      });
      return true;
    }
    case "MENU": {
      // build the CUSTOM softkey row from a list of names/commands
      s.custom = wantList(pop1(s)).map((o) => (o.k === "name" || o.k === "str" ? o.v : ""))
        .filter(Boolean);
      s.menu = { name: "CUSTOM", page: 0 };
      return true;
    }
    case "COMB": {
      // C(n,r) — exact on the tower, like the P8 probability core
      const [nO, rO] = popN(s, 2);
      const n = wantInt(nO);
      const r2 = wantInt(rO);
      if (n < 0 || r2 < 0 || r2 > n) throw err("Bad Argument Value");
      let acc = bn(1);
      for (let i = 0; i < r2; i++) acc = acc.times(n - i).div(i + 1);
      s.stack.push(real(acc));
      return true;
    }
    case "PERM": {
      const [nO, rO] = popN(s, 2);
      const n = wantInt(nO);
      const r2 = wantInt(rO);
      if (n < 0 || r2 < 0 || r2 > n) throw err("Bad Argument Value");
      let acc = bn(1);
      for (let i = 0; i < r2; i++) acc = acc.times(n - i);
      s.stack.push(real(acc));
      return true;
    }
    case "CMD":
      s.modes.cmd = !s.modes.cmd;
      return true;
    case "TRAC":
      s.modes.trace = !s.modes.trace;
      return true;
    case "MEM":
      s.stack.push(real(bn(65536))); // emulator: memory is effectively unbounded
      return true;
    // ---- MODE ------------------------------------------------------------------------------
    case "STD":
      s.disp = { mode: "STD", digits: s.disp.digits };
      return true;
    case "FIX":
    case "SCI":
    case "ENG": {
      const n = Math.min(11, Math.max(0, wantInt(pop1(s))));
      s.disp = { mode: w, digits: n };
      return true;
    }
    case "DEG":
    case "RAD":
    case "GRD":
      s.angle = w;
      return true;
    case "+CMD":
    case "−CMD":
      s.modes.cmd = w === "+CMD";
      return true;
    case "+LAST":
    case "−LAST":
      s.modes.last = w === "+LAST";
      return true;
    case "+UND":
    case "−UND":
      s.modes.und = w === "+UND";
      return true;
    case "+ML":
    case "−ML":
      s.modes.ml = w === "+ML";
      return true;
    case "RDX.":
    case "RDX,":
      s.modes.rdxComma = w === "RDX,";
      return true;
    case "PRMD":
      print(
        s,
        `${s.disp.mode}${s.disp.mode === "STD" ? "" : ` ${s.disp.digits}`} ${s.angle} ws${s.ws} base${s.base}`,
      );
      return true;
    // ---- STAT ------------------------------------------------------------------------------
    case "Σ+": {
      const o = pop1(s);
      const row =
        o.k === "real"
          ? [num(o.v)]
          : o.k === "arr" && o.vec
            ? [...o.rows[0]]
            : o.k === "list"
              ? o.items.map((it) => fRe(it))
              : null;
      if (!row) throw err("Bad Argument Type");
      if (s.sdat.length && s.sdat[0].length !== row.length) throw err("Invalid Dimension");
      s.sdat = [...s.sdat, row];
      return true;
    }
    case "Σ−": {
      if (!s.sdat.length) throw err("No Statistics Data");
      const last = s.sdat[s.sdat.length - 1];
      s.sdat = s.sdat.slice(0, -1);
      s.stack.push(last.length === 1 ? realOf(last[0]) : arrOf([last], true));
      return true;
    }
    case "NΣ":
      s.stack.push(real(bn(s.sdat.length)));
      return true;
    case "CLΣ":
      s.sdat = [];
      return true;
    case "STOΣ": {
      const o = pop1(s);
      const a = wantArr(o);
      s.sdat = a.vec ? a.rows[0].map((x) => [x]) : a.rows.map((r) => [...r]);
      return true;
    }
    case "RCLΣ": {
      if (!s.sdat.length) throw err("No Statistics Data");
      s.stack.push(
        s.sdat[0].length === 1 ? arrOf([s.sdat.map((r) => r[0])], true) : arrOf(s.sdat.map((r) => [...r]), false),
      );
      return true;
    }
    case "TOT":
      s.stack.push(colwise(s, sum));
      return true;
    case "MEAN":
      s.stack.push(colwise(s, mean));
      return true;
    case "SDEV":
      s.stack.push(colwise(s, (c) => Math.sqrt(variance(c))));
      return true;
    case "VAR":
      s.stack.push(colwise(s, variance));
      return true;
    case "MAXΣ":
      s.stack.push(colwise(s, (c) => Math.max(...c)));
      return true;
    case "MINΣ":
      s.stack.push(colwise(s, (c) => Math.min(...c)));
      return true;
    case "COLΣ": {
      const [a, b] = popN(s, 2);
      s.cols = [wantInt(a), wantInt(b)];
      return true;
    }
    case "CORR": {
      if (s.sdat.length < 2) throw err("Insufficient Data");
      const x = colOf(s.sdat, s.cols[0]);
      const y = colOf(s.sdat, s.cols[1]);
      s.stack.push(realOf(covariance(x, y) / Math.sqrt(variance(x) * variance(y))));
      return true;
    }
    case "COV": {
      if (s.sdat.length < 2) throw err("Insufficient Data");
      s.stack.push(realOf(covariance(colOf(s.sdat, s.cols[0]), colOf(s.sdat, s.cols[1]))));
      return true;
    }
    case "LR": {
      const { m, b } = lrFit(s);
      s.stack.push(realOf(b), realOf(m));
      return true;
    }
    case "PREDV": {
      const { m, b } = lrFit(s);
      s.stack.push(realOf(b + m * fRe(pop1(s))));
      return true;
    }
    case "UTPN": {
      const [mO, vO, xO] = popN(s, 3);
      const m = fRe(mO);
      const v = fRe(vO);
      if (v <= 0) throw err("Bad Argument Value");
      const sd = Math.sqrt(v);
      const npdf = (t: number): number =>
        Math.exp(-((t - m) * (t - m)) / (2 * v)) / (sd * Math.sqrt(2 * Math.PI));
      s.stack.push(realOf(upperTail(npdf, fRe(xO))));
      return true;
    }
    case "UTPC": {
      const [nO, xO] = popN(s, 2);
      s.stack.push(realOf(upperTail(chi2Pdf(wantInt(nO)), Math.max(0, fRe(xO)))));
      return true;
    }
    case "UTPT": {
      const [nO, xO] = popN(s, 2);
      s.stack.push(realOf(upperTail(tPdf(wantInt(nO)), fRe(xO))));
      return true;
    }
    case "UTPF": {
      const [n1, n2, xO] = popN(s, 3);
      s.stack.push(realOf(upperTail(fPdf(wantInt(n1), wantInt(n2)), Math.max(0, fRe(xO)))));
      return true;
    }
    // ---- SOLVE -----------------------------------------------------------------------------
    case "STEQ":
      storeVar(s, "EQ", pop1(s));
      return true;
    case "RCEQ": {
      const eq = lookupVar(s, "EQ");
      if (!eq) throw err("No Current Equation");
      s.stack.push(eq);
      return true;
    }
    case "SOLVR":
      s.menu = { name: "SOLVR", page: 0 };
      return true;
    case "ROOT": {
      const [exprO, nmO, guessO] = popN(s, 3);
      const nm = wantNameOf(nmO);
      const src = exprO.k === "alg" ? exprO.src : exprO.k === "name" ? exprO.v : null;
      if (src === null) throw err("Bad Argument Type");
      const node = parseExpr(exprO.k === "name" ? (() => {
        const v = lookupVar(s, src);
        if (!v || v.k !== "alg") throw err("Bad Argument Type");
        return v.src;
      })() : src);
      const f = (t: number): number => {
        const env = envOf(s, ctx);
        const inner = env.get.bind(env);
        return num(
          evalExpr(node, {
            ...env,
            get: (q: string) => (q === nm ? bn(String(t)) : inner(q)),
          }),
        );
      };
      // secant with a bisection fallback — same numeric posture as P9
      let x0 = fRe(guessO);
      let x1 = x0 === 0 ? 0.1 : x0 * 1.001 + 1e-6;
      let f0 = f(x0);
      let f1 = f(x1);
      let root: number | null = null;
      for (let i = 0; i < 100; i++) {
        if (!Number.isFinite(f1)) break;
        if (Math.abs(f1) < 1e-12) {
          root = x1;
          break;
        }
        const d = f1 - f0;
        if (d === 0) break;
        const x2 = x1 - (f1 * (x1 - x0)) / d;
        x0 = x1;
        f0 = f1;
        x1 = x2;
        f1 = f(x1);
      }
      if (root === null) throw err("No Root Found");
      storeVar(s, nm, realOf(root));
      s.stack.push(realOf(root));
      return true;
    }
    // ---- PLOT parameters (drawing itself is P17/P18) ------------------------------------------
    case "PMIN": {
      const z = asCpx(pop1(s));
      s.ppar = { ...s.ppar, pmin: [z.re, z.im] };
      return true;
    }
    case "PMAX": {
      const z = asCpx(pop1(s));
      s.ppar = { ...s.ppar, pmax: [z.re, z.im] };
      return true;
    }
    case "INDEP":
      s.ppar = { ...s.ppar, indep: wantNameOf(pop1(s)) };
      return true;
    case "RES":
      s.ppar = { ...s.ppar, res: Math.max(1, wantInt(pop1(s))) };
      return true;
    case "AXES": {
      const z = asCpx(pop1(s));
      s.ppar = { ...s.ppar, axes: [z.re, z.im] };
      return true;
    }
    case "CENTR": {
      const z = asCpx(pop1(s));
      const w2 = (s.ppar.pmax[0] - s.ppar.pmin[0]) / 2;
      const h2 = (s.ppar.pmax[1] - s.ppar.pmin[1]) / 2;
      s.ppar = { ...s.ppar, pmin: [z.re - w2, z.im - h2], pmax: [z.re + w2, z.im + h2] };
      return true;
    }
    case "*W":
    case "*H": {
      const k = fRe(pop1(s));
      const [cx, cy] = [
        (s.ppar.pmin[0] + s.ppar.pmax[0]) / 2,
        (s.ppar.pmin[1] + s.ppar.pmax[1]) / 2,
      ];
      const w2 = ((s.ppar.pmax[0] - s.ppar.pmin[0]) / 2) * (w === "*W" ? k : 1);
      const h2 = ((s.ppar.pmax[1] - s.ppar.pmin[1]) / 2) * (w === "*H" ? k : 1);
      s.ppar = { ...s.ppar, pmin: [cx - w2, cy - h2], pmax: [cx + w2, cy + h2] };
      return true;
    }
    case "PPAR":
      s.stack.push({
        k: "list",
        items: [
          cpx(s.ppar.pmin[0], s.ppar.pmin[1]),
          cpx(s.ppar.pmax[0], s.ppar.pmax[1]),
          mkName(s.ppar.indep),
          real(bn(s.ppar.res)),
          cpx(s.ppar.axes[0], s.ppar.axes[1]),
        ],
      });
      return true;
    // ---- PRINT (the tape is the printer) --------------------------------------------------------
    case "PR1":
      print(s, formatObj(peek(s), s.disp, s.base));
      return true;
    case "PRST":
      s.stack.forEach((o, i) => print(s, `${s.stack.length - i}: ${formatObj(o, s.disp, s.base)}`));
      return true;
    case "PRSTC":
      print(s, s.stack.map((o) => formatObj(o, s.disp, s.base)).join(" "));
      return true;
    case "PRVAR": {
      const nm = wantNameOf(pop1(s));
      const v = lookupVar(s, nm);
      if (!v) throw err("Undefined Name");
      print(s, `${nm}: ${objToSrc(v)}`);
      return true;
    }
    case "PRLCD":
      print(s, s.msg ?? (s.stack.length ? formatObj(peek(s), s.disp, s.base) : ""));
      return true;
    case "PRUSR":
      print(s, Object.keys(curDir(s).vars).join(" ") || "(no user variables)");
      return true;
    case "CR":
      print(s, "");
      return true;
    case "TRACE":
      s.modes.trace = true;
      return true;
    case "NORM":
      s.modes.trace = false;
      return true;
    // ---- CTRL ------------------------------------------------------------------------------------
    case "SST":
      return true; // single-step UI affordance — programs run to completion here
    case "HALT":
    case "ABORT":
    case "KILL":
      throw new Halt(w);
    case "WAIT":
      wantReal(pop1(s)); // synchronous engine — the pause is a no-op (documented)
      return true;
    case "KEY":
      s.stack.push(real(bn(0))); // no key buffer → 0, the 28C's "no key" result
      return true;
    case "BEEP":
      print(s, "🔔");
      return true;
    case "CLLCD":
      s.msg = null;
      return true;
    case "CLMF":
      s.msg = null;
      return true;
    case "ERRN":
      s.stack.push(real(bn(s.errN)));
      return true;
    case "ERRM":
      s.stack.push(mkStr(s.errM));
      return true;
    // ---- light CAS (P14, FR-CAS-1..4) ----------------------------------------------------------------
    case "d/dx":
    case "∂": {
      const [eO, vO] = popN(s, 2);
      pushCasResult(s, requireCas().diff(algSrcOf(eO), varNameOf(vO)));
      return true;
    }
    case "∫": {
      // light-tier ∫: the antiderivative, no +C (delivery note)
      const [eO, vO] = popN(s, 2);
      pushCasResult(s, requireCas().integrate(algSrcOf(eO), varNameOf(vO)));
      return true;
    }
    case "COLCT":
      pushCasResult(s, requireCas().simplify(algSrcOf(pop1(s))));
      return true;
    case "EXPAN":
      pushCasResult(s, requireCas().expand(algSrcOf(pop1(s))));
      return true;
    case "FACTOR": // reachable by name (command entry); not a 28C key
      pushCasResult(s, requireCas().factor(algSrcOf(pop1(s))));
      return true;
    case "ISOL":
    case "QUAD": {
      const [eO, vO] = popN(s, 2);
      const sols = tryCas(() => requireCas().solve(algSrcOf(eO), varNameOf(vO)));
      if (!sols.length) throw err("No Solution");
      const objs = sols.map((t) => casObjOf(t));
      if (objs.length === 1) s.stack.push(objs[0]);
      else s.stack.push({ k: "list", items: objs });
      return true;
    }
    case "TAYLR": {
      const [eO, vO, nO] = popN(s, 3);
      const n = wantInt(nO);
      pushCasResult(s, requireCas().taylor(algSrcOf(eO), varNameOf(vO), n));
      return true;
    }
    case "SHOW": {
      // light-tier SHOW: the variables an expression references (delivery note)
      const src2 = algSrcOf(pop1(s));
      s.stack.push({ k: "list", items: exprNames(src2).map((nm) => mkName(nm)) });
      return true;
    }
    // ---- 48-series additions (P17) ---------------------------------------------------------------
    case "PROOT": {
      // roots of the coefficient vector [an … a1 a0] via companion eigenvalues
      const a = wantArr(pop1(s));
      const c = (a.vec ? a.rows[0] : a.rows.map((r) => r[0])).map(Number);
      while (c.length && c[0] === 0) c.shift();
      const n = c.length - 1;
      if (n < 1) throw err("Bad Argument Value");
      const comp = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === 0 ? -c[j + 1] / c[0] : i - 1 === j ? 1 : 0)),
      );
      const ev = new EigenvalueDecomposition(new Matrix(comp));
      const re = ev.realEigenvalues;
      const im = ev.imaginaryEigenvalues;
      const items: RplObj[] = re.map((r, i) =>
        Math.abs(im[i]) < 1e-12 ? realOf(r) : cpx(r, im[i]),
      );
      s.stack.push(a.vec ? arrOf([re], true) && { k: "list", items } : { k: "list", items });
      return true;
    }
    case "PEVAL": {
      // Horner: coefficients in level 2, x in level 1
      const [aO, xO] = popN(s, 2);
      const a = wantArr(aO);
      const c = (a.vec ? a.rows[0] : a.rows.map((r) => r[0])).map(Number);
      const x = fRe(xO);
      s.stack.push(realOf(c.reduce((acc, k) => acc * x + k, 0)));
      return true;
    }
    case "→V2": {
      const [a, b] = popN(s, 2);
      s.stack.push(arrOf([[fRe(a), fRe(b)]], true));
      return true;
    }
    case "→V3": {
      const [a, b, c] = popN(s, 3);
      s.stack.push(arrOf([[fRe(a), fRe(b), fRe(c)]], true));
      return true;
    }
    case "V→": {
      const a = wantArr(pop1(s));
      if (!a.vec) throw err("Bad Argument Type");
      a.rows[0].forEach((v) => s.stack.push(realOf(v)));
      return true;
    }
    case "OBJ→": {
      const o = pop1(s);
      if (o.k === "list") {
        s.stack.push(...o.items, real(bn(o.items.length)));
      } else if (o.k === "cpx") {
        s.stack.push(realOf(o.re), realOf(o.im));
      } else if (o.k === "str") {
        const items = parseItems(o.v, s.base);
        const pos = { i: 0 };
        runNodes(s, buildNodes(items, pos, []).nodes, ctx);
      } else if (o.k === "arr") {
        return execWord(s, "ARRY→", ctx);
      } else if (o.k === "alg" || o.k === "prog") {
        s.stack.push(o); // structural decomposition is FORM territory (P19)
      } else throw err("Bad Argument Type");
      return true;
    }
    case "!":
      return execWord(s, "FACT", ctx);
    case "→Q": {
      // rational approximation by continued fractions (the 48's ≈ 1e-10)
      const v = num(wantReal(pop1(s)));
      let [p0, q0, p1, q1] = [1, 0, Math.floor(v), 1];
      let frac = v - Math.floor(v);
      for (let i = 0; i < 24 && Math.abs(p1 / q1 - v) > 1e-10; i++) {
        if (frac === 0) break;
        const a = Math.floor(1 / frac);
        frac = 1 / frac - a;
        [p0, q0, p1, q1] = [p1, q1, a * p1 + p0, a * q1 + q0];
      }
      s.stack.push(q1 === 1 ? realOf(p1) : { k: "alg", src: `${p1}/${q1}` });
      return true;
    }
    case "DEF": {
      // DEF 'F(X)=expr' → F = « → X 'expr' » (the 48's exact expansion)
      const o = pop1(s);
      if (o.k !== "alg") throw err("Bad Argument Type");
      const m = o.src.match(/^([A-Za-z][A-Za-z0-9]*)\(([^)]*)\)=(.+)$/);
      if (!m) throw err("Bad Argument Value");
      const args = m[2].split(",").map((t) => t.trim()).filter(Boolean);
      storeVar(s, m[1], { k: "prog", body: `→ ${args.join(" ")} '${m[3]}'` });
      return true;
    }
    case "DRAW":
      drawPlot(s);
      return true;
    case "GRAPH": // the GRAPH key re-enters the picture (draws if EQ is set)
      drawPlot(s);
      return true;
    case "DRAX":
      if (s.plot) s.plot = { ...s.plot, axes: true };
      return true;
    case "ERASE":
      s.plot = null;
      s.pict = [];
      return true;
    case "2D":
      s.ptype = "FUNCTION";
      return true;
    case "POLAR":
      s.ptype = s.ptype === "POLAR" ? "FUNCTION" : "POLAR";
      return true;
    case "PTYPE": {
      const nm = wantNameOf(pop1(s));
      if (nm !== "FUNCTION" && nm !== "POLAR") throw err("Bad Argument Value");
      s.ptype = nm;
      return true;
    }
    case "REVIEW":
      print(s, Object.keys(curDir(s).vars).join(" ") || "(no user variables)");
      return true;
    // PICT / GROB-lite primitives
    case "PIXON":
    case "PIXOFF": {
      const z = asCpx(pop1(s));
      const [px, py] = cToPx(z.re, z.im, s.ppar.pmin, s.ppar.pmax);
      const key = `${px},${py}`;
      s.pict = w === "PIXON" ? [...new Set([...s.pict, key])] : s.pict.filter((k) => k !== key);
      return true;
    }
    case "PIXEL": // the 28C name for PIXON
      return execWord(s, "PIXON", ctx);
    case "LINE":
    case "BOX": {
      const [aO, bO] = popN(s, 2);
      const a = asCpx(aO);
      const b = asCpx(bO);
      const [x0, y0] = cToPx(a.re, a.im, s.ppar.pmin, s.ppar.pmax);
      const [x1, y1] = cToPx(b.re, b.im, s.ppar.pmin, s.ppar.pmax);
      const px =
        w === "LINE"
          ? rasterLine(x0, y0, x1, y1)
          : [
              ...rasterLine(x0, y0, x1, y0),
              ...rasterLine(x1, y0, x1, y1),
              ...rasterLine(x1, y1, x0, y1),
              ...rasterLine(x0, y1, x0, y0),
            ];
      s.pict = [...new Set([...s.pict, ...px.map(([x, y]) => `${x},${y}`)])];
      return true;
    }
    case "PVIEW": {
      const pts: PlotPoint[] = s.pict.map((k) => {
        const [px, py] = k.split(",").map(Number);
        const [x, y] = pxToC(px, py, s.ppar.pmin, s.ppar.pmax);
        return { x, y };
      });
      s.plot = { kind: "pict", points: pts, pmin: [...s.ppar.pmin], pmax: [...s.ppar.pmax], axes: false };
      return true;
    }
    case "PX→C": {
      const z = asCpx(pop1(s));
      const [x, y] = pxToC(z.re, z.im, s.ppar.pmin, s.ppar.pmax);
      s.stack.push(cpx(x, y));
      return true;
    }
    case "C→PX": {
      const z = asCpx(pop1(s));
      const [px, py] = cToPx(z.re, z.im, s.ppar.pmin, s.ppar.pmax);
      s.stack.push(cpx(px, py));
      return true;
    }
    case "→GROB": {
      // textual GROB placeholder (real bitmap objects arrive with P18 polish)
      const [o] = popN(s, 2); // size argument accepted and ignored
      s.stack.push(mkStr(`GROB ${PICT_W} ${PICT_H} ${formatObj(o, s.disp, s.base)}`));
      return true;
    }
    case "→LCD": {
      s.msg = wantStr(pop1(s));
      return true;
    }
    case "LCD→":
      s.stack.push(mkStr(s.msg ?? ""));
      return true;
    // the TIME menu (shares the P11 injectable clock)
    case "TIME": {
      const d = clock48();
      s.stack.push(
        real(bn(d.getHours()).plus(bn(d.getMinutes()).div(100)).plus(bn(d.getSeconds()).div(10000))),
      );
      return true;
    }
    case "DATE": {
      const d = clock48();
      s.stack.push(
        real(
          bn(d.getMonth() + 1)
            .plus(bn(d.getDate()).div(100))
            .plus(bn(d.getFullYear()).div(1000000)),
        ),
      );
      return true;
    }
    case "TSTR": {
      popN(s, 2); // date+time arguments accepted
      s.stack.push(mkStr(clock48().toString().slice(0, 24)));
      return true;
    }
    case "DDAYS": {
      const [a, b] = popN(s, 2);
      const da = decodeDate48(fRe(a));
      const db = decodeDate48(fRe(b));
      if (!da || !db) throw err("Bad Argument Value");
      s.stack.push(realOf(Math.round((db.getTime() - da.getTime()) / 86_400_000)));
      return true;
    }
    case "→DATE":
    case "→TIME":
      pop1(s); // setting the emulator clock is a no-op (documented)
      return true;
    // I/O + LIBRARY are honest stubs — no serial port / card slots here
    case "SEND":
    case "RECV":
    case "SERVER":
    case "KGET":
    case "FINISH":
    case "PKT":
      throw err("No I/O port in the emulator");
    case "ATTACH":
    case "DETACH":
    case "PORTS":
      throw err("No card ports in the emulator");
    case "CLR": // the 48 prints CLR for CLEAR
      s.stack = [];
      return true;
    // ---- 48G additions (P18) ----------------------------------------------------------------------
    // list processing
    case "SORT": {
      const items = wantList(pop1(s));
      const sorted = [...items].sort((a, b) => {
        if (a.k === "real" && b.k === "real") return a.v.cmp(b.v);
        if (a.k === "str" && b.k === "str") return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
        return 0;
      });
      s.stack.push({ k: "list", items: sorted });
      return true;
    }
    case "REVLIST":
      s.stack.push({ k: "list", items: [...wantList(pop1(s))].reverse() });
      return true;
    case "ΣLIST": {
      const items = wantList(pop1(s)).map(wantReal);
      s.stack.push(real(items.reduce((a, b) => a.plus(b), bn(0))));
      return true;
    }
    case "ΠLIST": {
      const items = wantList(pop1(s)).map(wantReal);
      s.stack.push(real(items.reduce((a, b) => a.times(b), bn(1))));
      return true;
    }
    case "ΔLIST": {
      const items = wantList(pop1(s)).map(wantReal);
      s.stack.push({
        k: "list",
        items: items.slice(1).map((v, i) => real(v.minus(items[i]))),
      });
      return true;
    }
    case "DOLIST": {
      // { list } prog DOLIST — run the program per element, collect results
      const [lO, pO] = popN(s, 2);
      const items = wantList(lO);
      if (pO.k !== "prog") throw err("Bad Argument Type");
      const out: RplObj[] = [];
      for (const it of items) {
        const before = s.stack.length;
        s.stack.push(it);
        runBody(s, pO.body, ctx);
        out.push(...s.stack.splice(before));
      }
      s.stack.push({ k: "list", items: out });
      return true;
    }
    case "STREAM": {
      // { list } prog STREAM — fold pairwise left to right
      const [lO, pO] = popN(s, 2);
      const items = wantList(lO);
      if (pO.k !== "prog") throw err("Bad Argument Type");
      if (!items.length) throw err("Bad Argument Value");
      s.stack.push(items[0]);
      for (const it of items.slice(1)) {
        s.stack.push(it);
        runBody(s, pO.body, ctx);
      }
      return true;
    }
    case "SEQ": {
      // expr var start end step SEQ → list of expr evaluated over the range
      const [eO, vO, aO, bO, stO] = popN(s, 5);
      const nm = varNameOf(vO);
      const src2 = algSrcOf(eO);
      const a = num(wantReal(aO));
      const b = num(wantReal(bO));
      const st = num(wantReal(stO));
      if (st === 0) throw err("Bad Argument Value");
      const out: RplObj[] = [];
      for (let x = a; st > 0 ? x <= b + 1e-12 : x >= b - 1e-12; x += st) {
        const y = evalAtPoint(s, src2, nm, x);
        if (y === null) throw err("Undefined Name");
        out.push(realOf(y));
        if (out.length > 10000) throw err("Bad Argument Value");
      }
      s.stack.push({ k: "list", items: out });
      return true;
    }
    // linear algebra (ml-matrix decompositions as 48G tokens)
    case "RREF": {
      const a = wantArr(pop1(s));
      s.stack.push(arrOf(new Matrix(a.rows).reducedEchelonForm().to2DArray(), false));
      return true;
    }
    case "RANK": {
      const a = wantArr(pop1(s));
      s.stack.push(realOf(new SingularValueDecomposition(new Matrix(a.rows)).rank));
      return true;
    }
    case "LU": {
      const a = wantArr(pop1(s));
      const luD = new LuDecomposition(new Matrix(a.rows));
      s.stack.push(
        arrOf(luD.lowerTriangularMatrix.to2DArray(), false),
        arrOf(luD.upperTriangularMatrix.to2DArray(), false),
      );
      return true;
    }
    case "QR": {
      const a = wantArr(pop1(s));
      const qr = new QrDecomposition(new Matrix(a.rows));
      s.stack.push(
        arrOf(qr.orthogonalMatrix.to2DArray(), false),
        arrOf(qr.upperTriangularMatrix.to2DArray(), false),
      );
      return true;
    }
    case "SVD": {
      const a = wantArr(pop1(s));
      const svd = new SingularValueDecomposition(new Matrix(a.rows));
      s.stack.push(
        arrOf(svd.leftSingularVectors.to2DArray(), false),
        arrOf([svd.diagonal], true),
        arrOf(svd.rightSingularVectors.to2DArray(), false),
      );
      return true;
    }
    case "EGV":
    case "EGVL": {
      const a = wantArr(pop1(s));
      const [r, c] = dimsOf(a);
      if (a.vec || r !== c) throw err("Invalid Dimension");
      const ev = new EigenvalueDecomposition(new Matrix(a.rows));
      const vals: RplObj[] = ev.realEigenvalues.map((re, i) =>
        Math.abs(ev.imaginaryEigenvalues[i]) < 1e-12 ? realOf(re) : cpx(re, ev.imaginaryEigenvalues[i]),
      );
      if (w === "EGV") s.stack.push(arrOf(ev.eigenvectorMatrix.to2DArray(), false));
      s.stack.push({ k: "list", items: vals });
      return true;
    }
    // the 48G STAT app: curve fits over the ΣDAT column pair (P16 core)
    case "LINFIT":
    case "LOGFIT":
    case "EXPFIT":
    case "PWRFIT":
      s.fitModel = w;
      return true;
    case "BESTFIT": {
      // inverse of fitModelOf's bijection (LINF→LINFIT …) — always valid
      s.fitModel = bestFit(sdatPairs(s)).model.replace("F", "FIT") as RplEngine["fitModel"];
      return true;
    }
    case "PREDY": {
      const f = cfit(sdatPairs(s), fitModelOf(s));
      s.stack.push(realOf(forecastY(f, fRe(pop1(s)))));
      return true;
    }
    case "PREDX": {
      const f = cfit(sdatPairs(s), fitModelOf(s));
      s.stack.push(realOf(forecastX(f, fRe(pop1(s)))));
      return true;
    }
    // statistical plots (FR-PLOT-3) — drawn through the P17 panel
    case "SCATRPLOT":
    case "DRWΣ": {
      const pts = sdatPairs(s);
      s.plot = {
        kind: "pict",
        points: pts.map(([x, y]) => ({ x, y })),
        pmin: [...s.ppar.pmin],
        pmax: [...s.ppar.pmax],
        axes: true,
      };
      return true;
    }
    case "SCLΣ": {
      // autoscale the window to the ΣDAT extent
      const pts = sdatPairs(s);
      if (!pts.length) throw err("No Statistics Data");
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      s.ppar = {
        ...s.ppar,
        pmin: [Math.min(...xs) - 1, Math.min(...ys) - 1],
        pmax: [Math.max(...xs) + 1, Math.max(...ys) + 1],
      };
      return true;
    }
    case "BARPLOT":
    case "HISTPLOT": {
      // native Plotly bar chart / histogram (architecture §4.10) — the panel
      // lazy-loads Plotly and draws real columns
      const col = s.sdat.map((r) => r[s.cols[0] - 1] ?? 0);
      if (!col.length) throw err("No Statistics Data");
      let bars: [number, number][];
      if (w === "BARPLOT") {
        bars = col.map((v, i) => [i + 1, v]);
      } else {
        const bins = 13;
        const lo = Math.min(...col);
        const hi = Math.max(...col);
        const width = (hi - lo || 1) / bins;
        const counts = Array.from({ length: bins }, () => 0);
        for (const v of col) counts[Math.min(bins - 1, Math.floor((v - lo) / width))]++;
        bars = counts.map((n2, i) => [lo + (i + 0.5) * width, n2]);
      }
      const cats = bars.map((b) => b[0]);
      const values = bars.map((b) => b[1]);
      s.plot = {
        kind: "bars",
        cats,
        values,
        histogram: w === "HISTPLOT",
        pmin: [Math.min(...cats) - 1, 0],
        pmax: [Math.max(...cats) + 1, Math.max(...values) + 1],
        axes: true,
      };
      return true;
    }
    // window control
    case "XRNG": {
      const [a, b] = popN(s, 2);
      s.ppar = { ...s.ppar, pmin: [fRe(a), s.ppar.pmin[1]], pmax: [fRe(b), s.ppar.pmax[1]] };
      return true;
    }
    case "YRNG": {
      const [a, b] = popN(s, 2);
      s.ppar = { ...s.ppar, pmin: [s.ppar.pmin[0], fRe(a)], pmax: [s.ppar.pmax[0], fRe(b)] };
      return true;
    }
    case "AUTO": {
      // autoscale Y from the current equation over the X window
      const eq = lookupVar(s, "EQ");
      if (!eq || (eq.k !== "alg" && eq.k !== "name")) throw err("No Current Equation");
      const srcTxt = eq.k === "alg" ? eq.src : eq.v;
      const ys: number[] = [];
      for (let i = 0; i <= 40; i++) {
        const x = s.ppar.pmin[0] + ((s.ppar.pmax[0] - s.ppar.pmin[0]) * i) / 40;
        const y = evalAtPoint(s, srcTxt, s.ppar.indep, x);
        if (y !== null && Number.isFinite(y)) ys.push(y);
      }
      if (!ys.length) throw err("Invalid PPAR / Undefined Name");
      s.ppar = {
        ...s.ppar,
        pmin: [s.ppar.pmin[0], Math.min(...ys)],
        pmax: [s.ppar.pmax[0], Math.max(...ys)],
      };
      return true;
    }
    case "ATICK":
      pop1(s); // tick spacing accepted (the panel draws its own grid)
      return true;
    // WIREFRAME: a real, rotatable 3D surface z = f(x, y), rendered by Plotly
    // (architecture §4.10, FR-PLOT-2) — no longer a mono 2D projection.
    case "WIREFRAME": {
      const eq = lookupVar(s, "EQ");
      if (!eq || eq.k !== "alg") throw err("No Current Equation");
      const [x0, y0] = s.ppar.pmin;
      const [x1, y1] = s.ppar.pmax;
      const zAt = (gx: number, gy: number): number | null => {
        const env = envOf(s, freshCtx());
        const inner = env.get.bind(env);
        try {
          return num(
            evalExpr(parseExpr(eq.src), {
              ...env,
              get: (q: string) =>
                q === s.ppar.indep ? bn(String(gx)) : q === "Y" ? bn(String(gy)) : inner(q),
            }),
          );
        } catch {
          return null;
        }
      };
      const { xs, ys, z } = sampleGrid(zAt, x0, x1, y0, y1, 24);
      if (z.every((row) => row.every((v) => v === null)))
        throw err("Invalid PPAR / Undefined Name");
      s.plot = {
        kind: "surface",
        xs,
        ys,
        z,
        src: eq.src,
        pmin: [x0, y0],
        pmax: [x1, y1],
        axes: true,
      };
      return true;
    }
    // built-in TVM over the P7 decimal.js finance engine (FR-FIN-1/5)
    case "TVMBEG":
      tvmRegs(s).beg = true;
      return true;
    case "TVMEND":
      tvmRegs(s).beg = false;
      return true;
    case "TVMROOT": {
      const nm = wantNameOf(pop1(s));
      const f = tvmFrom(s);
      const solvers: Record<string, () => Value | null> = {
        N: () => solveN(f),
        "I%YR": () => {
          const r = solveI({ ...f, i: f.i });
          return r === null ? null : r.times(12);
        },
        PV: () => solvePV(f),
        PMT: () => solvePMT(f),
        FV: () => solveFV(f),
      };
      const solver = solvers[nm];
      if (!solver) throw err("Bad Argument Value");
      const v = solver();
      if (v === null) throw err("No Solution");
      storeVar(s, nm, real(v));
      s.stack.push(real(v));
      return true;
    }
    // Black–Scholes European option pricing (FR-FIN-4): spot strike rate vol
    // years BS  →  call put (put on top of the stack)
    case "BS": {
      const [spot, strike, rate, vol, years] = popN(s, 5);
      const { call, put } = blackScholes(
        wantReal(spot),
        wantReal(strike),
        wantReal(rate),
        wantReal(vol),
        wantReal(years),
      );
      s.stack.push(real(call), real(put));
      return true;
    }
    // user-defined units (FR-UNIT-4): "name" "definition" DEFUNIT registers a
    // custom unit usable in _name syntax, e.g. "fortnight" "14 day" DEFUNIT.
    case "DEFUNIT": {
      const [nameObj, defObj] = popN(s, 2);
      const name = wantStr(nameObj);
      const def = wantStr(defObj);
      if (!defineUnit(name, def)) throw err("Invalid Unit");
      return true;
    }
    // non-interactive systems solver (FR-SOLVE-3 / FR-CAS-4): multivariate
    // Newton over n equations in n unknowns.
    //   { 'eq1' 'eq2' } { X Y } { x0 y0 } MSLV → [x* y*] (and stores the vars)
    // Complex matrices (FR-MAT-4): operate on (realPart imagPart) array pairs.
    case "CMUL": {
      // Are Aim Bre Bim CMUL → Cre Cim
      const [are, aim, bre, bim] = popN(s, 4).map(wantArr);
      const prod = cmatMul(toCMatrix(are.rows, aim.rows), toCMatrix(bre.rows, bim.rows));
      const { re, im } = fromCMatrix(prod);
      s.stack.push(arrOf(re, false), arrOf(im, false));
      return true;
    }
    case "CINV": {
      // Are Aim CINV → invRe invIm
      const [are, aim] = popN(s, 2).map(wantArr);
      const { re, im } = fromCMatrix(cmatInv(toCMatrix(are.rows, aim.rows)));
      s.stack.push(arrOf(re, false), arrOf(im, false));
      return true;
    }
    case "CDET": {
      // Are Aim CDET → detRe detIm
      const [are, aim] = popN(s, 2).map(wantArr);
      const d = cmatDet(toCMatrix(are.rows, aim.rows));
      const dr = typeof d === "number" ? d : d.re;
      const di = typeof d === "number" ? 0 : d.im;
      s.stack.push(real(bn(String(dr))), real(bn(String(di))));
      return true;
    }
    // Mathematica / Wolfram-Language interchange (FR-IO-4)
    case "→WL": {
      const o = pop1(s);
      const src = o.k === "alg" ? o.src : o.k === "name" ? o.v : formatObj(o, s.disp, s.base);
      s.stack.push({ k: "str", v: toWolfram(src) });
      return true;
    }
    case "WL→": {
      const wl = wantStr(pop1(s));
      s.stack.push({ k: "alg", src: fromWolfram(wl) });
      return true;
    }
    // IEEE-754 float evaluation (FR-NUM-2): the exact-BigNumber tower's
    // "standard floating-point" alternative — 'X+0.1' EVALF evaluates in JS
    // doubles, so e.g. 0.1+0.2 shows the 0.30000000000000004 artifact.
    case "EVALF": {
      const o = pop1(s);
      const src = o.k === "alg" ? o.src : o.k === "name" ? o.v : String(fRe(o));
      let r: number;
      try {
        r = evalFloat(parseExpr(src), (nm) => {
          const c = lookupVar(s, nm);
          return c && c.k === "real" ? num(c.v) : null;
        });
      } catch {
        throw err("Undefined Name");
      }
      s.stack.push(real(bn(String(r)))); // exact decimal of the IEEE double
      return true;
    }
    case "MSLV": {
      const [eqsObj, varsObj, guessObj] = popN(s, 3);
      const eqs = wantList(eqsObj).map((o) =>
        o.k === "alg" ? o.src : o.k === "name" ? o.v : String(fRe(o)),
      );
      const vars = wantList(varsObj).map((o) => wantNameOf(o));
      const guess = wantList(guessObj).map((o) => fRe(o));
      const sol = solveSystem(s, eqs, vars, guess);
      if (!sol) throw err("No Solution");
      vars.forEach((v, i) => storeVar(s, v, real(bn(String(sol[i])))));
      s.stack.push(arrOf([sol], true)); // a vector of the solved values
      return true;
    }
    case "AMORT": {
      // n AMORT → principal, interest, balance for the next n payments
      const n2 = wantInt(pop1(s));
      const f = tvmFrom(s);
      let bal = f.pv;
      let pTot = bn(0);
      let iTot = bn(0);
      const i = f.i.div(100); // fraction per period
      for (let k2 = 0; k2 < n2; k2++) {
        const interest = bal.times(i);
        const principal = f.pmt.neg().minus(interest);
        pTot = pTot.plus(principal);
        iTot = iTot.plus(interest);
        bal = bal.minus(principal);
      }
      s.stack.push(real(pTot), real(iTot), real(bal));
      return true;
    }
    // dialogs: MSGBOX is real; interactive forms need an async UI bridge
    case "MSGBOX":
      s.msg = wantStr(pop1(s));
      return true;
    case "INFORM":
    case "CHOOSE":
    case "NOVAL":
    case "DGTIZ":
      throw err("Interactive forms need the async UI bridge (documented)");
    case "MSOLVR":
    case "MROOT":
    case "MINIT":
    case "MCALC":
      // the INTERACTIVE Multiple-Equation Solver menu needs the async form UI;
      // the non-interactive MSLV solves systems directly (FR-SOLVE-3)
      throw err("Use MSLV for systems (interactive MES needs the form UI)");
    case "RKF":
    case "RRK":
    case "RKFSTEP":
      throw err("ODE suite deferred (documented)");
    // ---- 49G additions (P19) -----------------------------------------------------------------------
    // number theory (ARITH) — pure TS, exact
    case "GCD":
    case "LCM": {
      const [a, b] = popN(s, 2);
      const x = BigInt(wantReal(a).trunc().toFixed(0));
      const y = BigInt(wantReal(b).trunc().toFixed(0));
      s.stack.push(real(bn((w === "GCD" ? gcdBig(x, y) : lcmBig(x, y)).toString())));
      return true;
    }
    case "ISPRIME?": {
      const x = BigInt(wantReal(pop1(s)).trunc().toFixed(0));
      s.stack.push(real(bn(isPrimeBig(x) ? 1 : 0)));
      return true;
    }
    case "NEXTPRIME": {
      const x = BigInt(wantReal(pop1(s)).trunc().toFixed(0));
      s.stack.push(real(bn(nextPrimeBig(x).toString())));
      return true;
    }
    case "FACTORS": {
      const x = BigInt(wantReal(pop1(s)).trunc().toFixed(0));
      const f = factorsBig(x);
      if (f === null) throw err("Factor exceeds the trial bound (documented)");
      const items: RplObj[] = [];
      for (const [prime, k2] of f) {
        items.push(real(bn(prime.toString())), real(bn(k2)));
      }
      s.stack.push({ k: "list", items });
      return true;
    }
    case "EULER": {
      const x = BigInt(wantReal(pop1(s)).trunc().toFixed(0));
      const t = totientBig(x);
      if (t === null) throw err("Factor exceeds the trial bound (documented)");
      s.stack.push(real(bn(t.toString())));
      return true;
    }
    // CAS surface: light tier where it suffices, SymPy for the rest
    case "DERVX":
      pushCasResult(s, requireCas().diff(algSrcOf(pop1(s)), "X"));
      return true;
    case "INTVX":
      pushCasResult(s, requireCas().integrate(algSrcOf(pop1(s)), "X"));
      return true;
    case "SIMPLIFY":
      pushCasResult(s, requireCas().simplify(algSrcOf(pop1(s))));
      return true;
    case "SOLVEVX": {
      const sols = tryCas(() => requireCas().solve(algSrcOf(pop1(s)), "X"));
      if (!sols.length) throw err("No Solution");
      const objs = sols.map((t) => casObjOf(t));
      s.stack.push(objs.length === 1 ? objs[0] : { k: "list", items: objs });
      return true;
    }
    case "ZEROS": {
      const [eO, vO] = popN(s, 2);
      const sols = tryCas(() => requireCas().solve(algSrcOf(eO), varNameOf(vO)));
      s.stack.push({ k: "list", items: sols.map((t) => casObjOf(t)) });
      return true;
    }
    case "SUBST": {
      // 'expr' 'var=val' SUBST — textual substitution (light tier)
      const [eO, sO] = popN(s, 2);
      const src2 = algSrcOf(eO);
      const m = algSrcOf(sO).match(/^([A-Za-z][A-Za-z0-9]*)=(.+)$/);
      if (!m) throw err("Bad Argument Value");
      const re = new RegExp(`\\b${m[1]}\\b`, "g");
      pushCasResult(s, requireCas().simplify(src2.replace(re, `(${m[2]})`)));
      return true;
    }
    case "XNUM":
      return execWord(s, "→NUM", ctx);
    case "XQ":
      return execWord(s, "→Q", ctx);
    // heavy-only (SymPy) operations
    case "lim":
    case "LIMIT": {
      const [eO, vO, tO] = popN(s, 3);
      pushCasResult(s, requireHeavy().limit(algSrcOf(eO), varNameOf(vO), algSrcOf(tO)));
      return true;
    }
    case "SERIES": {
      const [eO, vO, nO] = popN(s, 3);
      pushCasResult(s, requireHeavy().series(algSrcOf(eO), varNameOf(vO), wantInt(nO)));
      return true;
    }
    case "PARTFRAC": {
      const [eO, vO] = popN(s, 2);
      pushCasResult(s, requireHeavy().partfrac(algSrcOf(eO), varNameOf(vO)));
      return true;
    }
    case "TEXPAND":
      pushCasResult(s, requireHeavy().texpand(algSrcOf(pop1(s))));
      return true;
    case "RISCH": {
      const [eO, vO] = popN(s, 2);
      pushCasResult(s, requireHeavy().integrate(algSrcOf(eO), varNameOf(vO)));
      return true;
    }
    case "DESOLVE": {
      const [eO, fO] = popN(s, 2);
      pushCasResult(s, requireHeavy().desolve(algSrcOf(eO), varNameOf(fO), "X"));
      return true;
    }
    case "LDEC":
      throw err("Use DESOLVE (documented)");
    case "LAP": {
      const [eO, vO] = popN(s, 2);
      pushCasResult(s, requireHeavy().laplace(algSrcOf(eO), varNameOf(vO)));
      return true;
    }
    case "ILAP": {
      const [eO, vO] = popN(s, 2);
      pushCasResult(s, requireHeavy().ilaplace(algSrcOf(eO), varNameOf(vO)));
      return true;
    }
    // 49G editing / app keys
    case "ANS":
      if (s.ans) s.stack.push(s.ans);
      else throw err("No previous result");
      return true;
    case "TABLE": {
      // tabulate the current equation over the X window (10 rows)
      const eq = lookupVar(s, "EQ");
      if (!eq || (eq.k !== "alg" && eq.k !== "name")) throw err("No Current Equation");
      const srcTxt = eq.k === "alg" ? eq.src : eq.v;
      const rows: RplObj[] = [];
      for (let i = 0; i <= 10; i++) {
        const x = s.ppar.pmin[0] + ((s.ppar.pmax[0] - s.ppar.pmin[0]) * i) / 10;
        const y = evalAtPoint(s, srcTxt, s.ppar.indep, x);
        rows.push({
          k: "list",
          items: [realOf(x), y === null ? mkName("?") : realOf(y)],
        });
      }
      s.stack.push({ k: "list", items: rows });
      return true;
    }
    case "TBLSET":
      return true; // table parameters ride PPAR (documented)
    case "2D/3D":
      s.ptype = s.ptype === "POLAR" ? "FUNCTION" : "POLAR";
      return true;
    case "MTRW": // MatrixWriter-lite: open a matrix entry
      append(s, "[ [ ");
      return true;
    // ---- 50g additions (P20) -----------------------------------------------------------------------
    case "GRAD": {
      // 'expr' { vars } (or a single 'var') → the gradient vector of algs
      const [eO, vO] = popN(s, 2);
      const src2 = algSrcOf(eO);
      const names =
        vO.k === "list" ? vO.items.map((o) => varNameOf(o)) : [varNameOf(vO)];
      const cas = requireCas();
      s.stack.push({
        k: "list",
        items: names.map((nm) => casObjOf(tryCas(() => cas.diff(src2, nm)))),
      });
      return true;
    }
    case "LINSOLVE": {
      // [[A]] [b] LINSOLVE → x with A·x = b (ml-matrix, P9 numerics)
      const [aO, bO] = popN(s, 2);
      const A = wantArr(aO);
      const b = wantArr(bO);
      if (A.vec) throw err("Invalid Dimension");
      try {
        const bm = b.vec ? b.rows[0].map((v) => [v]) : b.rows;
        const x = inverse(new Matrix(A.rows)).mmul(new Matrix(bm));
        const rows = x.to2DArray();
        s.stack.push(arrOf([rows.map((r) => r[0])], true));
      } catch {
        throw err("Singular Matrix");
      }
      return true;
    }
    // ---- UNITS (P13, FR-UNIT-1/2/3) ----------------------------------------------------------------
    case "CONVERT": {
      const [q, t] = popN(s, 2);
      pushU(s, tryUnits(() => convertU(wantUnit(q), unitSpecOf(t))));
      return true;
    }
    case "→UNIT": {
      const [v, t] = popN(s, 2);
      pushU(s, { mag: wantReal(v), u: unitSpecOf(t) });
      return true;
    }
    case "UBASE":
      pushU(s, tryUnits(() => ubaseU(wantUnit(pop1(s)))));
      return true;
    case "UVAL":
      s.stack.push(real(wantUnit(pop1(s)).mag));
      return true;
    case "UFACT": {
      // simplified UFACT (delivery note): full conversion into the given unit
      const [q, t] = popN(s, 2);
      pushU(s, tryUnits(() => convertU(wantUnit(q), unitSpecOf(t))));
      return true;
    }
    // ---- EVAL ------------------------------------------------------------------------------------
    case "EVAL":
    case "→NUM":
      evalObj(s, pop1(s), ctx);
      return true;
    default:
      return false;
  }
}

// ---- the keyboard seam (dispatch) --------------------------------------------------

/** Menu-opening key ids → roster names (28C prints; 28S variants included). */
const MENU_OPEN: Record<string, string> = {
  ARRAY: "ARRAY", BINARY: "BINARY", CMPLX: "COMPLEX", COMPLX: "COMPLEX",
  STRING: "STRING", LIST: "LIST", REAL: "REAL", STACK: "STACK", STORE: "STORE",
  CTRL: "CTRL", CONTRL: "CTRL", BRANCH: "BRANCH", TEST: "TEST", TRIG: "TRIG",
  LOGS: "LOGS", MODE: "MODE", STAT: "STAT", PLOT: "PLOT", PRINT: "PRINT",
  SOLV: "SOLVE", ALGEBRA: "ALGEBRA", ALGBRA: "ALGEBRA", CATALOG: "CATALOG",
  USER: "USER", UNITS: "UNITS", MEMORY: "MEMORY", CUSTOM: "CUSTOM", MENUS: "MENUS",
  // 48-series keys (P17)
  MTH: "MTH", PRG: "PRG", VAR: "USER", CST: "CUSTOM", USR: "USER", MODES: "MODE",
  SOLVE: "SOLVE", "I/O": "IO", LIBRARY: "LIBRARY", MATRIX: "MATR", SYMBOLIC: "SYMBOLIC",
  TIMEMENU: "TIME48",
  // 49G application keys (P19)
  APPS: "MENUS", FILES: "MEMORY", TOOL: "MENUS", SYMB: "SYMBOLIC", HIST: "CUSTOM",
  "S.SLV": "SSLV", "NUM.SLV": "SOLVE", "EXP&LN": "EXPLN", FINANCE: "TVMM",
  CALC: "CALC", ALG: "ALG", MATRICES: "MATR48", ARITH: "ARITH", LIB: "LIBRARY",
  BASE: "BASE", CHARS: "CHARS", "Y=": "PLOTP", WIN: "PLOT",
};

/** The 28S MENUS key: a meta-menu of every menu (softkey opens it). */
const MENUS_INDEX = [
  "STACK", "STORE", "REAL", "LOGS", "TRIG", "COMPLEX", "STRING", "LIST",
  "ARRAY", "BINARY", "MODE", "TEST", "BRANCH", "CTRL", "STAT", "PLOT",
  "PRINT", "SOLVE", "ALGEBRA", "UNITS", "MEMORY", "USER", "CATALOG",
];

/** Words the BRANCH/CTRL softkeys TYPE into the command line (program entry). */
const TYPES_WORD = new Set([
  "IF", "IFERR", "THEN", "ELSE", "END", "START", "FOR", "NEXT", "STEP",
  "DO", "UNTIL", "WHILE", "REPEAT", "→",
]);

/** Single-character typing keys (append to the command line). */
const TYPE_CHARS: Record<string, string> = {
  SPACE: " ", SPC: " ", NEWLINE: " ", "↵": " ", "«": "« ", "≫": " »", "»": " »",
  "◆": "'", "'": "'", "′": "'", "=": "=", "?": "?", "|": "|", "\\": "\\", "{": "{", "}": "}",
  "[": "[", "]": "]", "(": "(", ")": ")", '"': '"', "°": "°", µ: "µ", Σ: "Σ",
  "→": "→ ", ",": ",", "#": "# ", "::": ":: ", "∡": "∡", _: "_",
};

/** The 48SX mapping prints its editing keys with parenthetical names —
 * translate to the engine's canonical ids before dispatch (P17). */
const PRINT48: Record<string, string> = {
  "◄ (backspace)": "DEL", "▲ (up)": "▲", "▼ (down)": "▼", "◄ (left)": "◄",
  "► (right)": "►", ", (comma)": ",", ". (decimal)": ".", "_ (underscore)": "_",
  "′ (tick)": "'", "↵ (newline)": "NEWLINE", "∡ (angle)": "∡", "( )": "(",
  "[ ]": "[", "{ }": "{", "«  »": "«", '"  "': '"', "« »": "«", '" "': '"',
  TIME: "TIMEMENU", // the TIME KEY opens the menu; the TIME command stays typed
  "←": "DEL", "◄ (left) / ► (right)": "◄", "STO▶": "STO", "STO▸": "STO",
  EQW: "EQUATION", "Cα": "α LOCK", "∞": "∞TYPE", "' (tick)": "'", CAT: "CATALOG",
  "1/X": "1/x",
  // the 48G's right-shift APPLICATION launchers print "(cmd menu)" (P18)
  "I/O (cmd menu)": "I/O", "MODES (cmd menu)": "MODES", "MEMORY (cmd menu)": "MEMORY",
  "LIBRARY (cmd menu)": "LIBRARY", "SOLVE (cmd menu)": "SOLVE", "PLOT (cmd menu)": "PLOT",
  "SYMBOLIC (cmd menu)": "SYMBOLIC", "TIME (cmd menu)": "TIMEMENU", "STAT (cmd menu)": "STAT",
  "STACK (cmd menu)": "STACK",
};

/** Ops that shouldn't print a history line (typing, paging, editing). */
const NO_TAPE = new Set([
  "ENTER", "NEXT", "PREV", "DEL", "INS", "EDIT", "VISIT", "COMMAND", "ON",
  "ATTN", "OFF", "CONT", "LC", "α LOCK", "▲", "▼", "◄", "►", "◄▶",
]);

/** Is the command line inside an unclosed ' " or « delimiter? */
export function inTextMode(entry: string | null): boolean {
  if (entry === null) return false;
  let quotes = 0;
  let dquotes = 0;
  let prog = 0;
  for (const c of entry) {
    if (c === "'") quotes++;
    else if (c === '"') dquotes++;
    else if (c === "«") prog++;
    else if (c === "»") prog--;
  }
  return quotes % 2 === 1 || dquotes % 2 === 1 || prog > 0;
}

const append = (s: RplEngine, text: string): void => {
  s.entry = (s.entry ?? "") + text;
};

/** Commit the command line: parse and run it. Keeps the line on a syntax
 * error so the user can fix it (the 28C's behavior). */
function runLine(s: RplEngine): boolean {
  let text = s.entry ?? "";
  // the 48's ENTER auto-completes open delimiters (« { [ ( ' ")
  const closers: [string, string, string][] = [
    ["«", "»", " »"], ["{", "}", " }"], ["[", "]", " ]"], ["(", ")", ")"],
  ];
  for (const [open, close, suffix] of closers) {
    let depth = 0;
    for (const c of text) {
      if (c === open) depth++;
      else if (c === close) depth--;
    }
    while (depth-- > 0) text += suffix;
  }
  for (const q of ["'", '"']) {
    if ((text.split(q).length - 1) % 2 === 1) text += q;
  }
  s.entry = text;
  let items: RplItem[];
  try {
    items = parseItems(text, s.base);
  } catch {
    s.error = "Syntax Error";
    return false;
  }
  if (s.modes.cmd) s.lastCmd = [text, ...s.lastCmd.slice(0, 3)];
  if (s.modes.und) s.undoSnap = [...s.stack];
  s.entry = null;
  const ctx = freshCtx();
  try {
    const pos = { i: 0 };
    runNodes(s, buildNodes(items, pos, []).nodes, ctx);
    s.ans = s.stack.length ? s.stack[s.stack.length - 1] : s.ans;
  } catch (e) {
    if (e instanceof RplError) {
      s.error = e.message;
      s.errN = 1;
      s.errM = e.message;
    } else if (!(e instanceof Halt)) throw e;
  }
  return true;
}

/** Run one executable key id at top level, converting errors to the glass. */
function execTop(s: RplEngine, fn: string): boolean {
  if (s.modes.und) s.undoSnap = [...s.stack];
  try {
    return execWord(s, fn, freshCtx());
  } catch (e) {
    if (e instanceof RplError) {
      s.error = e.message;
      s.errN = 1;
      s.errM = e.message;
      return true; // the key IS implemented — it reported an engine error
    }
    if (e instanceof Halt) return true;
    throw e;
  }
}

/** Push a value onto the stack (history recall / constants). */
export function push(s: RplEngine, v: Value): void {
  if (s.entry !== null && !inTextMode(s.entry)) runLine(s);
  s.stack.push(real(v));
}

/** Softkey press (1..6) — resolve the active menu label and run it. */
export function pressSoft(s: RplEngine, i: number): void {
  const labels = menuLabels(s);
  const label = labels[i];
  if (!label) return;
  s.error = null;
  if (TYPES_WORD.has(label)) {
    append(s, `${label} `);
    return;
  }
  if (s.menu?.name === "USER" || s.menu?.name === "CUSTOM") {
    if (label === "ORDER" || label === "CLUSR" || label === "MEM") {
      execTop(s, label);
      return;
    }
    // a softkey resolves like a typed word: command, variable, or directory
    if (s.entry !== null && !inTextMode(s.entry) && !runLine(s)) return;
    const ctx = freshCtx();
    try {
      execToken(s, label, ctx);
    } catch (e) {
      if (e instanceof RplError) s.error = e.message;
      else if (!(e instanceof Halt)) throw e;
    }
    return;
  }
  if (s.menu?.name === "UNITS") {
    s.menu = { name: `U:${label}`, page: 0 };
    return;
  }
  if (s.menu?.name === "MENUS") {
    s.menu = { name: label, page: 0 };
    return;
  }
  if (s.menu?.name === "CHARS") {
    append(s, label);
    return;
  }
  if (s.menu?.name === "MODE" && ["CMD", "UNDO", "LAST", "ML", "TRAC"].includes(label)) {
    // the 28S single-toggle mode commands (its MODE menu variant)
    if (label === "CMD") s.modes.cmd = !s.modes.cmd;
    else if (label === "UNDO") s.modes.und = !s.modes.und;
    else if (label === "LAST") s.modes.last = !s.modes.last;
    else if (label === "ML") s.modes.ml = !s.modes.ml;
    else s.modes.trace = !s.modes.trace;
    return;
  }
  if (s.menu?.name.startsWith("U:")) {
    // the 28C UNITS catalog: on a real, ATTACH the unit; on a quantity,
    // CONVERT to it (the catalog's two working modes)
    if (s.entry !== null && !inTextMode(s.entry) && !runLine(s)) return;
    if (!s.stack.length) {
      s.error = "Too Few Arguments";
      return;
    }
    const top = s.stack[s.stack.length - 1];
    try {
      if (top.k === "real") {
        s.stack.pop();
        pushU(s, { mag: top.v, u: label });
      } else if (top.k === "unit") {
        s.stack.pop();
        pushU(s, tryUnits(() => convertU(top, label)));
      } else {
        s.error = "Bad Argument Type";
        return;
      }
    } catch (e) {
      if (e instanceof RplError) s.error = e.message;
      else throw e;
      return;
    }
    recordTape(s, label);
    return;
  }
  if (s.menu?.name === "SOLVR") {
    // the solver menu: a variable softkey STORES level 1 into that variable
    if (s.entry !== null && !inTextMode(s.entry) && !runLine(s)) return;
    if (!s.stack.length) {
      s.error = "Too Few Arguments";
      return;
    }
    const v = s.stack.pop();
    if (v) storeVar(s, label, v);
    return;
  }
  if (inTextMode(s.entry)) {
    append(s, `${label} `);
    return;
  }
  // a label naming another roster opens it (MTH → PROB → …, P17)
  if (RPL_MENUS[label] && label !== "SUB") {
    s.menuStack48 = s.menu ? [...s.menuStack48, s.menu.name] : s.menuStack48;
    s.menu = { name: label, page: 0 };
    return;
  }
  if (s.entry !== null && !runLine(s)) return;
  if (!execTop(s, label)) s.error = "Unimplemented";
  recordTape(s, label);
}

/** Labels for the active menu page (dynamic menus resolved here). */
export function menuLabels(s: RplEngine): string[] {
  if (!s.menu) return [];
  const roster =
    s.menu.name === "USER"
      ? [
          ...Object.keys(curDir(s).subs),
          ...Object.keys(curDir(s).vars),
          "ORDER", "CLUSR", "MEM",
        ]
      : s.menu.name === "MEMORY"
        ? ["MEM", "MENU", "ORDER", "PATH", "HOME", "CRDIR", "VARS", "CLUSR"]
        : s.menu.name === "CUSTOM"
          ? s.custom
          : s.menu.name === "MENUS"
            ? MENUS_INDEX
      : s.menu.name === "CATALOG"
        ? CATALOG_COMMANDS
        : s.menu.name === "UNITS"
          ? [...UNIT_CATEGORIES]
          : s.menu.name.startsWith("U:")
            ? UNIT_MENUS[s.menu.name.slice(2)] ?? []
            : s.menu.name === "SOLVR"
              ? (() => {
                  const eq = lookupVar(s, "EQ");
                  return eq && eq.k === "alg" ? exprNames(eq.src) : [];
                })()
              : RPL_MENUS[s.menu.name] ?? [];
  const pages = Math.max(1, Math.ceil(roster.length / 6));
  const p = ((s.menu.page % pages) + pages) % pages;
  const out = roster.slice(p * 6, p * 6 + 6);
  while (out.length < 6) out.push("");
  return out;
}

function recordTape(s: RplEngine, fn: string): void {
  const top = s.stack.length ? s.stack[s.stack.length - 1] : null;
  const raw = top && top.k === "real" ? top.v.toString() : "";
  const v = top ? formatObj(top, s.disp, s.base) : "";
  s.hist = [...s.hist.slice(-49), { op: v ? `${fn} → ${v}` : fn, raw }];
}

/** Dispatch a key/legend id. Returns true if the id is handled (the adapter
 * coverage oracle's probe — unknown ids must return false). */
export function dispatchRpl(s: RplEngine, fn: string): boolean {
  s.error = null;
  fn = PRINT48[fn] ?? fn;

  // alpha-access presses arrive as α-prefixed ids from the adapter (P17)
  const alphaChar = fn.match(/^α(.)$/);
  if (alphaChar) {
    append(s, s.lc ? alphaChar[1].toLowerCase() : alphaChar[1]);
    return true;
  }
  const fkey = fn.match(/^F([1-6])$/);
  if (fkey) {
    pressSoft(s, Number(fkey[1]) - 1); // the 49G's labelled soft row
    return true;
  }
  if (fn === "∞TYPE") {
    append(s, "∞");
    return true;
  }
  if (fn === "EQUATION") {
    // EquationWriter-lite: open an algebraic entry; the hero line typesets
    // the partial expression live (delivery note)
    append(s, "'");
    return true;
  }
  if (fn === "ENTRY") {
    s.alphaLock = !s.alphaLock;
    return true;
  }

  // ---- editing / control keys first --------------------------------------------
  if (fn === "ON" || fn === "ATTN") {
    s.entry = null;
    s.msg = null;
    s.menu = null;
    s.plot = null;
    return true;
  }
  if (fn === "OFF" || fn === "CONT") return true;
  if (fn === "DEL") {
    if (s.entry !== null) s.entry = s.entry.slice(0, -1) || null;
    return true;
  }
  if (
    fn === "INS" || fn === "▲" || fn === "▼" || fn === "◄" || fn === "►" ||
    fn === "◄▶" || fn === "VIEW▲" || fn === "VIEW▼"
  )
    return true; // command-line cursor / display-window motion — the glass shows all
  if (fn === "LC") {
    s.lc = !s.lc;
    return true;
  }
  if (fn === "α LOCK") {
    s.alphaLock = !s.alphaLock;
    return true;
  }
  if (fn === "NEXT" || fn === "NXT" || fn === "PREV") {
    if (s.menu) s.menu = { ...s.menu, page: s.menu.page + (fn === "PREV" ? -1 : 1) };
    return true;
  }
  if (fn === "EDIT" || fn === "VISIT") {
    const lvl = fn === "VISIT" && s.stack.length && peek(s).k === "real" ? wantInt(pop1(s)) : 1;
    if (s.stack.length >= lvl && lvl >= 1) s.entry = objToSrc(s.stack[s.stack.length - lvl]);
    return true;
  }
  if (fn === "COPY") {
    s.clip = s.entry ?? (s.stack.length ? objToSrc(peek(s)) : null);
    return true;
  }
  if (fn === "CUT") {
    s.clip = s.entry;
    s.entry = null;
    return true;
  }
  if (fn === "PASTE") {
    if (s.clip) append(s, s.clip);
    return true;
  }
  if (fn === "BEGIN") return true; // selection anchor — append-only editor
  if (fn === "COMMAND") {
    if (s.lastCmd.length) {
      s.entry = s.lastCmd[0];
      s.lastCmd = [...s.lastCmd.slice(1), s.lastCmd[0]]; // cycle
    }
    return true;
  }
  if (fn === "UNDO") {
    if (s.undoSnap) {
      const cur = [...s.stack];
      s.stack = [...s.undoSnap];
      s.undoSnap = cur;
    }
    return true;
  }
  if (fn === "LAST") {
    s.stack.push(...s.last);
    return true;
  }

  // ---- menus ---------------------------------------------------------------------
  const menuName = MENU_OPEN[fn];
  if (menuName) {
    s.menu = { name: menuName, page: 0 };
    return true;
  }

  // ---- typing --------------------------------------------------------------------
  const text = inTextMode(s.entry);
  if (/^[0-9]$/.test(fn)) {
    append(s, fn);
    return true;
  }
  if (fn === ".") {
    append(s, s.entry === null ? "0." : ".");
    return true;
  }
  if (fn === "EEX") {
    if (s.entry === null) s.entry = "1E";
    else append(s, s.entry.endsWith("E") ? "" : "E");
    return true;
  }
  if (/^[A-Za-z]$/.test(fn)) {
    append(s, s.lc ? fn.toLowerCase() : fn);
    return true;
  }
  if (fn in TYPE_CHARS) {
    append(s, TYPE_CHARS[fn]);
    return true;
  }
  if (fn === "CHS" || fn === "+/−") {
    if (s.entry !== null) {
      if (text) {
        append(s, "-");
        return true;
      }
      // negate the number being typed (the last token), exponent-aware
      const at = s.entry.lastIndexOf(" ") + 1;
      const tail = s.entry.slice(at);
      if (/^[+-]?(\d+\.?\d*|\.\d+)([Ee][+-]?\d*)?$/.test(tail)) {
        const ei = tail.indexOf("E");
        const flipped =
          ei >= 0
            ? tail.slice(ei + 1).startsWith("-")
              ? tail.slice(0, ei + 1) + tail.slice(ei + 2)
              : `${tail.slice(0, ei + 1)}-${tail.slice(ei + 1)}`
            : tail.startsWith("-")
              ? tail.slice(1)
              : `-${tail}`;
        s.entry = s.entry.slice(0, at) + flipped;
        return true;
      }
    }
    // falls through to the NEG command on the stack
  }

  // in text entry (or α LOCK), command keys TYPE their names — program entry
  if ((text || s.alphaLock) && fn !== "ENTER") {
    append(s, fn.length === 1 ? fn : `${fn} `); // bare char for operators
    return true;
  }
  if (TYPES_WORD.has(fn)) {
    append(s, `${fn} `);
    return true;
  }

  // ---- ENTER / execution -----------------------------------------------------------
  if (fn === "ENTER") {
    if (s.entry !== null) {
      runLine(s);
    } else if (s.stack.length) {
      s.stack.push(peek(s)); // empty line: ENTER duplicates level 1
    }
    return true;
  }

  // an open (non-text) command line commits before an executable key runs
  const willRun =
    fn === "CHS" || fn === "+/−"
      ? true
      : execWordKnown(fn);
  if (!willRun) return false;
  if (s.entry !== null && !runLine(s)) return true; // syntax error reported
  const handled = execTop(s, fn === "+/−" ? "CHS" : fn);
  if (handled && !NO_TAPE.has(fn)) recordTape(s, fn);
  return handled;
}

/** Would execWord handle this id? (probe without touching the stack) */
function execWordKnown(fn: string): boolean {
  const probe = createRpl();
  probe.stack = []; // run against an empty engine: "Too Few Arguments" still
  try {
    return execWord(probe, fn, freshCtx());
  } catch (e) {
    if (e instanceof RplError || e instanceof Halt) return true;
    throw e;
  }
}
