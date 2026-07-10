# Phase 7 — Financial engine & HP-12C

**Delivers:** HP-12C · decimal.js finance module (TVM, cash flows, bonds, depreciation, amortization, date math) · **Era:** 1981 · **Builds on:** Phase 6 (finance is independent of programmability; reuses the RPN stack + registers from Phases 1–4)

## Goal
Add the **financial engine** and the iconic **HP-12C** faceplate. Finance is a self-contained
subsystem built directly on **decimal.js** at **currency precision** (explicit rounding
modes), per architecture §4.7 — never on IEEE floats. It plugs into the existing 4-level RPN
stack via a bank of **financial registers** (n, i, PV, PMT, FV) plus cash-flow storage. The
12C is largely non-scientific but keystroke-programmable, so it reuses the Phase-3 program
subsystem.

## Models delivered
- **HP-12C** (1981) — 10-digit financial LCD, f (gold) / g (blue) prefixes, 4-level RPN,
  keystroke programming, continuous memory. Faceplate per `hp/layouts/HP-12C.md`, functions
  per `hp/functions/HP-12C.md`.

## Engine capabilities added
New module **`src/lib/engine/finance.ts`** (pure TS on decimal.js):
- **TVM:** `n, i, PV, PMT, FV` solve-for-any with **BEG/END** annuity modes; `12×`/`12÷`
  helpers; the standard HP-12C equation of value.
- **Cash flows:** `CFo`, `CFj`, `Nj` (grouped uneven flows, up to 20 groups) → **`NPV`** and
  **`IRR`** (iterative, decimal-precise).
- **Bonds:** `PRICE` (from yield to maturity) and `YTM` (from price), 30/360 & actual/actual.
- **Depreciation:** `SL` (straight-line), `SOYD` (sum-of-years-digits), `DB` (declining balance).
- **Amortization:** `AMORT` (split payments into interest/principal, update PV & n), simple
  `INT`.
- **Calendar/date:** `DATE` (date ± days, with day-of-week), `ΔDYS` (days between dates),
  `D.MY`/`M.DY` date-format modes.
- **Percentages:** `%`, `Δ%`, `%T` at currency precision.
- **Financial-register readout:** a display surface showing the n/i/PV/PMT/FV bank.

## PRD requirements covered
- **FR-FIN-1** — TVM (`n,i,PV,PMT,FV`) with begin/end modes.
- **FR-FIN-2** — cash-flow NPV / IRR over uneven flows (CFo/CFj/Nj).
- **FR-FIN-3** — bond price & yield.
- **FR-FIN-5** — amortization, depreciation, interest conversions, calendar/date math.
- **FR-FIN-6** — all finance computed at currency precision (decimal.js), not float.
- **FR-NUM-3** — fixed-point / currency arithmetic with explicit rounding modes.
- (FR-FIN-4 Black-Scholes is out of scope for this model; deferred to a later finance pass.)

## Key tasks
- **Engine:** author `finance.ts` with a `FinancialRegisters` state object and pure functions
  for TVM/NPV/IRR/bond/depreciation/amort/date, all decimal.js with configured rounding.
  Reference (do not depend on) `accurate-financejs` per architecture §4.7. Wire the finance
  registers into the RPN engine so `PV`/`PMT`/etc. store-or-solve from X.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for HP-12C f/g dispatch; map the
  CLEAR brackets (`CLEAR FIN`/`Σ`/`PRGM`/`REG`/`PREFIX`) and financial keys to engine ops.
- **Faceplate / UI:** HP-12C keyboard with f/g legends and colors; BEG/END annunciator;
  financial-register readout; program (P/R) mode reuse.
- **Tests:** engine unit tests with canonical 12C worked examples + Playwright e2e.

## New dependencies
None new — **decimal.js** is already installed (architecture §5). Finance imports it directly,
not through math.js BigNumber, for rounding-mode control.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP-12C reference examples (from the manual):
  - TVM loan: `n=360`, `i=0.5` (%/mo), `PV=100000`, `FV=0`, END → `PMT ≈ -599.55`.
  - NPV: `CFo=-1000`, `CFj=500 (Nj=3)`, `i=10` → `NPV ≈ 243.43`; `IRR ≈ 23.38%`.
  - `ΔDYS` between two dates matches manual; `SL`/`SOYD`/`DB` first-year figures match.
- Faceplate e2e: keystroke `1000 CHS PV 12 i 12 n FV` (or similar) yields the expected FV;
  BEG/END toggles change PMT.
- Precision: results correct to the configured decimal precision (NFR-5, SM-2).
- Fidelity: keys/colors match `hp/layouts/HP-12C.md` (SM-1).
- `pnpm lint`/`test`/`build`/`test:e2e` green.

## Notes / risks
- IRR is iterative and can have multiple/no roots — bound iterations, surface non-convergence
  as a clear error (HP shows `Error 3`-style); test degenerate cash-flow sets.
- Match HP-12C rounding/day-count conventions exactly (30/360 for bonds, its own date algo) —
  validate against manual figures, not generic finance libraries.
- Keep `finance.ts` free of React/DOM and of math.js so it stays independently unit-testable.
