# HP-32S — Function / Command Set

- **Access:** Every function is either a primary face legend or the single **gold shift** printed above the key (written `g` below, e.g. `g x²`). Multi-item menus (CMPLX, BASE, FLAGS, TESTS, PARTS, PROB, STAT, MODES, DISP, CLEAR, MEM, LOOP, SOLVE/∫) are opened by a key (or its gold shift) and their items chosen from the single-line menu shown on the display. Variable/label letters A–Z (and `i`) are typed directly from the lettered keys when the `A..Z` annunciator is active.
- **Approx. count:** ~130
- **Source:** HP-32S Owner's Manual — keyboard diagram (PDF page 2) and function chapters — hp/manuals/HP-32S.pdf. Names are the programmable names; descriptions are original one-line summaries.

## Stack & Memory

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ENTER | ENTER | pushes x up, duplicating it into y |
| R↓ | R↓ | rolls the stack down (t→z→y→x→t) |
| x⇄y | x⇄y | swaps the X and Y registers |
| LAST x | g LASTx | recalls the last-x value |
| STO | STO _var_ | stores x into a named variable A–Z (or i) |
| RCL | RCL _var_ | recalls a variable into x |
| STO+ − × ÷ | STO then + − × ÷ | storage arithmetic on a variable |
| RCL+ − × ÷ | RCL then + − × ÷ | recall arithmetic with a variable |
| x⇄ _var_ | RCL then x⇄y | exchanges x with a named variable |
| INPUT | g INPUT | prompts for and stores a variable |
| VIEW | g VIEW | displays a variable without recalling it |
| MEM | g MEM | shows free memory and the variable/program catalogs |
| SHOW | g SHOW | shows the full 12-digit mantissa (or checksum) |
| CLx | g CLEAR menu | clears the X register to zero |
| CLEAR | g CLEAR | opens the clear menu (x, variables, all, Σ) |
| indirect (i)/(j) | via `i` register | indirect addressing through register i |

## Arithmetic & Numeric

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + − × ÷ | + − × ÷ | four-function arithmetic |
| +/− | +/− | changes the sign of x |
| 1/x | 1/x | reciprocal of x |
| x² | g x² | square of x |
| √x | √x | square root of x |
| yˣ | yˣ | y raised to the x power |
| π | g π | inserts pi to 12 digits |
| E | E | begins exponent-of-ten entry |
| PARTS menu | g PARTS | integer part / fractional part / absolute value etc. |
| IP | PARTS menu | integer part of x |
| FP | PARTS menu | fractional part of x |
| ABS | PARTS menu | absolute value of x |
| RND | PARTS/DISP | rounds x to the current display format |

## Power, Root & Logarithmic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| 10ˣ | g 10ˣ | common (base-10) exponential |
| eˣ | eˣ | natural exponential |
| LOG | g LOG | common (base-10) logarithm |
| LN | LN | natural logarithm |

## Trigonometry & Hyperbolic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SIN COS TAN | SIN / COS / TAN | sine, cosine, tangent of x |
| ASIN | g ASIN | inverse sine |
| ACOS | g ACOS | inverse cosine |
| ATAN | g ATAN | inverse tangent |
| HYP | g HYP | hyperbolic prefix for the next trig key |
| SINH COSH TANH | g HYP then SIN/COS/TAN | hyperbolic sine, cosine, tangent |
| ASINH ACOSH ATANH | g HYP then g ASIN/ACOS/ATAN | inverse hyperbolic functions |

## Percentage & Conversions

| Function/Command | Access | Description |
|------------------|--------|-------------|
| % | g % | percent: (y × x) ÷ 100 |
| %CHG | g %CHG | percent change from y to x |
| P↔RECT | g P↔RECT | converts between polar and rectangular coordinates |
| H↔HMS | g H↔HMS | converts between decimal hours and H.MMSS |
| D↔RAD | g D↔RAD | converts between degrees and radians |

## Complex Numbers (CMPLX prefix)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| CMPLX | g CMPLX | complex prefix for the next arithmetic/function key |
| CMPLX + − × ÷ | g CMPLX then + − × ÷ | complex arithmetic on (zx + i zy) |
| CMPLX +/− | g CMPLX then +/− | complex change of sign |
| CMPLX 1/x | g CMPLX then 1/x | complex reciprocal |
| CMPLX yˣ | g CMPLX then yˣ | complex power |
| CMPLX SIN/COS/TAN | g CMPLX then SIN/COS/TAN | complex trigonometric functions |
| CMPLX eˣ / LN | g CMPLX then eˣ / LN | complex exponential / natural log |

## Probability & Statistics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Σ+ | Σ+ | accumulates (x,y) into the statistics registers |
| Σ− | g Σ− | removes (x,y) from the statistics registers |
| PROB menu | g PROB | probability menu |
| Cn,r | PROB menu | combinations of n taken r |
| Pn,r | PROB menu | permutations of n taken r |
| ! | PROB menu | factorial / gamma of x |
| STAT menu | g STAT | statistics results menu (`Σ  x̄,ȳ  s  L.R.`) |
| x̄, ȳ, x̄w | STAT → x̄,ȳ | means and weighted mean |
| sx, sy, σx, σy | STAT → s | sample & population standard deviations |
| L.R. (x̂, ŷ, r, m, b) | STAT → L.R. | linear-regression estimates, correlation, slope, intercept |
| Σ sums (n, Σx, Σy, Σx², Σy², Σxy) | STAT → Σ | statistical summations |

## Base & Logic (BASE menu)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| BASE | g BASE | opens the number-base menu |
| DEC HEX OCT BIN | BASE menu | select decimal / hexadecimal / octal / binary mode |
| AND OR XOR NOT | BASE logic | bitwise logic operations |

## Equation Solver & Integration

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SOLVE | g SOLVE/∫ | solves the current function/equation for a variable |
| ∫ (integrate) | g SOLVE/∫ | numeric definite integral of the current function |
| FN | via SOLVE/∫ | selects the program/function used by SOLVE and ∫ |

## Programming & Flow Control

| Function/Command | Access | Description |
|------------------|--------|-------------|
| PRGM | g PRGM | toggles program-entry mode |
| LBL | g LBL/RTN | labels a program routine |
| RTN | g LBL/RTN | returns from a routine / ends a program |
| GTO | g GTO | branches the program pointer to a label/line |
| XEQ | XEQ | executes a labelled program |
| R/S | R/S | runs or stops a program (STOP) |
| PSE | via program | briefly pauses to show a value |
| ISG | g LOOP | increment-and-skip-if-greater loop counter |
| DSE | g LOOP | decrement-and-skip-if-less-or-equal loop counter |

## Flags & Tests

| Function/Command | Access | Description |
|------------------|--------|-------------|
| FLAGS menu | g FLAGS | set / clear / test flags |
| SF, CF, FS? | FLAGS menu | set flag n, clear flag n, test if flag n is set |
| TESTS menu | g TESTS | comparison-test menu |
| x≠y? x≤y? x<y? x>y? x≥y? x=y? | TESTS menu | do-if-true comparisons of X and Y |
| x≠0? x≤0? x<0? x>0? x≥0? x=0? | TESTS menu | do-if-true comparisons of X and zero |

## Display & Mode

| Function/Command | Access | Description |
|------------------|--------|-------------|
| DISP menu | g DISP | number-format menu |
| FIX SCI ENG ALL | DISP menu | fixed / scientific / engineering / all-digits display |
| MODES menu | g MODES | angular mode & radix (period/comma) menu |
| DEG RAD GRAD | MODES menu | degrees / radians / grads angular mode |
| RADIX . / , | MODES menu | period or comma radix mark |
| ON | C key | turns the calculator on |
| OFF | g OFF | turns the calculator off |

## Notes
- Single **gold shift**; there is no second (blue) shift and no separate ALPHA key — letters A–Z (and `i`) are typed directly from lettered keys.
- Menu items are chosen from the single display line after opening a menu key; the number keys act as softkey selectors while a menu is shown.
- The paired directional conversions (P↔RECT, H↔HMS, D↔RAD) toggle direction based on stack contents / repeated press, per the manual.
