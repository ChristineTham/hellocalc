# Phase 9 — Complex, matrices, SOLVE & ∫ — HP-15C

**Delivers:** HP-15C · complex numbers + matrices/linear algebra + numerical SOLVE & ∫ + hyperbolics · **Era:** 1982 · **Builds on:** Phase 8 (probability) + the live faceplate fleet — and the value tower/stack machine (P1), programmability (P3–P6), stats (P2/P8)

## Goal
Deliver the HP-15C — the most capable Voyager scientific-programmable — by adding four
substantial engine subsystems, wired into the live HP-15C faceplate: a complex-number value
type with a parallel imaginary stack, matrices A–E with linear algebra, a numerical root finder
(`SOLVE`) and adaptive integrator (`∫ˣy`) over compiled expressions, and the six hyperbolic
functions. All reuse the existing BigNumber tower and 4-level stack machine rather than
replacing them.

## Models wired live
- **HP-15C** (1982) — gold `f` / blue `g` Voyager scientific-programmable; complex mode, matrices,
  SOLVE and ∫ over labeled programs. The faceplate is **already playable** (generated from
  `mapping.json`, f/g promotion live) on the prototype engine; this phase completes its function
  set per `hp/functions/HP-15C.md` so no key remains inert (fidelity reference:
  `hp/layouts/HP-15C.md`).

## Engine capabilities added
Extends architecture §3 value tower + feature modules (§4.5 matrices, §4.6 numerics):
- **Complex value type** (math.js `Complex`) — rectangular & polar entry/display, activated by
  `I`, `Re≷Im`, or `SF 8`; `(i)` shows the imaginary X while held. A **parallel imaginary stack**
  mirrors X/Y/Z/T so trig/log/power ops run complex when Complex mode (flag 8) is set. `→R`/`→P`
  reused from P2 for polar conversion.
- **Matrix type A–E + linear algebra** (`src/lib/engine/matrix.ts`) on math.js core with
  **ml-matrix** (lazy) for heavier ops: `DIM`/`RCL DIM` (dimension), `MATRIX 4` transpose,
  `MATRIX 5` transpose-multiply YᵀX, `MATRIX 7`/`8` row & Frobenius norms, `MATRIX 9` determinant
  via LU, inverse (`1/x` on a matrix), solve `Ax=b` (`÷`), `RESULT` target register, `MATRIX 1`
  pointer reset, and the complex↔partitioned transforms (`MATRIX 2/3`, `Py,x`/`Cy,x`).
- **Numerical SOLVE** (`src/lib/engine/numerics/solve.ts`) — find a real root of a labeled `f(x)`
  via Newton/secant with Brent fallback, over `math.compile(expr)` evaluated repeatedly per §4.6.
- **Numerical ∫** (`src/lib/engine/numerics/integrate.ts`) — adaptive Simpson / Romberg definite
  integration of a labeled `f(x)` between limits in Y and X.
- **Hyperbolics** — `HYP`/`HYP⁻¹` prefixes combine with SIN/COS/TAN for the six hyperbolic and
  inverse-hyperbolic functions, added to the scientific op registry.

## PRD requirements covered
- **FR-NUM-4** — complex numbers (rectangular & polar entry/display).
- **FR-MAT-1/2** — matrix entry/display/element editing; add/mul/transpose, determinant, inverse,
  solve `Ax=b`, norms.
- **FR-MAT-3** — decompositions (LU for determinant/solve; ml-matrix seam for QR/SVD later).
- **FR-MAT-4** — complex-valued matrices (`MATRIX 2/3`, `Py,x`/`Cy,x` transforms).
- **FR-SOLVE-1** — numerical root finder (`SOLVE`).
- **FR-SOLVE-2** — numerical definite integration (`∫ˣy`).
- **FR-MODEL-1/2/3/5** — faithful HP-15C faceplate (live); key+prefix dispatch via `mapping.json`;
  only HP-15C functions exposed; LCD annunciators (f/g, C for complex, DEG/RAD/GRD).
- **NFR-3** — ml-matrix lazy-loaded; **NFR-5** — HP reference correctness.

## Key tasks
- **Engine:** `complex.ts` (imaginary stack + complex-aware ops), `matrix.ts` (A–E registers,
  RESULT target, math.js + lazy ml-matrix), `numerics/solve.ts`, `numerics/integrate.ts`, and
  hyperbolic ops in the scientific registry. SOLVE/∫ call the P3 program interpreter for `f(x)`.
- **Model adapter / data:** expose HP-15C set from `hp/functions/HP-15C.md`; map `MATRIX 0–9`,
  `DIM`, `RESULT`, `SOLVE`, `∫ˣy`, `I`/`Re≷Im`, `HYP`/`HYP⁻¹` via `mapping.json`.
- **Wiring / UI:** cover `hp/functions/HP-15C.md` end-to-end so no key stays inert; new
  capability UI: matrix entry/editor view, complex-mode `C` annunciator on the existing glass,
  imaginary-X peek on `(i)`.
- **Tests:** complex arithmetic + polar; matrix det/inverse/solve/transpose; SOLVE & ∫ against
  Owner's-Handbook examples; hyperbolic identities.

## New dependencies
- **ml-matrix** — decompositions (QR/LU/SVD/eigen), lazy `import()` per architecture §5 (verified).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: `2 [ENTER] 3 [f] I` builds `2 + 3i`, `x²` →
  `-5 + 12i`; a 2×2 `A` with `MATRIX 9` (determinant) and inverse matching the handbook; `SOLVE`
  on `f(x)=x²−2` (LBL A) → `1.414213562`; `∫` of `f(x)=sin x` over `0..π` (RAD) → `2`.
- E2e on the live faceplate: enter matrix A via `DIM`/`STO`, run `MATRIX 9`; complex `f I`
  toggles the `C` annunciator; `f SOLVE A` returns the root to the display.
- **No HP-15C key remains inert** — every function in `hp/functions/HP-15C.md` resolves to an
  engine op.
- The existing UI suites (geometry, promotion, typing) stay green.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green.

## Notes / risks
- Complex mode's parallel imaginary stack must interact correctly with lift/drop from P1 — cover
  edge cases (real op leaving imaginary part intact) in tests.
- SOLVE/∫ evaluate a user program per iteration; enforce the P3 Web-Worker step/time limits so a
  divergent `f(x)` can't hang the tab (NFR-9).
- HP-15C shares data registers R0–R19 with a common pool (R20–R65) for matrices, imaginary stack,
  and SOLVE/∫ scratch — model the pooled allocation (`DIM (i)`, `MEM`) faithfully.
