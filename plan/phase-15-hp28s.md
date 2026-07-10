# Phase 15 — HP-28S

**Delivers:** HP-28S · directory/variable structure, expanded RPL/CAS/units/memory · **Era:** 1988 · **Builds on:** Phases 12 (RPL foundation), 13 (units), 14 (light CAS)

## Goal
Ship the **HP-28S** — the memory-expanded successor to the 28C — as a second RPL clamshell
faceplate over the same engine. The headline new subsystem is the **directory / variable
structure** (`HOME`, subdirectories, `PATH`, `VARS`) that the 28S adds via its **MEMORY** menu,
replacing the 28C's tiny USER menu. Everything else is delta: a few added commands
(`STAT` gains `COMB`/`PERM`; `STRING` gains `→LCD`/`LCD→`; `LIST` gains `POS`; `PLOT` swaps
`DISP`→`DGTIZ`) and the MODE/PRINT **single-toggle** commands that replace the 28C's paired
enable/disable pairs. The RPL stack, units, and CAS come straight from Phases 12–14.

## Models delivered
- **HP-28S** (1988) — RPL clamshell with 32 KB RAM, directories, and the fuller command set.
  Faceplate per `hp/layouts/HP-28S.md`, functions per `hp/functions/HP-28S.md`. Same dual-keypad
  clamshell + single red shift as the 28C; the delta is the MEMORY menu and the toggled modes.

## Engine capabilities added
Built on the Phase-12–14 engine; mostly a directory subsystem plus small command deltas:
- **Directory / variable store** (`src/lib/engine/vars.ts`): a tree of named variables rooted at
  `HOME`, with subdirectories. Commands from the 28S **MEMORY** menu: `CRDIR` (create subdir),
  `HOME` (go to root), `PATH` (current path as a list), `VARS` (names in current directory),
  `ORDER` (reorder), `CLUSR` (clear current directory), `MEM` (free bytes), `MENU` (custom menu).
  `STO`/`RCL`/`PURGE`/`EVAL` resolve names against the **current directory then up the path**.
- **Single-toggle modes:** replace the 28C's `+CMD`/`−CMD`, `+LAST`/`−LAST`, `+UND`/`−UND`,
  `+ML`/`−ML`, `RDX.`/`RDX,` with the 28S toggles `CMD`, `LAST`, `UNDO`, `ML`, `RDX,`, `TRAC`
  in the mode/print op layer (model-adapter concern; engine mode-flags unchanged).
- **Command deltas exposed:** `COMB`/`PERM` in STAT (combinatorics — reuse the Phase-8 core
  factorial/nPr/nCr), `POS` in LIST, `→LCD`/`LCD→` in STRING (display-bitmap ops, UI-side).
- **Named-workspace persistence:** the directory tree, its variables, and stored user programs
  serialize to a named local-storage workspace (foundation for FR-STATE-3 across later models).

## PRD requirements covered
- **FR-STATE-3 (S)** — save/load named workspaces; store user programs and variables in the
  directory tree (the 28S directory structure is the first model that demands it).
- Reinforces **FR-PRG-4 (C)** (directories/variables organizing programs & data — the RPL
  precursor to the 48/50g VAR system), **FR-STAT-4** (`COMB`/`PERM`), **FR-EXP-2** (named
  variables & session scope), and **FR-STATE-1/2** (state persists and survives model switches).

## Key tasks
- **Engine:** `vars.ts` directory tree (`HOME`/subdirs/`PATH`) with path-resolved `STO`/`RCL`/
  `PURGE`; `CRDIR`/`VARS`/`ORDER`/`CLUSR`/`MEM`; named-workspace (de)serialization; wire
  `COMB`/`PERM`/`POS` to existing core ops.
- **Model adapter / data:** HP-28S exposure from `hp/functions/HP-28S.md` via
  `hp/mapping/mapping.json`; MEMORY menu + single-toggle mode commands; reuse the 28C dispatch
  path (both are RPL/red-shift). No hand-authored maps.
- **Faceplate / UI:** HP-28S clamshell faceplate from `hp/layouts/HP-28S.md` (share the 28C
  faceplate framework); MEMORY/VARS menu, `PATH` display, custom-menu row (`MENU`/`CUSTOM`);
  `→LCD`/`LCD→` display-bitmap affordance.
- **Tests:** directory/variable unit tests; workspace round-trip; HP-28S faceplate e2e.

## New dependencies
None — reuses the Phase-12 RPL engine, Phase-13 units, Phase-14 CAS + KaTeX, and local-storage
persistence. `COMB`/`PERM` reuse the Phase-8 probability core.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - `CRDIR` a subdir, `STO` a variable inside it, `HOME` then `PATH` → `{HOME SUB}`; `VARS` lists it.
  - `PURGE` removes a name; resolution falls through the path to a parent-directory variable.
  - `5 3 COMB` → `10`; `5 3 PERM` → `60` (reuse Phase-8 core; verify on the 28S faceplate).
- Faceplate/UI e2e: create a directory, store `'X^2'` in it, switch to another model and back, and
  confirm the variable survives (FR-STATE-2); reload and confirm the workspace persists (FR-STATE-3).
- `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm test:e2e` green; fidelity vs `hp/layouts/HP-28S.md`
  (MEMORY menu present, single-toggle modes, `DGTIZ` in PLOT).

## Notes / risks
- Path-resolved name lookup (current dir → up to HOME) must be exact — it changes what `RCL`/`EVAL`
  see; lock the resolution order in tests to avoid subtle shadowing bugs.
- The 28S and 28C share almost all commands; keep the 28C and 28S function sets **data-driven** from
  `hp/functions/` so the delta (MEMORY, `COMB`/`PERM`, `POS`, `→LCD`/`LCD→`, `DGTIZ`, toggles) is the
  only divergence and neither faceplate hardcodes the other's command list.
- `→LCD`/`LCD→` are pixel-bitmap ops tied to the dot-matrix display model; scope them to the UI layer
  so the pure engine stays display-agnostic.
