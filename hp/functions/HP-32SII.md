# HP-32SII — Function / Command Set

- **Access:** Each key has three functions — a primary face legend, a **left-shift** (orange, written `L`) and a **right-shift** (blue, written `R`) function printed above it. Menu names are printed on a dark background above their key; opening a menu (with `L` or `R`) shows a single-line menu whose items are chosen with the top softkeys. Variable/label letters A–Z (and `i`) are typed directly from the lettered keys when the `A..Z` annunciator is on.
- **Approx. count:** ~180
- **Source:** HP 32SII Owner's Manual, Edition 5 (1994) — Operation Index (appendix F, PDF pages 345–359) and the "HP 32SII Menus" table (§1, PDF pages 21–22); shift colours verified against the unit/time/angle-conversion pages (§4, PDF pages 73–75) — hp/manuals/HP-32SII.pdf. Names are the programmable names; descriptions are original one-line summaries.

## Stack & Memory

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ENTER | ENTER | pushes x up, duplicating it into y |
| R↓ | R↓ | rolls the stack down (t→z→y→x→t) |
| R↑ | R R↓ | rolls the stack up |
| x⇄y | x⇄y | swaps the X and Y registers |
| x<> _var_ | R x⇄y, _var_ | exchanges x with a named variable |
| LAST x | L LASTx | recalls the last-x value |
| STO | STO _var_ | stores x into a variable A–Z (or i) |
| RCL | RCL _var_ | recalls a variable into x |
| STO+ − × ÷ | STO then + − × ÷ | storage arithmetic on a variable |
| RCL+ − × ÷ | RCL then + − × ÷ | recall arithmetic with a variable |
| INPUT | L INPUT | prompts for and stores a variable (in programs) |
| VIEW | R VIEW | displays a variable without recalling it |
| MEM | L MEM | memory status + VAR / PGM catalogs |
| SHOW | R SHOW | shows the full 12-digit mantissa / checksum |
| CLx | L CLEAR {x} | clears the X register to zero |
| CLEAR | L CLEAR | clear menu: x, all data, variables, all memory, Σ |
| CLVARS / CLΣ | L CLEAR menu | clears all variables / statistics registers |
| SCRL | R SCRL | enables/disables equation & program scrolling |
| i / (i) | RCL/STO i , (i) | index register i and indirect addressing |

## Arithmetic & Numeric

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + − × ÷ | + − × ÷ | four-function arithmetic |
| +/− | +/− | changes the sign of x |
| 1/x / INV | 1/x | reciprocal of x |
| x² / SQ | L x² | square of x |
| √x / SQRT | √x | square root of x |
| yˣ (^) | yˣ | y raised to the x power |
| ˣ√y / XROOT | L ˣ√y | the x-th root of y |
| π | R π | inserts pi to 12 digits |
| E | E | begins exponent-of-ten entry |
| PARTS | R PARTS | parts-of-numbers menu (IP, FP, ABS) |
| IP | R PARTS {IP} | integer part of x |
| FP | R PARTS {FP} | fractional part of x |
| ABS | R PARTS {ABS} | absolute value of x |
| RND | L RND | rounds x to the current display format |
| x! | L x! | factorial (or gamma) of x — left-shifted 1/x key |

## Power, Root & Logarithmic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| 10ˣ / ALOG | L 10ˣ | common (base-10) exponential / antilogarithm |
| eˣ / EXP | eˣ | natural exponential |
| LOG | L LOG | common (base-10) logarithm |
| LN | LN | natural logarithm |

## Trigonometry & Hyperbolic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SIN COS TAN | SIN / COS / TAN | sine, cosine, tangent of x |
| ASIN | L ASIN | inverse sine |
| ACOS | L ACOS | inverse cosine |
| ATAN | L ATAN | inverse tangent |
| HYP | L HYP | hyperbolic prefix for the next trig key |
| SINH COSH TANH | L HYP then SIN/COS/TAN | hyperbolic sine, cosine, tangent |
| ASINH ACOSH ATANH | L HYP then L ASIN/ACOS/ATAN | inverse hyperbolic functions |

## Percentage & Conversions

| Function/Command | Access | Description |
|------------------|--------|-------------|
| % | R % | percent: (y × x) ÷ 100 |
| %CHG | R %CHG | percent change from y to x |
| →θ,r (rect→polar) | L →θ,r | converts (x, y) to (r, θ) |
| →y,x (polar→rect) | R →y,x | converts (r, θ) to (x, y) |
| →HR | L →HR | hours-minutes-seconds → decimal hours |
| →HMS | R →HMS | decimal hours → hours-minutes-seconds |
| →DEG | L →DEG | radians → decimal degrees |
| →RAD | R →RAD | decimal degrees → radians |
| →kg | L →kg | pounds → kilograms |
| →lb | R →lb | kilograms → pounds |
| →°C | L →°C | Fahrenheit → Celsius |
| →°F | R →°F | Celsius → Fahrenheit |
| →cm | L →cm | inches → centimetres |
| →in | R →in | centimetres → inches |
| →l | L →l | gallons → litres |
| →gal | R →gal | litres → gallons |

## Complex Numbers (CMPLX prefix)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| CMPLX | L CMPLX | complex prefix for the next arithmetic/function key |
| CMPLX + − × ÷ | L CMPLX then + − × ÷ | complex arithmetic on (zx + i zy) |
| CMPLX +/− | L CMPLX then +/− | complex change of sign |
| CMPLX 1/x | L CMPLX then 1/x | complex reciprocal |
| CMPLX yˣ | L CMPLX then yˣ | complex power |
| CMPLX SIN/COS/TAN | L CMPLX then SIN/COS/TAN | complex trigonometric functions |
| CMPLX eˣ / LN | L CMPLX then eˣ / LN | complex exponential / natural log |

## Probability & Statistics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Σ+ | Σ+ | accumulates (y, x) into the statistics registers |
| Σ− | L Σ− | removes (y, x) from the statistics registers |
| PROB | R PROB | probability menu (Cn,r, Pn,r, SEED, RANDOM) |
| Cn,r | R PROB {Cn,r} | combinations of n taken r |
| Pn,r | R PROB {Pn,r} | permutations of n taken r |
| SEED | R PROB {SD} | seeds the random-number generator |
| RANDOM | R PROB {R} | random number in [0,1) |
| x̄,ȳ | R x̄,ȳ | arithmetic-mean menu (x̄, ȳ, x̄w) |
| x̄ / ȳ / x̄w | R x̄,ȳ {…} | mean of x / mean of y / weighted mean of x |
| s,σ | R s,σ | standard-deviation menu |
| sx / sy | R s,σ {sx}/{sy} | sample standard deviation of x / y |
| σx / σy | R s,σ {σx}/{σy} | population standard deviation of x / y |
| L.R. | R L.R. | linear-regression menu |
| x̂ / ŷ | R L.R. {x̂}/{ŷ} | x-estimate / y-estimate from the regression line |
| r / m / b | R L.R. {r}/{m}/{b} | correlation coefficient / slope / y-intercept |
| SUMS | R SUMS | statistical-summations menu |
| n | R SUMS {n} | number of accumulated data sets |
| Σx Σy Σx² Σy² Σxy | R SUMS {…} | statistical summations |

## Base Conversions

| Function/Command | Access | Description |
|------------------|--------|-------------|
| BASE | L BASE | base-conversion menu |
| DEC HEX OCT BIN | L BASE {DEC/HX/OC/BN} | select decimal / hexadecimal / octal / binary display |

## Fractions

| Function/Command | Access | Description |
|------------------|--------|-------------|
| FDISP | L FDISP | toggles fraction-display mode on/off |
| /c | L /c | sets the maximum fraction denominator |

## Equations, Solver & Integration

| Function/Command | Access | Description |
|------------------|--------|-------------|
| EQN | R EQN | activates/cancels equation-entry mode |
| SOLVE | R SOLVE | solves the displayed equation / FN= program for a variable |
| ∫FN d | R ∫ | numeric definite integral of the equation / FN= program |
| FN= | R FN= | selects a labelled program as the current function |
| ( ) | R ( , R ) | parentheses in an equation |
| = / evaluate | ENTER or XEQ | evaluates the displayed equation |

## Programming & Flow Control

| Function/Command | Access | Description |
|------------------|--------|-------------|
| PRGM | L PRGM | toggles program-entry mode |
| LBL | L LBL | labels a program routine (single letter) |
| RTN | R RTN | returns from a routine / ends a program |
| GTO | L GTO | sets the program pointer to a label/line |
| GTO . _label nn_ / GTO . . | L GTO . … | go to line nn / go to PRGM TOP |
| XEQ | XEQ _label_ | executes a labelled program |
| R/S (STOP) | R/S | runs or stops a program |
| PSE | R PSE | briefly pauses to show a value |
| ISG | L ISG | increment-and-skip-if-greater loop counter |
| DSE | L DSE | decrement-and-skip-if-equal-or-less loop counter |
| INPUT | L INPUT | prompts for and stores a variable |
| VIEW | R VIEW | displays a variable during a program |
| ↑ / ↓ | L ↑ / L ↓ | scroll catalogs, equation list, and program pointer |

## Flags & Tests

| Function/Command | Access | Description |
|------------------|--------|-------------|
| FLAGS | R FLAGS | set / clear / test flags menu |
| SF / CF / FS? | R FLAGS {SF/CF/FS?} | set flag n / clear flag n / test if flag n is set |
| x?y | L x?y | X-versus-Y comparison-tests menu |
| x≠y? x≤y? x<y? x>y? x≥y? x=y? | L x?y {…} | do-if-true comparisons of X and Y |
| x?0 | R x?0 | X-versus-zero comparison-tests menu |
| x≠0? x≤0? x<0? x>0? x≥0? x=0? | R x?0 {…} | do-if-true comparisons of X and zero |

## Display & Mode

| Function/Command | Access | Description |
|------------------|--------|-------------|
| DISP | L DISP | number-format menu |
| FIX SCI ENG ALL | L DISP {FX/SC/EN/ALL} | fixed / scientific / engineering / all-digits display |
| MODES | L MODES | angular-mode & radix menu |
| DEG RAD GRAD | L MODES {DG/RD/GR} | degrees / radians / grads angular mode |
| RADIX . / , | L MODES {./,} | period or comma radix mark |
| ON | C | turns the calculator on |
| OFF | R OFF (or L OFF) | turns the calculator off |

## Notes
- **Two shifts:** left-shift is orange (annunciator ⤺), right-shift is blue (annunciator ⤻). Pressing a shift lights its annunciator until the next key; pressing the same shift again cancels it.
- Names shown are the programmable names used in program lines; nonprogrammable operations (ENTER, SHOW, catalogs, menu-openers, etc.) are keyboard-only.
- Unit/time/angle conversions come in orange (`L`) / blue (`R`) pairs that share a key; the eight metric/temperature conversions (→kg …→gal) are new on the 32SII versus the 32S.
- Compared with the HP-32S, the 32SII adds a second (blue) shift, algebraic-style **equation entry** (EQN, `(` `)`, SOLVE/∫ over stored equations), **fraction display** (FDISP, /c), and the eight unit conversions; it retains the RPN 4-level stack.
