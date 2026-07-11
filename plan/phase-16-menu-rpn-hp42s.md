# Phase 16 — Menu-driven RPN & HP-42S

**Delivers:** HP-42S · a menu/softkey system for a 4-level RPN (not RPL) calculator · regression & curve fits · **Era:** 1988 · **Builds on:** the live faceplate fleet + Phases 9 (complex/matrix/SOLVE/∫) & 14 (KaTeX + light CAS output); reuses Phase 10 (base) and Phase 8 (probability)

## Goal
Make the **HP-42S** — the most capable classic-stack RPN machine — behave like a 42S, by building
its **menu/softkey system for a 4-level RPN calculator** (distinct from the Phase-12 RPL softkey
menus). The faceplate already renders and is playable: dot-matrix glass, single gold shift, and a
prototype `src/lib/engine/rpn.ts` driving the primary keys on JS numbers — the menu keys sit
inert. The 42S keeps the fixed `X/Y/Z/T`+`LAST X` stack from Phase 1 but reaches its huge function
set through **shifted menu keys** (STAT, MATRIX, BASE, PROB, SOLVER, ∫f(x), CONVERT, FLAGS, MODES,
DISP, PGM.FCN) and a 6-label softkey row over the two-line dot-matrix display. Most math already
exists (complex, matrices, SOLVE, ∫ from Phase 9; base from Phase 10; probability from Phase 8) —
the new engine work is **regression & curve fitting** and the RPN menu/named-variable machinery.

## Models wired live
- **HP-42S** (1988) — Pioneer-series RPN, 4-level stack, two-line 22-char dot-matrix LCD with a
  6-key menu row and 7 annunciators; complex, matrices, solver, numeric ∫, base, stats, and
  curve-fitting all via menus. The faceplate is already playable (`hp/layouts/HP-42S.md` stays
  the fidelity reference); this phase completes function coverage per `hp/functions/HP-42S.md`.

## Engine capabilities added
Built on the existing stack machine and feature modules; new work is stats + the menu layer:
- **Regression / curve fitting** (`src/lib/engine/stats-fit.ts`) on the accumulated Σ data: the
  42S **CFIT** models `LINF` (linear), `LOGF` (logarithmic), `EXPF` (exponential), `PWRF` (power),
  plus `BEST` (auto-pick by correlation), `CORR`, `SLOPE`, `YINT`, and `FCSTX`/`FCSTY` forecasts.
  Implement over `simple-statistics` + the math.js tower (architecture §4.8).
- **Extended STAT accumulation:** `Σ+`/`Σ−` x,y pairs, `SUM`, `MEAN`, `WMEAN` (weighted mean),
  `SDEV`, `ALLΣ`/`LINΣ` modes, `ΣREG`/`ΣREG?` summation-register base — extends Phase-2 descriptive
  stats to two-variable data feeding the fits.
- **RPN menu / softkey system** (`src/lib/models/menu.ts`): a menu-state model for a 4-level RPN
  faceplate — shifted keys open menus, 6 softkey labels map to functions/submenus, `EXIT`/`EXITALL`
  pop, menus can nest (STAT→CFIT, BASE→LOGIC, PGM.FCN). Distinct from the RPL menu stack (Phase 12).
- **Named variables + variable menus:** `STO`/`RCL` to **named** registers (not just numbered),
  `MVAR` (declare a menu variable) and `VARMENU` building a softkey menu from a program's `MVAR`s —
  the mechanism the SOLVER and ∫f(x) use to prompt for inputs.
- **Custom menus:** `ASSIGN`/`CUSTOM`/`KEYASN` bind functions to the CUSTOM menu row; `CLKEYS`/
  `CLMENU` clear them.
- **Two-line dot-matrix display model** with the menu-label row and annunciators — the state model
  behind the dot-matrix glass that already renders (its menu-label row is unpopulated today).

## PRD requirements covered
- **FR-STAT-2 (S)** — linear regression and curve fits (HP-42S CFIT parity: LINF/LOGF/EXPF/PWRF,
  BEST/CORR/SLOPE/YINT/FCSTX/FCSTY).
- **FR-STAT-3 (S)** — probability groundwork: the 42S itself exposes no distribution functions, so
  this phase only lays the two-variable stats/forecast foundation; distribution pdf/cdf/quantile
  coverage is confirmed and delivered with the 48/50g stat apps (deferred, per architecture §4.8).
- **FR-MODEL-5 (S)** — model-appropriate display: two-line dot-matrix styling, the 6-label menu
  row, and annunciators (shift, angle mode, complex, program).
- Reinforces **FR-NUM-4** (complex), **FR-MAT-*** (matrices), **FR-SOLVE-1/2** (SOLVER, ∫f(x)),
  **FR-STAT-1/4** (descriptive stats, PROB `COMB`/`PERM`/`N!`/`GAMMA`), **FR-EXP-2** (named vars).

## Key tasks
- **Engine:** `stats-fit.ts` (LINF/LOGF/EXPF/PWRF/BEST/CORR/SLOPE/YINT/FCSTX/FCSTY); extend Σ
  accumulation (x,y pairs, WMEAN, ALLΣ/LINΣ, ΣREG); named-variable store; `MVAR`/`VARMENU` model.
- **Model adapter / data:** `menu.ts` RPN menu/softkey engine; HP-42S exposure from
  `hp/functions/HP-42S.md` via `hp/mapping/mapping.json`; map shifted menu keys + softkeys to
  ops/submenus; `ASSIGN`/`CUSTOM` bindings. No hand-authored maps; reuse Phase-9/10/8 ops.
- **Wiring / UI:** the softkey MENU system — populate the 6 softkey labels on the live dot-matrix
  glass and make the top key row context-sensitive; menu navigation + EXIT/EXITALL.
- **Tests:** curve-fit unit tests vs HP manual examples; menu-navigation + softkey e2e.

## New dependencies
None new to install — **`simple-statistics`** is already in the eager core (architecture §5) and
backs the regression fits. Complex/matrix/SOLVE/∫ come from Phase 9, base from Phase 10.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - Linear fit (`LINF`) on the HP-42S manual data set → `SLOPE`, `YINT`, `CORR` match the manual;
    `FCSTY` at a given x matches the manual's forecast.
  - `EXPF`/`PWRF`/`LOGF` recover the correct model on data generated from each; `BEST` selects the
    highest-correlation model.
  - `5 3 COMB` → `10`, `5 N!` → `120` via the PROB menu (reuse Phase-8 core).
- E2e on the live faceplate: open STAT→CFIT via the softkey menus, run a fit, read `SLOPE`/`CORR`
  off the softkey row; `ASSIGN` a function to CUSTOM and invoke it; `EXIT` pops back to the top menu.
- **No HP-42S key remains inert** — every function in `hp/functions/HP-42S.md` resolves to an
  engine command (CATALOG-only functions included).
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; the existing UI suites
  (geometry, promotion, typing) stay green.

## Notes / risks
- **RPN menus ≠ RPL menus.** Keep `menu.ts` (fixed-stack, softkey-driven 42S) separate from the
  Phase-12 RPL menu system; they share the softkey UI widget but not the stack semantics.
- CFIT model transforms (log/exp/power linearize before least-squares) must match HP's convention
  so `SLOPE`/`YINT`/`CORR` reproduce manual numbers — lock the transforms in tests.
- Only `LINΣ` (6 registers) vs `ALLΣ` (13) changes which stats are available; drive that from the
  mode flag, don't hardcode per fit.
- The 42S is famously function-dense; rely on `hp/functions/HP-42S.md` + mapping data for exposure
  so nothing is hand-enumerated and the CATALOG-only functions still resolve.
