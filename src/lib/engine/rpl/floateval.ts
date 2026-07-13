// src/lib/engine/rpl/floateval.ts
// IEEE-754 double evaluation of an algebraic expression (FR-NUM-2). The engines
// compute EXACTLY on the BigNumber tower; this is the deliberate "standard
// floating-point" alternative — it evaluates a parsed expression with native JS
// number arithmetic, so 0.1 + 0.2 yields 0.30000000000000004 exactly as a
// hardware FPU would. Contained: it never touches the BigNumber engines, just
// walks their AST. Pure TS.
import { parseExpr } from "./parse";

type Node = ReturnType<typeof parseExpr>;

const FN: Record<string, (...a: number[]) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  ln: Math.log, log: Math.log10, exp: Math.exp, alog: (x) => 10 ** x,
  sqrt: Math.sqrt, sq: (x) => x * x, inv: (x) => 1 / x, abs: Math.abs, sign: Math.sign,
  neg: (x) => -x, ip: Math.trunc, fp: (x) => x - Math.trunc(x),
  floor: Math.floor, ceil: Math.ceil, min: Math.min, max: Math.max, mod: (a, b) => a % b,
  fact: (n) => {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
};
const CONST: Record<string, number> = { pi: Math.PI, e: Math.E };

/** Evaluate the algebraic AST in IEEE-754 doubles. `lookup` resolves a free
 * name to a number (or null ⇒ undefined name). Throws on unknown function or
 * undefined name. */
export function evalFloat(node: Node, lookup: (name: string) => number | null): number {
  const go = (n: Node): number => {
    switch (n.t) {
      case "num":
        return n.v.toNumber();
      case "name": {
        const c = CONST[n.v.toLowerCase()];
        if (c !== undefined) return c;
        const v = lookup(n.v);
        if (v === null) throw new Error(`undefined name: ${n.v}`);
        return v;
      }
      case "neg":
        return -go(n.a);
      case "call": {
        const f = FN[n.fn.toLowerCase()];
        if (!f) throw new Error(`unknown function: ${n.fn}`);
        return f(...n.args.map(go));
      }
      case "bin": {
        const a = go(n.a);
        const b = go(n.b);
        switch (n.op) {
          case "+": return a + b;
          case "-": return a - b;
          case "*": return a * b;
          case "/": return a / b;
          case "^": return a ** b;
          default: throw new Error(`unsupported operator: ${n.op}`);
        }
      }
    }
  };
  return go(node);
}
