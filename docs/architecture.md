# Hellocalc — Calculator Engine Architecture

Research-backed architecture for the shared calculator engine described in the project
[`README.md`](../README.md). Combines a fact-checked deep-research pass (5 search angles →
23 sources → 21 adversarially-verified claims) with engineering judgment. Every
recommendation is tagged:

- **[verified]** — supported by a 3-0 verified research finding (source cited).
- **[judgment]** — an engineering recommendation this research did not independently
  verify; the research explicitly left math.js internals, the KaTeX pipeline, statistics
  libraries, numerical SOLVE, and RPL sandboxing as open questions.

Cross-references the calculator reference we built under [`../hp/`](../hp/) — the
RPN/RPL stack semantics ([`hp/README.md`](../hp/README.md)), the per-model function sets
([`hp/functions/`](../hp/functions/)), and the key→function mapping
([`hp/mapping/`](../hp/mapping/)).

---

## 1. Recommendation (TL;DR)

**Build the engine in pure TypeScript, running client-side, statically deployable to
GitHub Pages / Vercel with no backend.** Every capability hellocalc needs — *except*
Mathematica-grade symbolic CAS — has a mature pure-JS library. For heavy CAS, **lazy-load
Pyodide + SymPy on demand** (an optional WASM tier) rather than paying its multi-MB cost
upfront or standing up a Python server. **[verified]**

- **Default (always loaded):** a TypeScript engine built on **math.js** as the unified
  core (arithmetic tower, expression parser, units, matrices, complex), with
  **decimal.js** directly for fixed-point currency in the finance module.
- **Light CAS tier (lazy):** **Nerdamer** (via the maintained `nerdamer-prime` fork) or
  **Algebrite** for differentiation, integration, factoring, simplification, symbolic
  solve.
- **Heavy CAS tier (lazy, optional):** **Pyodide + SymPy/mpmath** for the
  "potentially Mathematica-compatible" goal, loaded only when the user invokes an
  advanced-CAS feature.
- **No Python backend.** It would break static deployment, add latency/ops/cost, and buy
  nothing that Pyodide can't do client-side. **[judgment]**

---

## 2. The core decision: JS/TS vs Python vs hybrid

| Option | Static deploy? | Backend ops | Heavy-CAS ceiling | Verdict |
|---|---|---|---|---|
| **Pure TS, client-side** | ✅ yes | none | pure-JS CAS (good, not SymPy-grade) | **Default** |
| **TS + lazy Pyodide/SymPy (WASM)** | ✅ yes (static WASM assets) | none | **SymPy-grade**, client-side | **Recommended for advanced tier** |
| Hybrid: Next.js + Python (SymPy/mpmath) backend | ❌ needs a server | server, API, latency, cost | SymPy-grade | Avoid unless a hard requirement appears |

**Why client-side wins here.** Pyodide is a port of CPython to WebAssembly/Emscripten that
runs in the browser with no backend, is self-hostable as static files, and can load
SymPy/mpmath (both pure Python) plus NumPy/SciPy — so a full CAS is achievable *without a
server*, at a large download/WASM cost best deferred via lazy-loading. **[verified]**
That collapses the usual reason to add a Python backend. The product intent also
calls for offline-capable, static-deployable behavior consistent with the current
GitHub-Pages export in [`../README.md`](../README.md).

**When a backend *would* be justified** (revisit only if these arise): server-side
persistence/accounts, shared/collaborative notebooks, or CAS workloads too heavy for a
browser tab. None are in scope today.

---

## 3. Engine architecture (layers)

```
┌─────────────────────────────────────────────────────────────┐
│  UI (Next.js · shadcn/Base UI · Tailwind · client components)│
│  · Model faceplates (per-HP-model keypads)  · Native mode    │
│  · RPN stack view · History · KaTeX display · Plot panels    │
└───────────────┬─────────────────────────────────────────────┘
                │  dispatches keystrokes / expressions
┌───────────────▼─────────────────────────────────────────────┐
│  MODEL ADAPTER LAYER                                         │
│  · maps physical key + prefix → engine op (hp/mapping)      │
│  · exposes only each model's function subset (hp/functions) │
│  · picks stack semantics: 4-level RPN vs RPL dynamic        │
└───────────────┬─────────────────────────────────────────────┘
┌───────────────▼─────────────────────────────────────────────┐
│  SHARED ENGINE (pure TS, framework-agnostic, no React)      │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐ │
│  │ Value tower │ │ Parser/eval  │ │ Stack machine         │ │
│  │ Big/Complex │ │ (algebraic + │ │ (RPN 4-level | RPL)   │ │
│  │ Unit/Matrix │ │  RPN input)  │ │ + LAST X / registers  │ │
│  └─────────────┘ └──────────────┘ └───────────────────────┘ │
│  Feature modules: units · matrices/linalg · numerics(SOLVE, │
│  ∫) · finance(TVM/bond/BS) · stats/prob · CAS bridge         │
└───────────────┬───────────────────────┬─────────────────────┘
                │ lazy import()          │ lazy import()
      ┌─────────▼─────────┐    ┌─────────▼──────────────┐
      │ Light CAS (JS)    │    │ Heavy CAS (WASM)       │
      │ Nerdamer/Algebrite│    │ Pyodide + SymPy/mpmath │
      └───────────────────┘    └────────────────────────┘
```

**Design principles**

- **Engine is pure TypeScript, no React** — testable in isolation, reusable in a Web
  Worker, and the single source of truth the product intent calls for ("unified calculator
  engine shared across all models"). UI holds only view state. **[judgment]**
- **One value tower.** math.js already unifies `BigNumber` (backed by decimal.js),
  `Complex`, `Unit`, `Matrix`, and `Fraction` under one parser and one `evaluate()` scope
  — which is exactly the "unified engine" the intent wants, rather than gluing five
  independent libraries together. **[judgment]**
- **Tiered CAS behind a stable interface.** A `CasProvider` interface (`diff`,
  `integrate`, `factor`, `simplify`, `solve`, `toLatex`) with three implementations
  (Nerdamer, Algebrite, Pyodide/SymPy) lets us start light and escalate without touching
  call sites. **[judgment]**
- **Everything heavy is `import()`-split**: CAS libs, Pyodide, and Plotly load on first
  use, keeping the initial bundle small.

---

## 4. Library selection per capability

Recommendation → alternatives → rationale. Confidence tag per row.

### 4.1 Arbitrary-precision core — **math.js `BigNumber` (decimal.js under the hood)**, plus **decimal.js** directly for currency
- **Alternatives:** big.js, bignumber.js, native `BigInt`.
- **Rationale:** math.js `BigNumber` *is* decimal.js internally, so "math.js vs decimal.js"
  is not either/or — using math.js gives arbitrary-precision decimals **and** the parser,
  units, and matrices in one coherent scope. Use decimal.js **directly** inside the finance
  module where you want tight control over rounding modes and fixed-point currency.
  `BigInt` is integer-only (no fractional precision) so it's unsuitable as the number
  tower. **[judgment]** — the research did not benchmark big.js vs decimal.js vs BigInt;
  treat exact precision/perf numbers as unverified (see Open Questions).

### 4.2 Expression parsing & evaluation — **math.js parser as the spine + a thin RPN input layer**
- **Alternatives:** hand-written Pratt/shunting-yard parser.
- **Rationale:** math.js ships a full expression parser with a customizable scope,
  user-defined functions/variables, and an AST you can walk. Algebraic/"native" mode maps
  straight onto `math.evaluate(expr, scope)`. RPN entry is a separate front-end that pushes
  operands and applies operators to the **stack machine** (§5); both converge on the same
  engine value types. **[judgment]**

### 4.3 Symbolic CAS — **tiered: Nerdamer/Algebrite (light) → Pyodide+SymPy (heavy)**
- **Light, pure-JS:**
  - **Nerdamer** — "small and light-weight symbolic math expression evaluator … parsing is
    done purely in javascript and uses no server-side program"; modular (core +
    Algebra/Calculus/Solve/Special add-ons), can export to a pure JS function, does
    symbolic `diff`/`integrate`. Use the maintained **`nerdamer-prime`** fork (original is
    stagnant). **[verified]**
  - **Algebrite** — "Computer Algebra System in Javascript (Typescript)", EigenMath port,
    covers arbitrary-precision arithmetic, simplify/expand/substitute, derivatives,
    integrals, symbolic & numeric roots, **factoring**, matrices, tensors, units; pure
    npm import, no WASM. Caveat: last published ~5 years ago; breadth ≠ SymPy-depth.
    **[verified]**
- **Heavy, WASM:** **Pyodide + SymPy/mpmath** for robust integration/factoring/solving and
  the "potentially Mathematica compatible" goal — lazy-loaded only when invoked.
  **[verified]**
- **Rendering:** both light libs emit expressions convertible to LaTeX for KaTeX (§4.9).
- **Refuted myth:** the claim that Nerdamer's solver is limited to ≤3rd-order polynomials
  / linear systems was **refuted 0-3** — its solve capability is broader than that.
  **[verified]**

### 4.4 Units & dimensional analysis — **math.js units** (default), **js-quantities** (fallback)
- **Rationale:** `5 cm + 2 inches` is native to math.js units, integrated with the same
  number tower and parser — preferable for a unified engine. **js-quantities** is a proven
  standalone: auto-converts compatible units on add/subtract, throws `Qty.Error` on
  incompatible ones, and does explicit dimensional analysis (`isCompatible()`, `kind()`,
  compound units). Keep it as a reference/fallback if math.js unit coverage falls short.
  math.js-native is **[judgment]**; js-quantities capability is **[verified]**.

### 4.5 Matrices & linear algebra — **math.js** for core ops, **ml-matrix** for decompositions
- **Rationale:** math.js covers determinant/inverse/multiply/solve within the unified
  scope. For serious linear algebra add **ml-matrix** (pure JS/TS, no WASM): QR, LU,
  Cholesky, **Eigenvalue** and **SVD** decompositions; SVD-based inverse/solve for singular
  matrices (pseudoinverse); `EigenvalueDecomposition` exposes real/imaginary eigenvalues,
  diagonal matrix, and eigenvector matrix. Actively maintained. **[verified]** for
  ml-matrix; math.js-core is **[judgment]**.

### 4.6 Numerical methods — SOLVE (root finding) & integration — **custom, on math.js**
- **Rationale:** HP-style `SOLVE` and `∫f(x)` are numerical. Implement a small numerics
  module (Newton/secant/Brent for roots; adaptive Simpson/Romberg for integrals) over
  compiled math.js expressions (`math.compile(expr).evaluate(scope)` is fast for repeated
  evaluation). Escalate to SymPy (symbolic) only for exact results. **[judgment]** — the
  research surfaced no verified JS numerical-methods library, so treat this as
  build-it-yourself with well-known algorithms.

### 4.7 Financial math — **custom decimal.js implementation** (TVM, NPV, IRR, bond, Black-Scholes)
- **Alternatives:** finance.js, formulajs, tvm-financejs, accurate-financejs.
- **Rationale:** correctness at currency precision matters more than reusing an immature
  package. **accurate-financejs** demonstrates the right approach — it is "a fork of
  finance.js with every function rewritten to use Decimal.js" — but is abandoned at v0.0.1
  with a broken XIRR, so use it as a **reference, not a dependency**. Implement TVM
  (`n, i, PV, PMT, FV` — see [`hp/functions/HP-12C.md`](../hp/functions/HP-12C.md)),
  NPV/IRR cash flows, bond price/yield, and Black-Scholes directly on decimal.js. **[verified]**
  (that decimal.js is the right precision foundation; the custom-impl recommendation is
  **[judgment]**).

### 4.8 Statistics & probability — **math.js + simple-statistics**, **jStat** for distributions (verify coverage)
- **Rationale:** math.js and simple-statistics cover descriptive stats and regression
  (HP-42S/15C/48 STAT parity — see [`hp/functions/`](../hp/functions/)). For probability
  **distributions** (pdf/cdf/quantile), **jStat** is the usual choice — **but two research
  claims about jStat's exact distribution list and per-distribution method set were
  refuted**, so **confirm the specific distributions/methods you need against jStat's
  current source before committing**, and be ready to implement missing quantiles directly.
  **[judgment]**, with a **[verified]** caution that jStat's advertised coverage was not
  confirmed.

### 4.9 LaTeX rendering — **KaTeX via `react-katex`**, fed by math.js/Nerdamer `toTex`
- **Rationale:** matches the product intent (KaTeX display) and the current README stack. math.js
  nodes have `.toTex()`; Nerdamer emits LaTeX; SymPy has `latex()`. Pipe whichever CAS tier
  produced the result into KaTeX. **[judgment]** — the research did not verify the
  rendering pipeline, but KaTeX/react-katex are the established, low-risk choice.

### 4.10 Plotting — **function-plot (2D, light) + lazy Plotly.js (3D/statistical)**
- **Rationale:** **Plotly.js** is one standalone library covering "statistical charts, 3D
  graphs, scientific charts … financial charts" — i.e., hellocalc's 2D/3D/statistical
  needs — but it's large (~3 MB+), so **lazy-load** it for 3D/stat panels.
  **function-plot** (built on D3, minimal config) is the lightweight everyday-2D grapher.
  **[verified]** (a claim that function-plot only does line/scatter was **refuted** — it
  does more). Alternatives noted but not needed: mafs, observable-plot, raw D3.

### 4.11 Programmability (HP-48/RPL user programs) — **custom interpreter in a Web Worker**
- **Rationale:** HP programs are keystroke/RPL sequences, **not** JavaScript — implement a
  small bytecode/AST interpreter over the same engine ops, so you **never `eval()` user
  input**. Run it in a **Web Worker** for isolation, with **step/time limits** to stop
  runaway loops (`GTO`, `DSE`/`ISG`). This sidesteps JS-sandbox-escape risk entirely.
  **[judgment]** — the research found **no verified guidance** on RPL sandboxing; this is a
  design proposal (see Open Questions), informed by general JS-sandboxing research.

### 4.12 Mathematica-compatibility / Pyodide tier — **worth it, but lazy**
- **Rationale:** Pyodide+SymPy delivers the closest thing to Mathematica-grade CAS fully
  client-side, but at multi-MB cost. Gate it behind an explicit "advanced CAS" affordance
  and `import()` it on first use; cache the WASM. Do **not** ship it in the initial bundle.
  **[verified]**.

---

## 5. Recommended dependency set

| Package | Purpose | Load | Confidence |
|---|---|---|---|
| **mathjs** | number tower, parser, units, matrices, complex, `toTex` | eager (core) | judgment |
| **decimal.js** | fixed-point currency in finance module | eager (small) | verified |
| **nerdamer-prime** | light symbolic CAS (diff/integrate/factor/solve) | lazy | verified |
| **algebrite** | alt light CAS (factoring, roots) | lazy (optional) | verified |
| **ml-matrix** | eigen/SVD/QR/LU/Cholesky decompositions | lazy | verified |
| **js-quantities** | units fallback / strict dimensional checks | optional | verified |
| **simple-statistics** | descriptive stats, regression | eager (small) | judgment |
| **jstat** | probability distributions (verify coverage first) | lazy | judgment |
| **katex** + **react-katex** | math rendering | eager | judgment |
| **function-plot** | lightweight 2D function graphs | lazy | verified |
| **plotly.js** (`plotly.js-dist-min`) | 3D + statistical charts | lazy (~3 MB) | verified |
| **pyodide** + **sympy**/**mpmath** | heavy CAS tier (Mathematica-grade) | lazy (multi-MB WASM) | verified |

Keep the eager core to math.js + decimal.js + KaTeX + simple-statistics; everything else is
code-split behind `import()`.

---

## 6. RPN/RPL stack & the model-adapter layer

The engine is **model-agnostic**; a thin adapter per HP model sits on top. This is where the
[`hp/`](../hp/) reference plugs in directly:

- **Two stack modes** (from [`hp/README.md`](../hp/README.md)):
  - **Classic/Voyager (35→16C, 42S, 35s):** fixed **4-level stack** `X/Y/Z/T` + `LAST X`,
    with the documented ENTER-lift / drop / no-lift semantics. Model this as a fixed-size
    array with the exact lift rules.
  - **RPL (28/48/49/50g):** **dynamic unlimited object stack** where ENTER pushes to level 1.
  - The adapter selects which the active model uses; state (stack, memory) is retained when
    switching models where compatible, per the product intent.
- **Keystroke → engine op** dispatch is driven by
  [`hp/mapping/mapping.json`](../hp/mapping/mapping.json): each `(physical_key, prefix)`
  resolves to a `function`; the adapter maps that function name to an engine operation.
- **Per-model function exposure:** each model shows only its own keys/functions
  ([`hp/layouts/`](../hp/layouts/), [`hp/functions/`](../hp/functions/)); "native" mode
  exposes the whole engine via the expression evaluator with a minimal RPN-stack keypad.

---

## 7. Phased implementation

Refines the phases already in [`../README.md`](../README.md), reordered around the tiered
architecture:

1. **Core engine + algebraic eval.** math.js scope, value tower, history, variables. Pure
   TS, no UI. Unit-tested.
2. **RPN/RPL stack machine + model adapter.** Implement both stack modes; wire
   `hp/mapping` dispatch; build first faceplate (HP-15C or HP-12C) + native mode.
3. **Precision, units, matrices.** decimal.js finance path; math.js units; ml-matrix
   decompositions; vector/unit/matrix entry.
4. **Light CAS tier.** `CasProvider` + Nerdamer/Algebrite (lazy); Equation Solver; KaTeX
   pretty-printing of symbolic results.
5. **Finance & statistics parity.** Custom decimal.js TVM/NPV/IRR/bond/Black-Scholes;
   stats/regression/distributions (verify jStat coverage).
6. **Plotting + programmability.** function-plot (2D) + lazy Plotly (3D/stat); Web-Worker
   RPL interpreter with step limits; notebook/block editor.
7. **Heavy CAS tier (optional).** Lazy Pyodide+SymPy behind an "advanced CAS" gate for the
   Mathematica-compatible goal.

---

## 8. Risks, caveats & open questions

**Maintenance risk (verified):** Algebrite last published ~5 years ago; original Nerdamer is
stagnant (use `nerdamer-prime`); accurate-financejs is abandoned (v0.0.1, broken XIRR — use
as reference only). Pin versions and keep the `CasProvider` seam so a library can be swapped.

**Bundle size (verified, approximate):** Plotly.js ~3 MB+; Pyodide+SymPy multi-MB. Both must
be lazy-loaded/code-split to preserve a small initial bundle — not independently benchmarked
here.

**Open questions this research did *not* settle** (carry into a spike before committing):

1. **math.js unified core vs best-of-breed composition** — measured bundle-size/capability
   tradeoff of one math.js engine vs decimal.js + Algebrite + ml-matrix + js-quantities, and
   which is better for long-term maintainability.
2. **Real quality gap** between pure-JS CAS (Nerdamer/Algebrite) and SymPy-in-Pyodide for
   *your* operations (symbolic integration, factoring, solving) — and the feature threshold
   where lazy-loading Pyodide is justified.
3. **RPL programmability sandboxing** — no verified guidance emerged; the Web-Worker +
   interpreter + step-limit design in §4.11 needs validation.
4. **Measured Pyodide+SymPy and Plotly cold-start/download** in a Next.js static export, and
   how much code-splitting trims it.

**Refuted claims (don't propagate):** Nerdamer solver limited to ≤3rd order (false);
function-plot does only line/scatter (false); two jStat distribution-coverage claims (unconfirmed).

---

## 9. Sources

Primary (project docs/repos):
- Pyodide — https://github.com/pyodide/pyodide · https://pyodide.org/
- Algebrite — https://github.com/davidedc/Algebrite · http://algebrite.org/
- Nerdamer — https://nerdamer.com/ · https://github.com/jiggzson/nerdamer
- ml-matrix — https://github.com/mljs/matrix · https://mljs.github.io/matrix/classes/EigenvalueDecomposition.html
- js-quantities — http://gentooboontoo.github.io/js-quantities/
- accurate-financejs — https://www.npmjs.com/package/accurate-financejs
- Plotly.js — https://github.com/plotly/plotly.js/ · function-plot — https://github.com/mauriciopoppe/function-plot
- jStat — https://jstat.github.io/distributions.html

Secondary / comparisons:
- npm-compare (big.js/bignumber.js/decimal.js/mathjs) — https://npm-compare.com/big.js,bignumber.js,decimal.js,mathjs
- npm-compare (jstat/mathjs/simple-statistics) — https://npm-compare.com/jstat,mathjs,simple-statistics
- tvm-financejs — https://github.com/kgkars/tvm-financejs
- KaTeX vs MathJax comparison — https://finance.biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison
- JS sandboxing research — https://github.com/simonw/research/tree/main/javascript-sandboxing-research

*Generated by the `deep-research` workflow (5 angles → 23 sources → 21 verified claims,
0 errors) plus engineering synthesis. Verified findings are tagged **[verified]**; design
recommendations are tagged **[judgment]**.*
