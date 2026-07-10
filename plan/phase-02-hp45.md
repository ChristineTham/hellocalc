# Phase 2 — HP-45

**Delivers:** HP-45 · gold `f` prefix, storage registers + register arithmetic, descriptive statistics, coordinate/angle/metric conversions · **Era:** 1973 · **Builds on:** Phase 1 (value tower, RPN stack, model-adapter, faceplate framework)

## Goal
Extend the engine with the HP-45's advances — a gold shift prefix, addressable registers with
register arithmetic, first descriptive-statistics module, and coordinate/angle/metric conversions
— all as reusable engine subsystems behind a second faceplate.

## Models delivered
- **HP-45** (1973) — second-generation scientific; adds a gold `f` prefix, nine registers, stats,
  and conversions. Faceplate per `hp/layouts/HP-45.md`, functions per `hp/functions/HP-45.md`.

## Engine capabilities added
Built on the Phase-1 stack machine and value tower; new modules:
- **Prefix dispatch** — the adapter already reads `prefix` from `mapping.json`; formalize a single
  gold `f` shift state in the model adapter (annunciator surfaced to UI). No new stack semantics.
- **Multiple storage registers R1–R9** in the stack-machine state, replacing Phase 1's single
  register; `STO`/`RCL n`.
- **Register arithmetic** — `STO` + `+/−/×/÷` then register n operates X against Rn in place
  (`src/lib/engine/registers.ts`).
- **Descriptive statistics** `src/lib/engine/stats.ts` — `Σ+`/`Σ−` accumulate n, ΣX, ΣX², ΣY into
  summation registers; `x̄` (mean) and `s` (sample std dev); `n!` factorial.
- **Coordinate conversions** `src/lib/engine/convert.ts` — `→P` (rect→polar) and `→R`
  (polar→rect), angle-mode aware.
- **Angle mode GRD** added to Phase-1's DEG/RAD; `→D.MS` / `D.MS→` degrees↔minutes-seconds.
- **Metric/US conversion constants** — `cm/in`, `kg/lb`, `ltr/gal` push a multiplicative constant
  onto the stack (user multiplies/divides to convert).
- **`Δ%`** percent-difference and `%` in the arithmetic ops; **LAST x** now user-exposed (`f 0`).

## PRD requirements covered
- **FR-STAT-1** — descriptive statistics: `Σ+` accumulation, mean, standard deviation, sums.
- **FR-NUM-6** — angle modes extended to DEG/RAD/GRD affecting trig and conversions.
- **FR-STATE-1** — the added registers and summation state persist across reloads.
- (Reinforces FR-MODEL-1/2/3/5 and FR-UI-* from Phase 1 for the HP-45 faceplate.)

## Key tasks
- **Engine:** `src/lib/engine/registers.ts` (R1–R9 + register arithmetic); `stats.ts`
  (Σ+/Σ−/x̄/s/n!); `convert.ts` (→P/→R, D.MS, metric constants); add GRD to angle mode; `Δ%`/`%`.
- **Model adapter / data:** gold `f` prefix handling in `src/lib/models/adapter.ts`; HP-45
  exposure from `hp/functions/HP-45.md`; DEG/RAD/GRD and FIX/SCI as gold-shifted mode ops.
- **Faceplate / UI:** HP-45 faceplate from `hp/layouts/HP-45.md`; `f` annunciator; register-count
  and stats state surfaced where the model shows it.
- **Tests:** stats + register-arithmetic unit tests; HP-45 faceplate e2e.

## New dependencies
None — descriptive stats implemented directly on the math.js BigNumber tower (simple-statistics
is reserved for regression in a later phase, architecture §4.8).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: enter `2,4,6` via `Σ+` then `x̄` → `4`, `s` → `2`;
  `3 ENTER↑ 4 →P` → r=`5`; `STO 1`, `5 STO + 1`, `RCL 1` register-arithmetic round-trip.
- Faceplate e2e: HP-45 gold sequence `f √x` on `9` → `3`; `Σ+` accumulation then `f R↓` (`x̄,s`).
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; fidelity vs `hp/layouts/HP-45.md`
  (single gold prefix, R1–R9, conversion legends).

## Notes / risks
- Metric keys return a *constant*, not a converted value — model this exactly (don't auto-convert)
  to stay faithful.
- Sample vs population std-dev convention: HP-45 uses sample `s`; lock the formula in tests.
