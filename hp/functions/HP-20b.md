# HP-20b — Function / Command Set

- **Access:** functions live in three places — **primary keys** (`+ − × ÷`, digits, TVM keys, `=`); **secondary (blue) functions** reached by pressing the teal secondary key then the target key (written `:` + key in the manual); and **menus** opened by a key or secondary function and navigated with `▲`/`▼` (scroll), `INPUT` (store item), `=` (solve item), `ON/CE` (exit). The Math menu holds Trig / Hyperbolic / Probability sub-menus plus PI.
- **Entry modes:** Chain (default), Algebraic (operator precedence), RPN (4-level stack). Set in the Mode menu.
- **Source:** *HP 20b Business Consultant Financial Calculator User's Guide* — Ch.1 Basic Features (Mode menu, pp.8–11), Ch.2 Mathematical Calculations (pp.16–29), Ch.3 Time Value of Money & Amortization & Interest Conversion (pp.30–38), Ch.4 Cash Flows/IRR/NPV (pp.40–44), Ch.5 Bonds (pp.46–48), Ch.6 Date Calculation (pp.49–50), Ch.7 Break-even (p.51), Ch.8 Percent Calculation (pp.53–55), Ch.9 Depreciation (pp.56–59), Ch.10 Statistics (pp.60–63) — hp/manuals/HP-20b.pdf

## Time Value of Money (TVM)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| N | N | stores or solves the number of payments/compounding periods |
| ×P/YR | :N (×P/YR) | multiplies entry by P/YR and stores the product as N |
| I/YR | I/YR | stores or solves the nominal annual interest rate |
| PV | PV | stores or solves present value (loan amount / initial investment) |
| PMT | PMT | stores or solves the periodic payment |
| FV | FV | stores or solves future value (final cash flow) |
| P/YR | :PMT (P/YR) | sets the number of payments per year |
| Beg | :PV (Beg) | payments occur at the beginning of each period |
| End | :FV (End) | payments occur at the end of each period |
| C/YR | Mode / P/YR menu | compounding periods per year (TVM Canada decouples it from P/YR) |
| TVM Canada | Mode menu | activates independent C/YR for Canadian mortgages |
| Reset TVM | :← (Reset) | resets the TVM variables to defaults |

## Amortization

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Amort | Amort | opens the amortization schedule (uses N, I/YR, PV, PMT, P/YR) |
| #P (periods) | Amort menu | number of periods to group per amortization step |
| Balance | Amort menu | loan balance remaining after the group |
| Principal | Amort menu | principal paid over the group of periods |
| Interest | Amort menu | interest paid over the group of periods |

## Interest Rate Conversion

| Function/Command | Access | Description |
|------------------|--------|-------------|
| IConv | :I/YR (IConv) | opens the Interest Conversion menu |
| Nom.% | IConv menu | nominal annual interest rate |
| Eff.% | IConv menu | effective annual interest rate (accounts for compounding) |
| C/YR | IConv menu | compounding periods per year (0 = continuous compounding) |

## Cash Flows, IRR & NPV

| Function/Command | Access | Description |
|------------------|--------|-------------|
| CshFl | CshFl | opens the cash-flow list (CF amounts and #-of-times each occurs) |
| NPV | NPV | opens the Net Present Value analysis menu |
| IRR% | IRR | internal rate of return (discount rate giving NPV = 0) |
| Inv. I% | NPV/IRR menu | investment / discount rate |
| Net PV | NPV menu | net present value of the cash-flow list |
| Net FV | NPV menu | net future value of the cash-flow list |
| Net US | NPV menu | net uniform series (equivalent level periodic payment) |
| Payback | NPV menu | number of periods to recover the investment |
| Discounted Payback | NPV menu | payback periods using discounted cash flows |
| Total | NPV menu | sum of all cash flows (= NPV when Inv. I% = 0) |
| #CF/Yr | NPV/IRR menu | number of cash flows per year (default 1) |

## Bonds

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Bond | Bond | opens the Bond menu |
| Set.Date | Bond menu | settlement date (input only) |
| Mat.Date | Bond menu | maturity or call date (input only) |
| CPN% | Bond menu | annual coupon rate |
| Call | Bond menu | call value per 100 face (input only; 100 at maturity) |
| Yield% | Bond menu | yield to maturity / to call for a given price |
| Price | Bond menu | price per 100 face for a given yield |
| Accrued | Bond menu | interest accrued to settlement (read-only) |
| Actual / Cal.360 | Bond or Mode menu | day-count basis: 365-day actual or 30/360 |
| Annual / Semiannual | Bond or Mode menu | coupon payment frequency |

## Date Calculation

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Date | :Bond (Date) | opens the Date Calculation menu |
| Date1 | Date menu | first date (shows day-of-week indicator) |
| Date2 | Date menu | second date |
| Days | Date menu | number of days between the two dates |
| Actual / Cal.360 | Date / Mode menu | calendar basis for the day count |

## Break-even

| Function/Command | Access | Description |
|------------------|--------|-------------|
| BrkEv | :NPV (BrkEv) | opens the Break-even menu |
| Fixed | BrkEv menu | fixed cost |
| Variable | BrkEv menu | variable cost per unit |
| Price | BrkEv menu | sale price per unit |
| Profit | BrkEv menu | target profit |
| Units | BrkEv menu | break-even quantity (solved) |

## Percent Calculation (Business)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| %calc | :% (% calc) | opens the Percent-Calculation menu |
| Mkup.%C | %calc menu | markup as a percentage of cost |
| Mkup.%P | %calc menu | markup as a percentage of price (margin) |
| Part%Tot. | %calc menu | part as a percentage of total |
| %Change | %calc menu | percent change between an old and a new value |
| % | % | percent of / add or subtract a percentage (keyboard) |

## Depreciation

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Depr | :Amort (Depr) | opens the Depreciation menu |
| Sline | Depr menu | straight-line depreciation |
| SOYD | Depr menu | sum-of-the-years'-digits (accelerated) |
| DecBal | Depr menu | declining-balance (needs declining-balance factor) |
| DBXover | Depr menu | declining-balance with crossover to straight-line |
| Life | Depr sub-menu | asset useful life |
| Start | Depr sub-menu | starting month / date of depreciation |
| Cost | Depr sub-menu | asset cost |
| Salvage | Depr sub-menu | salvage value |
| Factor | Depr sub-menu | declining-balance factor (DecBal / DBXover) |
| Year | Depr sub-menu | year of the depreciation schedule to view |

## Statistics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Data | :CshFl (Data) | opens the Data-entry menu (x list, x-F pairs, or x-y pairs) |
| Stats | :IRR (Stats) | opens the Statistics results menu |
| 2 Vars / 1 Var / 1 Weight | Stats menu | selects two-variable, one-variable, or weighted one-variable |
| Nb Item | Stats menu | number of data items |
| X Mean / Y Mean | Stats menu | mean of the x / y values |
| X Std. Dev / Y Std. Dev | Stats menu | sample standard deviation of x / y |
| X Population Dev / Y Population Dev | Stats menu | population standard deviation of x / y |
| S.E.SamP.X / S.E.SamP.Y | Stats menu | standard error of x / y |
| Predictions | Stats menu | linear-regression forecasting sub-menu (x̂, ŷ, line) |
| Sigma X / Sigma Y | Stats menu | sum of the x / y values |
| Sigma X2 / Sigma Y2 | Stats menu | sum of squares of the x / y values |
| Sigma XY | Stats menu | sum of the x·y products |

## Math — Keyboard (one- and two-number functions)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + − × ÷ | + − × ÷ | the four arithmetic operations |
| +/− | +/− | changes the sign of the entry |
| 1/x | :− (1/x) | reciprocal |
| √ | :× (√) | square root |
| x² | :6 (x²) | square |
| yˣ | :3 (yˣ) | y raised to the x power |
| LN | :4 (LN) | natural logarithm |
| eˣ | :5 (eˣ) | natural exponential |
| SIN / COS / TAN | :7 / :8 / :9 | sine / cosine / tangent (degrees or radians per Mode) |
| ! | :2 (!) | factorial / Gamma (−253 < x ≤ 253) |
| nCr | :. (nCr) | combinations of n taken r |
| nPr | :0 (nPr) | permutations of n taken r |
| RAND | :1 (RAND) | random number, 0 < x < 1 |
| RND | :+ (RND) | rounds x internally to the display format |
| EEX | :+/− (EEX) | begins power-of-ten exponent entry |
| ANS / LAST | := (ANS) | recalls the last result (Chain/Alg) or LAST number (RPN) |

## Math Menu (÷ shifted) — sub-menus

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Math | :÷ (Math) | opens the Math menu |
| Sin / Cos / Tan | Math ▸ Trigonometry | trig functions |
| Sin⁻¹ / Cos⁻¹ / Tan⁻¹ | Math ▸ Trigonometry | inverse trig functions |
| sinh / cosh / tanh | Math ▸ Hyperbolic | hyperbolic functions |
| sinh⁻¹ / cosh⁻¹ / tanh⁻¹ | Math ▸ Hyperbolic | inverse hyperbolic functions |
| PI | Math menu | inserts π into the calculation |
| LTND / LTND⁻¹ | Math ▸ Probability | lower-tail normal distribution and its inverse |
| Student / Student⁻¹ | Math ▸ Probability | Student's t distribution (needs N df) and inverse |
| Chi2 / Chi2⁻¹ | Math ▸ Probability | chi-squared distribution (needs N df) and inverse |
| F-Dist / F-Dist⁻¹ | Math ▸ Probability | F distribution (needs N1, N2 df) and inverse |

## Memory, Store/Recall & Modes

| Function/Command | Access | Description |
|------------------|--------|-------------|
| STO n | :RCL (STO) then 0–9 | stores the displayed number into memory 0–9 |
| RCL n | RCL then 0–9 | recalls memory 0–9 |
| STO ⊕ n | :RCL then + − × ÷ then n | storage arithmetic on a memory register |
| RCL ⊕ n | RCL then + − × ÷ then n | recall arithmetic (RPN saves a stack level) |
| STO / RCL TVM | :RCL / RCL then TVM key | store into / recall a TVM variable without solving |
| Memory | :INPUT (Memory) | opens the Memory menu to view/edit registers 0–9 |
| Mode | :( (Mode) | opens the Mode menu (settings) |
| FIX | Mode menu | number of decimal places displayed |
| Language | Mode menu | English / Français / Deutsch / Español |
| Actual / Cal.360 | Mode menu | calendar basis for bonds and dates |
| Annual / Semiannual | Mode menu | default bond coupon frequency |
| TVM Standard / TVM Canada | Mode menu | enables independent C/YR (Canadian mortgages) |
| Chain / Algebraic / RPN | Mode menu | selects the calculation/entry mode |
| Degrees / Radians | Mode menu | angular mode for trig functions |
| INPUT | INPUT | enters a value into a menu item / pushes the RPN stack |
| ← | ← | backspace / clear-entry digit |
| Reset | :← (Reset) | opens the Reset menu (clear menus / all memory) |
| ON/CE | ON/CE | turns the calculator on / clears the current entry |
| OFF | :ON/CE (OFF) | turns the calculator off |

## RPN Stack (RPN mode only)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ENTER (push) | INPUT or = | pushes x into the 4-level stack (or duplicates level 1) |
| Roll down | ( | rolls the stack toward level 1 (also `▲`/`<` when no menu open) |
| Roll up | ▼ / > | rolls the stack toward level 4 (no menu open) |
| Swap | ) | exchanges stack levels 1 and 2 |
| LAST number | := (ANS) | recalls the saved level-1 value from the last operation |

## Notes
- Menu-item labels (Nom.%, Net US, Mkup.%C, S.E.SamP.X, etc.) are quoted verbatim from the manual's menu tables; sub-menu names shown after `▸`.
- Some menu items also settable from the Mode menu (Actual/Cal.360, Annual/Semiannual) are listed under both their menu and Mode for completeness.
- The `%` key behaves differently by mode: in RPN it computes x% of level 2 without consuming level 2 (allowing add/subtract afterward); in Chain/Algebraic it follows `+`/`−` for add-on/discount.
- No CAS, no programming, no unit conversions, and no complex numbers — the HP-20b is a fixed-function algebraic/RPN business calculator.
