# Phase 4 — HP-25

**Delivers:** HP-25 · `f`/`g` dual prefix, compact 49-step programming, continuous-memory persistence · **Era:** 1975 · **Builds on:** Phase 3 (program subsystem, sandbox) + Phase 2 (registers, stats) + Phase 1 (stack machine) + the live faceplate fleet

## Goal
Wire the Phase-3 programmability subsystem into the live HP-25 faceplate in its compact 49-step,
card-less form, and deepen state persistence into true **continuous memory** — stack, registers,
and the stored program survive reloads exactly as on the HP-25C.

## Models wired live
- **HP-25** (1975) — low-cost programmable scientific; two prefixes (`f`/`g`), 49-step program
  memory, no card reader. Its faceplate is already live and playable on the prototype engine
  (fidelity reference: `hp/layouts/HP-25.md`); this phase completes the function set per
  `hp/functions/HP-25.md` — programming, registers, continuous memory — so no key remains inert.

## Engine capabilities added
Mostly reuse; the new work is dual-prefix exposure and continuous-memory persistence:
- **`f`/`g` dual prefix** — gold `f` (above key) and blue `g` (slanted front face); no `h` shift.
  Arming/promotion is already live UI-wide; stays model-adapter config (no new engine op).
- **Compact 49-step programming** — reuse the Phase-3 `program/` interpreter and Web-Worker
  sandbox unchanged, capped at 49 steps with **no magnetic-card layer** (card model omitted for
  this model). Adds `BST` back-step and `PAUSE` (briefly show X during a run) to the op set.
- **HP-25 conditional test set** — `x<y`, `x<0`, `x≥y`, `x≥0`, `x≠y`, `x≠0`, `x=y`, `x=0` with
  **skip-if-false** (do-next-step-only-if-true) semantics — a variant of the Phase-3 test engine.
- **8 registers R0–R7** (R3–R7 double as the statistics registers) — a re-provisioning of the
  Phase-2 register/stats modules for this model's memory map; `ENG` display added to FIX/SCI.
- **Continuous memory** — extend `src/hooks/useCalculator.ts` + the persistence layer so the
  **stack, all storage registers, modes, and the stored program** serialize to `localStorage` and
  restore verbatim on reload (the HP-25C behavior), covering all engine value types accumulated so
  far (BigNumber, registers, program ops).

## PRD requirements covered
- **FR-STATE-1 (deepened)** — full continuous-memory persistence: stack, registers/memory, modes,
  and the stored program survive reloads for this model.
- (Reuses FR-PRG-1/2/3 and NFR-9 from Phase 3; FR-STAT-1 from Phase 2; FR-MODEL/FR-UI from Phase 1.)

## Key tasks
- **Engine:** cap the Phase-3 interpreter to 49 steps without the card layer; add `BST` and
  `PAUSE`; implement the HP-25 skip-if-false conditional set; map R0–R7 with R3–R7 as stats
  registers.
- **Model adapter / data:** `f`/`g` dual-prefix and PRGM–RUN mode in `src/lib/models/adapter.ts`;
  HP-25 exposure from `hp/functions/HP-25.md`; ENG display mode.
- **Wiring / UI:** resolve every `hp/functions/HP-25.md` function to an engine op (`mapping.json`
  / `normalize.ts` coverage); PRGM–RUN mode UI + semantics; surface R0–R7/stats and the stored
  program in the existing `VarsNote` paper panel; continuous-memory status where shown.
- **Tests:** continuous-memory round-trip (reload restores stack+registers+program); skip-if-false
  conditionals; `BST`/`PAUSE`; e2e on the live HP-25 faceplate.

## New dependencies
None.

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: a 49-step-bounded program computing `x²+1`
  returns `5 → 26`; skip-if-false `x=0` branches correctly; a `Σ+` dataset into R3–R7 yields the
  right `x̄`/`s`.
- Persistence test: enter a program + stack + registers, reload, and assert byte-for-byte restore
  (continuous memory).
- E2e on the live faceplate: record in PRGM (`g x²` … ), switch to RUN, `5 R/S` → result; reload
  retains it.
- **No HP-25 key remains inert** — every function in `hp/functions/HP-25.md` resolves to an
  engine op.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; the existing UI suites
  (geometry, promotion, typing) stay green.

## Notes / risks
- Distinguish HP-25 (volatile) vs HP-25C (continuous memory) — we emulate the continuous-memory
  behavior; note this choice in the model config so it stays intentional.
- Reusing the Phase-3 sandbox for a card-less model is a config flag, not a fork — don't duplicate
  the interpreter.
