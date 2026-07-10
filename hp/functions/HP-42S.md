# HP-42S — Function / Command Set

- **Access:** menu softkeys; keyboard; command entry by name (XEQ / CATALOG FCN)
- **Approx. count:** ~300
- **Source:** HP-42S Owner's Manual, "Operation Index" pp. 310–335 (PDF pp. 318–343) — hp/manuals/HP-42S.pdf

## Arithmetic & general math

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| + | keyboard | addition |
| − | keyboard | subtraction |
| × | keyboard | multiplication |
| ÷ | keyboard | division |
| +/− | keyboard | change sign |
| 1/X | keyboard | reciprocal |
| X↑2 | keyboard (shift) | square |
| SQRT | keyboard | square root |
| Y↑X | keyboard (shift) | raise y to the x power |
| LN | keyboard | natural logarithm |
| LOG | keyboard | common logarithm |
| E↑X | keyboard (shift) | natural exponential e^x |
| 10↑X | keyboard (shift) | common exponential 10^x |
| E↑X-1 | CATALOG | e^x−1, accurate near zero |
| LN1+X | CATALOG | ln(1+x), accurate near zero |
| PI | keyboard (shift) | recall π |

## Trigonometry & hyperbolic

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| SIN | keyboard | sine |
| COS | keyboard | cosine |
| TAN | keyboard | tangent |
| ASIN | keyboard (shift) | arc sine |
| ACOS | keyboard (shift) | arc cosine |
| ATAN | keyboard (shift) | arc tangent |
| SINH | CATALOG | hyperbolic sine |
| COSH | CATALOG | hyperbolic cosine |
| TANH | CATALOG | hyperbolic tangent |
| ASINH | CATALOG | inverse hyperbolic sine |
| ACOSH | CATALOG | inverse hyperbolic cosine |
| ATANH | CATALOG | inverse hyperbolic tangent |

## CONVERT (number parts, rounding, angle & coordinate)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| ABS | CONVERT | absolute value |
| IP | CONVERT | integer part |
| FP | CONVERT | fractional part |
| RND | CONVERT | round to display format |
| SIGN | CONVERT | sign (unit vector for complex) |
| MOD | CONVERT | modulo remainder |
| HMS+ | CATALOG | add hours-minutes-seconds |
| HMS− | CATALOG | subtract hours-minutes-seconds |
| →HMS | CONVERT | decimal hours to H.MMSSss |
| →HR | CONVERT | H.MMSSss to decimal hours |
| →DEG | CONVERT | radians to degrees |
| →RAD | CONVERT | degrees to radians |
| →REC | CONVERT | polar to rectangular |
| →POL | CONVERT | rectangular to polar |
| %   | keyboard (shift) | percent |
| %CH | keyboard (shift) | percent change |

## COMPLEX & coordinate display modes

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| COMPLEX | keyboard (shift) | combine/split real ↔ complex |
| POLAR | MODES | display complex in polar form |
| RECT | MODES | display complex in rectangular form |
| CPXRES | MODES | allow complex results from real inputs |
| REALRES | MODES | force real-only results |

## BASE (integer arithmetic & logic)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| BINM | BASE | select binary (base 2) mode |
| OCTM | BASE | select octal (base 8) mode |
| DECM | BASE | select decimal (base 10) mode |
| HEXM | BASE | select hexadecimal (base 16) mode |
| BASE+ | BASE | 36-bit integer addition |
| BASE− | BASE | 36-bit integer subtraction |
| BASE× | BASE | 36-bit integer multiplication |
| BASE÷ | BASE | 36-bit integer division |
| BASE+/− | BASE | 36-bit two's-complement negate |
| AND | BASE LOGIC | bitwise AND |
| OR | BASE LOGIC | bitwise OR |
| XOR | BASE LOGIC | bitwise exclusive OR |
| NOT | BASE LOGIC | bitwise complement |
| BIT? | BASE LOGIC | test a bit of y |
| ROTXY | BASE LOGIC | rotate y by x bits |
| →DEC | CATALOG | octal to decimal (HP-41 compatibility) |
| →OCT | CATALOG | decimal to octal (HP-41 compatibility) |

## PROB (probability)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| COMB | PROB | combinations of y taken x |
| PERM | PROB | permutations of y taken x |
| N! | PROB | factorial |
| GAMMA | PROB | gamma function |
| RAN | PROB | random number |
| SEED | PROB | seed the random generator |

## STAT (statistics)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| Σ+ | keyboard | accumulate an x,y data pair |
| Σ− | keyboard (shift) | remove an x,y data pair |
| SUM | STAT | sums Σx and Σy |
| MEAN | STAT | means of x and y |
| WMEAN | STAT | weighted mean of x |
| SDEV | STAT | standard deviations |
| CLΣ | CLEAR | clear the summation registers |
| ALLΣ | STAT | all-statistics mode (13 coefficients) |
| LINΣ | STAT | linear statistics mode (6 coefficients) |
| ΣREG | STAT | set first summation register |
| ΣREG? | STAT | return first summation register number |

## STAT — CFIT (curve fitting)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| BEST | STAT CFIT | pick best-fitting model |
| CORR | STAT CFIT | correlation coefficient |
| FCSTX | STAT CFIT | forecast x from y |
| FCSTY | STAT CFIT | forecast y from x |
| SLOPE | STAT CFIT | slope of the fit |
| YINT | STAT CFIT | y-intercept of the fit |
| LINF | STAT CFIT | select linear model |
| LOGF | STAT CFIT | select logarithmic model |
| EXPF | STAT CFIT | select exponential model |
| PWRF | STAT CFIT | select power model |

## MATRIX

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| NEWMAT | MATRIX | create a new y×x matrix |
| INVRT | MATRIX | matrix inverse |
| DET | MATRIX | determinant |
| TRANS | MATRIX | transpose |
| DIM | MATRIX | dimension a matrix |
| DIM? | MATRIX | return matrix dimensions |
| INDEX | MATRIX | index a named matrix |
| EDIT | MATRIX | edit matrix in X |
| EDITN | MATRIX | edit a named matrix |
| GROW | MATRIX | grow-on-overflow edit mode |
| WRAP | MATRIX | wrap (no-grow) edit mode |
| GETM | MATRIX | get a submatrix |
| PUTM | MATRIX | store a submatrix |
| STOEL | MATRIX | store current element |
| RCLEL | MATRIX | recall current element |
| OLD | MATRIX | recall current element (= RCLEL) |
| STOIJ | MATRIX | set row/column pointers |
| RCLIJ | MATRIX | recall row/column pointers |
| I+ | MATRIX | increment row pointer |
| I− | MATRIX | decrement row pointer |
| J+ | MATRIX | increment column pointer |
| J− | MATRIX | decrement column pointer |
| INSR | MATRIX | insert a row |
| DELR | MATRIX | delete a row |
| R<>R | MATRIX | swap two rows |
| FNRM | MATRIX | Frobenius norm |
| RNRM | MATRIX | row norm |
| CROSS | MATRIX | vector cross product |
| DOT | MATRIX | vector dot product |
| UVEC | MATRIX | unit vector |
| RSUM | MATRIX | row sums as a column matrix |
| ← | MATRIX | move one element left |
| ↑ | MATRIX | move one element up |
| ↓ | MATRIX | move one element down |
| → | MATRIX | move one element right |

## SOLVER

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| SOLVER | keyboard (shift) | select the SOLVER menu |
| SOLVE | SOLVER | solve for an unknown variable |
| PGMSLV | SOLVER | choose the program to solve |
| MVAR | PGM.FCN | declare a menu variable |
| VARMENU | PGM.FCN | build a variable menu from MVARs |

## ∫f(x) (numeric integration)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| ∫f(x) | keyboard (shift) | select the integration menu |
| INTEG | ∫f(x) | integrate over a variable |
| PGMINT | ∫f(x) | choose the program to integrate |

## DISP (display format)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| FIX | DISP | fixed-decimal format |
| SCI | DISP | scientific format |
| ENG | DISP | engineering format |
| ALL | DISP | show all significant digits |
| RDX. | DISP | period as radix mark |
| RDX, | DISP | comma as radix mark |
| SHOW | keyboard (shift) | show full precision briefly |

## MODES

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| DEG | MODES | degrees angle mode |
| RAD | MODES | radians angle mode |
| GRAD | MODES | grads angle mode |
| SIZE | MODES | set number of storage registers |
| QUIET | MODES | toggle the beeper (flag 26) |
| KEYASN | MODES | key-assignment CUSTOM mode |
| LCLBL | MODES | local-label CUSTOM mode |

## FLAGS

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| SF | FLAGS | set a flag |
| CF | FLAGS | clear a flag |
| FS? | FLAGS | test if flag set |
| FC? | FLAGS | test if flag clear |
| FS?C | FLAGS | test flag set, then clear |
| FC?C | FLAGS | test flag clear, then clear |

## Stack & storage

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| ENTER | keyboard | duplicate x, separate entries |
| X<>Y | keyboard | swap X and Y |
| X<> | PGM.FCN | swap X with a register/variable |
| R↓ | keyboard | roll stack down |
| R↑ | CATALOG | roll stack up |
| LASTX | keyboard (shift) | recall last x |
| STO | keyboard | store x |
| RCL | keyboard | recall to x |
| STO+ | keyboard | store-add to register |
| STO− | keyboard | store-subtract from register |
| STO× | keyboard | store-multiply register |
| STO÷ | keyboard | store-divide register |
| RCL+ | keyboard | recall-add to x |
| RCL− | keyboard | recall-subtract from x |
| RCL× | keyboard | recall-multiply x |
| RCL÷ | keyboard | recall-divide x |
| CLX | CLEAR | clear the X-register |
| E | keyboard | enter power-of-ten exponent |
| ← | keyboard | backspace / clear X |

## PGM.FCN (programming)

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| LBL | PGM.FCN | program label |
| RTN | PGM.FCN | return from subroutine |
| GTO | keyboard | branch to a label |
| XEQ | keyboard | execute a function or program |
| END | PGM.FCN | end of a program |
| STOP | R/S | stop program execution |
| R/S | keyboard | run / stop a program |
| PSE | PGM.FCN | pause about one second |
| PROMPT | PGM.FCN | display Alpha and halt |
| INPUT | PGM.FCN | prompt for a register/variable |
| VIEW | PGM.FCN | view a register or variable |
| MENU | PGM.FCN | select the programmable menu |
| KEYG | PGM.FCN | assign goto to a menu key |
| KEYX | PGM.FCN | assign execute to a menu key |
| GETKEY | PGM.FCN | wait for and return a key number |
| AGRAPH | PGM.FCN | display an Alpha graphics image |
| PIXEL | PGM.FCN | turn on one display pixel |
| BEEP | PGM.FCN | sound four tones |
| TONE | PGM.FCN | sound one tone |
| DSE | PGM.FCN | decrement, skip if ≤ |
| ISG | PGM.FCN | increment, skip if > |
| CPX? | PGM.FCN | skip unless X is complex |
| MAT? | PGM.FCN | skip unless X is a matrix |
| REAL? | PGM.FCN | skip unless X is real |
| STR? | PGM.FCN | skip unless X is a string |
| X<0? | PGM.FCN | test x < 0 |
| X≤0? | PGM.FCN | test x ≤ 0 |
| X=0? | PGM.FCN | test x = 0 |
| X≠0? | PGM.FCN | test x ≠ 0 |
| X>0? | PGM.FCN | test x > 0 |
| X≥0? | PGM.FCN | test x ≥ 0 |
| X<Y? | PGM.FCN | test x < y |
| X≤Y? | PGM.FCN | test x ≤ y |
| X=Y? | PGM.FCN | test x = y |
| X≠Y? | PGM.FCN | test x ≠ y |
| X>Y? | PGM.FCN | test x > y |
| X≥Y? | PGM.FCN | test x ≥ y |

## Alpha register

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| AON | PGM.FCN | turn Alpha mode on |
| AOFF | PGM.FCN | turn Alpha mode off |
| CLA | CLEAR | clear the Alpha register |
| ARCL | keyboard | append data to Alpha |
| ASTO | keyboard | store first six Alpha characters |
| ALENG | CATALOG | Alpha string length |
| AROT | CATALOG | rotate the Alpha register |
| ASHF | CATALOG | shift out six Alpha characters |
| AIP | PGM.FCN | append integer part to Alpha |
| ATOX | CATALOG | Alpha char to code, delete it |
| XTOA | PGM.FCN | append char (from code) to Alpha |
| POSA | CATALOG | find target position in Alpha |
| AVIEW | PGM.FCN | display the Alpha register |
| CLKEYS | CLEAR | clear all CUSTOM key assignments |
| CLMENU | CLEAR | clear the programmable menu |

## PRINT

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| PRA | PRINT | print the Alpha register |
| PRX | PRINT | print the X-register |
| PRV | PRINT | print a variable |
| PRSTK | PRINT | print the stack registers |
| PRUSR | PRINT | print user variables and programs |
| PRLCD | PRINT | print the display image |
| PRΣ | PRINT | print the summation registers |
| PRP | PRINT | print a program listing |
| LIST | PRINT | print part of a program |
| ADV | PRINT | advance the printer paper |
| DELAY | PRINT | set print delay time |
| MAN | PRINT | manual print mode |
| NORM | PRINT | normal print mode |
| TRACE | PRINT | trace print mode |
| PRON | PRINT | turn printing on |
| PROFF | PRINT | turn printing off |

## CLEAR

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| CLD | CLEAR | clear a display message |
| CLST | CLEAR | clear the stack |
| CLRG | CLEAR | clear all storage registers |
| CLV | CLEAR | clear a variable |
| CLP | CLEAR | clear a program |
| CLALL | CLEAR | clear all programs and data |
| CLLCD | CLEAR | blank the entire display |

## Menu, mode & control keys

| Command | Menu/Access | Description |
|---------|-------------|-------------|
| ALPHA | keyboard (shift) | select the ALPHA menu |
| BASE | keyboard (shift) | select the BASE menu |
| CATALOG | keyboard (shift) | select the CATALOG menu |
| CLEAR | keyboard (shift) | select the CLEAR menu |
| CONVERT | keyboard (shift) | select the CONVERT menu |
| CUSTOM | keyboard (shift) | select the CUSTOM menu |
| DISP | keyboard (shift) | select the DISP menu |
| FLAGS | keyboard (shift) | select the FLAGS menu |
| MODES | keyboard (shift) | select the MODES menu |
| PGM.FCN | keyboard (shift) | select the programming-functions menu |
| PRINT | keyboard (shift) | select the PRINT menu |
| PROB | keyboard (shift) | select the PROB menu |
| STAT | keyboard (shift) | select the STAT menu |
| ASSIGN | keyboard (shift) | assign a function to a CUSTOM key |
| PRGM | keyboard (shift) | toggle program-entry mode |
| BST | keyboard (shift) | back-step the program pointer |
| SST | keyboard | single-step the program pointer |
| GTO. | keyboard | move pointer to a line/label |
| GTO.. | keyboard | move pointer to new program space |
| RTN | keyboard | move pointer to line 00 |
| EXIT | keyboard | exit the current menu |
| EXITALL | CATALOG | exit all menus |
| MVAR | PGM.FCN | (see SOLVER) declare menu variable |
| KEYASN | MODES | (see MODES) key-assignment mode |
| ON | CATALOG | continuous-on (block auto power-off) |
| OFF | keyboard (shift) | turn the calculator off |
| QUIET | MODES | (see MODES) toggle beeper |

## Notes
- Names are taken exactly from the Operation Index; descriptions are paraphrased. The index lists ~300 functions/keys alphabetically; here they are regrouped by their menu (per the index's "Keys:" field).
- Some symbolic names are rendered with ASCII: `E↑X`/`E↑X-1` (e^x, e^x−1), `Y↑X`, `X↑2`, `10↑X`, `Σ+`/`Σ−`, `ΣREG`/`ΣREG?`, `→DEC/→OCT/→POL/…`, `R↑`/`R↓`, `X<>Y`/`X<>`, and the `X?0`/`X?Y` conditional tests.
- OCR of the index was noisy (e.g. "ALLZ"→ALLΣ, "cLv"→CLV, "comMB"→COMB, "EtX"→E↑X); function names were verified against the alphabetical ordering and the "Keys:" menu references. No entries were illegible enough to mark `[?]`.
- A few functions are reachable only via CATALOG FCN (no dedicated key), e.g. E↑X-1, LN1+X, hyperbolic functions, HMS+/HMS−, →DEC/→OCT, ALENG, AROT, ASHF, ATOX, POSA, R↑, EXITALL, ON.
