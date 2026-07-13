# HP-27S — Function / Command Set (Menu Map)

- **Access:** algebraic keyboard + blue-shifted keys that open **application**, **numeric-function**, and **control** menus. The six top-row softkeys are relabelled by the bottom display line; a `MORE` softkey pages menus with more than six labels; `EXIT` backs up one level and shift-`EXIT` (`MAIN`) returns to the MAIN display.
- **Model class:** Pioneer-family **algebraic scientific** with menus + the equation Solver. Two-line dot-matrix display, single (blue) shift, chain/algebraic entry with `( )` and `=`.
- **Source:** HP-27S Owner's Manual — "Table 1-2. Menus" printed p.24 (PDF p.30); appendix D "Menu Maps and Tables" printed pp.233–237 (PDF pp.239–243); Solver "Table 5-3. Solver Functions" printed pp.98–102 (PDF pp.104–108); appendix C "Equations Used by HP-27S Menus" printed pp.226–231 — hp/manuals/HP-27S.pdf

## Top-level structure (Table 1-2)

There is no fixed MAIN application menu; the **MAIN display** is the bare calculation line. Each category below is entered directly with a blue-shifted key.

| Category | Keys (blue-shift) | Purpose |
|----------|-------------------|---------|
| **Applications** | ■SOLVE, ■STAT, ■TVM, ■TIME | grouped multi-level menus |
| **Numeric functions** | ■BASE, ■PROB, ■HYP, ■CONVERT, ■%CHG, ■PARTS | extend the keyboard's numeric functions |
| **Control** | ■MODES, ■PRINTER | modes and printer control |

## Keyboard math functions (primary + blue-shift)

| Command | Access | Description |
|---------|--------|-------------|
| + − × ÷ | keyboard | four-function algebraic arithmetic |
| = | keyboard | evaluate the algebraic expression |
| ( ) | keyboard | parentheses (precedence override) |
| +/− | keyboard | change sign |
| E | shift (over +/−) | enter power-of-ten exponent (×10ⁿ) |
| % | shift (over `(`) | percent |
| π | shift (over `)`) | recall π (12 digits) |
| √x | shift (menu key 1) | square root |
| x² | shift (menu key 2) | square |
| eˣ | shift (menu key 3) | natural exponential |
| LN | shift (menu key 4) | natural logarithm |
| yˣ | shift (menu key 5) | raise y to the x power |
| 1/x | shift (menu key 6) | reciprocal |
| 10ˣ | shift (over STO) | common exponential |
| LOG | shift (over RCL) | common (base-10) logarithm |
| SIN COS TAN | keyboard | trigonometric functions (uses current angle mode) |
| ASIN ACOS ATAN | shift (over SIN/COS/TAN) | inverse trigonometric functions |
| STO / RCL | keyboard | store / recall a variable or register |
| LAST | shift (over `=`) | recall the last result/argument |
| SHOW | shift (over `.`) | show full precision briefly |
| MEM | shift (over 0) | available-memory display |
| CLR / ON | keyboard | clear calculator line / power on |
| OFF | shift (over CLR) | power off |

## Applications

### SOLVE — Equation Solver  (■SOLVE; menu map printed p.233)

| Softkey | Description |
|---------|-------------|
| CALC | display the menu of the current equation's variables and solve |
| EDIT | edit the current equation (opens the ALPHA-Edit menu) |
| DELET | delete the current equation |
| NEW | enter a new equation (opens the ALPHA menu for typing) |
| *(variables)* | CALC builds a softkey per equation variable — store a value, or solve for it |

The Solver parses an algebraic equation and solves for any single variable (directly if it can isolate the unknown, otherwise iteratively from guesses). See the Solver function set below.

### STAT — Statistics & Curve Fitting  (■STAT; menu map printed p.234)

Top STAT menu: **CALC, INSR, DELET, NAME, GET, TOTAL** (list editing: insert/delete items, name a list, get a named list, running total). NAME opens the ALPHA-Edit/ALPHA menu; GET offers `*NEW` and the names of existing lists.

CALC menu (one-variable), pages via `MORE`:
| Softkey | Description |
|---------|-------------|
| TOTAL | sum of the list |
| MEAN | arithmetic mean |
| MEDN | median |
| STDEV | standard deviation |
| RANG | range (max − min) |
| MIN / MAX | smallest / largest value |
| SORT | sort the list |
| FRCST | forecasting / two-variable analysis (prompts to select x and y lists) |

FRCST (two-variable) sub-menus, paged with `MORE`:
| Softkey | Description |
|---------|-------------|
| x-list / y-list | select the independent / dependent lists |
| CORR | correlation coefficient |
| M | slope of the fit |
| B | y-intercept of the fit |
| MODL | choose the curve-fit model: **LIN, LOG, EXP, PWR** |
| W.MN | weighted mean |
| G.SD | grouped standard deviation |
| SIZE | number of items |
| ΣX ΣY ΣX2 ΣY2 ΣXY | summation registers |

### TVM — Time Value of Money  (■TVM; menu map printed p.235)

| Softkey | Description |
|---------|-------------|
| N | number of payments/periods |
| I%YR | annual interest rate (%) |
| PV | present value |
| PMT | payment amount |
| FV | future value |
| OTHER | payment/compounding settings and amortization → sub-menu |

OTHER sub-menu:
| Softkey | Description |
|---------|-------------|
| P/YR | payments (compounding periods) per year |
| BEG / END | begin- / end-of-period payment mode |
| AMRT | amortization → sub-menu |

AMRT sub-menu:
| Softkey | Description |
|---------|-------------|
| #P | number of payments to amortize |
| INT | interest portion |
| PRIN | principal portion |
| BAL | remaining balance |
| NEXT | advance to the next block of payments |
| TABLE | build an amortization schedule → FIRST, LAST, INCR, GO |

### TIME — Clock, Appointments, Date Arithmetic  (■TIME; menu map printed p.236)

Top TIME menu: **CALC, APPT, ADJST, SET**.
| Softkey | Description |
|---------|-------------|
| CALC | date arithmetic: DATE1, DATE2, DAYS, 360D, 365D, TODAY |
| APPT | appointments APT1…APT10 (paged); each has DATE, TIME, A/PM, MSG, RPT, HELP; RPT repeat = NONE/MIN/HR/DAY/WEEK; MSG opens the ALPHA/ALPHA-Edit menu |
| ADJST | adjust the clock: +HR, −HR, +MIN, −MIN, +SEC, −SEC |
| SET | set clock/calendar: DATE, TIME, A/PM, M/D (date format), 12/24 (clock format), HELP |

## Numeric-function menus  (menu tables printed p.237)

### BASE  (■BASE)
| Softkey | Description |
|---------|-------------|
| DEC | decimal mode |
| HEX | hexadecimal mode |
| OCT | octal mode |
| BIN | binary mode |

### PROB  (■PROB)
| Softkey | Description |
|---------|-------------|
| X | (mean-related / x entry) [?] |
| Y | (y entry) [?] |
| C X,Y | combinations of X items taken Y at a time |
| P X,Y | permutations of X items taken Y at a time |
| N! | factorial |
| RAN# | pseudo-random number (0 ≤ r < 1) |

### HYP  (■HYP)
| Softkey | Description |
|---------|-------------|
| SINH | hyperbolic sine |
| COSH | hyperbolic cosine |
| TANH | hyperbolic tangent |
| ASNH | inverse hyperbolic sine |
| ACOSH | inverse hyperbolic cosine |
| ATNH | inverse hyperbolic tangent |

### CONVERT  (■CONVERT; two pages via MORE)
| Softkey | Description |
|---------|-------------|
| >DEG | radians → decimal degrees |
| >RAD | decimal degrees → radians |
| >HR | H.MMSS → decimal hours |
| >HMS | decimal hours → H.MMSS |
| XCORD | x-coordinate of polar (R,∠) |
| YCORD | y-coordinate of polar (R,∠) |
| R | R (radius) of rectangular (x,y) |
| ∠ | ∠ (angle) of rectangular (x,y) |
| D/R | degrees↔radians toggle |

### %CHG  (■%CHG)
| Softkey | Description |
|---------|-------------|
| OLD | old (base) value |
| NEW | new value |
| %CH | percent change from OLD to NEW |

### PARTS  (■PARTS)
| Softkey | Description |
|---------|-------------|
| IP | integer part |
| FP | fractional part |
| RND | round to display format |
| ABS | absolute value |

## Control menus  (printed p.237)

### MODES  (■MODES; two pages via MORE)
| Softkey | Description |
|---------|-------------|
| FIX | fixed-decimal display |
| SCI | scientific display |
| ENG | engineering display |
| ALL | show all significant digits |
| ./, | interchange radix period and comma |
| D/R | degrees / radians angle mode |
| BEEP | toggle the beeper |
| PRNT | printer power (battery / AC) |

### PRINTER  (■PRINTER)
| Softkey | Description |
|---------|-------------|
| LIST | print a list |
| STK | print the calculator line / stack |
| REGS | print the storage registers |
| TIME | print time/date information |
| MSG | print a message |
| TRACE | toggle trace printing |

## Solver functions (Table 5-3) — usable inside SOLVE equations

Arguments may be constants, variables, or algebraic expressions. Many have a keyboard "typing aid" (the same key used in calculator-line arithmetic).

| Function | Description |
|----------|-------------|
| ABS(x) | absolute value |
| ACOS(x) / ASIN(x) / ATAN(x) | inverse trig (current angle mode) |
| ACOSH(x) / ASINH(x) / ATANH(x) | inverse hyperbolic |
| ALOG(x) | common antilog, 10ˣ |
| ANGLE(x:y) | ∠ polar coordinate for rectangular (x,y) |
| CDATE | current date |
| CTIME | current time (H.MMSS, 24-hour) |
| COMB(x:y) | combinations of x taken y at a time |
| COS(x) / SIN(x) / TAN(x) | trig (current angle mode) |
| COSH(x) / SINH(x) / TANH(x) | hyperbolic |
| DATE(date:n) | date n days after/before a date |
| DDAYS(d1:d2:cal) | days between d1 and d2 (cal = 1 actual / 2 365-day / 3 360-day) |
| DEG(x) | radians → decimal degrees |
| RAD(x) | decimal degrees → radians |
| EXP(x) | natural antilog, eˣ |
| EXPM1(x) | eˣ − 1 |
| FACT(x) | factorial (x integer ≥ 0) |
| FP(x) / IP(x) | fractional / integer part |
| HMS(x) | decimal hours(degrees) → H.MMSS |
| HRS(x) | H.MMSS → decimal |
| IDIV(x:y) | integer part of x ÷ y |
| IF(con:alg1:alg2) | conditional: if con true use alg1 else alg2 |
| INT(x) | greatest integer ≤ x |
| INV(x) | reciprocal 1/x |
| ITEM(listname:x) | value of item x in a STAT list |
| LN(x) / LOG(x) | natural / common logarithm |
| LNP1(x) | ln(1 + x) |
| MAX(x:y) / MIN(x:y) | larger / smaller of x and y |
| MOD(x:y) | remainder of x ÷ y |
| PERM(x:y) | permutations of x taken y at a time |
| PI | π (3.14159265359, 12 digits) |
| RADIUS(x:y) | R polar coordinate for rectangular (x,y) |
| RAN# | pseudo-random number (0 ≤ r < 1) |
| RND(x:y) | round x to y decimals / significant digits |
| S(var) | multi-equation variable-menu builder (with IF) |
| SGN(x) | sign of x (+1 / 0 / −1) |
| Σ(cv:c1:c2:s:alg) | summation of alg over counter cv from c1 to c2 step s |
| SIZES(listname) | number of items in a STAT list |
| SPFV(i%:n) | future value of a single $1 payment |
| SPPV(i%:n) | present value of a single $1 payment |
| SQ(x) | x² |
| SQRT(x) | √x |
| TRN(x:y) | truncate x to y decimals / significant digits |
| USFV(i%:n) | future value of a uniform series of $1 payments |
| USPV(i%:n) | present value of a uniform series of $1 payments |
| XCOORD(R:∠) / YCOORD(R:∠) | x / y coordinate of polar (R,∠) |

## Notes
- Menu labels are transcribed from the appendix D "Menu Maps and Tables" (clean line-art) and Table 1-2; Solver names from Table 5-3. Descriptions are paraphrased.
- Two PROB softkeys are rendered `X` and `Y` in the appendix table and their exact role is not spelled out there; marked `[?]`. (`C X,Y` and `P X,Y` are the combination/permutation functions; `N!` factorial; `RAN#` random.)
- `>` in CONVERT labels denotes the "→" conversion arrow (e.g. `>DEG` = →DEG). `∠` renders as the angle symbol on the keys.
- The MAIN display is not an application menu; applications and function/control menus are all reached with the single blue shift key (see the layout file). `MORE` pages long menus; `EXIT`/shift-`EXIT` navigate back / to MAIN.
