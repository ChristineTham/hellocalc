// Minimal typings for nerdamer-prime (untyped CJS) — only the surface the
// light CAS provider touches (src/lib/engine/cas/nerdamer-provider.ts).
declare module "nerdamer-prime" {
  interface NerdamerExpr {
    toString(): string;
    toTeX(): string;
    evaluate(): NerdamerExpr;
  }
  interface NerdamerStatic {
    (expr: string, subs?: Record<string, string | number>): NerdamerExpr;
    diff(expr: string, variable: string, n?: number): NerdamerExpr;
    integrate(expr: string, variable: string): NerdamerExpr;
    /** provided by the Solve add-on module */
    solve(expr: string, variable: string): NerdamerExpr;
  }
  const nerdamer: NerdamerStatic;
  export default nerdamer;
}

// side-effect add-on modules (they register functions on the core)
declare module "nerdamer-prime/Calculus" {
  const x: unknown;
  export default x;
}
declare module "nerdamer-prime/Algebra" {
  const x: unknown;
  export default x;
}
declare module "nerdamer-prime/Solve" {
  const x: unknown;
  export default x;
}
