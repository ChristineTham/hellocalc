# Phase 3 — Keystroke programmability & HP-65

**Delivers:** HP-65 · program subsystem (record/edit/run, LBL/GTO/RTN, tests, flags, subroutines) in a sandboxed Web-Worker interpreter · **Era:** 1974 · **Builds on:** Phase 2 (registers, conversions, stats) + Phase 1 (stack machine) + the live faceplate fleet

## Goal
Add the keystroke-programmability subsystem — record, edit, single-step, and run keystroke
programs in a sandboxed Web-Worker interpreter with step/time limits (architecture §4.11) — and
wire it into the live HP-65 faceplate, the first programmable pocket calculator with
magnetic-card storage.

## Models wired live
- **HP-65** (1974) — first magnetic-card programmable; `f`/`f⁻¹`/`g` prefixes, W/PRGM–RUN switch,
  user keys A–E. Its faceplate is already live and playable on the prototype engine, `f⁻¹` math
  inverses included (fidelity reference: `hp/layouts/HP-65.md`); this phase completes the function
  set per `hp/functions/HP-65.md` — the program subsystem, W/PRGM–RUN semantics, and user keys
  A–E — so no key remains inert.

## Engine capabilities added
New "programmability" tier alongside the engine (architecture §3 feature modules, §4.11 sandbox):
- **Program model & store** `src/lib/engine/program/model.ts` — a program is an ordered list of
  keystroke ops (not JS); 100-step capacity; edit operations insert/delete steps in W/PRGM mode.
- **Sandboxed interpreter in a Web Worker** `src/lib/engine/program/worker.ts` — executes program
  ops against a serialized copy of engine state; **never `eval`s**; enforces **step and wall-clock
  limits** to stop runaway `GTO`/`DSZ` loops (NFR-9).
- **Control flow** — `LBL` (A–E, 0–9), `GTO`, `RTN`, and `A B C D E` user keys invoking labelled
  routines as **subroutines** (call/return stack); `R/S` run/stop; `SST` single-step; `NOP`.
- **Conditional tests** `x≤y` / `x=y` / `x>y` / `x≠y` — skip-two-steps-unless-true semantics.
- **Flags** — `SF 1/2` set (via `f⁻¹` lower) and `TF 1/2` test-and-skip.
- **`DSZ`** — decrement R8 index register and skip when it reaches zero (loop counter).
- **Three-prefix dispatch** `f` / `f⁻¹` (inverse of the gold function) / `g` — arming/promotion
  and the `INVERSE_OF` math dispatch are live UI-wide; this phase records prefixed steps in programs.
- **Magnetic-card model** — save/load the current program to `localStorage` as a named "card"
  (`src/lib/engine/program/card.ts`); a bad/blank card surfaces the blinking error state.
- Reuses Phase-2 registers/conversions/stats and Phase-1 stack machine unchanged.

## PRD requirements covered
- **FR-PRG-1** — record, store, edit, and run keystroke user programs.
- **FR-PRG-2** — program control: labels, GTO, conditional tests, flags, loops, subroutines.
- **FR-PRG-3** — programs run in a sandboxed Web-Worker interpreter with step/time limits.
- **NFR-9** — user programs never executed via `eval`; sandboxed with resource limits.

## Key tasks
- **Engine:** `src/lib/engine/program/{model,worker,card}.ts` — op list, interpreter loop with
  call/return + skip logic, flags, DSZ, step/time guards; message protocol between main thread and
  worker (serialize stack/registers/flags in and out).
- **Model adapter / data:** `f`/`f⁻¹`/`g` prefix resolution and W/PRGM–RUN mode in
  `src/lib/models/adapter.ts`; HP-65 exposure + A–E user-key redefinition from `hp/functions/HP-65.md`.
- **Wiring / UI:** resolve every `hp/functions/HP-65.md` function to an engine op (`mapping.json`
  / `normalize.ts` coverage); W/PRGM–RUN mode UI + semantics; program-listing/step editor panel;
  SST stepping UI; run/stop indicator; card save/load affordance.
- **Tests:** interpreter unit tests (labels, GTO loop, tests, flags, DSZ, step-limit abort);
  card save/load; e2e on the live HP-65 faceplate.

## New dependencies
None — the interpreter is custom TypeScript in a Web Worker (architecture §4.11); no new packages.

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: a `LBL A … RTN` program that squares X returns
  `5² = 25`; a `DSZ`-controlled loop summing `1..5` → `15`; a runaway `GTO`-self loop hits the
  step limit and aborts cleanly (NFR-9).
- E2e on the live faceplate: record in W/PRGM (`LBL A`, `x²`, `RTN`), switch to RUN, `5 A` → `25`;
  save to a "card" and reload restores the program.
- **No HP-65 key remains inert** — every function in `hp/functions/HP-65.md` resolves to an
  engine op.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; the existing UI suites
  (geometry, promotion, typing) stay green.

## Notes / risks
- Sandbox design is an open question (architecture §8.3) — validate the worker step/time-limit
  approach here; keep the interpreter op-set small and engine-op-based.
- Worker state serialization must round-trip BigNumber/registers/flags without precision loss.
- Card "storage" is localStorage, not a file — document the deviation from the physical card.
