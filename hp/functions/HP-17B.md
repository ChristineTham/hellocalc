# HP-17B — Function / Menu Set

- **Access:** menu-driven. Six softkeys under the display select items; ▲/▼ scroll multi-line menus; `EXIT` backs out one level; shift-`EXIT` (MAIN) returns to the top MAIN menu. A handful of math functions live on the keyboard MATH/DSP menus.
- **Logic:** algebraic (no RPN). Built-in application variables are shared registers that each softkey can both **store** and **solve/calculate**.
- **Source:** HP-17B Owner's Manual, appendix C "Menu Maps" figures C-1…C-6, pp.243–248 (PDF pp.249–254); MAIN menu per ch.1 p.20 — hp/manuals/HP-17B.pdf

## MAIN menu

The top-level menu shown at power-on:

| Label | Opens |
|-------|-------|
| FIN | Financial: TVM, interest conversion, cash flows, bonds, depreciation |
| BUS | Business percentages: %CHG, %TOTL, MU%C, MU%P |
| SUM | Statistics on a list of numbers |
| TIME | Clock, calendar arithmetic, appointments |
| SOLVE | User-defined equation solver |

(The 6th softkey is unused in MAIN. There is **no CURRX** currency menu on the HP-17B — that is an HP-17BII feature.)

## FIN — Financial (Figure C-2)

| Sub-menu | Items |
|----------|-------|
| **TVM** (time value of money) | `N`, `I%YR`, `PV`, `PMT`, `FV`, `OTHER` |
| TVM → OTHER | `P/YR` (payments per year), `BEG`, `END` (annuity mode), `AMRT` |
| TVM → OTHER → AMRT (amortization) | `#P` (# payments), `INT`, `PRIN`, `BAL`, `NEXT`, `TABLE` |
| … AMRT → TABLE | `FIRST`, `LAST`, `INCR`, `GO` |
| **ICNV** (interest conversion) | `PER` (periodic), `CONT` (continuous) |
| ICNV → PER | `NOM%`, `EFF%`, `P` (periods/yr) |
| ICNV → CONT | `NOM%`, `EFF%` |
| **CFLO** (cash-flow lists) | `CALC`, `INSR`, `DELET`, `NAME`, `GET`, `#T?` |
| CFLO → CALC | `TOTAL`, `IRR%`, `I%`, `NPV`, `NUS`, `NFV` |
| CFLO → GET | `*NEW`, (names of stored lists) |
| **BOND** | `TYPE`, `SETT` (settlement), `MAT` (maturity), `CPN%`, `CALL`, `MORE` |
| BOND → TYPE | `360`, `A/A`, `SEMI`, `ANN` |
| BOND → MORE | `YLD%`, `PRICE`, `ACCRU` (accrued interest) |
| **DEPRC** (depreciation) | `BASIS`, `SALV` (salvage), `LIFE`, `ACRS%`, `ACRS`, `MORE` |
| DEPRC → MORE | `YR#`, `FACT%`, `DB` (declining balance), `SOYD`, `SL` (straight line) |

## BUS — Business percentages (Figure C-1)

| Sub-menu | Items |
|----------|-------|
| **%CHG** (percent change) | `OLD`, `NEW`, `%CH` |
| **%TOTL** (percent of total) | `TOTAL`, `PART`, `%T` |
| **MU%C** (markup on cost) | `COST`, `PRICE`, `M%C` |
| **MU%P** (markup on price) | `COST`, `PRICE`, `M%P` |

## SUM — Statistics (Figure C-3)

Operates on a named list of numbers (entered with `INPUT`).

| Sub-menu | Items |
|----------|-------|
| List management | `CALC`, `INSR`, `DELET`, `NAME`, `GET`, `TOTAL` |
| GET | `*NEW`, (names of lists) |
| **CALC** | `TOTAL`, `MEAN`, `MEDN` (median), `STDEV`, `RANG` (range), `MORE` |
| CALC → MORE | `MIN`, `MAX`, `SORT`, `FRCST` (forecast), `MORE` |
| FRCST (2-variable / curve fit; select x and y lists) | `x-list`, `y-list`, `CORR` (correlation), `M` (slope), `B` (intercept), `MORE` |
| FRCST → MORE | `MODL` (model), `W.MN` (weighted mean), `G.SD` (grouped std dev), `SIZE`, `MORE` |
| FRCST → MODL | `LIN`, `LOG`, `EXP`, `PWR` (curve-fit model) |
| FRCST → …MORE (summation registers) | `ΣX`, `ΣY`, `ΣX2`, `ΣY2`, `ΣXY` |

## TIME — Clock, calendar & appointments (Figure C-4)

| Sub-menu | Items |
|----------|-------|
| **CALC** (date arithmetic) | `DATE1`, `DATE2`, `DAYS`, `360D`, `365D`, `TODAY` |
| **APPT** (appointments) | `APT1` … `APT10` (10 appointments) |
| APPT → (each appointment) | `DATE`, `TIME`, `A/PM`, `MSG` (message, via ALPHA menu), `RPT` (repeat), `HELP` |
| APPT → RPT | `NONE`, `MIN`, `HOUR`, `DAY`, `WEEK` |
| **ADJST** (adjust clock) | `+HR`, `−HR`, `+MIN`, `−MIN`, `+SEC`, `−SEC` |
| **SET** (set clock/format) | `DATE`, `TIME`, `A/PM`, `M/D` (date format), `12/24` (time format), `HELP` |

## SOLVE — Equation solver (Figure C-5)

| Item | Description |
|------|-------------|
| `CALC` | evaluate the selected equation; presents a menu of that equation's variables |
| `EDIT` | edit the selected equation (via ALPHA-Edit menu) |
| `DELET` | delete the selected equation |
| `NEW` | enter a new equation (via ALPHA menu) |

Once an equation is entered, its variables become softkeys (store values, then solve for any one unknown), just like the built-in menus.

## Keyboard menus (Figure C-6)

Reached from the STO/RCL/%/DSP/PRT function row (some via the gold shift).

| Menu | Key | Items |
|------|-----|-------|
| **DSP** (display format) | `DSP` | `FIX`, `ALL`, `.` (period radix), `,` (comma radix) |
| **MATH** | shift-`%` | `LOG`, `10^X`, `LN`, `EXP` (eˣ), `N!` (factorial), `PI` (π) |
| **MODES** | shift-`DSP` | `BEEP`, `PRNT` (double-space printing) |
| **PRINTER** | shift-`PRT` | `LIST`, `STK`, `REGS`, `TIME`, `MSG`, `TRACE` |

## Text entry

- **ALPHA / ALPHA-Edit menus** — on-screen character menus used to type/edit letters and symbols for equation names, list names, and appointment messages (the keyboard has no alphabetic keys).

## Notes
- All menu contents are transcribed from the appendix C menu-map figures (C-1…C-6), cross-checked against the ch.1 walk-throughs (e.g. MU%C: COST/PRICE/M%C on p.24). No labels left `[?]`.
- Variable-box shapes in the maps indicate storability (rectangle = store & calculate; oval = calculate/display only; parallelogram = store only); those distinctions are not reproduced here as they don't affect the key/menu inventory.
- ΣX2 / ΣY2 denote Σx² / Σy² (summation registers), rendered ASCII to match the on-screen labels.
