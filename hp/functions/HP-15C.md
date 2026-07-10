# HP-15C — Function Set

- **Access:** direct keys; f = gold; g = blue
- **Approx. count:** 105
- **Source:** HP-15C Owner's Handbook, Function Summary and Index pp. 272–278 & Programming Summary pp. 278–280 — hp/manuals/HP-15C.pdf

## Arithmetic

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add y and x |
| − | key | subtract x from y |
| × | key | multiply y by x |
| ÷ | key | divide y by x |
| 1/x | key | reciprocal of x |
| CHS | key | change sign of number or exponent |
| π | g | place value of pi in X |
| x! | f | factorial of x, or Gamma of (1+x) |

## Trig

| Function | Access | Description |
|----------|--------|-------------|
| SIN | key | sine of x |
| COS | key | cosine of x |
| TAN | key | tangent of x |
| SIN⁻¹ | g | arc sine of x |
| COS⁻¹ | g | arc cosine of x |
| TAN⁻¹ | g | arc tangent of x |
| HYP | f | prefix for hyperbolic SIN/COS/TAN |
| HYP⁻¹ | g | prefix for inverse hyperbolic SIN/COS/TAN |
| DEG | g | set Degrees angular mode |
| RAD | g | set Radians angular mode |
| GRD | g | set Grads angular mode |

## Log/Exp

| Function | Access | Description |
|----------|--------|-------------|
| LN | g | natural logarithm of x |
| LOG | g | common (base-10) logarithm of x |
| eˣ | key | natural antilog, e raised to x |
| 10ˣ | key | common antilog, 10 raised to x |

## Power/Root

| Function | Access | Description |
|----------|--------|-------------|
| √x | key | square root of x |
| x² | g | square of x |
| yˣ | key | raise y to the power x |

## Complex

| Function | Access | Description |
|----------|--------|-------------|
| I | f | enter complex numbers; activate Complex mode |
| (i) | f | show imaginary X-register while key is held |
| Re≷Im | f | exchange real and imaginary X-registers; activate Complex mode |
| SF 8 | g | set flag 8 to activate Complex mode |
| CF 8 | g | clear flag 8 to leave Complex mode |

## Matrix

| Function | Access | Description |
|----------|--------|-------------|
| MATRIX | f | prefix for matrix operations (MATRIX 0–9) |
| MATRIX 0 | f | dimension all matrices to 0×0 |
| MATRIX 1 | f | set row/column pointers in R0, R1 to 1 |
| MATRIX 2 | f | complex transform Zp to Z̃ |
| MATRIX 3 | f | inverse complex transform Z̃ to Zp |
| MATRIX 4 | f | transpose matrix X |
| MATRIX 5 | f | transpose multiply, form YᵀX |
| MATRIX 6 | f | compute residual into result matrix |
| MATRIX 7 | f | row norm of the matrix in X |
| MATRIX 8 | f | Frobenius norm of the matrix in X |
| MATRIX 9 | f | determinant with LU decomposition |
| DIM | f | dimension a named matrix (A–E, or via I) |
| RCL DIM | f | recall a matrix's row/column dimensions |
| RESULT | f | designate the result matrix for operations |
| A–E | f | matrix names / program labels |
| Py,x | f | transform matrix complex form to partitioned form |
| Cy,x | g | transform matrix partitioned form to complex form |

## SOLVE & Integrate

| Function | Access | Description |
|----------|--------|-------------|
| SOLVE | f | find a real root of a labeled function f(x) |
| ∫ˣy | f | numerically integrate labeled f(x) over an interval |

## Probability

| Function | Access | Description |
|----------|--------|-------------|
| Py,x | f | permutations of y items taken x at a time |
| Cy,x | g | combinations of y items taken x at a time |
| x! | f | factorial of x |

## Statistics

| Function | Access | Description |
|----------|--------|-------------|
| Σ+ | key | accumulate an x,y data pair into registers R2–R7 |
| Σ− | g | remove an x,y data pair to correct accumulations |
| x̄ | g | mean of accumulated x and y values |
| s | g | sample standard deviations of x and y |
| ŷ,r | f | linear estimate of y and correlation coefficient |
| L.R. | f | linear regression intercept and slope |
| RAN# | f | pseudo-random number from a stored seed |
| CLEAR Σ | f | clear the statistics registers R2–R7 |

## Stack/Register

| Function | Access | Description |
|----------|--------|-------------|
| ENTER | key | copy X into Y and separate number entries |
| x≷y | key | exchange X and Y registers |
| x≷ | f | exchange X with any named storage register |
| R↓ | key | roll the stack down |
| R↑ | g | roll the stack up |
| CLx | g | clear the X-register to zero |
| ← | key | backspace last digit, or clear X |
| LSTx | g | recall the number before the last operation |

## Memory

| Function | Access | Description |
|----------|--------|-------------|
| STO | key | store X into a register; also register arithmetic |
| RCL | key | recall a register into X; also register arithmetic |
| CLEAR REG | f | clear all data storage registers to zero |
| MEM | g | show memory allocation (data pool and program) |
| I | f | index register R_I for indirect addressing/loops |
| (i) | f | indirect operations addressing register R_I points to |
| DIM (i) | f | allocate the data/program register boundary |

## Number Alteration

| Function | Access | Description |
|----------|--------|-------------|
| ABS | g | absolute value of x |
| FRAC | f | keep only the fractional part of x |
| INT | g | keep only the integer part of x |
| RND | g | round X's mantissa to the display format |

## Percentage

| Function | Access | Description |
|----------|--------|-------------|
| % | g | x percent of the value in Y |
| Δ% | g | percent change from Y to X |

## Conversions

| Function | Access | Description |
|----------|--------|-------------|
| →R | f | polar (r, θ) to rectangular (x, y) |
| →P | g | rectangular (x, y) to polar (r, θ) |
| →H.MS | f | decimal hours to hours-minutes-seconds |
| →H | g | hours-minutes-seconds to decimal hours |
| →RAD | f | degrees to radians |
| →DEG | g | radians to degrees |

## Flags & Tests

| Function | Access | Description |
|----------|--------|-------------|
| SF | g | set a designated flag (0–9) |
| CF | g | clear a designated flag (0–9) |
| F? | g | test whether a designated flag is set |
| x≤y | g | conditional test x ≤ y |
| x=0 | g | conditional test x = 0 |
| TEST | g | conditional tests 0–9 against 0 or Y |
| DSE | f | decrement counter, skip if ≤ test value |
| ISG | f | increment counter, skip if > test value |

## Programming

| Function | Access | Description |
|----------|--------|-------------|
| P/R | g | toggle Program and Run modes |
| LBL | f | mark the start of a program routine |
| GTO | key | go to a label or the position it marks |
| GTO CHS nnn | key | position calculator to a program line number |
| GSB | key | call a labeled subroutine |
| RTN | g | return from subroutine or halt at line 000 |
| SST | key | single-step forward through program lines |
| BST | g | back-step through program lines |
| R/S | key | run or stop program execution |
| PSE | f | pause about one second showing X |
| CLEAR PRGM | f | clear program memory / reset to line 000 |
| USER | f | swap primary and gold A–E functions |

## Display/Mode

| Function | Access | Description |
|----------|--------|-------------|
| ON | key | turn display on/off; reset Continuous Memory |
| FIX | f | fixed-point display mode |
| SCI | f | scientific-notation display mode |
| ENG | f | engineering-notation display mode |
| CLEAR PREFIX | f | cancel a prefix; show full 10-digit mantissa |
| f | key | select gold function above a key |
| g | key | select blue function below a key |
| EEX | key | enter a power-of-ten exponent |

## Notes
- Access: primary functions are pressed directly; f (gold) and g (blue) select the shifted legend printed above/below each key.
- HYP and HYP⁻¹ are prefixes combined with SIN/COS/TAN for the six hyperbolic functions.
- Complex mode is entered via I, Re≷Im, or SF 8; a parallel imaginary stack appears while in Complex mode.
- MATRIX 0–9 are sub-operations under the single MATRIX prefix; matrices are named A–E (or addressed through I).
- Storage registers R0–R19 are data by default; a common pool R20–R65 is shared by matrices, the imaginary stack, SOLVE/∫, and program memory (7 bytes/register).
- CLEAR is a gold bracket grouping Σ / PRGM / REG / PREFIX on the −, GSB, x≷y, ← keys.
