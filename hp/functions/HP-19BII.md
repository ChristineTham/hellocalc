# HP-19BII — Function / Menu Map

- **Access:** six-key on-screen **menu tree** (softkeys under the LCD), driven from the MAIN
  menu; plus direct keyboard functions and the shift-accessed `MATH` menu. Works in ALG or RPN.
- **Structure:** MAIN → `FIN BUS SUM TIME SOLVE TEXT`, each opening sub-menus. `MORE` pages a
  menu, `EXIT` backs out one level, shift+`EXIT` (`MAIN`) returns to the top.
- **Source:** HP-19BII Owner's Manual — MAIN menu box in Figure 1-2 (p. 22); BUS menu Table 3-1
  (p. 56); CURRX pp. 66–68; UNITS pp. 72–74; TVM Table 4-1 (p. 77); ICNV p. 94; CFLO pp. 121–122;
  BOND pp. 137–141; DEPRC p. 139; SUM/CALC Table 7-2 (p. 162); TIME Table 8-1 (p. 176); TEXT
  p. 194; SOLVE pp. 208–211; MATH/PROB/CONV pp. 53–54 — hp/manuals/HP-19BII.pdf

## MAIN menu

| Menu Key | Opens | Description |
|----------|-------|-------------|
| FIN | Finance | time value of money, interest conversion, cash flow, bonds, depreciation |
| BUS | Business | percentage problems, currency exchange, unit conversion |
| SUM | Statistics | totals, subtotals and one/two-variable statistics on number lists |
| TIME | Clock & Appts | clock, appointment alarms, date arithmetic |
| SOLVE | Custom Menus | the equation Solver (user equations become custom menus) |
| TEXT | Text Lists | store text lists (e.g. address lists) |

> Note: the MAIN menu is `FIN BUS SUM TIME SOLVE TEXT` — the 19BII has **no** top-level `CURRX`.
> Currency exchange (`CURRX`) and unit conversion (`UNITS`) live under **BUS** (Table 3-1).

## FIN — Finance

| Menu Key | Description |
|----------|-------------|
| TVM | time value of money (compound interest) |
| ICNV | interest-rate conversion (nominal ↔ effective) |
| CFLO | cash-flow lists (IRR%, NPV, NUS, NFV) |
| BOND | bond price and yield |
| DEPRC | depreciation |

### FIN → TVM (Table 4-1)

| Menu Key | Description |
|----------|-------------|
| N | number of payments / compounding periods |
| I%YR | nominal annual interest rate |
| PV | present value |
| PMT | periodic payment amount |
| FV | future value |
| OTHER | secondary menu → `P/YR` (payments/yr), `BEG`, `END`, `AMRT` (amortization) |

### FIN → ICNV (interest conversion)

| Menu Key | Description |
|----------|-------------|
| PER | periodic compounding → `NOM%`, `EFF%`, `P` (periods/yr) |
| CONT | continuous compounding → `NOM%`, `EFF%` |

### FIN → CFLO (cash-flow list)

| Menu Key | Description |
|----------|-------------|
| (list entry) | `INIT` initial flow, `FLOW(n)` amounts and `#TIMES` counts, via `INPUT` |
| CALC | results menu → `I%`, `NPV`, `NUS`, `NFV`, `IRR%` |
| INSERT / DELETE | edit the flow list |
| GET / *NEW | store / start a named cash-flow list |
| NAME | name the current list |

### FIN → BOND

| Menu Key | Description |
|----------|-------------|
| TYPE | calendar/coupon basis → `360` (30/360), `A/A` (actual/actual), `ANN`, `SEMI` |
| SETT | settlement (purchase) date |
| MAT | maturity (or call) date |
| CPN% | annual coupon rate |
| CALL | call value (default 100) — on second page (`MORE`) |
| PRICE | price per 100 face value |
| YLD% | yield to maturity / to call |
| ACCRU | accrued interest |

### FIN → DEPRC (depreciation)

Variables: `BASIS` (depreciable basis), `SALV` (salvage), `LIFE`, `FACT` (declining-balance
factor), `YR#`; result is depreciation for the year and remaining depreciable value (`RDV`).

| Menu Key | Method |
|----------|--------|
| SL | straight line |
| DB | declining balance |
| SOYD | sum-of-the-years'-digits |
| ACRS | Accelerated Cost Recovery System |

## BUS — General Business (Table 3-1)

| Menu Key | Description | Variables |
|----------|-------------|-----------|
| %CHG | percent change | OLD, NEW, %CH |
| %TOTL | percent of total | TOTAL, AMT, %T |
| MU%C | markup as percent of cost | COST, PRICE, M%C |
| MU%P | markup as percent of price | COST, PRICE, M%P |
| CURRX | currency exchange | currency-1, currency-2, `SELECT`, `RATE`, `C.STO`, `C.RCL` |
| UNITS | unit conversion | `LENG`, `AREA`, `VOL`, `MASS`, `TEMP` sub-menus |

## SUM — Totals, Subtotals & Statistics

Enter numbers into a list (`INPUT`), then `CALC`. Editing: `INSERT`, `DELETE`, `GET`, `*NEW`,
`NAME`.

### SUM → CALC (Table 7-2)

| Menu Key | Description |
|----------|-------------|
| TOTAL | sum of the list |
| MEAN | arithmetic mean |
| MEDN | median |
| STDEV | (sample) standard deviation |
| RANG | range (max − min) |
| MIN | minimum (page 2, `MORE`) |
| MAX | maximum |
| SORT | sort ascending |
| FRCST | curve fitting / forecasting, weighted mean, grouped std-dev, summation stats (two lists) |
| HIST | histogram of the list |

## TIME — Clock, Appointments & Date Arithmetic (Table 8-1)

| Menu Key | Description |
|----------|-------------|
| CALC | days between dates, future/past date, day of week |
| APPT | set and view appointment alarms |
| ADJST | adjust the clock setting |
| SET | set time/date; choose 12/24-hour and date formats |

## SOLVE — Equation Solver

Type an algebraic equation in the equation list, then let the Solver build a custom variable
menu. List / equation keys include `CALC` (enter the equation and show its variable menu),
`EDIT`, `DELET`, `NEW`, and cursor/typing aids. Solver functions usable in equations include
`IF`, `S` (let/solve-for), `SIGMA`, `SGN`, `SIN`/`SINH`/…, `SIZES`/`SIZEC`, etc.

## TEXT — Text Lists

Create text lists (e.g. address lists). Keys: `INPUT` (add a line), `MARK` (insert a record
marker splitting records), `DELET`, `GET`, `*NEW`, `NAME`.

## MATH menu (shift + `%`) and direct functions

The `MATH` menu groups scientific functions; confirmed sub-menus:

| Sub-menu | Contents |
|----------|----------|
| PROB (probability) | `C X,Y` combinations, `P X,Y` permutations, `N!` factorial, `RAN#` random number |
| CONV (conversions) | `>DEG`/`>RAD` (via `D/R`), `>HR`/`>H.MS`, polar↔rectangular (`XCORD`,`YCORD`,`R`,`∠`), etc. |

Direct keyboard functions (both logics): `+ − × ÷`, `=`/ENTER, `%`, `1/x` (shift `÷`),
`^` (shift `×`), `√x` (shift `−`), `x²` (shift `+`), `+/−`, `E`/EEX (shift `+/−`),
`STO`, `RCL`, `SHOW` (shift `.`), `MEM` (shift `0`), `LAST` (shift `=`).

## Notes

- Menu contents were read from the manual's per-chapter menu tables (cited above); the top MAIN
  and BUS rows come from Figure 1-2 and Table 3-1 respectively. Sub-menu variable lists for
  `%TOTL`/`MU%C`/`MU%P` are inferred from the standard three-variable pattern stated on p. 57
  ("Each of the four business percentage menus contains three variables"); the `%CHG` set
  (OLD/NEW/%CH) is confirmed on p. 57.
- No cell required a `[?]` legend mark; every menu label cited was legible in the scans.
