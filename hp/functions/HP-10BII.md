# HP-10BII — Function Set

- **Access:** direct keys; SHIFT = orange (function printed below the key); STATS = mauve (summation register printed above keys 4–9)
- **Approx. count:** 62
- **Logic:** Algebraic (chain entry with operator precedence, parentheses, `=`) — not RPN
- **Source:** HP 10bII Financial Calculator User's Guide — "Keyboard Map" p.21; sections on TVM (p.53), cash flows (p.75), interest conversion (p.72), amortization (p.67), business percentages (p.35), statistics (pp.86–88) — hp/manuals/HP-10BII.pdf

## Time Value of Money

| Function | Access | Description |
|----------|--------|-------------|
| N | key | store/compute number of payments (periods) |
| I/YR | key | store/compute annual (nominal) interest rate |
| PV | key | store/compute present value |
| PMT | key | store/compute payment amount |
| FV | key | store/compute future value |
| x P/YR | SHIFT | multiply displayed value by payments-per-year and store into N |
| P/YR | SHIFT | set the number of payments per year |
| BEG/END | SHIFT | toggle Begin (annuity-due) / End (ordinary) payment mode |
| AMORT | SHIFT | amortize a range of payments (balance, interest, principal) |

## Cash Flow (NPV / IRR)

| Function | Access | Description |
|----------|--------|-------------|
| CFj | key | store an uneven cash-flow amount into the cash-flow list |
| Nj | SHIFT | number of consecutive times the cash flow repeats |
| NPV | SHIFT | net present value of the cash-flow list at I/YR |
| IRR/YR | SHIFT | internal rate of return per year for the cash-flow list |

## Interest Conversion

| Function | Access | Description |
|----------|--------|-------------|
| NOM% | SHIFT | nominal annual interest rate |
| EFF% | SHIFT | effective annual interest rate |

## Business Percentages

| Function | Access | Description |
|----------|--------|-------------|
| MU | key | markup as a percent of cost |
| MAR | key | margin as a percent of price |
| CST | key | cost in the margin/markup/cost/price calculation |
| PRC | key | price in the margin/markup/cost/price calculation |
| % | key | percent |
| %CHG | SHIFT | percent change between two values |

## Statistics

| Function | Access | Description |
|----------|--------|-------------|
| Σ+ | key | accumulate one- or two-variable statistical data |
| Σ− | SHIFT | remove data from the statistical registers to correct |
| n | STATS | number of accumulated data points |
| Σx | STATS | sum of x values |
| Σy | STATS | sum of y values |
| Σx² | STATS | sum of x-squared values |
| Σy² | STATS | sum of y-squared values |
| Σxy | STATS | sum of x·y products |
| x̄,ȳ | SHIFT | means of x and y |
| Sx,Sy | SHIFT | sample standard deviations of x and y |
| σx,σy | SHIFT | population standard deviations of x and y |
| x̄w | SHIFT | weighted mean of x |
| x̂,r | SHIFT | linear estimate of x and correlation coefficient r |
| ŷ,m | SHIFT | linear estimate of y and slope m |

## Math

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add |
| − | key | subtract |
| × | key | multiply |
| ÷ | key | divide |
| ( | SHIFT | open parenthesis |
| ) | SHIFT | close parenthesis |
| +/− | key | change sign of number or exponent |
| E | SHIFT | enter exponent of ten |
| 1/x | SHIFT | reciprocal of x |
| yˣ | SHIFT | raise y to the power x |
| √x | SHIFT | square root |
| x² | SHIFT | square |
| LN | SHIFT | natural logarithm |
| eˣ | SHIFT | natural antilog (e to the x) |
| n! | SHIFT | factorial of x |
| RND | SHIFT | round number to current display setting |

## Memory / Registers

| Function | Access | Description |
|----------|--------|-------------|
| →M | key | store displayed value into the M register |
| RM | key | recall the M register |
| M+ | key | add displayed value to the M register |
| STO | SHIFT | store into a numbered register |
| RCL | key | recall a numbered register |
| K | key | store a constant for repeated arithmetic |
| SWAP | SHIFT | exchange the last two numbers (e.g. operands) |
| INPUT | key | separate two numbers / evaluate pending operation |

## Clearing / Display / Mode

| Function | Access | Description |
|----------|--------|-------------|
| C | key | clear display, cancel current calculation |
| ← | key | backspace (erase last digit) |
| C ALL | SHIFT | clear all memory (does not reset modes) |
| CLΣ | SHIFT | clear statistical memory |
| DISP | SHIFT | set number of displayed decimal places |
| ./, | SHIFT | swap radix mark and digit-grouping punctuation |
| ON | key | turn calculator on |
| OFF | SHIFT | turn calculator off |
| SHIFT | key | orange prefix; selects the function below the key |
| STATS | key | mauve prefix; recalls a summation register above the key |

## Notes
- Legends taken from the p.21 Keyboard Map (all legible); descriptions paraphrased from the corresponding manual sections. None left `[?]`.
- SHIFT (orange) and STATS (mauve) are two distinct prefix keys with two distinct annunciators; STATS is dedicated to recalling the six summation registers, while all other shifted functions use SHIFT.
- Digit keys 0–9 and the decimal point are omitted from the count as ordinary numeric entry.
- C ALL clears all data/register memory but leaves calculator modes (P/YR, Begin/End, display format) intact.
