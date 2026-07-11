# Phase 1 — Engine foundation & HP-35

**Delivers:** HP-35 fully functional · engine core (BigNumber value tower, 4-level RPN stack, model-adapter formalization, persistence) · **Era:** 1972 · **Builds on:** the live 21-model UI shell ([docs/responsive-layout.md](../docs/responsive-layout.md))

## Goal
Stand up the shared pure-TS engine on math.js configured to `BigNumber`, formalize the
model-adapter layer that dispatches keystrokes from `hp/mapping/mapping.json`, and lay the
state-persistence foundation — wired into the already-live shell so the HP-35, the first HP
pocket scientific, becomes the first **fully functional, exact-arithmetic** model.

## Models wired live
- **HP-35** (1972) — first HP scientific; every function is a single key (no shift), with `arc`
  as an inverse-trig prefix. The faceplate is **already playable** (aspect 0.703, geometry per
  responsive-layout §4.4) on the JS-number prototype engine; this phase re-bases it onto the
  BigNumber tower and completes its function set per `hp/functions/HP-35.md`
  (fidelity reference: `hp/layouts/HP-35.md`).

## Engine capabilities added
New subsystems across architecture §3 layers (value tower · parser/eval · stack machine):
- **Value tower on math.js, globally configured to `BigNumber`** — a `mathjs` instance in
  `src/lib/engine/config.ts` with `number: 'BigNumber'` so `0.1 + 0.2` is exact. Replaces the
  JS-number arithmetic inside the existing engines.
- **4-level RPN stack machine** — port `src/lib/engine/rpn.ts` (the live prototype, whose
  `X/Y/Z/T` + `LAST X` **ENTER-lift / drop / no-lift** rules already match `hp/README.md` and
  carry unit tests) onto the BigNumber tower. (HP-35 itself has no LAST X — the register lands
  here for reuse by later models.)
- **Scientific function ops on the tower** — the prototype already dispatches the HP-35 set
  (`sin/cos/tan` + `arc` inverses, `log/ln`, `eˣ`, `xʸ`, `√x`, `1/x`, `π`, `x⇄y`, `R↓`, `CHS`,
  `CLx`, `CLR`) on JS numbers; re-implement on BigNumber with HP reference tests. `EEX`
  exponent entry gains real behavior (currently digit-buffer only).
- **Single memory register** (`STO`/`RCL`) in the stack-machine state — currently inert keys.
- **Display formatting** `src/lib/engine/format.ts` — FIX / SCI with configurable digits
  (replacing the hook-level fixed 2-decimal `fmt`), DEG/RAD angle mode feeding trig (the
  mode setters are live; formatting is not).
- **Model-adapter formalization** `src/lib/models/` — the print→id seam (`normalize.ts`) is
  live; formalize `(physical_key, prefix)` → engine-op resolution against
  `hp/mapping/mapping.json` (imported at build time) and per-model exposure from
  `hp/functions/` so coverage is checkable per model rather than per authored legend.
- **History recording in `EngineState`** — the paper-tape display and hook-side `{op, value}`
  recording are already live for RPN models; move recording into the engine state and add
  **recall into X** — the substrate for the native-mode history/expression library (Phase 23).
- **State persistence foundation** (architecture §9) — a single serializable `EngineState` tree
  (`shared` + `perModel`) with a tagged **value codec** (BigNumber now; later phases extend it)
  and a schema `version`; a `StorageAdapter` doing **localStorage autosave/restore** of the
  session (stack/memory/modes/history/active model); and a first **export/import to a
  versioned JSON file** (download/upload) so state survives a cleared browser.

*(The responsive layout framework, integrated machine, paper components, typing layer and
prefix promotion shipped ahead of this plan — see responsive-layout Steps 0–9 + revisions.
Phase 1 consumes that shell as-is.)*

## PRD requirements covered
- **FR-NUM-1/2** — BigNumber default numeric type; IEEE mode selectable.
- **FR-NUM-6/7** — DEG/RAD angle mode; FIX/SCI display formats with digits.
- **FR-STK-1** — classic 4-level `X/Y/Z/T` + `LAST X` with exact lift/drop/no-lift semantics.
- **FR-MODEL-1/2/3/5** — faithful HP-35 keyboard (live); key+prefix dispatch via `mapping.json`;
  only HP-35 functions exposed; LED-style display/annunciators.
- **FR-EXP-5** — history stack of prior entries/results, shown in the display and recallable.
- **FR-STATE-1** — persist session state across reloads (localStorage autosave/restore).
- **FR-STATE-4** — export/import state as a versioned file (durable backup; foundation laid here).
- **NFR-5/8** — precision correctness (HP reference tests); pure-TS framework-agnostic engine.
- (FR-UI-1/2/3/5/7–14 shipped with the UI foundation; each phase keeps them green.)

## Key tasks
- **Engine:** `src/lib/engine/config.ts` (BigNumber math.js instance); port `rpn.ts` to the
  BigNumber tower keeping the existing lift/drop tests; `format.ts` (FIX/SCI); memory register;
  `src/lib/engine/persistence.ts` — the `EngineState` tree, value codec, `version`/migration,
  `StorageAdapter` (localStorage + in-memory), and file export/import helpers.
- **Model adapter / data:** `src/lib/models/adapter.ts` consuming `hp/mapping/mapping.json`;
  regen path via `hp/mapping/build_mapping.py`; HP-35 exposure check from `hp/functions/HP-35.md`.
- **Wiring / UI:** re-point `useRpnCalculator` / `useRplCalculator` at the BigNumber engine and
  `format.ts` (formatted values flow through the existing glass/tape/notes unchanged); history
  recall into X from the tape; wire the nav's **Import / Export / Reset state** entries
  (currently "soon") to `persistence.ts`; STO/RCL memory surfaced on the HP-35.
- **Tests:** engine unit tests (stack lift/drop/no-lift, format, trig — extend the existing
  suites onto BigNumber); persistence round-trip tests; HP-35 function-coverage e2e.

## New dependencies
None — `mathjs` and `decimal.js` are already installed (architecture §5, eager core).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: `2 ENTER↑ 3 ×` → `6`; `1 ENTER↑ 0 ÷` behavior;
  `30 sin` (DEG) → `0.5`; verify `0.1 ENTER↑ 0.2 +` → exact `0.3` under BigNumber.
- E2e on the live faceplate: HP-35 sequence `2 ENTER↑ 3 +` shows `5`; `arc sin` inverse path;
  `STO`/`RCL` round-trip; EEX entry; history recall pulls a prior result into X.
- **No HP-35 key remains inert** — every function in `hp/functions/HP-35.md` resolves to an
  engine op.
- Persistence round-trips: engine state save→restore is identical (incl. BigNumber exactness),
  and export→file→re-import reproduces the state; `version` migration + graceful-degrade tested.
- The existing UI suites stay green (geometry/aspect guards, typing, promotion, templates —
  159 unit / 14 e2e at time of writing).
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green.

## Notes / risks
- The prototype uses JS-number engines; the main risk is BigNumber formatting parity (auto SCI
  outside 10⁻²…10¹⁰, all-9s overflow) — cover in `format.ts` tests.
- Establish the mapping-import build seam cleanly now; every later phase depends on it.
- Porting `rpn.ts` must not regress the live behavior of the other 20 faceplates that share it —
  the existing op tests are the safety net; extend, don't replace.
