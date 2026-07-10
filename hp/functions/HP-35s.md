# HP-35s — Function / Command Set

- **Access:** Most functions live on the keyboard — primary face legend, left-shift (yellow, above key, written ←FN), or right-shift (blue, bottom-left, written →FN). No softkey row; multi-item menus (MODE, DISPLAY, CONST, BASE, LOGIC, FLAGS, x?y, x?0, L.R., x̄ȳ, s,σ, SUMS, CLEAR, MEM) are opened by a key/shift and navigated with the cursor keys. Alpha letters A–Z are typed directly when the A..Z annunciator is active.
- **Approx. count:** 205
- **Source:** HP 35s scientific calculator user's guide, Edition 1 — chapters 1–2 (stack/display), 3 (memory), 4 (real-number, constants, conversions, probability), 5 (fractions), 6–8 (equations/SOLVE/integration), 9 (complex), 10 (vectors), 11 (base/logic), 12 (statistics), 13–14 (programming/flags/tests), and Operation Index G-1..G-17 — hp/manuals/HP-35s.pdf (PDF pages 36, 81–83, 158–162, 166–178, 215–222, 353–368).

## Stack & Memory

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ENTER | ENTER | pushes x up, duplicating it into y |
| R↓ | R↓ | rolls stack down (t→z→y→x→t) |
| R↑ | →R↑ | rolls stack up (t←z←y←x←t) |
| x↔y | x↔y | swaps the X and Y registers |
| LASTx | →LASTx | recalls the last-x value |
| CLx | ←CLEAR menu | clears the X register to zero |
| CLSTK | ←CLEAR menu | clears all four stack levels to zero |
| STO | STO | stores x into a named variable |
| RCL | RCL | recalls a variable into x |
| STO+ | STO then + | adds x into a stored variable |
| STO− | STO then − | subtracts x from a stored variable |
| STO× | STO then × | multiplies a stored variable by x |
| STO÷ | STO then ÷ | divides a stored variable by x |
| RCL+ | RCL then + | returns x plus a variable |
| RCL− | RCL then − | returns x minus a variable |
| RCL× | RCL then × | returns x times a variable |
| RCL÷ | RCL then ÷ | returns x divided by a variable |
| x↔ variable | RCL then x↔y | exchanges x with a named variable |
| VIEW | ←VIEW | shows a variable's value without recalling it |
| CLVARS | ←CLEAR menu | clears all variables to zero |
| CLVARx | ←CLEAR menu | clears indirect variables above the x address |
| MEM | ←MEM | shows free memory and catalog menu |
| VAR catalog | ←MEM then menu | browses stored variables |
| PGM catalog | ←MEM then menu | browses stored programs |
| SHOW | ←SHOW | shows full 12-digit mantissa or checksum |
| UNDO | ←UNDO | restores the last cleared or changed entry |
| CLEAR | →CLEAR | opens the clear-memory menu |

## Arithmetic & Numeric

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + | + | addition |
| − | − | subtraction |
| × | × | multiplication |
| ÷ | ÷ | division |
| +/− | +/− | changes the sign of x |
| 1/x | 1/x | reciprocal of x |
| ABS | →ABS | absolute value of x |
| RND | →RND | rounds x to the current display format |
| IP | equation IP() | integer part of x |
| FP | equation FP() | fractional part of x |
| INTG | ←INTG | greatest integer not exceeding x |
| SGN | equation SGN() | sign of x (−1, 0, or +1) |
| INT÷ | ÷ (integer mode) | integer quotient of a division |
| IDIV | equation IDIV() | integer quotient of two integers |
| RMDR | equation RMDR() | remainder of an integer division |
| π | ←π | inserts pi to 12 digits |
| E | E | begins exponent-of-ten entry |
| RANDOM | →RAND | random number between 0 and 1 |
| SEED | ←SEED | seeds the random-number generator |

## Power, Root & Logarithmic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| yˣ | yˣ | raises y to the x power |
| x² | →x² | squares x |
| √x | √x | square root of x |
| x√y | ←x√y | the x-th root of y |
| XROOT | equation XROOT() | root form used in equations |
| SQ | equation SQ() | square, equation form |
| SQRT | equation SQRT() | square root, equation form |
| LN | →LN | natural logarithm |
| LOG | ←LOG | common (base-10) logarithm |
| eˣ | →eˣ | natural exponential |
| 10ˣ | ←10ˣ | common (base-10) exponential |
| EXP | equation EXP() | natural exponential, equation form |
| ALOG | equation ALOG() | base-10 antilogarithm, equation form |
| INV | equation INV() | reciprocal, equation form |

## Trigonometry & Hyperbolic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SIN | SIN | sine of x |
| COS | COS | cosine of x |
| TAN | TAN | tangent of x |
| ASIN | →ASIN | inverse sine |
| ACOS | →ACOS | inverse cosine |
| ATAN | →ATAN | inverse tangent |
| HYP | ←HYP | hyperbolic prefix for next trig key |
| SINH | ←HYP then SIN | hyperbolic sine |
| COSH | ←HYP then COS | hyperbolic cosine |
| TANH | ←HYP then TAN | hyperbolic tangent |
| ASINH | ←HYP then →ASIN | inverse hyperbolic sine |
| ACOSH | ←HYP then →ACOS | inverse hyperbolic cosine |
| ATANH | ←HYP then →ATAN | inverse hyperbolic tangent |

## Percentage & Conversions

| Function/Command | Access | Description |
|------------------|--------|-------------|
| % | →% | percent: (y × x) ÷ 100 |
| %CHG | ←%CHG | percent change from y to x |
| →°F | ←→°F | converts Celsius to Fahrenheit |
| →°C | →→°C | converts Fahrenheit to Celsius |
| →cm | →→cm | converts inches to centimetres |
| →in | ←→in | converts centimetres to inches |
| →kg | →→kg | converts pounds to kilograms |
| →lb | ←→lb | converts kilograms to pounds |
| →KM | →→KM | converts miles to kilometres |
| →MILE | ←→MILE | converts kilometres to miles |
| →l | →→l | converts gallons to litres |
| →gal | ←→gal | converts litres to gallons |
| →DEG | →→DEG | converts radians to degrees |
| →RAD | ←→RAD | converts degrees to radians |
| →HMS | →→HMS | converts decimal hours to H.MMSS |
| HMS→ | ←HMS→ | converts H.MMSS to decimal hours |

## Complex Numbers

| Function/Command | Access | Description |
|------------------|--------|-------------|
| i | i | imaginary-part separator for entry |
| θ | →θ | polar angle separator for entry |
| ARG | ←ARG | argument (angle) of a complex number |
| ABS | →ABS | modulus (magnitude) of a complex number |
| xiy | ←DISPLAY menu | display complex as x i y |
| x+yi | ←DISPLAY menu | display complex as x + yi |
| rθa | ←DISPLAY menu | display complex in polar r∠θ form |

## Vectors

| Function/Command | Access | Description |
|------------------|--------|-------------|
| [ ] | →[ ] | begins a 2-D or 3-D vector entry |
| vector + | + | adds two vectors of equal length |
| vector − | − | subtracts two vectors of equal length |
| vector × scalar | × | multiplies a vector by a scalar |
| vector ÷ scalar | ÷ | divides a vector by a scalar |
| ABS (vector) | →ABS | magnitude of a vector |
| DOT | equation/→θ dot | dot product of two equal-length vectors |

## Probability & Statistics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| nCr | ←nCr | combinations of n taken r |
| nPr | →nPr | permutations of n taken r |
| ! | →! | factorial (or gamma) of x |
| Σ+ | Σ+ | accumulates (x,y) into the stat registers |
| Σ− | ←Σ− | removes (x,y) from the stat registers |
| x̄ | ←x̄,ȳ menu | mean of x-values |
| ȳ | ←x̄,ȳ menu | mean of y-values |
| x̄w | ←x̄,ȳ menu | weighted mean of x using y as weights |
| sx | →s,σ menu | sample standard deviation of x |
| sy | →s,σ menu | sample standard deviation of y |
| σx | →s,σ menu | population standard deviation of x |
| σy | →s,σ menu | population standard deviation of y |
| x̂ | ←L.R menu | predicts x from a given y (regression) |
| ŷ | ←L.R menu | predicts y from a given x (regression) |
| r | ←L.R menu | correlation coefficient |
| m | ←L.R menu | slope of the regression line |
| b | ←L.R menu | y-intercept of the regression line |
| n | →SUMS menu | count of accumulated data pairs |
| Σx | →SUMS menu | sum of x-values |
| Σy | →SUMS menu | sum of y-values |
| Σx² | →SUMS menu | sum of x-squares |
| Σy² | →SUMS menu | sum of y-squares |
| Σxy | →SUMS menu | sum of x·y products |

## Base & Logic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| BASE | →BASE menu | opens the number-base selection menu |
| DEC | BASE menu | selects decimal (base 10) mode |
| HEX | BASE menu | selects hexadecimal (base 16) mode |
| OCT | BASE menu | selects octal (base 8) mode |
| BIN | BASE menu | selects binary (base 2) mode |
| LOGIC | ←LOGIC menu | opens the bitwise logic menu |
| AND | LOGIC menu | bitwise AND of two arguments |
| OR | LOGIC menu | bitwise OR of two arguments |
| XOR | LOGIC menu | bitwise exclusive-OR of two arguments |
| NOT | LOGIC menu | one's complement (bitwise NOT) |
| NAND | LOGIC menu | bitwise NAND of two arguments |
| NOR | LOGIC menu | bitwise NOR of two arguments |

## Physical Constants (CONST menu — 41 items)

| Function/Command | Access | Description |
|------------------|--------|-------------|
| speed of light | →CONST | speed of light in vacuum, c |
| standard gravity | →CONST | standard acceleration of gravity, g |
| Newtonian G | →CONST | gravitational constant, G |
| molar volume | →CONST | molar volume of an ideal gas |
| Avogadro | →CONST | Avogadro constant, NA |
| Rydberg | →CONST | Rydberg constant, R∞ |
| elementary charge | →CONST | elementary charge, e |
| electron mass | →CONST | rest mass of the electron |
| proton mass | →CONST | rest mass of the proton |
| neutron mass | →CONST | rest mass of the neutron |
| muon mass | →CONST | rest mass of the muon |
| Boltzmann | →CONST | Boltzmann constant, k |
| Planck | →CONST | Planck constant, h |
| Planck over 2π | →CONST | reduced Planck constant, ħ |
| magnetic flux quantum | →CONST | magnetic flux quantum, Φ0 |
| Bohr radius | →CONST | Bohr radius, a0 |
| electric constant | →CONST | vacuum permittivity, ε0 |
| molar gas constant | →CONST | universal gas constant, R |
| Faraday | →CONST | Faraday constant, F |
| atomic mass constant | →CONST | atomic mass unit, u |
| magnetic constant | →CONST | vacuum permeability, μ0 |
| Bohr magneton | →CONST | Bohr magneton, μB |
| nuclear magneton | →CONST | nuclear magneton, μN |
| proton magnetic moment | →CONST | magnetic moment of the proton |
| electron magnetic moment | →CONST | magnetic moment of the electron |
| neutron magnetic moment | →CONST | magnetic moment of the neutron |
| muon magnetic moment | →CONST | magnetic moment of the muon |
| classical electron radius | →CONST | classical electron radius, re |
| impedance of vacuum | →CONST | characteristic impedance of vacuum, Z0 |
| Compton wavelength | →CONST | Compton wavelength of the electron |
| neutron Compton wavelength | →CONST | Compton wavelength of the neutron |
| proton Compton wavelength | →CONST | Compton wavelength of the proton |
| fine structure constant | →CONST | fine-structure constant, α |
| Stefan–Boltzmann | →CONST | Stefan–Boltzmann constant, σ |
| Celsius temperature | →CONST | zero Celsius in kelvin (273.15) |
| standard atmosphere | →CONST | standard atmospheric pressure |
| proton gyromagnetic ratio | →CONST | proton gyromagnetic ratio, γp |
| first radiation constant | →CONST | first radiation constant, c1 |
| second radiation constant | →CONST | second radiation constant, c2 |
| conductance quantum | →CONST | conductance quantum, G0 |
| natural constant e | →CONST | base of natural logarithms (2.71828…) |

## Equation Solver & Integration

| Function/Command | Access | Description |
|------------------|--------|-------------|
| EQN | EQN | enters or leaves equation-entry mode |
| SOLVE | →SOLVE | solves the current equation for a variable |
| ∫FN | ←∫ | numerical definite integral of the equation |
| FN= | ←FN= | selects a program label as the current function |
| = | ←= (equation) | evaluates the displayed equation |
| XEQ (eval) | XEQ | evaluates the displayed equation |

## Programming & Flow Control

| Function/Command | Access | Description |
|------------------|--------|-------------|
| PRGM | →PRGM | toggles program-entry mode |
| LBL | →LBL | labels a program routine |
| GTO | GTO | branches the program pointer to a label/line |
| XEQ | XEQ | executes a labelled program |
| RTN | ←RTN | returns from a routine or ends a program |
| R/S | R/S | runs or stops a program (STOP) |
| INPUT | ←INPUT | prompts for and stores a variable |
| VIEW | ←VIEW | displays a variable during a program |
| PSE | →PSE | briefly pauses to show a value |
| ISG | ←ISG | increment-and-skip-if-greater loop counter |
| DSE | →DSE | decrement-and-skip-if-less-or-equal loop counter |
| (I)/(J) | RCL/STO (i)/(j) | indirect variable addressing via I or J |

## Flags & Tests

| Function/Command | Access | Description |
|------------------|--------|-------------|
| FLAGS | ←FLAGS menu | opens the set/clear/test flag menu |
| SF | FLAGS menu | sets flag n (0–11) |
| CF | FLAGS menu | clears flag n (0–11) |
| FS? | FLAGS menu | tests whether flag n is set |
| x?y | ←x?y menu | opens the x-versus-y comparison menu |
| x≠y? | x?y menu | do-if-true test: x not equal to y |
| x≤y? | x?y menu | do-if-true test: x less than or equal to y |
| x<y? | x?y menu | do-if-true test: x less than y |
| x>y? | x?y menu | do-if-true test: x greater than y |
| x≥y? | x?y menu | do-if-true test: x greater than or equal to y |
| x=y? | x?y menu | do-if-true test: x equal to y |
| x?0 | →x?0 menu | opens the x-versus-zero comparison menu |
| x≠0? | x?0 menu | do-if-true test: x not equal to zero |
| x≤0? | x?0 menu | do-if-true test: x less than or equal to zero |
| x<0? | x?0 menu | do-if-true test: x less than zero |
| x>0? | x?0 menu | do-if-true test: x greater than zero |
| x≥0? | x?0 menu | do-if-true test: x greater than or equal to zero |
| x=0? | x?0 menu | do-if-true test: x equal to zero |

## Display & Mode

| Function/Command | Access | Description |
|------------------|--------|-------------|
| DISPLAY | ←DISPLAY menu | opens the number-format menu |
| FIX | DISPLAY menu | fixed decimal places (0–11) |
| SCI | DISPLAY menu | scientific notation with n digits |
| ENG | DISPLAY menu | engineering notation with n digits |
| ALL | DISPLAY menu | shows all significant digits |
| RADIX . | DISPLAY menu | sets period as the radix mark |
| RADIX , | DISPLAY menu | sets comma as the radix mark |
| ←ENG | ←ENG | shifts exponent display down by three |
| ENG→ | →ENG | shifts exponent display up by three |
| MODE | MODE | opens the operating/angular mode menu |
| RPN | MODE menu | selects Reverse Polish Notation entry |
| ALG | MODE menu | selects algebraic entry |
| DEG | MODE menu | sets degrees angular mode |
| RAD | MODE menu | sets radians angular mode |
| GRAD | MODE menu | sets grads angular mode |
| ON | ON (C key) | turns the calculator on |
| OFF | ←OFF | turns the calculator off |

## Fractions & Time

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ab/c | ab/c key | enters a number as a fraction |
| /c | ←/c | sets the maximum fraction denominator |
| FDISP | →FDISP | toggles fraction-display mode |
| →HMS | →→HMS | converts decimal hours to hours-minutes-seconds |
| HMS→ | ←HMS→ | converts hours-minutes-seconds to decimal hours |
| →DEG | →→DEG | converts radians to decimal degrees |
| →RAD | ←→RAD | converts decimal degrees to radians |

## Notes
- Names are exact (per the Operation Index); descriptions are original one-line summaries.
- Names shown are those used in program lines; nonprogrammable operations (ENTER, SHOW, catalogs, etc.) are keyboard-only.
- Unit conversions come in pairs sharing a key: the yellow left-shift gives one direction, the blue right-shift the other.
- CONST is a single menu exposing 41 physics constants, not enumerated individually here.
- The calculator also runs in ALG (algebraic) entry mode; the same functions apply with algebraic order.
