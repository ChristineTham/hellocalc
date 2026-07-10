# Phase 1 — Engine foundation & HP-35

**Delivers:** HP-35 · engine core (BigNumber value tower, 4-level RPN stack, model-adapter, faceplate framework) · **Era:** 1972 · **Builds on:** — (foundation)

## Goal
Stand up the shared pure-TS engine on math.js configured to `BigNumber`, the model-adapter
layer that dispatches keystrokes from `hp/mapping/mapping.json`, and the data-driven faceplate
framework — proven end-to-end by the HP-35, the first HP pocket scientific.

## Models delivered
- **HP-35** (1972) — first HP scientific; every function is a single key (no shift), with `arc`
  as an inverse-trig prefix. Faceplate per `hp/layouts/HP-35.md`, functions per `hp/functions/HP-35.md`.

## Engine capabilities added
New subsystems across architecture §3 layers (value tower · parser/eval · stack machine):
- **Value tower on math.js, globally configured to `BigNumber`** — a `mathjs` instance in
  `src/lib/engine/config.ts` with `number: 'BigNumber'` so `0.1 + 0.2` is exact. Formalizes the
  existing `src/lib/mathEngine.ts` prototype (JS numbers) onto the target tower.
- **4-level RPN stack machine** `src/lib/engine/rpn.ts` (evolve the prototype): `X/Y/Z/T` +
  `LAST X`, with exact **ENTER-lift / drop / no-lift** rules per `hp/README.md` — `ENTER↑` lifts and
  disables the next auto-lift; `CLx` clears X with no lift; binary ops drop Z→Y, T→T and save LAST X.
  (HP-35 itself has no LAST X — the register lands here for reuse by later models.)
- **Scientific function ops** wired into the stack machine: `sin/cos/tan` + `arc` inverse prefix,
  `log/ln`, `eˣ`, `xʸ` (`10ˣ` via `xʸ` base 10 per the HP-35), `√x`, `1/x`, `π`, and stack ops
  `x⇄y`, `R↓`, `CHS`, `EEX`, `CLx`, `CLR`.
- **Single memory register** (`STO`/`RCL`) in the stack-machine state.
- **Display formatting** `src/lib/engine/format.ts` — FIX / SCI with configurable digits, and
  DEG/RAD angle mode feeding the trig ops.
- **Model-adapter layer** `src/lib/models/` — imports `hp/mapping/mapping.json` at build time and
  resolves `(physical_key, prefix)` → engine op; per-model exposure from `hp/functions/`.
- **Faceplate framework** — `Faceplate` / `Keyboard` / `Display` / `CalcKey` (evolve existing
  `src/components/calculator/*`) rendered from generated model data (`models.generated.ts`).
- **Responsive, viewport-fit scaling framework** (built once here, reused by every model) —
  the faceplate scales as one unit (display, keys, fonts together) to fully fit the viewport at
  every breakpoint, preserving key aspect ratio, with no clipping or scroll-to-reach-a-key
  (fluid sizing / CSS container queries, not a fixed pixel grid). Secondary panels (history,
  stack rail) collapse behind a toggle/drawer on small screens; the display can collapse to a
  compact device-like LCD with an **expand** control to the full multi-line view.
- **History stack** — the engine/hook records each committed entry and result as a running
  history (`{ op, value }`), recallable into the display; the substrate for the native-mode
  history/expression library in Phase 23.
- **State persistence foundation** (architecture §9) — a single serializable `EngineState` tree
  (`shared` + `perModel`) with a tagged **value codec** (numbers/BigNumber now; later phases
  extend it) and a schema `version`; a `StorageAdapter` doing **localStorage autosave/restore**
  of the session (stack/memory/modes/history/active model); and a first **export/import to a
  versioned JSON file** (download/upload) so state survives a cleared browser.

## PRD requirements covered
- **FR-NUM-1/2** — BigNumber default numeric type; IEEE mode selectable.
- **FR-NUM-6/7** — DEG/RAD angle mode; FIX/SCI display formats with digits.
- **FR-STK-1** — classic 4-level `X/Y/Z/T` + `LAST X` with exact lift/drop/no-lift semantics.
- **FR-MODEL-1/2/3/5** — faithful HP-35 keyboard; key+prefix dispatch via `mapping.json`;
  only HP-35 functions exposed; LED-style display/annunciators.
- **FR-EXP-5** — history stack of prior entries/results, shown in the display and recallable.
- **FR-UI-1/2/3/5** — large display showing the RPN stack **and computation history**; physical-keyboard input; responsive; design tokens.
- **FR-UI-7/8/9** — faceplate scales to fit the viewport (display/keys/fonts together); history
  and stack panels collapse behind a control on small screens; display can collapse to a
  compact device-like LCD with an expand control.
- **FR-STATE-1** — persist session state across reloads (localStorage autosave/restore).
- **FR-STATE-4** — export/import state as a versioned file (durable backup; foundation laid here).
- **NFR-5/8** — precision correctness (HP reference tests); pure-TS framework-agnostic engine.

## Key tasks
- **Engine:** `src/lib/engine/config.ts` (BigNumber math.js instance); refactor `rpn.ts` to the
  BigNumber tower with LAST X + lift-flag; `format.ts` (FIX/SCI); scientific + stack ops registry;
  `src/lib/engine/persistence.ts` — the `EngineState` tree, value codec, `version`/migration,
  `StorageAdapter` (localStorage + in-memory), and file export/import helpers.
- **Model adapter / data:** `src/lib/models/adapter.ts` consuming `hp/mapping/mapping.json`;
  regen path via `hp/mapping/build_mapping.py`; HP-35 exposure from `hp/functions/HP-35.md`.
- **Faceplate / UI:** re-base `Faceplate`/`Keyboard`/`Display`/`CalcKey` on generated data; HP-35
  faceplate from `hp/layouts/HP-35.md`; a **History display** component (`src/components/calculator/HistoryDisplay.tsx`)
  showing prior entries/results beside/under the stack; the **responsive scaling framework**
  (fluid/container-query sizing so the faceplate fits any viewport) and collapsible history/stack
  panels + collapsible-LCD toggle; `src/hooks/useCalculator.ts` + localStorage persistence.
- **Tests:** engine unit tests (stack lift/drop/no-lift, format, trig); HP-35 faceplate e2e.

## New dependencies
None — `mathjs` and `decimal.js` are already installed (architecture §5, eager core).

## Tests & acceptance (DoD)
- Engine unit tests incl. HP reference examples: `2 ENTER↑ 3 ×` → `6`; `1 ENTER↑ 0 ÷` behavior;
  `30 sin` (DEG) → `0.5`; verify `0.1 ENTER↑ 0.2 +` → exact `0.3` under BigNumber.
- Faceplate e2e: HP-35 key sequence `2 ENTER↑ 3 +` shows `5`; `arc` `sin` inverse path; the
  history display shows the prior result(s) after successive operations.
- Persistence round-trips: engine state save→restore is identical (incl. BigNumber exactness),
  and export→file→re-import reproduces the state; `version` migration + graceful-degrade tested.
- Responsive e2e at mobile / tablet / desktop viewports: the faceplate fits within the viewport
  (no clipping, no scroll to reach a key) and every key is tappable; on mobile the history/stack
  panels are collapsed behind a control and the compact-LCD ↔ full-display toggle works.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; faceplate fidelity vs
  `hp/layouts/HP-35.md` (no shift keys, `arc` prefix, single memory).

## Notes / risks
- The prototype uses JS-number engines; the main risk is BigNumber formatting parity (auto SCI
  outside 10⁻²…10¹⁰, all-9s overflow) — cover in `format.ts` tests.
- Establish the mapping-import build seam cleanly now; every later phase depends on it.
