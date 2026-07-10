# HP-11C — Function Set

- **Access:** direct keys; f = gold; g = blue
- **Approx. count:** 92
- **Source:** HP-11C Owner's Handbook and Problem Solving Guide, Function Key Index & Programming Key Index pp. 245–250 — hp/manuals/HP-11C.pdf

## Arithmetic

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add |
| − | key | subtract |
| × | key | multiply |
| ÷ | key | divide |
| CHS | key | change sign of number or exponent |
| 1/x | key | reciprocal of x |
| π | f | enter pi (3.141592654) into X |
| ABS | g | absolute value of x |
| RND | g | round mantissa to current display setting |
| INT | g | keep integer part, truncate fraction |
| FRAC | g | keep fractional part, truncate integer |
| % | g | x percent of value in Y |
| Δ% | g | percent change from Y to X |

## Trig

| Function | Access | Description |
|----------|--------|-------------|
| SIN | key | sine of x |
| COS | key | cosine of x |
| TAN | key | tangent of x |
| SIN⁻¹ | g | arc sine of x |
| COS⁻¹ | g | arc cosine of x |
| TAN⁻¹ | g | arc tangent of x |
| HYP | f | prefix for hyperbolic sin/cos/tan |
| HYP⁻¹ | g | prefix for inverse hyperbolic sin/cos/tan |
| →R | f | polar (r, θ) to rectangular (x, y) |
| →P | g | rectangular (x, y) to polar (r, θ) |
| →H.MS | f | decimal hours/degrees to hrs-min-sec |
| →H | g | hrs-min-sec to decimal hours/degrees |
| →RAD | f | degrees to radians |
| →DEG | g | radians to degrees |

## Log/Exp

| Function | Access | Description |
|----------|--------|-------------|
| LN | g | natural logarithm of x |
| eˣ | key | natural antilog, e raised to x |
| LOG | g | common (base 10) logarithm of x |
| 10ˣ | key | common antilog, 10 raised to x |

## Power/Root

| Function | Access | Description |
|----------|--------|-------------|
| √x | key | square root of x |
| x² | g | square of x |
| yˣ | key | raise Y to power of x |
| x! | f | factorial x! or gamma Γ(1+x) |

## Probability/Combinatorics

| Function | Access | Description |
|----------|--------|-------------|
| Py,x | f | permutations of y items taken x at a time |
| Cy,x | g | combinations of y items taken x at a time |

## Statistics

| Function | Access | Description |
|----------|--------|-------------|
| Σ+ | key | accumulate x,y data into statistics registers |
| Σ− | g | remove x,y data to correct accumulation |
| x̄ | g | mean of accumulated x and y values |
| s | g | sample standard deviation of x and y |
| ŷ,r | f | linear estimate of y and correlation coefficient |
| L.R. | f | linear regression: y-intercept and slope |
| RAN# | f | pseudo-random number generator |
| CLEAR Σ | f | clear statistics registers and stack |

## Stack/Register

| Function | Access | Description |
|----------|--------|-------------|
| ENTER | key | copy X into Y to separate number entries |
| x⇄y | key | swap X and Y registers |
| R↓ | key | roll stack down |
| R↑ | g | roll stack up |
| CLx | g | clear X register to zero |
| LSTx | g | recall value from before last operation |
| EEX | key | enter exponent of ten |

## Memory

| Function | Access | Description |
|----------|--------|-------------|
| STO | key | store X into a register (with arithmetic) |
| RCL | key | recall a register into X |
| CLEAR REG | f | clear all storage registers to zero |
| MEM | g | show program memory / register allocation |
| I | f | index register (R sub I) |
| (i) | f | indirect operation via register I |
| x⇄I | f | swap X with index register I |
| x⇄(i) | f | swap X with register addressed by I |

## Flags & Tests

| Function | Access | Description |
|----------|--------|-------------|
| SF | g | set flag (0 or 1) |
| CF | g | clear flag (0 or 1) |
| F? | g | test whether flag is set |
| x≤y | f | conditional test x ≤ y |
| x<0 | g | conditional test x < 0 |
| x>y | f | conditional test x > y |
| x>0 | g | conditional test x > 0 |
| x≠y | f | conditional test x ≠ y |
| x≠0 | g | conditional test x ≠ 0 |
| x=y | f | conditional test x = y |
| x=0 | g | conditional test x = 0 |

## Programming/Branching

| Function | Access | Description |
|----------|--------|-------------|
| P/R | g | toggle Program / Run mode |
| GTO | key | go to label or line number |
| GSB | key | call subroutine at label |
| RTN | g | return from subroutine / to line 000 |
| LBL | f | define label for routine start |
| A–E | f | user-defined program label / run keys |
| SST | key | single-step forward through program |
| BST | g | back-step through program |
| R/S | key | run / stop program |
| PSE | f | pause about one second to show X |
| DSE | f | decrement counter, skip if ≤ test value |
| ISG | f | increment counter, skip if > test value |
| USER | f | toggle User mode (swap primary/A–E keys) |
| ← | key | backspace: delete instruction or digit |
| CLEAR PRGM | f | clear program memory, reset to line 000 |
| CLEAR PREFIX | f | cancel prefix / show 10-digit mantissa |

## Display/Mode

| Function | Access | Description |
|----------|--------|-------------|
| FIX | f | fixed-point display mode |
| SCI | f | scientific notation display mode |
| ENG | f | engineering notation display mode |
| DEG | g | decimal degrees angular mode |
| RAD | g | radians angular mode |
| GRD | g | grads angular mode |
| ON | key | turn display on / off |
| f | key | gold prefix, selects function above key |
| g | key | blue prefix, selects function on key face |

## Notes
- Legends taken from the keyboard layout (all legible); descriptions paraphrased from the manual's Function Key Index (pp. 245–248) and Programming Key Index (pp. 249–250).
- HYP / HYP⁻¹ are prefixes combined with SIN/COS/TAN to give the six hyperbolic and inverse-hyperbolic functions.
- The six conditional tests each skip one program line when the comparison is false.
- Digit keys 0–9 and the decimal point are omitted from the count as ordinary numeric entry.
