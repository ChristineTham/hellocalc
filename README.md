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
> [Engine Architecture](docs/architecture.md) · [Build rules for agents](AGENTS.md) ·
> [HP calculator reference](hp/)

---

## What it does

- **Faithful HP keyboard emulation** — swap between models; each faceplate looks and behaves
  like the original (modern web design, not skeuomorphic). Switching models retains
  compatible state (stack, memory).
- **One unified engine** shared across all models — each model just exposes its own subset of
  keys and functions.
- **Native mode** — no virtual keypad; type algebraic (or RPN) expressions directly, with a
  history stack, variables, and a saved expression library.
- **Modern, responsive UI** — a large display with computation history, the RPN stack, and
  KaTeX-rendered equations that goes beyond a single-line traditional display; optimized for
  mobile, tablet, and desktop.
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

**UI stack:** Next.js (React client components) · shadcn/ui on Base UI · Tailwind CSS
(strictly the [Rosely colour palette](https://rosely.hellotham.com/design/colours-and-palettes/))
· TypeScript · React state (`useState`/`useReducer`) for history and the RPN stack.

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
  lib/models/     # model-adapter layer (keystroke → engine op; per-model config from hp/)
  hooks/          # React hooks bridging engine ↔ UI
  components/     # faceplates, display, stack view, keypad, plots
  components/ui/  # shadcn primitives (added via CLI)
  app/            # Next.js routes/layout (static export)
  __tests__/      # unit/component tests (Vitest)
e2e/              # end-to-end tests (Playwright)
docs/             # prd.md, architecture.md
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
`main` by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). CI (lint · test ·
build · e2e) runs via [`.github/workflows/ci.yml`](.github/workflows/ci.yml). The app can also
be deployed to [Vercel](https://vercel.com/new).

Because it's a static export, there is no server runtime: no API routes, Server Actions, or
middleware — everything runs in the browser.

## Roadmap

Milestones (each independently shippable) — see [PRD §12](docs/prd.md) and
[architecture §7](docs/architecture.md):

1. **Engine core + algebraic** — pure-TS engine, number tower, algebraic eval, history, variables.
2. **RPN/RPL + first faceplate** — stack machine (both modes), model adapter, HP-12C & HP-15C
   faceplates, native mode.
3. **Precision, units, matrices** — decimal.js finance base, units, matrices + decompositions.
4. **Light CAS** — symbolic diff/integrate/factor/solve, equation solver, KaTeX output.
5. **Finance & statistics parity** — TVM/NPV/IRR/bond/Black-Scholes, stats/regression/distributions.
6. **Plotting & programmability** — 2D/3D/stat plots, sandboxed program interpreter, notebook editor.
7. **Heavy CAS (optional)** — lazy Pyodide + SymPy advanced-CAS tier.

*Ongoing:* additional faceplates, persistence polish, PWA/offline.

## Contributing

Read [AGENTS.md](AGENTS.md) before writing code — it defines the hard rules (fully-typed
TypeScript, vanilla Tailwind, shadcn-via-CLI, testing, static-export constraints) and which
skills to use for each kind of task.
