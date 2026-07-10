# HP Calculators — Research Reference for hellocalc

Fact-checked research compiled to support building a faithful HP-calculator emulator
([the project README](../README.md)). Every finding below survived a 3-vote adversarial
verification pass (2/3 refutations kill a claim). Confidence and source quality are
noted per finding.

## What's in this folder

| Path | Contents |
|---|---|
| [README.md](README.md) | This synthesis — history, RPN/stack model, feature sets, caveats |
| [FINDINGS.md](FINDINGS.md) | The 11 verified claims with quotes, sources, and vote tallies |
| [SOURCES.md](SOURCES.md) | Full source & documentation catalog (where the manuals live) |
| [manuals/](manuals/) | **21 downloaded owner's handbooks / user guides** (PDF), one per landmark model + `manifest.tsv` |
| [layouts/](layouts/) | **Per-model keyboard layouts** — key grids with primary + shifted legends and shift colors ([index](layouts/README.md)) |
| [functions/](functions/) | **Per-model function/command sets** — categorized catalogues with access and descriptions ([index](functions/README.md)) |
| [mapping/](mapping/) | **Master key→function mapping** joining model · button (incl. prefixed) · function · manual page — as CSV + JSON ([schema](mapping/README.md)) |

> **Update:** the original research pass produced this synthesis + a documentation map.
> Follow-up passes then **downloaded 21 manuals** into [manuals/](manuals/),
> **extracted key-by-key keyboard layouts for all 21 models** into [layouts/](layouts/),
> and **catalogued each model's function/command set** into [functions/](functions/) —
> closing the HP-41 / HP-48 coverage gap noted below. Layouts and function tables were
> transcribed from the scanned manuals (keyboard diagrams and function-index pages); a
> few illegible cells are marked `[?]`, and function descriptions are paraphrased with
> exact legends preserved.

---

## Executive summary

For building a faithful HP calculator emulator, the strongest, best-sourced material
clusters into four areas:

1. **Documentation is abundant and centralized.** `literature.hpcalc.org` (linked from
   hpcalc.org as "All HP Calculator Manuals") catalogs owner's handbooks,
   quick-reference guides, applications/solutions books, and service/training manuals
   across the full model range (HP-21 through HP Prime). `hpmuseum.org` hosts a
   ~1,700-document institutional Document Set including original manuals for the HP-35,
   HP-41C/CV, HP-42S, and HP-48SX. `hpcalc.org/hp48/docs` hosts the 764-page HP 48G
   Advanced User's Reference and 612-page User's Guide.

2. **RPN stack behavior is precisely documented.** Standard HP RPN models use a fixed
   four-level `X/Y/Z/T` stack (only X shown) plus a separate `LAST X`, with
   well-specified ENTER / stack-lift / drop semantics. The RPL-based HP-28/48/49/50g use
   an unlimited dynamic stack with different ENTER behavior.

3. **The Voyager keyboard/color convention is confirmed from primary handbooks.** White
   primary legend on the key face, **gold `f`-shift** functions printed *above* the key,
   **blue `g`-shift** functions on the *lower* key face, with `f`/`g` annunciators.

4. **Feature sets for the HP-15C and HP-12C Platinum are confirmed from primary sources**
   — complex numbers, matrices, SOLVE, integration, 67 registers (15C); RPN/ALG modes and
   the five-quantity TVM model `n, i, PV, PMT, FV` (12C Platinum).

Landmark history (HP-35 as first pocket calculator with transcendental functions;
HP-41C's alphanumeric display and expansion ports; HP-12C as longest-running model; the
Classic/Woodstock/Topcat/Voyager family taxonomy) is well corroborated.

---

## Key facts for the emulator engine

### RPN stack model (classic RPN: HP-35/45/25/41/11C/12C/15C/16C/35s)

- **Fixed four-level stack:** registers `X, Y, Z, T`; only `X` is shown in the display.
- **Separate `LAST X` register** — holds the pre-operation X value; does **not**
  participate in stack lift/drop.
- **ENTER:** completes X and copies it to Y, lifting prior contents up
  (`X→Y, Y→Z, Z→T`; old T is lost).
- **Binary operation** (e.g. `+`): copy X→`LAST X`; compute `Y op X` → result into X;
  drop `T→Z`, `Z→Y` (T is *duplicated* — it stays in T as well).
- **Stack-lift disabled** (next digit entry overwrites X without lifting) immediately
  after: `ENTER`, `CLx`, `Σ+`, `g Σ-`.
- **Terminology caveat:** HP docs disagree on whether `LAST X` is a "5th register." HP's
  own 12C Platinum note calls the stack five registers `T/Z/Y/X/L`; most other docs treat
  `LAST X` as separate from a 4-level `T/Z/Y/X` stack. Same behavior either way — **model
  `LAST X` as not participating in lift/drop.**

### RPL stack model (HP-28, HP-48, HP-49G, HP-50g)

- **Object stack, dynamic/unlimited depth** (not fixed at four levels).
- **ENTER** places the number only in the *lowest* stack level (level 1), not into both
  X and Y as classic RPN does.
- Emulator implication: entry-mode and ENTER semantics must branch on classic-RPN vs
  RPL model.

### Voyager keyboard/color convention (HP-11C/12C/15C/16C, 12C Platinum)

| Element | Color / placement |
|---|---|
| Primary function | White, on the upper key face |
| `f`-shifted function | **Gold**, printed *above* the key |
| `g`-shifted function | **Blue**, printed on the *lower* key face |
| Active-prefix indicator | `f` or `g` annunciator lights in the display |

### HP-15C feature set (confirmed from primary handbook)

- Four-level RPN stack (`T/Z/Y/X`) + `LAST X`.
- **67 total registers**: 3 permanent + 64 allocatable between data and program storage,
  at 7 bytes/register (448-byte pool ÷ 7 = 64, + 3 = 67).
- **Complex-number mode** — a parallel real/imaginary four-level stack.
- Matrix operations, **SOLVE** root finder, numerical **integration**, hyperbolic trig +
  inverses, combinations/permutations, random-number generation.

### HP-12C Platinum (confirmed from official instruction manual)

- **Dual mode:** RPN and ALG (algebraic), selected via `f` then `RPN`/`ALG`, with a lit
  status indicator.
- **Time Value of Money** uses five financial registers/keys (also the physical top row):
  `n, i, PV, PMT, FV`.

---

## Landmark model history (for framing the model list)

- **HP-35 (1972)** — HP's first pocket calculator; world's first pocket calculator with
  transcendental functions.
- **HP-41C (1979)** — first HP calculator with an alphanumeric display, user-programmable
  key mappings, and four expansion ports. The **41CV** quintupled base memory; the
  **41CX** added a clock.
- **HP-12C (1981)** — longest-running HP calculator, still in production.

### Family taxonomy (useful for organizing emulated models)

| Family | Members |
|---|---|
| Classic Series | HP-35, HP-80, HP-45, HP-65 |
| Woodstock / Series 20 | HP-21, HP-25 |
| Topcat / Series 90 (desktop printing) | HP-91, HP-92, HP-97 |
| Voyager / Series 10 | HP-10C, HP-11C, HP-12C, HP-15C, HP-16C |

*(Family taxonomy is medium-confidence — corroborated across xnumber.com, Wikipedia, and
an HPCC 2023 paper, but from secondary sources.)*

---

## Caveats

- **Primary vs secondary sourcing.** Documentation locations, RPN/stack mechanics, the
  Voyager color scheme, HP-15C features, and 12C Platinum modes/TVM rest on **primary**
  sources (official HP handbooks + hpmuseum/hpcalc archive pages), each with unanimous
  3-0 verification. Landmark history and family taxonomy rest on **secondary** sources
  (Wikipedia, xnumber.com) that were independently corroborated but are not primary
  manuals.
- **Access friction.** Several primary URLs (hpmuseum.org pages, the scanned HP-15C PDF,
  HP's 12C Platinum note) returned HTTP 403 or garbled OCR on direct fetch and were
  verified via WebSearch surfacing identical text or via Wayback snapshots — so
  exact-quote fidelity is high but not machine-re-extracted.
- **Coverage gap.** The verified claim set is heavily weighted toward the Voyager series
  (esp. HP-15C and 12C Platinum) and documentation locations. **Detailed keyboard layouts
  and full function sets for the HP-41 and HP-48 families were confirmed only at the
  documentation-availability level, not extracted key-by-key.**
- **One refuted claim.** The assertion that "the HP-27S was the first HP pocket
  calculator to use algebraic notation only" was refuted 0-3 and should **not** be relied
  upon.
- **Time-sensitivity** is low (legacy hardware specs), except "HP-12C remains in
  production," which is a living status.

---

## Open questions

These are the highest-value follow-ups:

1. ~~Exact key-by-key layouts for the HP-41 and HP-48 families.~~ **Done** — see
   [layouts/](layouts/); all 21 models transcribed from their manuals.
2. **Complete function/command sets and display characteristics** (LCD dimensions,
   annunciators, digit counts, dot-matrix vs 7-segment) for the RPL models
   (HP-28C/S, HP-42S, HP-48/49/50g) and the modern **HP-35s** and **HP Prime** — including
   CAS/symbolic, graphing, and units/dimensional-analysis.
3. **HP-12C financial algorithms beyond TVM** — bond pricing/yield, NPV/IRR cash-flow
   conventions, depreciation methods, any Black-Scholes support — to the precision needed
   to reproduce results faithfully.
4. **Per-model canonical PDF** — for each landmark model, the exact filename/URL on
   literature.hpcalc.org or hpmuseum.org that implementers should extract layout and
   behavior from.

---

## Research provenance

Generated by the `deep-research` multi-agent workflow: 5 search angles → 24 sources
fetched → 96 claims extracted → top 25 verified by 3-vote adversarial panel → **24
confirmed, 1 refuted**, synthesized into 11 findings (merged to 10 below). 105 agents, 0
errors.
