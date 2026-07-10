# Phase 22 — HP Prime

**Delivers:** HP Prime · color touchscreen faceplate + Home/CAS split + Apps framework + textbook/algebraic/RPN entry + HP PPL + distributions & hypothesis tests + spreadsheet · **Era:** 2013 · **Builds on:** Phase 21 (HP-35s, RPN⇄ALG entry) — HP-48G enhanced graphing + input forms (P18), heavy CAS Pyodide+SymPy (P19), light CAS (P14), units (P13), finance (P7), matrices (P9), regression/curve-fit + distributions (P16), programmability sandbox (P3).

## Goal
Deliver the HP Prime — the modern flagship — as the most feature-complete faceplate before native
mode. It introduces a **color 320×240 touchscreen** with a context-sensitive softkey row, a formal
**Home (numeric) ⇄ CAS (symbolic)** split over the two engine tiers already built, an **Apps
framework** (Function/Statistics/Solve/Finance/… as selectable app contexts), three entry modes
(algebraic/textbook/RPN), the **HP PPL** programming language on the P3 sandbox, and probability
**distributions + hypothesis tests**. Almost every computation reuses an existing engine module;
this phase is chiefly the Home/CAS routing, the app/PPL frameworks, the touchscreen UI, and the
statistics-inference additions.

## Models delivered
- **HP Prime** (2013) — single blue Shift + orange ALPHA; color touchscreen with a bottom softkey
  menu, rocker wheel, and app/view keys (Apps, Symb, Plot, Num, Home, CAS). Configurable algebraic
  (default) / textbook / RPN entry. Faceplate per `hp/layouts/HP-Prime.md`, functions per
  `hp/functions/HP-Prime.md`.

## Engine capabilities added
Extends architecture §3 (CAS tiers, value tower) and §4 feature modules:
- **Home/CAS context router** (`src/lib/engine/context/homeCas.ts`) — Home evaluates numerically
  (BigNumber, capitalised functions `CEILING`, `TvmFV`, `NORMALD`) via the P1 tower; CAS evaluates
  symbolically/exactly (lowercase `diff`, `factor`, `simplify`, `solve`) via the P14 light tier
  with the P19 heavy tier (Pyodide+SymPy) lazy-loaded for hard cases. `CAS.` prefix invokes CAS
  from Home; `evalf`/`exact` bridge the two. Each context keeps its own history and variables.
- **Apps framework** (`src/lib/engine/apps/`) — an `App` interface (Symbolic/Plot/Numeric views +
  named functions) with built-in apps mapping onto existing engines: Function/Advanced Graphing →
  P17/P18 plotting, Statistics 1Var/2Var (`Do1VStats`/`Do2VStats`, `PredX`/`PredY`) → P16 stats,
  Solve (`SOLVE`, `Solve2x2`/`Solve3x3`/`LinSolve`) → P9 SOLVE + linear algebra, Finance
  (`TvmFV`/`TvmPMT`, `CashFlowNPV`/`CashFlowIRR`, `BondPrice`, `BlackScholes`, `Depreciate`) → P7
  finance, Triangle Solver (`AAS`/`ASA`/`SAS`/`SSA`/`SSS`), Spreadsheet (`SUM`/`AVERAGE`/`STAT1`/
  `STAT2`/`REGRS`/`AMORT`).
- **Probability distributions** (`src/lib/engine/stats/distributions.ts`) — `NORMALD`/`STUDENT`/
  `CHISQUARE`/`FISHER`/`BINOMIAL`/`GEOMETRIC`/`POISSON` in density, `_CDF`, and `_ICDF` forms.
- **Hypothesis tests + confidence intervals** (`src/lib/engine/stats/inference.ts`) — `HypZ1mean`/
  `HypZ2mean`/`HypT1mean`/`HypT2mean`, `HypZ1prop`/`HypZ2prop`, `ConfZ1mean`/`ConfT1mean`,
  `Chi2GOF`/`Chi2TwoWay`, `LinRegrTTest`, driven by `DoInference`.
- **HP PPL interpreter** (`src/lib/engine/ppl/`) — a Pascal-like language (`BEGIN…END`, `IF/CASE`,
  `FOR/WHILE/REPEAT`, `LOCAL`/`EXPORT`, `:=`, `INPUT`/`MSGBOX`/`PRINT`/`CHOOSE`) parsed to an AST
  and run on the **P3 Web-Worker sandbox** (never `eval`, step/time limits). Drawing/`GETKEY` I/O
  is stubbed against the display surface.
- **Spreadsheet app** (`src/lib/engine/apps/spreadsheet.ts`) — a cell grid with formula evaluation
  through the engine parser; `SUM`/`AVERAGE`/`STAT1`/`STAT2`/`REGRS`/`AMORT` over ranges.

## PRD requirements covered
- **FR-STK-3/4** — algebraic/textbook entry and configurable RPN vs algebraic logic.
- **FR-CAS-1/2/3/4/6** — symbolic diff/int/simplify/factor/solve in the CAS view, rendered as
  KaTeX; **FR-CAS-5** — heavy-tier SymPy for hard CAS (reuses P19).
- **FR-STAT-2** — regression/curve fit (Statistics 2Var, `REGRS`); **FR-STAT-3** — distributions
  (pdf/cdf/icdf) + inference.
- **FR-UI-1** — large display showing history, stack, and KaTeX; **FR-UI-6** — light/dark themes.
- **FR-FIN-1/2/3/4/5** — Finance app TVM/cashflow/bond/Black-Scholes/depreciation (reuses P7).
- **FR-PRG-1/2/3/4** — PPL programs recorded/edited/run in the sandbox; app variables/directories.
- **FR-MODEL-1/2/3/4/5** — touchscreen faceplate; key+Shift/ALPHA dispatch; per-app exposure;
  runtime switching; annunciators/softkey labels.

## Key tasks
- **Engine:** `context/homeCas.ts` (numeric/symbolic routing + `CAS.`/`evalf`/`exact` bridges),
  `apps/` framework + built-in apps wiring to P7/P9/P16/P17/P18, `stats/distributions.ts`,
  `stats/inference.ts`, `ppl/` parser+interpreter on the P3 sandbox, `apps/spreadsheet.ts`.
- **Model adapter / data:** expose the HP-Prime set from `hp/functions/HP-Prime.md`; map primary +
  blue Shift + orange ALPHA and the app/view keys via `mapping.json`; route Toolbox menus
  (Math/CAS/App/User/Catlg) to the correct context.
- **Faceplate / UI:** color-touchscreen faceplate from `hp/layouts/HP-Prime.md` (three functions/
  key, rocker wheel, bottom softkey row); tabbed Home/CAS/Plot/Num/Symb views; on-screen touch
  softkeys; Apps launcher; textbook (2-D math) entry via KaTeX; a minimal spreadsheet grid.
- **Tests:** Home vs CAS results; each app's headline function; distributions/inference values;
  a small PPL program; spreadsheet range functions.

## New dependencies
None mandatory — reuses math.js (P1), light CAS (P14) + Pyodide/SymPy heavy tier (P19), plotting
(P17/P18), decimal.js finance (P7). Add **simple-statistics** (if not already pulled in by P16)
for distribution tails/erf, per architecture §4; keep any heavy tier lazy-loaded (NFR-3).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: Home `2/6` → `0.333333333333`, CAS `2/6` →
  `1/3`; CAS `factor(x^2-1)` → `(x-1)(x+1)`, `diff(sin(x),x)` → `cos(x)`; `NORMALD_CDF(0,1,1.96)`
  ≈ `0.975`; `HypT1mean` returns a t-statistic/p-value matching the guide; Finance `TvmFV` on a
  known loan matches P7; a PPL `EXPORT sq(x) BEGIN RETURN x*x; END;` returns `9` for `sq(3)`.
- e2e: switching Home⇄CAS gives decimal vs exact for the same input; Apps launcher opens the
  Statistics app and computes 1-var stats; a textbook-mode fraction renders via KaTeX; a softkey
  menu tap invokes a Math-menu function; dark theme toggles (FR-UI-6).
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; fidelity vs `hp/layouts/HP-Prime.md`.

## Notes / risks
- Home/CAS is the central seam — variables and history are per-context; be explicit about which
  tier a function belongs to (capitalised = Home/numeric, lowercase = CAS/symbolic) and test the
  `CAS.`/`evalf` bridges so results don't silently cross contexts.
- PPL is a real language — scope to the documented core (structure/flow/I-O/strings); defer the
  full drawing/GROB command set and mark it in the notebook. Reuse the P3 sandbox; do not add a
  second interpreter.
- Touchscreen fidelity: the softkey row and rocker wheel are load-bearing to the Prime's feel —
  render the bottom context menu from app state, not hardcoded labels (SM-1).
- Heavy CAS (Pyodide) must stay lazy — the Prime faceplate must not pull SymPy into the initial
  bundle; show a loading state on first CAS-heavy use (NFR-3/NFR-4).
