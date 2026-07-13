# HP-19B (Business Consultant II) — Function / Menu Set

- **Access:** menu softkeys under the LCD (relabeled by the bottom display line); keyboard keys;
  the Solver (type equations by name). Menus with more than six labels page with a `MORE` key.
- **Approx. count:** ~250 (menu items across FIN/BUS/SUM/TIME/SOLVE/TEXT + the MATH keyboard
  menu + ~55 Solver functions + keyboard operations).
- **Logic:** algebraic (not RPN); the 19BII adds RPN.
- **Source:** *HP-19B Owner's Manual* (6/88) — Appendix C "Menu Maps" (pp.306-313 / PDF
  pp.312-319), Table 1-2 "The MAIN Menu" (p.29), Figure 1-5 (p.30), and Table 12-1 "Solver
  Functions" (pp.228-231 / PDF pp.234-237) — hp/manuals/HP-19B.pdf. All menu labels were legible.

## MAIN menu

| Label | Opens | Category |
|-------|-------|----------|
| FIN | Finance submenu | TVM, interest conversions, cash flows, bonds, depreciation |
| BUS | Business submenu | percentages, currency exchange, unit conversions |
| SUM | Sum/Statistics submenu | totals, subtotals, statistics, curve fitting, forecasting, plotting |
| TIME | Time submenu | clock, calendar, alarms/appointments, date arithmetic |
| SOLVE | Solver submenu | create and use your own equations, menus and variables |
| TEXT | Text submenu | store lists of text information |

> Note: some references (incl. the task brief) place `CURRX` on MAIN; on the HP-19B **CURRX and
> UNITS live under BUS**, not MAIN. Reach MAIN with shift+EXIT (MAIN).

## FIN — Finance

### FIN ▸ TVM (time value of money)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| N | TVM | number of payments |
| I%YR | TVM | annual (nominal) interest rate |
| PV | TVM | present value |
| PMT | TVM | payment amount |
| FV | TVM | future value |
| OTHER | TVM | payment/mode options (below) |
| P/YR | TVM ▸ OTHER | payments per year |
| BEG | TVM ▸ OTHER | begin-of-period payment mode |
| END | TVM ▸ OTHER | end-of-period payment mode |
| AMRT | TVM ▸ OTHER | amortization (below) |
| #P | …AMRT | number of payments to amortize |
| INT | …AMRT | interest portion |
| PRIN | …AMRT | principal portion |
| BAL | …AMRT | remaining balance |
| NEXT | …AMRT | amortize the next set of payments |
| TABLE | …AMRT | amortization table |
| START | …AMRT ▸ TABLE | first payment in the table |

### FIN ▸ ICNV (interest-rate conversions)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| PER | ICNV | periodic-compounding conversion |
| NOM% | ICNV ▸ PER | nominal annual rate |
| EFF% | ICNV ▸ PER | effective annual rate |
| P | ICNV ▸ PER | number of compounding periods/year |
| CONT | ICNV | continuous-compounding conversion |
| NOM% | ICNV ▸ CONT | nominal rate |
| EFF% | ICNV ▸ CONT | effective rate |

### FIN ▸ CFLO (cash flows)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| CALC | CFLO | calculate results (below) |
| INSRT | CFLO | insert a cash flow |
| DELET | CFLO | delete a cash flow |
| NAME | CFLO | name the list |
| GET | CFLO | switch list / `*NEW` create a new list |
| PLOT | CFLO | plot the cash-flow list |
| TOTAL | CFLO ▸ CALC | sum of the cash flows |
| IRR% | CFLO ▸ CALC | internal rate of return |
| I% | CFLO ▸ CALC | periodic interest rate |
| NPV | CFLO ▸ CALC | net present value |
| NUS | CFLO ▸ CALC | net uniform series |
| NFV | CFLO ▸ CALC | net future value |

### FIN ▸ BOND

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| TYPE | BOND | bond type: 360, A/A (actual/actual), SEMI, ANN |
| SETT | BOND | settlement date |
| MAT | BOND | maturity date |
| CPN% | BOND | coupon rate |
| CALL | BOND | call value |
| YLD% | BOND ▸ MORE | yield to maturity |
| PRICE | BOND ▸ MORE | price |
| ACCRU | BOND ▸ MORE | accrued interest |

### FIN ▸ DEPRC (depreciation)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| BASIS | DEPRC | depreciable basis (cost) |
| SALV | DEPRC | salvage value |
| LIFE | DEPRC | asset life |
| ACRS% | DEPRC | ACRS percentage |
| ACRS | DEPRC | ACRS depreciation |
| YR# | DEPRC ▸ MORE | year to compute |
| FACT% | DEPRC ▸ MORE | declining-balance factor |
| DB | DEPRC ▸ MORE | declining-balance depreciation |
| SOYD | DEPRC ▸ MORE | sum-of-the-years'-digits |
| SL | DEPRC ▸ MORE | straight-line depreciation |

## BUS — General Business

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| %CHG | BUS | percent change → OLD, NEW, %CH |
| %TOTL | BUS | percent of total → TOTAL, PART, %T |
| MU%C | BUS | markup as % of cost → COST, PRICE, M%C |
| MU%P | BUS | markup as % of price → COST, PRICE, M%P |
| CURRX | BUS | currency exchange (below) |
| UNITS | BUS | unit conversions (below) |

### BUS ▸ CURRX (currency exchange)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| CURR1 | CURRX | currency 1 amount |
| CURR2 | CURRX | currency 2 amount |
| RATE | CURRX | exchange rate |
| C.STO | CURRX | store the current rate/pair |
| C.RCL | CURRX | recall a stored rate/pair |
| SELCT | CURRX | select currencies (list of currencies) |

### BUS ▸ UNITS (unit conversions)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| LENG | UNITS | length units |
| AREA | UNITS | area units |
| VOL | UNITS | volume units |
| MASS | UNITS | mass / weight units |
| TEMP | UNITS | temperature units |

## SUM — Sum & Statistics

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| CALC | SUM | calculate statistics (below) |
| INSRT | SUM | insert a value |
| DELET | SUM | delete a value |
| NAME | SUM | name the list |
| GET | SUM | switch list / `*NEW` create a new list |
| COPY | SUM ▸ MORE | copy a list |
| LABEL | SUM ▸ MORE | label items → CURR, GLOBL |
| START | SUM ▸ MORE | starting number for auto-labels |
| SUBT | SUM ▸ MORE | subtotal |
| TOTAL | SUM ▸ CALC | sum of the values |
| MEAN | SUM ▸ CALC | arithmetic mean |
| MEDN | SUM ▸ CALC | median |
| STDEV | SUM ▸ CALC | standard deviation |
| RANG | SUM ▸ CALC | range |
| MIN | SUM ▸ CALC ▸ MORE | minimum |
| MAX | SUM ▸ CALC ▸ MORE | maximum |
| SORT | SUM ▸ CALC ▸ MORE | sort the list |
| FRCST | SUM ▸ CALC ▸ MORE | forecasting / curve fitting (below) |
| HIST | SUM ▸ CALC ▸ MORE | histogram |
| LIN | FRCST | linear model |
| LOG | FRCST | logarithmic model |
| EXP | FRCST | exponential model |
| PWR | FRCST | power model |
| XLIST | FRCST | x-variable list |
| YLIST | FRCST | y-variable list |
| CORR | FRCST | correlation coefficient |
| M | FRCST | slope of the fit |
| B | FRCST | y-intercept of the fit |
| PLOT | FRCST ▸ MORE | plot the data/fit |
| W.MN | FRCST ▸ MORE | weighted mean |
| G.SD | FRCST ▸ MORE | grouped standard deviation |
| SIZE | FRCST ▸ MORE | number of entries |
| ΣX | FRCST ▸ MORE | sum of x |
| ΣY | FRCST ▸ MORE | sum of y |
| ΣX2 | FRCST ▸ MORE | sum of x² |
| ΣY2 | FRCST ▸ MORE | sum of y² |
| ΣXY | FRCST ▸ MORE | sum of x·y |

## TIME — Clock, Appointments & Date Arithmetic

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| CALC | TIME | date arithmetic (below) |
| APPT | TIME | appointments (below) |
| ADJST | TIME | adjust clock: +HR, −HR, +MIN, −MIN, +SEC, −SEC |
| SET | TIME | set clock/format: DATE, TIME, A/PM, M/D, 12/24, HELP |
| DATE1 | TIME ▸ CALC | first date |
| DATE2 | TIME ▸ CALC | second date |
| DAYS | TIME ▸ CALC | days between dates |
| 360D | TIME ▸ CALC | days on a 360-day calendar |
| 365D | TIME ▸ CALC | days on a 365-day calendar |
| TODAY | TIME ▸ CALC | today's date |
| APPT1…APPT6 | TIME ▸ APPT | the six appointments |
| DATE | APPTn | appointment date |
| TIME | APPTn | appointment time |
| A/PM | APPTn | AM/PM toggle |
| MSG | APPTn | appointment message (text) |
| RPT | APPTn | repeat interval: NONE, MIN, HR, DAY, WEEK |
| HELP | APPTn | help |

## SOLVE — Solver

The Solver stores algebraic equations; `CALC` builds a variable menu from an equation's names.

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| CALC | SOLVE | select an equation → menu of its variables |
| EDIT | SOLVE | edit the current equation (uses the alphabetic keyboard) |
| DELET | SOLVE | delete an equation |

### Solver functions (Table 12-1) — usable inside equations

| Function | Description |
|----------|-------------|
| ABS(x) | absolute value |
| ACOS(x) / ASIN(x) / ATAN(x) | inverse trig (current angle mode) |
| ACOSH(x) / ASINH(x) / ATANH(x) | inverse hyperbolic |
| ALOG(x) | common antilog (10^x) |
| ANGLE(x:y) | polar angle of rectangular (x,y) |
| CDATE | current date |
| COMB(x:y) | combinations of x taken y |
| COS(x) / SIN(x) / TAN(x) | trig (current angle mode) |
| COSH(x) / SINH(x) / TANH(x) | hyperbolic |
| CTIME | current time (HH.MMSS, 24-hr) |
| DATE(date:n) | date n days after/before date |
| DDAYS(d1:d2:cal) | days between dates (cal 1=actual, 2=365, 3=360) |
| DEG(x) | radians → decimal degrees |
| EXP(x) | natural antilog (e^x) |
| EXPM1(x) | e^x − 1 |
| FACT(x) | factorial (x integer ≥0) |
| FLOW(name:x) | value of FLOW(x) in a named CFLO list |
| FP(x) | fractional part |
| FV(n:i%yr:pv:pmt:p/yr:m) | TVM future value |
| HMS(x) | decimal hours → H.MMSS |
| HRS(x) | H.MMSS → decimal hours |
| IDIV(x:y) | integer part of x÷y |
| IF(con:alg1:alg2) | conditional: alg1 if con true else alg2 |
| INT(x) | greatest integer ≤ x |
| INV(x) | reciprocal 1/x |
| IP(x) | integer part |
| ITEM(name:x) | value of entry x in a named SUM list |
| I%YR(n:pv:pmt:fv:p/yr:m) | TVM interest rate |
| LN(x) | natural log |
| LNP1(x) | ln(1+x) |
| LOG(x) | common log |
| MAX(x:y) / MIN(x:y) | larger / smaller of x, y |
| MOD(x:y) | remainder of x÷y |
| N(i%yr:pv:pmt:fv:p/yr:m) | TVM number of payments |
| PERM(x:y) | permutations of x taken y |
| PI | π (3.14159265359) |
| PMT(n:i%yr:pv:fv:p/yr:m) | TVM payment |
| PV(n:i%yr:pmt:fv:p/yr:m) | TVM present value |
| RAD(x) | decimal degrees → radians |
| RADIUS(x:y) | polar radius of rectangular (x,y) |
| RAN# | pseudo-random number (0≤r<1) |
| RND(x:y) | round x to y decimals / significant digits |
| S(var) | menu-variable flag (multi-equation menus, with IF) |
| SGN(x) | sign (+1/0/−1) |
| Σ(cv:c1:c2:s:alg) | summation of alg over counter cv from c1 to c2 step s |
| SIZEC(name) | group number of last flow in a named CFLO list |
| SIZES(name) | number of entries in a named SUM list |
| SPFV(i%:n) | future value of a single $1 payment |
| SPPV(i%:n) | present value of a single $1 payment |
| SQ(x) | x² |
| SQRT(x) | √x |
| #T(name:x) | #TIMES for FLOW(x) of a named CFLO list |
| TRN(x:y) | truncate x to y decimals / significant digits |
| USFV(i%:n) | future value of a uniform $1 series |
| USPV(i%:n) | present value of a uniform $1 series |
| XCOORD(R:∡) / YCOORD(R:∡) | x / y coordinate of polar coordinates |

## TEXT — Storing Text

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| MARK | TEXT | insert a record marker after the current entry |
| EDIT | TEXT | edit / view an entry |
| DELET | TEXT | delete the current entry |
| NAME | TEXT | name the list |
| GET | TEXT | switch list / `*NEW` create a new list |
| FIND | TEXT ▸ MORE | search for a character sequence |
| EDIT | TEXT ▸ MORE | edit (duplicate of EDIT above) |
| PREV | TEXT ▸ MORE | previous record marker |
| NEXT | TEXT ▸ MORE | next record marker |
| SORT | TEXT ▸ MORE | sort the list alphabetically |

## MATH menu (keyboard: shift + % )

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| RND | MATH | round to display precision |
| PI | MATH | π |
| LOGS | MATH | LOG, 10^X, LN, EXP, HYP |
| SINH/COSH/TANH/ASINH/ACOSH/ATANH | MATH ▸ LOGS ▸ HYP | hyperbolic and inverse hyperbolic |
| TRIG | MATH | SIN, COS, TAN, ASIN, ACOS, ATAN |
| >DEG / >RAD / >HR / >HMS | MATH ▸ TRIG ▸ (CONV) | angle/time conversions |
| XCORD / YCORD / R / ∡ / D/R | MATH ▸ TRIG ▸ MORE | polar↔rectangular, degrees↔radians |
| CONV | MATH | conversions (the >DEG…D/R group above) |
| PROB | MATH | X, Y, CX,Y, PX,Y, N! (factorial), RAN# (random) |

## Display / mode menus (keyboard)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| FIX / ALL / . / , | DISP | number-format and radix/digit-separator options |
| D/R | MODES (shift+DISP) | degrees / radians |
| BEEP | MODES | beeper on/off |
| PRINT | MODES | manual/auto printing |
| LANG | MODES | display language (six languages, incl. INTL/ENG) |
| DISPL / LIST / REGS / TIME / TRACE | PRINTER (shift+PRNT) | printing options |

## Keyboard / direct operations

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| + − × ÷ | keyboard | arithmetic operators |
| = | keyboard | evaluate (algebraic equals) |
| ( ) | keyboard | parentheses for precedence |
| ^ | keyboard (shift ×) | power (y^x) |
| √x | keyboard (shift −) | square root |
| x² | keyboard (shift +) | square |
| 1/x | keyboard (shift ÷) | reciprocal |
| % | keyboard | percent (MATH menu via shift) |
| +/− (CHS) | keyboard | change sign |
| E (EEX) | keyboard (shift +/−) | enter power-of-ten exponent |
| STO / RCL | keyboard | store into / recall from a variable or register |
| INPUT | keyboard | enter a value / end an entry |
| SHOW | keyboard (shift .) | show full 12-digit value |
| MEM | keyboard (shift 0) | available memory |
| LAST | keyboard (shift =) | recall the last result |
| ▲ / ▼ | keyboard | scroll the display / lists |
| ◄ (backspace) | keyboard | erase character left of cursor |
| CLEAR | keyboard (shift ◄) | clear the calculator line |
| CLEAR DATA | keyboard (shift INPUT) | clear the data in the current menu |
| EXIT | keyboard | back up one menu level |
| MAIN | keyboard (shift EXIT) | return to the MAIN menu |
| MORE | menu softkey | page through menus with more than six labels |
| ON | keyboard | turn on; press again to turn off; hold + `+`/`−` sets contrast |

## Notes
- Commands come from Appendix C "Menu Maps" and Table 12-1 "Solver Functions"; descriptions are
  paraphrased. All menu labels were legible (none `[?]`).
- `CURRX` and `UNITS` are **BUS** submenus on the 19B, not MAIN-menu items.
- The 19B is **algebraic**; the TVM Solver functions (N, I%YR, PV, PMT, FV, SPFV, USPV, …) let
  financial calculations be embedded in user equations.
- Variable menu labels come from the first 4–5 characters of Solver variable names; names may not
  contain `+ − × ÷ ^ ( ) < > = :` and may not start with a digit or decimal point.
