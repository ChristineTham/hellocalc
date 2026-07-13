// src/lib/engine/rpl/wolfram.ts
// Wolfram-Language (Mathematica) interchange for algebraic expressions
// (FR-IO-4). toWolfram walks the algebraic AST → InputForm ("Sin[x] + x^2");
// fromWolfram does the reverse via a bracket-aware transform. Best-effort over
// the algebraic grammar's function set — a full WL parser is out of scope, but
// simple expressions round-trip. Pure TS.
import { parseExpr } from "./parse";

type Node = ReturnType<typeof parseExpr>;

/** algebraic function name (lower-case) → Wolfram symbol */
const TO_WL: Record<string, string> = {
  sin: "Sin", cos: "Cos", tan: "Tan", asin: "ArcSin", acos: "ArcCos", atan: "ArcTan",
  sinh: "Sinh", cosh: "Cosh", tanh: "Tanh", asinh: "ArcSinh", acosh: "ArcCosh", atanh: "ArcTanh",
  ln: "Log", log: "Log10", exp: "Exp", sqrt: "Sqrt", abs: "Abs", sign: "Sign",
  floor: "Floor", ceil: "Ceiling", min: "Min", max: "Max", mod: "Mod", fact: "Factorial",
  ip: "IntegerPart", fp: "FractionalPart",
};
const CONST_WL: Record<string, string> = { pi: "Pi", e: "E" };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function nodeToWL(n: Node): string {
  switch (n.t) {
    case "num":
      return n.v.toString();
    case "name":
      return CONST_WL[n.v.toLowerCase()] ?? n.v;
    case "neg":
      return `(-${nodeToWL(n.a)})`;
    case "call":
      return `${TO_WL[n.fn.toLowerCase()] ?? cap(n.fn)}[${n.args.map(nodeToWL).join(", ")}]`;
    case "bin":
      // fully parenthesized — WL evaluates it identically, no precedence guff
      return `(${nodeToWL(n.a)} ${n.op} ${nodeToWL(n.b)})`;
  }
}

/** Algebraic source → Wolfram InputForm. Throws on a parse error. */
export function toWolfram(algSrc: string): string {
  return nodeToWL(parseExpr(algSrc));
}

/** Wolfram symbol → algebraic function name */
const FROM_WL: Record<string, string> = Object.fromEntries(
  Object.entries(TO_WL).map(([alg, wl]) => [wl, alg]),
);

/** Wolfram InputForm → algebraic source. Bracket-aware (WL calls use `[...]`;
 * WL lists use `{...}` and are left alone). Best-effort. */
export function fromWolfram(wl: string): string {
  let s = wl.replace(/([A-Za-z][A-Za-z0-9]*)\s*\[/g, (_, name: string) => {
    return `${FROM_WL[name] ?? name.toLowerCase()}(`;
  });
  s = s.replace(/\]/g, ")");
  s = s.replace(/\bPi\b/g, "pi").replace(/\bE\b/g, "e");
  return s;
}
