# Phase 8 — HP-11C

**Delivers:** HP-11C · probability engine (nPr / nCr / x! / RAND) + complete wiring of the live HP-11C faceplate · **Era:** 1981 · **Builds on:** Phase 6 (scientific fns + keystroke programming; reuses Phase 2 stats/conversions and Phase 5 indirect addressing)

## Goal
Complete the **HP-11C** — the scientific-programmable member of the Voyager line — by wiring
its whole function set into the live HP-11C faceplate. Almost all of its engine capability
already exists from earlier phases (scientific functions, statistics, linear regression,
keystroke programming, I-register indirection). The one genuinely new engine addition is
**combinatorics / probability**: permutations, combinations, factorial/gamma, and a
pseudo-random generator.

## Models wired live
- **HP-11C** (1981) — 10-digit Voyager LCD, f (gold) / g (blue) prefixes, 4-level RPN,
  keystroke programming, hyperbolics, linear regression, probability. The faceplate is
  **already playable** (generated from `mapping.json` by `scripts/gen-models.ts`) on the
  prototype engine; this phase completes its function set per `hp/functions/HP-11C.md` so no
  key remains inert (fidelity reference: `hp/layouts/HP-11C.md`).

## Engine capabilities added
- **Combinatorics / probability (new):**
  - `Py,x` — permutations of y items taken x at a time (`y! / (y−x)!`).
  - `Cy,x` — combinations of y items taken x at a time (`y! / (x!·(y−x)!)`).
  - `x!` — factorial for non-negative integers (the prototype already dispatches integer `x!`
    on JS numbers — port onto the value tower with reference tests), generalized to Γ(1+x) for
    non-integers.
  - `RAN#` — seedable pseudo-random number in [0,1) (deterministic seed for testable output).
- **Reused (no new work, just wired on this model):** hyperbolic + inverse-hyperbolic
  via the `HYP`/`HYP⁻¹` prefix over SIN/COS/TAN; `L.R.` linear regression + `ŷ,r` estimate
  (from Phase 2 stats); `→R`/`→P`, `→H.MS`/`→H`, `→RAD`/`→DEG` conversions; I-register
  indirection `(i)`/`x⇄I`/`x⇄(i)` (from Phase 5); flags 0–1, tests, ISG/DSE, USER-mode A–E
  label keys (from Phases 3/6).

## PRD requirements covered
- **FR-STAT-4** — combinatorics: permutations, combinations, factorial (also placed in core so
  every later model inherits them).
- Reinforces FR-STAT-1/2 (descriptive stats + linear regression exposed on this faceplate),
  FR-NUM-6/7 (angle/display modes), FR-PRG-1/2 (keystroke programming).

## Key tasks
- **Engine:** add `nPr`, `nCr`, `factorial`/Γ, and a seedable `RAN#` to the core math module
  with BigNumber-aware results; guard domain errors (negative/non-integer where undefined).
- **Model adapter / data:** consume `hp/mapping/mapping.json` for HP-11C f/g dispatch; map
  `Py,x`/`Cy,x`/`x!`/`RAN#`, the `HYP`/`HYP⁻¹` prefix pairs, and the CLEAR brackets to engine
  ops. No hand-authored keymap.
- **Wiring / UI:** cover `hp/functions/HP-11C.md` end-to-end so no key stays inert (probability,
  `HYP` pairs, stats/regression, gold A–E user labels); surface USER-mode state as an
  annunciator on the existing Voyager glass.
- **Tests:** engine unit tests for probability + Playwright e2e on the live faceplate.

## New dependencies
None. Pure additions to the existing math.js-backed core.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP-11C reference examples:
  - `5 ENTER 2 f Py,x` → `20` (⁵P₂); `5 ENTER 2 g Cy,x` → `10` (⁵C₂).
  - `6 f x!` → `720`; `4.5 f x!` → `52.3428…` (Γ path).
  - `RAN#` with a fixed seed returns a reproducible sequence in [0,1).
- E2e on the live faceplate: `2.5 f HYP SIN` (hyperbolic sine) and an `L.R.` regression flow
  render the expected results; USER mode remaps A–E to stored labels.
- **No HP-11C key remains inert** — every function in `hp/functions/HP-11C.md` resolves to an
  engine op.
- The existing UI suites (geometry, promotion, typing) stay green.
- `pnpm lint`/`test`/`build`/`test:e2e` green.

## Notes / risks
- `x!` must switch cleanly between exact integer factorial and Γ(1+x) for non-integers; pick a
  Γ implementation whose precision holds at the configured BigNumber precision, and test edge
  cases (0!, negative-integer error).
- `RAN#` must be deterministic under a set seed so unit tests stay reproducible (NFR — no real
  randomness in the test suite); expose seed control on the engine, not the UI.
- The Voyager shell is already shared across the live 11C/12C/15C/16C faceplates (generated
  from `mapping.json` by `scripts/gen-models.ts`) — keep new ops flowing through that data path
  so legends never drift from dispatch.
