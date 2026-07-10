# Phase 5 — HP-67 / HP-97

**Delivers:** HP-67, HP-97 · three-prefix handling, indirect addressing, expanded program control, HP-97 printer · **Era:** 1976 · **Builds on:** Phase 4 (+ Phase 3 program subsystem, Phase 2 registers/stats/conversions)

## Goal
Ship the first-generation fully-programmable HP handhelds and their desktop printing sibling.
This phase generalizes the prefix machinery to **three shift keys (f/g/h)**, adds **indirect
addressing** through the I (index) register, rounds out **program control** (ISZ/DSZ, flags
0–3, label/subroutine addressing A–E/a–e/0–9/(i)), and introduces two peripherals as UI
subsystems: the **magnetic-card reader** (save/load registers+program) and the **HP-97
thermal strip printer**. No new value-tower math is required — the engine already has the
scientific + statistics + conversion functions from Phases 1–2.

## Models delivered
- **HP-67** (1976) — three prefixes f (gold) / g (blue) / h (black), 224-step program memory,
  I-register indirection, card reader. Faceplate per `hp/layouts/HP-67.md`, functions per
  `hp/functions/HP-67.md`.
- **HP-97** (1976) — desktop, single gold `f` prefix, card-compatible with the HP-67, adds a
  thermal printer and TRACE MAN/NORM switch. Faceplate per `hp/layouts/HP-97.md`, functions
  per `hp/functions/HP-97.md`.

## Engine capabilities added
- **N-prefix resolution** in the model adapter: extend the Phase-4 f/g dispatch to an
  ordered prefix set (`f`/`g`/`h`) resolved against `hp/mapping/mapping.json`; the HP-97
  reuses the same code path with a single-prefix set.
- **Indirect addressing:** I (index) register with `ST I`/`RC I`/`x⇄I`, and `(i)` operand
  resolution so `STO (i)`, `RCL (i)`, `GTO (i)`, `DSZ (i)`, `ISZ (i)` address the register or
  step named by I. Add to the engine's register/program op layer (not model-specific).
- **Loop counters:** `ISZ`/`DSZ` (increment/decrement I or addressed register, skip-if-zero)
  with the documented skip-if-false program semantics.
- **Flags 0–3** (`SF`/`CF`/`F?` on HP-67; `STF`/`CLF`/`F?` on HP-97) and the full conditional
  set (`x=0`,`x≠0`,`x<0`,`x>0`,`x=y`,`x≠y`,`x≤y`,`x>y`).
- **Protected secondary registers** `P⇄S` (swap R0–R9 with RS0–RS9), `CL REG`.
- **Peripheral model:** an engine-agnostic `CardStore` (serialize registers + program to a
  named "card" blob in local storage) and a `PrintQueue` (append lines) surfaced to the UI.

## PRD requirements covered
- **FR-PRG-2** — labels, GTO/GSB/RTN, conditional tests, flags, loops (ISZ/DSZ), subroutines.
- **FR-MODEL-5** — model-appropriate display + annunciators (f/g/h, DEG/RAD/GRD) and the
  HP-97 printer strip / TRACE indicator.
- Reinforces FR-PRG-1/3 (record/run in the sandboxed Web-Worker interpreter from Phase 3),
  FR-STATE-1 (card blobs persist locally).

## Key tasks
- **Engine:** add I-register + `(i)` indirect resolution to the register/program ops; ISZ/DSZ
  counters; flags 0–3; `P⇄S` secondary bank; `H.MS+` add. Unit-test each against HP examples.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for HP-67 (f/g/h) and HP-97
  (f-only); map `ST I`/`RC I`/`(i)`/`DSZ (i)`/`ISZ (i)` to engine ops. No hand-authored maps.
- **Faceplate / UI:** render HP-67 four-way keycaps (primary + f/g/h) and the two-cluster HP-97
  layout with printer strip; f/g/h annunciators; TRACE MAN/NORM switch; card-reader affordance
  (W/DATA, MERGE); HP-97 PRINT x / PRINT SPACE / PRINT PRGM / PRINT REG / PRINT STACK write to
  the on-screen strip.
- **Tests:** engine unit tests + Playwright e2e per faceplate.

## New dependencies
None. Reuses math.js core, the Phase-3 Web-Worker interpreter, and local-storage persistence.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - Indirect loop: `10 STO I`, program body `RCL (i)` + `DSZ (i)` steps through registers.
  - `1.2345 f →H.MS` → `1.140420…` (h.mms); `x⇄I` round-trips the index register.
- Faceplate e2e: HP-67 `f √x` on `2` → `1.4142136`; HP-97 `5 PRINT x` appends `5.00 *` to the
  printer strip; TRACE switch toggles per-step printing.
- Fidelity: keycaps/colors/prefixes match `hp/layouts/HP-67.md` and `HP-97.md` (SM-1).
- `pnpm lint`/`test`/`build`/`test:e2e` green.

## Notes / risks
- The layout note in `hp/functions/HP-67.md` corrects f/g directions for →P and →H.MS — trust
  the corrected mapping, not the raw keyboard artwork.
- `−x−` and `SPACE` on the HP-67 exist only for HP-97 card compatibility; implement as no-ops
  that the HP-97 renders as printer actions.
- Card "merge" semantics (don't overwrite current program/registers) need care; model the card
  blob format so HP-67 and HP-97 cards interoperate.
