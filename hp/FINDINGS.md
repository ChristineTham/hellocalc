# Verified Findings

Each finding below survived a 3-vote adversarial verification panel (needs 2/3
refutations to be killed). All confirmed findings scored **3-0**. Format: claim →
confidence → sources → verifier evidence.

---

### 1. Documentation is centralized and locatable — `literature.hpcalc.org`
**Confidence: high · Vote: 3-0**

`literature.hpcalc.org` (linked from hpcalc.org as "All HP Calculator Manuals") is a
comprehensive by-model / by-language / by-document-type catalog spanning **HP-21 through
HP Prime**, holding owner's handbooks, quick-reference guides, applications books,
solutions handbooks, service manuals, and training guides.

- Sources: literature.hpcalc.org/all · manuals.hpcalc.org · hpcalc.org/hp48/docs
- Evidence: The catalog describes itself as "All Known HP Calculator Literature,"
  organized by model, language, and document type, with concrete instances of each type
  (HP-11C Owner's Handbook, HP-12C Solutions Handbook, HP-11C Service Manual).

### 2. The Museum of HP Calculators Document Set (~1,700 documents)
**Confidence: high · Vote: 3-0**

hpmuseum.org hosts an institutional Document Set of ~1,700 scanned documents/images (CD
volumes or a single 16 GB USB drive) including original owner's manuals for the landmark
models — HP-35 Operating Manual, HP-41C/CV Owner's Handbook, HP-42S Owner's Handbook,
HP-48SX Owner's Manual Vol 1 & 2, plus the HP-48SX Programmer's Reference Manual.

- Sources: hpmuseum.org/software/swcdp.htm
- Evidence: The page states "~1700 documents and images" and lists the specific manuals
  with CD assignments; verified against a Wayback snapshot when the live URL returned 403.

### 3. HP 48G reference PDFs on hpcalc.org
**Confidence: high · Vote: 3-0**

The HP 48G Series **Advanced User's Reference Manual (764 pages, 4th ed.)** and the HP 48G
Series **User's Guide (612 pages, 8th ed.)** are available as scanned PDFs.

- Sources: hpcalc.org/hp48/docs
- Evidence: Both listed with exact page counts and editions; the 764-page count is
  independently confirmed by ManualsLib page navigation.

### 4. Classic RPN four-level stack + LAST X
**Confidence: high · Vote: 3-0**

Standard HP RPN calculators (HP-35/45/25/41/11C/12C/15C/16C/35s) use a fixed four-level
stack of registers `X, Y, Z, T` with only X shown in the display, plus a separate
`LAST X`. Pressing **ENTER** completes X and copies it to Y, lifting prior contents up
(`X→Y, Y→Z, Z→T`).

- Sources: hpmuseum.org/rpn.htm · hp15c-ce-oh-en.pdf · HP12CPRPNstack.pdf
- Evidence: hpmuseum.org/rpn.htm states the X/Y/Z/T stack with only X displayed and the
  ENTER lift mechanics verbatim; corroborated by the HP-15C handbook and HP's official
  12C Platinum stack note.

### 5. Binary-op behavior & stack-lift disabling
**Confidence: high · Vote: 3-0**

On a binary op the calculator copies X → `LAST X`, computes the result into X, and drops
`T/Z` down (T is duplicated). ENTER lifts the stack (losing prior T). Entering a number
immediately after `ENTER`, `CLx`, `Σ+`, or `g Σ-` overwrites X **without** lifting.

- Sources: HP12CPRPNstack.pdf
- Evidence: HP's own note enumerates the five-step binary-op behavior
  (`X→L`, `Y op X`, result→X, `T/Z` drop, copy of T retained) and the canonical no-lift
  key set.

### 6. RPL models differ from classic RPN
**Confidence: high · Vote: 3-0**

The RPL-based HP-28 and HP-48 (and by extension 49G/50g) use an object stack where ENTER
places the number only in the lowest stack level rather than into both X and Y, and the
stack is dynamic/unlimited rather than fixed at four levels.

- Sources: hpmuseum.org/rpn.htm (corroborated by rpl.htm, rpnvers.htm)
- Evidence: hpmuseum.org/rpn.htm explicitly contrasts RPL ENTER behavior with classic RPN.

### 7. Voyager keyboard/color convention
**Confidence: high · Vote: 3-0**

For HP-11C/12C/15C/16C and 12C Platinum: primary function in **white** on the upper key
face; **gold `f`** prefix selects functions printed in gold *above* each key; **blue `g`**
prefix selects functions printed in blue on the *lower* key face; pressing a prefix lights
an `f` or `g` annunciator.

- Sources: hp15c-ce-oh-en.pdf · HP 12c Platinum instruction manual
- Evidence: Both primary manuals state the white-primary / gold-above / blue-lower scheme
  and f/g annunciators verbatim.

### 8. HP-15C full feature set
**Confidence: high · Vote: 3-0**

Four-level RPN stack (`T/Z/Y/X`) + `LAST X`; **67 total registers** (3 permanent + 64
allocatable between data and program at 7 bytes/register); complex-number mode (parallel
real/imaginary four-level stack); matrix operations; **SOLVE** root finder; numerical
integration; hyperbolic trig and inverses; combinations/permutations/random numbers.

- Sources: hp15c-ce-oh-en.pdf
- Evidence: The HP-15C Collector's Edition Owner's Handbook specifies the stack, the
  67-register memory model (448-byte pool ÷ 7 = 64 + 3 permanent = 67), and each advanced
  function; corroborated by hpmuseum.org and Wikipedia.

### 9. HP-12C Platinum modes & TVM
**Confidence: high · Vote: 3-0**

Supports both **RPN and ALG** modes (f-shifted RPN/ALG keys, with a status indicator lit)
and performs Time Value of Money using five financial registers/keys: **`n, i, PV, PMT,
FV`**.

- Sources: HP 12c Platinum instruction manual
- Evidence: The official manual documents mode selection via `f` then `RPN`/`ALG` with a
  lit status indicator, and enumerates the five TVM quantities (also the physical top-row
  keys).

### 10. Landmark-model history
**Confidence: high · Vote: 3-0**

HP-35 (1972) — HP's first pocket calculator and world's first with transcendental
functions. HP-41C (1979) — introduced alphanumeric display, user-programmable key
mappings, four expansion ports (41CV quintupled base memory; 41CX added a clock). HP-12C
(1981) — longest-running HP calculator, still in production.

- Sources: en.wikipedia.org/wiki/HP_calculators
- Evidence: Wikipedia states each fact; corroborated by IEEE ETHW (HP-35 milestone),
  hpmuseum.org, datamath.org, and HP's own history pages. Secondary source but unanimous
  and independently confirmed.

### 11. Family taxonomy
**Confidence: medium · Vote: 3-0**

Classic Series (HP-35, HP-80, HP-45, HP-65); Woodstock/Series 20 (HP-21, HP-25);
Topcat/Series 90 desktop printing (HP-91, HP-92, HP-97); Voyager/Series 10 (HP-10C,
HP-11C, HP-12C, HP-15C, HP-16C).

- Sources: xnumber.com/xnumber/WMJ_models.htm · en.wikipedia.org/wiki/HP_calculators
- Evidence: The xnumber taxonomy and Wikipedia's Voyager article confirm each grouping;
  Series 20 = Woodstock / Series 90 = Topcat is corroborated by an HPCC 2023 conference
  paper. Secondary sources but consistent.

---

## Refuted (killed by verification)

### ❌ HP-27S "first algebraic-only" claim
**Vote: 0-3 (refuted)**

"HP calculators are well known for their use of RPN, while the HP-27S was the first HP
pocket calculator to use algebraic notation only rather than RPN." — Refuted unanimously.
Do not rely on this. (Source claimed: en.wikipedia.org/wiki/HP_calculators.)
