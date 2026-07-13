# HP-20S — Function / Command Set

- **Access:** Functions live on the keyboard as a primary face legend, a **blue** left-shift (left legend above the key, written `[b]`), or a **yellow** right-shift (right legend above the key, written `[y]`). Entry is **algebraic**: build expressions with `(` `)`, separate two-number operands with `INPUT`, and evaluate with `=`. Keys `A`–`F` (top row) act as program labels and hexadecimal digits.
- **Approx. count:** ~90
- **Source:** HP-20S Owner's Manual — ch. 1 Getting Started (PDF pp. 13–18), ch. 2 arithmetic/display, ch. 3 memory & statistics, ch. 4 base conversions (PDF pp. 45–52), ch. 5–7 programming — hp/manuals/HP-20S.pdf

## Entry & Stack (algebraic)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| INPUT | INPUT | separates the two operands of a two-number function; evaluates the pending expression |
| SWAP | [b] INPUT | exchanges the last two entries, the two results of a two-value function, or x and y in statistics |
| ( | ( | opens a parenthesis (raises precedence) |
| ) | ) | closes a parenthesis |
| = | = | evaluates the displayed expression |
| LAST | [b] = | recalls the last argument used (last x) |
| ← | ← | backspace / clears the current entry |
| C | C | clears the display and cancels the current operation |

## Arithmetic & Numeric

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + | + | addition |
| − | − | subtraction |
| × | × | multiplication |
| ÷ | ÷ | division |
| +/− | +/− | changes the sign of the number |
| 1/x | 1/x | reciprocal |
| √x | √x | square root |
| x² | [b] √x | square |
| yˣ | yˣ | y raised to the x power |
| % | [b] yˣ | percent |
| %CHG | [b] 1/x | percent change |
| ABS | [b] 9 | absolute value |
| RND | [y] 9 | rounds to the current display format |
| IP | [b] ÷ | integer part |
| FP | [y] ÷ | fractional part |
| n! | [y] = | factorial |
| π | [y] RCL | inserts pi |
| E | [b] +/− | begins exponent-of-ten entry |

## Logarithmic & Exponential

| Function/Command | Access | Description |
|------------------|--------|-------------|
| LN | LN | natural logarithm |
| LOG | [b] LN | common (base-10) logarithm |
| eˣ | eˣ | natural exponential |
| 10ˣ | [b] eˣ | common (base-10) exponential |

## Trigonometry & Hyperbolic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SIN | SIN | sine |
| COS | COS | cosine |
| TAN | TAN | tangent |
| ASIN | [b] SIN | inverse sine |
| ACOS | [b] COS | inverse cosine |
| ATAN | [b] TAN | inverse tangent |
| HYP | [b] RCL | hyperbolic prefix applied to the next trig/inverse-trig key (SINH, COSH, TANH, ASINH, ACOSH, ATANH) |

## Coordinate & Unit Conversions

| Function/Command | Access | Description |
|------------------|--------|-------------|
| →P | [b] STO | rectangular to polar coordinates |
| →R | [y] STO | polar to rectangular coordinates |
| →HR | [b] 6 | hours-minutes-seconds to decimal hours |
| →HMS | [y] 6 | decimal hours to hours-minutes-seconds |
| →DEG | [b] × | radians to degrees |
| →RAD | [y] × | degrees to radians |
| →kg | [b] 1 | pounds to kilograms |
| →lb | [y] 1 | kilograms to pounds |
| →°C | [b] 2 | Fahrenheit to Celsius |
| →°F | [y] 2 | Celsius to Fahrenheit |
| →cm | [b] 3 | inches to centimetres |
| →in | [y] 3 | centimetres to inches |
| →l | [b] − | gallons to litres |
| →gal | [y] − | litres to gallons |

## Probability

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Cn,r | [y] 0 | combinations of n items taken r at a time |
| Pn,r | [y] . | permutations of n items taken r at a time |
| n! | [y] = | factorial |

## Statistics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Σ+ | Σ+ | accumulates an (x,y) data pair into the statistics registers |
| Σ− | [b] Σ+ | removes an (x,y) data pair from the statistics registers |
| x̄,ȳ | [y] eˣ | means of x and of y |
| x̄w | [y] √x | mean of x weighted by y |
| Sx,Sy | [y] LN | sample standard deviations of x and y |
| x̂,r | [y] yˣ | estimate of x (linear regression) and correlation coefficient r |
| ŷ,r | [y] 1/x | estimate of y (linear regression) and correlation coefficient r |
| m,b | [y] Σ+ | slope m and y-intercept b of the regression line |
| CLΣ | [y] + | clears the statistics registers |
| n, Σx, Σy, Σx², Σy², Σxy | RCL of stat registers | accumulated count and summations (register memory aids silkscreened by the digit keys) |

## Registers & Memory

| Function/Command | Access | Description |
|------------------|--------|-------------|
| STO | STO | stores the displayed value into a numbered register (0–9 / A–F) |
| RCL | RCL | recalls a register into the display |
| CLRG | [b] + | clears all storage registers |

## Base Conversions & Logic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| HEX | [b] 4 | switches to hexadecimal base (HEX annunciator) |
| OCT | [y] 4 | switches to octal base (OCT annunciator) |
| DEC | [b] 5 | switches to decimal base |
| BIN | [y] 5 | switches to binary base (BIN annunciator; windowed 8-bit display) |
| (base arithmetic) | +, −, ×, ÷ in HEX/OCT/BIN | 36-bit 2's-complement integer arithmetic in the current base |

## Display & Modes

| Function/Command | Access | Description |
|------------------|--------|-------------|
| FIX | [b] ( | fixed decimal-places display format |
| SCI | [y] ( | scientific-notation display format |
| ENG | [b] ) | engineering-notation display format |
| ALL | [y] ) | shows all significant digits |
| ·/, | [b] 0 | toggles the radix mark (period/comma) and digit grouping |
| SHOW | [b] . | briefly shows the full internal precision |
| DEG | [y] SIN | selects degrees angular mode |
| RAD | [y] COS | selects radians angular mode |
| GRD | [y] TAN | selects grads angular mode |
| OFF | [b] C | turns the calculator off |
| ON | C | turns the calculator on (printed below the C key) |

## Programming

| Function/Command | Access | Description |
|------------------|--------|-------------|
| PRGM | [b] R/S | enters / exits Program mode (PRGM annunciator) |
| LBL | [y] XEQ | defines a program label (A–F) |
| GTO | [b] XEQ | branches the program pointer to a label |
| XEQ | XEQ | executes a labelled program |
| R/S | R/S | runs or stops a program (also starts execution) |
| ▼ | [b] 7 | scrolls/steps down through program lines, statistics, or binary windows |
| ▲ | [b] 8 | scrolls/steps up |
| x≤y? | [y] 7 | conditional test: do-if x ≤ y |
| x=0? | [y] 8 | conditional test: do-if x = 0 |
| CLPRGM | [y] INPUT | clears program memory |
| LOAD | [b] ← | loads one of the built-in application programs |

## Notes
- Names are transcribed from the manual's keyboard diagram and chapters; descriptions are original one-line summaries.
- `[b]` = blue left-shift (left legend above a key); `[y]` = yellow right-shift (right legend). Shift assignment confirmed against the base-mode table (`[b]HEX`, `[y]OCT`, `[b]DEC`, `[y]BIN`).
- The yellow-shift function of `R/S` could not be confirmed (the faceplate scan reads "BIN" but is obscured by a callout arrow and conflicts with BIN on the 5 key); only the confirmed `[b]R/S = PRGM` is listed here. See hp/layouts/HP-20S.md.
- Two-value results (e.g. →P, x̄,ȳ, statistics): press `SWAP` to view the hidden second result indicated by the `:` annunciator.
- The calculator runs strictly in **algebraic** entry mode; there is no RPN mode.
</content>
