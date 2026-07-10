# HP-12C — Function Set

- **Access:** direct keys; f = gold; g = blue
- **Approx. count:** 78
- **Source:** HP-12C Owner's Handbook and Problem-Solving Guide, Function Key Index & Programming Key Index pp. 231–237 — hp/manuals/HP-12C.pdf

## Time Value of Money

| Function | Access | Description |
|----------|--------|-------------|
| n | key | store/compute number of compounding periods |
| i | key | store/compute periodic interest rate |
| PV | key | store/compute present value (initial cash flow) |
| PMT | key | store/compute payment amount |
| FV | key | store/compute future value (final cash flow) |
| 12× | g | multiply x by 12 and store into n |
| 12÷ | g | divide x by 12 and store into i |
| BEG | g | set Begin payment mode |
| END | g | set End payment mode |
| CLEAR FIN | f | clear the financial registers |

## Cash Flow (NPV/IRR)

| Function | Access | Description |
|----------|--------|-------------|
| NPV | f | net present value of up to 20 uneven cash flows |
| IRR | f | internal rate of return (yield) on cash flows |
| CFo | g | store initial cash flow, reset n |
| CFj | g | store a subsequent cash flow amount |
| Nj | g | number of times a cash flow repeats (1–99) |

## Amortization

| Function | Access | Description |
|----------|--------|-------------|
| AMORT | f | amortize x payments; updates PV and n |
| INT | f | simple interest calculation |

## Bonds

| Function | Access | Description |
|----------|--------|-------------|
| PRICE | f | bond price from desired yield to maturity |
| YTM | f | yield to maturity from bond price |

## Depreciation

| Function | Access | Description |
|----------|--------|-------------|
| SL | f | straight-line depreciation |
| SOYD | f | sum-of-the-years-digits depreciation |
| DB | f | declining-balance depreciation |

## Percentages

| Function | Access | Description |
|----------|--------|-------------|
| % | key | x percent of y, retaining y |
| Δ% | key | percent change from Y to X |
| %T | key | percent that x is of total in Y |

## Calendar/Date

| Function | Access | Description |
|----------|--------|-------------|
| DATE | g | date offset by days, with day of week |
| ΔDYS | g | number of days between two dates |
| D.MY | g | set day-month-year date format |
| M.DY | g | set month-day-year date format |

## Statistics

| Function | Access | Description |
|----------|--------|-------------|
| Σ+ | key | accumulate x,y data into statistics registers |
| Σ− | g | remove x,y data to correct accumulation |
| x̄ | g | mean of x and y values |
| x̄w | g | weighted mean of y (item) and x (weight) |
| s | g | sample standard deviation of x and y |
| x̂,r | g | linear estimate of x and correlation coefficient |
| ŷ,r | g | linear estimate of y and correlation coefficient |
| CLEAR Σ | f | clear statistical registers and stack |

## Arithmetic

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add |
| − | key | subtract |
| × | key | multiply |
| ÷ | key | divide |
| CHS | key | change sign of number or exponent |
| yˣ | key | raise Y to power of x |
| 1/x | key | reciprocal of x |
| √x | g | square root of x |
| n! | g | factorial of x |
| eˣ | g | natural antilog, e raised to x |
| LN | g | natural logarithm of x |
| RND | f | round mantissa to current display setting |
| INTG | g | keep integer part, truncate fraction |
| FRAC | g | keep fractional part, truncate integer |
| EEX | key | enter exponent of ten |

## Stack/Memory

| Function | Access | Description |
|----------|--------|-------------|
| ENTER | key | copy X into Y to separate number entries |
| x⇄y | key | swap X and Y registers |
| R↓ | key | roll stack down |
| LSTx | g | recall value from before last operation |
| CLx | key | clear X register to zero |
| STO | key | store X into a register (with arithmetic) |
| RCL | key | recall a register into X |
| CLEAR REG | f | clear stack, storage, statistical, financial registers |

## Programming

| Function | Access | Description |
|----------|--------|-------------|
| P/R | f | toggle Program / Run mode |
| GTO | g | go to a program line number |
| SST | key | single-step forward through program |
| BST | g | back-step through program |
| R/S | key | run / stop program |
| PSE | g | pause about one second to show X |
| x≤y | g | conditional test x ≤ y |
| x=0 | g | conditional test x = 0 |
| MEM | g | memory map of program lines / data registers |
| CLEAR PRGM | f | clear program memory, reset to line 00 |

## Display/Mode

| Function | Access | Description |
|----------|--------|-------------|
| CLEAR PREFIX | f | cancel prefix / show mantissa of X |
| ON | key | turn calculator on / off |
| f | key | gold prefix, selects function above key |
| g | key | blue prefix, selects function on key face |

## Notes
- Legends taken from the keyboard layout (all legible); descriptions paraphrased from the manual's Function Key Index (pp. 231–234) and Programming Key Index (pp. 235–237).
- CLEAR REG clears every register bank (stack, storage, statistical, financial) but leaves program memory intact.
- The two conditional tests (x≤y, x=0) skip the next program line when false.
- Digit keys 0–9 and the decimal point are omitted from the count as ordinary numeric entry.
