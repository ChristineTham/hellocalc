<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hellocalc — Agent Rules

Rules for building this project. Read alongside the product and technical specs:
[`docs/prd.md`](docs/prd.md) (scope + requirement IDs), [`docs/architecture.md`](docs/architecture.md)
(approved engine architecture), and the [`hp/`](hp/) reference (per-model keyboard layouts,
function sets, and the key→function [`mapping`](hp/mapping/mapping.json)).

Hellocalc is a **client-side, statically-exported** Next.js app emulating HP calculators over
a shared TypeScript math engine. It deploys to **GitHub Pages under base path `/hellocalc`**.

---

## 1. Golden rules (non-negotiable)

1. **Fully-typed TypeScript.** No `any`, no `as` casts unless genuinely unavoidable (and then
   comment why). Prefer precise types, discriminated unions, and `unknown` + narrowing over
   casts. `strict` is on — keep it green.
2. **Vanilla Tailwind only.** This project uses Tailwind v4 (CSS-first, no `tailwind.config`).
   Use built-in utilities and the theme tokens defined in `src/app/globals.css`. **Do not**
   invent custom variants, arbitrary sizes, or bespoke spacing scales; if a token is missing,
   add it to the `@theme` in `globals.css` rather than hardcoding one-off values.
3. **shadcn with Base UI.** UI primitives come from shadcn (configured for Base UI /
   `@base-ui/react`, style `base-nova` in `components.json`). **Always add components with the
   shadcn CLI** — never hand-write or hallucinate a `components/ui/*` implementation:
   ```
   pnpm dlx shadcn@latest add <component>
   ```
   Compose and extend generated components in your own files; don't fork the generated
   primitive unless a change is truly required (and document it).
4. **Test as you build.** Maintain a real test suite and grow it with every feature:
   unit + component tests (Vitest + Testing Library) and end-to-end tests (Playwright). Add or
   update tests in the same change as the code they cover.
5. **`pnpm lint` and `pnpm build` must pass before you finish.** Also run `pnpm test`. A change
   is not done if any of these fail. Never commit red.
6. **pnpm only.** This repo uses pnpm (see `packageManager`). Don't introduce npm/yarn lockfiles.
7. **Respect the static-export + `/hellocalc` base path** in everything you build (see §5).

---

## 2. Skills — what to call, and when

Prefer the project skills in [`.agents/skills/`](.agents/skills/) and the built-in skills.
Call the relevant skill **before** writing code in its area; use `find-skills` if unsure.

| Task | Call this skill |
|---|---|
| Discovering which skill applies | `find-skills` |
| Any Next.js work (routing, config, rendering) | `next-best-practices` — and read `node_modules/next/dist/docs/` first (see top block) |
| Scaffolding the shadcn/Next.js layout & UI constraints | `shadcn-nextjs-setup` |
| Adding/using shadcn components | `shadcn` |
| Building React components | `building-components` |
| Tailwind design tokens / system | `tailwind-design-system` |
| Visual/UX decisions | `web-design-guidelines` |
| RPN LIFO stack (React state + mathjs BigNumbers) | `rpn-stack-logic` |
| Symbolic CAS → KaTeX rendering (Nerdamer → KaTeX) | `cas-latex-renderer` |
| Charts / plots (2D/3D/statistical) | `dataviz` |
| Verifying a change actually works end-to-end | `verify` |
| Driving the app in a browser to check UI | `next-browser` |
| Reviewing your diff before finishing | `code-review` |
| Writing docs / prose | `writing-guidelines` |

If a skill's guidance conflicts with these rules, these rules win — but flag the conflict.

---

## 3. Architecture rules

Follow [`docs/architecture.md`](docs/architecture.md). Key constraints:

- **The engine is pure TypeScript, framework-agnostic.** Put it under `src/lib/` (e.g.
  `src/lib/engine/`). It must not import React, Next, or any DOM/UI code — so it stays
  unit-testable and reusable in a Web Worker. UI holds only view state.
- **One value tower / one core.** Build on **math.js** (arithmetic, parser, units, matrices,
  complex) with **decimal.js** used directly only in the finance module. Don't glue in a
  second overlapping number library without cause.
- **Tiered CAS behind a `CasProvider` interface** (`diff`, `integrate`, `factor`, `simplify`,
  `solve`, `toLatex`). Light tier (Nerdamer `nerdamer-prime` / Algebrite) and heavy tier
  (Pyodide + SymPy) are **lazy-loaded** via dynamic `import()`. Never import them eagerly.
- **Lazy-load heavy deps** (Plotly.js, Pyodide, CAS libs) with `next/dynamic` or `import()` —
  they must not land in the initial bundle.
- **Model adapter layer** drives keystroke dispatch from [`hp/mapping/mapping.json`](hp/mapping/mapping.json)
  and per-model exposure from [`hp/functions/`](hp/functions/) / faceplates from
  [`hp/layouts/`](hp/layouts/). Don't hardcode key maps that duplicate this data — consume the
  data assets (import the JSON at build time; regenerate via `hp/mapping/build_mapping.py`).
- **Stack semantics:** implement both the fixed 4-level RPN stack (`X/Y/Z/T` + `LAST X`, exact
  lift/drop/no-lift rules) and the RPL dynamic stack, per [`hp/README.md`](hp/README.md).
- **Add dependencies deliberately** — prefer the libraries chosen in the architecture doc
  (already installed: `mathjs`, `decimal.js`). Justify anything new against §5 of that doc.

---

## 4. Code organization

- `src/lib/engine/` — the pure-TS math engine (value tower, parser/eval, stack machine, feature
  modules: units, matrices, numerics, finance, stats, CAS bridge). No React.
- `src/lib/models/` — model-adapter layer (keystroke → engine op; per-model config from `hp/`).
- `src/hooks/` — React hooks bridging engine ↔ UI (e.g. `useCalculator`).
- `src/components/ui/` — shadcn-generated primitives (via CLI; treat as generated).
- `src/components/` — app components (faceplates, display, stack view, keypad, plots).
- `src/app/` — Next.js routes/layout (client components; this is a static export).
- `src/__tests__/` — unit/component tests; `e2e/` — Playwright tests.
- Path alias `@/*` → `src/*` (configured). Use it.

---

## 5. Deployment — GitHub Pages, base path `/hellocalc`

The app is a **static export** (`output: "export"`, `basePath: "/hellocalc"` in prod,
`images.unoptimized: true`). Every change must remain compatible:

- **No server-only features:** no API routes, Route Handlers, Server Actions, middleware, ISR,
  `dynamic = "force-dynamic"`, `cookies()`/`headers()`, or server-side data fetching at runtime.
  Everything runs in the browser.
- **Base-path-safe asset & link paths:** use `next/link` and `next/image` (which apply
  `basePath` automatically). For raw asset URLs or `fetch` of files in `public/`, prepend the
  base path (`process.env.NODE_ENV === "production" ? "/hellocalc" : ""`) — a bare `/foo` URL
  will 404 on Pages. **Prefer importing data (e.g. `hp/mapping/mapping.json`) at build time**
  over `fetch` to avoid base-path pitfalls.
- **`next build` produces the static site in `out/`.** `next start` is not used for the
  deployed site. Verify the export builds (`pnpm build`) — a build that only `dev`-runs is not
  acceptable.
- Keep everything client-compatible: guard any `window`/`document` access for SSR/prerender.

---

## 6. Testing rules

- **Unit/component:** Vitest + `@testing-library/react` (jsdom). Config in `vitest.config.ts`.
  Add a `test` script (`vitest`) and a `test:watch` script if missing.
- **Engine tests are first-class:** the pure-TS engine must have thorough unit tests, including
  **HP reference examples** (RPN stack lift/drop behavior, TVM, unit conversions, stats) checked
  to the configured precision.
- **E2E:** add Playwright (`e2e/`, `test:e2e` script). Cover core flows: enter an expression,
  RPN keystrokes on a faceplate, model switching with state retention, KaTeX render, a plot.
- **Grow tests with features** — new functional requirement (`FR-*` in the PRD) ⇒ new tests.
- Deterministic tests only; no network in unit tests (mock lazy-loaded CAS/Plotly/Pyodide).

---

## 7. Definition of done

A change is complete only when **all** hold:

1. `pnpm lint` passes (no new warnings you introduced).
2. `pnpm build` passes (static export builds cleanly, base-path-safe).
3. `pnpm test` passes; new/changed behavior has tests (and E2E where user-facing).
4. Fully-typed — no new `any`/unjustified casts; `strict` stays green.
5. UI uses vanilla Tailwind + CLI-added shadcn/Base UI components only.
6. Behavior verified end-to-end (use the `verify` / `next-browser` skill for UI changes).
7. Relevant docs updated: if scope changed, reconcile with [`docs/prd.md`](docs/prd.md); if an
   architectural decision changed, update [`docs/architecture.md`](docs/architecture.md).

---

## 8. Reference assets

- [`docs/prd.md`](docs/prd.md) — requirements (`FR-*`/`NFR-*`) and release milestones.
- [`docs/architecture.md`](docs/architecture.md) — engine architecture, library choices, tiers.
- [`hp/layouts/`](hp/layouts/) — per-model keyboards (drives faceplate rendering).
- [`hp/functions/`](hp/functions/) — per-model function sets (drives feature exposure).
- [`hp/mapping/`](hp/mapping/) — unified key+prefix→function map + `build_mapping.py`.
- [`hp/manuals/`](hp/manuals/) — source manuals for behavior verification.
