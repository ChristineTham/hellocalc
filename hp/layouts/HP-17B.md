# HP-17B — Keyboard Layout

- **Display:** two-line dot-matrix LCD; the upper line is the calculation/entry line, the lower line shows up to six menu labels (softkey labels). Contrast is adjustable. `BUSINESS` annunciator at top right.
- **Prefix/shift keys:** a single shift key — a blank gold/tan key in the lower-left of the keypad (row 6, col 1). The shifted function is printed in **gold ABOVE** each key. In the manual it is drawn as a small gold ■ before the shifted legend (e.g. `■ CLEAR DATA`).
- **Logic / stack:** **Algebraic** (chain, with `(` `)` and `=`). **No RPN mode** — unlike the HP-17BII. There is no X/Y/Z/T stack; results carry through the algebraic entry line and via `LAST` and `RCL`.
- **Source:** HP-17B Owner's Manual — cover faceplate photo (PDF p.1); "Using the Menu Keys" labelled keyboard diagram, ch.1 Getting Started p.20 (PDF p.26); appendix C "Menu Maps" pp.243–248 (PDF pp.249–254) — hp/manuals/HP-17B.pdf

## Key grid (top row → bottom row, left → right)

| Row | Primary | Shift (gold) | Notes |
|-----|---------|--------------|-------|
| 1 | ▲(menu key 1) | — | top row = 6 menu/softkeys (each an up-caret ▲); MAIN labels FIN / BUS / SUM / TIME / SOLVE map to keys 1–5 |
| 1 | ▲(menu key 2) | — | |
| 1 | ▲(menu key 3) | — | |
| 1 | ▲(menu key 4) | — | |
| 1 | ▲(menu key 5) | — | |
| 1 | ▲(menu key 6) | — | 6th softkey blank in the MAIN menu; used by 6-item menus |
| 2 | STO | — | store to a variable / register |
| 2 | RCL | — | recall a variable / register |
| 2 | % | MATH | shift = MATH menu (LOG, 10^X, LN, EXP, N!, PI) |
| 2 | DSP | MODES | primary = DSP (FIX/ALL/radix) menu; shift = MODES menu |
| 2 | PRT | PRINTER | primary = print; shift = PRINTER menu |
| 2 | EXIT | MAIN | exit current menu; shift = jump to MAIN menu |
| 3 | ▲ (menu roll up) | — | scroll a multi-line menu / list up |
| 3 | INPUT | CLEAR DATA | enter a value into the highlighted variable / list item |
| 3 | +/− | E | change sign; shift = exponent entry (×10ⁿ) |
| 3 | ( | — | open parenthesis |
| 3 | ) | — | close parenthesis |
| 3 | ← | — | backspace / clear entry (leftward arrow key) |
| 4 | ▼ (menu roll down) | — | scroll a multi-line menu / list down |
| 4 | 7 | — | |
| 4 | 8 | — | |
| 4 | 9 | — | |
| 4 | ÷ | 1/x | reciprocal |
| 5 | ■ (shift) | — | the gold shift/prefix key itself (blank) |
| 5 | 4 | — | |
| 5 | 5 | — | |
| 5 | 6 | — | |
| 5 | × | yˣ | raise y to the x power |
| 6 | CLR | OFF | clear display/entry; shift = turn calculator off |
| 6 | 1 | — | |
| 6 | 2 | — | |
| 6 | 3 | — | |
| 6 | − | √x | square root |
| 7 | 0 | MEM | shift = MEM (memory availability) menu |
| 7 | . | SHOW | radix; shift = show full precision briefly |
| 7 | = | LAST | evaluate (algebraic); shift = recall last result/argument |
| 7 | + | x² | square |

## Notes
- **Grid:** 6 columns × 7 rows. Row 1 is the six menu softkeys. The number pad (7-8-9 / 4-5-6 / 1-2-3 / 0-.-=) occupies columns 2–4 of rows 4–7; the arithmetic operators ÷ × − + occupy the rightmost column (col 6) of rows 4–7; column 5 of rows 4–7 is empty (the `(`, `)`, `←` keys sit in row 3). Column 1 holds the menu-roll ▲/▼, the gold shift key, and CLR.
- **Menu-driven, algebraic.** The HP-17B has no fixed key set for most functions; features live in nested menus reached from the six softkeys. The starting point is the **MAIN** menu: **FIN, BUS, SUM, TIME, SOLVE** (5 labels; the 6th softkey is unused in MAIN). `EXIT` backs out one menu level; shift-`EXIT` (MAIN) returns to the top.
- **Single gold shift.** One blank gold shift key; every shifted (gold) legend is printed above its key: MATH, MODES, PRINTER, MAIN, CLEAR DATA, E, 1/x, yˣ, √x, x², OFF, MEM, SHOW, LAST.
- **No RPN.** This is the algebraic-only HP-17B. Arithmetic is entered left-to-right with operator precedence, parentheses `(` `)`, and terminated by `=`. There is no ENTER/stack-lift behaviour. (The visually identical HP-17BII adds an RPN/ALG mode switch and a CURRX currency menu; neither is present here.)
- **Menu keys double as variable keys.** When a menu of built-in variables is shown (e.g. TVM's N, I%YR, PV, PMT, FV), a softkey stores a typed value into that variable, or — pressed with no pending entry — solves for it. `RCL` + softkey shows the stored value; shift-`INPUT` (CLEAR DATA) zeroes the current menu's variables or list.
- **INPUT** commits a number into the highlighted list/variable (SUM lists, CFLO cash-flow lists, appointment fields).
- All legends read cleanly from the cover photo and the p.20 keyboard diagram; none left `[?]`.
