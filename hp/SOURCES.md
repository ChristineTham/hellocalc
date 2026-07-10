# Source & Documentation Catalog

All sources fetched during research, grouped by usefulness. Quality ratings are from the
extraction pass (primary = official HP handbook or archive index; secondary = Wikipedia
etc.; blog = tutorial site; unreliable = fetch failed / paywalled / irrelevant).

## Primary documentation archives (start here)

These are the canonical places the actual manuals live — the emulator implementers'
first stop for extracting layouts and behavior.

| Source | What it holds | Quality |
|---|---|---|
| [literature.hpcalc.org/all](https://literature.hpcalc.org/all) | "All Known HP Calculator Literature" — by model / language / document type. Owner's handbooks, quick-reference guides, applications & solutions books, service manuals, training guides. HP-21 → HP Prime. | primary |
| [manuals.hpcalc.org](https://manuals.hpcalc.org/) | Downloadable HP calculator manuals, ~100+ models HP-35 → HP Prime, filterable by language/author/source. | primary |
| [hpcalc.org/hp48/docs](https://www.hpcalc.org/hp48/docs/) | HP 48G scanned PDFs — **Advanced User's Reference Manual (764 pp, 4th ed.)** and **User's Guide (612 pp, 8th ed.)**. | primary |
| [hpmuseum.org/software/swcdp.htm](https://www.hpmuseum.org/software/swcdp.htm) | Museum **Document Set** — ~1,700 scanned documents/images (CD volumes or one 16 GB USB). Includes HP-35 Operating Manual, HP-41C/CV Owner's Handbook, HP-42S Owner's Handbook, HP-48SX Owner's Manual Vol 1 & 2 + Programmer's Reference. | primary |
| [hpmuseum.org/rpn.htm](https://www.hpmuseum.org/rpn.htm) | Canonical explanation of the 4-level X/Y/Z/T stack, ENTER lift, and drop mechanics. | primary |
| [hpmuseum.org/rpl.htm](https://www.hpmuseum.org/rpl.htm) | RPL background — how HP-28/48 differ from classic RPN. | secondary |

## Primary model manuals (verified content)

| Source | Model | Quality |
|---|---|---|
| [hp15c-ce-oh-en.pdf](https://literature.hpcalc.org/official/hp15c-ce-oh-en.pdf) | HP-15C Collector's Edition Owner's Handbook — stack, 67-register memory model, complex mode, SOLVE, integration, Voyager color scheme. | primary |
| [HP 12c Platinum Instruction Manual](https://s3-ap-southeast-2.amazonaws.com/wc-prod-pim/Asset_Documents/HP%20Platinum%20Financial%20Calculator%2012c%20Instruction%20Manual.pdf) | HP-12C Platinum — RPN/ALG modes, five-quantity TVM, keyboard prefix scheme. | primary |
| [HP12CPRPNstack.pdf](http://h20331.www2.hp.com/Hpsub/downloads/HP12CPRPNstack.pdf) | HP's official note on the 12C Platinum RPN stack — binary-op steps and no-lift key set. | primary |

## Keyboard-layout references

| Source | What it holds | Quality |
|---|---|---|
| [archived.hpcalc.org/greendyk/hp15c/304.html](https://archived.hpcalc.org/greendyk/hp15c/304.html) | HP-15C keyboard reference index — every key with its `f` (gold) and `g` (blue) shifted functions. | secondary |
| [en.wikipedia.org/wiki/HP-41C](https://en.wikipedia.org/wiki/HP-41C) | HP-41C overview. | secondary |
| [en.wikipedia.org/wiki/HP-12C](https://en.wikipedia.org/wiki/HP-12C) | HP-12C overview. | secondary |

## History, taxonomy & feature overviews

| Source | What it holds | Quality |
|---|---|---|
| [en.wikipedia.org/wiki/HP_calculators](https://en.wikipedia.org/wiki/HP_calculators) | Master overview of the whole HP line and feature evolution across eras. | secondary |
| [en.wikipedia.org/wiki/Reverse_Polish_notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation) | RPN background. | secondary |
| [xnumber.com/xnumber/WMJ_models.htm](https://www.xnumber.com/xnumber/WMJ_models.htm) | Model taxonomy by family/series. | secondary |
| [thecalculatorstore.com — HP history](https://www.thecalculatorstore.com/c/resources-and-links/hp-calculator-history) | Narrative HP calculator history. | blog |

## Financial-function references (HP-12C)

| Source | What it holds | Quality |
|---|---|---|
| [tvmcalcs.com — 12C tutorial Pt III](https://tvmcalcs.com/hp/hp12c/hp-12c-tutorial-part-iii/) | Uneven cash flows: CF0/CFj/Nj entry, NPV, IRR, MIRR keystroke model. | blog |
| [tvmcalcs.com — 12C bond valuation](http://www.tvmcalcs.com/calculators/apps/hp12c_bond_valuation) | Bond price/yield on the 12C. | secondary |
| [tvmcalcs.com — 12C page 2](http://www.tvmcalcs.com/calculators/hp12c/hp12c_page2) | 12C TVM walkthrough. | blog |

## Sources that failed to fetch (403 / paywall / no extractable content)

Worth retrying via Wayback Machine or a browser session — several are high-value primary
sources that simply blocked the automated fetch:

- [hpmuseum.org](https://www.hpmuseum.org/) (home) — 403 on direct fetch; the single most
  authoritative primary source. Retry via browser.
- [educalc.net/page/156088](https://www.educalc.net/page/156088/) — no content extracted.
- [educalc.net/page/146551](https://www.educalc.net/page/146551/) — no content extracted.
- [grokipedia.com — HP graphing calculator comparison](https://grokipedia.com/page/Comparison_of_HP_graphing_calculators) — unreliable.

## Refuted claim (do not use)

- ❌ "The HP-27S was the first HP pocket calculator to use algebraic notation only rather
  than RPN." — refuted 0-3 by adversarial verification. Source claimed:
  en.wikipedia.org/wiki/HP_calculators.
