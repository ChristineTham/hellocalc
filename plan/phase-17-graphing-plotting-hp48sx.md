# Phase 17 — RPL graphing & plotting — HP-48SX

**Delivers:** HP-48SX · 2D plotting (function-plot) + EquationWriter + expanded RPL command set · **Era:** 1990 · **Builds on:** the live faceplate fleet + Phase 15 (28S RPL/units/CAS) (+ Phase 12 RPL stack, Phase 13 units, Phase 14 light CAS)

## Goal
Deliver the first **graphing** HP: the HP-48SX. Its faceplate already renders and is playable —
the 48-series three-shift keyboard (left orange / right blue / white ALPHA) is live, prefix
arming included. This phase adds a **lazy 2D plotting subsystem** (function-plot) driven by an
RPL plot-parameter model (`PPAR`, `DRAW`, `DRAX`), an **EquationWriter** for 2D textbook-style
math entry, a substantially **expanded RPL command set** over the 28S (graphics, polynomial
roots, upper-tail distributions), the math.js-backed **units library**, and a **plug-in card /
port** abstraction — and wires the softkey menus + NXT/PREV paging so the machine behaves like
a 48SX. It is the RPL-line counterpart to the menu-RPN HP-42S of Phase 16.

## Models wired live
- **HP-48SX** (1990) — 131×64 dot-matrix LCD; 6 softkeys + NXT/PREV menu paging; three shifts
  (left orange, right blue, white α); two plug-in card ports. The faceplate is already playable
  (`hp/layouts/HP-48SX.md` stays the fidelity reference); this phase completes function coverage
  per `hp/functions/HP-48SX.md`.

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
- **Wiring / UI:** the softkey MENU system on the 48SX glass — populate the reserved menu-label
  row, make the 6 soft keys context-sensitive, wire NXT/PREV paging; plot panel wrapping
  **lazily-imported** function-plot; EquationWriter editor. (Board and shift palette already live.)
- **Tests:** engine unit tests; Playwright e2e for a plotted function and the EquationWriter.

## New dependencies
- **function-plot** (lazy, D3-based 2D grapher) — architecture §4.10, §5; `import()`-split so
  it never lands in the initial bundle (NFR-3). No eager additions.

## Tests & acceptance (DoD)
- Engine unit tests incl. concrete HP reference examples:
  - `'X^2-3' STEQ` then `DRAW` samples a parabola crossing y=0 near x≈±1.732; `PROOT` of
    `[1 0 -3]` → roots ≈ ±1.7320508.
  - `1.5 UTPN` (mean 0, sd 1 upper tail) ≈ 0.0668; `→V2`/`R→C` and `CONVERT` unit round-trip.
- E2e on the live faceplate: key `'`, enter `SIN(X)`, select POLAR/FUNCTION menu, press DRAW →
  plot panel renders; open EquationWriter, build `X²+1`, ENTER → algebraic object on the stack.
- **No HP-48SX key remains inert** — every function in `hp/functions/HP-48SX.md` resolves to an
  engine command (48G-added families stay excluded per that doc).
- `pnpm lint`/`test`/`build`/`test:e2e` green; function-plot confirmed absent from the initial
  chunk; the existing UI suites (geometry, promotion, typing) stay green.

## Delivery notes (as shipped)
- **Plotting**: the engine SAMPLES (rpl/plot.ts — pure TS, testable: the
  parabola-crossing DoD runs headless); the UI's PlotPanel draws the series
  through function-plot, dynamic-imported inside the component so the D3
  grapher stays out of the initial bundle (NFR-3). FUNCTION + POLAR types
  ship (PTYPE/2D/POLAR); PARAMETRIC/CONIC and the statistical charts land
  with the 48G (P18) alongside 3D — "3D"/SCLΣ/DRWΣ/DGTIZ defer honestly.
- **PICT/GROB-lite**: PIXON/PIXOFF/LINE/BOX on a 131×64 pixel set,
  PVIEW renders it through the same PlotPanel, PX→C/C→PX transform via
  PPAR; →GROB emits a textual placeholder (real bitmap objects are P18
  polish). →LCD/LCD→ drive the message line.
- **EquationWriter-lite**: the EQUATION key opens algebraic entry and the
  KaTeX hero typesets it; a full 2D structural editor is out of scope
  (documented) — entry + typeset preview covers the FR-CAS-6/FR-IO-1 loop.
- ENTER **auto-completes open delimiters** (« { [ ( ' ") — the 48's own
  behavior, which also makes every paired-delimiter key usable from the
  faceplate's opening half.
- New commands: PROOT (companion-matrix eigenvalues via ml-matrix) /
  PEVAL, →V2/→V3/V→, OBJ→, →Q (continued fractions), DEF ('F(X)=expr' →
  « → X 'expr' », the 48's expansion; user-function CALLS inside other
  algebraics remain unsupported in the light grammar — documented), !,
  REVIEW, CLR, TIME menu on a second injectable clock (setRplClock),
  DDAYS/TSTR; SIN⁻¹/COS⁻¹/TAN⁻¹ canonical ids accepted.
- **I/O and LIBRARY are honest stubs** ("No I/O port / card ports in the
  emulator") — the plug-in Port registry idea is deferred until a card
  model exists to attach (documented divergence from the plan).
- The α plane now dispatches on the RPL faceplates (α-ids type letters);
  the 48SX MTH/PRG submenus nest with label-opens-roster semantics.
- HP-48SX coverage oracle: GREEN — no key remains inert (16 models live).

## Notes / risks
- function-plot is D3/DOM — keep it strictly in the UI layer; the engine emits only a
  serializable plot spec so it stays Web-Worker-safe and unit-testable.
- The 48SX ROM is ~350 ops; ship the documented working subset in `hp/functions/HP-48SX.md`
  and defer the explicitly 48G-added families to Phase 18 rather than guessing them here.
- On real hardware some STAT/Solve commands lived on plug-in cards; model them as an attached
  port library, not core, so 48SX vs 48G exposure differences stay data-driven.
- EquationWriter is interactive entry, not a programmable command — build it in the editor.
