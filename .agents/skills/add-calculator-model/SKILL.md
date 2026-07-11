---
name: add-calculator-model
description: Playbook for adding a new HP calculator model faceplate to hellocalc — verified key data, derived keyboard geometry, family archetypes, MachineUnit/nameplate/topbar wiring, hotkeys, unit + e2e guards, and the hard-won layout traps (lcm subgrids, aspectClass overrides, cascade rules, trademark-safe branding).
---

# Adding a calculator model to hellocalc

How to take a model from `hp/` reference data to a playable, aspect-faithful faceplate
inside the integrated machine. This is the UI/layout half of a model phase; engine
capabilities (new functions, TVM, programmability…) belong to the model's phase in
[`plan/`](../../../plan/) and are out of scope here.

**Read first:** [`docs/responsive-layout.md`](../../../docs/responsive-layout.md)
§4 (geometry), §12.3 (prefix promotion), §14 (integrated machine, paper, branding) —
that doc is the as-built spec this skill operationalizes.

## The pipeline (what already exists — you plug into it)

```
hp/layouts/<MODEL>.md      verified keyboard (legends, shift colours, row shapes)
hp/mapping/mapping.json    (key, prefix) → function   ── single source of truth
        │
        ├─ regular grid?  scripts/gen-models.ts → models.generated.ts  (pnpm gen:models)
        └─ irregular?     author rows in src/components/calculator/models.ts
        │
models.ts  MODELS registry:  { id, name, family, sub, angle, geometry, keys|rows }
        │                     geometry = computeKeyboardGeometry(keyData, family)
        ▼
MachineUnit renders the family keyboard inside ONE bezel (nameplate + LCD + kbd)
CalcShell places the machine by geometry.aspectClass × viewport tier — automatically
ModelPicker lights the model up automatically (isAvailable = id in MODELS)
Topbar shows model.sub split on "·" as pill badges — automatically
useHotkeys gives typing for free (dispatch = DOM click on aria-label / data-kind)
```

Most of a new model is **data + one registry entry**. Chrome, placement, typing,
promotion, sheets, and the picker all key off `MODELS` and `data-family`.

## Step 1 — Source the key data (never invent it)

- Read `hp/layouts/<MODEL>.md` (row shapes, legends, shift colours, display type) and
  the model's entry in `hp/mapping/mapping.json`. Cross-check odd cells against
  `hp/manuals/<MODEL>.pdf`; layouts mark undocumented cells `[?]`.
- Legends must match the printed faceplate (unicode: `√x`, `x⇄y`, `yˣ`, `÷`, `−`);
  the `aria-label` IS the primary legend — hotkeys, tests, and dispatch target it.

## Step 2 — Key data: generated vs authored

**Regular 4×10-style grid with f/g planes (Voyager-like)** → generate, never author:
add the model id to `VOYAGER_MODELS` in [`scripts/gen-models.ts`](../../../scripts/gen-models.ts),
run `pnpm gen:models`. The generator derives col from row position, handles the
double-height ENTER (`isEnterCont` — mapping.json encodes the lower half as a
placeholder cell that must NOT become a key but still counts for column numbering),
and classifies `kind`. Never hand-edit `models.generated.ts`.

**Irregular rows (classic, RPL, anything with mixed row widths or >2 shift planes)**
→ author `ROWS` in [`models.ts`](../../../src/components/calculator/models.ts) with the
family's row helper (`c(...)` classic, `r(...)` RPL), mirroring the layout doc row by
row. Wide keys get `flex: 2` (classic) / `w: 2` (RPL) — spans, not new columns.
Special keys need the right `kind` (`enter`, `ls`, `rs`, `alpha`, `bksp`, `on`,
`digit`, `arith`, `cur`, `soft`) — `kind` drives colour, dispatch, and hotkey targets.

## Step 3 — Geometry is DERIVED, never hand-tuned

```ts
const GEOM = {
  "HP-XX": computeKeyboardGeometry({ rows: HPXX_ROWS }, "family"),
};
```

- `computeKeyboardGeometry` ([`src/lib/layout/keyboardGeometry.ts`](../../../src/lib/layout/keyboardGeometry.ts))
  derives cols/rows/aspect from the key data: `A = (cols+(cols−1)g)/(rows/k+(rows−1)g)`,
  per-family `k` from `KEY_ASPECT` (voyager/classic 1.15, rpl 1.10), shared `g = 0.12`.
  Reference: the 10×4 Voyagers ≈ 2.887 (landscape), HP-35 5×8 ≈ 0.703 (portrait),
  HP-48G 6×9 ≈ 0.722.
- `aspectClass` thresholds: ≥1.30 landscape · ≤0.68 tall · else portrait. **Override it
  only as a deliberate placement decision, with a comment** — e.g. the 48G computes
  0.722 (portrait) but is classed `{ aspectClass: "tall" }` because a 9-row keyboard
  stacked on a desktop starves the LCD. tall ⇒ LCD-beside-keys on desktop with a vars
  bay; portrait ⇒ classic LCD-above-keys look (the HP-35 must keep this).
- Check the §4.4 table in `docs/responsive-layout.md` — it pre-computes every planned
  model's aspect; your derived value should match it. **Mark the model `*` (live) there.**

## Step 4 — Register

1. `MODELS` entry in `models.ts`: `id`/`name` = the catalog id in
   [`modelCatalog.ts`](../../../src/components/calculator/modelCatalog.ts) (picker
   availability is literally `id in MODELS`), `family`, `sub` ("RPN · FINANCIAL" —
   becomes the topbar badges), `angle` (shows DEG/RAD annunciator), `geometry`, and
   `keys` (voyager) or `rows` (classic/rpl).
2. Append to `MODEL_ORDER`.
3. Per-model aux flags currently live in [`src/app/page.tsx`](../../../src/app/page.tsx)
   (e.g. `showRegisters = model.id === "HP-12C"` for the TVM strip). Extend there if the
   model needs a registers/vars panel; RPL models get `VarsNote` automatically and their
   glass owns the stack (no paper StackNote — one home per §14.4b).

## Step 4b — Patterns proven across the full fleet (all 21 models)

- **Family roster (mechanics, not marketing):** `voyager` (placed 10×4 grid, f/g),
  `classic` (row-authored, 0–3 shift planes: arc/f/f⁻¹/g/h — covers 35/45/65/25/67 AND
  the merged-block HP-97), `hp41` (classic rows + gold shift + `al` alpha letters,
  toggle-strip row), `pioneer` (row-authored + f/g planes + letters + DOT-MATRIX glass —
  covers 42S, 35s, Prime), `rpl` (p/ls/rs/al — covers 48SX/48G/49G/50g AND the merged
  28C/28S clamshells). Catalog-era grouping lives in `modelCatalog.ts`, NOT in `family`.
- **Two-block machines (28 clamshell, 97 desk):** merge the halves into ONE grid — each
  row pairs left + right across a bare-plate hinge `gap` key whose width absorbs the
  halves' differing row units. Keep EVERY merged row the same total units (28: 13, 97:
  12) or the halves' columns misalign row-to-row. The board derives landscape (open-lid
  posture); no new machinery.
- **`gap` kind** (ClassicKey + RplKey): consumes grid slots, renders an aria-hidden div,
  no button — bare plate for cursor-diamond corners, hinges, cluster offsets.
- **Per-model shift palettes:** `ModelBase.shift` carries `var(--hp-shift-*-xx)` refs;
  MachineUnit sets them on the bezel root; ink is tokenized (`--hp-shift-ls-fg`) so a
  white shift key (50g) can carry dark ink. **Per-model glass:** `ModelBase.lcdAspect`
  overrides the family 131:64 token locally (50g "131 / 80").
- **Print → id normalization** lives in `src/lib/models/normalize.ts` (view-layer, used
  by the RPN-side keyboards): author legends AS PRINTED (`ln`, `e^x`, `CLX`, `n!`,
  `%CHG`, `ASIN`…), map to canonical engine ids at dispatch. Never map an AMBIGUOUS
  print ("STK" = clear-stack on the 25 but print-stack on the 67) — leave it inert.
- **Inverse prefix (65 `f⁻¹`):** `INVERSE_OF` maps each gold word to its inverse for
  both promotion and dispatch; unlisted words fall back to the gold word (no-op safe).

## Step 5 — Only if the model doesn't fit an existing family

A new family (a genuinely new mechanic) is a bigger lift — budget for all of:

- `Family` union + key interface + row helper in `models.ts`.
- A keyboard component modeled on
  [`RplKeyboard.tsx`](../../../src/components/calculator/RplKeyboard.tsx): aspect-locked
  grid (`aspectRatio: geometry.aspect`), lcm subcolumn tracks via
  `rowUnitsOf`/`subgridColumns`/`subgridSpan`, buttons with `aria-label` = primary and
  `data-kind`, prefix promotion (armed shift's word takes the primary slot in its
  colour; the promoted plane's small copy renders `null`; others dim `opacity-40`).
- `KEY_ASPECT` entry in `keyboardGeometry.ts` (measure from the real machine's key w:h).
- `MachineUnit.tsx`: keyboard branch + nameplate branch if the era styling differs
  (classic = centred text-only line, CSS moves it below the keys; others = HCBadge +
  wordmark left, bare number right).
- `Display.tsx`: glass style — `segNum` (DSEG7 seven-segment) vs `dotNum`
  (Silkscreen dot-matrix); RPL's mini glass is aspect-locked to `--hp-lcd-aspect-rpl:
  131 / 64`. New display shapes need a `data-lcd-family` CSS branch in `globals.css`.
- `globals.css`: any new colour/size as a `@theme` token (never a hardcoded one-off);
  a family-scoped shift-plane hide threshold (see traps); `.machine[data-family="…"]`
  adjustments if the bezel differs.
- `src/lib/hotkeys.ts`: family branches in `hotkeyTarget` + `cheatsheetRows`.
- Engine hook selection in `page.tsx` (`model.family === "rpl" ? rpl : rpn`).
- Clamshell (HP-28): §14.5 — the MachineUnit grid gains a second kbd area; large
  screens put the halves side by side under one lid, phones stack them.

## Step 6 — Tests (same change, not after)

- **Unit — geometry** (`src/__tests__/keyboardGeometry.test.ts`): expected aspect for
  the new model (derived, ±), span rules if it has wide/tall keys.
- **Unit — keyboard** (`src/__tests__/keyboards.test.tsx`): aspect-locked root style,
  correct subgrid column count, every row fills the subgrid exactly (the auto-flow
  scramble guard), one button per key, promotion (armed prefix → promoted primary slot,
  emptied small copy).
- **Unit — machine** (`src/__tests__/MachineUnit.test.tsx`): nameplate shows
  `HELLO·CALC` + the BARE model number, never `HP-<n>`/`HEWLETT`; correct
  `data-family`.
- **E2E** (`e2e/smoke.spec.ts`): add the model to the `EXPECTED` aspect-guard table
  (±2%); if it introduces a new aspectClass/template behaviour, extend the placement
  matrix (machine `data-machine` variant, aux position).

## Step 7 — Verify like you mean it

Full gate: `pnpm lint && pnpm test && pnpm build && pnpm test:e2e`. Then look at it
(use the `verify` / `next-browser` skills) across the matrix: phone 375×700, tablet
768×1024, desktop 1280×800, short-viewport landscape phone. Check: keyboard aspect
(measure the box!), no clipped legends at phone pitch, promotion on every plane,
nameplate, tags in the topbar, paper panels in the right home.

## Traps (every one of these bit us — do not rediscover them)

1. **Never lay out keys with flex.** Flex rows stretched the 48G ~1.9× too wide. Rows
   of differing unit counts share one physical width (the real machines' digit keys ARE
   wider): render an lcm-of-row-units subcolumn grid (48G lcm(6,5)=30, HP-35
   lcm(5,4)=20) so every row fills exactly with integer spans.
2. **Under-filled rows scramble.** A plain N-col grid with a 4-key row auto-flows the
   next row's first key up. The row-fill unit test guards this — keep it.
3. **Aspect is an invariant, not a style.** Never set a keyboard width/height or
   hand-tune `aspectRatio`; only `geometry.aspect`. Placement quirks are fixed with a
   commented `aspectClass` override, nothing else.
4. **Display property cascade:** Tailwind utilities beat `@layer components`. Any
   show/hide rule (paper panels, shift rows, lcd line/mini) must own `display` ENTIRELY
   from the components layer — never put `flex`/`grid`/`hidden` utilities on an element
   whose visibility a components rule controls. This trap recurred three times.
5. **Family-scoped shift-plane thresholds.** Small keyboards hide shift legends via
   `@container kbdmod (max-width: …)`, scoped per family (voyager/classic 36rem, rpl
   15rem — the 48G's pitch-capped module is only ~27rem wide, so a family-blind 36rem
   hid its planes everywhere). A new family with a different pitch cap needs its own
   threshold under `.machine[data-family="…"]`.
6. **tailwind-merge eats custom text sizes.** Any new `text-*` size token must be
   registered in the `font-size` classGroups of `cn()`'s `extendTailwindMerge`
   ([`src/lib/utils.ts`](../../../src/lib/utils.ts)) or merge classifies it as a colour
   and silently drops it when combined with a text colour.
7. **Legends are container-query-sized.** `--text-key-primary` / `--text-key-shift`
   derive from `36cqi/var(--kbd-cols)` — never fixed px on key legends (fixed sizes
   outgrew the aspect box on phones and clipped).
8. **Shared ls/rs words print once.** When left- and right-shift share a word (48G
   `MODES`) render a single label with a ls→rs gradient (`bg-clip-text`), like the real
   machine — two copies collide at larger pitches.
9. **Hotkeys target the DOM.** Dispatch root is `[data-slot="machine-kbd"]`, matching
   `button[aria-label=…]` or `[data-kind=…]`. Renaming slots/labels silently kills
   typing — the typing e2e is the tripwire. Keys whose glyphs are ambiguous (RPL ◄/►
   cursor vs shift) need `data-kind` targeting.
10. **StrictMode double-invoke:** never `setX` inside another state updater (history
    printed twice). Combine into one state object with a pure updater.
11. **Static export:** import JSON at build time (`mapping.json` → generator), never
    `fetch` from `public/` (base-path `/hellocalc` 404s).
12. **Trademark-safe branding (FR-UI-15, §14.4f):** no `HP`/`Hewlett-Packard`/HP logo
    on the machine face. Nameplate = HELLO·CALC wordmark (+ pink `HCBadge` except
    classics) + BARE model number via `nameplateModel()` ("12C"). Mode tags live in the
    topbar as badges. Factual `HP-*` names stay in the picker (nominative use).
13. **Verification environment:** Turbopack serves stale CSS after edits — `rm -rf
    .next` before visual checks. The in-app Browser pane suspends rAF (Base UI overlays
    stick at opacity 0) — verify overlays via the Playwright suite, not the pane.
14. **`@theme inline` flattens one var level.** This app's `@theme inline` compiles
    utilities to the RAW `--hp-*` vars, so per-element theming (a machine's shift
    palette) must override `--hp-shift-ls`, NOT `--color-hp-shift-ls` — a `--color-*`
    override sets a variable nothing reads. Caught in-browser when the 49G stayed
    purple/green; guarded by a MachineUnit inline-style unit test.
15. **Widened union types ripple.** Extending `Prefix` (h/fi/alpha) breaks every
    narrower consumer at BUILD time (tsc), not lint/test time — `pnpm build` is the
    gate that catches it. Narrow explicitly at family boundaries
    (`prefix === "f" || prefix === "g" ? prefix : "none"`).
16. **Helper-before-use (TDZ).** models.ts row constants execute at module load —
    a rows block pasted above the `r`/`ck` helper it calls throws
    "Cannot access before initialization" in every test suite at once.

## Definition of done

AGENTS.md §7 gate green (lint · test · build · e2e), new unit + e2e coverage from
Step 6, visual matrix checked, `docs/responsive-layout.md` §4.4 marker updated,
README "Status" model list + the model's `plan/` phase file updated if this completes
(part of) a phase.
