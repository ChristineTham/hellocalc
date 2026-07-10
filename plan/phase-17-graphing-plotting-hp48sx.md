# Phase 17 — RPL graphing & plotting — HP-48SX

**Delivers:** HP-48SX · 2D plotting (function-plot) + EquationWriter + expanded RPL command set · **Era:** 1990 · **Builds on:** Phase 15 (28S RPL/units/CAS) (+ Phase 12 RPL stack, Phase 13 units, Phase 14 light CAS)

## Goal
Deliver the first **graphing** HP: the HP-48SX. This phase adds a **lazy 2D plotting
subsystem** (function-plot) driven by an RPL plot-parameter model (`PPAR`, `DRAW`, `DRAX`),
an **EquationWriter** for 2D textbook-style math entry, the 48-series **three-shift keyboard**
(left orange / right blue / white ALPHA), a substantially **expanded RPL command set** over
the 28S (graphics, polynomial roots, upper-tail distributions), the math.js-backed **units
library**, and a **plug-in card / port** abstraction. It is the RPL-line counterpart to the
menu-RPN HP-42S of Phase 16.

## Models delivered
- **HP-48SX** (1990) — 131×64 dot-matrix LCD; 6 softkeys + NXT/PREV menu paging; three shifts
  (left orange, right blue, white α); two plug-in card ports. Faceplate per
  `hp/layouts/HP-48SX.md`, functions per `hp/functions/HP-48SX.md`.

## Engine capabilities added
- **2D plotting module** (pure-TS plot spec + lazy `function-plot` renderer in the UI):
  `FUNCTION`, `POLAR`, `PARAMETRIC`, `CONIC` plot types plus statistical `SCATTER`/`BAR`/
  `HISTOGRAM` off ΣDAT. Plot state as an RPL `PPAR` object (PMIN/PMAX, `INDEP`, `RES`,
  `AXES`, `SCALE`, `CENTR`); `STEQ`/`RCEQ` current equation; `DRAW`/`DRAX`/`ERASE`.
- **EquationWriter:** a 2D math-entry surface producing an RPL algebraic object; renders via
  KaTeX (Phase 14 pipeline) and round-trips to the object stack.
- **Expanded RPL commands over the 28S:** `PROOT`/`PEVAL`/`ROOT` (roots), statistics
  `UTPC`/`UTPF`/`UTPN`/`UTPT`, `CORR`/`COV`/`LR`/`PREDV`, `TAYLR`, list `GET`/`PUT`/`SUB`/
  `SIZE`, base/word-size ops, `CONVERT`/`UBASE`/`UVAL`/`→UNIT` units library.
- **Graphics object (GROB) primitives:** `→GROB`, `PIXON`/`PIXOFF`, `LINE`, `BOX`, `PVIEW`,
  `PX→C`/`C→PX` — a lightweight PICT model the plotter and later phases share.
- **Plug-in card / port model:** typed `Port` registry (ports 1–2) so application/library
  cards attach without touching core (parallels the Phase-6 HP-41 module registry).

## PRD requirements covered
- **FR-PLOT-1** — 2D function plotting from an entered/solved expression.
- **FR-PLOT-3** — statistical charts (scatter / histogram / bar off ΣDAT).
- **FR-UI-1** — large display: stack + history + KaTeX + a dedicated plot panel.
- Advances **FR-PLOT-4** (polar/parametric via function-plot; finalized alongside 3D in
  Phase 18) and reinforces FR-CAS-6/FR-IO-1 (EquationWriter → KaTeX), FR-UNIT-1/3.

## Key tasks
- **Engine:** `src/lib/engine/plot/` — plot-spec builder (type + PPAR → sampled series over
  compiled math.js expressions); polynomial `PROOT`/`PEVAL`; upper-tail distributions
  (`UTPN`/`UTPT`/`UTPC`/`UTPF` — verify jStat coverage per architecture §4.8, else implement);
  GROB/PICT model. All pure-TS.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for the 48SX 3-shift keyboard
  and softkey menus; expose only `hp/functions/HP-48SX.md` (exclude 48G-added families noted
  there — INFORM/CHOOSE, DOLIST/STREAM, SVD/EGV, RKF, MSOLVR, curve-fit models, TVM).
- **Faceplate / UI:** 48SX faceplate (orange/blue/white shifts, 6 softkeys + NXT/PREV, two
  card ports); plot panel wrapping **lazily-imported** function-plot; EquationWriter editor.
- **Tests:** engine unit tests; Playwright e2e for a plotted function and the EquationWriter.

## New dependencies
- **function-plot** (lazy, D3-based 2D grapher) — architecture §4.10, §5; `import()`-split so
  it never lands in the initial bundle (NFR-3). No eager additions.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - `'X^2-3' STEQ` then `DRAW` samples a parabola crossing y=0 near x≈±1.732; `PROOT` of
    `[1 0 -3]` → roots ≈ ±1.7320508.
  - `1.5 UTPN` (mean 0, sd 1 upper tail) ≈ 0.0668; `→V2`/`R→C` and `CONVERT` unit round-trip.
- Faceplate e2e: key `'`, enter `SIN(X)`, select POLAR/FUNCTION menu, press DRAW → plot panel
  renders; open EquationWriter, build `X²+1`, ENTER → algebraic object on the stack.
- `pnpm lint`/`test`/`build`/`test:e2e` green; function-plot confirmed absent from the initial
  chunk. Fidelity vs `hp/layouts/HP-48SX.md` (SM-1): keys, shift colours, softkeys, ports.

## Notes / risks
- function-plot is D3/DOM — keep it strictly in the UI layer; the engine emits only a
  serializable plot spec so it stays Web-Worker-safe and unit-testable.
- The 48SX ROM is ~350 ops; ship the documented working subset in `hp/functions/HP-48SX.md`
  and defer the explicitly 48G-added families to Phase 18 rather than guessing them here.
- On real hardware some STAT/Solve commands lived on plug-in cards; model them as an attached
  port library, not core, so 48SX vs 48G exposure differences stay data-driven.
- EquationWriter is interactive entry, not a programmable command — build it in the editor.
