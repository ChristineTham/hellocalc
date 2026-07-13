# HP-32S — Keyboard Layout

- **Display:** single-line 12-character dot-matrix LCD (also shows menu labels along the line and an annunciator/menu-pointer row; e.g. the STAT menu shows `Σ  x̄,ȳ  s  L.R.` with ▼ pointers under the menu keys)
- **Prefix/shift keys:** one gold shift key (blank orange/gold rectangle ■, row 6 col 1); the shifted function is printed in gold ABOVE each key
- **Logic / stack:** RPN 4-level (X Y Z T) + LAST X
- **Source:** HP-32S Owner's Manual, keyboard diagram on the inside/opening pages (PDF page 2) — hp/manuals/HP-32S.pdf

## Key grid (top row → bottom row, left → right)

Columns: **Primary** = face legend · **Shift (gold)** = gold legend printed above the key · **Letter** = the small letter (A–Z / i) printed at the key's lower-right for variable & label entry.

| Row | Primary | Shift (gold) | Letter | Notes |
|-----|---------|--------------|--------|-------|
| 1 | √x | x² | A | |
| 1 | eˣ | 10ˣ | B | |
| 1 | LN | LOG | C | |
| 1 | yˣ | % | D | |
| 1 | 1/x | %CHG | E | |
| 1 | Σ+ | Σ− | — | rightmost column; no letter |
| 2 | STO | CMPLX | G | (letter F is not silkscreened — see Notes) |
| 2 | RCL | π | H | |
| 2 | R↓ | HYP | I | roll-down |
| 2 | SIN | ASIN | J | |
| 2 | COS | ACOS | K | |
| 2 | TAN | ATAN | L | |
| 3 | ENTER | LAST x | M | wide key |
| 3 | x⇄y | PARTS | N | x-exchange-y (printed x≷y) |
| 3 | +/− | MODES | O | change sign |
| 3 | E | DISP | P | exponent entry (EEX) |
| 3 | ← | CLEAR | — | backspace |
| 4 | XEQ | GTO | — | |
| 4 | 7 | P↔RECT | Q | polar↔rectangular |
| 4 | 8 | H↔HMS | R | hours↔hrs-min-sec |
| 4 | 9 | D↔RAD | S | degrees↔radians |
| 4 | ÷ | BASE | — | |
| 5 | ▼ | ▲ | — | scroll key; ▲ is its gold shift |
| 5 | 4 | LBL/RTN | T | |
| 5 | 5 | LOOP | U | ISG/DSE loop menu |
| 5 | 6 | FLAGS | V | |
| 5 | × | TESTS | — | comparison-test menu |
| 6 | ■ (shift) | — | — | the gold shift/prefix key itself (blank) |
| 6 | 1 | SOLVE/∫ | W | root-finder & numeric integration |
| 6 | 2 | STAT | X | statistics menu |
| 6 | 3 | PROB | Y | probability menu |
| 6 | − | MEM | — | memory catalog |
| 7 | C | OFF | — | ON printed below C; OFF is its gold shift |
| 7 | 0 | INPUT | Z | |
| 7 | . | SHOW | i | radix / index register i |
| 7 | R/S | PRGM | (i) | run/stop; (i) = indirect via i |
| 7 | + | VIEW | — | |

## Notes
- **Pioneer-series single-shift RPN scientific** (1988). One gold shift key; every shifted function is printed in gold above its key. Close relative of the HP-42S/HP-33S/HP-35s chassis.
- **Two functions per key** (face legend + gold shift), plus a small letter A–Z (and `i`, `(i)`) at the lower-right of most keys for typing variable/label names; the `A..Z` annunciator lights when alpha entry is active.
- **Letter sequence** runs A B C D E (row 1), then G H I J K L (row 2) … Z — the letter **F is not silkscreened on any key** (the Σ+ key, which would fall at that position, carries no letter).
- **Menu system:** several keys open single-line menus shown along the display (BASE, FLAGS, TESTS, PARTS, PROB, STAT/`Σ x̄,ȳ s L.R.`, MODES, DISP, CLEAR, MEM, LOOP, CMPLX). The boxed area of number keys 7-9 / 4-6 / 1-3 and their neighbours act as the menu (softkey) selectors; ▼/▲ page through multi-row menus and lists; **C** cancels a menu/display/program entry.
- **Stack:** classic 4-level RPN (X, Y, Z, T) with a LAST X register; R↓ rolls the stack, x⇄y exchanges X and Y.
- **C** doubles as ON (power on, printed below the key); its gold shift is OFF.
- Complex numbers are handled via the **CMPLX** prefix (gold-STO); fractions via the fraction-display facilities; base conversions via **BASE** (gold-÷).
- All face and gold legends on the keyboard diagram are legible; none marked `[?]`.
