# Phase 18 — HP-48G

**Delivers:** HP-48G · enhanced graphing (3D/statistical via lazy Plotly) + input forms + 48G apps · **Era:** 1993 · **Builds on:** Phase 17 (+ Phase 16 curve-fit/regression, Phase 14 CAS)

## Goal
Grow the RPL graphing line to the **HP-48G**: same physical keyplate as the 48SX (purple/green
shifts instead of orange/blue — both already live) but a much larger built-in ROM. This phase
adds **3D and richer statistical plotting via lazy Plotly.js**, the **input-form / dialog**
command family (INFORM / CHOOSE / MSGBOX), the built-in **applications** (SOLVE, PLOT, SYMBOLIC,
STAT, TIME, I/O launched from the keyboard), and the many commands the 48G added over the 48SX —
enhanced list processing, advanced linear algebra, curve-fit models, the multiple-equation
solver, and built-in TVM finance — all wired into the live HP-48G faceplate.

## Models wired live
- **HP-48G** (1993) — identical 131×64 keyplate to the 48SX; left-shift **purple**, right-shift
  **green**, white ALPHA; right-shift keys launch the built-in applications. The faceplate is
  **already playable**; this phase completes its function coverage per `hp/functions/HP-48G.md`
  (fidelity reference: `hp/layouts/HP-48G.md`).

## Engine capabilities added
- **3D / statistical plotting** (lazy Plotly): `WIREFRAME`, `PARSURFACE`, `PCONTOUR`,
  `GRIDMAP`, `YSLICE`, `SLOPEFIELD` 3D types + `HISTOGRAM`/`BAR`/`SCATTER` with regression
  overlay; `VPAR`/`EYEPT` 3D view parameters, `XRNG`/`YRNG`/`AUTO`/`ATICK` window control.
- **Input forms / dialogs:** `INFORM` (field form), `CHOOSE` (choose box), `MSGBOX`, `NOVAL`
  — a UI-dialog bridge the RPL interpreter invokes and blocks on.
- **48G applications:** SOLVE (`ROOT`, multiple-equation `MSOLVR`/`MROOT`/`MCALC`/`MINIT`),
  PLOT, SYMBOLIC (`∂`/`∫`/`Σ`/`TAYLR`/`ISOL`/`QUAD` over Phase-14 CAS), STAT (curve-fit
  `LINFIT`/`LOGFIT`/`EXPFIT`/`PWRFIT`/`BESTFIT`, `PREDX`/`PREDY`), built-in TVM (`TVM`,
  `TVMROOT`, `TVMBEG`/`TVMEND`, `AMORT`) reusing the Phase-7 decimal.js finance engine.
- **Enhanced list processing & linear algebra:** `DOLIST`/`DOSUBS`/`STREAM`/`SEQ`/`SORT`/
  `REVLIST`/`ΣLIST`/`ΠLIST`/`ΔLIST`; `RREF`/`RANK`/`LU`/`QR`/`SVD`/`EGV` (ml-matrix,
  Phase 9); ODE Runge-Kutta suite (`RKF`/`RRK`/…) as a numerics add-on.

## PRD requirements covered
- **FR-PLOT-2** — 3D surface plots (wireframe / parametric-surface / contour).
- **FR-PLOT-4** — parametric / polar / slice plot types (finalized here with 3D).
- Reinforces FR-STAT-2 (regression/curve fit, first built Phase 16), FR-SOLVE-3
  (multiple-equation solver), FR-FIN-1/5 (built-in TVM/AMORT), FR-PRG-4 (apps/dialogs),
  FR-MAT-3 (decompositions surfaced as RPL commands).

## Key tasks
- **Engine:** extend `src/lib/engine/plot/` with a 3D/surface spec (grid sampling → Plotly
  trace data) and regression-overlay stat spec; wire `MSOLVR`/`MROOT` to the Phase-9 SOLVE
  numerics; expose ml-matrix decompositions as 48G command tokens; map `TVM`/`AMORT` onto the
  Phase-7 finance module. Pure-TS; engine emits serializable specs only.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for the 48G keyplate (purple/green
  shifts, app launchers); expose the full `hp/functions/HP-48G.md` set (superset of 48SX).
- **Wiring / UI:** 3D/stat plot panel wrapping a **lazily-imported** Plotly bundle;
  INFORM/CHOOSE/MSGBOX dialog components bridged to the Web-Worker interpreter. (The 48G
  faceplate and its purple/green shift palette are already live — no keyboard work.)
- **Tests:** engine unit tests; Playwright e2e for a 3D surface, a curve-fit, and an INFORM form.

## New dependencies
- **plotly.js** (`plotly.js-dist-min`, ~3 MB) — lazy, code-split per architecture §4.10/§5 and
  **NFR-3**; loaded only when a 3D/statistical panel is first opened. function-plot (Phase 17)
  stays the everyday-2D path. No eager additions.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - Stat data `[[1,2],[2,4],[3,6]]` → `LINFIT` `LR` slope 2, intercept 0, `CORR` 1;
    `PREDY` at x=4 → 8.
  - TVM `n=360 i=0.5 PV=100000 FV=0` → `PMT` ≈ −599.55 (matches Phase-7 finance, currency
    precision); `PROOT`/surface sampling of `Z=X²+Y²` yields the expected grid extents.
- E2e on the live faceplate: right-shift launch PLOT, choose WIREFRAME, DRAW → Plotly 3D panel
  renders; STAT curve-fit flow; INFORM dialog returns entered fields to the stack.
- **No HP-48G key remains inert** — every function in `hp/functions/HP-48G.md` resolves to an
  engine command.
- `pnpm lint`/`test`/`build`/`test:e2e` green; **Plotly confirmed absent from the initial
  chunk** (verify the build output); the existing UI suites (geometry, promotion, typing)
  stay green.

## Delivery notes (as shipped)
- **No Plotly.** The 48G's own display is a 131×64 monochrome matrix — every
  plot the machine draws is lines and dots. HISTPLOT/BARPLOT render as
  segment columns and WIREFRAME as REAL projected 3D polylines through the
  P17 function-plot panel, which is period-accurate and keeps 3 MB out of
  the app. Richer smooth-surface types (PARSURFACE/PCONTOUR/GRIDMAP/
  YSLICE/SLOPEFIELD, "3D") defer to the heavy-graphing era (P19 notes) —
  the FR-PLOT-2 flagship (wireframe surfaces) ships now.
- STAT app: SCLΣ autoscale, DRWΣ/SCATRPLOT scatter, BARPLOT/HISTPLOT;
  LINFIT/LOGFIT/EXPFIT/PWRFIT/BESTFIT + PREDX/PREDY ride the P16 CFIT core
  over the ΣDAT column pair.
- Lists: DOLIST (per-element program), STREAM (pairwise fold), SEQ, SORT,
  REVLIST, ΣLIST/ΠLIST/ΔLIST. DOSUBS stays out (needs NSUB/ENDSUB context).
- Linear algebra tokens on ml-matrix: RREF/RANK/LU/QR/SVD/EGV/EGVL.
- Built-in TVM on the P7 decimal engine: vars N/I%YR/PV/PMT/FV (annual rate,
  12/yr — documented), TVMROOT solves any of them, TVMBEG/TVMEND, AMORT
  returns principal/interest/balance in the positive-retirement convention.
  Names may contain % (I%YR) — the identifier grammar widened.
- The right-shift APPLICATION launchers ("SOLVE (cmd menu)" prints) open
  their menus; SYMBOLIC gets a roster over the P14 CAS.
- INFORM/CHOOSE/NOVAL/DGTIZ report "Interactive forms need the async UI
  bridge" honestly (the sync interpreter cannot block on dialogs);
  MSOLVR/MROOT/MINIT/MCALC and the RKF/RRK ODE suite defer with messages.
  MSGBOX is real (drives the message line).
- HP-48G coverage oracle: GREEN — no key remains inert (17 models live).

## Notes / risks
- Plotly is large and DOM-bound — one dynamic `import()` behind the 3D/stat panel; never in a
  shared/eager module. Measure cold-start against the NFR-3 budget (open question §8.4).
- The 48G and 48SX already share one live faceplate component (shift colours differ via
  `ModelBase.shift`); keep the added-function delta in `hp/functions` + mapping data only.
- Dialog commands block the interpreter awaiting UI input — model as an async suspend/resume
  on the Web-Worker interpreter (Phase 3), with the same step/time-limit safeguards.
