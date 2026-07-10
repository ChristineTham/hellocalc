# HP-49G — Function / Command Set

- **Access:** menu softkeys; F1–F6 function-key menus; command catalog (CAT); command name entry (ALPHA); algebraic or RPN entry
- **Approx. count:** 330 (shared RPL core plus the CAS additions catalogued below)
- **Source:** HP 49G Advanced User's Guide (Version 1) — chapters on Stack, Matrices/linear algebra, CAS, calculus, arithmetic — hp/manuals/HP-49G.pdf (scanned, no OCR layer). Shared RPL core and CAS command names cross-referenced against the HP 50g User's Guide command index — hp/manuals/HP-50g.pdf.

> The HP 49G runs the same Saturn/RPL operating system as the HP 48G and is the direct predecessor of the HP 50g; it shares essentially the **entire 48G/50g RPL command core**. The categories **Stack, Real, Trig/Hyperbolic/Exponential, Complex, Probability/Statistics, List, Binary/Base, Program/Branch/Test, String, Units, Memory/Directory, Modes/Flags, Time/Alarm, I/O** are identical in name and purpose to the HP-48G catalogue (see HP-48G.md). The tables below give the core plus the commands **new on the 49G**: the built-in **CAS** (Computer Algebra System) for symbolic algebra, number theory, and calculus, and the expanded linear-algebra menu.

## Stack (shared core)

| Command | Description |
|---------|-------------|
| DUP | duplicate level-1 object |
| DUP2 | duplicate two lowest objects |
| DUPN | duplicate lowest n objects |
| DROP | discard level-1 object |
| DROP2 | discard two lowest objects |
| DROPN | discard lowest n objects |
| SWAP | exchange levels 1 and 2 |
| OVER | copy level 2 to level 1 |
| ROT | rotate lowest three objects |
| ROLL | roll n levels upward |
| ROLLD | roll n levels downward |
| PICK | copy nth object to level 1 |
| UNROT | rotate lowest three the other way |
| NIP | drop the level-2 object |
| PICK3 | copy level 3 to level 1 |
| DEPTH | count stack objects |
| CLEAR | empty the stack |
| NEWOB | make a separate copy of an object |

## Real / Arithmetic (shared core)

| Command | Description |
|---------|-------------|
| + − × ÷ ^ | basic arithmetic and power |
| NEG | negate |
| INV | reciprocal |
| ABS | absolute value/magnitude |
| SIGN | sign of a number |
| IP | integer part |
| FP | fractional part |
| FLOOR | round down to integer |
| CEIL | round up to integer |
| RND | round to places |
| TRNC | truncate to places |
| MANT | mantissa |
| XPON | exponent |
| MAX | larger of two |
| MIN | smaller of two |
| MOD | remainder |
| % | percent |
| %CH | percent change |
| %T | percent of total |
| →NUM | evaluate numerically |
| →Q | approximate as a fraction |

## Trig / Hyperbolic / Exponential (shared core)

| Command | Description |
|---------|-------------|
| SIN COS TAN | trigonometric functions |
| ASIN ACOS ATAN | inverse trigonometric functions |
| SINH COSH TANH | hyperbolic functions |
| ASINH ACOSH ATANH | inverse hyperbolic functions |
| EXP | e to a power |
| LN | natural logarithm |
| LOG | base-10 logarithm |
| ALOG | base-10 antilogarithm |
| EXPM | exp(x) − 1 near zero |
| LNP1 | ln(1+x) near zero |
| SQ | square |
| √ | square root |
| XROOT | nth root |
| D→R | degrees to radians |
| R→D | radians to degrees |
| →HMS / HMS→ | decimal↔H.MS time format |

## Complex (shared core)

| Command | Description |
|---------|-------------|
| R→C | build a complex number |
| C→R | split a complex number |
| ARG | polar angle |
| CONJ | complex conjugate |
| RE | real part |
| IM | imaginary part |
| ABS | modulus |
| SIGN | unit complex direction |

## Algebra / Symbolic (CAS — new on 49G)

| Command | Description |
|---------|-------------|
| EXPAND | expand products and powers |
| FACTOR | factor an expression or integer |
| FACTORS | factor list with multiplicities |
| SIMPLIFY | simplify an expression |
| COLLECT | collect and factor terms |
| SUBST | substitute into an expression |
| EXLR | extract the two sides of an equation |
| PARTFRAC | partial-fraction decomposition |
| PROPFRAC | proper-fraction (quotient + remainder) form |
| LIN | linearize exponentials |
| LNCOLLECT | collect logarithm terms |
| TEXPAND | expand transcendental functions |
| TCOLLECT | collect trigonometric terms |
| TRIG | simplify with trig identities |
| TRIGSIN | rewrite using sines |
| TRIGCOS | rewrite using cosines |
| TRIGTAN | rewrite using tangents |
| TAN2SC | tangent to sine/cosine ratio |
| TAN2SC2 | tangent to sine/cosine, double angle |
| SINCOS | rewrite in sine and cosine |
| HALFTAN | rewrite with half-angle tangents |
| ATAN2S | arctangent to arcsine form |
| EXPLN | rewrite using exp and ln |
| EXP2POW | rewrite exponential as a power |
| DISTRIB | distribute one multiplication step |
| FDISTRIB | fully distribute a product |
| XNUM | convert to approximate (numeric) form |
| XQ | convert to exact (rational) form |
| HORNER | Horner factored form of a polynomial |
| PTAYL | Taylor polynomial about a point |
| PCOEF | polynomial from a root list |
| PEVAL | evaluate a polynomial |
| PROOT | numeric polynomial roots |
| FCOEF | build a rational from roots/poles |
| FROOTS | roots and poles of a rational |
| ZEROS | zeros of an expression |
| SOLVE | symbolic/numeric equation solve |
| SOLVEVX | solve for the default CAS variable |
| ISOL | isolate a variable |
| QUAD | reduce to a quadratic form |
| LNAME | list symbolic variable names |
| LVAR | list variables and subexpressions |
| RCLVX | recall the default CAS variable |
| STOVX | store the default CAS variable name |
| ASSUME | set an assumption on a variable |
| UNASSUME | remove an assumption |
| QUOTE | return an expression unevaluated |
| APPLY | apply a function to arguments |
| \|  (WHERE) | substitute values into an expression |

## Arithmetic / Number Theory (CAS — new on 49G)

| Command | Description |
|---------|-------------|
| GCD | greatest common divisor |
| LCM | least common multiple |
| IQUOT | integer quotient |
| IREMAINDER | integer remainder |
| IDIV2 | integer quotient and remainder |
| IABCUV | Bézout integers for a·u+b·v=c |
| IEGCD | extended integer GCD |
| EGCD | extended polynomial GCD |
| ABCUV | Bézout polynomials |
| CHINREM | Chinese remainder combination |
| EULER | Euler totient of an integer |
| NEXTPRIME | next prime above n |
| PREVPRIME | previous prime below n |
| ISPRIME? | test primality |
| FACTOR | prime/polynomial factorization |
| DIVIS | list of divisors |
| SIMP2 | reduce two arguments by their GCD |
| PA2B2 | prime as a sum of two squares |
| QUOT | polynomial quotient |
| REMAINDER | polynomial remainder |
| HERMITE | Hermite polynomial |
| LEGENDRE | Legendre polynomial |
| TCHEBYCHEFF | Chebyshev polynomial |
| LAGRANGE | Lagrange interpolating polynomial |
| EPSX0 | zero out coefficients below EPS |

## Modular Arithmetic (CAS MODULO menu — new on 49G)

| Command | Description |
|---------|-------------|
| ADDTMOD | add modulo the current modulus |
| SUBTMOD | subtract modulo the modulus |
| MULTMOD | multiply modulo the modulus |
| DIV2MOD | modular polynomial division |
| DIVMOD | modular divide |
| POWMOD | modular exponentiation |
| INVMOD | modular inverse |
| EXPANDMOD | expand modulo the modulus |
| FACTORMOD | factor modulo the modulus |
| GCDMOD | GCD modulo the modulus |
| MODSTO | set the current modulus |

## Calculus (CAS — new on 49G)

| Command | Description |
|---------|-------------|
| DERIV | derivative with respect to a variable |
| DERVX | derivative w.r.t. the default variable |
| INT | indefinite integral in a variable |
| INTVX | integral w.r.t. the default variable |
| RISCH | Risch symbolic integration |
| IBP | integration by parts step |
| PREVAL | evaluate an antiderivative between limits |
| lim | limit of an expression |
| TAYLR | Taylor series in a variable |
| TAYLR0 | Taylor series about zero |
| SERIES | Taylor/asymptotic series with order term |
| SUMMATION (Σ) | symbolic summation |
| DIV | divergence of a vector field |
| CURL | curl of a vector field |
| LAPL | Laplacian of an expression |
| HESS | Hessian matrix and gradient |
| DOMAIN | domain of a function |
| TABVAL | table of function values |
| TABVAR | variation table of a function |
| SIGNTAB | sign table of an expression |

## Differential Equations & Transforms (CAS — new on 49G)

| Command | Description |
|---------|-------------|
| DESOLVE | solve a differential equation |
| LDEC | solve a linear constant-coefficient ODE |
| LAP | Laplace transform |
| ILAP | inverse Laplace transform |
| FOURIER | Fourier-series coefficient |
| RKF | Runge-Kutta-Fehlberg ODE solve |
| RRK | Rosenbrock ODE solve |
| RKFSTEP | one adaptive RKF step |
| RRKSTEP | one adaptive Rosenbrock step |
| RKFERR | RKF error estimate |
| RSBERR | Rosenbrock error estimate |

## Array / Matrix / Linear Algebra

Shared with the 48G (→ARRY, ARRY→, CON, IDN, RANM, RDM, TRN, DET, INV, ABS, RNRM, CNRM, DOT, CROSS, RSD, RREF, LU, QR, LQ, SCHUR, SVD, SVL, EGV, EGVL, LSQ, COND, RANK, TRACE, row/column editing) plus these 49G/50g additions:

| Command | Description |
|---------|-------------|
| AXL | convert between array and list |
| AXM | array to modular/symbolic matrix |
| AXQ | symmetric matrix to quadratic form |
| QXA | quadratic form to matrix |
| LCXM | build a matrix from an index function |
| PCAR | characteristic polynomial |
| JORDAN | eigenvalues, eigenvectors, Jordan form |
| MAD | adjugate, determinant and inverse |
| VANDERMONDE | Vandermonde matrix from a list |
| HILBERT | Hilbert matrix of a given order |
| GAUSS | Gaussian reduction of a quadratic form |
| SYLVESTER | Sylvester (diagonalizing) decomposition |
| IMAGE | basis for a matrix's image |
| KER | basis for a matrix's kernel |
| ISOM | classify a linear isometry |
| MKISOM | build an isometry matrix |
| SYST2MAT | linear system to its matrix |
| DIAG→ | build a matrix from a diagonal |
| →DIAG | extract a matrix diagonal |
| GRAMSCHMIDT | orthonormalize a set of vectors |

## Probability / Statistics (shared core)

| Command | Description |
|---------|-------------|
| FACT | factorial/gamma |
| COMB | combinations |
| PERM | permutations |
| RAND | random number |
| RDZ | seed the generator |
| Σ+ / Σ− | add/remove a data point |
| MEAN SDEV VAR | central-tendency and spread |
| CORR COV | correlation and covariance |
| LR | linear regression |
| PREDX / PREDY | regression prediction |
| UTPC UTPF UTPN UTPT | upper-tail distribution probabilities |
| NORMALD? | (see CAS distribution functions) |

## List (shared core)

| Command | Description |
|---------|-------------|
| →LIST / LIST→ | assemble/explode a list |
| OBJ→ | decompose an object |
| HEAD / TAIL | first element / remainder |
| GET / PUT | read/write an element |
| GETI / PUTI | indexed read/write |
| SORT / REVLIST | sort / reverse |
| SEQ | build a list from an expression |
| DOLIST / DOSUBS | map over lists / sliding subsets |
| STREAM | reduce a list |
| ΣLIST / ΠLIST / ΔLIST | sum / product / differences |
| MAP | apply a function to each element |
| SUB / REPL | sublist / replace |

## Binary / Base (shared core)

| Command | Description |
|---------|-------------|
| DEC HEX OCT BIN | set the integer base |
| STWS / RCWS | set/recall word size |
| R→B / B→R | real↔binary integer |
| AND OR XOR NOT | bitwise logic |
| SL SR SLB SRB ASR | bit/byte shifts |
| RL RR RLB RRB | bit/byte rotations |

## Program / Branch / Test (shared core)

| Command | Description |
|---------|-------------|
| IF/THEN/ELSE/END | conditional |
| CASE/THEN/END | multi-branch |
| FOR/NEXT/STEP | counted loop |
| START/NEXT/STEP | counted loop, no counter |
| DO/UNTIL/END | loop until |
| WHILE/REPEAT/END | loop while |
| IFERR/THEN/END | error trap |
| IFT / IFTE | inline conditionals |
| == ≠ < > ≤ ≥ | comparisons |
| SAME | structural equality |
| AND OR XOR NOT | logical operators |
| TYPE / VTYPE | object/variable type |
| HALT / CONT / KILL | pause/resume/abort |
| WAIT / KEY | wait for or read a key |
| DISP / PROMPT / INPUT | display and input |
| INFORM / CHOOSE / MSGBOX | input form / choose box / message box |
| ERRN / ERRM / DOERR | error handling |
| EVAL | evaluate an object |

## String / Character (shared core)

| Command | Description |
|---------|-------------|
| →STR / STR→ | object↔string |
| CHR / NUM | character↔code |
| SIZE / POS | length / find substring |
| SUB / REPL | substring / replace |

## Units (shared core)

| Command | Description |
|---------|-------------|
| →UNIT | attach units |
| UBASE | to SI base units |
| CONVERT | convert compatible units |
| UVAL | strip units |
| UFACT | factor out a unit |

## Memory / Directory (shared core)

| Command | Description |
|---------|-------------|
| STO / RCL | store / recall |
| PURGE | delete variables |
| CRDIR / PGDIR | create/delete a directory |
| UPDIR / HOME / PATH | navigate directories |
| VARS / TVARS | list variables |
| ORDER | reorder entries |
| MEM / BYTES | memory / object size |
| ARCHIVE / RESTORE | back up / restore HOME |
| DEFINE | define a variable or function |
| STO+ STO− STO× STO÷ | arithmetic on a stored variable |
| INCR / DECR | increment / decrement |

## Modes / Flags (shared core)

| Command | Description |
|---------|-------------|
| STD FIX SCI ENG | display formats |
| DEG RAD GRAD | angle modes |
| RECT CYLIN SPHERE | coordinate modes |
| SF / CF | set/clear a flag |
| FS? FC? FS?C FC?C | test a flag |
| RCLF / STOF | recall/store flag states |
| MENU / TMENU / RCLMENU | menu control |

## Time / Alarm and I/O (shared core)

| Command | Description |
|---------|-------------|
| DATE / TIME / TICKS | date, time, clock ticks |
| DATE+ / DDAYS | date arithmetic |
| STOALARM / RCLALARM / DELALARM / FINDALARM | alarm management |
| ACK / ACKALL | acknowledge alarms |
| SEND / RECV / KGET / SERVER | data transfer |
| BAUD / PARITY / CKSM / TRANSIO | serial configuration |
| OPENIO / CLOSEIO / SRECV / XMIT / BUFLEN | serial port I/O |
| PRINT / PR1 / PRST / PRVAR / PRLCD | printing |

## Notes
- 49G note: the machine shares the **48G/50g RPL command core** verbatim; only the CAS families (Algebra/Symbolic, Number Theory, Modular, Calculus, Differential Equations & Transforms) and the expanded Linear Algebra menu are genuinely new versus the 48G. Those CAS command names were confirmed against the HP 50g User's Guide command index (the 49G and 50g share the same CAS).
- The 49G manual PDF has **no OCR text layer**; command names were read from the rendered Advanced User's Guide pages and cross-checked with the OCR-searchable 50g guide. Descriptions are paraphrased; names are exact.
- Menu names/keys differ cosmetically from the 50g (the 49G uses the earlier ROM soft-menu labels) but the programmable command tokens match. Any command not verifiable in either source was omitted rather than guessed → `[?]` used nowhere, as all listed names were confirmed.
