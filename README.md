# Hello Calc

An advanced calculator, reimagined as a modern web app — and a homage to the great
Hewlett-Packard calculators.

Hellocalc faithfully emulates the keyboard layouts of classic HP models (colors, key
placement, prefix behavior) while also working as a genuinely modern app: use a physical
keyboard, a mouse, and a large screen instead of hunting and pecking at virtual keys. Every
model runs on one shared, advanced calculator engine, and a **native mode** exposes the full
engine through a typed expression evaluator with history, variables, and an expression
library.

> **Docs:** [Product Requirements (PRD)](docs/prd.md) ·
> [Engine Architecture](docs/architecture.md) ·
> [Responsive layout & machine UI](docs/responsive-layout.md) ·
> [Implementation plan](plan/) ·
> [Build rules for agents](AGENTS.md) · [HP calculator reference](hp/)

---

## What it does

- **Faithful HP keyboard emulation** — swap between models; each faceplate looks and behaves
  like the original (modern web design, not skeuomorphic). Switching models retains
  compatible state (stack, memory).
- **One unified engine** shared across all models — each model just exposes its own subset of
  keys and functions.
- **Native mode** — no virtual keypad; type algebraic (or RPN) expressions directly, with a
  history stack, variables, and a saved expression library.
- **Modern, responsive UI** — nameplate, LCD and keyboard render as one integrated machine
  whose keyboard keeps the real model's proportions on every screen; computation history
  prints to a paper-style tape, the stack and variables read as notebook notes, and
  equations render in KaTeX — optimized for mobile, tablet, and desktop.
- **Advanced math**:
  - Arbitrary-precision (BigNumber / fixed-point) arithmetic, floating point in selectable
    precisions, and high-precision currency
  - Symbolic computation / Computer Algebra System (differentiation, integration, factoring,
    equation solving) — potentially Mathematica-compatible
  - Units & dimensional analysis (e.g. `5 cm + 2 inches`)
  - Matrices & linear algebra (determinant, inverse, eigen/SVD/QR/LU)
  - Numerical equation solver and integration (HP `SOLVE` / `∫`)
  - Financial math — Time Value of Money, NPV/IRR, bond pricing, Black-Scholes
  - Geometry
  - Statistics & probability
  - 2D / 3D / statistical plotting
  - HP-48-style programmability
- **Interchange & rendering** — textbook-quality KaTeX rendering; copy and paste equations in
  multiple formats; export equations as KaTeX/LaTeX; editor-based block (notebook) evaluations.
- **Persistent state** — memory/registers, variables, saved programs, and history retained
  across sessions and (where compatible) across model switches.

See the [PRD](docs/prd.md) for the full, prioritized requirement set.

## Status

**ALL 23 PLAN PHASES ARE COMPLETE: every one of the 21 models is fully wired — zero inert
keys, each guarded by a per-model coverage oracle — plus the keyboard-first NATIVE MODE**
at <https://christinetham.github.io/hellocalc/>. Every keyboard is authored or generated
from the verified [`hp/`](hp/) reference data and computes on the **math.js/BigNumber value
tower** (`0.1 + 0.2` is exactly `0.3`). The engine spans the fixed 4-level RPN stack
(HP-35 → HP-16C, with keystroke programs, decimal.js finance, complex, matrices, SOLVE/∫,
the 16C integer universe) and the dynamic RPL object stack (28C → 50g: objects, directories,
units, softkey menus, 2D/wireframe plotting, a light Nerdamer CAS and a lazy Pyodide+SymPy
heavy tier), the 42S/35s/Prime menu-driven planes, and a native notebook/library surface.
Sessions autosave to localStorage and export as versioned JSON. The design and full
rationale live in [docs/responsive-layout.md](docs/responsive-layout.md); the highlights:

- **The integrated machine** — nameplate, LCD and keyboard are ONE bezel that reflows across
  five page templates (phone → desktop): classic portrait models stack LCD-over-keys for the
  classic calculator look; tall models like the HP-48G go LCD-beside-keyboard with a
  variables bay under the glass and the history tape at full height alongside.
- **Keyboard aspect fidelity** — each keyboard's proportions derive from its real key grid
  (the Voyagers land landscape at 2.89:1, the HP-35 portrait at 0.70:1, the open HP-28
  clamshell at 2.04:1) and scale uniformly — no distortion, no clipping; dual-pitch rows
  (the genuinely wider digit keys) are modeled exactly via lcm sub-column grids, and the
  two-block machines (28C/28S, 97) merge their halves across a bare-plate hinge gap.
- **Per-family glass** — seven-segment (DSEG7) readouts for Classic/Voyager models; a
  dot-matrix, 131:64-proportioned multi-line stack display for RPL, after the real HP-48
  screen.
- **Paper, not pixels** — history prints as a calculator tape; stack and variables are
  notebook notes; each individually toggleable and placed by the active template (sheets on
  phones).
- **Type, don't tap** — per-model physical-keyboard maps with visible key echo, a `?`
  shortcut cheat-sheet, and a ⌘K model picker.
- **Prefix promotion** — arming any shift plane (`f`/`g`/`h`/`f⁻¹`/left/right/alpha)
  promotes each key's shifted function into its primary slot, so the keyboard always shows
  what a press will do; per-model shift palettes (48SX orange/blue, 49G green/red, 50g
  white/orange, 28 red) re-theme the planes token-deep.
- **Trademark-safe branding** — HELLO·CALC nameplates with the pink `hc` mark and bare model
  numbers; mode tags (RPN, FINANCIAL, …) as top-bar badges.

All of it is guarded by unit/component suites (geometry, templates, promotion, machine
anatomy) and a Playwright device-matrix e2e (keyboard aspect fidelity ±2%, template
boundaries, typing, sheet behavior).

## Emulated models

21 landmark models across the HP eras, plus native mode — each backed by a verified keyboard
layout and function set (see [`hp/`](hp/)):

| Family | Models | Logic |
|---|---|---|
| Voyager | HP-12C, HP-15C, HP-11C, HP-16C | 4-level RPN |
| Classic / Woodstock | HP-35, HP-45, HP-65, HP-25 | 4-level RPN |
| Programmable / desktop | HP-67, HP-97 | 4-level RPN |
| HP-41 | HP-41C/CV, HP-41CX | 4-level RPN (alphanumeric) |
| Pioneer | HP-42S | 4-level RPN |
| RPL clamshell | HP-28C, HP-28S | RPL (dynamic stack) |
| RPL graphing | HP-48SX, HP-48G, HP-49G, HP-50g | RPL (dynamic stack) |
| Modern | HP-35s, HP Prime | RPN / configurable |
| **Native mode** | — | RPN or algebraic |

Full feature parity with the legendary HP-48 series (matrices, statistics, programmability)
is an explicit goal.

All 21 faceplates are playable today (native mode arrives in Phase 23); each model's
remaining work is the **engine capability** its [plan](plan/) phase adds — the keys are
already on the desk, waiting to be wired.

## Architecture

A **client-side, statically-deployable** app — no backend required. The full rationale and
library-by-library evaluation is in [docs/architecture.md](docs/architecture.md); in short:

- **Pure-TypeScript engine**, framework-agnostic (no React), unit-tested in isolation.
- **Unified core (eager):** [Math.js](https://mathjs.org/) as the number tower, expression
  parser, units, matrices, and complex numbers — with
  [decimal.js](https://mikemcl.github.io/decimal.js/) used directly for fixed-point currency
  in the finance module. (Math.js `BigNumber` is decimal.js under the hood.)
- **Tiered CAS behind one `CasProvider` interface:**
  - *Light (lazy):* [Nerdamer](https://nerdamer.com/) (`nerdamer-prime` fork) / Algebrite for
    everyday symbolic math.
  - *Heavy (lazy, optional):* [Pyodide](https://pyodide.org/) + SymPy/mpmath (CPython → WASM)
    for Mathematica-grade CAS — loaded on demand, never in the initial bundle.
- **Linear algebra:** [ml-matrix](https://github.com/mljs/matrix) for decompositions.
- **Rendering:** [KaTeX](https://katex.org/) (`react-katex`).
- **Plotting (lazy):** [function-plot](https://mauriciopoppe.github.io/function-plot/) (2D) +
  [Plotly.js](https://plotly.com/javascript/) (3D / statistical).
- **Programmability:** HP programs run in a sandboxed interpreter (Web Worker, step/time
  limits) — never `eval`.
- **Model-adapter layer** drives keystroke dispatch and per-model exposure from the `hp/`
  data assets (below).

**UI stack:** Next.js (React client components) · shadcn/ui on Base UI · Tailwind CSS v4
(the app's own HP-calculator design tokens in the `@theme` block of `globals.css`) ·
TypeScript · React state (`useState`/`useReducer`) for history and the RPN stack.

Heavy dependencies (Plotly, Pyodide, CAS libraries) are code-split and lazy-loaded to keep
the initial bundle small.

## The `hp/` reference

The [`hp/`](hp/) directory is a first-class product input, not just documentation — the app
consumes it directly:

- [`hp/layouts/`](hp/layouts/) — per-model keyboards (key positions, legends, shift colors) →
  drives faceplate rendering.
- [`hp/functions/`](hp/functions/) — per-model function catalogs → drives per-model feature
  exposure.
- [`hp/mapping/`](hp/mapping/) — a unified key+prefix → function map (CSV + JSON) →
  drives keystroke dispatch (regenerable via `hp/mapping/build_mapping.py`).
- [`hp/manuals/`](hp/manuals/) — source owner's manuals for behavior verification.

## Project structure

```
src/
  lib/engine/     # pure-TS math engine (value tower, parser, stack machine, feature modules)
  lib/layout/     # layout oracles: keyboard geometry, page templates, shared breakpoints
  lib/models/     # model-adapter layer (keystroke → engine op; per-model config from hp/)
  hooks/          # React hooks bridging engine ↔ UI (calculators, hotkeys, viewport tier)
  components/     # the machine (bezel, keyboards, LCD, paper tape/notes) + chrome (topbar, nav)
  components/ui/  # shadcn primitives (added via CLI)
  app/            # Next.js routes/layout (static export)
  __tests__/      # unit/component tests (Vitest)
e2e/              # end-to-end tests (Playwright)
docs/             # prd.md, architecture.md, responsive-layout.md
plan/             # phased implementation plan (one .md per phase + index)
hp/               # HP calculator reference (layouts, functions, mapping, manuals)
```

## Getting started

This project uses **pnpm** (see `packageManager`), Node 24, Next.js, and Tailwind v4.

```bash
pnpm install
pnpm dev          # start the dev server → http://localhost:3000
```

### Scripts

```bash
pnpm lint         # ESLint
pnpm test         # unit & component tests (Vitest)
pnpm test:e2e     # end-to-end tests (Playwright)
pnpm build        # static export → out/
```

Before finishing any change, `pnpm lint`, `pnpm test`, and `pnpm build` must pass — see the
full build rules in [AGENTS.md](AGENTS.md).

## Deployment

Configured via [`next.config.ts`](next.config.ts) as a **static export** (`output: "export"`)
under the base path **`/hellocalc`**, deployed to **GitHub Pages** automatically on push to
`main` by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — live at
<https://christinetham.github.io/hellocalc/>. CI (lint · test ·
build · e2e) runs via [`.github/workflows/ci.yml`](.github/workflows/ci.yml). The app can also
be deployed to [Vercel](https://vercel.com/new).

Because it's a static export, there is no server runtime: no API routes, Server Actions, or
middleware — everything runs in the browser.

## Roadmap

Built in **iterative, chronological phases**. With every faceplate already live, each phase
takes the next HP model (in release order), implements the engine capability it first
required, and **wires it through the existing keys** — finish line: no key on that model
remains inert. Large subsystems (programmability, RPL, units, CAS, plotting, heavy CAS) get
their own phase; **native mode is last**. Full detail — one file per phase with tasks and
acceptance tests — is in [`plan/`](plan/) ([index](plan/README.md)).

**Phase 1 — Engine foundation & HP-35 (1972).** The shared pure-TS engine (math.js/BigNumber
value tower, 4-level RPN stack + `LAST X`, memory, scientific functions), the `hp/mapping`-driven
model adapter, and state persistence — making the already-live HP-35 the first fully
functional, exact-arithmetic model.

Then, in release order:

| Phases | Models · era | Capability introduced |
|---|---|---|
| 2–5 | HP-45, HP-65, HP-25, HP-67/97 · 1973–76 | Statistics; **keystroke programmability** (sandboxed); continuous memory; indirect addressing |
| 6 | HP-41C/CV · 1979–80 | **Alphanumeric display, ALPHA mode, named programs**, USER keys |
| 7–8 | HP-12C, HP-11C · 1981 | **Financial engine** (TVM/NPV/IRR/bonds); probability |
| 9–11 | HP-15C, HP-16C, HP-41CX · 1982–83 | **Complex, matrices, SOLVE & ∫**; **integer/base/bitwise**; extended memory |
| 12–16 | HP-28C, HP-28S, HP-42S · 1986–88 | **RPL dynamic stack**; **units**; **light symbolic CAS**; menu-driven RPN + regression |
| 17–18 | HP-48SX, HP-48G · 1990–93 | **Plotting** (2D → 3D/statistical); equation writer, apps |
| 19–20 | HP-49G, HP-50g · 1999–2006 | **Heavy CAS** (lazy Pyodide+SymPy); CAS-graphing consolidation |
| 21–22 | HP-35s, HP Prime · 2007–13 | Modern RPN/algebraic dual entry; touchscreen CAS, Home/CAS + apps |
| **23** | **Native mode** | Full-engine expression evaluator: notebook, expression library, copy/paste + KaTeX export |

Responsive scaling and the history display are already delivered (see
[docs/responsive-layout.md](docs/responsive-layout.md)) and reused by every faceplate; state
persistence is established in Phase 1, and **file import/export and named workspaces** are
finalized in Phase 23 (see [architecture §9](docs/architecture.md)).

## Contributing

Read [AGENTS.md](AGENTS.md) before writing code — it defines the hard rules (fully-typed
TypeScript, vanilla Tailwind, shadcn-via-CLI, testing, static-export constraints) and which
skills to use for each kind of task.
