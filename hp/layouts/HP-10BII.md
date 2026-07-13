# HP-10BII — Keyboard Layout

- **Display:** single-line LCD, 12-digit 7-segment (financial format, e.g. `1,000.00`), with annunciators: `SHIFT`, `STATS`, `PEND`, `BEGIN`, `INPUT`, low-battery, `AMORT`/`BAL`/`INT`/`PRIN`/`PER`, `C-FLOW`/`CF`/`N`, `ERROR`/`TVM`/`FULL`/`STAT`/`FUNC`. No dot-matrix menu line — this is not a menu-driven machine.
- **Prefix/shift keys:** two shift keys — an **orange SHIFT** key (blank, row 6 col 1; annunciator `SHIFT`) selects the function printed in **orange below** each key; a **mauve STATISTICS** key (blank, row 5 col 1; annunciator `STATS`) recalls the summation register printed in **mauve above** keys 4–9.
- **Logic / stack:** **Algebraic** (chain entry with operator precedence, `(` `)` and `=`). **Not RPN** — no X/Y/Z/T stack. `INPUT` separates two operands / two-variable data; `SWAP` (orange-K) exchanges the last two numbers.
- **Source:** HP 10bII Financial Calculator User's Guide — "Keyboard Map" p.21 (PDF p.21); "Understanding the Display and Keyboard", "Shift Key" and "Statistics Key" pp.25–27 (PDF pp.25–27) — hp/manuals/HP-10BII.pdf

## Key grid (top row → bottom row, left → right)

| Row | Primary (white) | SHIFT (orange, below key) | STATS (mauve, above key) | Notes |
|-----|-----------------|---------------------------|--------------------------|-------|
| 1 | N | x P/YR | — | TVM: number of payments; SHIFT = multiply x by P/YR into N |
| 1 | I/YR | NOM% | — | TVM: annual interest rate; SHIFT = nominal % |
| 1 | PV | EFF% | — | TVM: present value; SHIFT = effective % |
| 1 | PMT | P/YR | — | TVM: payment; SHIFT = set payments per year |
| 1 | FV | AMORT | — | TVM: future value; SHIFT = amortization |
| 2 | INPUT | — | — | separate two numbers / evaluate pending op |
| 2 | MU | — | — | margin/markup: markup as % of cost |
| 2 | CST | IRR/YR | — | business: cost; SHIFT = internal rate of return per year |
| 2 | PRC | NPV | — | business: price; SHIFT = net present value |
| 2 | MAR | BEG/END | — | business: margin; SHIFT = toggle Begin/End payment mode |
| 3 | K | SWAP | — | constant; SHIFT = exchange last two numbers |
| 3 | % | %CHG | — | percent; SHIFT = percent change |
| 3 | CFj | Nj | — | cash flow amount; SHIFT = number of times cash flow repeats |
| 3 | Σ+ | Σ− | — | accumulate statistical data; SHIFT = remove statistical data |
| 3 | ← | RND | — | backspace; SHIFT = round to display setting |
| 4 | +/− | E | — | change sign; SHIFT = enter exponent |
| 4 | RCL | STO | — | recall register; SHIFT = store into register |
| 4 | →M | CLΣ | — | store to M register; SHIFT = clear statistical memory |
| 4 | RM | ( | — | recall M register; SHIFT = open parenthesis |
| 4 | M+ | ) | — | add to M register; SHIFT = close parenthesis |
| 5 | STATS | — | — | mauve statistics prefix key (blank); recalls a Σ register |
| 5 | 7 | x̄,ȳ | Σx² | SHIFT = means of x and y; STATS = sum of x² |
| 5 | 8 | Sx,Sy | Σy² | SHIFT = sample std dev; STATS = sum of y² |
| 5 | 9 | σx,σy | Σxy | SHIFT = population std dev; STATS = sum of x·y |
| 5 | ÷ | 1/x | — | divide; SHIFT = reciprocal |
| 6 | SHIFT | — | — | orange shift prefix key (blank) |
| 6 | 4 | x̂,r | n | SHIFT = x-estimate & correlation r; STATS = number of data points |
| 6 | 5 | ŷ,m | Σx | SHIFT = y-estimate & slope m; STATS = sum of x |
| 6 | 6 | x̄w | Σy | SHIFT = weighted mean; STATS = sum of y |
| 6 | × | yˣ | — | multiply; SHIFT = y to the x power |
| 7 | C | C ALL | — | clear display / cancel; SHIFT = clear all memory (not modes) |
| 7 | 1 | eˣ | — | digit; SHIFT = natural antilog |
| 7 | 2 | LN | — | digit; SHIFT = natural logarithm |
| 7 | 3 | n! | — | digit; SHIFT = factorial |
| 7 | − | √x | — | subtract; SHIFT = square root |
| 8 | ON | OFF | — | turn on; SHIFT = turn off |
| 8 | 0 | — | — | digit |
| 8 | . | ./, | — | radix; SHIFT = swap radix / digit-grouping punctuation |
| 8 | = | DISP | — | evaluate (algebraic); SHIFT = set display decimal places |
| 8 | + | x² | — | add; SHIFT = square |

## Notes
- **Grid:** 5 columns × 8 rows = 40 keys. Row 1 is the five TVM keys (N, I/YR, PV, PMT, FV). Rows 5–8 columns 2–4 hold the number pad (7-8-9 / 4-5-6 / 1-2-3 / 0-·-=); column 5 of rows 5–8 holds the arithmetic operators (÷ × − +). Column 1 holds N, INPUT, K, +/−, the two prefix keys (STATS, SHIFT), C, and ON.
- **Two prefix keys, two colors.** The **orange SHIFT** key lights the `SHIFT` annunciator and executes the orange legend printed **below** each key. The **mauve STATISTICS** key lights the `STATS` annunciator and recalls the mauve summation register printed **above** keys 4–9 (n, Σx, Σy, Σx², Σy², Σxy). Press a prefix key again to cancel it.
- **Algebraic, not RPN.** Arithmetic is entered left-to-right with operator precedence, parentheses `(` `)`, and terminated by `=`. `INPUT` separates two operands or two-variable statistics data and also evaluates any pending operation. There is no ENTER key and no fixed X/Y/Z/T stack.
- **TVM registers:** N, I/YR, PV, PMT, FV are the five time-value-of-money registers; each stores a typed value or solves for its value from the others. `x P/YR` (SHIFT-N) multiplies the displayed value by the periods-per-year setting into N; P/YR (SHIFT-PMT) sets that setting; BEG/END (SHIFT-MAR) toggles annuity-due vs ordinary annuity.
- **Business row (row 2):** MU (markup), CST (cost), PRC (price), MAR (margin) form the margin/markup/cost/price cluster; INPUT sits at its left. CST, PRC, MAR carry orange shifts (IRR/YR, NPV, BEG/END); MU and INPUT have no orange shift.
- **3-key memory:** →M (store to M), RM (recall M), M+ (add to M) provide a quick single-register memory, distinct from the numbered STO/RCL registers.
- All 40 legends read cleanly from the p.21 Keyboard Map (rendered at high resolution). None left `[?]`.
