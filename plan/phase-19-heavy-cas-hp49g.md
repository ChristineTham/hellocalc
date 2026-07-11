# Phase 19 — Heavy CAS (Pyodide+SymPy) — HP-49G

**Delivers:** HP-49G · heavy CAS tier (lazy Pyodide + SymPy/mpmath) behind CasProvider · **Era:** 1999 · **Builds on:** Phase 18 (48G RPL/apps) (+ Phase 14 CasProvider seam)

## Goal
Complete the **HP-49G**, the first HP with a **built-in symbolic CAS** — and the model that
justifies hellocalc's **heavy CAS tier**. This phase adds a **third `CasProvider`
implementation** backed by **lazy-loaded Pyodide + SymPy/mpmath** (architecture §4.3, §4.12)
for exact/rational arithmetic and robust symbolic integrate / factor / solve / limits /
series — capabilities beyond the Phase-14 light tier (Nerdamer/Algebrite) — all wired into the
live HP-49G faceplate. It is gated behind an explicit **"advanced CAS"** affordance, the WASM
is cached, and nothing lands in the initial bundle. The 49G also introduces the **flash-ROM**
application model.

## Models wired live
- **HP-49G** (1999) — 131×64 LCD; dual **algebraic + RPN** entry; built-in CAS with Exact/Approx
  and Real/Complex flags; command catalog (CAT) and EquationWriter. The faceplate is **already
  playable** (green/red shifts, 10-row CAS board); this phase completes its function coverage
  per `hp/functions/HP-49G.md` (fidelity reference: `hp/layouts/HP-49G.md`; shares the 48G/50g
  RPL core — the genuinely new families are CAS, number theory, modular, calculus,
  ODE/transforms, and expanded linear algebra).

## Engine capabilities added
- **Heavy `CasProvider` (Pyodide+SymPy):** `diff`, `integrate`, `factor`, `simplify`, `solve`,
  plus `limit`, `series`, `toLatex` — implementing the same interface Phase 14 defined, so
  call sites are unchanged. Dispatch escalates from light → heavy only when invoked.
- **Exact / rational arithmetic mode:** `XQ`/`XNUM` (exact↔approx), `→Q`, rational results via
  SymPy `Rational`/`nsimplify`; honours the 49G Exact/Approx CAS flag.
- **49G CAS command surface** mapped onto the provider: algebra (`FACTOR`/`EXPAND`/`SIMPLIFY`/
  `PARTFRAC`/`SUBST`/`TEXPAND`), calculus (`DERVX`/`INTVX`/`RISCH`/`lim`/`SERIES`/`TAYLR`),
  solve (`SOLVE`/`SOLVEVX`/`ZEROS`/`ISOL`), number theory (`GCD`/`LCM`/`ISPRIME?`/`NEXTPRIME`/
  `FACTORS`/`EULER`), differential equations (`DESOLVE`/`LDEC`/`LAP`/`ILAP`).
- **Mathematica-style interchange (best-effort):** import/export symbolic expressions to/from
  a SymPy-mediated form (`sympify`/`srepr`), feeding FR-IO-4.
- **Flash-ROM app model:** an upgradeable application namespace over the Phase-17 port model.

## PRD requirements covered
- **FR-CAS-5** — advanced / Mathematica-grade CAS via the optional heavy tier (Pyodide+SymPy).
- **FR-IO-4** — Mathematica-compatible expression interchange (best-effort, SymPy-mediated).
- **NFR-3** — heavy dep code-split and lazy-loaded on first use; not in the initial bundle.
- Reinforces FR-CAS-1..4 (deeper integrate/factor/solve than Phase 14), FR-NUM-5
  (exact integers / rationals), FR-STK-4 (dual algebraic/RPN entry), NFR-4 (explicit loading
  state for the WASM tier).

## Key tasks
- **Engine:** `src/lib/engine/cas/pyodide-provider.ts` implementing `CasProvider` via a
  dynamically-imported Pyodide worker; a small Python bridge that loads SymPy/mpmath, runs a
  requested op, and returns a serializable result + LaTeX. All I/O JSON-serializable so it
  runs off the main thread. Keep the engine core free of any eager Pyodide reference.
- **Model adapter / data:** consume `hp/mapping/mapping.json` for the 49G keyboard (CAT, EQW,
  SYMB, dual-entry); route the new CAS/number-theory/calculus tokens to the heavy provider,
  falling back to the light tier where sufficient. Expose `hp/functions/HP-49G.md`.
- **Wiring / UI:** an explicit **"advanced CAS"** gate that triggers the Pyodide load with a
  visible loading state; cache the WASM across sessions. (The 49G faceplate — green/red shifts,
  cursor-diamond cluster, bottom-right ENTER — is already live.)
- **Tests:** provider unit tests with **Pyodide mocked** (deterministic, no network per §6);
  one opt-in integration test behind a flag; e2e for the advanced-CAS gate + loading state.

## New dependencies
- **pyodide** + **sympy** / **mpmath** (multi-MB WASM) — lazy `import()`, cached, gated behind
  the advanced-CAS affordance (architecture §4.12, §5; **NFR-3**). Never eager; unit tests mock
  it so the suite stays offline and deterministic.

## Tests & acceptance (DoD)
- Engine unit tests (Pyodide mocked) incl. concrete HP reference examples:
  - `'∫(1/(X^2-1),X)' INTVX` → `(1/2)·LN((X-1)/(X+1))` (a case the light tier handles poorly).
  - `120 FACTORS` → `{2 3 3 1 5 1}` (2³·3·5); `'X^4-1' FACTOR` → `(X-1)(X+1)(X²+1)`;
    `1/3 + 1/6 XQ` → `1/2` (exact).
- E2e on the live faceplate: invoke an advanced integral → advanced-CAS gate shows a loading
  state, then the KaTeX-rendered symbolic result appears; verify the WASM is fetched only once
  (cached).
- **No HP-49G key remains inert** — every function in `hp/functions/HP-49G.md` resolves to an
  engine command.
- `pnpm lint`/`test`/`build`/`test:e2e` green; **Pyodide confirmed absent from the initial
  bundle**; the existing UI suites (geometry, promotion, typing) stay green.

## Delivery notes (as shipped)
- **Heavy tier** (cas/pyodide-provider.ts): Pyodide + SymPy behind the SAME
  CasProvider seam, extended (HeavyCasProvider) with limit/series/partfrac/
  texpand/desolve/laplace/ilaplace. Dynamic-imported; the WASM + sympy
  wheel stream from the jsdelivr CDN pinned to the installed package's own
  version export — first use needs NETWORK and shows the explicit loading
  line; the browser caches afterwards; nothing enters the initial bundle.
  Once loaded, calls are synchronous (runPython), so the engine stays sync.
- The gate lives in the React seam: HEAVY_FNS (lim/SERIES/PARTFRAC/TEXPAND/
  RISCH/DESOLVE/LAP/ILAP) trigger the load; engine-side those ops report
  "Advanced CAS (SymPy) loading — press again" until the tier registers.
  CI verifies ROUTING with a mock provider; the real-WASM integration test
  is opt-in (PYODIDE_IT=1) per the plan's no-network-in-tests rule.
- Light tier suffices for (and serves) DERVX/INTVX/SIMPLIFY/SOLVEVX/ZEROS/
  FACTOR/EXPAND; SUBST is textual substitution + simplify; XQ/XNUM map to
  →Q/→NUM. LDEC points at DESOLVE.
- **ARITH is pure TS** (numtheory.ts): Euclid GCD/LCM, deterministic
  Miller–Rabin (< 3.3e24), NEXTPRIME, trial-division FACTORS and EULER with
  an HONEST bound (beyond it: "Factor exceeds the trial bound").
- 49G keys: F1–F6 dispatch the labelled soft row; APPS/TOOL→menu index,
  FILES→MEMORY, SYMB/CALC/ALG/ARITH/S.SLV/NUM.SLV/EXP&LN/FINANCE/MATRICES/
  BASE/CHARS open rosters; EQW→algebraic entry, MTRW seeds a matrix; ANS
  re-pushes the last committed result; COPY/CUT/PASTE edit the command
  line; TABLE tabulates EQ over the window; 2D/3D toggles the plot type;
  Y=/WIN open the plot rosters; ∞ types.
- Mathematica-style interchange (FR-IO-4) remains sympy-mediated via
  sympify at the provider boundary — no separate exporter shipped
  (documented). The flash-ROM app model stays deferred with LIBRARY.
- HP-49G coverage oracle: GREEN — no key remains inert (18 models live).

## Notes / risks
- Pyodide cold-start is multi-MB and seconds-long (open question §8.4) — always behind an
  explicit gate with a loading state (NFR-4); never auto-triggered by ordinary keystrokes.
- The 49G manual PDF has no OCR layer; CAS command names in `hp/functions/HP-49G.md` were
  cross-checked against the 50g — treat that file as the authority, don't invent tokens.
- Keep the `CasProvider` seam strict (architecture §8 maintenance risk): the heavy tier must be
  swappable/removable without touching the light tier or call sites.
- Run SymPy in a Web Worker (never `eval` of user Python); enforce time limits to bound
  runaway symbolic computations (NFR-9 spirit, extended to the CAS tier).
