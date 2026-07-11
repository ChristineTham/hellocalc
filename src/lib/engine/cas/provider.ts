// src/lib/engine/cas/provider.ts
// The CasProvider seam (P14, architecture §3/§4.3, NFR-8): ONE interface all
// symbolic tiers implement — the lazy Nerdamer light tier now, Pyodide+SymPy
// (P19) later — so the engine never knows which CAS is loaded. Methods are
// SYNCHRONOUS: loading is the caller's async problem (the React seam awaits
// the lazy import, then registers the provider here); the engine stays pure
// and synchronous. Expressions travel as RPL algebraic SOURCE strings.

export interface CasProvider {
  /** d/dx — symbolic derivative (FR-CAS-1) */
  diff(expr: string, variable: string): string;
  /** ∫ — antiderivative, no +C term (FR-CAS-2; documented convention) */
  integrate(expr: string, variable: string): string;
  expand(expr: string): string;
  simplify(expr: string): string;
  factor(expr: string): string;
  /** solutions of expr = 0 for the variable (FR-CAS-4) */
  solve(expr: string, variable: string): string[];
  /** Taylor polynomial of order n about x = 0 */
  taylor(expr: string, variable: string, order: number): string;
  /** LaTeX for the KaTeX pipeline (FR-CAS-6/FR-IO-1) */
  toLatex(expr: string): string;
}

let current: CasProvider | null = null;

export function setCas(p: CasProvider): void {
  current = p;
}

export const getCas = (): CasProvider | null => current;
export const casReady = (): boolean => current !== null;
