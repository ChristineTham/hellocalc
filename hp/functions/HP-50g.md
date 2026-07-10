# HP-50g — Function / Command Set

- **Access:** Six softkey menus (F1–F6, NXT/PREV page); left-shift (white) and right-shift (orange) keyboard menus; ALPHA letters; CAT command catalog (right-shift CAT); MTH/MATHS menu; CMD command history; direct keyboard keys
- **Approx. count:** ~340 entries below
- **Source:** HP 50g graphing calculator user's guide — Appendix N Index (pages N-1–N-19), Appendix I command catalog, Appendices J (MATHS menu) and K (MAIN menu), plus chapters 3–25 — hp/manuals/HP-50g.pdf

## Stack Manipulation

| Command | Access | Description |
|---------|--------|-------------|
| DUP | PRG STACK | duplicate object on level 1 |
| DUP2 | PRG STACK | duplicate the two bottom stack objects |
| DUPN | PRG STACK | duplicate the n bottom objects |
| NDUPN | PRG STACK | duplicate object n times, push count |
| DROP | PRG STACK | discard object on level 1 |
| DROP2 | PRG STACK | discard two bottom objects |
| DROPN | PRG STACK | discard n bottom objects |
| SWAP | PRG STACK | exchange levels 1 and 2 |
| ROT | PRG STACK | rotate the three bottom objects |
| UNROT | PRG STACK | reverse rotate of three objects |
| OVER | PRG STACK | copy level 2 to level 1 |
| PICK | PRG STACK | copy the nth stack object up |
| PICK3 | PRG STACK | copy level 3 to level 1 |
| ROLL | PRG STACK | roll n objects upward |
| ROLLD | PRG STACK | roll n objects downward |
| DEPTH | PRG STACK | push number of stack levels |
| CLEAR | CLEAR key | clear the entire stack |
| →LIST | PRG STACK | gather n stack objects into a list |
| →STK | UNITS tools | put value onto the stack |
| DUP | PRG | copy top of stack |

## Real & Numeric Functions

| Command | Access | Description |
|---------|--------|-------------|
| ABS | MTH / keyboard | absolute value or magnitude |
| NEG | keyboard +/− | change sign |
| INV | 1/x key | reciprocal |
| SQ | x² key | square |
| √ | √x key | square root |
| XROOT | shift √ | x-th root of y |
| ^ | yˣ key | raise to a power |
| ALOG | shift LOG | ten to the power x |
| LOG | shift LOG | base-10 logarithm |
| LN | shift LN | natural logarithm |
| LNP1 | MTH HYP | ln(1+x) accurate near zero |
| EXP | eˣ key | exponential e to the x |
| EXPM | MTH HYP | e^x minus one, accurate near zero |
| SIN | SIN key | sine |
| COS | COS key | cosine |
| TAN | TAN key | tangent |
| ASIN | shift ASIN | arc sine |
| ACOS | shift ACOS | arc cosine |
| ATAN | shift ATAN | arc tangent |
| SINH | MTH HYP | hyperbolic sine |
| COSH | MTH HYP | hyperbolic cosine |
| TANH | MTH HYP | hyperbolic tangent |
| ASINH | MTH HYP | inverse hyperbolic sine |
| ACOSH | MTH HYP | inverse hyperbolic cosine |
| ATANH | MTH HYP | inverse hyperbolic tangent |
| FACT | shift ! | factorial or gamma |
| GAMMA | MTH | gamma function |
| PSI | MTH | polygamma / digamma function |
| % | MTH REAL | percent of a number |
| %CH | MTH REAL | percent change between values |
| %T | MTH REAL | percent total |
| MAX | MTH REAL | maximum of two values |
| MIN | MTH REAL | minimum of two values |
| MOD | MTH REAL | modulo remainder |
| FLOOR | MTH REAL | greatest integer not exceeding x |
| CEIL | MTH REAL | least integer not below x |
| IP | MTH REAL | integer part |
| FP | MTH REAL | fractional part |
| RND | MTH REAL | round to given decimals |
| TRNC | MTH REAL | truncate to given decimals |
| MANT | MTH REAL | mantissa of a number |
| XPON | MTH REAL | exponent of a number |
| SIGN | MTH REAL | sign of a number |
| MAXR | MTH constants | largest representable real |
| MINR | MTH constants | smallest positive real |
| D→R | MTH REAL | convert degrees to radians |
| R→D | MTH REAL | convert radians to degrees |
| DEG | modes | set degrees angle mode |
| RAD | modes | set radians angle mode |
| GRD | modes | set grads angle mode |
| DEFINE | shift DEF | define a user function |
| IFTE | logic/TESTS | inline if-then-else function |
| ZFACTOR | MTH special | gas compressibility factor |
| SIDENS | MTH special | silicon intrinsic density |
| TDELTA | MTH special | temperature-delta conversion |
| TINC | MTH special | temperature increment |

## Complex Numbers

| Command | Access | Description |
|---------|--------|-------------|
| RE | CMPLX | real part |
| IM | CMPLX | imaginary part |
| CONJ | CMPLX | complex conjugate |
| ARG | CMPLX | argument (phase angle) |
| ABS | CMPLX | complex modulus |
| SIGN | CMPLX | unit vector of complex number |
| NEG | CMPLX | negate complex number |
| C→R | CMPLX | split complex into two reals |
| R→C | CMPLX | build complex from two reals |
| RECT | coordinate | display in rectangular form |
| CYLIN | coordinate | display in polar/cylindrical form |
| DROITE | CMPLX | equation of line through two points |
| i | shift i | imaginary unit constant |

## Algebra / CAS Symbolic

| Command | Access | Description |
|---------|--------|-------------|
| COLLECT | ALG menu | factor/collect an expression |
| EXPAND | ALG menu | expand products and powers |
| FACTOR | ALG menu | factor an expression or number |
| SIMPLIFY | ALG / CAS | simplify an expression |
| SUBST | ALG menu | substitute value into expression |
| LNCOLLECT | ALG menu | collect logarithm terms |
| LIN | ALG menu | linearize exponentials |
| PARTFRAC | ALG menu | partial-fraction decomposition |
| SOLVE | S.SLV | solve equation symbolically |
| SOLVEVX | S.SLV | solve for the CAS variable |
| ISOL | S.SLV | isolate a variable |
| ZEROS | S.SLV | find zeros of expression |
| TEXPAND | ALG/TRIG | expand transcendental functions |
| EXPLN | EXP&LN | rewrite using exp and ln |
| EXP2POW | REWRITE | rewrite exp as a power |
| POWEREXPAND | REWRITE | expand a power expression |
| DISTRIB | REWRITE | apply distributivity stepwise |
| FDISTRIB | REWRITE | fully apply distributivity |
| XNUM | REWRITE | convert to approximate number |
| XQ | REWRITE | convert to exact rational |
| ASSUME | TESTS | set an assumption on a variable |
| UNASSUME | TESTS | remove a variable assumption |
| UNASSIGN | MAIN ALGB | clear a variable value |
| VX | CAS | current CAS default variable |
| →Q | REWRITE | convert decimal to fraction |
| SIGNTAB | CALC | sign table of an expression |
| TABVAL | CALC | table of function values |
| TABVAR | CALC | variation table of a function |

## Calculus

| Command | Access | Description |
|---------|--------|-------------|
| DERIV | CALC DIFF | derivative with respect to a variable |
| DERVX | CALC DIFF | derivative w.r.t. CAS variable |
| INT | CALC | indefinite integral |
| INTVX | CALC | integral w.r.t. CAS variable |
| RISCH | CALC | symbolic antiderivative |
| SIGMA | CALC | symbolic summation antidifference |
| SIGMAVX | CALC | summation w.r.t. CAS variable |
| lim | CALC LIMITS | limit of an expression |
| TAYLR | CALC LIMITS | Taylor series about a point |
| TAYLR0 | CALC LIMITS | Taylor series about zero |
| TAYL | CALC | Taylor polynomial expansion |
| DIV | CALC vector | divergence of a vector field |
| CURL | CALC vector | curl of a vector field |
| LAPL | CALC vector | Laplacian of a field |
| HESS | CALC vector | Hessian matrix and gradient |
| GRAD | CALC vector | gradient of a scalar field |
| POTENTIAL | CALC vector | potential of a gradient field |
| VPOTENTIAL | CALC vector | vector potential of a field |
| DOMAIN | CALC | domain of an expression |
| PREVAL | CALC | evaluate integral between limits |
| ∂ | shift ∂ | partial derivative operator |
| ∫ | shift ∫ | definite/indefinite integral operator |
| Σ | shift Σ | summation operator |

## Arithmetic & Polynomials

| Command | Access | Description |
|---------|--------|-------------|
| GCD | ARITH | greatest common divisor |
| LCM | ARITH | least common multiple |
| IDIV2 | ARITH INTEGER | integer division with remainder |
| IQUOT | ARITH INTEGER | integer quotient |
| IREMAINDER | ARITH INTEGER | integer remainder |
| IEGCD | ARITH INTEGER | integer extended GCD |
| IABCUV | ARITH INTEGER | solve integer au+bv=c |
| ISPRIME? | ARITH INTEGER | test whether integer is prime |
| NEXTPRIME | ARITH INTEGER | next prime above n |
| PREVPRIME | ARITH INTEGER | previous prime below n |
| EULER | ARITH INTEGER | Euler totient function |
| IBERNOULLI | ARITH INTEGER | Bernoulli number |
| ICHINREM | ARITH INTEGER | integer Chinese remainder |
| PA2B2 | ARITH INTEGER | prime as sum of two squares |
| FACTORS | ARITH | list of prime factors with powers |
| DIVIS | ARITH | list divisors of an expression |
| CHINREM | ARITH | Chinese remainder for polynomials |
| ABCUV | ARITH | solve polynomial au+bv=c |
| EGCD | ARITH | extended GCD of polynomials |
| QUOT | ARITH | polynomial quotient |
| REMAINDER | ARITH | polynomial remainder |
| DIV2 | ARITH | polynomial division quotient+remainder |
| HORNER | ARITH POLY | Horner division by (x−a) |
| HERMITE | ARITH POLY | Hermite polynomial |
| LEGENDRE | ARITH POLY | Legendre polynomial |
| LAGRANGE | ARITH POLY | Lagrange interpolating polynomial |
| TCHEBYCHEFF | ARITH POLY | Chebyshev polynomial |
| CYCLOTOMIC | ARITH POLY | cyclotomic polynomial |
| PCOEF | ARITH POLY | polynomial from its roots |
| PROOT | ARITH POLY | roots of a polynomial |
| PEVAL | ARITH POLY | evaluate polynomial at a value |
| PTAYL | ARITH POLY | Taylor form shifted polynomial |
| RESULTANT | ARITH POLY | resultant of two polynomials |
| STURM | ARITH POLY | Sturm sequence |
| STURMAB | ARITH POLY | count sign changes on interval |
| FCOEF | ARITH POLY | build fraction from roots/poles |
| FROOTS | ARITH POLY | roots and poles of a fraction |
| PROPFRAC | ARITH | proper-fraction form |
| SIMP2 | ARITH | simplify a rational by GCD |
| GAUSS | ARITH POLY | quadratic-form Gaussian reduction |
| ADDTMOD | ARITH MODULO | modular addition |
| SUBTMOD | ARITH MODULO | modular subtraction |
| MULTMOD | ARITH MODULO | modular multiplication |
| DIVMOD | ARITH MODULO | modular division |
| DIV2MOD | ARITH MODULO | modular polynomial division |
| POWMOD | ARITH MODULO | modular exponentiation |
| INVMOD | ARITH MODULO | modular inverse |
| GCDMOD | ARITH MODULO | modular polynomial GCD |
| EXPANDMOD | ARITH MODULO | expand expression modulo m |
| FACTORMOD | ARITH MODULO | factor polynomial modulo m |
| MODSTO | ARITH MODULO | set the modulus |
| EPSX0 | ARITH | zero out tiny coefficients |

## Lists

| Command | Access | Description |
|---------|--------|-------------|
| →LIST | PRG LIST | build a list from stack objects |
| OBJ→ | PRG LIST | decompose a list into elements |
| LIST→ | PRG LIST | explode list onto the stack |
| GET | PRG LIST | get an element by index |
| GETI | PRG LIST | get element and increment index |
| PUT | PRG LIST | replace an element by index |
| PUTI | PRG LIST | put element and increment index |
| SIZE | PRG LIST | number of elements |
| POS | PRG LIST | position of an item |
| HEAD | PRG LIST | first element of a list |
| TAIL | PRG LIST | list without its first element |
| SUB | PRG LIST | extract a sublist |
| REPL | PRG LIST | replace a portion of a list |
| REVLIST | MTH LIST | reverse a list |
| SORT | MTH LIST | sort list ascending |
| SEQ | PRG LIST | generate a sequence |
| MAP | MTH LIST | apply a function to each element |
| DOLIST | PRG LIST | apply function across lists |
| DOSUBS | PRG LIST | apply function to sublists |
| STREAM | PRG LIST | reduce a list with a function |
| NSUB | PRG LIST | current subset index in DOSUBS |
| ENDSUB | PRG LIST | number of subsets in DOSUBS |
| ΣLIST | MTH LIST | sum of list elements |
| ΠLIST | MTH LIST | product of list elements |
| ΔLIST | MTH LIST | successive differences of a list |
| ADD | MTH LIST | add lists element by element |

## Vectors & Matrices / Linear Algebra

| Command | Access | Description |
|---------|--------|-------------|
| →ARRY | PRG TYPE | build an array from stack numbers |
| ARRY→ | PRG TYPE | explode an array to elements |
| →V2 | MTH VECTOR | assemble a 2D vector |
| →V3 | MTH VECTOR | assemble a 3D vector |
| V→ | MTH VECTOR | decompose a vector |
| CROSS | MTH VECTOR | vector cross product |
| DOT | MTH VECTOR | vector dot product |
| ABS | MTH VECTOR | vector magnitude/norm |
| CON | MATRICES | constant matrix |
| IDN | MATRICES | identity matrix |
| RANM | MATRICES | random matrix |
| DIAG→ | MATRICES | diagonal matrix from vector |
| →DIAG | MATRICES | extract matrix diagonal |
| HILBERT | MATRICES | Hilbert matrix |
| VANDERMONDE | MATRICES | Vandermonde matrix |
| RDM | MATRICES | redimension an array |
| TRN | MATRICES | conjugate transpose |
| SIZE | MATRICES | dimensions of a matrix |
| GET | MATRICES | get a matrix element |
| PUT | MATRICES | set a matrix element |
| SUB | MATRICES | extract a submatrix |
| REPL | MATRICES | replace a submatrix |
| →COL | MATRICES COL | split matrix into column vectors |
| COL→ | MATRICES COL | build matrix from columns |
| COL+ | MATRICES COL | insert a column |
| COL− | MATRICES COL | delete a column |
| CSWP | MATRICES COL | swap two columns |
| →ROW | MATRICES ROW | split matrix into row vectors |
| ROW→ | MATRICES ROW | build matrix from rows |
| ROW+ | MATRICES ROW | insert a row |
| ROW− | MATRICES ROW | delete a row |
| RSWP | MATRICES ROW | swap two rows |
| RCI | MATRICES ROW | multiply row by a constant |
| RCIJ | MATRICES ROW | add multiple of a row to another |
| DET | MATRICES OPER | determinant |
| TRACE | MATRICES OPER | trace of a matrix |
| TRAN | MATRICES OPER | transpose |
| RANK | MATRICES OPER | rank of a matrix |
| COND | MATRICES NORM | condition number |
| HADAMARD | MATRICES OPER | element-by-element product |
| LSQ | MATRICES | least-squares solution |
| LINSOLVE | MATRICES | solve linear system symbolically |
| REF | MATRICES | row-echelon form |
| RREF | MATRICES | reduced row-echelon form |
| rref | MATRICES | reduced echelon (CAS) |
| SYST2MAT | MATRICES | system to augmented matrix |
| AXL | MATRICES | array to list conversion |
| AXM | MATRICES | array to modular array |
| AXQ | MATRICES | array to rational array |
| LCXM | MATRICES | build matrix from a function |
| CNRM | MATRICES NORM | column norm of a matrix |
| RNRM | MATRICES NORM | row norm of a matrix |
| SNRM | MATRICES NORM | spectral norm |
| SRAD | MATRICES NORM | spectral radius |
| LU | MATRICES FACT | LU decomposition |
| LQ | MATRICES FACT | LQ decomposition |
| QR | MATRICES FACT | QR decomposition |
| SVD | MATRICES FACT | singular value decomposition |
| SVL | MATRICES FACT | singular values |
| SCHUR | MATRICES FACT | Schur decomposition |
| JORDAN | MATRICES | Jordan-cycle decomposition |
| PCAR | MATRICES | characteristic polynomial |
| EGV | MATRICES | eigenvalues and eigenvectors |
| EGVL | MATRICES | eigenvalues only |
| MAD | MATRICES | minimal-polynomial / adjoint data |
| RSD | MATRICES | residual of linear system |
| DIAGMAP | MATRICES | apply function to diagonalizable matrix |
| QUADF | MATRICES QUAD | quadratic form of a matrix |
| QXA | MATRICES QUAD | quadratic form to matrix |
| AXQ | MATRICES QUAD | matrix to quadratic form |
| SYLVESTER | MATRICES | Sylvester matrix reduction |
| GAUSS | MATRICES | Gaussian quadratic-form reduction |
| IMAGE | MATRICES LIN | image (column space) basis |
| KER | MATRICES LIN | kernel (null space) basis |
| ISOM | MATRICES LIN | classify a linear isometry |
| MKISOM | MATRICES LIN | build isometry matrix |

## Probability & Statistics

| Command | Access | Description |
|---------|--------|-------------|
| COMB | MTH PROB | combinations count |
| PERM | MTH PROB | permutations count |
| ! | MTH PROB | factorial |
| RAND | MTH PROB | random number 0–1 |
| RDZ | MTH PROB | seed the random generator |
| NDIST | MTH PROB | normal probability density |
| UTPN | MTH PROB | upper-tail normal probability |
| UTPT | MTH PROB | upper-tail Student-t probability |
| UTPC | MTH PROB | upper-tail chi-square probability |
| UTPF | MTH PROB | upper-tail F probability |
| ΣDAT | STAT | statistical data matrix variable |
| ΣPAR | STAT | statistics parameters variable |
| BINS | STAT | frequency bins of data |
| TOTAL | STAT | column sums of data |
| MEAN | STAT | mean of columns |
| SDEV | STAT | standard deviation of columns |
| VAR | STAT | variance of columns |
| MAXΣ | STAT | column maxima |
| MINΣ | STAT | column minima |
| CORR | STAT | correlation coefficient |
| COV | STAT | covariance |
| PCOV | STAT | population covariance |
| PSDEV | STAT | population standard deviation |
| PVAR | STAT | population variance |
| XCOL | STAT | select independent-data column |
| YCOL | STAT | select dependent-data column |
| LR | STAT | linear regression fit |
| PREDX | STAT | predict x from regression |
| PREDY | STAT | predict y from regression |
| NΣ | STAT | number of data rows |
| Σ+ | STAT | add a data row |
| Σ− | STAT | remove last data row |

## Base / Binary

| Command | Access | Description |
|---------|--------|-------------|
| DEC | BASE | set decimal base |
| HEX | BASE | set hexadecimal base |
| OCT | BASE | set octal base |
| BIN | BASE | set binary base |
| R→B | BASE | real to binary integer |
| B→R | BASE | binary integer to real |
| STWS | BASE | set word size |
| RCWS | BASE | recall word size |
| AND | BASE LOGIC | bitwise AND |
| OR | BASE LOGIC | bitwise OR |
| XOR | BASE LOGIC | bitwise exclusive OR |
| NOT | BASE LOGIC | bitwise complement |
| SL | BASE BIT | shift left one bit |
| SR | BASE BIT | shift right one bit |
| SLB | BASE BYTE | shift left one byte |
| SRB | BASE BYTE | shift right one byte |
| ASR | BASE BIT | arithmetic shift right |
| RL | BASE BIT | rotate left one bit |
| RR | BASE BIT | rotate right one bit |
| RLB | BASE BYTE | rotate left one byte |
| RRB | BASE BYTE | rotate right one byte |
| R→I | BASE | real to integer conversion |
| I→R | BASE | integer to real conversion |
| →HEX | BASE | display as hexadecimal |
| →DEC | BASE | display as decimal |

## Units & Conversions

| Command | Access | Description |
|---------|--------|-------------|
| CONVERT | UNITS | convert between compatible units |
| UBASE | UNITS | reduce to base SI units |
| UVAL | UNITS | numeric value without units |
| UFACT | UNITS | factor a unit from a quantity |
| →UNIT | UNITS | attach units to a number |
| UNIT | UNITS | create a unit object |
| ENGL | UNITS | select English unit system |
| SI | UNITS | select SI unit system |
| CONLIB | UNITS/constants | open the constants library |
| CONST | UNITS | value of a physical constant |
| →NUM | shift ENTER | evaluate to a number |
| D→R | CONVERT | degrees to radians |
| R→D | CONVERT | radians to degrees |

## Solvers

| Command | Access | Description |
|---------|--------|-------------|
| ROOT | NUM.SLV | numeric root of an equation |
| SOLVE | S.SLV | symbolic equation solver |
| SOLVEVX | S.SLV | solve for CAS variable |
| ZEROS | S.SLV | all zeros of expression |
| ISOL | S.SLV | isolate a variable |
| MSLV | NUM.SLV | solve system of equations numerically |
| MSOLVR | NUM.SLV | multiple-equation solver |
| MES | NUM.SLV | multiple-equation solver setup |
| STEQ | SOLVE | store the current equation EQ |
| LDEC | S.SLV DIFF | solve linear differential equation |
| DESOLVE | S.SLV DIFF | solve a differential equation |
| ODETYPE | S.SLV DIFF | classify an ODE |
| LAP | CALC | Laplace transform |
| ILAP | CALC | inverse Laplace transform |
| LDEC | CALC | linear ODE by transforms |
| FOURIER | CALC | Fourier series coefficient |
| RKF | SOLVE DIFF | Runge-Kutta-Fehlberg integration |
| RRK | SOLVE DIFF | Rosenbrock/RK ODE solver |
| RKFSTEP | SOLVE DIFF | one adaptive RKF step |
| RRKSTEP | SOLVE DIFF | one adaptive RK step |
| RKFERR | SOLVE DIFF | RKF single-step error |
| RSBERR | SOLVE DIFF | Rosenbrock step error |
| AMORT | FINANCE | amortization of a loan |
| TVM | FINANCE | time-value-of-money solver |
| TVMROOT | FINANCE | solve for a TVM variable |

## Plotting & Graphics

| Command | Access | Description |
|---------|--------|-------------|
| DRAW | PLOT | draw the current plot |
| DRAW3DMATRIX | PLOT | plot a 3D matrix surface |
| ERASE | PLOT | clear the graphics display |
| DRAX | PLOT | draw the axes |
| AXES | PLOT | set the axes intersection |
| LABEL | PLOT | label the plot axes |
| PICT | PLOT | the graphics screen object |
| PDIM | PLOT | set PICT dimensions |
| PMIN / PMAX | PLOT | set plot window corners |
| CENTR | PLOT | center the plot window |
| SCALE | PLOT | set horizontal/vertical scale |
| SCALEH | PLOT | rescale plot height |
| SCALEW | PLOT | rescale plot width |
| AUTO | PLOT | autoscale the plot |
| XRNG | PLOT | set x-axis range |
| YRNG | PLOT | set y-axis range |
| INDEP | PLOT | set independent variable |
| DEPND | PLOT | set dependent variable |
| RES | PLOT | set plot resolution |
| ATICK | PLOT | set axis tick spacing |
| PTYPE | PLOT | select the plot type |
| PPAR | PLOT | plot parameters variable |
| VPAR | PLOT | 3D view parameters variable |
| EYEPT | PLOT | set 3D viewpoint |
| NUMX / NUMY | PLOT | grid steps for 3D plots |
| XVOL / YVOL / ZVOL | PLOT | 3D view volume |
| PIXON | PRG PICT | turn a pixel on |
| PIXOFF | PRG PICT | turn a pixel off |
| PIX? | PRG PICT | test if a pixel is on |
| LINE | PRG PICT | draw a line segment |
| TLINE | PRG PICT | toggle-draw a line |
| BOX | PRG PICT | draw a rectangle |
| ARC | PRG PICT | draw an arc |
| →GROB | PRG GROB | convert object to graphic |
| GROB | PRG GROB | create a graphic object |
| →LCD | PRG GROB | display a grob on screen |
| LCD→ | PRG GROB | capture the display as a grob |
| BLANK | PRG GROB | create a blank grob |
| GOR | PRG GROB | overlay grobs (OR) |
| GXOR | PRG GROB | overlay grobs (XOR) |
| SUB | PRG GROB | extract part of a grob |
| REPL | PRG GROB | replace part of a grob |
| GROBADD | PRG GROB | stack two grobs vertically |
| ANIMATE | PRG GROB | animate a sequence of grobs |
| SIZE | PRG GROB | dimensions of a grob |
| PVIEW | PRG PICT | display PICT at a position |
| PX→C | PRG PICT | pixel to user coordinates |
| C→PX | PRG PICT | user coordinates to pixel |
| ZOOM | PLOT | zoom the plot view |
| ZFACT | PLOT ZOOM | set zoom factors |

## Programming & Flow Control

| Command | Access | Description |
|---------|--------|-------------|
| « » | shift + | program delimiters |
| → | PRG BRANCH | bind local variables |
| IF...THEN...END | PRG BRANCH | conditional execution |
| IF...THEN...ELSE...END | PRG BRANCH | two-way conditional |
| CASE...END | PRG BRANCH | multi-branch selection |
| THEN | PRG BRANCH | begin conditional body |
| ELSE | PRG BRANCH | alternative branch |
| END | PRG BRANCH | close a control structure |
| START...NEXT | PRG BRANCH | counted loop |
| START...STEP | PRG BRANCH | counted loop with step |
| FOR...NEXT | PRG BRANCH | indexed loop |
| FOR...STEP | PRG BRANCH | indexed loop with step |
| DO...UNTIL...END | PRG BRANCH | post-tested loop |
| WHILE...REPEAT...END | PRG BRANCH | pre-tested loop |
| IFERR...THEN...END | PRG BRANCH | trap an error |
| IFTE | PRG | inline conditional function |
| EVAL | EVAL key | evaluate an object |
| →NUM | shift ENTER | numeric evaluation |
| SYSEVAL | catalog | evaluate a system object by address |
| RPL> | catalog | compile System RPL code |
| DOERR | PRG ERROR | cause a user error |
| ERRN | PRG ERROR | last error number |
| ERRM | PRG ERROR | last error message |
| ERR0 | PRG ERROR | clear last error |
| LASTARG | PRG | recall last command arguments |
| KILL | PRG RUN | abort running programs |
| HALT | PRG RUN | suspend program execution |
| SST | PRG RUN | single-step a program |
| DBUG | PRG RUN | start program debugger |
| CONT | ON key | continue a halted program |
| WAIT | PRG IN | pause for seconds or a key |
| PROMPT | PRG IN | halt and prompt for input |
| INPUT | PRG IN | prompt for input string |
| INFORM | PRG IN | display an input form |
| CHOOSE | PRG IN | display a choose box |
| MSGBOX | PRG IN | display a message box |
| KEY | PRG IN | test for a key press |
| BEEP | PRG OUT | sound a tone |
| DISP | PRG OUT | display object on a line |
| FREEZE | PRG OUT | freeze part of the display |
| CLLCD | PRG OUT | clear the display |
| →TAG | PRG TYPE | attach a tag to an object |
| DTAG | PRG TYPE | remove a tag |
| NEWOB | PRG | create a fresh copy of an object |

## Tests & Logical

| Command | Access | Description |
|---------|--------|-------------|
| == | PRG TEST | equality test |
| ≠ | PRG TEST | inequality test |
| < | PRG TEST | less than |
| > | PRG TEST | greater than |
| ≤ | PRG TEST | less than or equal |
| ≥ | PRG TEST | greater than or equal |
| AND | PRG TEST | logical/bitwise AND |
| OR | PRG TEST | logical/bitwise OR |
| XOR | PRG TEST | logical exclusive OR |
| NOT | PRG TEST | logical negation |
| SAME | PRG TEST | test objects identical |
| TYPE | PRG TEST | object type number |
| VTYPE | PRG TEST | variable's type number |
| ASSUME | TESTS | assume a variable property |
| UNASSUME | TESTS | drop an assumption |

## Flags & Modes

| Command | Access | Description |
|---------|--------|-------------|
| SF | PRG MODES FLAG | set a flag |
| CF | PRG MODES FLAG | clear a flag |
| FS? | PRG MODES FLAG | test if flag is set |
| FC? | PRG MODES FLAG | test if flag is clear |
| FS?C | PRG MODES FLAG | test set then clear flag |
| FC?C | PRG MODES FLAG | test clear then clear flag |
| STOF | PRG MODES FLAG | store all flag states |
| RCLF | PRG MODES FLAG | recall all flag states |
| RESET | PRG MODES | reset flags to defaults |
| STD | modes | standard number display |
| FIX | modes | fixed-decimal display |
| SCI | modes | scientific display |
| ENG | modes | engineering display |
| CASCFG | MAIN | configure the CAS |
| CASCMD | TOOL | run a CAS command by name |

## Strings & Characters

| Command | Access | Description |
|---------|--------|-------------|
| →STR | PRG TYPE | convert object to a string |
| STR→ | PRG TYPE | evaluate a string as an object |
| CHR | PRG CHARS | character from its code |
| NUM | PRG CHARS | code of first character |
| SIZE | PRG CHARS | string length |
| POS | PRG CHARS | find substring position |
| SUB | PRG CHARS | extract a substring |
| REPL | PRG CHARS | replace part of a string |
| SREPL | PRG CHARS | search and replace in a string |
| HEAD | PRG CHARS | first character of a string |
| TAIL | PRG CHARS | string without first character |

## Memory & Directory

| Command | Access | Description |
|---------|--------|-------------|
| STO | STO▸ key | store object in a variable |
| RCL | shift RCL | recall a variable's contents |
| STO+ | memory arithmetic | add to a stored variable |
| STO− | memory arithmetic | subtract from a variable |
| STO* | memory arithmetic | multiply a stored variable |
| STO/ | memory arithmetic | divide a stored variable |
| SNEG | memory arithmetic | negate a stored variable |
| SINV | memory arithmetic | invert a stored variable |
| PURGE | TOOL | delete a variable |
| CLVAR | memory | clear all variables |
| VARS | catalog | list variables in directory |
| TVARS | catalog | list variables of a type |
| ORDER | FILES | reorder variables in a directory |
| RENAME | FILES | rename a variable |
| CRDIR | FILES | create a subdirectory |
| PGDIR | FILES | purge a directory |
| UPDIR | shift UPDIR | move to parent directory |
| HOME | catalog | go to the HOME directory |
| PATH | catalog | current directory path |
| MEM | catalog | free memory available |
| BYTES | catalog | checksum and size of object |
| FREE | catalog | free memory on a port |
| DEFINE | shift DEF | store a function definition |
| CST | shift CUSTOM | custom menu variable |
| MENU | PRG MENU | display a menu by number |
| TMENU | PRG MENU | temporary custom menu |
| RCLMENU | PRG MENU | recall current menu number |
| ASN | PRG KEYS | assign a key definition |
| STOKEYS | PRG KEYS | store user key assignments |
| RCLKEYS | PRG KEYS | recall user key assignments |
| DELKEYS | PRG KEYS | delete user key assignments |
| ARCHIVE | catalog | back up memory to a port |
| RESTORE | catalog | restore memory from backup |

## Time, Date & Alarms

| Command | Access | Description |
|---------|--------|-------------|
| DATE | TIME | current system date |
| →DATE | TIME | set the system date |
| TIME | TIME | current system time |
| →TIME | TIME | set the system time |
| DATE+ | TIME | add days to a date |
| DDAYS | TIME | number of days between dates |
| TICKS | TIME | system clock in ticks |
| CLKADJ | TIME | adjust the system clock |
| →HMS | TIME | convert decimal to H.MS format |
| HMS→ | TIME | convert H.MS to decimal |
| HMS+ | TIME | add times in H.MS |
| HMS− | TIME | subtract times in H.MS |
| TSTR | TIME | date/time as a string |
| STOALARM | TIME ALRM | set an alarm |
| RCLALARM | TIME ALRM | recall an alarm |
| DELALARM | TIME ALRM | delete an alarm |
| FINDALARM | TIME ALRM | find an alarm by time |
| ACK | TIME ALRM | acknowledge an alarm |
| ACKALL | TIME ALRM | acknowledge all alarms |

## Input/Output

| Command | Access | Description |
|---------|--------|-------------|
| SEND | catalog I/O | send variables to another device |
| RECV | catalog I/O | receive a variable |
| XSEND | catalog I/O | send via serial/IR |
| KGET | catalog I/O | Kermit get a file |
| CKSM | catalog I/O | set transfer checksum |
| BAUD | catalog I/O | set transfer baud rate |
| OPENIO | catalog I/O | open the I/O port |
| CLOSEIO | catalog I/O | close the I/O port |
| BUFLEN | catalog I/O | characters in input buffer |
| SRECV | catalog I/O | receive characters serially |
| STIME | catalog I/O | set transfer timeout |
| FINISH | catalog I/O | end Kermit server mode |
| PRVAR | catalog I/O | print a variable |
| PRSTC | catalog I/O | print the stack |
| PRLCD | catalog I/O | print the display |
| PRST | catalog I/O | print stack contents |
| DELAY | catalog I/O | set print line delay |
| CR | catalog I/O | send carriage return to printer |

## Notes
- Names are exact (verified against Appendix N index and the MATHS/MAIN menu screenshots in Appendices J–K); descriptions are original one-line summaries.
- CAS commands (FACTOR, INTVX, DESOLVE, RISCH, etc.) behave symbolically and depend on CAS flags (Exact/Approx, Real/Complex, Rad/Deg). Many are duplicated across keyboard menus, the MTH menu, and the alphabetical catalog (right-shift CAT / left-shift MATHS).
- The MTH menu groups VECTOR, MATRIX, LIST, PROBABILITY, HYPERBOLIC, REAL, BASE and CONSTANTS sub-menus; CALC groups DERIV&INTEG, LIMITS&SERIES, DIFF EQNS and GRAPH.
- This catalogues the principal documented menus; the full 50g firmware exposes 500+ commands (the complete alphabetical list is the command catalog, ‚N). Uncertain/illegible index tokens were omitted rather than guessed.
- A separate Equation Library (Appendix M) also supplies 315 built-in engineering equations across 15 subjects, distinct from the command set above.
