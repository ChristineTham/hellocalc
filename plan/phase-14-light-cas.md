# Phase 14 — Light symbolic CAS

**Delivers:** capability retrofit (HP-28C onward) · `CasProvider` seam + lazy Nerdamer/Algebrite · KaTeX rendering pipeline · **Era:** 1986–88 · **Builds on:** Phases 12 (RPL objects) & 13 (units) — retrofits the 28C algebra/calculus commands, carried forward by every later CAS model

## Goal
Give the engine its **light symbolic CAS tier** behind the stable `CasProvider` interface
(architecture §3, §4.3) and stand up the **KaTeX rendering pipeline** so results and expressions
are always typeset (never raw strings). This is a **capability retrofit, not a new model**: it
lights up the HP-28C's algebra/calculus commands (`COLCT`, `EXPAN`, `ISOL`, `QUAD`, `TAYLR`, the
`d/dx` and `∫` keys, `ROOT`, `→NUM`) delivered as faceplate keys in Phase 12, and every later CAS
model (28S, 42S output, 48/49/50g, Prime) reuses the same provider seam and renderer.

## Models delivered
- **None (retrofit).** No new faceplate. The capability activates the 28C **ALGEBRA** menu
  (`COLCT`/`EXPAN`/`ISOL`/`QUAD`/`TAYLR`/`SHOW`…) and the `d/dx` (shift-6) and `∫` (shift-5) keys
  per `hp/functions/HP-28C.md`, plus `→NUM` (shift-EVAL) and `ROOT`. Later models — HP-28S
  (Phase 15), HP-42S numeric output (Phase 16), HP-48SX/48G/49G/50g, HP Prime — inherit it.

## Engine capabilities added
Built on the Phase-12 **algebraic object** type and the math.js parser (architecture §4.2/§4.3):
- **`CasProvider` interface** (`src/lib/engine/cas/provider.ts`): `diff`, `integrate`, `factor`,
  `expand`, `simplify`, `solve`, `toLatex` — the one seam all tiers implement (NFR-8, swappable).
- **Light provider, lazy-loaded** (`src/lib/engine/cas/nerdamer-provider.ts`): **`nerdamer-prime`**
  (maintained fork) as the primary, **`algebrite`** as an alternate for factoring/roots — both
  behind dynamic `import()` so they never enter the initial bundle (architecture §4.3, NFR-3).
- **Algebraic-object evaluation:** RPL algebraic objects (`'X^2+1'`) evaluate symbolically via the
  provider or numerically via `→NUM`; results stay engine values (algebraic, real, complex, unit).
- **28C symbolic commands mapped to provider ops:** `d/dx` → `diff`, `∫` → `integrate`,
  `ISOL`/`QUAD`/`ROOT` → `solve` (isolate / quadratic-form / numeric root), `COLCT` → `simplify`,
  `EXPAN` → `expand`, `TAYLR` → Taylor series, `SHOW` → variable-reference display.
- **KaTeX rendering pipeline** (`src/lib/render/tex.ts` + a `react-katex` display component):
  math.js nodes via `.toTex()`, Nerdamer/Algebrite via their LaTeX emitters, all funnelled to one
  `toLatex(value)` → KaTeX. Both **symbolic and numeric** stack objects render typeset (FR-IO-1).
- **LaTeX export** (`FR-IO-3`): copy any expression/result out as LaTeX from the same pipeline.

## PRD requirements covered
- **FR-CAS-1 (M)** — symbolic differentiation (`d/dx`).
- **FR-CAS-2 (M)** — symbolic & numeric integration (`∫`, with `→NUM` for numeric).
- **FR-CAS-3 (M)** — simplification/expansion/factoring/substitution (`COLCT`/`EXPAN`/factor/`OBSUB`).
- **FR-CAS-4 (M)** — symbolic equation solving (`ISOL`/`QUAD`/`ROOT` single equations).
- **FR-CAS-6 (S)** — all symbolic results renderable as KaTeX.
- **FR-IO-1 (M)** — render results & expressions as KaTeX; **FR-IO-3 (S)** — export as LaTeX.
- **NFR-8 (M)** — engine stays pure TS; CAS providers swappable behind `CasProvider`.

## Key tasks
- **Engine:** `cas/provider.ts` interface; `cas/nerdamer-provider.ts` (lazy Nerdamer + optional
  Algebrite); algebraic-object symbolic/numeric eval path; `render/tex.ts` unified `toLatex`.
- **Model adapter / data:** map 28C ALGEBRA/`d/dx`/`∫`/`→NUM`/`ROOT` from `hp/functions/HP-28C.md`
  via `hp/mapping/mapping.json` to provider ops; guard so the provider `import()`s on first use.
- **Faceplate / UI:** `react-katex` display component for the stack/result rows; ALGEBRA menu wired;
  explicit loading state on first CAS invocation (NFR-4); LaTeX copy action.
- **Tests:** provider unit tests with the lazy import **mocked** (deterministic, no network);
  KaTeX-render component tests; 28C ALGEBRA/`d/dx` e2e.

## New dependencies
- **`nerdamer-prime`** — light symbolic CAS (diff/integrate/factor/solve) · **lazy** `import()`.
- **`algebrite`** — alternate light CAS (factoring/roots) · **lazy**, optional.
- **`katex`** + **`react-katex`** — math rendering · **eager** (small, core rendering path).
Per architecture §5: heavy CAS (Pyodide+SymPy) is **not** added here — it arrives in Phase 19.

## Tests & acceptance (DoD)
- Engine unit tests (provider import mocked) incl. concrete capability examples:
  - `diff('x^2', 'x')` → `2·x`; `integrate('2*x', 'x')` → `x^2` (+C convention documented).
  - `solve('x^2-4=0','x')` → `{2, -2}`; `expand('(x+1)^2')` → `x^2+2·x+1`.
  - `toLatex('x^2+1')` → `x^{2}+1` and renders in KaTeX without throwing.
- Faceplate/UI e2e on the 28C: enter `'X^2'`, press `d/dx` with `X`, verify KaTeX shows `2\,X`;
  `→NUM` on a symbolic result yields a typeset numeric value.
- `pnpm lint` / `pnpm test` / `pnpm build` (verify the lazy CAS chunk is code-split out of the
  initial bundle) / `pnpm test:e2e` green.

## Notes / risks
- Nerdamer vs Algebrite disagree on form/normalization; pick one canonical provider per op and pin
  versions (architecture §8 maintenance risk) — the `CasProvider` seam lets us swap without churn.
- The refuted "Nerdamer solve ≤3rd-order" myth (architecture §4.3) — don't cap the solver on it.
- Integration constants / branch choices differ from SymPy; keep expectations light-tier-appropriate
  and defer hard cases to the Phase-19 heavy tier rather than forcing Nerdamer.
- KaTeX cannot render every LaTeX macro a CAS emits; normalize output and test the macro subset used.
