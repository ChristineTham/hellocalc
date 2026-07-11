# Hellocalc — Responsive Layout System

Implementation plan for the new responsive layout system that replaces the single
whole-faceplate `AutoScale` transform with a **decoupled, aspect-faithful keyboard block**
placed independently of a **flexible LCD** that fills the remaining screen estate. This
document is prescriptive and phase-by-phase. It supersedes the "scale as one unit" wording
of [`docs/prd.md`](prd.md) FR-UI-7 and [`plan/phase-01-engine-hp35.md`](../plan/phase-01-engine-hp35.md);
those reconciliations are itemised in §8.

Every recommendation is tagged:

- **[fixed]** — a hard constraint derived from the intent spec or a verified source fact.
- **[judgment]** — an engineering choice open to tuning (values called out in §11 Open decisions).

> **PRIORITY ORDER (stated up front, inviolable):**
> **#1 — KEYBOARD ASPECT-RATIO FIDELITY.** The on-screen keyboard block must mimic the
> original model's real keyboard proportions. Keys scale **uniformly** inside an
> aspect-locked box; non-uniform stretch is **never** permitted, and fidelity is **never**
> sacrificed to fill space. **[fixed]**
> **#2 — FIT THE KEYBOARD onto the screen**, placed by device class (phone: full bottom;
> larger: capped, never comically large; tablet/desktop: right side / bottom-right / right
> edge). **[fixed]**
> **#3 — LCD DISPLAY**, sized and placed **after** the keyboard, filling **most** of the
> remaining estate (single-line + annunciators → mini 4:3 multi-line). **[fixed]**
> **REMAINDER** — an always-present top bar (model selector or hamburger → persistent
> sidebar on large screens) plus history / stack / equation-variable panels in the
> leftover space. **[fixed]**

---

## 1. Goal

Hellocalc currently renders one rigid unit — nameplate + LCD + keyboard inside a fixed
`w-[34rem]` (544px) column ([`Faceplate.tsx:23`](../src/components/calculator/Faceplate.tsx)) —
and uniformly transform-scales the whole thing with a single CSS `scale()` in
[`AutoScale.tsx`](../src/components/calculator/AutoScale.tsx). Because the LCD and keyboard
share one bounding box, one aspect ratio, and one scale factor, they cannot be placed
independently, and a mismatch between the model's aspect ratio and the viewport's aspect
ratio produces large letterbox dead space (verified on a 393×852 phone: a landscape HP-12C
scales by width to 393×334px and leaves ~460px of vertical dead space). This plan **retires
`AutoScale` and `Faceplate`** and rebuilds the shell as an enumerated, zero-JS CSS-grid
layout that gives the keyboard its own aspect-locked box (Priority 1) sized to fit its
device-class region (Priority 2), and lets the LCD and auxiliary panels flow into the
remaining estate (Priority 3 + Remainder). Placement is chosen from a **width media tier ×
a static per-model aspect class**, both known at server render, so a static GitHub-Pages
export renders correctly on first paint with no measurement flash.

---

## 2. Why the current approach falls short

The whole limitation is structural: **coupling + a single aspect + a single scale.**

| Symptom | Root cause (file:line) |
|---|---|
| LCD and keyboard cannot be placed independently | Both are siblings inside one `w-[34rem]` flex column ([`Faceplate.tsx:21-77`](../src/components/calculator/Faceplate.tsx)) that `AutoScale` measures and transforms as a unit ([`page.tsx:60-63`](../src/app/page.tsx)). There is no seam. |
| Keyboard proportions are only *accidentally* faithful | The natural width is a hardcoded 544px constant, not derived from the keyboard's real column×row geometry ([`Faceplate.tsx:23`](../src/components/calculator/Faceplate.tsx)). |
| The LCD cannot flex while the keyboard stays aspect-locked | There is exactly one scale factor — `scale = Math.min(aw/nw, ah/nh, maxScale)` ([`AutoScale.tsx:48`](../src/components/calculator/AutoScale.tsx)) — applied to the whole unit. |
| Letterbox dead space on tall/short screens | The combined faceplate has one emergent aspect (~1.18:1 Voyager). On a 393×852 phone it scales by width (0.72) to 393×334px → ~460px vertical dead space. |
| HP-48G keyboard is visibly distorted (~1.9× too wide) | `RplKeyboard.tsx` uses flex rows with only a `min-h-10` (40px) floor and no width constraint ([`RplKeyboard.tsx:64`](../src/components/calculator/RplKeyboard.tsx)), so 6 keys fill the 504px inner width → keys render ~80.7×40px (k≈2.0) and the block is 504×392px = 1.29:1 **landscape** for a device whose real keyboard is ~0.72 **portrait**. |

The fix implied by all of the above: render the keyboard as its own aspect-locked block
(intrinsic ratio from its col×row geometry, sized to fit its assigned region) and render
the LCD / stack / history as separate flexible blocks filling the remainder — i.e. retire
the single whole-faceplate `AutoScale` in favour of an aspect-preserving keyboard fitter +
independent LCD region, driven by device-class placement.

---

## 3. Region model + device/orientation matrix

### 3.1 Region model

Five logical regions. Each is a named grid area in a single CSS-grid **shell**
(`CalcShell.tsx`, class `.calc-shell`); the LCD and keyboard additionally establish their
own container context. Chrome regions (drawer vs sidebar) are mutually exclusive **by CSS**
(`hidden lg:flex` / `lg:hidden`), not by a JS branch.

| Region (grid area) | Component | Owns | Placement mechanism |
|---|---|---|---|
| `topbar` | `Topbar.tsx` | Hamburger **top-LEFT** (below `lg`; mirrors the desktop sidebar's position — §12.4), brand/title, `ModelPicker` top-right. Phone LCD/aux toggles live in the bottom **toolstrip**, not here (§12.4) | Always present, full-width band, height `--calc-topbar-h`. |
| `keyboard` | `KeyboardZone.tsx` inside `KeyboardFitter.tsx` | Nameplate strip + family keyboard. **Priority 1.** Never transform-scaled; never distorted. | Aspect-locked box inside a `container-type:size` slot; grid area set by the shell template. |
| `lcd` | `LcdRegion.tsx` wrapping `Display.tsx` | Status annunciators + primary value(s); mini mode adds hero + compact stack + register summary | Fills the remaining cell; line↔mini driven by its own `@container/lcd` size query. Always placed **after** the keyboard. |
| `aux` | `AuxPanel.tsx` composing `StackPanel` + a new vars/eqn strip | **Authoritative** live stack (ordered **above** history — §12.5) + computation history + equation/variable/TVM panel | Inline grid area on `md`+ (per §3.3 templates); a **bottom `Sheet`** below `md` (§12.4). |
| `sidebar` | `CalcNav.tsx` | Settings, about, state import/export, reset (surfaces FR-STATE-4) | `hidden lg:flex` persistent `<aside>` at ≥`lg`; same component inside a `Sheet` (hamburger) below `lg`. |

**Content-ownership resolution (removes today's duplication).** The live stack is currently
rendered in *both* `Display`'s expanded branch ([`Display.tsx:137-156`](../src/components/calculator/Display.tsx))
and `StackPanel` ([`Display.tsx:298-312`](../src/components/calculator/Display.tsx)). Going
forward, when an in-plane `aux` region exists (tablet/desktop) **`AuxPanel` is the sole
source of truth for the full stack**, and the LCD shows only hero + X (mini) or X/entry
(line). When there is no in-plane aux (phone single column), the LCD may show a 1–2 line
stack echo (see §11 Open decisions). TVM registers (`n/i/PV/PMT/FV`) and named variables
migrate out of the LCD into `AuxPanel`. This is passed to `Display` via a new optional
`showStack?: boolean` (default preserves current behaviour); see §6.1 for why this is
**source-compatible** rather than byte-identical.

**Selection layer (all SSR-safe).** The shell stamps three attributes:

- `data-aspect` — **static**, from `model.geometry.aspectClass` (`landscape | portrait |
  tall`; `clamshell` deferred — §6.2). Drives which `grid-template-areas` variant CSS
  applies. Known at build, correct on first paint.
- `data-chrome` (`drawer | sidebar`) and `data-template` (`TemplateId`) — stamped **after
  mount** by an SSR-safe width-tier hook, **as convenience labels for tests**. They do not
  gate layout (CSS already did that from the width media tier), so there is no flash. §10
  makes geometry — not these labels — the primary correctness assertion.

### 3.2 Device / orientation matrix

Placement = **(width tier via Tailwind media breakpoint) × (`data-aspect` static aspect
class)**. Both are known at SSR. Tailwind v4 defaults, no overrides in `globals.css`, and
mirrored in the shared `src/lib/layout/breakpoints.ts` constants (§10):
`sm` 640 · `md` **768** · `lg` 1024 · `xl` 1280 · `2xl` 1536. Width breakpoints decide the
**chrome** (drawer `< lg` vs persistent sidebar `≥ lg`) and column count; the static aspect
class decides **where the aspect-locked keyboard anchors**.

The six width tiers map 1:1 onto `type WidthTier = 'phone' | 'sm' | 'md' | 'lg' | 'xl' |
'2xl'` (§6.2). **The `sm` band (640–767px) is explicit** and no longer folded into `md`:

| Device class | Width tier (px) | Keyboard placement (aspect-locked) | LCD placement | Aux placement | Chrome |
|---|---|---|---|---|---|
| **phone-portrait** | `phone` `< 640` | Full width, **entire bottom band**; band height = keyboard's own `100dvw / A`, capped at `--calc-kbd-max-h` (≈`68dvh`) so a `--calc-toolstrip-h` strip of toggles sits below it | Fills MOST of remaining top; **single-line + annunciators** default (grows to a 2-line stack echo — §11 #8) | **bottom `Sheet`** behind a toolstrip toggle (§12.4) | hamburger (top-left) → left `Sheet` |
| **large-phone / sm** | `sm` `640–767` | **Same `stack` template as `phone`** (bottom band). This band is common on large phones / small tablets held portrait; it deliberately reuses the phone single-column layout rather than the tablet split (§11 #2). | Fills MOST of remaining top | **bottom `Sheet`** | hamburger (top-left) → left `Sheet` |
| **phone-landscape** | any width **and** short (`orientation:landscape` + `max-height:34rem`) | **Height-bound on the RIGHT** (12C fits; tall 48G binds on height); column width = `(100dvh − topbar)·A`, capped at `--calc-kbd-max-w` | LEFT of keyboard, compact | **bottom `Sheet`** | hamburger (top-left) → left `Sheet` |
| **tablet-portrait** | `md` `768–1023`, portrait | Landscape model → full-width bottom band. Portrait/tall model → **bottom-RIGHT** | **Top half** (top-LEFT when kbd is bottom-right) | Bottom-LEFT inline (split) or under LCD | topbar; `Sheet` (sidebar may begin at `md`, see §11) |
| **tablet-landscape** | `lg` `1024–1279` | **Right side**, height-bound, capped | Top-LEFT | Under LCD, left column | **persistent sidebar** |
| **small-laptop** | `xl` `1280–1535` | Tall model → **RIGHT EDGE, full height**; portrait → right side; landscape → bottom band; capped by `--calc-kbd-max-w` (never comically large) | Top-left **mini 4:3** | Left column: history + stack | **persistent sidebar** |
| **large-desktop** | `2xl` `≥ 1536` | Same templates as `xl`; keyboard capped **and centered** in its slot (surplus deliberately not given to the keyboard) | Top-left **mini 4:3 multi-line** | History + full stack + **equation/variable/TVM** panels | **persistent sidebar** |

Invariants across every class: (1) keyboard placement depends only on width-tier × static
aspect-class — both SSR-known; (2) the LCD is always placed *after* the keyboard as the
flexible remainder; (3) a topbar (and, `≥ lg`, a sidebar) is always present.

### 3.3 Grid templates (explicit)

The §3.2 matrix is prose; **this section is the buildable specification.** Because
`grid-template-areas` *cannot* be parameterised by a CSS variable, every distinct layout is
written out as its own rule in `@layer components`, guarded by an exact width media query
and (where the layout depends on aspect) a `.calc-shell[data-aspect="…"]` selector. Only the
per-model numbers — `--kbd-a`, `--kbd-cols`, `--kbd-rows`, set inline by `KeyboardFitter`
(§4) — vary within a template; the area strings are literal.

**Named areas (all templates):** `topbar`, `keyboard`, `lcd`, `aux`, `sidebar`.

**Determinacy rule (why the tracks look the way they do).** The shell is `block-size:100dvh`
(definite), so every grid track is definite, so the keyboard and LCD slots
(`container-type:size`) always have a determinate block-size for their container queries
(§4.3, §5, §11). The two aspect-aware track formulas recur:

- **Bottom band** (keyboard full-width at the bottom): track height =
  `min(--calc-kbd-max-h, calc(<available-inline> / var(--kbd-a)))`. This is the keyboard's
  own natural height at full available width, so one template serves landscape *and*
  portrait *and* tall — `--kbd-a` (data) resizes the band.
- **Right column** (keyboard height-bound on the side): track width =
  `min(--calc-kbd-max-w, calc(<available-block> * var(--kbd-a)))`.

`<available-inline>` is `100dvw` (or `100dvw − --calc-sidebar-w` when a sidebar is present);
`<available-block>` is `100dvh − --calc-topbar-h` (or `100dvh` when the keyboard spans the
topbar row). Multiplying/dividing a length by the unitless `--kbd-a` is valid `calc()`, and
every input is definite ⇒ the slot never collapses.

```css
@layer components {
  /* Shared spine. data-aspect (static) is stamped on this element; the enumerated
     rules below select a template by width media tier × data-aspect. Height is
     definite so the keyboard & LCD slots get a determinate block-size (§11). */
  .calc-shell {
    display: grid;
    block-size: 100dvh;
    gap: var(--calc-region-gap);
  }
  .calc-shell > [data-region="keyboard"] { container: kbd / size; }
  .calc-shell > [data-region="lcd"]      { container: lcd / size; }

  /* Inline aux/sidebar exist in the DOM at every size but are display:none by
     default (Sheet-hosted); the lg+ templates below re-enable them as grid areas.
     No JS branch — pure CSS, SSR-correct. */
  .calc-shell > [data-region="sidebar"],
  .calc-shell > [data-region="aux"] { display: none; }

  /* ── TEMPLATE `stack` — phone (<640) AND sm (640–767), ALL aspect classes ──────
     Single column: topbar / lcd / keyboard. aux + sidebar are Sheet-hosted
     (data-chrome=drawer). One rule serves landscape/portrait/tall because the
     bottom-band height is the keyboard's own 100dvw/A, capped at --calc-kbd-max-h. */
  @media (width < 48rem) {
    .calc-shell {
      grid-template-areas: "topbar" "lcd" "keyboard";
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows:
        var(--calc-topbar-h)
        minmax(0, 1fr)
        min(var(--calc-kbd-max-h), calc(100dvw / var(--kbd-a)));
    }
  }

  /* ── md (768–1023) ─────────────────────────────────────────────────────────── */
  @media (48rem <= width < 64rem) {
    /* TEMPLATE `tablet-portrait-wide` — aspect=landscape. Wide-short keyboard
       (12C/15C) wants a bottom band even on a tablet.
       PROPOSED DEFAULT — pending sign-off (§11 #1). */
    .calc-shell[data-aspect="landscape"] {
      grid-template-areas:
        "topbar   topbar"
        "lcd      aux"
        "keyboard keyboard";
      grid-template-columns: minmax(0, 1fr) minmax(0, var(--calc-panel-max-w));
      grid-template-rows:
        var(--calc-topbar-h)
        minmax(0, 1fr)
        min(var(--calc-kbd-max-h), calc(100dvw / var(--kbd-a)));
    }
    .calc-shell[data-aspect="landscape"] > [data-region="aux"] { display: flex; }

    /* TEMPLATE `tablet-portrait-corner` — aspect=portrait OR tall (identical).
       LCD across the top, keyboard bottom-right, aux bottom-left.
       PROPOSED DEFAULT — pending sign-off (§11 #1). */
    .calc-shell[data-aspect="portrait"],
    .calc-shell[data-aspect="tall"] {
      grid-template-areas:
        "topbar topbar"
        "lcd    lcd"
        "aux    keyboard";
      grid-template-columns:
        minmax(0, 1fr)
        min(var(--calc-kbd-max-w), calc((100dvh - var(--calc-topbar-h)) / 2 * var(--kbd-a)));
      grid-template-rows: var(--calc-topbar-h) minmax(0, 1fr) minmax(0, 1fr);
    }
    .calc-shell[data-aspect="portrait"] > [data-region="aux"],
    .calc-shell[data-aspect="tall"] > [data-region="aux"] { display: flex; }
  }

  /* ── lg+ (≥1024): persistent sidebar; re-enable inline sidebar + aux ─────────── */
  @media (width >= 64rem) {
    .calc-shell[data-aspect] > [data-region="sidebar"],
    .calc-shell[data-aspect] > [data-region="aux"] { display: flex; }

    /* TEMPLATE `desktop-landscape` — aspect=landscape (lg == xl == 2xl).
       Wide-short keyboard as a bottom band; lcd+aux middle; sidebar left.
       2xl surplus is centered by the fitter, not the grid. */
    .calc-shell[data-aspect="landscape"] {
      grid-template-areas:
        "sidebar topbar   topbar"
        "sidebar lcd      aux"
        "sidebar keyboard keyboard";
      grid-template-columns:
        var(--calc-sidebar-w) minmax(0, 1fr) minmax(0, var(--calc-panel-max-w));
      grid-template-rows:
        var(--calc-topbar-h)
        minmax(0, 1fr)
        min(var(--calc-kbd-max-h), calc((100dvw - var(--calc-sidebar-w)) / var(--kbd-a)));
    }

    /* TEMPLATE `desktop-wide` — aspect=portrait (lg == xl == 2xl).
       Keyboard on the right, height-bound below the topbar; lcd top-middle,
       aux bottom-middle, sidebar full-height left. */
    .calc-shell[data-aspect="portrait"] {
      grid-template-areas:
        "sidebar topbar topbar"
        "sidebar lcd    keyboard"
        "sidebar aux    keyboard";
      grid-template-columns:
        var(--calc-sidebar-w)
        minmax(0, 1fr)
        min(var(--calc-kbd-max-w), calc((100dvh - var(--calc-topbar-h)) * var(--kbd-a)));
      grid-template-rows: var(--calc-topbar-h) minmax(0, 1fr) minmax(0, var(--calc-panel-max-w));
    }
  }

  /* TEMPLATE `desktop-wide` also serves aspect=tall AT lg ONLY.
     PROPOSED DEFAULT — pending sign-off (§11 #1, #4). */
  @media (64rem <= width < 80rem) {
    .calc-shell[data-aspect="tall"] {
      grid-template-areas:
        "sidebar topbar topbar"
        "sidebar lcd    keyboard"
        "sidebar aux    keyboard";
      grid-template-columns:
        var(--calc-sidebar-w)
        minmax(0, 1fr)
        min(var(--calc-kbd-max-w), calc((100dvh - var(--calc-topbar-h)) * var(--kbd-a)));
      grid-template-rows: var(--calc-topbar-h) minmax(0, 1fr) minmax(0, var(--calc-panel-max-w));
    }
  }

  /* ── TEMPLATE `desktop-tall` — aspect=tall at xl/2xl (≥1280) ───────────────────
     Keyboard takes the RIGHT EDGE, full height (spans the topbar row too). */
  @media (width >= 80rem) {
    .calc-shell[data-aspect="tall"] {
      grid-template-areas:
        "sidebar topbar keyboard"
        "sidebar lcd    keyboard"
        "sidebar aux    keyboard";
      grid-template-columns:
        var(--calc-sidebar-w)
        minmax(0, 1fr)
        min(var(--calc-kbd-max-w), calc(100dvh * var(--kbd-a)));
      grid-template-rows: var(--calc-topbar-h) minmax(0, 1fr) minmax(0, var(--calc-panel-max-w));
    }
  }

  /* ── TEMPLATE `phone-landscape` — short viewport OVERRIDE (any width ≥ sm) ──────
     `[data-aspect]` (attribute-presence, specificity 0,2,0) + later source order
     beats the md/desktop aspect rules in the short-viewport overlap. Keyboard is
     height-bound on the right; lcd to its left; aux Sheet-hosted. */
  @media (min-width: 40rem) and (max-height: 34rem) and (orientation: landscape) {
    .calc-shell[data-aspect] {
      grid-template-areas:
        "topbar topbar"
        "lcd    keyboard";
      grid-template-columns:
        minmax(0, 1fr)
        min(var(--calc-kbd-max-w), calc((100dvh - var(--calc-topbar-h)) * var(--kbd-a)));
      grid-template-rows: var(--calc-topbar-h) minmax(0, 1fr);
    }
    .calc-shell[data-aspect] > [data-region="sidebar"],
    .calc-shell[data-aspect] > [data-region="aux"] { display: none; }
  }
}
```

**Enumeration table (every `aspectClass × tier` cell resolves to a named template).**
Duplicate cells are collapsed explicitly; "proposed default" cells encode a UX placement
choice pending sign-off (§11 #1), not a mechanical result.

| aspect ↓ / tier → | `phone` <640 | `sm` 640–767 | `md` 768–1023 | `lg` 1024–1279 | `xl` 1280–1535 | `2xl` ≥1536 |
|---|---|---|---|---|---|---|
| **landscape** | `stack` | `stack` | `tablet-portrait-wide` * | `desktop-landscape` | `desktop-landscape` | `desktop-landscape` |
| **portrait** | `stack` | `stack` | `tablet-portrait-corner` * | `desktop-wide` | `desktop-wide` | `desktop-wide` |
| **tall** | `stack` | `stack` | `tablet-portrait-corner` * | `desktop-wide` * | `desktop-tall` | `desktop-tall` |
| **clamshell** | *(deferred — no live model; `computeKeyboardGeometry` cannot produce it. Falls back to `stack`. §6.2, §11 #3)* | ← | ← | ← | ← | ← |

`*` = **proposed default — pending sign-off (§11 #1)**.

**Duplicate collapses (identical CSS, stated explicitly):**

- `stack` covers **6 cells**: {landscape, portrait, tall} × {phone, sm}. The three aspect
  classes share one rule; only `--kbd-a` differs, so `phone == sm` and
  `landscape@phone == portrait@phone == tall@phone` structurally.
- `tablet-portrait-corner`: **portrait@md == tall@md**.
- `desktop-landscape`: **landscape@lg == landscape@xl == landscape@2xl**.
- `desktop-wide`: **portrait@lg == portrait@xl == portrait@2xl**, and **tall@lg** reuses it.
- `desktop-tall`: **tall@xl == tall@2xl**.
- `2xl` never introduces a new grid: it equals `xl` and merely leaves the keyboard's slot
  larger than `--calc-kbd-max-w`, which the fitter's `margin:auto` centers (Priority 2).
- `phone-landscape` is an orthogonal **override**, selected by a short-viewport media query
  regardless of width tier, and supersedes the cell that width alone would pick.

Seven distinct templates total (`stack`, `tablet-portrait-wide`, `tablet-portrait-corner`,
`desktop-landscape`, `desktop-wide`, `desktop-tall`, `phone-landscape`). `templates.ts`
(§6.2) enumerates the same seven so Playwright can label and cross-check them (§10).

---

## 4. Keyboard geometry system (Priority 1)

The keyboard block's target aspect is **data**, derived per model from
[`hp/mapping/mapping.json`](../hp/mapping/mapping.json) (voyager, generated) or the authored
`rows` arrays (classic/rpl) — never a magic number. The derivation is pure TS in
`src/lib/layout/keyboardGeometry.ts` (no React/DOM), so it doubles as the deterministic test
oracle (§10).

### 4.1 Inputs (computed once per model)

1. **`cols`** = `max over rows of Σ(key column-span)`. A double-**WIDTH** ENTER (HP-35,
   HP-48G) consumes **2 existing** column slots — it does **not** add a column. **[fixed]**
2. **`rows`** = `max(row + rowSpan − 1)`. A double-**HEIGHT** ENTER (HP-12C/15C) consumes
   **2 existing** row slots — it does **not** add a row. **[fixed]**
3. **`k`** = base key aspect (w:h), a **per-family token**: voyager `1.15` · classic `1.15`
   · rpl `1.10` · pioneer `1.15` · prime `1.05` · hp-41 `1.20`. **[judgment]**
4. **`g`** = inter-key gap as a **fraction of key width** (default `0.12`; today voyager
   ≈`6/45=0.13`, rpl `4/40=0.10`). **[judgment]**

### 4.2 The generic algorithm (block target aspect)

```
A_exact  = ( cols + (cols − 1)·g ) / ( rows/k + (rows − 1)·g )   // the invariant --kbd-a
A_simple ≈ ( cols / rows ) · k                                    // within <3%, headline only
```

Aspect class (drives `data-aspect` + placement):

```
A ≥ 1.30                       → 'landscape'
0.68 < A < 1.30                → 'portrait'
A ≤ 0.68                       → 'tall'
(28C/28S, two keyboard panels) → 'clamshell'   // deferred; not produced by any live model — §6.2, §11 #3
```

### 4.3 Uniform fit (no distortion), capped size

The fitter box is **pure CSS**, using the `object-fit: contain` formula expressed in
container-query units so both slot dimensions are comparable inside one `min()`:

```css
.kbd-fitter {                 /* slot: container: kbd / size, determinate block-size (§3.3) */
  inline-size: min(100cqi, calc(100cqb * var(--kbd-a)), var(--calc-kbd-max-w));
  block-size: auto;           /* = inline-size / --kbd-a  ⇒ always ≤ slot height */
  margin: auto;               /* centre in slot (Priority 2 "not comically large") */
}
.kbd-grid {
  aspect-ratio: var(--kbd-a);
  display: grid;
  grid-template-columns: repeat(var(--kbd-cols), 1fr);
  grid-template-rows:    repeat(var(--kbd-rows), 1fr);
  gap: var(--calc-key-gap); /* single cqmin value ⇒ identical absolute gap on both axes */
}
```

Because the box aspect **equals** `A` and the track counts are exactly `cols × rows` with
the same `k` baked into `A`, every `1fr` cell resolves to a uniform `k:1` key. ENTER and
dual-pitch digit keys span via `grid-column/row: span n`, which multiply an already-uniform
pitch — so nothing is stretched. `--calc-kbd-max-w` is Priority 2's "not comically large."

> **Why the contain formula and not a naïve `aspect-ratio; width:100%; max-height:100%`
> box:** with a *definite* `width:100%`, when `max-height` clamps in a height-bound
> (short/landscape) slot, CSS aspect-ratio yields to the max constraint — the box becomes
> the wrong ratio and the inner `1fr` grid then stretches keys non-uniformly, violating
> Priority 1. The `min(100cqi, 100cqb·A, cap)` construction contains correctly on **both**
> axes because it compares percent-of-inline and percent-of-block in one unit. **[fixed]**
>
> **Why `cqb` is safe here:** we never use container *aspect-ratio queries* (the newer,
> less-uniform feature). We use only container-query *units* (`cqi`/`cqb`, broadly baseline
> by 2026) for sizing, and every template in §3.3 guarantees a **determinate
> keyboard-slot block-size** (definite grid track under a `100dvh` shell) — so `cqb` can
> never collapse to `0`.
>
> **Phasing note (see §9):** this container-unit fitter depends on the `container: kbd/size`
> slot **that only `CalcShell` establishes** (a determinate block-size). It is therefore
> introduced in **Step 2**, alongside `CalcShell`. In **Step 1** the keyboards ship as plain
> `aspect-ratio: var(--kbd-a)` + equal-`1fr` grids (no `cqi/cqb`), which is all that is
> needed to fix the confirmed HP-48G ~1.9× horizontal stretch and add the fidelity
> regression guard; the old `Faceplate`/`AutoScale` provide no size container, so the
> contain formula would have no determinate `cqb` there.

### 4.4 Per-model geometry set (21 models; `*` = live in `MODELS` today; `g = 0.12`)

| Model (family) | cols × rows | double key | k | A (block W:H) | class |
|---|---|---|---|---|---|
| **HP-35 \* (classic)** | **5 × 8** | ENTER w2 (row4) | **1.15** | **≈0.70** | **portrait** |
| HP-45 (classic) | 5 × 8 | ENTER w2 | 1.15 | ≈0.70 | portrait |
| HP-65 (classic) | 5 × 9 | ENTER w2 (+card slot) | 1.15 | ≈0.64 | tall |
| HP-25 / 21 (woodstock) | 4 × 7 (top 5-w) | ENTER w2 (row3) | 1.15 | ≈0.66 (4c) / 0.82 (5c) | tall/portrait |
| HP-41 C/CV/CX | 5 × 8 (+mode strip) | ENTER w2 (row4) | 1.20 | ≈0.75 | portrait |
| **HP-12C \* (voyager)** | **10 × 4** | ENTER h2 (col6, r3-4) | **1.15** | **≈2.88** | **landscape** |
| **HP-15C \* (voyager)** | **10 × 4** | ENTER h2 (col6, r3-4) | **1.15** | **≈2.88** | **landscape** |
| HP-11C / 16C (voyager) | 10 × 4 | ENTER h2 | 1.15 | ≈2.88 | landscape |
| HP-28C / 28S (clamshell) | L 6×6 + R 5×7 | ENTER w2, SPACE w2 | 1.15 | comb ≈1.81 | **clamshell** (deferred) |
| HP-42S (pioneer) | 6 × 7 (num 5-w) | ENTER w2 (row3) | 1.15 | ≈0.99 (6c) / 0.82 (5c) | portrait |
| **HP-48G \* (rpl)** | **6 × 9 (bot 5-w)** | ENTER w2 (row5) | **1.10** | **≈0.72** | **portrait** |
| HP-48SX (rpl) | 6 × 9 | ENTER w2 | 1.10 | ≈0.72 | portrait |
| HP-49G (rpl) | 6 × 9 | ENTER w2 | 1.10 | ≈0.72 | portrait |
| HP-50g (rpl) | 6 × 10 (num 5-w, cursor diamond) | ENTER w1 | 1.10 | ≈0.66 | tall |
| HP-Prime | main 5×7 (→~5×9 full) | ENTER w2 (row3) | 1.05 | ≈0.75 (main) / 0.58 (full) | portrait/tall |

**Worked checks** (`k`, `g` as above):
`HP-12C 10×4 → A_exact = (10 + 9·0.12)/(4/1.15 + 3·0.12) = 11.08/3.838 = 2.887`.
`HP-35 5×8 → A_exact = (5 + 4·0.12)/(8/1.15 + 7·0.12) = 5.48/7.797 = 0.703`.
`HP-48G 6×9 (k=1.10) → A_exact = (6 + 5·0.12)/(9/1.10 + 8·0.12) = 6.60/9.142 = 0.722`. These
pin `--kbd-a` for the live models.

**HP-48G aspect — the ~0.53 / ~0.48 conflict, reconciled.** The authoritative figure for the
**keyboard block** is **A ≈ 0.72–0.73** (cols=6, rows=9, k=1.10, g=0.12 → 0.722), which
matches the real HP-48G keyboard-region ratio (~0.74). The competing research figures are
**not the keyboard block** and must not be used for `--kbd-a` or placement:

- **~0.53** came from assuming *tall* keys (k≈0.80) rather than the 48G's real ~1.10 key
  pitch; plug k=0.80 into the same formula and A drops to ~0.53. That key aspect is wrong
  for this device.
- **~0.48** is the **whole device** (≈89×184mm including the LCD, bezel, and label band),
  not the keyboard. The layout system sizes and classifies the *keyboard block* only.

Because 0.72 sits just **above** the 0.68 tall/portrait boundary, HP-48G classifies as
**portrait** (bottom-right on tablet, right-side on desktop). It is near the knife-edge, so
`aspectClass` should be a **per-model override** rather than a raw threshold artifact — a
deliberate placement choice, tied to open decision §11 #4. **HP-35 (≈0.703)** sits in the
same band and gets the same treatment: it is portrait by the threshold, and the override
keeps that a decision rather than an accident of `k`/`g`.

**Dual-pitch caveat.** Classic/Woodstock/HP-41/Pioneer have a finer-pitch control area over
a coarser number pad. Use `cols` = the max column count that spans the full field width and
render digit keys with `>1` column-span so the block aspect stays faithful and no key is
non-uniformly stretched. The single `cols×rows×k` rule is ~15% accurate on those; pin the
live models' `k` against real `hp/layouts/*` faceplate photos before locking tokens (§11 #4).

---

## 5. LCD model (Priority 3)

The LCD is decoupled from the keyboard and fills the remaining estate. Its default mode is
driven by its **own** `@container/lcd` size query on `LcdRegion` — retiring the app's last
JS *media* query in `Display` (`Display.tsx:92` `useMediaQuery('(max-width: 639px)')`) and
its SSR `false → real` flash. Both layouts render; CSS reveals one. The manual
expand/collapse chevron persists and its override wins over the container default via a
higher-specificity attribute rule (§5.3) — **no JS reads the container back.**

### 5.1 State A — single-line + annunciators (`@container/lcd` below the mini threshold)

A **wide, short** segment bar. Renders the always-on annunciator row (f/g prefix,
DEG/RAD/GRD when `showAngle && s.ang`, RPN|RPL badge, BEG/END voyager-only, Error) + one
right-justified value = `entry ?? (rpl ? top-of-stack : X)`, at `--text-hp-lcd-value`, fixed
height `--calc-lcd-line-h`. **The tall `min-h-[52px]` hero reservation
([`Display.tsx:178`](../src/components/calculator/Display.tsx)) is dropped in this mode.**
The full stack lives authoritatively in `AuxPanel`; per the **resolved** decision (§11 #8),
when no in-plane aux exists (phone) the line state grows to **two lines** and echoes the top
of the stack (`showStack` defaults on there), so Y/Z/T are never fully out of sight.

### 5.2 State B — mini 4:3 multi-line (taller slot)

An explicit `aspect-ratio: var(--hp-lcd-aspect-mini)` (4/3) box, **capped and centered**
inside a larger cell — so on huge screens it caps growth and surplus flows to `aux`, while
on a phone the line mode instead stretches full width ("fills MOST of remaining estate").
Reflows, in order: **status → KaTeX hero** (`renderLatex(s.latex)`) **→ compact stack**
(RPN T/Z/Y/X + LST x, or RPL levels) **→ TVM/variable summary row**. Every piece already
exists in `Display`'s expanded branch ([`Display.tsx:129-175`](../src/components/calculator/Display.tsx));
it only needed an aspect container and independent sizing. All sizes come from
`--text-hp-lcd-*` tokens.

### 5.3 Default mode + manual override — the concrete mechanism

The critique flagged the draft's "container default *and* JS override" as contradictory.
Resolved, non-contradictorily:

1. **Both subtrees always render.** `Display` outputs a line subtree (`data-lcd-mode="line"`)
   and a mini subtree (`data-lcd-mode="mini"`), both in the DOM.
2. **CSS picks the default.** In `globals.css`: line is the safe default
   (`.lcd-mini{display:none}`); a container query flips to mini once the slot is tall enough:
   ```css
   .lcd-mini { display: none; }
   .lcd-line { display: flex; }
   @container lcd (min-height: var(--calc-lcd-mini-min-h)) {
     .lcd-line { display: none; }
     .lcd-mini { display: flex; }
   }
   ```
3. **The chevron overrides via an attribute, by specificity — not by reading the container.**
   The toggle ([`Display.tsx:114-126`](../src/components/calculator/Display.tsx)) drives
   `userExpanded`, which `LcdRegion` reflects as `data-lcd-force="line" | "mini"`:
   ```css
   .lcd-region[data-lcd-force="mini"] .lcd-line { display: none; }
   .lcd-region[data-lcd-force="mini"] .lcd-mini { display: flex; }
   .lcd-region[data-lcd-force="line"] .lcd-mini { display: none; }
   .lcd-region[data-lcd-force="line"] .lcd-line { display: flex; }
   ```
   The forced rules carry an extra attribute selector (`.lcd-region[data-lcd-force] …`,
   specificity 0,3,0) that **beats the container-query rule** (`.lcd-region .lcd-mini`,
   0,2,0 — container queries add no specificity), regardless of slot size.
4. **`userExpanded === null` ⇒ no `data-lcd-force` attribute ⇒ the container default applies.**
   This removes the need to read the container back in JS and lets `Display` drop
   `useMediaQuery` entirely.

`defaultMode?: LcdMode` remains an **optional prop** used only as a test/SSR seam: Vitest
passes it explicitly to assert the prop-driven path deterministically (jsdom cannot evaluate
container queries — §9 Step 3, §10). `RpnState` and `StackPanelProps` are unchanged;
`DisplayProps` gains only optional additive props (§6.1).

**Content-ownership matrix (target):**

| Region | single-line LCD | 4:3 mini LCD | `AuxPanel` (always, when in-plane) |
|---|---|---|---|
| status / annunciators | yes | yes | — |
| primary value | X / entry | KaTeX hero + X | — |
| full stack | aux-authoritative; **1–2 line echo on phone (resolved — §11 #8)** | compact 4-line RPN / RPL | authoritative stack, pinned **above** history (§12.5) |
| history | — | — | op → result list |
| TVM / vars / eqns | — | summary row | equation/variable panel |

---

## 6. Component + type changes

### 6.1 File inventory

| File | New/Modified/Removed | Responsibility |
|---|---|---|
| `src/components/calculator/CalcShell.tsx` | **new** | The grid shell (`.calc-shell`). Renders the five region slots (`data-region="…"`); sets `data-aspect` (static) + `data-chrome`/`data-template` (post-mount, tests only); the enumerated §3.3 templates select the grid via width tier × `data-aspect`. Replaces the flex/AutoScale body of `page.tsx`. |
| `src/components/calculator/KeyboardFitter.tsx` | **new** | Priority-1 core. Sets `--kbd-a/--kbd-cols/--kbd-rows` from `model.geometry`; renders the `container:kbd/size` slot + contain-formula box + `1fr` grid. Pure CSS — no transform, no ResizeObserver. |
| `src/components/calculator/KeyboardZone.tsx` | **new** | Nameplate strip + family keyboard switch (voyager/classic/rpl) inside `KeyboardFitter`, wired to the active hook's `prefix/arm/press`. Absorbs `Faceplate` minus `Display`. |
| `src/components/calculator/LcdRegion.tsx` | **new** | Fills the `lcd` cell, establishes `@container/lcd`, reflects `userExpanded` as `data-lcd-force`. `Display` reused. |
| `src/components/calculator/AuxPanel.tsx` | **new** | Composes `StackPanel` (authoritative stack + history) + a new equation/variable/TVM strip; inline on `lg`+, inside `Sheet` below. |
| `src/components/calculator/Topbar.tsx` | **new** | Always-present top bar: brand, `ModelPicker`, hamburger (opens `Sheet` below `lg`), LCD/aux toggles. Composes existing primitives only. |
| `src/components/calculator/CalcNav.tsx` | **new** | Nav content (settings/about/state import-export/reset). One component rendered in `Sheet` (`< lg`) and persistent `<aside>` (`≥ lg`). Surfaces FR-STATE-4. |
| `src/lib/layout/breakpoints.ts` | **new** | Single source of truth for the width tiers (`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`), consumed by `useViewportTier`/`templates.ts` and mirrored by the §3.3 `@media` values + Tailwind's `--breakpoint-*` (§10 asserts no drift). |
| `src/lib/layout/keyboardGeometry.ts` | **new** | Pure TS: `computeKeyboardGeometry`, `keyboardAspect`, `aspectClassOf`. No React/DOM. The test oracle. |
| `src/lib/layout/templates.ts` | **new** | Enumerated `TemplateId → LayoutTemplate` map + `computePlacement`; pure, used for `data-*` stamping + unit tests. |
| `src/hooks/useViewportTier.ts` | **new** | SSR-safe width-only tier hook (mirrors `useMediaQuery`), reading `breakpoints.ts`; stamps `data-template`/`data-chrome`/`data-kbd-placement` **after mount for tests only** — does not gate layout, so no flash. |
| `src/app/globals.css` | **modified** | Add `@theme` tokens (§7) + a single `@layer components` block holding all §3.3 `grid-template-areas` templates + the §5.3 LCD rules (avoids arbitrary-variant class sprawl). |
| `src/app/page.tsx` | **modified** | Keeps both hooks mounted, routes `active` by family, renders `<CalcShell>` with region children. Drops `AutoScale`, `Faceplate`, the hand-rolled drawer ([`page.tsx:80-98`](../src/app/page.tsx)), **and the dead `wide`/`orientation` branch** ([`page.tsx:24,53,74`](../src/app/page.tsx)). |
| `src/components/calculator/models.ts` | **modified** | `ModelBase` gains **required** `geometry: KeyboardGeometry` (breaking — see the interface note below) and **retires `orientation`**. |
| `src/components/calculator/models.generated.ts` / `scripts/gen-models.ts` | **modified** | Emit computed `KeyboardGeometry` for voyager models from `mapping.json`; authored models via `computeKeyboardGeometry` over their rows. |
| `src/components/calculator/RplKeyboard.tsx` | **modified** | Flex rows → equal-`1fr` grid with column/row spans. **Fixes the confirmed ~1.9× stretch** ([`RplKeyboard.tsx:54-88`](../src/components/calculator/RplKeyboard.tsx)). Legend sizes → `cqmin`/tokens. |
| `src/components/calculator/Keyboard.tsx` | **modified** | Keep 10×4 grid; drive cols/rows/gap from `model.geometry`; drop the `minmax(2.75rem)` floor ([`Keyboard.tsx:49`](../src/components/calculator/Keyboard.tsx)) for pure `1fr` inside the fitter. |
| `src/components/calculator/ClassicKeyboard.tsx` | **modified** | Flex rows → spanned `1fr` grid (ENTER double-width + dual-pitch digit spans uniform). |
| `src/components/calculator/CalcKey.tsx` | **modified** | Replace inline `rowSpan/gridRow` ([`CalcKey.tsx:66-73`](../src/components/calculator/CalcKey.tsx)) with `grid-column/row: span` props; tokenize `min-h` and legend sizes. |
| `src/components/calculator/Display.tsx` | **modified** | Interface source-compatible. `@container/lcd`-driven default mode (drops `useMediaQuery`); single-line loses the tall hero reservation + duplicated stack; adds optional `showStack?`/`defaultMode?`; arbitrary `text-[..px]` → `--text-hp-lcd-*`. |
| `src/components/ui/sheet.tsx` | **new (CLI)** | shadcn Base-UI `Sheet`; backs mobile nav + aux drawer, replacing the hand-rolled `page.tsx:80-98` drawer. |
| `src/components/ui/dialog.tsx` | **new (CLI)** | shadcn `Dialog` for settings/about/import-export/reset modals. |
| `src/components/ui/sidebar.tsx` | **new (CLI, if base-nova ships it)** | Persistent sidebar; else compose `<aside>` from primitives + `Sheet` (§11 #9). |
| `src/components/calculator/Faceplate.tsx` | **removed** | The welded `w-[34rem]` nameplate+Display+Keyboard unit; dissolved into `KeyboardZone` + `LcdRegion`. |
| `src/components/calculator/AutoScale.tsx` | **removed** | The whole-faceplate transform scaler — the LCD↔keyboard weld / letterbox cause. Replaced by CSS grid + fitter. |
| `src/components/calculator/ModelPicker.tsx` | **unchanged** | Reused in `Topbar` (small) and sidebar header (large). |

**Retiring `model.orientation`.** `ModelBase.orientation` (`'portrait' | 'landscape' |
'wide'`, [`models.ts:62`](../src/components/calculator/models.ts)) overlaps the new
`geometry.aspectClass` (`'landscape' | 'portrait' | 'tall'`) and its `'wide'` value has no
`aspectClass` mapping. Two overlapping enums invite drift, so **`orientation` is retired**:
everything derives from `aspectClass`. Its only live consumer is the `wide` branch in
[`page.tsx:24,53,74`](../src/app/page.tsx) — and no model in `MODELS`
([`models.ts:108-113`](../src/components/calculator/models.ts)) sets `'wide'` today, so that
branch is already dead code. Removing the field and the branch is part of **Step 2** scope
(§9). Confirm at §11 #5.

**Interfaces — source-compatible / additive-only, with one deliberate breaking migration.**
The following interfaces' *shapes* are depended on across the app and stay stable:
`RpnState`, `DisplayProps`, `StackPanelProps`, `Family` (`Display.tsx`);
`Model`/`VoyagerKey`/`ClassicKey`/`RplKey` + `MODELS`/`MODEL_ORDER` (`models.ts`);
`RpnCalculator`/`Prefix` (`useRpnCalculator.ts`); `RplCalculator`/`RplPrefix`
(`useRplCalculator.ts`). `DisplayProps` gains only **optional additive props**
(`showStack?`, `defaultMode?`) — **source-compatible, not byte-identical**; existing call
sites compile unchanged. Both hooks stay mounted at page level; `page.tsx` routes the active
one by family and passes `prefix + onArm + onPress + fmt + renderLatex` to whichever keyboard
renders. **[fixed]**

**The one exception — `ModelBase.geometry` is a BREAKING interface change.** Adding a
**required** `geometry: KeyboardGeometry` field to `ModelBase`
([`models.ts:54-63`](../src/components/calculator/models.ts)) breaks every `Model` literal
and any external `Model` construction until populated — it is **not** "byte-identical" or
merely "additive". It is safe here **only** because all four `MODELS` entries are
generated/authored in-repo (`gen-models.ts` → `models.generated.ts` for voyager; authored
`rows` for classic/rpl) and are migrated **atomically in Step 0** (§9). If any consumer ever
constructs `Model`s outside the registry, make `geometry` optional with a
`computeKeyboardGeometry` fallback instead (§11 #6).

### 6.2 TypeScript interfaces

```ts
// src/lib/layout/breakpoints.ts — the single source of truth for width tiers.
// The §3.3 @media values (in rem) and Tailwind v4 --breakpoint-* mirror these px
// numbers; §10 asserts they never drift.
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export type WidthTier = 'phone' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export function widthTierOf(px: number): WidthTier;   // <640 phone · 640–767 sm · 768–1023 md · …
```

```ts
// src/lib/layout/keyboardGeometry.ts — pure, no React/DOM
// 'clamshell' is intentionally NOT in the production union: computeKeyboardGeometry
// cannot produce it from voyager|classic|rpl, so admitting it would make the type
// wider than any real model. It returns only when an HP-28 lands (§11 #3).
export type KeyboardAspectClass = 'landscape' | 'portrait' | 'tall';

export interface KeyboardGeometry {
  cols: number;      // max over rows of Σ(key column-span); double-WIDTH ENTER = 2, adds no column
  rows: number;      // max(row + rowSpan − 1); double-HEIGHT ENTER adds no row
  keyAspect: number; // k, base key w:h — per-family token
  gap: number;       // g, inter-key gap as a fraction of key width (~0.12)
  aspect: number;    // A_exact = (cols + (cols−1)g) / (rows/k + (rows−1)g)  → --kbd-a
  aspectClass: KeyboardAspectClass;  // per-model OVERRIDE allowed (§4.4, §11 #4), not raw threshold only
}

export function computeKeyboardGeometry(
  layout: { keys: VoyagerKey[] } | { rows: ClassicKey[][] } | { rows: RplKey[][] },
  family: Family,
): KeyboardGeometry;

export function keyboardAspect(g: Omit<KeyboardGeometry, 'aspect' | 'aspectClass'>): number;
export function aspectClassOf(aspect: number): KeyboardAspectClass;
```

> **Clamshell, kept honest.** If/when the HP-28 series ships, tag it with an explicit
> `ModelBase` flag (`clamshell?: true`) that makes `computeKeyboardGeometry` short-circuit to
> a dedicated two-panel geometry — do **not** derive `'clamshell'` from a threshold. Until
> then the union above omits it and §3.3's `clamshell` row is a deferred placeholder that
> falls back to `stack`. **Recommendation: defer the 28-series (§11 #3).**

```ts
// src/lib/layout/templates.ts — pure; drives data-* attrs + tests, NOT runtime layout.
// The seven ids are exactly the seven distinct §3.3 templates.
export type TemplateId =
  | 'stack'
  | 'phone-landscape'
  | 'tablet-portrait-wide'
  | 'tablet-portrait-corner'
  | 'desktop-landscape'
  | 'desktop-wide'
  | 'desktop-tall';

export type ChromeMode  = 'drawer' | 'sidebar';           // < lg vs ≥ lg
export type KbdPlacement =
  | 'bottom-full' | 'bottom-band' | 'bottom-right'
  | 'right-edge'  | 'right-side'  | 'left-of-lcd';

export interface LayoutTemplate {
  id: TemplateId;
  chrome: ChromeMode;
  kbdPlacement: KbdPlacement;               // the SAME value the shell stamps as data-kbd-placement
  regionsInline: Record<'aux' | 'sidebar', boolean>;       // false ⇒ rendered in a Sheet
}

// Single derivation used both to stamp data-* and to assert placement in tests, so
// the label can never disagree with the template chosen for that (aspectClass, tier).
export function computePlacement(aspectClass: KeyboardAspectClass, tier: WidthTier): LayoutTemplate;
```

```ts
// models.ts — geometry is REQUIRED (breaking; §6.1) and orientation is REMOVED.
interface ModelBase {
  id: string;
  name: string;
  sub: string;
  angle: boolean;
  clamshell?: true;               // reserved; only an HP-28 sets it (§11 #3)
  geometry: KeyboardGeometry;     // required; populated by gen-models / computeKeyboardGeometry
  // orientation: removed — derive from geometry.aspectClass
}
```

```ts
// KeyboardFitter.tsx
export interface KeyboardFitterProps {
  geometry: KeyboardGeometry;
  children: React.ReactNode;                 // the family keyboard grid
}
// CSS custom-prop bag written onto the box:
//   { '--kbd-a': number; '--kbd-cols': number; '--kbd-rows': number }

// CalcShell.tsx
export interface CalcShellProps {
  model: Model;
  topbar: React.ReactNode;  sidebar: React.ReactNode;
  lcd: React.ReactNode;     keyboard: React.ReactNode;  aux: React.ReactNode;
}

// Display.tsx / LcdRegion.tsx — additive, back-compatible (undefined preserves today's behaviour)
export type LcdMode  = 'line' | 'mini';
export type LcdForce = LcdMode | null;       // null ⇒ no data-lcd-force attr ⇒ container default
// DisplayProps gains:  showStack?: boolean;  defaultMode?: LcdMode;
```

---

## 7. `@theme` token additions

All added to the `@theme` block in [`src/app/globals.css`](../src/app/globals.css) — no
inline arbitrary values (AGENTS.md §2). This also replaces the ~11 arbitrary `text-[..px]`
values and the `639px` magic number in `Display.tsx`.

**Keyboard fidelity & sizing**

| Token | Purpose |
|---|---|
| `--calc-key-gap` | Inter-key gap, a `cqmin` value → uniform absolute gap on both axes. |
| `--calc-kbd-max-w` | Hard cap on keyboard width ("not comically large"). |
| `--calc-kbd-max-h` | Phone keyboard-band cap (default `68dvh`); also guarantees a determinate slot block-size so `cqb` resolves. |
| `--hp-key-aspect-voyager` (1.15) / `--hp-key-aspect-classic` (1.15) / `--hp-key-aspect-rpl` (1.10) | Per-family `k`. (`--kbd-a` itself is per-model **data**, not a global token.) |

**Shell / region layout**

| Token | Purpose |
|---|---|
| `--calc-topbar-h` | Top bar band height. |
| `--calc-sidebar-w` | Persistent sidebar width (`≥ lg`). |
| `--calc-toolstrip-h` | Phone bottom toggle strip (history/full-display toggles). |
| `--calc-region-gap` | Inter-region gap (replaces `page.tsx` `gap-3/gap-4`). |
| `--calc-panel-min-w` / `--calc-panel-max-w` | Aux panel bounds. |

**LCD**

| Token | Purpose |
|---|---|
| `--hp-lcd-aspect-mini: 4 / 3` | Mini multi-line box aspect. |
| `--calc-lcd-line-h` | Fixed single-line bar height. |
| `--calc-lcd-mini-min-h` | Container-height threshold at which `@container/lcd` switches to mini (§5.3). |
| `--hp-lcd-pad` | LCD inner padding (replaces `p-4`). |
| `--text-hp-lcd-hero` / `-value` / `-stack` / `-annun` / `-reg` | LCD type scale (Tailwind v4 `--text-*` → `text-hp-lcd-*` utilities), replacing the scattered `text-[9.5px]…text-[32px]`. |

**Preserve (must keep resolving):** `--radius-bezel` (14px, [`globals.css:86`](../src/app/globals.css)),
`--radius-key` (5px, [`globals.css:85`](../src/app/globals.css)), the `--color-hp-*`
faceplate/display palette, `--font-display` (dseg7), `--font-mono`, `--font-legend`
([`globals.css:22-24`](../src/app/globals.css)).

---

## 8. Requirement reconciliation

### 8.1 Requirements this system satisfies

- **FR-UI-1** (M) — large display: history + stack + KaTeX beyond single-line → mini 4:3 LCD + `AuxPanel`.
- **FR-UI-3** (M) — responsive mobile/tablet/desktop → §3.2 device matrix + §3.3 templates.
- **FR-UI-5** (S) — adhere to `@theme` tokens → §7.
- **FR-UI-8** (M) — secondary panels reflow/collapse behind a control on small screens → `AuxPanel` in a `Sheet` below `lg`.
- **FR-UI-9** (S) — collapsible LCD (single/two-line ↔ multi-line) → §5, container-driven.
- **FR-MODEL-5** (S) — annunciators → always-on status row in both LCD states.
- **FR-STK-1/2** (M) — RPN + RPL stacks → authoritative in `AuxPanel`, echoed in LCD.
- **FR-FIN-1** (M) — TVM registers → equation/variable panel in `AuxPanel`.
- **FR-EXP-2/5** (M) — named variables + history → `AuxPanel`.
- **FR-STATE-4** — export/import → surfaced via `CalcNav` (topbar hamburger / sidebar).

### 8.2 Requirement edits required (Definition of Done, AGENTS.md §7.7)

- **REVISE FR-UI-7.** Its "display, buttons, and fonts scale TOGETHER AS ONE UNIT" wording
  directly contradicts this decoupled design. Rewrite so **keyboard aspect fidelity is the
  primary constraint** and the LCD is sized/placed **independently**. Mirror the same edit
  in `plan/phase-01-engine-hp35.md` ("scales… as one unit").
- **ADD FR-UI-10** (M) — *Independent LCD placement & sizing by device class.* The LCD is
  placed after the keyboard and fills MOST of the remaining estate; top-half on tablet,
  top-left when the keyboard occupies the right side; scales independently of the keyboard.
- **ADD FR-UI-11** (M) — *Keyboard placement & anchoring by device class; aspect fidelity is
  top priority.* Phone = full bottom band with a toggle strip below; tablet = full-width or
  bottom-right; desktop = right edge (tall) / right side (portrait) / bottom band (landscape);
  keys never distorted; size capped ("not comically large").
- **ADD FR-UI-12** (M) — *Top bar + hamburger → persistent sidebar nav* exposing
  settings/about/state import-export/reset (surfaces FR-STATE-4).
- **EXTEND FR-UI-2** (already covers physical-keyboard input) — add the data-driven per-model
  `hotkey` map, the visual **press echo**, and the `?` cheat-sheet (§12.2). (The draft proposed
  a new FR-UI-13 for this before noticing FR-UI-2 exists.)
- **ADD FR-UI-13** (S) — *Armed-prefix plane highlighting.* Arming `f`/`g`/`ls`/`rs`
  brightens the matching legend plane and dims primary legends (§12.3).
- **ADD FR-UI-14** (S) — *Three-plane visual language* (extends FR-UI-5): desk / machine /
  glass material rules, warm shadows, pastel chrome accents, cqi-proportional legend type
  (§13).
- **EXTEND FR-UI-8/9** — the equation/variable region (TVM registers, named variables,
  equations) is a distinct reflowable panel, not LCD-embedded content.
- **CONSIDER** elevating **FR-UI-9 S → M**, since the collapsible LCD is now central to the
  responsive strategy rather than optional.

These are `prd.md` edits requiring editorial sign-off (§11 #10).

---

## 9. Phased rollout

Each step is independently shippable, ships its own tests, and passes the same
**Definition-of-Done gate**: `pnpm lint` ✓ · `pnpm build` ✓ (static export, base-path safe)
· `pnpm test` ✓ · `pnpm test:e2e` ✓ · strict TS (no new `any`/casts) · shadcn via CLI only.
Steps map onto the existing [`plan/phase-01-engine-hp35.md`](../plan/phase-01-engine-hp35.md)
responsive-framework deliverable (built once, reused by every model).

### Step 0 — Geometry core + tokens + shared breakpoints (no visual change)
- **Scope:** pure-TS `breakpoints.ts`, `keyboardGeometry.ts`, `templates.ts`; add `@theme`
  tokens (§7); add **required** `geometry` to `ModelBase`, **remove `orientation`**, and
  populate via `gen-models.ts` / `computeKeyboardGeometry` — **atomically**, so the build
  never sees a half-migrated `MODELS` (§6.1).
- **Files:** `src/lib/layout/breakpoints.ts`, `keyboardGeometry.ts`, `templates.ts`,
  `scripts/gen-models.ts`, `models.generated.ts`, `models.ts`, `globals.css`.
- **Tests (Vitest, no browser):** `keyboardAspect` for HP-12C ≈2.887, HP-35 ≈0.703, HP-48G
  ≈0.722 within `0.02`; `aspectClassOf` boundaries (incl. 0.68/1.30); `cols/rows` span rules
  (double-width vs double-height ENTER); `computePlacement` returns the right `LayoutTemplate`
  per `(aspectClass, tier)` **including the `sm` tier** (e.g. `widthTierOf(700) === 'sm'` →
  `stack`, `chrome:'drawer'`); `BREAKPOINTS` px match the documented §3.3 rem values.
- **Gate:** lint/build/test green; no e2e change (no UI yet).

### Step 1 — Keyboards on a uniform pitch grid (fixes 48G distortion)
- **Scope:** migrate `Keyboard`/`ClassicKeyboard`/`RplKeyboard`/`CalcKey` to `1fr` grid +
  spans consuming `model.geometry`, rendered as **plain `aspect-ratio: var(--kbd-a)` + equal
  `1fr` grids** — **no `cqi/cqb` fitter yet** (deferred to Step 2, which establishes the
  `container:size` slot; §4.3). Still inside the existing `Faceplate`/`AutoScale` (drop-in,
  keyboard only).
- **Files:** `Keyboard.tsx`, `ClassicKeyboard.tsx`, `RplKeyboard.tsx`, `CalcKey.tsx`.
- **Tests:** Vitest — keyboards render `cols×rows` cells, ENTER spans correct. Playwright —
  at a fixed viewport, HP-48G keyboard `boundingBox()` W/H within ~2% of `0.72` (regression
  guard against the 1.29:1 stretch); keys uniform.
- **Gate:** full DoD; visually verify 48G keys are square-ish (skill `next-browser`/`verify`).

### Step 2 — `CalcShell` grid + `KeyboardFitter` + decouple LCD (retire AutoScale/Faceplate)
- **Scope:** `CalcShell` with the enumerated §3.3 `grid-template-areas` (`@layer
  components`); the **`container:kbd/size` slot + contain-formula fitter** (§4.3);
  `KeyboardZone` + `LcdRegion` as siblings; `page.tsx` renders `<CalcShell>` and **drops the
  `wide`/`orientation` branch** (§6.1); delete `AutoScale.tsx` + `Faceplate.tsx`.
  `data-aspect` static; `useViewportTier` stamps `data-template`/`data-chrome`/
  `data-kbd-placement` post-mount (from `computePlacement`, §6.2).
- **Files:** `CalcShell.tsx`, `KeyboardFitter.tsx`, `KeyboardZone.tsx`, `LcdRegion.tsx`,
  `useViewportTier.ts`, `page.tsx`, `globals.css`, remove `AutoScale.tsx`/`Faceplate.tsx`.
- **Tests:** Vitest — `CalcShell` sets `data-aspect` from `model.geometry.aspectClass`.
  Playwright per viewport (§10) — keyboard placed bottom (phone) vs right (desktop),
  asserted by **geometry** (bounding-box position + W/H); **no vertical letterbox**; no
  horizontal overflow; **JS tier == CSS-active template at each boundary** (639/640, …).
  **New e2e flow (state retention):** enter a value on HP-12C, switch to HP-15C via
  `ModelPicker`, assert stack/registers retained **and** the correct keyboard/`data-aspect`
  renders (this rebuild re-parents `Display`, the change most likely to regress this).
- **Gate:** full DoD; verify no first-paint flash (§11 FOUC row).

### Step 3 — LCD container-driven collapse + content-ownership split
- **Scope:** `LcdRegion` `@container/lcd` + the §5.3 `data-lcd-force` override; `Display`
  default mode from container (drop `useMediaQuery`); single-line drops the tall hero
  reservation and gains the phone **two-line stack echo** (§11 #8); add
  `showStack?`/`defaultMode?`; tokenize `text-[..px]`. Stack becomes authoritative in
  `AuxPanel` (built minimal here), pinned **above history** (§12.5).
- **Files:** `Display.tsx`, `LcdRegion.tsx`, `AuxPanel.tsx`, `globals.css`.
- **Tests — Vitest vs Playwright boundary is crisp (jsdom has no layout engine and cannot
  evaluate `@container` queries):**
  - **Vitest/RTL (prop-driven only):** pass `defaultMode` explicitly and assert the tagged
    branch (`data-lcd-mode`) is present; assert the override logic — chevron toggle sets
    `data-lcd-force` to the expected value and `userExpanded===null` clears it. **No
    container-query assertions.**
  - **Playwright (real engine):** phone slot → line visible, desktop slot → mini visible;
    forcing via the chevron flips it; and **the KaTeX hero renders a `.katex` node in mini
    mode** (AGENTS.md §6 KaTeX flow).
- **Gate:** full DoD.

### Step 4 — Chrome: `Sheet` drawer + `CalcNav` + `Topbar`; persistent sidebar
- **Scope:** `pnpm dlx shadcn@latest add sheet dialog` (and `sidebar` if available, else
  compose `<aside>`); `Topbar` + `CalcNav`; migrate the hand-rolled `page.tsx:80-98` drawer
  to `Sheet` — **aux as a bottom sheet** (rounded top, grab handle, §12.4), **nav as a left
  sheet from the top-left hamburger** (§12.4); `hidden lg:flex` persistent sidebar.
- **Files:** `ui/sheet.tsx`, `ui/dialog.tsx`, (`ui/sidebar.tsx`), `Topbar.tsx`,
  `CalcNav.tsx`, `AuxPanel.tsx`, `page.tsx`.
- **Tests:** Playwright — `< lg` hamburger opens/closes `Sheet`; `≥ lg` persistent sidebar
  visible, no hamburger; import/export entry point present. RTL — `CalcNav` renders in both
  hosts.
- **Gate:** full DoD; confirm no hand-authored `ui/*`.

### Step 5 — Equation/variable/TVM panel + full device-matrix polish
- **Scope:** vars/eqn strip in `AuxPanel` (TVM `n/i/PV/PMT/FV`, named variables, equation
  list); tune `--calc-kbd-max-h/-max-w`, `tall`↔`portrait` threshold + per-model overrides
  against real viewports.
- **Files:** `AuxPanel.tsx`, `globals.css`, `Display.tsx` (register summary row in mini).
- **Tests:** Vitest — TVM registers render in aux for HP-12C. Playwright — full §10 matrix
  sweep green across all device classes for all 4 live models.
- **Gate:** full DoD; PRD/plan doc edits (§8.2) landed in the same change.

### Step 6 — Typing & polish pass (§12–§13)
- **Scope:** `useHotkeys` + the per-model `hotkey` map (optional field in
  `hp/mapping/mapping.json`, emitted by `gen-models.ts`); **press echo** (`data-pressed`
  reuses the active press style, §12.2); `?` shortcut cheat-sheet `Dialog`; `/` / `Cmd+K`
  model picker; the `Escape` ladder (disarm prefix → close overlay); **armed-prefix plane
  dim** in `CalcKey` (§12.3); the §13 finish — terracotta/salvia tokens + retinted chrome
  `--ring`, warm shadows (`--shadow-key*`, `--shadow-machine`), cqi legend tokens
  (`--text-key-*`), Voyager trim line, hit-slop halo, toolstrip placement of phone toggles.
- **Files:** `src/hooks/useHotkeys.ts` (new), `CalcKey.tsx`, `Keyboard*.tsx`, `Topbar.tsx`,
  `KeyboardZone.tsx`, `globals.css`, `hp/mapping/build_mapping.py` + `mapping.json`,
  `scripts/gen-models.ts`.
- **Tests:** Playwright — **physical-keyboard arithmetic** (`2 Enter 3 +` → `5.00`); typing
  `f` arms the prefix and the primary-legend plane dims (opacity assertion); `Escape` closes
  the bottom sheet; `?` opens the cheat-sheet; a physical keypress sets `data-pressed` on the
  matching on-screen key. Vitest — the hotkey map resolves per model; the alpha guard
  suspends letter shortcuts in RPL alpha mode; hotkeys ignored while the picker search has
  focus.
- **Gate:** full DoD; keyboard-only walkthrough (no pointer) completes an RPN calculation,
  a model switch, and a sheet open/close with visible focus at every stop.

---

## 10. Testing strategy across the device matrix

Deterministic, no network, mock observers where needed. **Geometry is the primary
correctness assertion; `data-*` attributes are convenience labels only** (a self-reported
label could pass while the real CSS layout is wrong, so it never stands alone).

**No-drift guarantee.** The CSS breakpoints (§3.3 `@media` values) and the JS `WidthTier`
thresholds are **both derived from `src/lib/layout/breakpoints.ts`** (and Tailwind's
`--breakpoint-*`), so they cannot silently diverge. `data-kbd-placement`/`data-template` are
stamped by the shell from `computePlacement` (§6.2) — the **same** function the tests assert
— never an independent CSS guess.

**Test hooks emitted by components:**
- `data-aspect` on shell (`landscape|portrait|tall`) — static.
- `data-template` / `data-chrome` / `data-kbd-placement` on shell — post-mount, from
  `computePlacement` (convenience labels).
- `data-lcd-mode` on each `Display` subtree (`line`/`mini`); `data-lcd-force` on `LcdRegion`
  (`line`/`mini`/absent).

**Vitest / RTL (pure + component; NO layout engine):** `keyboardGeometry`/`templates`/
`breakpoints` oracle (Step 0), including `widthTierOf(700) === 'sm'`; `CalcShell` attribute
stamping; `Display` **prop-driven** mode + the `data-lcd-force` override logic (§5.3);
`CalcNav` dual-host. Mock `matchMedia`/`ResizeObserver` for the SSR-safe hooks; assert the
deterministic SSR fallback then the post-mount value (mirror `useMediaQuery`'s `false → real`
contract — [`useMediaQuery.ts:8-18`](../src/hooks/useMediaQuery.ts) — no hydration mismatch).
**Container-query behaviour is never asserted here** — it moves to Playwright.

**Playwright per-viewport matrix** (extend [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts);
config runs `next dev`, `basePath ''`). For each `{viewport, model}`:

| Class | `page.setViewportSize` | Assert (geometry-first) |
|---|---|---|
| phone-portrait | 393 × 852 | keyboard `boundingBox()` at the bottom, W/H ≈ model aspect (±2%); no horizontal overflow; **no vertical letterbox** (kbd bottom within `--calc-toolstrip-h` of viewport bottom). Labels: `data-chrome=drawer`, `data-kbd-placement=bottom-full`. |
| large-phone / sm | 720 × 1024 | same `stack` layout as phone (keyboard bottom band); `data-template=stack`, `data-chrome=drawer`. |
| phone-landscape | 852 × 393 | keyboard height-bound on the right (bounding-box right edge), LCD to the left; `data-kbd-placement=right-side`. |
| tablet-portrait | 834 × 1112 | placement per aspect class (landscape→bottom band, portrait/tall→bottom-right); LCD top/top-left. |
| tablet-landscape | 1112 × 834 | keyboard right-side; sidebar visible; `data-chrome=sidebar`. |
| small-laptop | 1366 × 800 | keyboard right (tall→right-edge full height), width ≤ `--calc-kbd-max-w`; mini LCD visible. |
| large-desktop | 1680 × 950 | keyboard capped + centered in its slot; mini 4:3 LCD; aux shows history + stack + vars. |

**Aspect fidelity:** read `keyboard.boundingBox()` and assert
`|w/h − model.geometry.aspect| / aspect < 0.02` at every viewport.

**Boundary parity test:** at each width boundary — **639/640, 767/768, 1023/1024,
1279/1280, 1535/1536** — set the viewport to each side and assert the CSS-active template
(observed via the keyboard's real placement/geometry) matches the JS-stamped `data-template`.
This is the guard that the shared `breakpoints.ts` and the §3.3 media values stay in lock-step.

**Core-flow e2e (AGENTS.md §6):** (1) **model switch with state retention** — enter a value
on HP-12C, switch to HP-15C via `ModelPicker`, assert the stack/registers are retained and
the HP-15C keyboard/`data-aspect` render (Step 2 gate); (2) **KaTeX** — assert a `.katex`
node renders in the mini-mode hero (Step 3 gate); (3) **physical keyboard** — type
`2 Enter 3 +` on the physical keyboard and assert `5.00` (Step 6 gate, §12.2).

Poll for the shell's `data-template` (settled) before asserting to avoid racing first paint.
Run across chromium/firefox/webkit — no assertion depends on container aspect-ratio *queries*
(only units), so all engines behave identically.

---

## 11. Risks, mitigations, and open decisions

### 11.1 Risks + mitigations

| Risk | Mitigation |
|---|---|
| Container-query units unsupported / `cqb` collapses to 0 in an indeterminate slot | Use only `cqi`/`cqb` **units** (baseline 2026), never aspect-ratio queries; every §3.3 template gives the keyboard slot a determinate block-size (`100dvh` shell, definite track) so `cqb` never resolves to 0. |
| **LCD `@container/lcd` won't fire deterministically** | Every template gives the **LCD cell** a determinate block-size (a definite grid track under the `100dvh` shell — never content-sized), and `LcdRegion` uses `container:lcd/size`. This is the same cqb-determinacy discipline applied to the keyboard, now stated for the LCD too. |
| First-paint flash / hydration mismatch on static export | Layout is chosen from CSS media tier × static `data-aspect` (both SSR-known); JS `data-template`/`data-chrome`/`data-kbd-placement` are test-only labels and don't gate layout. No `ResizeObserver`, no opacity-gated blank paint. |
| **FOUC from web fonts / KaTeX** (removing AutoScale's `opacity: fit.ready ? 1 : 0` reveal, [`AutoScale.tsx:71`](../src/components/calculator/AutoScale.tsx), drops the anti-FOUC guard) | The dseg7 LCD font (`--font-display`) is loaded via `next/font` ([`globals.css:24`](../src/app/globals.css)) — self-hosted, so no network flash; **confirm `font-display: swap` and a metrics-matched fallback** so a late dseg7 face swaps without layout shift. KaTeX renders **synchronously at first render**: `renderLatex(s.latex)` returns `{__html}` injected via `dangerouslySetInnerHTML` ([`Display.tsx:132-135`](../src/components/calculator/Display.tsx)) during render, not post-mount — so ensure `katex/dist/katex.min.css` is imported in the app shell so the markup is styled on first paint. |
| Naïve aspect box distorts keys in height-bound slots | Use the `min(100cqi, 100cqb·A, cap)` contain formula, not `width:100%; max-height:100%` (§4.3). |
| RPL/Classic keyboards regress when moved to `1fr` grid | Playwright aspect-fidelity guard (48G ≈0.72) added in Step 1 before decoupling. |
| Dual-pitch models (~15% aspect error) | Pin live-model `k` to real `hp/layouts/*` photos; render digit keys with `>1` column-span. |
| Required `geometry` field breaks build mid-migration | Land `ModelBase.geometry` + `gen-models.ts` population **atomically in Step 0**; it is a breaking change, safe only because all `MODELS` are in-repo (§6.1). |
| shadcn `sidebar` may not exist in base-nova | Verify with the CLI before relying on it; else compose `<aside>` from primitives + `Sheet` (never hand-author `ui/*`). |

### 11.2 Open decisions (need the user's sign-off before coding)

> **Decisions log (2026-07-11).** Product calls settled with the user so far:
> **#7 → RESOLVED:** phone keyboard band cap = **`68dvh`** (keyboard claims up to ~⅔ of the
> phone's height; LCD + bottom toggle strip take the rest). Tunable on a real 393×852 device
> during Step 5, but `--calc-kbd-max-h: 68dvh` is the confirmed starting default.
> **#8 → RESOLVED:** on a phone with the single-line LCD and the aux drawer closed, the LCD
> **grows to 2 lines and echoes the top of the stack** so Y/Z/T are never fully lost —
> i.e. `showStack` defaults **on** in the single-line state (`defaultMode="line"` renders a
> 1–2 line stack echo).
>
> **Design review (Fable, 2026-07-11).** The user authorised intent amendments and delegated
> the usability/aesthetic calls; §12–§13 record them. Intent changes: phone aux is a
> **bottom sheet** (was side drawer); the hamburger anchors **top-left** with a left nav
> sheet; **stack ordered above history** in aux; **physical-keyboard input** added as a Must
> (FR-UI-13) with press echo; **armed-prefix plane highlighting** added (FR-UI-14); visual
> language *"an HP machine on an Olivetti desk"* adopted (FR-UI-15). This resolves **#1, #2,
> #4, #5, #9** below and narrows **#10**; only **#3, #6, #10 (wording pass), #11** remain
> genuinely open.

1. **Grid-template authorship sign-off (§3.3).** ✅ **RESOLVED — templates confirmed** (design
   review): all seven pass the §12.1 diagonal-principle audit (LCD top/top-left, keyboard
   bottom/right, aux adjacent to the LCD, chrome at the perimeter). Only tuning during
   Step 5 remains.
2. **The `sm` band (640–767px) template.** ✅ **RESOLVED — reuse the phone `stack` template**
   (design review): reach ergonomics don't change until a device is held two-handed; a
   640–767px portrait device is still a thumb-zone device.
3. **Clamshell HP-28C/28S.** Genuinely two keyboard blocks (L 6×6 + R 5×7) under one
   display; the single-`KeyboardFitter` model does not cover it, and `'clamshell'` is kept
   out of the production union until then. **Recommend deferring the 28-series** (safe — not
   in the 4 live models); or approve building a two-panel `ClamshellZone` now.
4. **`tall` vs `portrait` threshold (`A ≤ 0.68`) + per-family `k`.** ✅ **RESOLVED** (design
   review): `aspectClass` is a **per-model override** with the threshold as fallback —
   placement is a deliberate choice, never a threshold artifact. The `k`-pinning pass
   against real `hp/layouts/*` faceplate photos is **approved** and lands in Step 1
   (proportion *is* the aesthetic — §13).
5. **Retire `model.orientation`.** ✅ **RESOLVED — retire it** (design review): derive
   everything from `geometry.aspectClass`; delete the `wide` branch in
   [`page.tsx:24,53,74`](../src/app/page.tsx) in Step 2.
6. **`geometry` required vs optional on `ModelBase`.** Required is cleaner/testable but is a
   breaking change that must land atomically with `gen-models.ts` in Step 0. Confirm the
   atomic migration (or choose optional + runtime fallback if `Model`s are ever constructed
   outside the registry).
7. **`--calc-kbd-max-h` phone band cap.** ✅ **RESOLVED — `68dvh`** (see decisions log
   above). Keyboard claims up to ~⅔ of phone height; re-tune on a real 393×852 device in
   Step 5 only if it reads wrong in practice.
8. **`showStack` on phone.** ✅ **RESOLVED — show a 1–2 line stack echo** (see decisions log).
   The single-line LCD grows to 2 lines and echoes the top of stack when the aux drawer is
   closed, so Y/Z/T stay visible without opening the drawer.
9. **`ui/sidebar` availability.** ✅ **RESOLVED** (design review): still verify the CLI first
   (AGENTS.md §2), but the `<aside>`-compose fallback is **pre-approved** — the sidebar is a
   styled desk panel (§13.1) either way, so the stakes are low.
10. **PRD / plan reconciliation.** **Narrowed:** the FR set is approved in substance (revise
    FR-UI-7; add FR-UI-10/11/12 **and FR-UI-13/14/15**; extend FR-UI-8/9; elevate FR-UI-9
    S→M). What remains is the editorial wording pass on `prd.md` / `plan/phase-01`, landed
    with Step 5 per §9.
11. **Vitest-vs-Playwright test boundary.** jsdom cannot evaluate container queries, so all
    container/layout-driven assertions move to Playwright (§10) — heavier CI time in exchange
    for real-engine correctness. Confirm the tradeoff.

---

## 12. Interaction & usability rules (design review, 2026-07-11)

The placement matrix (§3) says *where* things go; this section codifies *why*, and adds the
interaction rules a real user needs. Where a rule amends the original intent spec, it is
marked **[intent change]** (authorised by the user in the 2026-07-11 design review).

### 12.1 The diagonal principle **[fixed]**

**Eyes read top-left; thumbs act bottom-right.** Results and status live toward the top-left
(the primary optical zone — we scan for information there first); controls gather toward the
bottom-right (the reach zone — thumb arc on touch devices, dominant hand on desks). Every
template in §3.3 must respect the diagonal:

- **LCD** anchors top or top-left in every template — never below or right of the keyboard.
- **Keyboard** anchors bottom or right in every template — never top or left.
- **Aux** (stack/history/vars) sits *between* them along the diagonal, always adjacent to the
  LCD (it is information, an extension of the display), never to the right of the keyboard.
- **Chrome** hugs the perimeter; the rarer the action, the further from the thumb zone.

This is also exactly how the physical calculators are laid out (display above keys), so the
ergonomic rule and the device metaphor agree. The §3.3 proposed-default templates all pass
this audit — which is why they are now **confirmed** (§11 #1).

### 12.2 The physical keyboard is a first-class input **[intent change — addition]**

A laptop/desktop user will not mouse-click 40 on-screen keys; they will type. Rules:

- **Global hotkey layer** (`useHotkeys`, SSR-safe): keystrokes dispatch through the *same*
  model-adapter path as pointer presses. Captured at the document level whenever focus is
  not in a text input or dialog (the `ModelPicker` search box must keep receiving keys).
- **Data-driven map:** [`hp/mapping/mapping.json`](../hp/mapping/mapping.json) gains an
  optional `hotkey` field per function; the starter map for the live models **[judgment]**:
  digits `0–9` `.`, operators `+ − * /`, `Enter` = ENTER, `Backspace` = CLx / DROP,
  `e` = EEX, `n` = CHS/±, `x` = x⇄y, `r` = R↓, and — the delightful one — literal **`f`** and
  **`g`** arm the Voyager prefixes ( `[` / `]` for RPL left/right shift). `Escape` disarms an
  armed prefix first; if none, it closes the open sheet/dialog. `/` or `Cmd/Ctrl+K` opens the
  model picker with search focused. `?` opens a shortcut cheat-sheet (`Dialog`) generated
  from the live model's map — no drift.
- **Press echo:** a physical keypress **visually depresses the matching on-screen key**
  (reuse the `active:` press style via a ~120ms `data-pressed` state). Type `7` and watch the
  7 key go down — the typewriter feel, and instant confirmation the keystroke landed.
- **Alpha guard:** when an RPL model is in alpha-entry mode, letter keys type letters;
  shortcuts that collide with `A–Z` are suspended until alpha is disarmed.
- **Focus:** on-screen keys get a visible `:focus-visible` ring (§13.4 — the current
  `focus-visible:brightness-110` on [`CalcKey.tsx:14`](../src/components/calculator/CalcKey.tsx)
  is near-invisible); sheets/dialogs trap focus (Base UI default) and return it on close.

### 12.3 Modal state is always visible **[fixed]**

HP calculators are shift-heavy modal machines; the display must always answer *"what will
this key do right now?"* [`CalcKey.tsx:88-114`](../src/components/calculator/CalcKey.tsx)
already glows the armed legend — extend it to a **plane shift**: when `f` is armed, every
gold legend brightens to full **and every primary legend dims to ~40%** (and vice-versa for
`g`/`ls`/`rs`). One glance shows the entire active key plane — a genuine improvement over
the physical device that stays faithful in spirit. The armed prefix also stays mirrored in
the LCD annunciator row (already true).

### 12.4 Touch ergonomics **[partly intent change]**

- **Phone aux = bottom sheet, not side drawer** **[intent change]**: its toggle lives in the
  bottom toolstrip, so the content must arrive where the gesture happened — a `Sheet
  side="bottom"` (rounded top, grab handle, swipe-down to dismiss, `max-h` ≈ `70dvh`), fully
  in thumb reach. Side drawers are for navigation (the hamburger), not for glanceable data.
- **Toolstrip is the phone's action bar:** history/stack sheet toggle + LCD expand mirror
  live in the `--calc-toolstrip-h` strip *below the keyboard* — the most reachable pixels on
  the device. The top bar keeps only rare actions (brand, model picker, hamburger).
  **[implementation note, Step 6]:** deferred — the §3.3 templates (the buildable spec) have
  no toolstrip row, and a 52px strip would come straight out of the phone's LCD estate. The
  toggles live in the topbar for now; revisit if real-device use shows the reach cost matters.
- **Hamburger anchors top-LEFT** **[intent change]**, matching the persistent desktop
  sidebar's left position — the same mental location at every size. Model picker stays
  top-right. Its nav `Sheet` slides from the **left** for the same reason.
- **Touch-target honesty:** a 10-column Voyager at 393px yields ~35px key pitch — below the
  44px HIG floor but almost exactly the *real* 12C key width (~9–10 mm). Fidelity wins
  (Priority 1); compensate invisibly: (a) each key gets a **hit-slop halo** (an `::after`
  inset expansion) so the tap target is ≥ 44px even where the visual key is smaller; (b) the
  phone-landscape override (§3.3) gives landscape models a near-fullscreen fit — worth a
  one-time rotate hint **[judgment]**; (c) `--calc-key-gap` has a floor so keys never fuse.
- **Handedness:** the bottom-right bias favours right-handed users. A future `handedness`
  preference could mirror the corner templates (aux ↔ keyboard). Logged as a *Could* — not
  in scope now.

### 12.5 Information scent — where the leftover components live **[intent change — ordering]**

- **Stack above history** in `AuxPanel` — the stack is live working memory, glanced at every
  keystroke; history is an archive, scrolled occasionally. Today's `StackPanel` renders
  History first and the stack below ([`Display.tsx:263-313`](../src/components/calculator/Display.tsx))
  — **flip it**: stack pinned at the top (nearest the LCD, per §12.1 proximity), history
  scrolls away beneath it, newest entry first.
- **History reads as tape:** mono type, `op → result` rows, hairline separators — the
  adding-machine tape, restyled (§13.6). Newest-first wins over strict tape order (no
  scrolling to see the latest).
- **TVM / variables** pin as a chip row directly under the stack for finance models —
  glanceable without opening anything (satisfies FR-FIN-1 at a glance, not a dig).
- **Empty states stay quiet:** the existing `( empty stack )` mono microcopy is the right
  register — no illustrations, no exclamation marks.
- **Every collapsible obeys "toggle where the content appears":** toolstrip → bottom sheet;
  LCD chevron → inside the LCD; hamburger (left) → left nav sheet; sidebar is its own
  always-visible answer.

### 12.6 Preferences persist **[fixed]**

`userExpanded` (the LCD force), the last selected model, and (later) handedness persist via
the planned persistence layer (FR-STATE, [`docs/architecture.md`](architecture.md) §9) and
restore on load. A restore that only re-applies user intent (`data-lcd-force`) cannot cause
a layout *correctness* flash — the CSS default remains valid until it lands.

---

## 13. Visual design language — *an HP machine on an Olivetti desk*

The aesthetic brief: **Olivetti Programma 101 / typewriter warmth, HP instrument fidelity.**
The faceplate is the machine — its colours are semantic and sacrosanct. Everything around it
is the *desk* — warm, Italian, quietly confident. Happily, the existing palette already
leans this way (cream `#e6e3da` desk, olive-sage LCD `#c1cbaa`, graphite dark chassis —
[`globals.css:89-198`](../src/app/globals.css)); this section codifies it and finishes it.
The decoupled layout even earns the metaphor: LCD and keyboard become **two modules of one
instrument** — very Programma 101, itself a modular console — sitting together on the desk.

### 13.1 Three material planes **[fixed]**

Regions are distinguished by **material, not borders**. Each plane has exactly one elevation
treatment; planes never share a background colour.

| Plane | Surfaces | Material rules |
|---|---|---|
| **Desk** | page background, topbar, sidebar, aux cards | Matte cream (`--background`, `--hp-panel`); hairline `border-border` dividers; `shadow-sm` at most; generous whitespace. |
| **Machine** | keyboard bezel **and** the LCD's slim frame | `--hp-bezel` family; `--radius-bezel`; the **only elevated objects** — one soft, *warm* shadow each (`--shadow-machine`), like instruments under studio light. The LCD keeps a thin machine frame so both modules read as one instrument, not a floating web panel. |
| **Glass** | the LCD surface itself | Inset (existing inner shadow is right), luminous sage; the only plane allowed glow effects (annunciators, armed-prefix). |

### 13.2 Faceplate fidelity **[fixed]**

On the machine plane, HP semantics are untouchable: gold `f`, blue `g`, purple/green RPL
shifts, key tones per model data (`--color-hp-*`,
[`globals.css:56-76`](../src/app/globals.css)). No pastel, no chrome accent, ever, on the
faceplate. The Voyager **silver trim line** returns as a double hairline (outer
`--hp-bezel-border` border + 1px inset ring) around the bezel — the detail that makes a
12C read as a 12C.

### 13.3 The chrome palette — pastel accent pair **[judgment]**

Two named pastels, used **only on the desk plane**:

- **Terracotta** (`--color-terracotta`, softened Valentine red ≈ `#c96f5a` light /
  `#e08a7a` dark — the destructive family already sits nearby): *the* interactive accent —
  active toggles, focus rings, sheet grab handles, links. Warm, Italian, unmistakably "app".
- **Salvia** (`--color-salvia`, the LCD sage lifted into chrome): informational accents —
  history op chips, stack-level tags, section micro-labels' hover state. It quietly rhymes
  the chrome with the glass.

Restraint rules: at most one pastel per surface; gold stays reserved for the brand wordmark
and `f`-shift semantics (today `--ring` is gold — **retint chrome focus to terracotta** so
HP semantics and app chrome never blur); powder blue remains `g`-shift only.

### 13.4 Key sculpting & press mechanics **[fixed]**

The current cap-step shadow (`0_2px_0 …` on [`CalcKey.tsx:14`](../src/components/calculator/CalcKey.tsx))
is the right instinct — tokenise and finish it:

- `--shadow-key`: 1px inset top highlight (molded cap) + the cap step + a soft **warm** drop
  (today's `rgb(0 0 0/0.35)` is cold — swap to `--color-shadow-warm`, a brown-black).
- **Press** = the step collapses (`0_1px_0`) + `translate-y-0.5` (existing) + 50ms ease —
  mechanical, not animated. `prefers-reduced-motion` degrades to a colour change only.
- **Hover** (pointer devices): `brightness-[1.03]` lift — barely there.
- **Focus-visible**: 2px terracotta ring, 1px offset — replaces the invisible `brightness-110`.
- **ENTER** carries the strongest cap step — it is the hero key of an RPN machine.
- Radius stays `--radius-key` (5px — Voyager keys are near-square); a per-family radius is a
  *Could*, not now.
- Optional flourish **[judgment, Could]**: `navigator.vibrate(8)` on touch keypress —
  typewriter tactility as progressive enhancement.

### 13.5 Legend typography — finesse over size **[fixed]**

The keyboard is a `container-type: size` context (§4.3), so legends scale with key pitch by
construction — never per-breakpoint font juggling:

- `--text-key-primary` ≈ `2.8cqi` and `--text-key-shift` ≈ `1.6cqi`, each with a `max(…, floor)`
  so legends stay legible at phone pitch. These replace the hardcoded `text-[15px]` /
  `text-[8.5px]` ([`CalcKey.tsx:91,100`](../src/components/calculator/CalcKey.tsx)).
- **Optical, not geometric, centring:** `leading-none` + balanced padding when f/g legends
  are present (the existing `pt-2.5`/`pb-2` asymmetry is correct — keep it deliberate).
- **Worded legends** (AMORT, PRICE, SOLVE) set in tracked small caps (`tracking-wide`);
  mathematical symbols left untracked. Legends **never wrap or ellipsize** — the cqi scale
  guarantees proportional space.
- **Numerals are tabular** (`tabular-nums`) everywhere digits align: LCD, stack, history.
- The **nameplate** is the machine's badge: `HEWLETT·PACKARD` micro-tracked small caps left,
  the model number set black and confident at right — already correct in spirit; tokenise
  the sizes (`--text-nameplate`).

### 13.6 Micro-detail checklist **[fixed unless noted]**

- Warm shadows everywhere on the desk (`--color-shadow-warm` ≈ `rgb(42 40 35 / 0.25)`) —
  sunlight, not fluorescent office.
- Bottom sheet: `rounded-t-2xl`, a 32×4px `rounded-full` muted grab handle, backdrop
  `bg-foreground/20`.
- Annunciators: 40%-opacity off-state (existing), full + subtle glow when hot — glow only on
  the glass plane.
- Hairline dividers (`border-border`), never 2px+; section labels in 10.5px tracked
  uppercase mono (the existing `StackPanel` header style is exactly right — codify it).
- Sheet/dialog motion 150–200ms ease-out; key presses 50ms; all motion respects
  `prefers-reduced-motion`.
- Dark mode ships as the **graphite chassis** variant (already drawn,
  [`globals.css:146-198`](../src/app/globals.css)): espresso desk, same instrument.

### 13.7 Token additions (extends §7) **[fixed]**

| Token | Purpose |
|---|---|
| `--color-terracotta` / `--color-terracotta-fg` | Chrome interactive accent (§13.3); retints `--ring` for app chrome. |
| `--color-salvia` | Chrome informational accent echoing the LCD sage. |
| `--color-shadow-warm` | Warm shadow tint for desk + machine shadows. |
| `--shadow-key` / `--shadow-key-active` | Key cap-step + warm drop; collapsed press state (§13.4). |
| `--shadow-machine` | The single elevation treatment for the two machine modules (§13.1). |
| `--text-key-primary` / `--text-key-shift` / `--text-nameplate` | cqi-proportional legend scale with floors (§13.5). |

---

## 14. v2 — The integrated machine (design review 2, deployed-app feedback)

**User verdict on v1 (2026-07-11, deployed):** buttons good, LCD good — but *"the LCD
display and the keyboard are often disconnected, breaking the illusion that this is a
calculator."* v2 re-integrates nameplate + LCD + keyboard into ONE machine bezel, and turns
the aux content into honest paper. This section supersedes §3.3's template set and the
diagonal-split reading of §12.1 (information and action still cluster coherently — but the
machine is one object, never split across the screen).

### 14.1 The MachineUnit **[fixed]**

One component, one bezel, four internal grid areas (`nameplate / lcd / aux / keyboard`)
reflowed purely by CSS between two variants — same DOM, no JS branching:

- **`stack`** (the default, everywhere it keeps keys usable): nameplate → LCD → keyboard,
  top to bottom — the real calculator anatomy. The LCD row is the flexible remainder
  (line ↔ mini via the existing container query); the keyboard keeps its aspect. Unit
  width = `min(100cqi, (100cqb − overhead) × A, cols × pitch-cap)` — the §4.3 contain
  formula lifted from the keyboard to the whole machine.
- **`side`** (only when stacked would crush the keys — portrait/tall models on SHORT
  viewports, `max-height: 34rem`): left column = nameplate over LCD (aux paper tucked
  below, §14.3), right column = keyboard at full height. Still one bezel — a desktop
  machine (HP-97 posture), not two panels.

Variant selection is per aspect-class × height media query — SSR-known, no flash. The
landscape Voyagers stack at every size (their stacked pitch never drops below ~60px);
this is also simply *what a real 12C looks like*: display above keys.

### 14.2 Page templates v2 (supersede §3.3's seven) **[fixed]**

| Template | Where | Areas |
|---|---|---|
| `stack` | `< md` | `topbar / machine` — aux via individual sheets (§14.3) |
| `machine-side` | any width, `max-height: 34rem` landscape | `topbar / machine(side)` — aux inside the machine's left column |
| `tablet` | `md`, aspect portrait/tall | `topbar / aux ∣ machine` — paper column LEFT, machine right |
| `tablet-wide` | `md`, aspect landscape | `topbar / machine / aux-row` — machine stacked, tape ∣ notes below |
| `desktop` | `≥ lg` | `sidebar ∣ topbar / sidebar ∣ machine ∣ aux` — machine right of the sidebar, paper column RIGHT |

No template ever separates the LCD from the keyboard. `data-kbd-placement` labels retire in
favour of `data-machine="stack∣side"`.

### 14.3 Paper, not glass — the aux components **[fixed]**

History, stack, and variables become three SEPARATE components with individual toggles when
hidden (three topbar chips below `md`, each opening its own bottom sheet):

- **`HistoryTape`** — a printing-calculator paper trail: narrow near-white strip, mono
  figures right-aligned, faint row rules, a perforated bottom edge; newest at top, older
  entries scrolling away like spooled tape. Clean, not skeuomorphic.
- **`StackNote` / `VarsNote`** — notebook note cards: warm paper card, ruled hairlines,
  small tracked caption, mono values. Explicitly NOT LCD-styled — no glass green, no
  segment font.

Arrangement: desktop → right column (notes on top, tape below, printing downward); tablet →
left column; tablet-wide → a row beneath the machine; side machine → tucked below the LCD in
the machine's left column (paper resting on the machine body).

### 14.4 Rhythm & cosiness pass **[fixed]**

One spacing rhythm across chrome and machine (`--calc-region-gap` everywhere, consistent
panel padding/radius), aux columns top-aligned with the machine, no orphaned dead zones at
any (model × viewport) cell. Cozy, not tight; professional with Italian whitespace.

### 14.4b Revision 3 (user feedback on v2)

- **Desktop portrait/tall machines are SIDE-BY-SIDE** — the HP-48G is the
  classic case: stacked on a desktop squeezed its LCD to the line state, while
  side-by-side gives the tall keyboard full height AND a proper multi-line
  glass. The paper (tape, vars) lives in the machine's bay below the glass;
  the page's right aux column is dropped for these models. Landscape machines
  keep stacking (display-above-keys IS the Voyager); tablets stay stacked
  (portrait orientation has the height).
- **One home for the stack** — never on the LCD and on paper at once. RPN
  families: the paper StackNote owns the stack wherever it is in-plane (md+
  aux or the bay); the mini LCD then shows hero + annunciators only (the
  `.lcd-stack` block hides via CSS). RPL: the glass IS the stack display —
  authentic to the 48G — so RPL models get no paper StackNote and no stack
  toggle chip.

### 14.4c Revision 4 — RPL glass is a dot matrix

The HP-48's display is a **131×64 pixel matrix**, never a segment readout. RPL
machines therefore render their glass numerals in a 5×7-style pixel font
(Silkscreen, `--font-lcd-dot`) while the segment families keep DSEG7; the RPL
mini glass takes the real `131 / 64` aspect (`--hp-lcd-aspect-rpl`). That
raster is also the recorded target for the future dot-grid simulation — plots
and PICT rendering draw into exactly this grid.

### 14.5 Clamshell note (HP-28, still deferred)

When the 28-series lands: large displays render the two keyboard halves side by side under
one lid (the real posture); phones stack the halves vertically. The MachineUnit grid gains a
second keyboard area then — no new machinery needed.

### 14.6 Rollout — Steps 7–9

- **Step 7 — MachineUnit.** Build the integrated bezel (both variants, pure-CSS reflow);
  rewrite the page templates to `topbar/sidebar/machine/aux`; retire the split lcd/keyboard
  regions; update templates.ts + placement e2e (machine-box assertions: nameplate, LCD and
  keyboard inside ONE bezel rect). Gate: full DoD.
- **Step 8 — Paper aux.** HistoryTape + StackNote + VarsNote (+ per-component toggles and
  sheets below md); TVM chips move into VarsNote; wire the four arrangements. Gate: full DoD.
- **Step 9 — Rhythm.** Spacing/alignment audit across all 4 live models × 6 viewport
  classes (screenshot sweep), whitespace fixes, final tuning. Gate: full DoD + visual matrix.
