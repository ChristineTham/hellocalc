// src/lib/engine/cas/nerdamer-provider.ts
// The light CAS tier (P14): nerdamer-prime behind a dynamic import() so it
// never enters the initial bundle (architecture §4.3, NFR-3). Loading returns
// a synchronous CasProvider; the caller registers it via setCas(). Algebrite
// remains a documented alternate (architecture §5) — one canonical provider
// per op keeps normalization consistent.

import type { CasProvider } from "./provider";

/** HP algebraics print UPPERCASE function names; nerdamer speaks lowercase.
 * Translate at the provider boundary, both directions (longest-first so
 * ASINH wins over SIN, LOG10 over LOG). `√(` also maps to sqrt. */
const HP_TO_CAS: [RegExp, string][] = [
  [/\bASINH\s*\(/g, "asinh("], [/\bACOSH\s*\(/g, "acosh("], [/\bATANH\s*\(/g, "atanh("],
  [/\bASIN\s*\(/g, "asin("], [/\bACOS\s*\(/g, "acos("], [/\bATAN\s*\(/g, "atan("],
  [/\bSINH\s*\(/g, "sinh("], [/\bCOSH\s*\(/g, "cosh("], [/\bTANH\s*\(/g, "tanh("],
  [/\bSIN\s*\(/g, "sin("], [/\bCOS\s*\(/g, "cos("], [/\bTAN\s*\(/g, "tan("],
  [/\bLOG\s*\(/g, "log10("], [/\bLN\s*\(/g, "log("], [/\bEXP\s*\(/g, "exp("],
  [/\bALOG\s*\(/g, "10^("], [/\bSQRT\s*\(/g, "sqrt("], [/√\s*\(/g, "sqrt("],
  [/\bABS\s*\(/g, "abs("], [/\bFLOOR\s*\(/g, "floor("], [/\bCEIL\s*\(/g, "ceil("],
  [/\bMOD\s*\(/g, "mod("], [/\bMIN\s*\(/g, "min("], [/\bMAX\s*\(/g, "max("],
  [/\bFACT\s*\(/g, "factorial("],
];
const CAS_TO_HP: [RegExp, string][] = [
  [/\basinh\(/g, "ASINH("], [/\bacosh\(/g, "ACOSH("], [/\batanh\(/g, "ATANH("],
  [/\basin\(/g, "ASIN("], [/\bacos\(/g, "ACOS("], [/\batan\(/g, "ATAN("],
  [/\bsinh\(/g, "SINH("], [/\bcosh\(/g, "COSH("], [/\btanh\(/g, "TANH("],
  [/\bsin\(/g, "SIN("], [/\bcos\(/g, "COS("], [/\btan\(/g, "TAN("],
  [/\blog10\(/g, "LOG("], [/\blog\(/g, "LN("], [/\bexp\(/g, "EXP("],
  [/\bsqrt\(/g, "SQRT("], [/\babs\(/g, "ABS("], [/\bfloor\(/g, "FLOOR("],
  [/\bceil\(/g, "CEIL("], [/\bfactorial\(/g, "FACT("],
];
const apply = (maps: [RegExp, string][], s: string): string =>
  maps.reduce((acc, [re, to]) => acc.replace(re, to), s);
const toCas = (s: string): string => apply(HP_TO_CAS, s);
const toHp = (s: string): string => apply(CAS_TO_HP, s);

let loaded: Promise<CasProvider> | null = null;

/** Load (once) and build the Nerdamer-backed provider. */
export function loadNerdamerProvider(): Promise<CasProvider> {
  loaded ??= build();
  return loaded;
}

async function build(): Promise<CasProvider> {
  const [core] = await Promise.all([
    import("nerdamer-prime"),
    import("nerdamer-prime/Calculus"),
    import("nerdamer-prime/Algebra"),
    import("nerdamer-prime/Solve"),
  ]);
  const nerdamer = core.default;

  const call = (expr: string): string => toHp(nerdamer(toCas(expr)).toString());

  return {
    diff: (expr, v) => toHp(nerdamer.diff(toCas(expr), v).toString()),
    integrate: (expr, v) => toHp(nerdamer.integrate(toCas(expr), v).toString()),
    expand: (expr) => call(`expand(${expr})`),
    simplify: (expr) => call(`simplify(${expr})`),
    factor: (expr) => call(`factor(${expr})`),
    solve: (expr, v) => {
      // "[2,-2]" → top-level comma split (solutions may contain calls)
      const raw = toHp(nerdamer.solve(toCas(expr), v).toString());
      const inner = raw.replace(/^\[/, "").replace(/\]$/, "");
      if (inner.trim() === "") return [];
      const out: string[] = [];
      let depth = 0;
      let start = 0;
      for (let i = 0; i < inner.length; i++) {
        const c = inner[i];
        if (c === "(" || c === "[") depth++;
        else if (c === ")" || c === "]") depth--;
        else if (c === "," && depth === 0) {
          out.push(inner.slice(start, i));
          start = i + 1;
        }
      }
      out.push(inner.slice(start));
      return out.map((s) => s.trim()).filter(Boolean);
    },
    // nerdamer-prime has no working taylor() — build it from nth derivatives
    // evaluated at 0 (Maclaurin), the classic light-tier construction
    taylor: (expr, v, order) => {
      const n = Math.max(0, Math.min(12, Math.trunc(order)));
      const terms: string[] = [];
      let fact = 1;
      const cexpr = toCas(expr);
      for (let k = 0; k <= n; k++) {
        if (k > 0) fact *= k;
        const dk = k === 0 ? cexpr : nerdamer.diff(cexpr, v, k).toString();
        const coeff = nerdamer(dk, { [v]: 0 }).toString();
        if (coeff === "0") continue;
        const scaled = nerdamer(`(${coeff})/${fact}`).toString();
        if (scaled === "0") continue;
        terms.push(k === 0 ? scaled : `(${scaled})*${v}^${k}`);
      }
      if (!terms.length) return "0";
      return toHp(nerdamer(terms.join("+")).toString());
    },
    toLatex: (expr) => nerdamer(toCas(expr)).toTeX(),
  };
}
