# HP-30b — Keyboard Layout

- **Display:** two-line, alphanumeric scrolling dot-matrix LCD. The top line shows operation status, operator symbols, annunciators, and abbreviations of variable/menu names; the bottom line shows the number being entered or the result (default `0.00`). Contrast is adjustable; a blinking cursor `_` marks number-entry mode. Annunciator row at top-right: `=` (pending operation), shift down-arrow `▼` (secondary function armed), `RAD` (radians angular mode), `360` (Cal.360 calendar mode), `RPN` (RPN entry mode), and a day-of-week digit (1–7) when a date is shown.
- **Prefix/shift keys:** a **single shift key** — the blank blue key in the lower-left of the keypad (row 6, col 1). It arms two shifted planes:
  - **Secondary** functions are printed **in blue on the bevel (lower part) of each key**; press and release **shift**, then the key. When shift is armed the down-arrow annunciator shows.
  - **Tertiary** functions are printed **above** specific keys; press and **hold** shift while pressing the key below the printed function. On the physical faceplate only **Black-Scholes** (`Black S`, above the `Bond` key) is silk-screened as a tertiary legend; the other tertiary (programming) instructions are supplied on a separate snap-on **overlay**, not printed on the keyboard.
- **Logic / stack:** selectable entry mode via the Mode menu — **Chain** (left-to-right, default), **Algebraic** (operator precedence + parentheses), or **RPN** (Reverse Polish Notation). In RPN the `INPUT` key acts as ENTER, the `(` key rolls the stack down (`↓`), and the `)` key swaps X↔Y (`x`).
- **Source:** *HP 20b/30b Business Consultant / Business Professional User's Guide* — "HP 30b Business Professional" labelled keyboard photo, p.iv (PDF p.4); "Keyboard Map Legend", p.v (PDF p.5); "Key Presses, the Shift Key, Secondary, and Tertiary Functions" pp.4–5 (PDF pp.12–13); Mode-menu / calculation-mode pp.2–4 (PDF pp.10–12) — hp/manuals/HP-30b.pdf

## Key grid (top row → bottom row, left → right)

Columns: **Primary** = white top legend · **Shift (secondary)** = blue bevel legend (shift then key) · **Tertiary** = printed above key (hold shift + key).

| Row | Primary | Shift (secondary) | Tertiary | Notes |
|-----|---------|-------------------|----------|-------|
| 1 | N | xP/YR | — | TVM: number of periods; secondary sets periods-per-N multiplier |
| 1 | I/YR | IConv | — | TVM: annual interest rate; secondary = Interest Conversion menu |
| 1 | PV | Beg | — | TVM: present value; secondary = Begin annuity mode |
| 1 | PMT | P/YR | — | TVM: payment; secondary sets payments-per-year |
| 1 | FV | End | — | TVM: future value; secondary = End annuity mode |
| 1 | Amort | Depr | — | Amortization menu; secondary = Depreciation menu |
| 2 | CshFl | Data | — | Cash-flow list entry; secondary = Data (statistics data) menu |
| 2 | IRR | Stats | — | Internal rate of return; secondary = Statistics menu |
| 2 | NPV | BrkEv | — | Net present value; secondary = Break-even menu |
| 2 | Bond | Date | Black S | Bond menu; secondary = Date-calculation menu; tertiary = Black-Scholes menu (hold shift + key) |
| 2 | % | % calc | — | Percent; secondary = Percent-calculation (business: markup/margin) menu |
| 2 | RCL | STO | — | Recall; secondary = Store |
| 3 | INPUT | Memory | — | Enters/commits a value (ENTER in RPN); secondary = Memory menu. Double-width key |
| 3 | ( | Mode | — | Open parenthesis; also rolls stack down (`↓`) in RPN; secondary = Mode menu |
| 3 | ) | PRGM | — | Close parenthesis; also swaps X↔Y (`x`) in RPN; secondary = Program menu |
| 3 | +/− | EEX | — | Change sign; secondary = enter exponent (scientific notation) |
| 3 | ← | Reset | — | Backspace / clear entry; secondary = Reset menu |
| 4 | ▲ | INS | — | Scroll up; secondary = Insert |
| 4 | 7 | SIN | — | |
| 4 | 8 | COS | — | |
| 4 | 9 | TAN | — | |
| 4 | ÷ | Math | — | Divide; secondary = Math menu |
| 5 | ▼ | DEL | — | Scroll down; secondary = Delete |
| 5 | 4 | LN | — | secondary = natural log |
| 5 | 5 | eˣ | — | secondary = natural exponential |
| 5 | 6 | x² | — | secondary = square |
| 5 | × | √ | — | Multiply; secondary = square root |
| 6 | (shift) | — | — | the blue shift/prefix key itself (blank) |
| 6 | 1 | RAND | — | secondary = random number |
| 6 | 2 | ! | — | secondary = factorial |
| 6 | 3 | yˣ | — | secondary = power |
| 6 | − | 1/x | — | Subtract; secondary = reciprocal |
| 7 | ON/CE | OFF | — | On / Clear-Entry / Cancel; secondary = turn off |
| 7 | 0 | nPr | — | secondary = permutations |
| 7 | . | nCr | — | radix; secondary = combinations |
| 7 | = | ANS | — | equals / evaluate; secondary = recall last answer/last number |
| 7 | + | RND | — | Add; secondary = round to display format |

## Notes
- **Grid:** the top two rows are 6 keys wide (TVM row + finance-menu row). Row 3 has the double-width `INPUT` key (spanning the two leftmost columns) followed by `(`, `)`, `+/−`, `←`. Rows 4–7 form a 5-column block: a left scroll/shift/on column (`▲`, `▼`, shift, `ON/CE`) and the 4×5 number/operator pad (`7 8 9 ÷` / `4 5 6 ×` / `1 2 3 −` / `0 . = +`). Overall footprint ≈ 6 columns × 7 rows.
- **One shift key, two shifted planes.** The single blue shift key gives every key its blue **secondary** function (printed on the bevel) via *press-release-then-key*, and a **tertiary** function via *hold-shift-and-key*. Only the `Black S` (Black-Scholes) tertiary legend is silk-screened on the faceplate (above `Bond`); the remaining tertiary functions are the programming instructions, which HP prints on a separate overlay so the keyboard stays uncluttered.
- **Selectable entry mode.** Chain (default), Algebraic, or RPN — chosen in the Mode menu (`shift`+`(`), cycled with `INPUT`. The `RPN` annunciator lights in RPN mode. In RPN, `INPUT`=ENTER, `(`=roll-down (`↓` shown on the key), `)`=X↔Y swap (`x` shown on the key).
- **Menu-driven finance.** The two top rows put the TVM registers (N, I/YR, PV, PMT, FV) and the finance menus (cash flows, IRR, NPV, bonds, percent, amortization, depreciation, break-even, statistics, dates, interest conversion, Black-Scholes) directly on dedicated keys; `INPUT` commits a value into the highlighted menu variable, and each register key solves for its variable when pressed with no pending entry.
- **Programmable (HP-30b only).** Up to ten keystroke programs; the Program menu opens via `shift`+`)` (`PRGM`). Programming instructions are entered by hold-shift + key using the supplied keyboard overlay and are not printed on the keyboard face.
- All primary and secondary (blue bevel) legends read cleanly from the p.iv keyboard photo; none left `[?]`.
