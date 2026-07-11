# Phase 21 — HP-35s

**Delivers:** HP-35s · dual RPN⇄algebraic entry + equation solver + physical-constants library + vectors + numerical integration · **Era:** 2007 · **Builds on:** Phase 20 (HP-50g) — and complex/matrix/SOLVE/∫ (P9), menu-driven RPN + stats/regression (P16), value tower/stack machine (P1), scientific fns (P1), probability (P8), base/logic (P10)

## Goal
Complete the HP-35s — the 2007 retro-styled RPN scientific — by adding the last engine pieces a
non-graphing scientific calculator needs: a **configurable entry mode** so the same 4-level
stack accepts either RPN keystrokes or a typed algebraic expression, an **equation list** driving
`SOLVE` and `∫` over named-variable equations (not just labeled programs), a **41-item physical-
constants library** (`CONST` menu), and 2-D/3-D **vector** arithmetic — all wired into the live
HP-35s faceplate (yellow/blue shift planes already playable). Everything reuses the P1 BigNumber
tower, the P9 root-finder/integrator, and the P16 stats registers — this phase is mostly
integration plus the constants dataset and the RPN/ALG entry switch.

## Models wired live
- **HP-35s** (2007) — yellow left-shift (←) / blue right-shift (→) Voyager-grid scientific with a
  two-line dot-matrix LCD; runs in RPN or ALG (MODE menu), 800 program lines, 26 direct variables
  A–Z + indirect I/J. The faceplate is **already playable** (yellow/blue planes + A–Z letters);
  this phase completes its function coverage per `hp/functions/HP-35s.md` (fidelity reference:
  `hp/layouts/HP-35s.md`).

## Engine capabilities added
Extends architecture §3 stack machine + §4.6 numerics + value tower:
- **Configurable logic mode (RPN ⇄ ALG)** (`src/lib/engine/entry/mode.ts`) — the `MODE` menu
  toggles between the P1 4-level RPN stack machine and an **algebraic infix entry buffer** that
  parses through the existing math.js parser (P1) and pushes the result to X. Angle mode, display
  format, and variables are shared across both; only entry semantics differ.
- **Equation list + SOLVE/∫ over equations** (`src/lib/engine/solver/equations.ts`) — `EQN` enters
  an equation into a persisted list; `SOLVE` finds a root for a chosen named variable and `∫FN`
  integrates a chosen variable, both evaluating the equation (or a program selected by `FN=`)
  through the P9 `solve.ts` / `integrate.ts` engines. Equations use named variables (A–Z), not the
  RPN stack, so the solver prompts for the unknown.
- **Physical-constants library** (`src/lib/engine/data/constants.ts`) — the 41 CONST items
  (`speed of light` c, `Newtonian G`, `Avogadro` NA, `Planck` h, `Boltzmann` k, `elementary charge`
  e, `molar gas constant` R, `standard gravity` g, `Stefan–Boltzmann` σ, `fine structure constant`
  α, …) with CODATA values and units; `→CONST` opens the menu and pushes the selected value to X.
- **Vector value type** (`src/lib/engine/vector.ts`) — 2-D/3-D vectors entered with `[ ]`; `+`/`−`
  add/subtract equal-length vectors, `×`/`÷` scale by a scalar, `ABS` gives magnitude, and `DOT`
  the dot product. Built on math.js arrays, distinct from the P9 A–E matrices.
- **Fraction display + IDIV/RMDR/IP/FP/SGN** equation functions and the base/logic menu reuse from
  P10 (`DEC`/`HEX`/`OCT`/`BIN`, `AND`/`OR`/`XOR`/`NOT`/`NAND`/`NOR`). (IP/FP kin: the prototype
  already dispatches ABS/INT/FRAC on JS numbers — port onto the value tower with reference tests.)

## PRD requirements covered
- **FR-STK-3** — algebraic (infix) entry mode alongside RPN.
- **FR-STK-4** — configurable logic mode (RPN vs algebraic) on a model that supports both.
- **FR-SOLVE-1** — numerical root finder over the equation list (`SOLVE`).
- **FR-SOLVE-2** — numerical definite integration (`∫FN`).
- **FR-STAT-1** — descriptive statistics via `Σ+`/`Σ−`, `x̄`/`ȳ`, `sx`/`σx`, `SUMS` (reuses P2/P16).
- **FR-STAT-4** — `nCr`, `nPr`, `!` (reuses P8).
- **FR-MODEL-1/2/3/5** — faithful two-line dot-matrix faceplate (live); key + ←/→ prefix
  dispatch via `mapping.json`; only HP-35s functions exposed; ALG/RPN/EQN/annunciator row.
- **NFR-5** — HP reference correctness to configured precision.

## Key tasks
- **Engine:** `entry/mode.ts` (RPN/ALG switch over shared state), `solver/equations.ts` (equation
  list + SOLVE/∫ binding named vars to P9 numerics), `data/constants.ts` (41 CODATA constants),
  `vector.ts` (2-D/3-D arithmetic + DOT), fraction-display + IDIV/RMDR/IP/FP/SGN equation ops.
- **Model adapter / data:** expose the HP-35s set from `hp/functions/HP-35s.md`; map primary +
  ← (yellow) / → (blue) prefixes and direct A–Z variable entry via `mapping.json`; wire `MODE`,
  `EQN`, `SOLVE`, `∫FN`, `FN=`, `→CONST`, `[ ]`, `BASE`, `LOGIC`, `FLAGS` menus.
- **Wiring / UI:** two-line display behavior on the live glass (entry line + result line);
  annunciator row states (ALG/RPN/EQN/GRAD/A..Z/HYP/HEX/OCT/BIN); cursor-navigated menus (no
  softkeys); CONST picker. (The 35s faceplate — yellow/blue planes + letters — is already live.)
- **Tests:** RPN vs ALG entry equivalence; equation SOLVE/∫; constants values; vector ops; stats.

## New dependencies
None — reuses math.js (P1), the P9 `solve.ts`/`integrate.ts` numerics, and the P8/P16 stats. The
constants dataset ships as a static TS module (no runtime fetch, base-path-safe).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: in RPN `2 ENTER 3 +` → `5`; in ALG `2 + 3 =` →
  `5` (same shared X); `SOLVE` on the stored equation `X² − 2 = 0` for X → `1.41421356237`;
  `∫FN` of `SIN(X)` over `0..π` (RAD) → `2` (adaptive tolerance); `→CONST` speed of light →
  `299792458`; vector `[1,2,3] DOT [4,5,6]` → `32`; `[3,4] ABS` → `5`; `4 nCr 2` → `6`.
- E2e on the live faceplate: MODE switches RPN⇄ALG and both compute `5` from the same keys'
  meaning; `EQN … SOLVE` prompts for the unknown and returns the root; CONST menu pushes a
  constant; a 3-D vector entry renders in the display.
- **No HP-35s key remains inert** — every function in `hp/functions/HP-35s.md` resolves to an
  engine command.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; the existing UI suites
  (geometry, promotion, typing) stay green.

## Notes / risks
- ALG mode is *entry* only — the underlying value tower, precision, and functions are unchanged;
  keep the RPN stack live under ALG so `LASTx` and mode switching mid-session stay coherent.
- Equation SOLVE/∫ run user equations per iteration; keep the P3 Web-Worker step/time limits so a
  divergent equation can't hang the tab (NFR-9).
- Constants: pin to CODATA values and cite the edition in a comment; the HP-35s rounds to 12
  digits — verify displayed values match the manual's CONST table, not just the underlying value.
- Vectors vs matrices: the 35s treats vectors as first-class stack objects — ensure lift/drop
  (P1) handles a vector in X without coercing it to a matrix (P9).
