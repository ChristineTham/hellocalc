# HP-30b — Function / Command Set

- **Access:** Functions are reached three ways — **primary** (press a key), **secondary** (blue bevel legend: press-release **shift**, then the key), and **tertiary** (press-and-**hold** shift + key; only Black-Scholes is printed on the face, the rest are programming instructions on the supplied overlay). Finance and math **menus** are opened from dedicated keys and navigated with the scroll keys `▲`/`▼` (and `◄`/`►` inside menus); `INPUT` commits a value or drills into a sub-menu.
- **Entry modes:** Chain (default), Algebraic, or RPN — selected in the Mode menu.
- **Source:** *HP 20b/30b Business Consultant / Business Professional User's Guide* — Keyboard Map Legend p.v (PDF p.5); Basic Features / Mode menu ch.1 (PDF pp.9–18); Mathematical Calculations ch.2, incl. Math-menu map Figure 8 (PDF pp.19–31); TVM ch.3–4; Cash-flow / IRR / NPV ch.5; Bond menu ch.7; Date & Black-Scholes chs.8–9; Depreciation, Break-even, Percent-calculation, Statistics chs.10–12; Programming ch.13 — hp/manuals/HP-30b.pdf

## Time Value of Money (TVM)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| N | N | number of payment/compounding periods |
| xP/YR | shift N | multiplies entered value by payments-per-year to set N |
| I/YR | I/YR | nominal annual interest rate |
| PV | PV | present value |
| PMT | PMT | periodic payment amount |
| FV | FV | future value |
| P/YR | shift PMT | sets number of payments per year |
| Beg | shift PV | selects Begin-of-period annuity mode |
| End | shift FV | selects End-of-period annuity mode |
| IConv | shift I/YR | Interest Conversion menu (nominal ⇄ effective rate, with P/YR and C/YR) |
| TVM Canada | Mode menu | enables Canadian-mortgage compounding (C/YR) option |

## Cash Flows, IRR & NPV

| Function/Command | Access | Description |
|------------------|--------|-------------|
| CshFl | CshFl | enters/edits the cash-flow list (initial flow + grouped flows with counts) |
| IRR | IRR | internal rate of return of the cash-flow series |
| NPV | NPV | net present value at the entered periodic rate |
| NFV | NPV menu | net future value |
| NUS | NPV menu | net uniform series / Net US |
| Payback | NPV menu | payback period |
| Discounted payback | NPV menu | discounted payback period |
| MIRR | IRR menu | modified internal rate of return |
| FMRR | IRR menu | financial-management rate of return |
| Investment Rate | IRR menu | investment (reinvestment) rate |

## Bonds

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Bond | Bond | Bond menu: price, yield, and accrued interest |
| Settlement date | Bond menu | bond settlement (purchase) date |
| Maturity date | Bond menu | bond maturity or call date |
| Coupon (CPN%) | Bond menu | annual coupon rate |
| Yield (YLD%) | Bond menu | yield to maturity/call |
| Price | Bond menu | bond price per 100 face value |
| Accrued interest | Bond menu | interest accrued since last coupon |
| Annual / Semiannual | Mode menu | coupon frequency for bond calculations |
| Actual / Cal.360 | Mode menu | day-count basis (actual vs 360-day) |

## Black-Scholes (HP-30b only)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Black-Scholes | hold shift + Bond | option-pricing menu: fair value of call/put options |

## Depreciation & Amortization

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Amort | Amort | Amortization menu: per-period interest, principal, and balance |
| Depr | shift Amort | Depreciation menu |
| Straight Line (SL) | Depr menu | straight-line depreciation |
| Declining Balance (DB) | Depr menu | declining-balance depreciation |
| Sum-of-Years-Digits (SOYD) | Depr menu | sum-of-the-years'-digits depreciation |
| Straight-Line French | Depr menu | French straight-line depreciation [?] |

## Break-even & Percent (Business)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| BrkEv | shift NPV | Break-even menu: fixed cost, variable cost, price, quantity, profit |
| % | % | percent of a number |
| % calc | shift % | Percent-calculation menu: markup on cost, margin, percent change |

## Statistics & Forecasting

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Data | shift CshFl | Data menu: enter one- or two-variable data points |
| Stats | shift IRR | Statistics menu: results of the entered data |
| Mean x̄ / ȳ | Stats menu | means of x and y data |
| Sx / Sy | Stats menu | sample standard deviations |
| σx / σy | Stats menu | population standard deviations |
| Σx / Σy / Σxy | Stats menu | sums and cross-products |
| Σx² / Σy² | Stats menu | sums of squares |
| n | Stats menu | number of data points |
| Linear regression | Stats menu | slope, intercept, correlation |
| x̂ / ŷ | Stats menu | forecast x from y / y from x |
| Weighted mean | Stats menu | weighted mean of x using y as weights |

## Date Calculations

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Date | shift Bond | Date menu: date arithmetic |
| Days between dates | Date menu | number of days between two dates |
| Date ± days | Date menu | date a given number of days from a start date |
| Day of week | Date display | day-of-week digit 1–7 (Mon=1 … Sun=7) shown with any date |
| Date format | Mode menu | mm.ddyyyy or dd.mmyyyy |

## Mathematics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + − × ÷ | keys | four arithmetic operations |
| +/− | +/− | change sign of x |
| EEX | shift +/− | begin exponent-of-ten entry (scientific notation) |
| ( ) | ( and ) | parentheses (Chain/Algebraic order of operations) |
| yˣ | shift 3 | raises y to the x power |
| 1/x | shift − | reciprocal |
| x² | shift 6 | square |
| √ | shift × | square root |
| LN | shift 4 | natural logarithm |
| eˣ | shift 5 | natural exponential |
| SIN / COS / TAN | shift 7 / 8 / 9 | trigonometric functions |
| nPr | shift 0 | permutations of n taken r |
| nCr | shift . | combinations of n taken r |
| ! | shift 2 | factorial / Gamma of x (−253 < x < 253) |
| RAND | shift 1 | random number in 0 < x < 1 |
| SEED | shift STO then RAND | seeds the random-number generator |
| RND | shift + | rounds x to the current display format |
| ANS | shift = | recalls last result (Chain/Alg) / Last Number (RPN) |
| Math | shift ÷ | opens the Math menu (below) |

### Math menu (shift ÷)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Trigonometry ▸ SIN⁻¹ / COS⁻¹ / TAN⁻¹ | Math ▸ Trigonometry | inverse trigonometric functions |
| Hyperbolic ▸ SINH / COSH / TANH | Math ▸ Hyperbolic | hyperbolic functions |
| Hyperbolic ▸ SINH⁻¹ / COSH⁻¹ / TANH⁻¹ | Math ▸ Hyperbolic | inverse hyperbolic functions |
| ABS | Math menu | absolute value |
| PI | Math menu | inserts π |
| LOG | Math menu | common (base-10) logarithm |
| ALOG (10ˣ) | Math menu | common antilogarithm (base-10 exponential) |
| IP | Math menu | integer part of x (HP-30b only) |
| FP | Math menu | fractional part of x (HP-30b only) |
| Probability ▸ Student / Student⁻¹ | Math ▸ Probability | Student's-t distribution and inverse |
| Probability ▸ Chi² / Chi²⁻¹ | Math ▸ Probability | chi-square distribution and inverse |
| Probability ▸ F / F⁻¹ | Math ▸ Probability | F-distribution and inverse |
| Probability ▸ Binomial | Math ▸ Probability | binomial probability of ≤k successes in n trials |

## Memory & Storage

| Function/Command | Access | Description |
|------------------|--------|-------------|
| STO | shift RCL | stores x into a numbered register / variable |
| RCL | RCL | recalls a register / variable |
| Memory | shift INPUT | Memory menu (register management) |
| INPUT | INPUT | commits a value to the highlighted menu variable; ENTER in RPN |

## Modes & Display

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Mode | shift ( | opens the Mode menu |
| FIX | Mode menu | display precision, 0–11 digits (−1 = automatic) |
| Chain / Algebraic / RPN | Mode menu | selects the calculation/entry mode |
| Degree / Radian | Mode menu | angular mode for trigonometry |
| Date format | Mode menu | mm.ddyyyy or dd.mmyyyy |
| Radix (1.23 / 1,23) | Mode menu | decimal separator: point or comma |
| Actual / Cal.360 | Mode menu | calendar basis for bonds and dates |
| Annual / Semiannual | Mode menu | bond coupon frequency |
| TVM Standard / TVM Canada | Mode menu | Canadian-mortgage compounding option |
| ON/CE | ON/CE | turns the calculator on; clears entry / cancels |
| OFF | shift ON/CE | turns the calculator off |
| ← (Backspace) | ← | erases the last digit/symbol entered |
| Reset | shift ← | Reset menu (clear registers / all memory) |
| INS / DEL | shift ▲ / shift ▼ | insert / delete in list and program editing |

## Programming (HP-30b only)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| PRGM | shift ) | opens the Program menu (up to 10 keystroke programs) |
| STOP | hold shift (overlay) | ends a program |
| Scroll ▲ / ▼ as instructions | hold shift + ▲ / ▼ (overlay) | insert menu-scroll steps into a program |
| INPUT / ON/CE / ← as instructions | hold shift + key (overlay) | insert those keystrokes as program steps |
| Reassign menu function to key | Program menu | bind a menu function (e.g. ASIN) onto a key's hold-shift slot |

## Notes
- Names follow the manual's Keyboard Map Legend and chapter tables; sub-menu contents (Math menu) come from the Figure 8 menu map (PDF p.28). One-line descriptions are original summaries.
- `[?]` marks a single uncertain item: "Straight-Line French" is a depreciation method offered by the HP-30b family but was not explicitly confirmed word-for-word in the extracted text; the other three depreciation methods (SL, DB, SOYD) are confirmed.
- Tertiary (hold-shift) programming instructions are printed on a snap-on overlay, not the keyboard face; only Black-Scholes appears as a printed tertiary legend.
- IP and FP (Math menu) and the entire Programming chapter apply to the **HP-30b** only, not the HP-20b that shares this manual.
