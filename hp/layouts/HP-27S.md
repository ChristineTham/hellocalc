# HP-27S — Keyboard Layout

- **Display:** two-line dot-matrix LCD. The upper line is the calculation/entry line (and messages); the lower line shows up to six menu labels (softkey labels) that relabel the top row of keys. Contrast adjustable; status annunciators along the top.
- **Prefix/shift keys:** a single shift key — a blank blue/purple ■ key at the left of the keypad (row 6, col 1). The shifted function is printed in **blue ABOVE** each key. In the manual it is drawn as a small blue ■ before the shifted legend (e.g. `■ SOLVE`). No second (gold) shift.
- **Logic / stack:** **Algebraic** (chain, with operator precedence, `(` `)` and `=`). **No RPN mode.** There is no fixed X/Y/Z/T stack; results carry through the algebraic entry line and via `LAST` and stored variables/registers (`STO`/`RCL`).
- **Source:** HP-27S Owner's Manual — cover faceplate photo (PDF p.1); labelled keyboard diagram in ch.1 "Getting Started" (PDF p.2); "Table 1-2. Menus" printed p.24 (PDF p.30); appendix D "Menu Maps and Tables" printed pp.233–237 (PDF pp.239–243); Solver functions "Table 5-3" printed pp.98–102 (PDF pp.104–108) — hp/manuals/HP-27S.pdf

## Key grid (top row → bottom row, left → right)

| Row | Primary | Shift (blue) | Notes |
|-----|---------|--------------|-------|
| 1 | ∧ (menu key 1) | √x | top row = 6 menu/softkeys (each an up-caret ∧); relabelled by the lower display line |
| 1 | ∧ (menu key 2) | x² | |
| 1 | ∧ (menu key 3) | eˣ | |
| 1 | ∧ (menu key 4) | LN | |
| 1 | ∧ (menu key 5) | yˣ | |
| 1 | ∧ (menu key 6) | 1/x | |
| 2 | STO | 10ˣ | store to a variable / register |
| 2 | RCL | LOG | recall a variable / register |
| 2 | SIN | ASIN | |
| 2 | COS | ACOS | |
| 2 | TAN | ATAN | |
| 2 | EXIT | MAIN | exit / back up one menu; shift = restore the MAIN display |
| 3 | INPUT | CLEAR DATA | double-width key; commit a value into the highlighted variable / list item |
| 3 | +/− | E | change sign; shift = exponent entry (×10ⁿ) |
| 3 | ( | % | open parenthesis; shift = percent |
| 3 | ) | π | close parenthesis; shift = recall π |
| 3 | ← | — | backspace / clear entry (leftward arrow key) |
| 4 | ▲ | — | scroll a multi-line menu / list up |
| 4 | 7 | SOLVE | shift = SOLVE (equation solver) application |
| 4 | 8 | STAT | shift = STAT (statistics) application |
| 4 | 9 | TVM | shift = TVM (time value of money) application |
| 4 | ÷ | TIME | shift = TIME (clock/appointments/dates) application |
| 5 | ▼ | — | scroll a multi-line menu / list down |
| 5 | 4 | BASE | shift = BASE (number-base conversion) menu |
| 5 | 5 | PROB | shift = PROB (probability) menu |
| 5 | 6 | HYP | shift = HYP (hyperbolic functions) menu |
| 5 | × | CONVERT | shift = CONVERT (angle/coordinate/time conversions) menu |
| 6 | ■ (shift) | — | the blue shift/prefix key itself (blank) |
| 6 | 1 | %CHG | shift = %CHG (percent change) menu |
| 6 | 2 | PARTS | shift = PARTS (number-part functions) menu |
| 6 | 3 | MODES | shift = MODES (display/angle/beeper/print modes) menu |
| 6 | − | PRINTER | shift = PRINTER (printing control) menu |
| 7 | CLR | OFF | clear the calculator line; `ON` printed below the key; shift = turn calculator off |
| 7 | 0 | MEM | shift = MEM (available memory) |
| 7 | . | SHOW | radix; shift = show full precision briefly |
| 7 | = | LAST | evaluate (algebraic); shift = recall last result/argument |
| 7 | + | PRT | add; shift = print the calculator line |

## Notes
- **Grid:** 6 columns × 7 rows. Row 1 is the six menu softkeys (up-caret ∧ keys). The number pad (7-8-9 / 4-5-6 / 1-2-3 / 0-.-=) occupies columns 2–4 of rows 4–7; the arithmetic operators ÷ × − + occupy the rightmost of the five keys in rows 4–7. Column 1 of rows 4–7 holds the list-scroll ▲/▼, the blue ■ shift key, and CLR/ON. `INPUT` is a double-width key spanning the two leftmost columns of row 3.
- **Menu-driven, algebraic.** Like the HP-17B/18C, the HP-27S has no fixed key for most functions; features live in nested menus reached from the six softkeys and selected with the blue shift key. Unlike the 17B there is **no MAIN application menu row** — the "MAIN display" is the bare calculation line. Applications and function/control menus are entered directly with shifted keys (SOLVE, STAT, TVM, TIME, BASE, PROB, HYP, CONVERT, %CHG, PARTS, MODES, PRINTER). `EXIT` backs out one menu level; shift-`EXIT` (`MAIN`) returns to the MAIN display.
- **Single blue shift.** One blank blue ■ shift key; every shifted (blue) legend is printed above its key: √x, x², eˣ, LN, yˣ, 1/x, 10ˣ, LOG, ASIN, ACOS, ATAN, MAIN, CLEAR DATA, E, %, π, SOLVE, STAT, TVM, TIME, BASE, PROB, HYP, CONVERT, %CHG, PARTS, MODES, PRINTER, OFF, MEM, SHOW, LAST, PRT.
- **No RPN.** Arithmetic is entered left-to-right with operator precedence, parentheses `(` `)`, and terminated by `=`. There is no ENTER/stack-lift behaviour. (This is a scientific cousin of the algebraic 17B; the 27S adds the scientific/trig/hyperbolic key set and the SOLVE equation solver.)
- **Menu keys double as variable keys.** When a menu of variables is shown (e.g. TVM's N, I%YR, PV, PMT, FV, or the SOLVE equation's variables), a softkey stores a typed value into that variable, or — pressed with no pending entry — solves/calculates it. `RCL` + softkey shows the stored value; `INPUT` commits a number into a highlighted list item (STAT lists, appointment fields). Shift-`INPUT` (CLEAR DATA) clears the current menu's variables or list.
- **Applications (4):** SOLVE (equation solver), STAT (statistics + curve fitting), TVM (time value of money), TIME (clock / appointments / date arithmetic). **Numeric-function menus (6):** BASE, PROB, HYP, CONVERT, %CHG, PARTS. **Control menus (2):** MODES, PRINTER.
- All legends read cleanly from the cover photo and the ch.1 keyboard diagram; none left `[?]`.
