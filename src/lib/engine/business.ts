// src/lib/engine/business.ts
// The Pioneer/clamshell business machines (HP-17B/17BII/19B/19BII/18C): the
// BUS percentages, interest-rate conversion (ICNV), and — the signature
// feature of this line — the algebraic equation SOLVER. The SOLVER lets the
// user type an ordinary equation (e.g. "MU%C = (PRICE-COST)/COST×100"), then
// solves it for ANY one variable by treating the others as knowns and
// bracketing a root of (LHS − RHS). Built on the shared value tower (BigNumber)
// and math.js's expression parser. Pure TS — no React/DOM.

import { bn, math, type Value } from "./config";

// ---- BUS: business percentages (FR-BUS-*) -------------------------------------

/** %CHG: percent change from `old` to `new` = (new−old)/old·100. */
export function pctChange(oldV: Value, newV: Value): Value | null {
  if (oldV.isZero()) return null;
  return newV.minus(oldV).div(oldV).times(100);
}

/** %TOTL: `part` as a percent of `total` = part/total·100. */
export function pctTotal(total: Value, part: Value): Value | null {
  if (total.isZero()) return null;
  return part.div(total).times(100);
}

/** MU%C: markup as a percent of COST = (price−cost)/cost·100. */
export function markupOnCost(cost: Value, price: Value): Value | null {
  if (cost.isZero()) return null;
  return price.minus(cost).div(cost).times(100);
}

/** MU%P: markup (margin) as a percent of PRICE = (price−cost)/price·100. */
export function markupOnPrice(cost: Value, price: Value): Value | null {
  if (price.isZero()) return null;
  return price.minus(cost).div(price).times(100);
}

// ---- ICNV: nominal ⇄ effective interest conversion (FR-FIN-ICNV) ---------------

/** Nominal annual rate → effective annual rate, compounding P times/year:
 * EFF% = ((1 + NOM%/100/P)^P − 1)·100. */
export function nomToEff(nomPct: Value, periods: Value): Value {
  const p = periods;
  const r = nomPct.div(100).div(p);
  return r.plus(1).pow(p).minus(1).times(100);
}

/** Effective annual rate → nominal annual rate, compounding P times/year:
 * NOM% = ((1 + EFF%/100)^(1/P) − 1)·P·100. */
export function effToNom(effPct: Value, periods: Value): Value {
  const p = periods;
  const oneP = bn(1).div(p);
  return effPct.div(100).plus(1).pow(oneP).minus(1).times(p).times(100);
}

// ---- SOLVE: the algebraic equation solver -------------------------------------

const VAR_RE = /^[A-Za-z][A-Za-z0-9]*$/;

/** Reserved identifiers the parser knows as functions/constants — never treated
 * as user solver variables. */
// Only genuine math.js constants/functions are reserved — NOT plain letters like
// L/G/E, which are legitimate single-letter variables (mapping them to reserved
// silently dropped them from the solver menu). The ALPHA keyboard types upper
// case, so the common function names are reserved in both cases.
const RESERVED = new Set([
  "pi", "e",
  "sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh",
  "sqrt", "abs", "exp", "ln", "log", "min", "max", "mod", "pow",
  "SIN", "COS", "TAN", "ASIN", "ACOS", "ATAN", "SQRT", "ABS", "EXP", "LN", "LOG",
]);

/** Collect the distinct variable names appearing in an equation string
 * ("LHS = RHS"). Order is first-appearance — the machines build the SOLVER
 * menu in exactly that order. Returns null if the equation can't be parsed or
 * has no "=". */
export function solverVariables(equation: string): string[] | null {
  const eq = equation.trim();
  const idx = splitEquals(eq);
  if (idx < 0) return null;
  let nodeSides;
  try {
    nodeSides = [math.parse(eq.slice(0, idx)), math.parse(eq.slice(idx + 1))];
  } catch {
    return null;
  }
  const seen = new Set<string>();
  const order: string[] = [];
  for (const node of nodeSides) {
    node.traverse((n) => {
      // SymbolNode has a `.name`; function calls have `.fn` (also a SymbolNode)
      const anyN = n as { type?: string; name?: string; fn?: unknown };
      if (anyN.type === "SymbolNode" && anyN.name && VAR_RE.test(anyN.name)) {
        // a SymbolNode that is the callee of a function is n's parent's `.fn`;
        // math.js exposes function names as SymbolNodes too, so filter reserved
        if (!RESERVED.has(anyN.name) && !seen.has(anyN.name)) {
          seen.add(anyN.name);
          order.push(anyN.name);
        }
      }
    });
  }
  return order;
}

/** Split at the top-level '=' (not '==', '<=', '>='). Returns the index of the
 * '=' character, or −1 if none / ambiguous. */
function splitEquals(eq: string): number {
  let depth = 0;
  for (let i = 0; i < eq.length; i++) {
    const c = eq[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "=" && depth === 0) {
      const prev = eq[i - 1];
      const next = eq[i + 1];
      if (prev === "=" || prev === "<" || prev === ">" || prev === "!" || next === "=") continue;
      return i;
    }
  }
  return -1;
}

/** Compile an equation into a residual function f(scope) = LHS − RHS. */
function residualFn(equation: string): ((scope: Record<string, Value>) => Value) | null {
  const idx = splitEquals(equation);
  if (idx < 0) return null;
  let lhs, rhs;
  try {
    lhs = math.parse(equation.slice(0, idx)).compile();
    rhs = math.parse(equation.slice(idx + 1)).compile();
  } catch {
    return null;
  }
  return (scope) => {
    const l = lhs.evaluate(scope);
    const r = rhs.evaluate(scope);
    return math.bignumber(math.subtract(l, r) as Value);
  };
}

export interface SolveResult {
  value: Value;
  /** true when the residual at the solution is essentially zero. */
  converged: boolean;
}

/**
 * Solve `equation` for `unknown`, given numeric values for every other
 * variable. Strategy mirrors the HP Solver: sample the residual to bracket a
 * sign change, then bisect to full precision; direct linear equations resolve
 * in the first refinement. `guess` seeds the sampling window. Returns null when
 * no root can be bracketed (the machines show "NO ROOT FOUND").
 */
export function solveEquation(
  equation: string,
  known: Record<string, Value>,
  unknown: string,
  guess: Value = bn(0),
): SolveResult | null {
  const f = residualFn(equation);
  if (!f) return null;
  const scope = (x: Value): Record<string, Value> => ({ ...known, [unknown]: x });
  const g = (x: Value): Value | null => {
    try {
      const r = f(scope(x));
      return r.isFinite() ? r : null;
    } catch {
      return null;
    }
  };

  // Sample outward from the guess to bracket a sign change.
  const g0 = guess;
  const samples: Value[] = [g0];
  for (let k = 0; k < 60; k++) {
    const step = bn(10).pow(bn(Math.floor(k / 2) - 8)); // 1e-8 … 1e21, doubling coverage
    samples.push(g0.plus(step));
    samples.push(g0.minus(step));
  }
  // de-dup preserving order
  let lo: Value | null = null;
  let hi: Value | null = null;
  let flo: Value | null = null;
  let prevX: Value | null = null;
  let prevF: Value | null = null;
  // scan sorted samples for a bracket
  const sorted = samples.slice().sort((a, b) => (a.minus(b).isNegative() ? -1 : 1));
  for (const x of sorted) {
    const fx = g(x);
    if (fx === null) {
      prevX = null;
      prevF = null;
      continue;
    }
    if (fx.isZero()) return { value: x, converged: true };
    if (prevF !== null && prevX !== null && prevF.isNegative() !== fx.isNegative()) {
      lo = prevX;
      hi = x;
      flo = prevF;
      break;
    }
    prevX = x;
    prevF = fx;
  }
  if (lo === null || hi === null || flo === null) return null;

  // Bisection to precision (non-null locals so the narrowing survives the loop).
  let a: Value = lo;
  let b: Value = hi;
  let fa: Value = flo;
  for (let it = 0; it < 300; it++) {
    const mid = a.plus(b).div(2);
    const fm = g(mid);
    if (fm === null) return null;
    if (fm.abs().lt(bn("1e-24")) || b.minus(a).abs().lt(bn("1e-30"))) {
      return { value: mid, converged: fm.abs().lt(bn("1e-12")) };
    }
    if (fm.isNegative() === fa.isNegative()) {
      a = mid;
      fa = fm;
    } else {
      b = mid;
    }
  }
  return { value: a.plus(b).div(2), converged: false };
}
