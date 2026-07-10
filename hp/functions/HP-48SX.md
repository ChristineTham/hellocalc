# HP-48SX — Function / Command Set

- **Access:** menu softkeys; keyboard; command name entry (ALPHA)
- **Approx. count:** 230 (representative subset of the ~350-operation S/SX ROM)
- **Source:** HP 48SX Owner's Manual — per-menu command tables: MTH (pp.137–150), VAR arithmetic (p.119), display/modes (p.61), flags (p.225), SOLVE (pp.259–274), PLOT/PLOTR (pp.293–343), graphics (pp.345–347), complex arrays (pp.360–361), STAT (pp.371–390), symbolic ALGEBRA (pp.392–398), TIME/alarms (pp.443–460) — PDF pp.61–460 — hp/manuals/HP-48SX.pdf

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
| DEPTH | count objects on the stack |
| CLEAR | remove every object from the stack |
| NEWOB | make a separate copy of an object |
| CLLCD | blank the stack display |

## Real / Arithmetic

| Command | Description |
|---------|-------------|
| + | add |
| − | subtract |
| × | multiply |
| ÷ | divide |
| ^ | raise to a power |
| NEG | negate |
| INV | reciprocal |
| ABS | absolute value or magnitude |
| SIGN | sign of a number |
| MANT | mantissa |
| XPON | exponent |
| IP | integer part |
| FP | fractional part |
| FLOOR | greatest integer not exceeding argument |
| CEIL | least integer not below argument |
| RND | round to decimal places |
| TRNC | truncate to decimal places |
| MAX | larger of two numbers |
| MIN | smaller of two numbers |
| MOD | remainder after division |
| % | percent of a number |
| %CH | percent change |
| %T | percent of total |
| RE | real part |
| IM | imaginary part |
| MAXR | largest machine real |
| MINR | smallest positive machine real |
| →NUM | evaluate to a number |
| →Q | approximate as a fraction |

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
| EXP | e to a power |
| LN | natural logarithm |
| LOG | base-10 logarithm |
| ALOG | base-10 antilogarithm |
| EXPM | exp(x) − 1 accurate near zero |
| LNP1 | ln(1+x) accurate near zero |
| SQ | square |
| √ | square root |
| XROOT | nth root |
| D→R | degrees to radians |
| R→D | radians to degrees |
| →HMS | decimal to H.MS format |
| HMS→ | H.MS to decimal |
| HMS+ | add H.MS times |
| HMS− | subtract H.MS times |

## Complex

| Command | Description |
|---------|-------------|
| R→C | build complex from real and imaginary |
| C→R | split complex into two parts |
| ARG | polar angle of a complex |
| CONJ | complex conjugate |
| →V2 | assemble a 2D vector/complex |
| V→ | disassemble a vector |
| RE | real part |
| IM | imaginary part |
| C→R | complex array to two real arrays |
| R→C | two real arrays to a complex array |

## Probability / Statistics

| Command | Description |
|---------|-------------|
| FACT | factorial or gamma |
| COMB | combinations |
| PERM | permutations |
| RAND | next random number |
| RDZ | seed the random generator |
| Σ+ | add a data point |
| Σ− | remove the last data point |
| NΣ | number of data rows |
| CLΣ | clear the statistics matrix |
| STOΣ | store the statistics matrix |
| RCLΣ | recall the statistics matrix |
| MEAN | column means |
| SDEV | standard deviations |
| VAR | variances |
| MAXΣ | column maxima |
| MINΣ | column minima |
| TOT | column totals |
| ΣX | sum of x-column |
| ΣY | sum of y-column |
| ΣX2 | sum of squared x values |
| ΣY2 | sum of squared y values |
| ΣXY | sum of x·y products |
| CORR | correlation coefficient |
| COV | covariance |
| XCOL | set independent column |
| YCOL | set dependent column |
| LR | linear regression |
| PREDV | predicted dependent value |
| UTPC | upper-tail chi-square probability |
| UTPF | upper-tail F probability |
| UTPN | upper-tail normal probability |
| UTPT | upper-tail Student-t probability |

## List

| Command | Description |
|---------|-------------|
| →LIST | build a list from stack objects |
| LIST→ | explode a list onto the stack |
| OBJ→ | decompose an object |
| GET | fetch element at a position |
| GETI | fetch element and increment index |
| PUT | replace element at a position |
| PUTI | replace element and increment index |
| POS | position of an element |
| SIZE | number of elements/dimensions |
| SUB | extract a sublist |
| REPL | replace part of a list |

## Array / Matrix

| Command | Description |
|---------|-------------|
| →ARRY | assemble an array from stack elements |
| ARRY→ | explode an array onto the stack |
| CON | constant array |
| IDN | identity matrix |
| RANM | random matrix |
| RDM | redimension an array |
| TRN | transpose (conjugate) |
| DET | determinant |
| INV | matrix inverse |
| ABS | Frobenius norm |
| RNRM | row norm |
| CNRM | column norm |
| RSD | residual of a linear system |
| DOT | dot product |
| CROSS | cross product |
| →V3 | assemble a 3D vector |
| PUT | set an array element |
| GET | read an array element |

## Binary / Base

| Command | Description |
|---------|-------------|
| DEC | decimal base |
| HEX | hexadecimal base |
| OCT | octal base |
| BIN | binary base |
| STWS | set word size |
| RCWS | recall word size |
| R→B | real to binary integer |
| B→R | binary integer to real |
| AND | bitwise/logical AND |
| OR | bitwise/logical OR |
| XOR | bitwise/logical XOR |
| NOT | bitwise/logical NOT |
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
| ISOL | isolate a variable |
| QUAD | solve as a quadratic |
| SHOW | expose references to a variable |
| OBJ→ | split an equation into parts |
| →STR | object to string |
| STR→ | parse a string to an object |
| SUBST? / | (WHERE) | substitute into an expression |
| ↑MATCH | rewrite by pattern, top-down |
| ↓MATCH | rewrite by pattern, bottom-up |
| TAYLR | Taylor-series approximation |
| APPLY | build an expression from function and args |
| QUOTE | return an expression unevaluated |
| ∂ | derivative |
| ∫ | integral |
| Σ | summation |
| RCEQ | recall the current equation |
| STEQ | store the current equation |

## Solve / Roots

| Command | Description |
|---------|-------------|
| ROOT | numeric root of an equation |
| STEQ | store the equation to solve |
| RCEQ | recall the current equation |
| PROOT | polynomial roots |
| PEVAL | evaluate a polynomial |

## Plot / Graphics

| Command | Description |
|---------|-------------|
| STEQ | store the equation to plot |
| DRAW | plot the current equation |
| DRAX | draw plot axes |
| ERASE | clear the PICT area |
| PDIM | set PICT dimensions |
| PMIN | set lower-left corner |
| PMAX | set upper-right corner |
| CENTR | center the plot on a point |
| SCALE | set units per tick |
| INDEP | set the independent variable |
| RES | set plot resolution |
| AXES | set axis origin |
| FUNCTION | function plot type |
| CONIC | conic plot type |
| POLAR | polar plot type |
| PARAMETRIC | parametric plot type |
| TRUTH | truth (inequality) plot type |
| BAR | bar-chart plot type |
| HISTOGRAM | histogram plot type |
| SCATTER | scatter plot type |
| PICT | put PICT on the stack |
| PVIEW | display PICT at a position |
| PX→C | pixel to user coordinates |
| C→PX | user to pixel coordinates |
| PIXON | turn a pixel on |
| PIXOFF | turn a pixel off |
| PIX? | test a pixel |
| LINE | draw a line |
| TLINE | toggle pixels along a line |
| BOX | draw a rectangle |
| ARC | draw an arc |
| →GROB | render an object as a graphic |
| GOR | overlay graphics (OR) |
| GXOR | overlay graphics (XOR) |
| BLANK | create a blank graphic |
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
| START / NEXT / STEP | counted loop, no counter |
| DO / UNTIL / END | loop until condition |
| WHILE / REPEAT / END | loop while condition |
| IFERR / THEN / END | error trap |
| == | test value equality |
| ≠ | test inequality |
| < | less than |
| > | greater than |
| ≤ | less than or equal |
| ≥ | greater than or equal |
| SAME | test structural equality |
| AND | logical AND |
| OR | logical OR |
| XOR | logical XOR |
| NOT | logical NOT |
| TYPE | object type number |
| SST | single-step a program |
| HALT | pause a program |
| CONT | resume a halted program |
| KILL | abort suspended programs |
| WAIT | pause for key or seconds |
| KEY | read the pressed key |
| BEEP | sound a tone |
| DISP | show an object on a line |
| PROMPT | halt with a prompt |
| INPUT | prompt for command-line input |
| ERRN | last error number |
| ERRM | last error message |
| DOERR | raise a user error |
| EVAL | evaluate an object |
| LAST | recall last arguments |

## String / Character

| Command | Description |
|---------|-------------|
| →STR | object to string |
| STR→ | evaluate a string |
| CHR | character from a code |
| NUM | code of first character |
| SIZE | number of characters |
| POS | find a substring |
| SUB | extract a substring |
| REPL | replace part of a string |
| DISP | display a string |

## Units

| Command | Description |
|---------|-------------|
| →UNIT | attach units to a number |
| UBASE | convert to SI base units |
| CONVERT | convert between compatible units |
| UVAL | value without units |
| UFACT | factor a unit from a quantity |

## Memory / Directory

| Command | Description |
|---------|-------------|
| STO | store an object |
| RCL | recall an object |
| PURGE | delete variables |
| CRDIR | create a subdirectory |
| UPDIR | move to the parent directory |
| HOME | go to the root directory |
| PATH | current directory path |
| VARS | names in the current directory |
| ORDER | reorder directory entries |
| MEM | free memory in bytes |
| BYTES | object size and checksum |
| NEWOB | copy an object out of a variable |
| ARCHIVE | back up HOME |
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
| DEG | degrees mode |
| RAD | radians mode |
| GRAD | grads mode |
| RECT | rectangular coordinates |
| CYLIN | cylindrical/polar coordinates |
| SPHERE | spherical coordinates |
| SF | set a flag |
| CF | clear a flag |
| FS? | test whether a flag is set |
| FC? | test whether a flag is clear |
| FS?C | test a flag then clear |
| FC?C | test a flag then clear |
| RCLF | recall flag states |
| STOF | store flag states |
| MENU | display a numbered menu |
| RCLMENU | number of the current menu |
| CST | display the custom menu |

## Time / Alarm

| Command | Description |
|---------|-------------|
| DATE | current system date |
| →DATE | set the date |
| TIME | current system time |
| →TIME | set the time |
| TICKS | system clock ticks |
| DATE+ | add days to a date |
| DDAYS | days between two dates |
| TSTR | date/time string |
| CLKADJ | adjust the clock |
| STOALARM | set an alarm |
| RCLALARM | recall an alarm |
| DELALARM | delete an alarm |
| FINDALARM | find the next due alarm |
| ACK | acknowledge the current alarm |
| ACKALL | acknowledge all past-due alarms |

## I/O

| Command | Description |
|---------|-------------|
| SEND | send objects to a device |
| RECV | receive an object |
| KGET | get an object by Kermit |
| SERVER | enter Kermit server mode |
| BAUD | set the baud rate |
| PARITY | set serial parity |
| CKSM | set the checksum scheme |
| TRANSIO | set I/O translation |
| OPENIO | open the serial port |
| CLOSEIO | close the serial port |
| BUFLEN | bytes waiting in the buffer |
| SRECV | receive characters |
| XMIT | transmit a string |
| STIME | set the I/O timeout |
| PRINT | print an object |
| PR1 | print a single object |
| PRST | print the stack |
| PRVAR | print variables |
| PRLCD | print the display |
| CR | print a carriage return |
| DELAY | set the print delay |
| OLDPRT | select the older printer format |

## Notes
- The HP 48SX shares the identical RPL core and faceplate with the HP 48G; descriptions are paraphrased, command names exact per the Owner's Manual per-menu tables. OCR-mangled glyphs (arrows, Greek Σ, comparison symbols) reconstructed to documented forms.
- Families the later HP 48G/GX **added** and that are therefore treated as absent here: input-form/GUI commands (INFORM, CHOOSE, MSGBOX, NOVAL); enhanced list processing (DOLIST, DOSUBS, NSUB, ENDSUB, STREAM, REVLIST, SORT, SEQ, ADD, ΣLIST, ΠLIST, ΔLIST, HEAD, TAIL); advanced linear algebra (RREF, RANK, LU, QR, LQ, SCHUR, SVD, SVL, EGV, EGVL, LSQ, COND, SNRM, SRAD, TRACE, column/row editing); the ODE Runge-Kutta suite (RKF, RRK, RKFSTEP, RRKSTEP, RKFERR, RSBERR); extra plot types (SLOPEFIELD, WIREFRAME, PCONTOUR, GRIDMAP, PARSURFACE, YSLICE); the built-in multiple-equation solver (MSOLVR, MROOT, MCALC, MINIT, MUSER, MITM); the curve-fit model commands (LINFIT, LOGFIT, EXPFIT, PWRFIT, BESTFIT, PREDX, PREDY); built-in TVM finance (TVM, TVMROOT, AMORT, TVMBEG, TVMEND); and TEACH, MINEHUNT, ANIMATE. On the 48SX several of these were available only via the plug-in Solve Equation Library / statistics cards.
- Any name I could not verify against the manual is omitted rather than guessed.
