# HP-12C — Keyboard Layout

- **Display:** LCD, 10-digit 7-segment (financial format, e.g. `12.00`)
- **Prefix/shift keys:** f = gold (above key), g = blue (lower key face)
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X
- **Source:** HP-12C Owner's Handbook and Problem-Solving Guide (Edition 2, Jan 1992), inside back cover diagram "The HP-12C Keyboard and Continuous Memory" (unnumbered, PDF p.251); keyboard description page 16 — hp/manuals/HP-12C.pdf

## Key grid (top row → bottom row, left → right)

| Row | Primary (white) | f-shift (gold) | g-shift (blue) | Notes |
|-----|-----------------|----------------|----------------|-------|
| 1 | n | AMORT | 12× | Financial: number of periods |
| 1 | i | INT | 12÷ | Financial: periodic interest rate |
| 1 | PV | NPV | CFo | Financial: present value |
| 1 | PMT | RND | CFj | Financial: payment |
| 1 | FV | IRR | Nj | Financial: future value |
| 1 | CHS | — | DATE | |
| 1 | 7 | — | BEG | |
| 1 | 8 | — | END | |
| 1 | 9 | — | MEM | |
| 1 | ÷ | — | — | |
| 2 | yˣ | PRICE | √x | f PRICE = BOND bracket |
| 2 | 1/x | YTM | eˣ | f YTM = BOND bracket |
| 2 | %T | SL | LN | f SL = DEPRECIATION bracket |
| 2 | Δ% | SOYD | FRAC | f SOYD = DEPRECIATION bracket |
| 2 | % | DB | INTG | f DB = DEPRECIATION bracket |
| 2 | EEX | — | ΔDYS | |
| 2 | 4 | — | D.MY | |
| 2 | 5 | — | M.DY | |
| 2 | 6 | — | x̄w | weighted mean |
| 2 | × | — | — | |
| 3 | R/S | P/R | PSE | |
| 3 | SST | Σ | BST | f Σ = CLEAR Σ |
| 3 | R↓ | PRGM | GTO | f PRGM = CLEAR PRGM |
| 3 | x⇄y | FIN | x≤y | f FIN = CLEAR FIN |
| 3 | CLx | REG | x=0 | f REG = CLEAR REG; primary CLx clears X |
| 3 | ENTER | PREFIX | LSTx | Tall key spanning rows 3–4; g LSTx = LAST X |
| 3 | 1 | — | x̂,r | linear estimate x / correlation |
| 3 | 2 | — | ŷ,r | linear estimate y / correlation |
| 3 | 3 | — | n! | factorial |
| 3 | − | — | — | |
| 4 | ON | — | — | Recessed (lower than other keys) |
| 4 | f | — | — | Gold prefix key |
| 4 | g | — | — | Blue prefix key |
| 4 | STO | — | — | |
| 4 | RCL | — | — | |
| 4 | ENTER (cont.) | — | — | Continuation of the tall ENTER key from row 3 |
| 4 | 0 | — | x̄ | mean |
| 4 | • | — | s | std deviation |
| 4 | Σ+ | — | Σ− | |
| 4 | + | — | — | |

## Notes
- **Financial top row (row 1):** n, i, PV, PMT, FV are the five financial registers (TVM keys), each with a gold f-shift (AMORT, INT, NPV, RND, IRR) and blue g-shift (12×, 12÷, CFo, CFj, Nj) function.
- **Grouping brackets:** BOND spans PRICE/YTM (f-shift of yˣ, 1/x). DEPRECIATION spans SL/SOYD/DB (f-shift of %T, Δ%, %). CLEAR spans Σ/PRGM/FIN/REG (f-shift of SST, R↓, x⇄y, CLx) and extends over PREFIX (f-shift of ENTER).
- **ENTER** is a double-height key occupying rows 3–4 in the 7th column; f-function PREFIX, g-function LSTx (LAST X).
- **ON** sits lower than surrounding keys to prevent accidental presses; pressing ON again turns the calculator off.
- **f** (gold) and **g** (blue) are the two prefix keys on the bottom row.
- Layout is 4 rows × 10 keys = 40 keys.
- Faint scan on the g-legends of keys 1 and 2 (x̂,r / ŷ,r) and the CFo/CFj/Nj subscripts; values cross-checked against the manual's Subject Index (p.246, lists x̂,r, ŷ,r, x̄w) and the CLEAR-keys table (p.19). No legends left [?].
