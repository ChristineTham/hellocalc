# HP-20S — Keyboard Layout

- **Display:** single-line numeric LCD (up to 12 digits, period-or-comma radix) with a separate annunciator line above it (shift ◄l l►, `:` INPUT/pending-result, PEND, low-battery, GRAD, RAD, HEX, OCT, BIN, PRGM)
- **Prefix/shift keys:** **two** shift keys, stacked in the leftmost column — **blue** left-shift (curved-left-arrow key, row 5 col 1; annunciator ◄l) reaches the **left** legend printed above each key; **yellow** right-shift (right-arrow key, row 6 col 1; annunciator l►) reaches the **right** legend. Verified by the base-mode table: HEX = `[blue][HEX]` (left legend of the 4 key), OCT = `[yellow][OCT]` (right legend of the same key).
- **Logic / entry:** **algebraic (ALG)**, not RPN — chain entry with `(` `)`, `INPUT` to separate two numbers, and `=` to evaluate; operator precedence with pending-operation (`PEND`) indication. Keystroke-programmable (`PRGM`, `LBL A–F`, `GTO`, `XEQ`, `R/S`).
- **Alpha:** keys A–F (top-row keys `√x e^x LN y^x 1/x Σ+`) double as program labels and as hexadecimal digits A–F in HEX mode.
- **Source:** HP-20S Owner's Manual — keyboard callout diagram inside front cover (PDF p. 2); ch. 1 "Getting Started" pp. 11–16 (PDF pp. 13–18); base-mode table ch. 4 (PDF pp. 45–46) — hp/manuals/HP-20S.pdf

## Key grid (top row → bottom row, left → right)

Columns: **Primary** = face legend · **Blue-shift** = left legend above key · **Yellow-shift** = right legend above key. Rows 1–2 are 6 keys wide; rows 3–7 are 5 keys wide (`INPUT` is double-width).

| Row | Primary | Blue-shift (left) | Yellow-shift (right) | Notes |
|-----|---------|-------------------|----------------------|-------|
| 1 | √x | x² | x̄w | key A (label / hex digit); x̄w = weighted mean |
| 1 | eˣ | 10ˣ | x̄,ȳ | key B; means of x and y |
| 1 | LN | LOG | Sx,Sy | key C; sample std deviations |
| 1 | yˣ | % | x̂,r | key D; x-estimate & correlation r |
| 1 | 1/x | %CHG | ŷ,r | key E; y-estimate & correlation r |
| 1 | Σ+ | Σ− | m,b | key F; accumulate stat data; Σ− removes; m,b = slope & intercept |
| 2 | STO | →P | →R | rectangular↔polar coordinate conversions |
| 2 | RCL | HYP | π | HYP = hyperbolic prefix for next trig key |
| 2 | SIN | ASIN | DEG | DEG sets degrees mode |
| 2 | COS | ACOS | RAD | RAD sets radians mode |
| 2 | TAN | ATAN | GRD | GRD sets grads mode |
| 2 | R/S | PRGM | BIN[?] | run/stop; PRGM toggles Program mode. Right legend reads "BIN" in the scan but is crossed by a callout arrow and conflicts with BIN on the 5 key — see Notes |
| 3 | INPUT | SWAP | CLPRGM | double-width; separates two numbers / evaluates expression; SWAP exchanges last two entries or x,y; CLPRGM clears program memory |
| 3 | +/− | E | — | change sign; E (blue) begins exponent-of-ten entry; single legend |
| 3 | ( | FIX | SCI | open parenthesis; FIX/SCI display formats |
| 3 | ) | ENG | ALL | close parenthesis; ENG/ALL display formats |
| 3 | ← | LOAD | — | backspace; LOAD (blue) loads a built-in program; single legend |
| 4 | XEQ | GTO | LBL | execute a labelled program; GTO branch; LBL define label |
| 4 | 7 | ▼ | x≤y? | ▼ scrolls/rolls down (menus, stats, binary windows); x≤y? conditional test |
| 4 | 8 | ▲ | x=0? | ▲ scrolls/rolls up; x=0? conditional test |
| 4 | 9 | ABS | RND | absolute value; round to display format |
| 4 | ÷ | IP | FP | integer part; fractional part |
| 5 | ◄l (blue shift) | — | — | blue left-shift key (no legends) |
| 5 | 4 | HEX | OCT | set hexadecimal / octal base |
| 5 | 5 | DEC | BIN | set decimal / binary base |
| 5 | 6 | →HR | →HMS | decimal-hours ↔ hours-minutes-seconds |
| 5 | × | →DEG | →RAD | degrees ↔ radians conversion |
| 6 | l► (yellow shift) | — | — | yellow right-shift key (no legends) |
| 6 | 1 | →kg | →lb | pounds ↔ kilograms |
| 6 | 2 | →°C | →°F | Fahrenheit ↔ Celsius |
| 6 | 3 | →cm | →in | inches ↔ centimetres |
| 6 | − | →l | →gal | gallons ↔ litres |
| 7 | C | OFF | — | clear/cancel; ON printed below the key; OFF (blue) single legend |
| 7 | 0 | ·/, | Cn,r | ·/, toggles radix (period/comma) & digit grouping; Cn,r = combinations |
| 7 | . | SHOW | Pn,r | radix point; SHOW displays full precision; Pn,r = permutations |
| 7 | = | LAST | n! | evaluate expression; LAST recalls last x; n! = factorial |
| 7 | + | CLRG | CLΣ | add; CLRG clears storage registers; CLΣ clears statistics |

## Notes
- **Pioneer-family single-line ALGEBRAIC scientific.** Entry is algebraic with parentheses and `=`; it is **not** RPN. `INPUT` separates the two operands of a two-number function (e.g. `17 INPUT 29 %CHG`) and evaluates a pending expression; the `:` annunciator marks a completed entry or a hidden second result.
- **Two shift keys, stacked at the left:** blue left-shift (◄l) over yellow right-shift (l►). Blue reaches the **left** legend above a key, yellow the **right** legend. This is confirmed by the base-mode table on PDF p. 46 (`[blue] HEX`, `[yellow] OCT`, `[blue] DEC`, `[yellow] BIN`).
- **R/S right legend (`BIN[?]`):** the faceplate scan shows "PRGM" and "BIN" above the `R/S` key, but the "BIN" is overlapped by the diagram's callout arrows, and the manual's base-conversion chapter unambiguously assigns BIN to `[yellow] 5`. The true yellow-shift function of `R/S` therefore could not be confirmed from the manual and is marked `[?]`; the confirmed shifted function of `R/S` is `PRGM` (enter/exit Program mode).
- **Statistical register memory aids:** small labels are silkscreened near the digit keys as reminders of which storage register holds each summation — `n`, `Σx`, `Σy` (near keys 4, 5, ×) and `Σx²`, `Σy²`, `Σxy` (near keys 7, 8, ÷). They are printed reminders, not separate shifted keys.
- **Base modes:** `[blue]HEX` / `[yellow]OCT` / `[blue]DEC` / `[yellow]BIN` switch base; HEX/OCT/BIN annunciators show the current non-decimal base. In HEX mode the top-row keys become hex digits A–F.
- **Built-in programs:** `[blue]←` = `LOAD` loads HP's built-in application programs; `A`–`F` (top-row keys) serve as program labels and hexadecimal digits.
- Legends read directly from the manual's keyboard diagram; only the `R/S` right legend is marked uncertain (`[?]`).
</content>
</invoke>
