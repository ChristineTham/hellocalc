# Hellocalc — Product Requirements Document

**Status:** Draft v1 · **Owner:** Chris Tham · **Date:** 2026-07-10
**Sources:** [`README.md`](../README.md) (product overview & intent) · [`architecture.md`](architecture.md) (approved technical architecture) · [`../hp/`](../hp/) (HP-calculator reference: 21 models, layouts, function sets, key→function mapping)

Requirements use stable IDs (`FR-*`, `NFR-*`) and MoSCoW priority (**M**ust / **S**hould /
**C**ould / **W**on't-this-release). "Full scope" here means the complete product vision;
the [Release Plan](#12-release-plan) sequences it into shippable milestones.

---

## 1. Overview & vision

Hellocalc is a client-side web application that pays homage to Hewlett-Packard calculators
by faithfully emulating the keyboard layouts of classic models, while also working as a
modern web app that takes full advantage of a physical keyboard, mouse, and large screen.

A single **unified calculator engine** powers every model. Each emulated model exposes only
its own keys and functions, but they all share one engine, one number system, and retained
state. Beyond the vintage faceplates, a **"native" mode** exposes the full engine through an
expression evaluator — no virtual keypad, just typed algebraic (or RPN) input with history,
variables, and an expression library.

The product is a love letter to the HP-48/42S/15C/12C era *and* a genuinely capable modern
scientific/financial/graphing calculator and computer-algebra environment.

## 2. Goals & non-goals

**Goals**
- G1. Faithful emulation of classic HP keyboards (color, key placement, prefix behavior) —
  modern web design, not skeuomorphic.
- G2. One advanced engine shared across all models, with state retained across model switches.
- G3. A first-class "native" mode for keyboard-driven power users.
- G4. Advanced capabilities: arbitrary precision, symbolic CAS, matrices, units, equation
  solving, finance, statistics, plotting, and programmability.
- G5. Static, client-side deployment (GitHub Pages / Vercel) with no required backend.
- G6. Responsive across mobile, tablet, and desktop.

**Non-goals (this product)**
- NG1. No required server backend, user accounts, or cloud sync (state is local).
- NG2. Not a bit-exact hardware/ROM emulator — it reproduces *behavior, layout, and function
  sets*, not original firmware.
- NG3. Not a general programming IDE (the notebook/programmability is calculator-scoped).

## 3. Target users

- **P1 — The HP nostalgic:** owned an HP-12C/15C/41/48; wants the exact keyboard and RPN feel.
- **P2 — The power user / professional:** engineer, finance, science, or student who wants a
  fast keyboard-driven calculator with units, matrices, CAS, and high precision.
- **P3 — The learner:** exploring RPN, CAS, or financial math; benefits from history, KaTeX
  rendering, and step visibility.

## 4. Product pillars

1. **Fidelity** — the keyboards look and behave like the originals (per [`hp/layouts/`](../hp/layouts/)).
2. **One engine** — shared, advanced, correct; models are views over it.
3. **Modern ergonomics** — physical keyboard, large display, history, KaTeX, copy/paste, plots.
4. **Client-side & static** — fast, offline-capable, zero backend.

---

## 5. Scope: emulated models

In scope are the 21 landmark models for which we hold verified layouts and function sets in
[`hp/`](../hp/), plus native mode:

| Family | Models | Stack | Priority |
|---|---|---|---|
| Voyager | HP-12C, HP-15C, HP-11C, HP-16C | 4-level RPN | **M** (12C, 15C first) |
| Classic/Woodstock | HP-35, HP-45, HP-65, HP-25 | 4-level RPN | S |
| Programmable/desktop | HP-67, HP-97 | 4-level RPN | C |
| HP-41 | HP-41C/CV, HP-41CX | 4-level RPN (alpha) | S |
| Pioneer | HP-42S | 4-level RPN | S |
| RPL clamshell | HP-28C, HP-28S | RPL dynamic | C |
| RPL graphing | HP-48SX, HP-48G, HP-49G, HP-50g | RPL dynamic | S (48G) / C (others) |
| Modern | HP-35s, HP Prime | RPN / configurable | C |
| **Native mode** | — | either, user-selectable | **M** |

Each model's exact keys, colors, prefixes, and functions are defined by
[`hp/layouts/<MODEL>.md`](../hp/layouts/), [`hp/functions/<MODEL>.md`](../hp/functions/), and
the unified [`hp/mapping/mapping.json`](../hp/mapping/mapping.json).

---

## 6. Functional requirements — calculator engine

### 6.1 Number system & precision
- **FR-NUM-1 (M):** Support arbitrary-precision decimal (BigNumber) as the default numeric
  type, with user-selectable precision (significant digits).
- **FR-NUM-2 (M):** Support IEEE floating point mode for speed/compatibility where chosen.
- **FR-NUM-3 (M):** Fixed-point / currency arithmetic with explicit rounding modes for the
  finance module (decimal.js-backed).
- **FR-NUM-4 (M):** Complex numbers (rectangular & polar entry/display), as required by
  HP-15C/42S/48.
- **FR-NUM-5 (S):** Fractions/rationals and exact integers where the model supports them.
- **FR-NUM-6 (M):** Angle modes DEG / RAD / GRAD affecting trig functions.
- **FR-NUM-7 (M):** Display formats FIX / SCI / ENG / ALL with configurable digits.

### 6.2 Stack & entry logic
- **FR-STK-1 (M):** Classic 4-level RPN stack `X/Y/Z/T` + `LAST X`, implementing the exact
  ENTER-lift, drop, and no-lift (`ENTER`/`CLx`/`Σ+`) semantics from [`hp/README.md`](../hp/README.md).
- **FR-STK-2 (M):** RPL-style dynamic unlimited object stack for the 28/48/49/50g family.
- **FR-STK-3 (M):** Algebraic entry mode (infix expressions) alongside RPN.
- **FR-STK-4 (M):** Configurable logic mode (RPN vs algebraic) where the model supports both
  (e.g. HP-12C Platinum, 35s, Prime).
- **FR-STK-5 (S):** Stack objects may be any engine value: number, complex, unit quantity,
  matrix/vector, string, symbolic expression, or program.

### 6.3 Expression evaluation
- **FR-EXP-1 (M):** Parse and evaluate algebraic expressions with operator precedence,
  functions, and grouping.
- **FR-EXP-2 (M):** Named variables and assignment; a session variable scope.
- **FR-EXP-3 (M):** User-defined functions.
- **FR-EXP-4 (S):** Expression library — save, name, and recall reusable expressions.
- **FR-EXP-5 (M):** History stack of prior entries/results, recallable and editable.

### 6.4 Symbolic math / CAS
- **FR-CAS-1 (M):** Symbolic differentiation.
- **FR-CAS-2 (M):** Symbolic & numeric integration.
- **FR-CAS-3 (M):** Simplification, expansion, factoring, substitution.
- **FR-CAS-4 (M):** Symbolic equation solving (single equations and systems).
- **FR-CAS-5 (C):** Advanced/Mathematica-grade CAS via the optional heavy tier (Pyodide+SymPy).
- **FR-CAS-6 (S):** All symbolic results renderable as KaTeX.

### 6.5 Units & dimensional analysis
- **FR-UNIT-1 (M):** Parse and compute unit quantities, e.g. `5 cm + 2 inches` → auto-convert.
- **FR-UNIT-2 (M):** Reject dimensionally incompatible operations with a clear error.
- **FR-UNIT-3 (S):** Unit conversion command and a units catalog (SI, imperial, common derived).
- **FR-UNIT-4 (C):** User-defined units.

### 6.6 Matrices & linear algebra
- **FR-MAT-1 (M):** Matrix/vector entry, display, and element editing.
- **FR-MAT-2 (M):** Core ops: add/mul/transpose, determinant, inverse, solve `Ax=b`.
- **FR-MAT-3 (S):** Decompositions: eigenvalues/vectors, SVD, QR, LU, Cholesky (ml-matrix).
- **FR-MAT-4 (S):** Complex-valued matrices (HP-15C parity).

### 6.7 Equation solving & numerics
- **FR-SOLVE-1 (M):** Numerical root finder (HP `SOLVE`): solve `f(x)=0` for a chosen variable.
- **FR-SOLVE-2 (M):** Numerical definite integration (HP `∫f(x)`).
- **FR-SOLVE-3 (S):** Multiple-equation / system solver where the model supports it.

### 6.8 Financial math
- **FR-FIN-1 (M):** Time Value of Money — `n, i, PV, PMT, FV` with begin/end modes
  (HP-12C parity; see [`hp/functions/HP-12C.md`](../hp/functions/HP-12C.md)).
- **FR-FIN-2 (M):** Cash-flow analysis — NPV, IRR over uneven cash flows (CFo/CFj/Nj).
- **FR-FIN-3 (S):** Bond price & yield.
- **FR-FIN-4 (S):** Black-Scholes option pricing.
- **FR-FIN-5 (S):** Amortization, depreciation, interest conversions, calendar/date math.
- **FR-FIN-6 (M):** All finance computed at currency precision (decimal.js), not float.

### 6.9 Statistics & probability
- **FR-STAT-1 (M):** Descriptive statistics — accumulate data (`Σ+`), mean, std dev, sums.
- **FR-STAT-2 (S):** Linear regression and curve fits (HP-42S/48 CFIT parity).
- **FR-STAT-3 (S):** Probability distributions — pdf/cdf/quantile for common distributions
  (coverage to be confirmed against the chosen library).
- **FR-STAT-4 (C):** Combinatorics — permutations, combinations, factorial (also in core).

### 6.10 Programmability
- **FR-PRG-1 (S):** Record, store, edit, and run keystroke/RPL user programs.
- **FR-PRG-2 (S):** Program control — labels, GTO, conditional tests, flags, loops (DSE/ISG),
  subroutines (per each programmable model's function set).
- **FR-PRG-3 (S):** Programs execute in a sandboxed interpreter (Web Worker, step/time limits;
  never `eval` user input) — see [`architecture.md` §4.11](architecture.md).
- **FR-PRG-4 (C):** HP-48/50g-style directories/variables for organizing programs and data.

### 6.11 Plotting & graphing
- **FR-PLOT-1 (S):** 2D function plotting from an entered/solved expression.
- **FR-PLOT-2 (C):** 3D surface plots.
- **FR-PLOT-3 (S):** Statistical charts (scatter, regression overlay, histograms).
- **FR-PLOT-4 (C):** Parametric/polar plots.

### 6.12 Interchange & rendering
- **FR-IO-1 (M):** Render results and expressions as KaTeX (textbook-quality math).
- **FR-IO-2 (M):** Copy/paste expressions in multiple formats (plain text, LaTeX; import where
  feasible).
- **FR-IO-3 (S):** Export an expression/result as KaTeX/LaTeX.
- **FR-IO-4 (C):** Mathematica-compatible expression interchange (best-effort).

### 6.13 State & persistence
- **FR-STATE-1 (M):** Persist session state locally (stack, memory/registers, variables,
  history, active model, modes) across reloads.
- **FR-STATE-2 (M):** Retain compatible state when switching models (stack, memory) per
  the product intent (see the [README](../README.md)).
- **FR-STATE-3 (S):** Save/load named workspaces; store user programs and the expression library.
- **FR-STATE-4 (C):** Export/import a workspace file for backup/sharing.

---

## 7. Functional requirements — models, UI & modes

### 7.1 Model emulation
- **FR-MODEL-1 (M):** Render each in-scope model's keyboard faithfully — key placement, labels,
  prefix (shift) keys, and **colors** per [`hp/layouts/`](../hp/layouts/) — as modern
  (non-skeuomorphic) web design.
- **FR-MODEL-2 (M):** Each key + prefix dispatches to the correct engine function via
  [`hp/mapping/mapping.json`](../hp/mapping/mapping.json).
- **FR-MODEL-3 (M):** A model exposes only its own functions; unavailable engine features are
  hidden for that faceplate.
- **FR-MODEL-4 (M):** Switch models at runtime; state is retained where compatible.
- **FR-MODEL-5 (S):** Model-appropriate display (LED/LCD/dot-matrix styling; annunciators such
  as `f`/`g`, DEG/RAD, BEG/END).

### 7.2 Native mode
- **FR-NATIVE-1 (M):** A keyboard-first mode with no virtual keypad — type algebraic (or RPN)
  expressions directly.
- **FR-NATIVE-2 (M):** Exposes the full engine (all functions, units, CAS, matrices, finance).
- **FR-NATIVE-3 (S):** A minimal on-screen key set for RPN stack manipulation.
- **FR-NATIVE-4 (M):** History stack, variables, and expression library available.

### 7.3 Display & interaction
- **FR-UI-1 (M):** Large calculator display showing history, the RPN stack, and KaTeX-rendered
  math — beyond a single-line traditional display.
- **FR-UI-2 (M):** Physical-keyboard input maps to keys/entry in every mode.
- **FR-UI-3 (M):** Responsive layouts optimized for mobile, tablet, and desktop.
- **FR-UI-4 (S):** Notebook / block-evaluation editor for multi-step work (native mode).
- **FR-UI-5 (S):** Adhere to the app's HP-calculator design system / theme tokens (defined in `globals.css` `@theme`).
- **FR-UI-6 (C):** Light/dark themes.

---

## 8. Non-functional requirements

- **NFR-1 Deployment (M):** Static client-side build deployable to GitHub Pages / Vercel; no
  required backend.
- **NFR-2 Offline (S):** Core calculator works offline after first load (PWA/service worker
  candidate).
- **NFR-3 Bundle size (M):** Small initial bundle; heavy deps (Plotly, Pyodide, CAS libs)
  code-split and lazy-loaded on first use (see architecture §5).
- **NFR-4 Performance (M):** Keystroke/eval latency imperceptible for standard operations;
  heavy CAS/plot operations may show explicit loading states.
- **NFR-5 Precision correctness (M):** Financial and high-precision results correct to the
  configured precision; covered by a numerical test suite (incl. HP reference examples).
- **NFR-6 Browsers (M):** Current Chrome, Firefox, Safari, Edge (desktop + mobile).
- **NFR-7 Accessibility (S):** Keyboard navigable; ARIA on controls; sufficient contrast;
  respects reduced-motion.
- **NFR-8 Maintainability (M):** Engine is pure TypeScript, framework-agnostic, unit-tested;
  swappable CAS providers behind a stable interface (`CasProvider`).
- **NFR-9 Security (M):** User programs never executed via `eval`; run in a sandboxed
  interpreter/Web Worker with resource limits.
- **NFR-10 Privacy (M):** All computation and state are local; no telemetry of user data by
  default.

---

## 9. Technical architecture (summary)

Full detail and rationale in [`architecture.md`](architecture.md) (approved). Summary:

- **Pure TypeScript engine, client-side**, statically deployable, no backend.
- **Core (eager):** math.js (number tower, parser, units, matrices, complex) + decimal.js
  (currency) + KaTeX + simple-statistics.
- **Light CAS (lazy):** Nerdamer (`nerdamer-prime`) / Algebrite behind a `CasProvider` seam.
- **Heavy CAS (lazy, optional):** Pyodide + SymPy/mpmath for Mathematica-grade features.
- **Plotting (lazy):** function-plot (2D) + Plotly.js (3D/statistical).
- **Model-adapter layer** drives keystroke dispatch and per-model exposure from the
  [`hp/`](../hp/) data assets.
- UI: Next.js (client components), shadcn/ui on Base UI (`@base-ui/react`), Tailwind v4 (HP-calculator design tokens), TypeScript.

## 10. Data assets

The [`hp/`](../hp/) reference is a first-class product input, not just documentation:
- [`hp/layouts/`](../hp/layouts/) — per-model keyboards (positions, legends, shift colors) →
  drives faceplate rendering.
- [`hp/functions/`](../hp/functions/) — per-model function catalogs → drives per-model feature
  exposure.
- [`hp/mapping/mapping.json`](../hp/mapping/mapping.json) — unified key+prefix→function map →
  drives keystroke dispatch (regenerable via `hp/mapping/build_mapping.py`).
- [`hp/manuals/`](../hp/manuals/) — source manuals for behavior verification/reference.

---

## 11. Success metrics

- **SM-1 Fidelity:** each shipped faceplate matches its `hp/layouts` reference (keys, colors,
  prefixes) — reviewed against the manual.
- **SM-2 Correctness:** engine passes a test suite of HP reference examples (TVM, stats, RPN
  stack behavior, unit conversions) to configured precision.
- **SM-3 Performance:** initial bundle under target budget (set in NFR-3 spike); standard ops
  feel instant.
- **SM-4 Breadth:** all **M** functional requirements implemented and demonstrable in native
  mode + at least the Voyager faceplates.

## 12. Release plan

Aligned to [`architecture.md` §7](architecture.md); each milestone is independently shippable.

| Milestone | Delivers | Key FRs |
|---|---|---|
| **M1 — Engine core + algebraic** | Pure-TS engine, number tower, algebraic eval, history, variables | FR-NUM-1/2/6/7, FR-EXP-*, FR-STATE-1 |
| **M2 — RPN/RPL + first faceplate** | Stack machine (both modes), model adapter, HP-12C & HP-15C faceplates, native mode | FR-STK-*, FR-MODEL-*, FR-NATIVE-*, FR-UI-1/2/3 |
| **M3 — Precision, units, matrices** | decimal.js finance base, units, matrices + decompositions | FR-NUM-3/4, FR-UNIT-*, FR-MAT-* |
| **M4 — Light CAS** | Symbolic diff/integrate/factor/solve, equation solver, KaTeX symbolic output | FR-CAS-1..4/6, FR-SOLVE-*, FR-IO-1/3 |
| **M5 — Finance & stats parity** | TVM/NPV/IRR/bond/Black-Scholes, stats/regression/distributions | FR-FIN-*, FR-STAT-* |
| **M6 — Plotting & programmability** | 2D/3D/stat plots, sandboxed program interpreter, notebook editor | FR-PLOT-*, FR-PRG-*, FR-UI-4 |
| **M7 — Heavy CAS (optional)** | Lazy Pyodide+SymPy advanced-CAS tier | FR-CAS-5, FR-IO-4 |
| **Ongoing** | Additional faceplates (41, 42S, 48G, others), persistence polish, PWA/offline | FR-MODEL-*, FR-STATE-3/4, NFR-2 |

## 13. Out of scope (this release)

- Bit-exact ROM/firmware emulation (NG2).
- Accounts, cloud sync, collaboration, server-side persistence (NG1).
- Native mobile apps (web/PWA only).
- Full Mathematica language compatibility beyond best-effort interchange.

## 14. Open questions & risks

Carried from [`architecture.md` §8](architecture.md):
1. math.js unified-core vs best-of-breed composition — bundle/capability tradeoff (spike).
2. Real CAS quality gap: Nerdamer/Algebrite vs SymPy — threshold to justify lazy Pyodide.
3. RPL program sandboxing design needs validation.
4. Measured Pyodide/Plotly cold-start & bundle budgets in a Next.js static export.
5. Statistics library distribution coverage must be confirmed before committing (FR-STAT-3).
6. Extent of copy/paste *import* interoperability across formats (FR-IO-2/4) to be scoped.
7. Depth of RPL feature parity per graphing model (which 48/49/50g commands are in scope).

## 15. Glossary

- **RPN** — Reverse Polish (postfix) entry; operands precede operators on a stack.
- **RPL** — the object-stack language of the HP-28/48/49/50g (dynamic stack, programmable).
- **CAS** — Computer Algebra System (symbolic math).
- **TVM** — Time Value of Money (`n, i, PV, PMT, FV`).
- **LAST X** — HP register holding the pre-operation X value.
- **Faceplate** — an emulated model's on-screen keyboard/display.
- **Native mode** — keyboard-first mode exposing the full engine with no virtual keypad.

---

*Derived from the product intent in [`README.md`](../README.md), the approved [`architecture.md`](architecture.md),
and the [`hp/`](../hp/) reference. Priorities are MoSCoW; requirement IDs are stable for
tracking through implementation.*
