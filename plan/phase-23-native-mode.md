# Phase 23 — Native mode

**Delivers:** native mode (no physical model) · full-engine expression evaluator with no virtual keypad · **Era:** — (modern web) · **Builds on:** ALL prior phases — the complete engine (value tower P1, RPN/RPL stacks P1/P12, finance P7, complex/matrix/SOLVE/∫ P9, units P13, light+heavy CAS P14/P19, plotting P17/P18, stats/distributions P16/P22), KaTeX rendering (P14), and persistence built up across phases.

## Goal
Deliver the final phase: a **keyboard-first native mode** that exposes the whole engine directly,
with no faceplate — genuinely new work, though it mounts in the app's **existing shell/chrome**
(topbar, sidebar/nav, paper components, KaTeX rendering path, responsive templates) rather than
building new chrome. The user types algebraic (or RPN) input; results render as KaTeX; a history
stack, named variables, user-defined functions, and a save/name/recall **expression library** are
first-class; a **notebook / block-evaluation editor** supports multi-step work; and a **minimal
on-screen RPN-stack key set** covers stack manipulation without a full keypad. Copy/paste works in
multiple formats and expressions **export as KaTeX/LaTeX**. This is the culmination — it adds
almost no new math, only the modern power-user surface over the engine, plus the persistence and
interchange polish deferred through earlier phases.

## Models delivered
- **Native mode** (no physical model) — a keyboard-first evaluator surface, not a faceplate, and
  **not yet live**: the model picker's "Native mode" entry is the fleet's only disabled one. It
  mounts in the existing shell/chrome rather than building new chrome. A single large display
  shows history + the live RPN stack + KaTeX-rendered math; input is a typed expression line
  (algebraic default, RPN optional); an optional slim on-screen key strip offers
  ENTER/`x↔y`/`R↓`/`DROP`/`LASTx` for stack work. All engine features are reachable by name.

## Engine capabilities added
Mostly UI/state over the finished engine (architecture §3 native mode; §4 parser/history):
- **Expression library** (`src/lib/engine/library/expressions.ts`) — save, name, tag, and recall
  reusable expressions and user-defined functions; persisted to local storage (base-path-safe,
  no server). Recall inserts into the current entry or evaluates in place.
- **Notebook / block editor** (`src/lib/engine/notebook/`) — an ordered list of evaluable blocks;
  each block evaluates through the engine parser (P1) with a shared, ordered variable scope so a
  later block sees earlier definitions. Re-running a block re-evaluates downstream blocks
  (spreadsheet-like dependency, reusing the P22 evaluation model).
- **Interchange / export** (`src/lib/engine/io/`) — copy the current expression/result as plain
  text, LaTeX, or KaTeX; **export as KaTeX/LaTeX**; best-effort paste-import of LaTeX/plain
  expressions back into the parser. Uses the P14 `toLatex` seam.
- **Named variables + user functions + history** — the P1 variable scope and `FR-EXP-5` history
  stack surfaced as recallable/editable entries; both RPN and algebraic input write to the same
  history and variable store.
- **Persistence & workspace polish** (`src/lib/engine/state/`) — finalize session persistence
  (stack, memory, variables, history, active mode) and named **workspaces** save/load, plus
  export/import of a workspace file; consolidates `FR-STATE-3/4` deferred across phases.

## PRD requirements covered
- **FR-NATIVE-1** — keyboard-first mode, no virtual keypad, typed algebraic/RPN input.
- **FR-NATIVE-2** — exposes the full engine (functions, units, CAS, matrices, finance, plotting).
- **FR-NATIVE-3** — minimal on-screen key set for RPN stack manipulation.
- **FR-NATIVE-4** — history stack, variables, and expression library available.
- **FR-EXP-1/2/3/5** — algebraic parsing/eval; named variables + assignment; user-defined
  functions; recallable/editable history. **FR-EXP-4** — expression library (save/name/recall).
- **FR-UI-4** — notebook / block-evaluation editor for multi-step work.
- **FR-IO-1** — KaTeX rendering; **FR-IO-2** — copy/paste in multiple formats (plain/LaTeX);
  **FR-IO-3** — export as KaTeX/LaTeX; **FR-IO-4 (best-effort)** — Mathematica-style interchange.
- **FR-STATE-3** — save/load named workspaces + expression library/user programs;
  **FR-STATE-4** — export/import a workspace file.
- **FR-UI-1/2/3** — large history+stack+KaTeX display; physical-keyboard input; responsive.

## Key tasks
- **Engine:** `library/expressions.ts` (save/name/tag/recall + persistence), `notebook/`
  (ordered blocks + shared scope + downstream re-eval), `io/` (copy/paste/export in
  plain/LaTeX/KaTeX, best-effort import), `state/` workspace save/load/export/import.
- **Model adapter / data:** no `hp/` faceplate — native mode is engine-direct. A command
  registry exposes engine functions by name for autocomplete; RPN keys map to stack ops (the
  prototype already dispatches ENTER/`x↔y`/`DROP` on JS numbers — port onto the value tower /
  object stack with reference tests).
- **Wiring / UI:** the native surface (`src/app/native/` + components), mounted in the existing
  shell/chrome — a typed entry line with function/variable autocomplete, a history + live-stack
  panel with KaTeX, the slim on-screen RPN key strip, the notebook editor, an expression-library
  drawer, and copy/export controls. Responsive (mobile/tablet/desktop); light/dark theme tokens
  (FR-UI-5/6).
- **Tests:** library save/recall; notebook block dependency re-eval; LaTeX export/round-trip;
  RPN vs algebraic parity; workspace export/import; full-engine reachability spot checks.

## New dependencies
None — this phase is the modern surface over the complete engine. Reuses math.js (P1), the CAS
tiers (P14/P19), plotting (P17/P18), decimal.js finance (P7), and KaTeX (P14). Persistence uses
local storage only (no backend, base-path-safe per architecture §5 / NFR-1).

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete examples: typing `2 + 3 * 4` → `14`; `f(x) := x^2`, then
  `f(5)` → `25` (user function, FR-EXP-3); save `f` to the library and recall it in a new session;
  `diff(sin(x), x)` renders `cos(x)` as KaTeX and exports LaTeX `\cos\left(x\right)`; a notebook
  with block A `a := 3` and block B `a^2` → `9`, and editing A to `4` re-evaluates B → `16`;
  `5 cm + 2 in` → a unit quantity (units P13); RPN input `2 [ENTER] 3 +` and algebraic `2+3` both
  yield `5` in shared history.
- e2e: type an expression → KaTeX result; save to the expression library and recall it; open the
  notebook, add two dependent blocks, edit the first, see the second update; copy result as LaTeX;
  export and re-import a workspace; toggle RPN and use the on-screen key strip for `x↔y`/`DROP`.
- **Enable the model picker's "Native mode" entry** — the fleet's only disabled entry goes live,
  with switching to/from native mode retaining state; enabling it is part of DoD.
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green. No `hp/layouts` fidelity check
  (native mode has no faceplate); instead assert full-engine reachability and FR-NATIVE coverage.

## Notes / risks
- Full-engine exposure is the point (FR-NATIVE-2) — the command registry/autocomplete must cover
  every module (units, CAS, matrices, finance, stats, plotting) or features become undiscoverable;
  add a coverage test asserting each engine module has at least one reachable named entry.
- Notebook re-evaluation shares scope across blocks — bound the dependency re-run (reuse the P22
  model) and keep any heavy CAS/plot evaluation lazy and cancelable (NFR-3/NFR-4).
- LaTeX import is best-effort (FR-IO-4, open question §14.6) — scope to what the parser + `toLatex`
  seam round-trip cleanly; flag unsupported constructs rather than silently mis-parsing.
- Persistence finalizes `FR-STATE-1/2/3/4` folded across phases — ensure workspace export/import is
  self-contained (stack, variables, history, library, active mode) and versioned for forward
  compatibility; all local, no telemetry (NFR-10).
- This is the final phase: native mode is the **M**-priority headline surface (SM-4) — verify all
  **M** functional requirements are demonstrable here plus at least the Voyager faceplates.
