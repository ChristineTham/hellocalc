# Phase 20 — HP-50g

**Delivers:** HP-50g · CAS-graphing consolidation (~340 commands) + local-storage "SD card" persistence · **Era:** 2006 · **Builds on:** Phase 19 (49G heavy CAS) (+ Phase 18 graphing, Phase 17 ports)

## Goal
Consolidate the RPL graphing line at its peak with the **HP-50g** — the final and most
complete RPL machine. No large new subsystem: this phase **unifies** the CAS (Phase 19),
graphing (Phase 18), units, and numerics behaviours into one coherent ~340-command surface,
adds the commands the 50g exposes over the 49G (vector calculus, extra polynomial/number-
theory ops, `LINSOLVE`/`REF`, `GROBADD`/`ANIMATE`), and introduces **directory + "SD card"
persistence** backed by browser local storage — save/load named workspaces and a removable-
store abstraction. It is the RPL analogue of the modern-era consolidation the 35s/Prime bring
to the RPN line.

## Models delivered
- **HP-50g** (2006) — 131×80 dot-matrix LCD; left-shift **white**, right-shift **orange**,
  ALPHA; F1–F6 softkeys with NXT/PREV; RPN + algebraic entry; unified CAS with Exact/Approx,
  Real/Complex, Rad/Deg flags. Faceplate per `hp/layouts/HP-50g.md`, functions per
  `hp/functions/HP-50g.md`.

## Engine capabilities added
- **Command-surface consolidation (~340):** wire the full documented 50g menu set onto the
  already-built engine — CAS (Phase 19), 2D/3D plotting (Phases 17–18), units, matrices,
  finance, stats — resolving the 49G→50g naming/menu deltas from one dispatch table.
- **Commands new over the 49G:** vector calculus (`GRAD`/`DIV`/`CURL`/`LAPL`/`HESS`,
  `POTENTIAL`/`VPOTENTIAL`), `LINSOLVE`/`REF`/`rref`, extra polynomials (`RESULTANT`/`STURM`/
  `CYCLOTOMIC`), `SREPL`, `GROBADD`/`ANIMATE`, `DRAW3DMATRIX`, `NDIST`.
- **Directory + variable persistence (FR-PRG-4 completion):** the RPL HOME tree
  (`CRDIR`/`PGDIR`/`UPDIR`/`PATH`/`VARS`/`ORDER`/`RENAME`) serialized to local storage.
- **"SD card" / removable store:** a `Store` abstraction (`ARCHIVE`/`RESTORE`, port `FREE`)
  mapping the 50g's SD-card/port memory onto browser storage; named workspace save/load and
  file export/import for backup/sharing.
- **User key assignments** (`ASN`/`STOKEYS`/`RCLKEYS`/`DELKEYS`) persisted with the workspace.

## PRD requirements covered
- **FR-STATE-3** — save / load named workspaces; store user programs and the expression library.
- **FR-STATE-4** — export / import a workspace file for backup / sharing.
- Reinforces FR-PRG-4 (directories/variables, completed here), FR-STATE-1/2 (persistence &
  cross-model state retention), and re-uses (does not re-implement) FR-CAS-* / FR-PLOT-* /
  FR-MAT-* / FR-UNIT-* built in earlier phases.

## Key tasks
- **Engine:** a `src/lib/engine/store/` persistence layer (directory tree + variables +
  key-assignments ↔ local storage, with a serializable workspace document); dispatch entries
  for the 50g-only commands (vector calculus onto the CAS provider; `LINSOLVE`/`REF` onto
  ml-matrix). Pure-TS; storage access injected so the engine stays framework-agnostic.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for the 50g keyboard (white/orange
  shifts, CAT, MATHS/MAIN menus); expose the full `hp/functions/HP-50g.md` set; reconcile
  49G↔50g token differences in the adapter, not the engine.
- **Faceplate / UI:** 50g faceplate; a FILES/workspace browser (directories, save/load,
  export/import); base-path-safe file download/upload for workspace files (static-export safe,
  AGENTS.md §5).
- **Tests:** persistence round-trip unit tests; e2e for directory create → store → reload →
  restore, and workspace export/import.

## New dependencies
None. Persistence uses the browser's `localStorage` / File APIs; all math/CAS/plot capability
already exists from Phases 9–19. No new libraries.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - `CRDIR` `MYDIR`, `3 'A' STO`, serialize → reload → `'A' RCL` returns `3` from the same path.
  - `'X^2' 'X' GRAD` → `[2·X]`; `[[2,1],[1,3]]` `[3,5]` `LINSOLVE` → `[0.8, 1.4]`
    (reuses Phase-9 linear algebra); workspace export→import reproduces stack + vars + keys.
- Faceplate e2e: build a directory, store a variable and a program, reload the app → state
  restored; export a workspace file and re-import it into a cleared session.
- `pnpm lint`/`test`/`build`/`test:e2e` green; static export still builds (no server APIs).
  Fidelity vs `hp/layouts/HP-50g.md` (SM-1): keys, white/orange shifts, softkey menus.

## Notes / risks
- The 50g firmware exposes 500+ commands; scope to the documented ~340 in
  `hp/functions/HP-50g.md` and the shared engine — do not chase the full catalog or the
  separate 315-equation Equation Library (Appendix M) this phase.
- Persist a **versioned** workspace schema so later phases (native mode, Phase 23) can migrate
  it; keep the format engine-owned and UI-agnostic.
- All persistence is local (NFR-10 privacy); no backend, consistent with the static export.
- Directory/variable state must survive **model switching** (FR-STATE-2) — store it in the
  shared engine, not per-faceplate view state.
