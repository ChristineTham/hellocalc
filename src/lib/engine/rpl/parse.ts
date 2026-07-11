// src/lib/engine/rpl/parse.ts
// The RPL command-line / program-body parser (P12) and the numeric algebraic
// evaluator. parseItems turns source text into a sequence of literal objects
// and command words — the same routine reads the command line, program bodies
// («…» re-tokenized on EVAL) and STR→ strings. The algebraic evaluator does
// NUMERIC evaluation on the BigNumber tower with names resolved through an
// environment; symbolic rewriting is the P14 CAS's job.

import { bn, math, PI, type Value } from "../config";
import { validUnit } from "../units";
import type { RplObj } from "./object";

export type RplItem = { lit: RplObj } | { word: string };

const isSpace = (c: string) => c === " " || c === "\n" || c === "\t";
const NUM_RE = /^[+-]?(\d+\.?\d*|\.\d+)([Ee][+-]?\d*)?$/;

class Reader {
  i = 0;
  constructor(readonly s: string) {}
  peek(): string {
    return this.s[this.i] ?? "";
  }
  next(): string {
    return this.s[this.i++] ?? "";
  }
  done(): boolean {
    return this.i >= this.s.length;
  }
  skipSpace(): void {
    while (!this.done() && isSpace(this.peek())) this.i++;
  }
  /** Consume to the balanced closer, honouring nesting of the same pair. */
  balanced(open: string, close: string): string {
    let depth = 1;
    const start = this.i;
    while (!this.done()) {
      const c = this.next();
      if (c === open) depth++;
      else if (c === close && --depth === 0) return this.s.slice(start, this.i - 1);
    }
    throw new Error("Syntax Error");
  }
}

const syntax = () => new Error("Syntax Error");

/** One token of "bare" text: up to whitespace or a structural delimiter. */
function bareToken(r: Reader): string {
  const start = r.i;
  while (!r.done()) {
    const c = r.peek();
    if (isSpace(c) || "{}[]()«»'\"".includes(c)) break;
    r.i++;
  }
  return r.s.slice(start, r.i);
}

const IDENT_RE = /^[A-Za-zΣσαβ→∂π][A-Za-z0-9Σσ.]*$/u;

function parseNumber(tok: string): Value | null {
  if (!NUM_RE.test(tok)) return null;
  // "1E" (EEX pressed, no exponent typed yet) reads as ×10⁰, like the HPs
  const fixed = /[Ee]$/.test(tok) ? `${tok}0` : tok;
  try {
    return bn(fixed.replace(/^\+/, ""));
  } catch {
    return null;
  }
}

/** Parse ONE object/word starting at the reader. Returns null at end. */
function parseOne(r: Reader, base: number): RplItem | null {
  r.skipSpace();
  if (r.done()) return null;
  const c = r.peek();

  if (c === "«") {
    r.next();
    return { lit: { k: "prog", body: r.balanced("«", "»").trim() } };
  }
  if (c === "»") throw syntax(); // unmatched closer
  if (c === '"') {
    r.next();
    const start = r.i;
    while (!r.done() && r.peek() !== '"') r.i++;
    if (r.done()) throw syntax();
    const v = r.s.slice(start, r.i);
    r.next();
    return { lit: { k: "str", v } };
  }
  if (c === "'") {
    r.next();
    const start = r.i;
    while (!r.done() && r.peek() !== "'") r.i++;
    if (r.done()) throw syntax();
    const src = r.s.slice(start, r.i).trim();
    r.next();
    if (src === "") throw syntax();
    // a lone identifier quotes as a NAME; anything else is an algebraic
    if (IDENT_RE.test(src) && !FN_NAMES.has(src.toUpperCase())) {
      return { lit: { k: "name", v: src } };
    }
    try {
      parseExpr(src); // validate now so ENTER reports Syntax Error, not EVAL
    } catch (e) {
      // DEF definitions ('F(X)=expr') carry a user-function head the strict
      // grammar rejects — accept the shape; DEF consumes it before any EVAL
      if (!/^[A-Za-z][A-Za-z0-9]*\([^)]*\)=.+$/.test(src)) throw e;
    }
    return { lit: { k: "alg", src } };
  }
  if (c === "{") {
    r.next();
    const inner = r.balanced("{", "}");
    const items = parseItems(inner, base).map((it) =>
      "lit" in it ? it.lit : ({ k: "name", v: it.word } as RplObj),
    );
    return { lit: { k: "list", items } };
  }
  if (c === "[") {
    r.next();
    const inner = r.balanced("[", "]");
    return { lit: parseArray(inner) };
  }
  if (c === "(") {
    r.next();
    const inner = r.balanced("(", ")");
    const parts = inner.split(/[,;]/);
    if (parts.length !== 2) throw syntax();
    const re = Number(parts[0]);
    const im = Number(parts[1]);
    if (!Number.isFinite(re) || !Number.isFinite(im)) throw syntax();
    return { lit: { k: "cpx", re, im } };
  }
  if (c === "#") {
    r.next();
    r.skipSpace();
    const tok = bareToken(r);
    if (!tok) throw syntax();
    const m = tok.match(/^([0-9A-Fa-f]+)([hodb])?$/);
    if (!m) throw syntax();
    const b = m[2] ? { h: 16, o: 8, d: 10, b: 2 }[m[2]] : base;
    if (!b) throw syntax();
    if (![...m[1]].every((d) => parseInt(d, 16) < b)) throw syntax();
    let v = BigInt(0);
    for (const d of m[1]) v = v * BigInt(b) + BigInt(parseInt(d, 16));
    return { lit: { k: "bin", v } };
  }

  const tok = bareToken(r);
  if (!tok) {
    // a structural char not consumed above ends up here only via ] } ) — error
    throw syntax();
  }
  // HP unit syntax `5_cm` / `9.81_m/s^2` (P13) — magnitude stays exact
  const um = tok.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?)_(.+)$/);
  if (um) {
    const mag = parseNumber(um[1]);
    if (mag === null || !validUnit(um[2])) throw syntax();
    return { lit: { k: "unit", mag, u: um[2] } };
  }
  const num = parseNumber(tok);
  if (num !== null) return { lit: { k: "real", v: num } };
  return { word: tok };
}

/** [ 1 2 3 ] vector or [ [ 1 2 ] [ 3 4 ] ] matrix (inner text, no brackets). */
function parseArray(inner: string): RplObj {
  const r = new Reader(inner);
  r.skipSpace();
  if (r.peek() === "[") {
    const rows: number[][] = [];
    while (!r.done()) {
      r.skipSpace();
      if (r.done()) break;
      if (r.next() !== "[") throw syntax();
      rows.push(rowOf(r.balanced("[", "]")));
    }
    if (!rows.length || rows.some((row) => row.length !== rows[0].length)) throw syntax();
    return { k: "arr", rows, vec: false };
  }
  const row = rowOf(inner);
  if (!row.length) throw syntax();
  return { k: "arr", rows: [row], vec: true };
}

function rowOf(text: string): number[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => {
      const n = Number(t);
      if (!Number.isFinite(n)) throw syntax();
      return n;
    });
}

/** Parse a full source line / program body into items. Throws Syntax Error. */
export function parseItems(src: string, base: number): RplItem[] {
  const r = new Reader(src);
  const out: RplItem[] = [];
  for (;;) {
    const item = parseOne(r, base);
    if (item === null) return out;
    out.push(item);
  }
}

// ---- algebraic expressions (numeric evaluation) --------------------------------

type Node =
  | { t: "num"; v: Value }
  | { t: "name"; v: string }
  | { t: "call"; fn: string; args: Node[] }
  | { t: "bin"; op: string; a: Node; b: Node }
  | { t: "neg"; a: Node };

/** Function names the algebraic grammar knows (28C scope minus CAS). */
export const FN_NAMES = new Set([
  "SIN", "COS", "TAN", "ASIN", "ACOS", "ATAN",
  "SINH", "COSH", "TANH", "ASINH", "ACOSH", "ATANH",
  "LN", "LOG", "EXP", "ALOG", "LNP1", "EXPM",
  "SQRT", "√", "SQ", "ABS", "SIGN", "INV", "NEG",
  "IP", "FP", "FLOOR", "CEIL", "MIN", "MAX", "MOD", "FACT",
]);

class ExprReader extends Reader {
  ident(): string {
    const start = this.i;
    while (!this.done() && /[A-Za-z0-9Σσ.]/u.test(this.peek())) this.i++;
    return this.s.slice(start, this.i);
  }
}

/** Parse an algebraic's source to an AST (numbers stay exact). */
export function parseExpr(src: string): Node {
  const r = new ExprReader(src);
  const node = parseRel(r);
  r.skipSpace();
  if (!r.done()) throw syntax();
  return node;
}

function parseRel(r: ExprReader): Node {
  let a = parseAdd(r);
  for (;;) {
    r.skipSpace();
    const two = r.s.slice(r.i, r.i + 2);
    const one = r.peek();
    const op =
      two === "==" ? "==" : "=≠<>≤≥".includes(one) && one !== "" ? one : null;
    if (!op) return a;
    r.i += op.length;
    a = { t: "bin", op, a, b: parseAdd(r) };
  }
}

function parseAdd(r: ExprReader): Node {
  let a = parseMul(r);
  for (;;) {
    r.skipSpace();
    const c = r.peek();
    if (c === "+" || c === "-" || c === "−") {
      r.next();
      a = { t: "bin", op: c === "+" ? "+" : "-", a, b: parseMul(r) };
    } else return a;
  }
}

function parseMul(r: ExprReader): Node {
  let a = parseUnary(r);
  for (;;) {
    r.skipSpace();
    const c = r.peek();
    if (c === "*" || c === "×" || c === "/" || c === "÷") {
      r.next();
      a = { t: "bin", op: c === "*" || c === "×" ? "*" : "/", a, b: parseUnary(r) };
    } else return a;
  }
}

function parseUnary(r: ExprReader): Node {
  r.skipSpace();
  const c = r.peek();
  if (c === "-" || c === "−") {
    r.next();
    return { t: "neg", a: parseUnary(r) };
  }
  return parsePow(r);
}

function parsePow(r: ExprReader): Node {
  const a = parseAtom(r);
  r.skipSpace();
  if (r.peek() === "^") {
    r.next();
    return { t: "bin", op: "^", a, b: parseUnary(r) }; // right-assoc
  }
  return a;
}

function parseAtom(r: ExprReader): Node {
  r.skipSpace();
  const c = r.peek();
  if (c === "(") {
    r.next();
    const inner = parseRel(r);
    r.skipSpace();
    if (r.next() !== ")") throw syntax();
    return inner;
  }
  if (c === "π") {
    r.next();
    return { t: "name", v: "π" };
  }
  if (/[0-9.]/.test(c)) {
    const start = r.i;
    while (!r.done() && /[0-9.]/.test(r.peek())) r.i++;
    if (r.peek() === "E" || r.peek() === "e") {
      // exponent only if followed by digits/sign (else it's a name boundary)
      const save = r.i;
      r.i++;
      if (r.peek() === "+" || r.peek() === "-") r.i++;
      if (/[0-9]/.test(r.peek())) {
        while (!r.done() && /[0-9]/.test(r.peek())) r.i++;
      } else r.i = save;
    }
    const v = parseNumber(r.s.slice(start, r.i));
    if (v === null) throw syntax();
    return { t: "num", v };
  }
  if (/[A-Za-zΣσ√]/u.test(c)) {
    const id = c === "√" ? (r.next(), "√") : r.ident();
    if (!id) throw syntax();
    r.skipSpace();
    if (r.peek() === "(") {
      r.next();
      const args: Node[] = [parseRel(r)];
      r.skipSpace();
      while (r.peek() === ",") {
        r.next();
        args.push(parseRel(r));
      }
      if (r.next() !== ")") throw syntax();
      if (!FN_NAMES.has(id.toUpperCase())) throw syntax();
      return { t: "call", fn: id.toUpperCase(), args };
    }
    if (id === "√") throw syntax(); // √ requires (x)
    return { t: "name", v: id };
  }
  throw syntax();
}

/** Thrown when a name has no value — EVAL leaves the algebraic symbolic. */
export class UndefinedName extends Error {
  constructor(readonly nm: string) {
    super(`Undefined Name: ${nm}`);
  }
}

export interface ExprEnv {
  /** resolve a name to a numeric value, or null if unknown */
  get(nm: string): Value | null;
  /** angle mode for trig */
  toRad(v: Value): Value;
  fromRad(v: Value): Value;
}

const asV = (x: unknown): Value => {
  if (math.isBigNumber(x)) return x;
  if (typeof x === "number") return bn(String(x));
  throw new Error("Error"); // complex intermediate — out of numeric-eval scope
};

export function evalExpr(node: Node, env: ExprEnv): Value {
  switch (node.t) {
    case "num":
      return node.v;
    case "name": {
      if (node.v === "π") return PI;
      const v = env.get(node.v);
      if (v === null) {
        // Euler's e (the CAS prints exp as e^x) — unless user-defined
        if (node.v === "e") return asV(math.exp(bn(1)));
        throw new UndefinedName(node.v);
      }
      return v;
    }
    case "neg":
      return evalExpr(node.a, env).neg();
    case "bin": {
      const a = evalExpr(node.a, env);
      const b = evalExpr(node.b, env);
      switch (node.op) {
        case "+":
          return a.plus(b);
        case "-":
          return a.minus(b);
        case "*":
          return a.times(b);
        case "/":
          return asV(math.divide(a, b));
        case "^":
          return asV(math.pow(a, b));
        case "=": // an equation evaluates as lhs − rhs (ROOT's convention)
          return a.minus(b);
        case "==":
          return bn(a.eq(b) ? 1 : 0);
        case "≠":
          return bn(a.eq(b) ? 0 : 1);
        case "<":
          return bn(a.lt(b) ? 1 : 0);
        case ">":
          return bn(a.gt(b) ? 1 : 0);
        case "≤":
          return bn(a.lte(b) ? 1 : 0);
        case "≥":
          return bn(a.gte(b) ? 1 : 0);
        default:
          throw syntax();
      }
    }
    case "call": {
      const [x, y] = node.args.map((a) => evalExpr(a, env));
      switch (node.fn) {
        case "SIN":
          return asV(math.sin(env.toRad(x)));
        case "COS":
          return asV(math.cos(env.toRad(x)));
        case "TAN":
          return asV(math.tan(env.toRad(x)));
        case "ASIN":
          return env.fromRad(asV(math.asin(x)));
        case "ACOS":
          return env.fromRad(asV(math.acos(x)));
        case "ATAN":
          return env.fromRad(asV(math.atan(x)));
        case "SINH":
          return asV(math.sinh(x));
        case "COSH":
          return asV(math.cosh(x));
        case "TANH":
          return asV(math.tanh(x));
        case "ASINH":
          return asV(math.asinh(x));
        case "ACOSH":
          return asV(math.acosh(x));
        case "ATANH":
          return asV(math.atanh(x));
        case "LN":
          return asV(math.log(x));
        case "LOG":
          return asV(math.log10(x));
        case "EXP":
          return asV(math.exp(x));
        case "ALOG":
          return asV(math.pow(bn(10), x));
        case "LNP1":
          return asV(math.log(x.plus(1)));
        case "EXPM":
          return asV(math.exp(x)).minus(1);
        case "SQRT":
        case "√":
          return asV(math.sqrt(x));
        case "SQ":
          return x.times(x);
        case "ABS":
          return x.abs();
        case "SIGN":
          return bn(x.isZero() ? 0 : x.isNegative() ? -1 : 1);
        case "INV":
          return asV(math.divide(bn(1), x));
        case "NEG":
          return x.neg();
        case "IP":
          return x.trunc();
        case "FP":
          return x.minus(x.trunc());
        case "FLOOR":
          return x.floor();
        case "CEIL":
          return x.ceil();
        case "MIN":
          return x.lt(y) ? x : y;
        case "MAX":
          return x.gt(y) ? x : y;
        case "MOD":
          return x.mod(y);
        case "FACT":
          return asV(math.factorial(x));
        default:
          throw syntax();
      }
    }
  }
}

/** Names referenced by an algebraic (SOLVR's variable menu). */
export function exprNames(src: string): string[] {
  const out: string[] = [];
  const walk = (n: Node): void => {
    if (n.t === "name" && n.v !== "π" && !out.includes(n.v)) out.push(n.v);
    else if (n.t === "bin") {
      walk(n.a);
      walk(n.b);
    } else if (n.t === "neg") walk(n.a);
    else if (n.t === "call") n.args.forEach(walk);
  };
  try {
    walk(parseExpr(src));
  } catch {
    // unparsable → no names
  }
  return out;
}
