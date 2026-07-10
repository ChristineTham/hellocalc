# HP-41C-CV — Function Set

- **Access:** keyboard, gold-shift, and XEQ by name (ALPHA); USER-assignable keys
- **Approx. count:** 118
- **Source:** HP-41C/41CV Owner's Handbook, "Function Index" pp.277-281 (printed 271-275) — hp/manuals/HP-41C-CV.pdf

## Arithmetic & General Math

| Function | Access | Description |
|----------|--------|-------------|
| + | key | add Y and X |
| - | key | subtract X from Y |
| × | key | multiply Y by X |
| ÷ | key | divide Y by X |
| 1/X | key | reciprocal of X |
| ABS | XEQ | absolute value of X |
| CHS | key | change sign of X |
| FACT | XEQ | factorial of X |
| INT | XEQ | integer portion of X |
| FRC | XEQ | fractional portion of X |
| MOD | XEQ | remainder of Y divided by X |
| RND | XEQ | round X to current display precision |
| SIGN | XEQ | sign of X (returns -1, 0, or 1) |
| X↑2 | gold (x²) | square of X |
| SQRT | key (√x) | square root of X |
| Y↑X | gold (y^x) | Y raised to the X power |
| PI | gold (π) | enter the constant pi |
| % | gold | X percent of Y |
| %CH | XEQ | percent change from Y to X |

## Logarithms & Exponentials

| Function | Access | Description |
|----------|--------|-------------|
| LN | key | natural logarithm of X |
| LN1+X | XEQ | natural log of (1+X), accurate near zero |
| LOG | key | common (base-10) logarithm of X |
| 10↑X | gold (10^x) | 10 raised to the X |
| E↑X | gold (e^x) | e raised to the X |
| E↑X-1 | XEQ | e^X minus 1, accurate near zero |

## Trigonometry & Angle

| Function | Access | Description |
|----------|--------|-------------|
| SIN | key | sine of X |
| COS | key | cosine of X |
| TAN | key | tangent of X |
| ASIN | gold (SIN⁻¹) | arc sine |
| ACOS | gold (COS⁻¹) | arc cosine |
| ATAN | gold (TAN⁻¹) | arc tangent |
| DEG | XEQ | select degrees angular mode |
| RAD | XEQ | select radians angular mode |
| GRAD | XEQ | select grads angular mode |
| D-R | XEQ | convert degrees to radians |
| R-D | XEQ | convert radians to degrees |

## Coordinate, HMS & Base Conversions

| Function | Access | Description |
|----------|--------|-------------|
| P-R | gold (P→R) | polar to rectangular conversion |
| R-P | gold (R→P) | rectangular to polar conversion |
| HMS | XEQ | decimal hours to hours.minutes-seconds |
| HR | XEQ | hours.minutes-seconds to decimal hours |
| HMS+ | XEQ | add two H.MMSS time values |
| HMS- | XEQ | subtract two H.MMSS time values |
| DEC | XEQ | octal to decimal conversion |
| OCT | XEQ | decimal to octal conversion |

## Stack Manipulation

| Function | Access | Description |
|----------|--------|-------------|
| ENTER↑ | key | copy X into Y and lift the stack |
| X<>Y | key (x≷y) | exchange X and Y |
| RDN | key (R↓) | roll the stack down |
| X<> | XEQ | exchange X with a register (nn/stack/indirect) |
| LASTX | gold | recall the LAST X value |
| CLX | gold (CLx) | clear the X register to zero |
| CLST | XEQ | clear the automatic stack |
| EEX | key | enter an exponent |

## Storage, Recall & Register Arithmetic

| Function | Access | Description |
|----------|--------|-------------|
| STO | key | store X into a register (nn/stack/indirect) |
| RCL | key | recall a register into X |
| ST+ | XEQ | add X to a register |
| ST- | XEQ | subtract X from a register |
| ST* | XEQ | multiply a register by X |
| ST/ | XEQ | divide a register by X |
| VIEW | gold | display a register's contents |
| CLRG | XEQ | clear all data registers |
| SIZE | XEQ | allocate the number of data registers |
| ΣREG | XEQ | set the first statistics register |

## Statistics

| Function | Access | Description |
|----------|--------|-------------|
| Σ+ | key | accumulate a statistics data point |
| Σ- | gold | remove a statistics data point |
| CLΣ | gold | clear the statistics registers |
| MEAN | XEQ | mean of accumulated data |
| SDEV | XEQ | standard deviation of accumulated data |

## Flags

| Function | Access | Description |
|----------|--------|-------------|
| SF | gold | set a flag (nn/indirect) |
| CF | gold | clear a flag (nn/indirect) |
| FS? | gold | test whether a flag is set |
| FC? | XEQ | test whether a flag is clear |
| FS?C | XEQ | test flag set, then clear it |
| FC?C | XEQ | test flag clear, then clear it |

## Conditional Tests

| Function | Access | Description |
|----------|--------|-------------|
| X=0? | gold | skip next line unless X = 0 |
| X≠0? | XEQ | skip next line unless X ≠ 0 |
| X<0? | XEQ | skip next line unless X < 0 |
| X≤0? | XEQ | skip next line unless X ≤ 0 |
| X>0? | XEQ | skip next line unless X > 0 |
| X=Y? | gold | skip next line unless X = Y |
| X≠Y? | XEQ | skip next line unless X ≠ Y |
| X<Y? | XEQ | skip next line unless X < Y |
| X≤Y? | gold | skip next line unless X ≤ Y |
| X>Y? | gold | skip next line unless X > Y |

## Program Control & Branching

| Function | Access | Description |
|----------|--------|-------------|
| XEQ | key | execute a program or function by label/name |
| GTO | gold | branch to a label (nn/name/indirect) |
| GTO. | key seq | move edit pointer to a line or label |
| GTO.. | key seq | clear pointer, start a new program |
| LBL | gold | define a program label |
| RTN | gold | return from a subroutine |
| END | XEQ | mark the end of a program |
| ISG | gold | increment counter, skip if greater |
| DSE | XEQ | decrement counter, skip if equal |
| R/S | key | run or stop a program |
| STOP | key (R/S) | stop program execution |
| SST | key | single-step through a program |
| BST | gold | back-step through a program |
| PSE | XEQ | pause about one second during a program |
| PROMPT | XEQ | show ALPHA and halt for input |
| DEL | XEQ | delete program-memory lines |
| CLP | XEQ | clear a named program |
| PACK | XEQ | pack program memory |
| COPY | XEQ | copy a named program into memory |

## ALPHA & String

| Function | Access | Description |
|----------|--------|-------------|
| AON | XEQ | turn ALPHA mode on |
| AOFF | XEQ | turn ALPHA mode off |
| CLA | XEQ | clear the ALPHA register |
| ARCL | XEQ | recall a register's value into ALPHA |
| ASTO | XEQ | store ALPHA characters into a register |
| AVIEW | XEQ | display the ALPHA register |
| ASHF | XEQ | shift ALPHA register left six characters |
| APPEND | key (⊢) | append text to ALPHA without clearing |

## Display, Format & Modes

| Function | Access | Description |
|----------|--------|-------------|
| FIX | gold | fixed-point display with n decimals |
| SCI | gold | scientific notation with n digits |
| ENG | gold | engineering notation with n digits |
| CLD | XEQ | clear the display |

## Catalog, Assignment & System

| Function | Access | Description |
|----------|--------|-------------|
| CAT | gold (CATALOG) | list a function/program catalog (1-3) |
| ASN | gold | assign a function to a USER key |
| ON | key | power the calculator on or off |
| OFF | XEQ | power the calculator off |
| BEEP | gold | sound the standard beep |
| TONE | XEQ | sound one of ten tones |
| ADV | XEQ | advance printer paper (if printer present) |

## Notes
- The gold shift key itself is a prefix only (not programmable or assignable) and is omitted from the count.
- Functions with distinct keyboard vs. display/XEQ names are listed by their display name with the key legend shown in parentheses (e.g. SQRT for √x, X<>Y for x≷y, X↑2 for x², E↑X for e^x).
- GTO. and GTO.. are keyboard sequences (GTO + . / GTO + . .); they are not assignable or programmable.
- Several functions (SST, BST, CAT, ASN, DEL, CLP, PACK, COPY, SIZE, ON, VIEW's ALPHA key, APPEND) carry "not programmable" and/or "not assignable" restrictions in the manual.
- All function names in the index were legible; none marked [?].
</content>
</invoke>
