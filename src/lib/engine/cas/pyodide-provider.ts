// src/lib/engine/cas/pyodide-provider.ts
// The HEAVY CAS tier (P19, FR-CAS-5, architecture §4.3/§4.12): Pyodide +
// SymPy behind the same CasProvider seam as the P14 light tier, extended
// with the 49G-only operations (limits, series, partial fractions, ODEs,
// Laplace transforms). Everything is dynamically imported and the WASM +
// sympy wheel stream from the pyodide CDN on FIRST use only — nothing
// enters the initial bundle (NFR-3), and the loading state is explicit in
// the UI (NFR-4). Requires network on first load; the browser caches the
// artifacts afterwards. Once loaded, calls are SYNCHRONOUS (runPython).

import type { CasProvider } from "./provider";

/** The heavy tier's superset — call sites feature-test the extras. */
export interface HeavyCasProvider extends CasProvider {
  limit(expr: string, variable: string, to: string): string;
  series(expr: string, variable: string, order: number): string;
  partfrac(expr: string, variable: string): string;
  texpand(expr: string): string;
  desolve(expr: string, fn: string, variable: string): string;
  laplace(expr: string, variable: string): string;
  ilaplace(expr: string, variable: string): string;
}

let loaded: Promise<HeavyCasProvider> | null = null;

export function loadPyodideProvider(): Promise<HeavyCasProvider> {
  loaded ??= build();
  return loaded;
}

/** HP prints ↔ sympy names (the same boundary discipline as the light tier). */
const toPy = (s: string): string =>
  s
    .replace(/\bLN\s*\(/g, "log(")
    .replace(/\bLOG\s*\(/g, "log10(")
    .replace(/\bEXP\s*\(/g, "exp(")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/\bSQRT\s*\(/g, "sqrt(")
    .replace(/\bSIN\s*\(/g, "sin(")
    .replace(/\bCOS\s*\(/g, "cos(")
    .replace(/\bTAN\s*\(/g, "tan(")
    .replace(/\bASIN\s*\(/g, "asin(")
    .replace(/\bACOS\s*\(/g, "acos(")
    .replace(/\bATAN\s*\(/g, "atan(")
    .replace(/\^/g, "**")
    .replace(/∞/g, "oo");
const fromPy = (s: string): string =>
  s
    .replace(/\*\*/g, "^")
    .replace(/\blog10\(/g, "LOG(")
    .replace(/\blog\(/g, "LN(")
    .replace(/\bexp\(/g, "EXP(")
    .replace(/\bsqrt\(/g, "SQRT(")
    .replace(/\bsin\(/g, "SIN(")
    .replace(/\bcos\(/g, "COS(")
    .replace(/\btan\(/g, "TAN(")
    .replace(/\basin\(/g, "ASIN(")
    .replace(/\bacos\(/g, "ACOS(")
    .replace(/\batan\(/g, "ATAN(")
    .replace(/\boo\b/g, "∞");

async function build(): Promise<HeavyCasProvider> {
  const mod = await import("pyodide");
  // the WASM artifacts stream from the CDN pinned to the installed version
  const py = await mod.loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${mod.version}/full/`,
  });
  await py.loadPackage("sympy");
  py.runPython(
    "import sympy\n" +
      "from sympy import symbols, sympify, diff, integrate, factor, expand, simplify, solve, limit, series, apart, expand_trig, dsolve, laplace_transform, inverse_laplace_transform, latex, Function\n",
  );

  /** Run one sympy expression source, returning its str() in HP form. */
  const run = (python: string): string => {
    const out = py.runPython(`str(${python})`);
    if (typeof out !== "string") throw new Error("CAS: no result");
    return fromPy(out);
  };
  const q = (s: string): string => JSON.stringify(toPy(s));

  return {
    diff: (e, v) => run(`diff(sympify(${q(e)}), symbols(${q(v)}))`),
    integrate: (e, v) => run(`integrate(sympify(${q(e)}), symbols(${q(v)}))`),
    expand: (e) => run(`expand(sympify(${q(e)}))`),
    simplify: (e) => run(`simplify(sympify(${q(e)}))`),
    factor: (e) => run(`factor(sympify(${q(e)}))`),
    solve: (e, v) => {
      // one root per line — sympy str() is single-line for solutions
      const raw = py.runPython(
        `"\\n".join(str(r) for r in solve(sympify(${q(e)}), symbols(${q(v)})))`,
      );
      return typeof raw === "string" && raw !== "" ? raw.split("\n").map(fromPy) : [];
    },
    taylor: (e, v, n) =>
      run(`series(sympify(${q(e)}), symbols(${q(v)}), 0, ${Math.max(1, n) + 1}).removeO()`),
    toLatex: (e) => {
      const out = py.runPython(`latex(sympify(${q(e)}))`);
      if (typeof out !== "string") throw new Error("CAS: no result");
      return out;
    },
    limit: (e, v, to) => run(`limit(sympify(${q(e)}), symbols(${q(v)}), sympify(${q(to)}))`),
    series: (e, v, n) => run(`series(sympify(${q(e)}), symbols(${q(v)}), 0, ${Math.max(1, n) + 1})`),
    partfrac: (e, v) => run(`apart(sympify(${q(e)}), symbols(${q(v)}))`),
    texpand: (e) => run(`expand_trig(sympify(${q(e)}))`),
    desolve: (e, fn, v) =>
      run(
        `dsolve(sympify(${q(e)}, locals={${JSON.stringify(fn)}: Function(${JSON.stringify(fn)})}), Function(${JSON.stringify(fn)})(symbols(${q(v)})))`,
      ),
    laplace: (e, v) =>
      run(`laplace_transform(sympify(${q(e)}), symbols(${q(v)}), symbols('s'), noconds=True)`),
    ilaplace: (e, v) =>
      run(`inverse_laplace_transform(sympify(${q(e)}), symbols('s'), symbols(${q(v)}), noconds=True)`),
  };
}
