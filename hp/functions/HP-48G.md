# HP-48G — Function / Command Set

- **Access:** menu softkeys; keyboard; command name entry (ALPHA)
- **Approx. count:** 300 (representative subset of the ~450-operation ROM)
- **Source:** HP 48G Series User's Guide (Edition 8), Appendix G "Operation Index" — reference pages G-1…G-56 (PDF pp.480–537) — hp/manuals/HP-48G.pdf

## Stack

| Command | Description |
|---------|-------------|
| DUP | duplicate the level-1 object |
| DUP2 | duplicate the two lowest objects |
| DUPN | duplicate the lowest n objects |
| DROP | discard the level-1 object |
| DROP2 | discard the two lowest objects |
| DROPN | discard the lowest n objects |
| SWAP | exchange levels 1 and 2 |
| OVER | copy level 2 to level 1 |
| ROT | rotate the lowest three objects |
| ROLL | roll n levels upward |
| ROLLD | roll n levels downward |
| PICK | copy the nth object to level 1 |
| DEPTH | count objects currently on the stack |
| CLEAR | remove every object from the stack |
| NEWOB | make a fresh separate copy of an object |
| LASTARG | recall arguments of the last command |
| CLLCD | blank the stack display area |

## Real / Arithmetic

| Command | Description |
|---------|-------------|
| + | add two objects |
| − | subtract |
| × | multiply |
| ÷ | divide |
| ^ | raise to a power |
| NEG | negate |
| INV | reciprocal |
| ABS | absolute value or magnitude |
| SIGN | sign of a number |
| MANT | mantissa of a number |
| XPON | exponent of a number |
| IP | integer part |
| FP | fractional part |
| FLOOR | greatest integer not exceeding argument |
| CEIL | least integer not below argument |
| RND | round to given decimal places |
| TRNC | truncate to given decimal places |
| MAX | larger of two numbers |
| MIN | smaller of two numbers |
| MOD | remainder after division |
| % | percent of a number |
| %CH | percent change between two numbers |
| %T | percent that y is of x |
| RE | real part |
| IM | imaginary part |
| MAXR | largest machine real constant |
| MINR | smallest positive machine real |
| →NUM | evaluate to a numeric result |
| →Q | approximate as a fraction |
| →Qπ | approximate as a fraction of π |

## Trig / Hyperbolic / Exponential

| Command | Description |
|---------|-------------|
| SIN | sine |
| COS | cosine |
| TAN | tangent |
| ASIN | arc sine |
| ACOS | arc cosine |
| ATAN | arc tangent |
| SINH | hyperbolic sine |
| COSH | hyperbolic cosine |
| TANH | hyperbolic tangent |
| ASINH | inverse hyperbolic sine |
| ACOSH | inverse hyperbolic cosine |
| ATANH | inverse hyperbolic tangent |
| EXP | e raised to a power |
| LN | natural logarithm |
| LOG | base-10 logarithm |
| ALOG | base-10 antilogarithm |
| EXPM | exp(x) − 1, accurate near zero |
| LNP1 | ln(1+x), accurate near zero |
| SQ | square |
| √ | square root |
| XROOT | nth root of a number |
| D→R | degrees to radians |
| R→D | radians to degrees |
| →HMS | decimal hours to H.MS format |
| HMS→ | H.MS format to decimal hours |
| HMS+ | add two H.MS times |
| HMS− | subtract two H.MS times |

## Complex

| Command | Description |
|---------|-------------|
| R→C | build a complex from real and imaginary parts |
| C→R | split a complex into its two parts |
| ARG | polar angle of a complex number |
| CONJ | complex conjugate |
| →V2 | assemble a 2D vector or complex |
| V→ | disassemble a vector into components |
| RE | real part of complex/array |
| IM | imaginary part of complex/array |

## Probability / Statistics

| Command | Description |
|---------|-------------|
| FACT | factorial or gamma function |
| COMB | combinations of n things taken r |
| PERM | permutations of n things taken r |
| RAND | next pseudo-random number |
| RDZ | seed the random generator |
| Σ+ | add a data point to ΣDAT |
| Σ− | remove the last data point |
| NΣ | number of data rows |
| CLΣ | clear the statistics matrix |
| STOΣ | store the current statistics matrix |
| RCLΣ | recall the statistics matrix |
| MEAN | column means |
| SDEV | sample standard deviations |
| VAR | sample variances |
| MAXΣ | column maxima |
| MINΣ | column minima |
| TOT | column totals |
| ΣX | sum of x-column |
| ΣY | sum of y-column |
| ΣX2 | sum of squared x values |
| ΣY2 | sum of squared y values |
| ΣXY | sum of x·y products |
| CORR | correlation coefficient |
| COV | sample covariance |
| PCOV | population covariance |
| PSDEV | population standard deviations |
| PVAR | population variances |
| XCOL | set independent-variable column |
| YCOL | set dependent-variable column |
| LR | linear regression fit |
| PREDX | predict x from a y value |
| PREDY | predict y from an x value |
| LINFIT | choose linear curve-fit model |
| LOGFIT | choose logarithmic model |
| EXPFIT | choose exponential model |
| PWRFIT | choose power model |
| BESTFIT | pick model with best correlation |
| UTPC | upper-tail chi-square probability |
| UTPF | upper-tail Snedecor F probability |
| UTPN | upper-tail normal probability |
| UTPT | upper-tail Student-t probability |

## List

| Command | Description |
|---------|-------------|
| →LIST | build a list from n stack objects |
| LIST→ | explode a list onto the stack |
| OBJ→ | decompose an object into parts |
| HEAD | first element of a list |
| TAIL | list without its first element |
| GET | fetch element at a position |
| GETI | fetch element and increment index |
| PUT | replace element at a position |
| PUTI | replace element and increment index |
| POS | position of an element in a list |
| SIZE | number of elements or dimensions |
| SUB | extract a sublist or subset |
| REPL | replace part of a list/string |
| SORT | sort list elements ascending |
| REVLIST | reverse element order |
| ADD | add two lists element-by-element |
| ΣLIST | sum of all list elements |
| ΠLIST | product of all list elements |
| ΔLIST | successive differences of elements |
| DOLIST | apply a function across lists |
| DOSUBS | apply a function to sliding subsets |
| NSUB | current subset index inside DOSUBS |
| ENDSUB | subset count inside DOSUBS |
| STREAM | reduce a list with a binary function |
| SEQ | build a list by evaluating an expression |

## Array / Matrix (MTH MATRIX)

| Command | Description |
|---------|-------------|
| →ARRY | assemble an array from stack elements |
| ARRY→ | explode an array onto the stack |
| CON | constant array of given dimensions |
| IDN | identity matrix |
| RANM | random-element matrix |
| RDM | redimension an array |
| TRN | conjugate transpose |
| DET | determinant |
| INV | matrix inverse |
| ABS | Frobenius (Euclidean) norm |
| RNRM | row (infinity) norm |
| CNRM | column (one) norm |
| SNRM | spectral norm |
| SRAD | spectral radius |
| COND | condition number |
| RANK | matrix rank |
| TRACE | sum of diagonal elements |
| RSD | residual of a linear system |
| LSQ | least-squares/minimum-norm solution |
| DOT | dot product |
| CROSS | cross product |
| RREF | reduced row-echelon form |
| LU | LU decomposition with pivoting |
| QR | QR factorization |
| LQ | LQ factorization |
| SCHUR | Schur decomposition |
| SVD | singular value decomposition |
| SVL | singular values only |
| EGV | eigenvalues and eigenvectors |
| EGVL | eigenvalues only |
| DIAG→ | build a diagonal matrix from a vector |
| →DIAG | extract the diagonal of a matrix |
| COL→ | split a matrix into columns |
| →COL | assemble columns into a matrix |
| ROW→ | split a matrix into rows |
| →ROW | assemble rows into a matrix |
| COL+ | insert a column |
| COL− | delete a column |
| ROW+ | insert a row |
| ROW− | delete a row |
| CSWP | swap two columns |
| RSWP | swap two rows |
| RCI | scale a row |
| RCIJ | add a multiple of one row to another |
| CNCT | matrix from a connectivity list |

## Binary / Base

| Command | Description |
|---------|-------------|
| DEC | set decimal base |
| HEX | set hexadecimal base |
| OCT | set octal base |
| BIN | set binary base |
| STWS | set binary word size |
| RCWS | recall current word size |
| R→B | real to binary integer |
| B→R | binary integer to real |
| AND | bitwise/logical AND |
| OR | bitwise/logical OR |
| XOR | bitwise/logical exclusive OR |
| NOT | bitwise/logical complement |
| SL | shift left one bit |
| SR | shift right one bit |
| SLB | shift left one byte |
| SRB | shift right one byte |
| ASR | arithmetic shift right |
| RL | rotate left one bit |
| RR | rotate right one bit |
| RLB | rotate left one byte |
| RRB | rotate right one byte |

## Algebra / Symbolic

| Command | Description |
|---------|-------------|
| COLCT | collect like terms |
| EXPAN | expand products and powers |
| ISOL | isolate a variable in an equation |
| QUAD | solve as a quadratic in a variable |
| SHOW | show all references to a variable |
| OBJ→ | split an equation into parts |
| →STR | convert an object to a string |
| STR→ | parse a string into an object |
| EQ→ | split an equation into two sides |
| →EQ? | (see EQ→) build/split equation |
| SUBST | substitute into an expression |
| |  (WHERE) | substitute values for names |
| ↑MATCH | pattern-match and rewrite top-down |
| ↓MATCH | pattern-match and rewrite bottom-up |
| TAYLR | Taylor-series approximation |
| APPLY | build an expression from a function and args |
| QUOTE | return an expression unevaluated |
| →DEF? / DEFINE | store an equation as a function/variable |
| RCEQ | recall the current equation |
| STEQ | store the current equation |

## Calculus

| Command | Description |
|---------|-------------|
| ∂ | symbolic/numeric derivative |
| ∫ | definite or symbolic integral |
| Σ (SIGMA) | symbolic summation |
| TAYLR | Taylor polynomial of an expression |

## Solve / Roots

| Command | Description |
|---------|-------------|
| ROOT | numeric root of an equation |
| MSOLVR | open the multiple-equation solver |
| MROOT | solve a multiple-equation system |
| MCALC | mark a variable for solving |
| MUSER | mark a variable as user-defined |
| MINIT | initialize the multiple-equation set |
| MITM | set solver menu title and labels |
| PROOT | roots of a polynomial |
| PCOEF | polynomial from its roots |
| PEVAL | evaluate a polynomial |
| QUAD | solve a quadratic form |
| TVM | open the time-value-of-money solver |
| TVMROOT | solve for a chosen TVM variable |
| TVMBEG | set begin-of-period payments |
| TVMEND | set end-of-period payments |
| AMORT | amortize a number of payments |

## Plot / Graphics

| Command | Description |
|---------|-------------|
| STEQ | store the equation to plot |
| DRAW | plot the current equation |
| DRAX | draw the plot axes |
| ERASE | clear the PICT graphics area |
| AUTO | auto-scale the plot range |
| PDIM | set PICT dimensions |
| PMIN | set lower-left plot corner |
| PMAX | set upper-right plot corner |
| CENTR | center the plot on a point |
| SCALE | set units per tick |
| XRNG | set x display range |
| YRNG | set y display range |
| INDEP | set the independent variable |
| DEPND | set the dependent variable |
| RES | set plot resolution |
| AXES | set axis origin, ticks and labels |
| ATICK | set axis tick spacing |
| FUNCTION | select function plot type |
| CONIC | select conic plot type |
| POLAR | select polar plot type |
| PARAMETRIC | select parametric plot type |
| TRUTH | select truth (inequality) plot type |
| BAR | select bar-chart plot type |
| HISTOGRAM | select histogram plot type |
| SCATTER | select scatter plot type |
| SLOPEFIELD | select slope-field plot type |
| WIREFRAME | select 3D wireframe plot type |
| PCONTOUR | select contour plot type |
| GRIDMAP | select grid-map plot type |
| PARSURFACE | select parametric-surface plot type |
| YSLICE | select y-slice plot type |
| PICT | put the PICT graphics object on the stack |
| PVIEW | display PICT at a position |
| PX→C | pixel coordinates to user coordinates |
| C→PX | user coordinates to pixel coordinates |
| PIXON | turn a pixel on |
| PIXOFF | turn a pixel off |
| PIX? | test whether a pixel is on |
| LINE | draw a line between two points |
| TLINE | toggle pixels along a line |
| BOX | draw a rectangle |
| ARC | draw a circular arc |
| →GROB | render an object as a graphic |
| GOR | overlay graphics (OR) |
| GXOR | overlay graphics (XOR) |
| REPL | paste a graphic into PICT |
| SUB | copy a region of a graphic |
| BLANK | create a blank graphic |
| SIZE | dimensions of a graphic |
| LCD→ | capture the display as a graphic |
| →LCD | send a graphic to the display |
| FREEZE | freeze display areas |

## Program / Branch / Test

| Command | Description |
|---------|-------------|
| IF / THEN / ELSE / END | conditional structure |
| IFT | if-then on the stack |
| IFTE | if-then-else function |
| CASE / THEN / END | multi-branch structure |
| FOR / NEXT / STEP | counted loop |
| START / NEXT / STEP | counted loop without a counter |
| DO / UNTIL / END | loop until condition |
| WHILE / REPEAT / END | loop while condition |
| IFERR / THEN / END | trap and handle errors |
| == | test equality (value) |
| ≠ | test inequality |
| < | less than |
| > | greater than |
| ≤ | less than or equal |
| ≥ | greater than or equal |
| SAME | test structural equality |
| AND | logical conjunction |
| OR | logical disjunction |
| XOR | logical exclusive-or |
| NOT | logical negation |
| TYPE | object type number |
| VTYPE | type of a stored variable |
| SST | single-step a program |
| HALT | pause program execution |
| CONT | resume a halted program |
| KILL | abort suspended programs |
| WAIT | pause for keypress or seconds |
| KEY | read the pressed key |
| BEEP | sound a tone |
| DISP | show an object on a display line |
| PROMPT | halt and show a prompt |
| INPUT | prompt for command-line input |
| INFORM | display a data-entry input form |
| CHOOSE | display a choose box |
| MSGBOX | display a message box |
| NOVAL | placeholder for an empty field |
| ERRN | number of the last error |
| ERRM | message of the last error |
| DOERR | raise a user error |
| →STR | object to string for display |
| EVAL | evaluate an object |
| →ARRY / RCLF etc. | (see other menus) |

## String / Character

| Command | Description |
|---------|-------------|
| →STR | convert an object to a string |
| STR→ | evaluate a string as an object |
| CHR | character from its code |
| NUM | code of a string's first character |
| SIZE | number of characters |
| POS | find a substring position |
| SUB | extract a substring |
| REPL | replace part of a string |
| DISP | display a string |

## Units

| Command | Description |
|---------|-------------|
| →UNIT | attach units to a number |
| UBASE | convert to SI base units |
| CONVERT | convert between compatible units |
| UVAL | numeric value without units |
| UFACT | factor a unit out of a quantity |

## Memory / Directory

| Command | Description |
|---------|-------------|
| STO | store an object in a variable |
| RCL | recall a variable's contents |
| PURGE | delete variables |
| PURG | delete a single variable |
| CRDIR | create a subdirectory |
| PGDIR | delete a directory |
| UPDIR | move to the parent directory |
| HOME | go to the root directory |
| PATH | list the current directory path |
| VARS | names in the current directory |
| TVARS | variables of a given type |
| ORDER | reorder directory entries |
| MEM | free memory in bytes |
| BYTES | object size and checksum |
| NEWOB | copy an object out of a variable |
| ARCHIVE | back up the HOME directory |
| RESTORE | restore an archived HOME |
| DEFINE | define a variable or function |
| STO+ | add to a stored variable |
| STO− | subtract from a stored variable |
| STO× | multiply a stored variable |
| STO÷ | divide a stored variable |
| INCR | increment a stored variable |
| DECR | decrement a stored variable |
| SINV | invert a stored variable |
| SNEG | negate a stored variable |
| SCONJ | conjugate a stored variable |

## Modes / Flags / Custom

| Command | Description |
|---------|-------------|
| STD | standard display format |
| FIX | fixed decimal places |
| SCI | scientific notation |
| ENG | engineering notation |
| DEG | degrees angle mode |
| RAD | radians angle mode |
| GRAD | grads angle mode |
| RECT | rectangular coordinate mode |
| CYLIN | polar/cylindrical coordinate mode |
| SPHERE | spherical coordinate mode |
| SF | set a user/system flag |
| CF | clear a flag |
| FS? | test whether a flag is set |
| FC? | test whether a flag is clear |
| FS?C | test a flag then clear it |
| FC?C | test a flag then clear it |
| RCLF | recall flag states |
| STOF | store flag states |
| MENU | display a numbered built-in menu |
| TMENU | display a temporary custom menu |
| RCLMENU | number of the current menu |
| CST | display the CST custom menu |
| MODES | open the modes menu |

## Time / Alarm

| Command | Description |
|---------|-------------|
| DATE | current system date |
| →DATE | set the system date |
| TIME | current system time |
| →TIME | set the system time |
| TICKS | system clock ticks |
| DATE+ | add days to a date |
| DDAYS | days between two dates |
| TSTR | date/time as a string |
| CLKADJ | adjust the clock by ticks |
| STOALARM | set an alarm |
| RCLALARM | recall an alarm's data |
| DELALARM | delete an alarm |
| FINDALARM | find the next due alarm |
| ACK | acknowledge the current alarm |
| ACKALL | acknowledge all past-due alarms |

## I/O

| Command | Description |
|---------|-------------|
| SEND | send objects to another device |
| RECV | receive an object |
| KGET | get an object by Kermit |
| SERVER | enter Kermit server mode |
| BAUD | set the serial baud rate |
| PARITY | set serial parity |
| CKSM | set the Kermit checksum scheme |
| TRANSIO | set the I/O translation mode |
| OPENIO | open the serial port |
| CLOSEIO | close the serial port |
| BUFLEN | bytes waiting in the input buffer |
| SRECV | receive characters from the port |
| XMIT | transmit a string out the port |
| STIME | set the I/O timeout |
| PRINT | print an object |
| PR1 | print a single object |
| PRST | print the whole stack |
| PRVAR | print variables |
| PRLCD | print the display |
| CR | print a carriage return |
| DELAY | set the print delay |
| OLDPRT | select the older printer format |

## Notes
- Descriptions are paraphrased; command names are exact per the Operation Index. OCR-mangled glyphs (arrows →, Greek Σ Π Δ ∂ ∫, comparison symbols) were reconstructed to their documented forms.
- This lists a comprehensive working subset; the full ROM has roughly 450 operations (including keyboard-only editing operations such as EDIT, VISIT, CANCL, ECHO and EquationWriter RULES operations →A, A→, ←, ↑, DNEG, E→, AF, LCE, etc., omitted here as interactive rather than programmable).
- `→Qπ` and `|` (WHERE) render in the manual with special glyphs; forms shown follow HP's documented spellings.
