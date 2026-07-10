# Hellocalc — design-system handoff

Winning direction: **Faithful vintage ("1a")** — graphite chassis, olive 7-segment
LCD, authentic gold-`f` / blue-`g` Voyager shift coding, flat (not skeuomorphic).
Prototype of record: **`Hellocalc App.dc.html`** (self-contained; open in a browser).
This doc maps that prototype onto the repo (`src/`) as it stands today.

## What's in this folder
- **`globals.css`** — drop-in replacement for `src/app/globals.css`. Vintage palette
  mapped onto the existing shadcn/Base UI token names (`--background`, `--primary` =
  gold f, `--secondary` = blue g, …) **plus** an `--hp-*` faceplate layer
  (`--hp-key`, `--hp-display`, `--hp-shift-f`, …). Light = `:root`, dark = `.dark`.
- **`layout.fonts.tsx`** — swaps Geist → the design pairing (Archivo UI · Barlow
  Semi Condensed legends · IBM Plex Mono stack). All from `next/font/google`.
- **DSEG7** segment font: download `DSEG7Classic-Bold.woff2` (keshikan/DSEG, OFL)
  into `public/fonts/`. `--font-display` falls back to Plex Mono if absent.

## Token semantics (the one rule)
`--hp-shift-f` (gold) / `--hp-shift-g` (blue) — and the RPL `--hp-shift-ls` (purple) /
`--hp-shift-rs` (green) — encode **which prefix reaches a legend**. They are meaning,
not decoration: a gold legend is only reachable via `f`, a blue one via `g`. Never
use them as generic accents.

## Type scale
| Token | Family | Use |
|---|---|---|
| `--font-sans` | Archivo | app chrome, headings, controls |
| `--font-legend` | Barlow Semi Condensed | key faces (primary + shift legends) |
| `--font-mono` | IBM Plex Mono | stack, history, register readouts |
| `--font-display` | DSEG7 → Plex Mono | LCD segment numerals |

## Sizing / shape / motion
- Key hit target ≥ 44px; `--radius-key` 5px; `--radius-bezel` 14px; grid gap 6px
  (Voyager) / 4–5px (dense RPL).
- Key press: `translateY(2px)`, ~50ms. Prefix-active: matching legend lifts + gains
  a soft glow and the key gets a 2px shift-colour ring.

## Component map (proposed, extends `src/components/calculator/`)
The prototype's `React.createElement` render tree corresponds 1:1 to these:

| Component | Role | Prototype source (method) |
|---|---|---|
| `Faceplate` | bezel + display + keyboard; branches by model family | `renderCalc` / `render48G` / `render35` |
| `Display` | annunciators, KaTeX hero, stack rows, register readout | `renderDisplay` |
| `Keyboard` | grid/flex key layout from model data | `renderKeyboard*` |
| `Key` | one key: primary + f/g (or ls/rs/alpha) legends + press state | `renderKey*` |
| `StackPanel` | side panel: history + live stack (RPN or RPL) | `renderSidePanel` / `renderStackPanel` |
| `NativeConsole` | keypad-free expression input + KaTeX log | `renderNative` |
| model switcher / theme + angle toggles | top bar | `renderApp` |

Model families to preserve as distinct renderers:
- **voyager** (HP-12C, HP-15C) — 4×10 grid, tall ENTER at col 6, gold f / blue g.
- **classic** (HP-35) — shiftless; blue operators / black functions / beige digits;
  `arc` acts as an inverse-trig prefix; no LAST X.
- **rpl** (HP-48G) — 6-wide function rows over a 5-wide number block; purple ◀ /
  green ▶ / white ALPHA; dynamic numbered stack.

## Data source (do NOT hand-author legends)
Keys, legends, shift colours, and per-press functions come from the repo's verified
`hp/` assets — render faceplates from **`hp/mapping/mapping.json`** (per model →
`keys[]` → `presses[]` with `access`/`color`/`function`). The prototype currently
inlines a transcribed subset; production should read `mapping.json` directly so the
faceplate and keystroke dispatch stay in sync (per PRD FR-MODEL-1/2).

## Engine notes carried by the prototype (reference, not production)
- 4-level RPN stack with correct ENTER-lift / drop / no-lift semantics; CHS preserves
  entry mode; LAST X.
- **TVM solver** (HP-12C): closed-form for FV/PV/PMT/n, bracketed root-find for `i`,
  begin/end aware. Key-a-number-then-register = store; register with no entry = solve.
- **RPL** dynamic stack (48G): DUP/SWAP/DROP/CLEAR + arithmetic/trig/log family.
- **Native**: safe recursive-descent expression parser (no `eval`).
- Results render via **KaTeX**. Production should route real math through the
  `mathEngine` / `useCalculator` seam already in `src/`.

## Not yet wired (map to later milestones)
Menu/application keys on the 48G (SOLVE, PLOT, MTH, SYMBOLIC, UNITS, STO/RCL vars),
15C matrix/complex/SOLVE/∫, and 12C NPV/IRR cash-flows render on the keys but are not
computed in the prototype — they line up with PRD milestones M3–M6.
