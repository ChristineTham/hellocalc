# Hellocalc — Phased Implementation Plan

A chronological, iterative build of hellocalc per [`docs/prd.md`](../docs/prd.md) and
[`docs/architecture.md`](../docs/architecture.md). Each phase is a shippable increment that
**builds on the previous one**: it adds one (or a few) HP calculator model(s) in **order of
release**, and implements — in the shared engine — the capabilities that model first
required. When a model introduces a large new subsystem (keystroke programmability, RPL,
units, symbolic CAS, plotting, heavy CAS), that subsystem gets **its own phase**. The final
phase is **native mode**.

Every phase file follows the same template (goal · models delivered · engine capabilities
added · PRD requirements · key tasks · new dependencies · tests & DoD · notes).

---

## How to read this plan

- **One engine, many faceplates.** Capabilities accumulate in the shared pure-TS engine
  (`src/lib/engine/`, per architecture §3). Each model is a *view* that exposes only its own
  keys/functions via the model-adapter layer driven by
  [`hp/mapping/mapping.json`](../hp/mapping/mapping.json).
- **Fidelity from data.** Faceplates render from [`hp/layouts/`](../hp/layouts/); function
  exposure from [`hp/functions/`](../hp/functions/); dispatch from `hp/mapping/`. Never
  hand-author key maps (AGENTS.md §1).
- **Green gate every phase.** `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e` pass;
  engine changes carry unit tests **including HP reference examples**; each new faceplate
  gets an e2e (per `docs/prd.md` SM-1/SM-2, NFR-5).
- **Deps arrive lazily.** New libraries (nerdamer-prime, ml-matrix, js-quantities,
  function-plot, Plotly, Pyodide) are added in the phase that first needs them and
  code-split per architecture §5 / NFR-3.

### Relationship to the current prototype

The repo already contains a working prototype: basic 4-level RPN and dynamic RPL engines and
faceplates for HP-12C/15C/35/48G (JS numbers, no math.js/BigNumber yet). **Phase 1 formalizes
that prototype onto the target architecture** — math.js value tower configured to BigNumber,
the model-adapter layer, and the faceplate framework — and the existing prototype faceplates
are re-based onto it as their phases come up. Treat the prototype as a spike that proved the
UI/engine seam; the plan is the production path.

---

## Release chronology → phase map

| Phase | Title | Model(s) · era | Headline capability added |
|---|---|---|---|
| [01](phase-01-engine-hp35.md) | Engine foundation & **HP-35** | HP-35 · 1972 | Engine core: math.js/BigNumber value tower, 4-level RPN stack + LAST X, memory, scientific fns, model-adapter, faceplate framework |
| [02](phase-02-hp45.md) | **HP-45** | HP-45 · 1973 | `f` prefix, storage registers + register arithmetic, descriptive statistics, coordinate/angle/metric conversions |
| [03](phase-03-programmability-hp65.md) | Keystroke programmability & **HP-65** | HP-65 · 1974 | Program subsystem (record/edit/run, LBL/GTO/RTN, tests, flags, subroutines) in a sandboxed Web-Worker interpreter |
| [04](phase-04-hp25.md) | **HP-25** | HP-25 · 1975 | `f`/`g` dual prefix, continuous memory persistence, compact programming |
| [05](phase-05-hp67-hp97.md) | **HP-67 / HP-97** | HP-67, HP-97 · 1976 | `f`/`g`/`h` prefixes, indirect addressing, expanded program control, printer panel (97) |
| [06](phase-06-hp41-alpha.md) | Alphanumeric & named programs — **HP-41C/CV** | HP-41C, HP-41CV · 1979–80 | Alphanumeric display + ALPHA mode/strings, `XEQ` named functions, USER key assignment, function catalog, expansion ports |
| [07](phase-07-finance-hp12c.md) | Financial engine & **HP-12C** | HP-12C · 1981 | decimal.js finance: TVM, cash flows (NPV/IRR), bonds, depreciation, amortization, date math |
| [08](phase-08-hp11c.md) | **HP-11C** | HP-11C · 1981 | Probability (nPr/nCr/x!/RAND); Voyager scientific-programmable faceplate |
| [09](phase-09-complex-matrix-solve-hp15c.md) | Complex, matrices, SOLVE & ∫ — **HP-15C** | HP-15C · 1982 | Complex numbers, matrices + linear algebra (ml-matrix), numerical SOLVE & integrate, hyperbolics |
| [10](phase-10-integer-base-hp16c.md) | Integer & base arithmetic — **HP-16C** | HP-16C · 1982 | Integer mode, word size, HEX/DEC/OCT/BIN, complement modes, bitwise/shift/rotate/bit ops |
| [11](phase-11-hp41cx.md) | **HP-41CX** | HP-41CX · 1983 | Extended memory/functions, time module (clock/alarms/stopwatch) on the HP-41 subsystem |
| [12](phase-12-rpl-hp28c.md) | RPL foundation & **HP-28C** | HP-28C · 1986 | Dynamic object stack, RPL object types (real/complex/string/list/array/program/algebraic) + interpreter, softkey menus, clamshell |
| [13](phase-13-units.md) | Units & dimensional analysis | (retrofit 28C+) · 1986 | math.js units, unit objects, `5 cm + 2 inches`, conversions, dimensional-compatibility errors |
| [14](phase-14-light-cas.md) | Light symbolic CAS | (28C+) · 1986–88 | `CasProvider` seam + Nerdamer/Algebrite (lazy): diff, integrate, factor, simplify, solve; KaTeX rendering |
| [15](phase-15-hp28s.md) | **HP-28S** | HP-28S · 1988 | Expanded RPL/CAS/units/memory, directories & variables, over the 28C |
| [16](phase-16-menu-rpn-hp42s.md) | Menu-driven RPN & **HP-42S** | HP-42S · 1988 | Menu/softkey system; RPN complex/matrix/solver/∫/stats via menus; regression/curve-fit; custom menus |
| [17](phase-17-graphing-plotting-hp48sx.md) | RPL graphing & plotting — **HP-48SX** | HP-48SX · 1990 | 2D plotting (function-plot), equation writer, expanded RPL command set, units library, plug-in ports |
| [18](phase-18-hp48g.md) | **HP-48G** | HP-48G · 1993 | Enhanced graphing (3D/statistical via lazy Plotly), input forms, more built-ins/apps |
| [19](phase-19-heavy-cas-hp49g.md) | Heavy CAS (Pyodide+SymPy) — **HP-49G** | HP-49G · 1999 | Lazy Pyodide+SymPy heavy CAS tier: exact/rational arithmetic, robust integrate/factor/solve |
| [20](phase-20-hp50g.md) | **HP-50g** | HP-50g · 2006 | CAS-graphing consolidation (~340 commands), local-storage "SD card", over the 49G |
| [21](phase-21-hp35s.md) | **HP-35s** | HP-35s · 2007 | Modern RPN/algebraic dual entry, equation solver, physical-constants library, vectors, integration |
| [22](phase-22-hp-prime.md) | **HP Prime** | HP Prime · 2013 | Color touchscreen; Home (numeric) + CAS (symbolic) views; apps; textbook entry; HP PPL; distributions/tests |
| [23](phase-23-native-mode.md) | **Native mode** | — | Full-engine expression evaluator (no keypad): history, variables, expression library, notebook editor, copy/paste + KaTeX export |

*Chronology note:* the HP-41CX (1983) ships **after** the Voyager series (1981–82), matching
actual release order, so it appears at Phase 11 rather than beside the HP-41C/CV (Phase 6);
the CX simply extends the HP-41 subsystem already built in Phase 6.

---

## Capability → phase index (for tracing PRD FRs)

| Capability (PRD ref) | Introduced in |
|---|---|
| 4-level RPN stack, memory, scientific (FR-STK-1, FR-NUM-1/2/6/7) | Phase 01 |
| Responsive faceplate scaling + collapsible panels/LCD (FR-UI-3/7/8/9) | Phase 01 (framework, reused by every faceplate) |
| History display (FR-EXP-5, FR-UI-1) | Phase 01 |
| Statistics — descriptive (FR-STAT-1) | Phase 02 |
| Keystroke programmability + sandbox (FR-PRG-1/2/3, NFR-9) | Phase 03 |
| Continuous-memory persistence (FR-STATE-1) | Phase 04 |
| Indirect addressing, multi-prefix | Phase 05 |
| Alphanumeric/ALPHA, named programs, USER (FR-PRG-2/4) | Phase 06 |
| Financial (FR-FIN-*, FR-NUM-3) | Phase 07 |
| Probability/combinatorics (FR-STAT-4) | Phase 08 |
| Complex, matrices, SOLVE, ∫ (FR-NUM-4, FR-MAT-*, FR-SOLVE-*) | Phase 09 |
| Integer/base/bitwise | Phase 10 |
| Extended memory + time module | Phase 11 |
| RPL dynamic stack + object types (FR-STK-2/5) | Phase 12 |
| Units & dimensional analysis (FR-UNIT-*) | Phase 13 |
| Light symbolic CAS + KaTeX (FR-CAS-1..4/6, FR-IO-1/3) | Phase 14 |
| Regression / curve fit (FR-STAT-2/3) | Phase 16 |
| 2D plotting (FR-PLOT-1/3) | Phase 17 |
| 3D / statistical plotting (FR-PLOT-2/4) | Phase 18 |
| Heavy CAS — Pyodide/SymPy (FR-CAS-5, FR-IO-4) | Phase 19 |
| Dual RPN/algebraic entry (FR-STK-4) | Phase 21 |
| Native mode + notebook (FR-NATIVE-*, FR-EXP-*, FR-UI-4) | Phase 23 |
| State persistence — serializable state tree + value codec + localStorage autosave + file export/import (FR-STATE-1/4) | Phase 01 foundation; extended per phase — see architecture §9 |
| Named workspaces, program/directory library, PWA offline (FR-STATE-3, NFR-2), light/dark (FR-UI-6) | finalized by Phase 23 |

---

## Phase file template

Each `phase-NN-*.md` uses:

```
# Phase N — <Title>
**Delivers:** <models> · <capability>   **Era:** <year(s)>   **Builds on:** Phase <N-1> (+deps)
## Goal
## Models delivered            (per hp/layouts + hp/functions)
## Engine capabilities added   (new subsystems/functions, vs architecture §3 layers)
## PRD requirements covered    (FR-*/NFR-* ids)
## Key tasks                   (engine · model-adapter · faceplate · tests)
## New dependencies            (architecture §5, load strategy)
## Tests & acceptance (DoD)    (unit incl. HP reference examples · e2e · lint/build green)
## Notes / risks
```
