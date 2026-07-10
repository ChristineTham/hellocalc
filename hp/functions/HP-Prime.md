# HP-Prime — Function / Command Set

- **Access:** Toolbox key opens five menus — Math (non-symbolic), CAS (symbolic), App (per-app functions), User (your own), Catlg (everything). Frequent functions are on the physical keyboard; units/constants via Shift+Units; commands also via on-screen touch menus and the Program Editor's Tmplt/Cmds menus.
- **Approx. count:** ~300
- **Source:** HP Prime Graphing Calculator user guide, "Functions and commands" chapter (printed pp. 379–506 / PDF 429–506), "Units and constants" (pp. 534–544 / PDF 584–594), "Lists" (pp. 551–559 / PDF 601–609), "Matrices" (pp. 576–585 / PDF 626–635), "Programming in HP PPL" (pp. 627–660 / PDF 677–710) — hp/manuals/HP-Prime.pdf

**Notes on Home vs CAS:** Functions on the **Math menu** and the physical keyboard are numeric (Home view) — they return decimal/floating results. Functions on the **CAS menu** and the lowercase-named Catlg items are symbolic/exact (CAS view). Some functions exist in both contexts (e.g. keyboard trig). CAS commands are conventionally lowercase (`diff`, `factor`); Home/app functions are typically capitalised (`CEILING`, `TvmFV`). A CAS command can be called from Home by prefixing `CAS.` (e.g. `CAS.diff`).

## Keyboard & Arithmetic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| + − × ÷ | Keyboard | Add, subtract, multiply, divide; also lists/matrices/complex |
| x^y | Keyboard | Raise a value to a power |
| x² | Keyboard | Square a value (complex accepted) |
| √ | Keyboard | Square root |
| ^√ (nth root) | Keyboard | The nth root of a value |
| x⁻¹ | Keyboard | Reciprocal of a value |
| −x (negation) | Keyboard | Sign reversal; accepts complex |
| \|x\| | Keyboard | Absolute value; Frobenius norm for a matrix |
| ABS / abs | Catlg | Absolute value (abs gives l2-norm for matrices) |
| a b/c | Keyboard | Toggle last entry between decimal/fraction/mixed |
| →HMS toggle | Keyboard | Toggle decimal ↔ degrees-minutes-seconds |
| EEX (ᴇ) | Keyboard | Enter numbers in exponential (mantissa·10^exp) notation |
| i | Keyboard | Insert the imaginary unit i |
| π | Keyboard | Insert the constant π |
| e | Keyboard/Catlg | Insert Euler's number e |
| CEILING | Math > Number | Smallest integer ≥ value |
| FLOOR | Math > Number | Greatest integer ≤ value |
| IP | Math > Number | Integer part of a value |
| FP | Math > Number | Fractional part of a value |
| ROUND | Math > Number | Round to given decimal places or significant digits |
| TRUNCATE | Math > Number | Truncate to given decimal places |
| MANT | Math > Number | Mantissa (significant digits) of a value |
| XPON | Math > Number | Base-10 exponent of a value |
| MAX | Math > Arithmetic | Greatest of two or more values / a list |
| MIN | Math > Arithmetic | Least of two or more values / a list |
| MOD | Math > Arithmetic | Modulo: remainder of value1/value2 |
| FNROOT | Math > Arithmetic | Numeric root-finder for an expression in a variable |
| % | Math > Arithmetic | x percent of y (x/100·y) |
| %TOTAL | Catlg | Percentage of x that is y (100·y/x) |
| %CHANGE | PPL / Catlg | Percentage change from x to y |

## Trigonometry & Hyperbolic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SIN / COS / TAN | Keyboard | Sine, cosine, tangent (angle-mode aware) |
| ASIN / ACOS / ATAN | Keyboard | Inverse sine, cosine, tangent |
| CSC | Math > Trigonometry | Cosecant, 1/sin(x) |
| SEC | Math > Trigonometry | Secant, 1/cos(x) |
| COT | Math > Trigonometry | Cotangent, cos(x)/sin(x) |
| ACSC | Math > Trigonometry | Arc cosecant |
| ASEC | Math > Trigonometry | Arc secant |
| ACOT | Math > Trigonometry | Arc cotangent |
| SINH / COSH / TANH | Math > Hyperbolic | Hyperbolic sine, cosine, tangent |
| ASINH / ACOSH / ATANH | Math > Hyperbolic | Inverse hyperbolic sine, cosine, tangent |

## Logarithm & Exponential

| Function/Command | Access | Description |
|------------------|--------|-------------|
| LN | Keyboard | Natural logarithm |
| e^x (EXP) | Keyboard | Natural exponential |
| LOG | Keyboard | Common (base-10) logarithm |
| ALOG | Keyboard / Math | Common antilogarithm (10^x) |
| EXPM1 | Math > Exponential | Exponential minus one, e^x − 1 |
| LNP1 | Math > Exponential | Natural log of x + 1 |
| EXP | Catlg | e raised to an expression |

## Complex Numbers

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ARG | Math > Complex | Argument (angle) of a complex number |
| CONJ | Math > Complex | Complex conjugate |
| RE | Math > Complex | Real part of a complex number |
| IM | Math > Complex | Imaginary part of a complex number |
| SIGN | Math > Complex | Sign of a value / unit vector of a complex number |
| evalc | Catlg | Rewrite a complex expression as real + i·imag |

## Math Menu — Number/Probability

| Function/Command | Access | Description |
|------------------|--------|-------------|
| ! (factorial) | Keyboard / Math | Factorial; gamma function for non-integers |
| COMB | Math > Probability | Combinations of n things taken r at a time |
| PERM | Math > Probability | Permutations of n things taken r at a time |
| RANDOM | Math > Probability | Random real number in a range |
| RANDINT | Math > Probability | Random integer in a range |
| RANDNORM | Math > Probability | Random value from a normal distribution |
| RANDSEED | Math > Probability | Set the seed for random functions |

## Math Menu — Lists

| Function/Command | Access | Description |
|------------------|--------|-------------|
| DIFFERENCE | Math > List | List of non-common elements of two lists |
| INTERSECT | Math > List | Elements common to two lists |
| MAKELIST | Math > List | Build a list by evaluating an expression over a range |
| SORT | Math > List | Sort list elements ascending |
| REVERSE | Math > List | Reverse element order of a list |
| CONCAT | Math > List | Concatenate two lists |
| POS | Math > List | Position of an element within a list |
| SIZE | Math > List | Number of elements / dimensions of list/vector/matrix |
| ΔLIST | Math > List | List of first differences between consecutive elements |
| ΣLIST | Math > List | Sum of all elements in a list |
| πLIST | Math > List | Product of all elements in a list |

## Math Menu — Matrix

| Function/Command | Access | Description |
|------------------|--------|-------------|
| TRN | Math > Matrix | Transpose (conjugate transpose for complex) |
| DET | Math > Matrix | Determinant of a square matrix |
| RREF | Math > Matrix | Reduced row-echelon form |
| MAKEMAT | Math > Matrix | Build a matrix from an element expression |
| IDENMAT | Math > Matrix | Identity matrix of given size |
| randMat | Math > Matrix | Fill/create a matrix with random integers |
| JordanBlock | Math > Matrix | Jordan block matrix with value on the diagonal |
| hilbert | Math > Matrix | nth-order Hilbert matrix (CAS) |
| mkisom | Math > Matrix | Matrix of an isometry from its proper elements (CAS) |
| vandermonde | Math > Matrix | Vandermonde matrix from a vector |
| ROWNORM | Math > Matrix | Maximum row sum of absolute values |
| COLNORM | Math > Matrix | Maximum column sum of absolute values |
| SPECNORM | Math > Matrix | Spectral norm of a square matrix |
| SPECRAD | Math > Matrix | Spectral radius of a square matrix |
| COND | Math > Matrix | Condition number (column norm) |
| RANK | Math > Matrix | Rank of a rectangular matrix |
| pivot | Math > Matrix | Gaussian elimination keeping one pivot element |
| TRACE | Math > Matrix | Trace (sum of diagonal elements) |
| EIGENVAL | Math > Matrix | Eigenvalues as a vector |
| EIGENVV | Math > Matrix | Eigenvectors and eigenvalues |
| jordan | Math > Matrix | Passage matrix and Jordan form (CAS) |
| diag | Math > Matrix | Build diagonal matrix / extract diagonal |
| cholesky | Math > Matrix | Cholesky factor L with A = L·transpose(L) |
| ihermite | Math > Matrix | Hermite normal form over the integers |
| hessenberg | Math > Matrix | Reduction to Hessenberg form |
| ismith | Math > Matrix | Smith normal form over the integers |
| LQ | Math > Matrix | LQ factorisation (L, Q, permutation) |
| LSQ | Math > Matrix | Minimum-norm least-squares solution |
| LU | Math > Matrix | LU decomposition with permutation |
| QR | Math > Matrix | QR factorisation, returns R |
| SCHUR | Math > Matrix | Schur decomposition |
| SVD | Math > Matrix | Singular value decomposition |
| SVL | Math > Matrix | Singular values as a vector |
| CROSS | Math > Matrix | Cross product of two vectors |
| dot | Math > Matrix | Dot product of two vectors |
| l2norm | Math > Matrix | Euclidean (l2) norm of a vector |
| l1norm | Math > Matrix | l1 norm (sum of absolute coordinates) |
| maxnorm | Math > Matrix | l∞ norm (largest absolute coordinate) |
| INVERSE | Math > Matrix | Invert a square matrix |

## Math Menu — Special/Statistics

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Beta | Math > Special | Beta function of two numbers |
| Gamma | Math > Special | Gamma function of a number |
| Psi | Math > Special | nth derivative of the digamma function at a point |
| Zeta | Math > Special | Riemann zeta function for a real |
| erf | Math > Special | Error function value at a point |
| erfc | Math > Special | Complementary error function |
| Ei | Math > Special | Exponential integral of an expression |
| Si | Math > Special | Sine integral of an expression |
| Ci | Math > Special | Cosine integral of an expression |
| Dirac | Catlg | Dirac delta function value |
| Airy Ai | Catlg | Ai solution of the Airy equation |
| Airy Bi | Catlg | Bi solution of the Airy equation |

## CAS — Algebra

| Function/Command | Access | Description |
|------------------|--------|-------------|
| simplify | CAS > Algebra | Simplify an expression symbolically |
| collect | CAS > Algebra | Collect like terms in a polynomial |
| expand | CAS > Algebra | Expand an expression |
| factor | CAS > Algebra | Factorise a polynomial |
| cFactor | Catlg | Factorise over the complex field |
| subst | CAS > Algebra | Substitute a value for a variable |
| partfrac | CAS > Algebra | Partial fraction decomposition |
| cpartfrac | Catlg | Complex-field partial fraction decomposition |
| numer | CAS > Algebra > Extract | Numerator of a simplified fraction |
| denom | CAS > Algebra > Extract | Denominator of a simplified fraction |
| left | CAS > Algebra > Extract | Left side of an equation / interval start |
| right | CAS > Algebra > Extract | Right side of an equation / interval end |
| comDenom | Catlg | Rewrite a sum of fractions over a common denominator |
| canonical_form | Catlg | Canonical form of a quadratic trinomial |
| algvar | Catlg | Symbolic variables used in an expression |
| a2q | Catlg | Quadratic form of a symmetric matrix |
| exact | Catlg | Convert a decimal to a rational/exact expression |
| evalf | Catlg | Numeric evaluation to given significant digits |
| eval | Catlg | Evaluate an expression |

## CAS — Calculus

| Function/Command | Access | Description |
|------------------|--------|-------------|
| diff | CAS > Calculus | Symbolic derivative / partial derivative |
| int | CAS > Calculus | Indefinite or definite integral |
| limit | CAS > Calculus | Limit of an expression at a point/infinity |
| series | CAS > Calculus | Series expansion near a point |
| sum | CAS > Calculus | Discrete sum / antiderivative over a variable |
| curl | CAS > Calculus > Differential | Curl of a vector field |
| divergence | CAS > Calculus > Differential | Divergence of a vector field |
| grad | CAS > Calculus > Differential | Gradient of an expression |
| hessian | CAS > Calculus > Differential | Hessian matrix of an expression |
| ibpu | CAS > Calculus > Integral | Integration by parts specifying u(x) |
| ibpdv | CAS > Calculus > Integral | Integration by parts specifying v(x) |
| preval | CAS > Calculus > Integral | Evaluate F(b) − F(a) |
| sum_riemann | CAS > Calculus > Limits | Riemann-sum equivalent of a series |
| taylor | CAS > Calculus > Limits | Taylor series expansion |
| divpc | CAS > Calculus > Limits | Taylor polynomial of a quotient of polynomials |
| laplace | CAS > Calculus > Transform | Laplace transform |
| ilaplace | CAS > Calculus > Transform | Inverse Laplace transform |
| fft | CAS > Calculus > Transform | Discrete Fourier transform of a vector |
| ifft | CAS > Calculus > Transform | Inverse discrete Fourier transform |

## CAS — Solve

| Function/Command | Access | Description |
|------------------|--------|-------------|
| solve | CAS > Solve | Solutions (real/complex) of an equation or system |
| zeros | CAS > Solve | Real zeros of an expression |
| cSolve | CAS > Solve | Complex solutions of an equation/system |
| cZeros | CAS > Solve | Complex zeros of an expression |
| fSolve | CAS > Solve | Numerical solution of an equation/system |
| deSolve | CAS > Solve | Symbolic solution of a differential equation |
| odesolve | CAS > Solve | Numeric ODE solver with initial conditions |
| linsolve | CAS > Solve | Solve a linear system of equations |

## CAS — Polynomial

| Function/Command | Access | Description |
|------------------|--------|-------------|
| proot | CAS > Polynomial | Roots of a polynomial |
| coeff | CAS > Polynomial | Coefficient vector of a polynomial |
| divis | CAS > Polynomial | Divisors of a polynomial |
| factors | CAS > Polynomial | Prime factors with multiplicities |
| gcd | CAS > Polynomial | Greatest common divisor of polynomials |
| lcm | CAS > Polynomial | Least common multiple of polynomials |
| symb2poly | CAS > Polynomial > Create | Polynomial to coefficient vector |
| poly2symb | CAS > Polynomial > Create | Coefficient vector to polynomial |
| pcoef | CAS > Polynomial > Create | Coefficients from a list of roots |
| fcoeff | CAS > Polynomial > Create | Rational function from roots/poles with orders |
| randpoly | CAS > Polynomial > Create | Random polynomial coefficients |
| pmin | CAS > Polynomial > Create | Minimal polynomial of a matrix |
| quo | CAS > Polynomial > Algebra | Euclidean quotient of two polynomials |
| rem | CAS > Polynomial > Algebra | Euclidean remainder of two polynomials |
| degree | CAS > Polynomial > Algebra | Degree of a polynomial |
| factor_xn | CAS > Polynomial > Algebra | Factor out x^n from a polynomial |
| content | CAS > Polynomial > Algebra | GCD of a polynomial's coefficients |
| sturmab | CAS > Polynomial > Algebra | Count sign changes / complex roots in a region |
| chinrem | CAS > Polynomial > Algebra | Chinese remainder of two polynomials |
| cyclotomic | CAS > Polynomial > Special | Coefficients of the cyclotomic polynomial |
| gbasis | CAS > Polynomial > Special | Groebner basis of a polynomial ideal |
| greduce | CAS > Polynomial > Special | Remainder over a Groebner basis |
| hermite | CAS > Polynomial > Special | Hermite polynomial of degree n |
| lagrange | CAS > Polynomial > Special | Lagrange interpolating polynomial |
| laguerre | CAS > Polynomial > Special | Laguerre polynomial of degree n |
| legendre | CAS > Polynomial > Special | Legendre polynomial of degree n |
| tchebyshev1 | CAS > Polynomial > Special | Chebyshev polynomial of the first kind |
| tchebyshev2 | CAS > Polynomial > Special | Chebyshev polynomial of the second kind |
| charpoly | Catlg | Characteristic polynomial of a matrix |
| companion | Catlg | Companion matrix of a polynomial |
| complexroot | Catlg | Complex roots with multiplicity/intervals |
| crationalroot | Catlg | Complex rational roots of a polynomial |
| abcuv | Catlg | Solve A·U + B·V = C for polynomials U, V |
| egcd | Catlg | Extended GCD of two polynomials |

## CAS — Integer/Arithmetic

| Function/Command | Access | Description |
|------------------|--------|-------------|
| idivis | CAS > Integer | Divisors of an integer |
| ifactor | CAS > Integer | Prime factor decomposition of an integer |
| ifactors | CAS > Integer | Prime factors with multiplicities |
| gcd | CAS > Integer | Greatest common divisor of integers |
| lcm | CAS > Integer | Least common multiple of integers |
| isPrime | CAS > Integer > Prime | Test whether an integer is prime |
| ithprime | CAS > Integer > Prime | The nth prime number |
| nextprime | CAS > Integer > Prime | Next prime after an integer |
| prevprime | CAS > Integer > Prime | Previous prime before an integer |
| euler | CAS > Integer > Prime | Euler's totient of an integer |
| iquo | CAS > Integer > Division | Integer quotient of Euclidean division |
| irem | CAS > Integer > Division | Integer remainder of Euclidean division |
| powmod | CAS > Integer > Division | a^n modulo p |
| ichinrem | CAS > Integer > Division | Integer Chinese Remainder Theorem |
| chrem | Catlg | Chinese remainders for two sets of integers |

## CAS — Rewrite/Trig

| Function/Command | Access | Description |
|------------------|--------|-------------|
| lncollect | CAS > Rewrite | Collect logarithms in an expression |
| powexpand | CAS > Rewrite | Rewrite a power of a sum as a product of powers |
| texpand | CAS > Rewrite | Expand a transcendental expression |
| exp2pow | CAS > Rewrite > Exp&Ln | Rewrite e^(n·ln x) as a power of x |
| pow2exp | CAS > Rewrite > Exp&Ln | Rewrite powers as exponentials |
| exp2trig | CAS > Rewrite > Exp&Ln | Complex exponentials to sine/cosine |
| expexpand | CAS > Rewrite > Exp&Ln | Expand exponentials |
| asin2acos | CAS > Rewrite > Sine | Rewrite asin(x) via acos(x) |
| asin2atan | CAS > Rewrite > Sine | Rewrite asin(x) via atan |
| sin2costan | CAS > Rewrite > Sine | Rewrite sin(x) as cos(x)·tan(x) |
| acos2asin | CAS > Rewrite > Cosine | Rewrite acos(x) via asin(x) |
| acos2atan | CAS > Rewrite > Cosine | Rewrite acos(x) via atan |
| cos2sintan | CAS > Rewrite > Cosine | Rewrite cos(x) as sin(x)/tan(x) |
| atan2asin | CAS > Rewrite > Tangent | Rewrite atan(x) via asin |
| atan2acos | CAS > Rewrite > Tangent | Rewrite atan(x) via acos |
| tan2sincos | CAS > Rewrite > Tangent | Rewrite tan(x) as sin(x)/cos(x) |
| halftan | CAS > Rewrite > Tangent | Rewrite sin/cos/tan via tan(x/2) |
| trigsin | CAS > Rewrite > Trig | Simplify giving sine precedence |
| trigcos | CAS > Rewrite > Trig | Simplify giving cosine precedence |
| trigtan | CAS > Rewrite > Trig | Simplify giving tangent precedence |
| atrig2ln | CAS > Rewrite > Trig | Inverse trig functions via natural logarithm |
| tlin | CAS > Rewrite > Trig | Linearise products/powers of trig terms |
| tcollect | CAS > Rewrite > Trig | Linearise and collect same-angle sine/cosine |
| trigexpand | CAS > Rewrite > Trig | Expand a trigonometric expression |
| trig2exp | CAS > Rewrite > Trig | Trig functions to complex exponentials |

## Probability Distributions

Numeric (Home) probability functions come in density (PDF), cumulative (CDF), and inverse (ICDF) forms. Beta and Cauchy distributions live on the Catlg menu (lowercase).

| Function/Command | Access | Description |
|------------------|--------|-------------|
| NORMALD | Math > Probability > Density | Normal probability density |
| STUDENT | Math > Probability > Density | Student's t density |
| CHISQUARE | Math > Probability > Density | Chi-square density |
| FISHER | Math > Probability > Density | Fisher (F) density |
| BINOMIAL | Math > Probability > Density | Binomial probability of k successes |
| GEOMETRIC | Math > Probability > Density | Geometric density |
| POISSON | Math > Probability > Density | Poisson probability mass |
| NORMALD_CDF | Math > Probability > Cumulative | Lower-tail normal probability |
| STUDENT_CDF | Math > Probability > Cumulative | Lower-tail Student's t probability |
| CHISQUARE_CDF | Math > Probability > Cumulative | Lower-tail chi-square probability |
| FISHER_CDF | Math > Probability > Cumulative | Lower-tail Fisher probability |
| BINOMIAL_CDF | Math > Probability > Cumulative | Cumulative binomial probability |
| GEOMETRIC_CDF | Math > Probability > Cumulative | Cumulative geometric probability |
| POISSON_CDF | Math > Probability > Cumulative | Cumulative Poisson probability |
| NORMALD_ICDF | Math > Probability > Inverse | Inverse cumulative normal |
| STUDENT_ICDF | Math > Probability > Inverse | Inverse cumulative Student's t |
| CHISQUARE_ICDF | Math > Probability > Inverse | Inverse cumulative chi-square |
| FISHER_ICDF | Math > Probability > Inverse | Inverse cumulative Fisher |
| BINOMIAL_ICDF | Math > Probability > Inverse | Inverse cumulative binomial |
| GEOMETRIC_ICDF | Math > Probability > Inverse | Inverse cumulative geometric |
| POISSON_ICDF | Math > Probability > Inverse | Inverse cumulative Poisson |
| betad | Catlg | Beta density at x |
| betad_cdf | Catlg | Cumulative Beta probability |
| betad_icdf | Catlg | Inverse cumulative Beta |
| cauchy | Catlg | Cauchy density at x |
| cauchy_cdf | Catlg | Cumulative Cauchy probability |
| cauchy_icdf | Catlg | Inverse cumulative Cauchy |

## Statistics (1Var/2Var)

Statistics app functions; 1Var analyses are H1–H5, 2Var analyses S1–S5. Spreadsheet variants (STAT1, STAT2, REGRS) also exist.

| Function/Command | Access | Description |
|------------------|--------|-------------|
| Do1VStats | Statistics 1Var app | Compute one-variable summary statistics for Hn |
| SetFreq | Statistics 1Var app | Set the frequency column for an analysis |
| SetSample | Statistics 1Var app | Set the sample data column for an analysis |
| Do2VStats | Statistics 2Var app | Compute two-variable summary statistics for Sn |
| PredX | Statistics 2Var app | Predict an x-value from the fit |
| PredY | Statistics 2Var app | Predict a y-value from the fit |
| Resid | Statistics 2Var app | Residuals for an analysis |
| SetDepend | Statistics 2Var app | Set the dependent column for an analysis |
| SetIndep | Statistics 2Var app | Set the independent column for an analysis |
| STAT1 | Spreadsheet app | One-variable statistics over a cell range |
| STAT2 | Spreadsheet app | Two-variable statistics over a cell range |
| REGRS | Spreadsheet app | Fit data to a chosen regression model |
| PredY | Spreadsheet app | Predicted y for a regression model |
| PredX | Spreadsheet app | Predicted x for a regression model |

## Hypothesis Tests (Inference)

Inference app functions (also available as Spreadsheet variants). Each returns test results / confidence-interval bounds.

| Function/Command | Access | Description |
|------------------|--------|-------------|
| DoInference | Inference app | Run current confidence interval or hypothesis test |
| HypZ1mean | Inference app | One-sample Z-test for a mean |
| HypZ2mean | Inference app | Two-sample Z-test for difference of means |
| HypZ1prop | Inference app | One-sample Z-test for a proportion |
| HypZ2prop | Inference app | Two-sample Z-test for two proportions |
| HypT1mean | Inference app | One-sample t-test for a mean |
| HypT2mean | Inference app | Two-sample t-test for difference of means |
| ConfZ1mean | Inference app | Normal confidence interval for a mean |
| ConfZ2mean | Inference app | Normal CI for difference of two means |
| ConfZ1prop | Inference app | Normal confidence interval for a proportion |
| ConfZ2prop | Inference app | Normal CI for difference of two proportions |
| ConfT1mean | Inference app | Student's t confidence interval for a mean |
| ConfT2mean | Inference app | Student's t CI for difference of two means |
| Chi2GOF | Inference app | Chi-square goodness-of-fit test |
| Chi2TwoWay | Inference app | Chi-square two-way (independence) test |
| LinRegrTConfSlope | Inference app | Regression confidence interval for the slope |
| LinRegrTConfInt | Inference app | Regression confidence interval for the intercept |
| LinRegrTMeanResp | Inference app | Regression CI for a mean response |
| LinRegrTPredInt | Inference app | Regression prediction interval for a response |
| LinRegrTTest | Inference app | Linear regression t-test |

## App Functions — Finance

Finance app TVM/interest/date/cashflow/depreciation/break-even/percent-change/bond/Black-Scholes functions.

| Function/Command | Access | Description |
|------------------|--------|-------------|
| TvmFV | Finance app | Solve for future value |
| TvmIPYR | Finance app | Solve for annual interest rate |
| TvmNbPmt | Finance app | Solve for number of payments |
| TvmPMT | Finance app | Solve for payment value |
| TvmPV | Finance app | Solve for present value |
| CalcFV | Finance app | Solve for future value (Numeric-view variant) |
| CalcIPYR | Finance app | Solve for annual interest rate |
| CalcNbPmt | Finance app | Solve for number of payments |
| CalcPMT | Finance app | Solve for payment value |
| CalcPV | Finance app | Solve for present value |
| DoFinance | Finance app | Solve a TVM problem for a chosen variable |
| IntConvNom | Finance app | Nominal interest rate from effective |
| IntConvEff | Finance app | Effective interest rate from nominal |
| IntConvCPYR | Finance app | Compounding periods per year |
| DateDays | Finance app | Days between two dates |
| CashFlowIRR | Finance app | Internal rate of return |
| CashFlowMIRR | Finance app | Modified internal rate of return |
| CashFlowFMRR | Finance app | Financial management rate of return |
| CashFlowTotal | Finance app | Total of all cash flows |
| CashFlowNPV | Finance app | Net present value |
| CashFlowNFV | Finance app | Net future value |
| CashFlowNUS | Finance app | Net uniform series |
| CashFlowPB | Finance app | Discounted payback period |
| Depreciate | Finance app | Depreciation schedule by method |
| BrkEvFixed | Finance app | Break-even fixed cost |
| BrkEvQuant | Finance app | Break-even quantity |
| BrkEvCost | Finance app | Break-even unit cost |
| BrkEvPrice | Finance app | Break-even unit price |
| BrkEvProfit | Finance app | Break-even profit |
| ChangePrice | Finance app | Sales price from cost and markup/margin |
| ChangeCost | Finance app | Cost from price and markup/margin |
| PercentMargin | Finance app | Margin as percentage of cost |
| PercentMarkup | Finance app | Markup as percentage of price |
| ChangeOld | Finance app | Old number in a percent-change calculation |
| ChangeNew | Finance app | New number in a percent-change calculation |
| PercentTotal | Finance app | Part-total percentage |
| PercentChange | Finance app | Percent change between two values |
| BondYield | Finance app | Bond yield to maturity/call at a price |
| BondPrice | Finance app | Bond price per 100 at a yield |
| BlackScholes | Finance app | Black-Scholes call and put option prices |
| AMORT | Spreadsheet app | Loan amortisation principal/interest/balance |

## App Functions — Solve/Linear/Triangle

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SOLVE | Solve app | Solve an equation/expression for a variable with a guess |
| Solve2x2 | Linear Solver app | Solve a 2×2 linear system |
| Solve3x3 | Linear Solver app | Solve a 3×3 linear system |
| LinSolve | Linear Solver app | Solve a 2×2 or 3×3 system from a matrix |
| AAS | Triangle Solver app | Solve triangle from angle-angle-side |
| ASA | Triangle Solver app | Solve triangle from angle-side-angle |
| SAS | Triangle Solver app | Solve triangle from side-angle-side |
| SSA | Triangle Solver app | Solve triangle from side-side-angle |
| SSS | Triangle Solver app | Solve triangle from three sides |
| DoSolve | Triangle Solver app | Solve the current triangle problem |
| LinearSlope | Explorer app | Slope of a line through two points |
| LinearYIntercept | Explorer app | Y-intercept of a line from point and slope |
| QuadSolve | Explorer app | Real solutions of a quadratic |
| QuadDelta | Explorer app | Discriminant of a quadratic |
| CHECK | App menu (common) | Select a Symbolic-view definition (Fn/Hn/...) |
| UNCHECK | App menu (common) | Deselect a Symbolic-view definition |
| ISCHECK | App menu (common) | Test whether a Symbolic-view definition is selected |
| plotfunc | Math > Plot / Geometry | Plot y = f(x) in Symbolic view |
| plotcontour | Math > Plot / Geometry | Plot contour lines of z = f(x,y) |

## App Functions — Spreadsheet

| Function/Command | Access | Description |
|------------------|--------|-------------|
| SUM | Spreadsheet app | Sum of a range of numbers |
| AVERAGE | Spreadsheet app | Arithmetic mean of a range |
| STAT1 | Spreadsheet app | One-variable statistics for a range |
| STAT2 | Spreadsheet app | Two-variable statistics for a range |
| REGRS | Spreadsheet app | Regression fit over a data range |
| AMORT | Spreadsheet app | Amortisation schedule into cells |
| HypZ1mean … ConfT2mean | Spreadsheet app | Hypothesis-test / CI functions writing to cells |

## Units & Conversions

Units come from the Units menu (Shift+Units), organised by category (length, area, volume, time, speed, mass, acceleration, force, energy, power, pressure, temperature, electricity, light, angle, viscosity, radiation); prefixes Y…y available. Constants from Shift+Units > Constants.

| Function/Command | Access | Description |
|------------------|--------|-------------|
| CONVERT | Units > Tools | Convert a measurement to another unit / base / continued fraction |
| MKSA | Units > Tools | Reduce a compound unit to base MKSA units |
| UFACTOR | Units > Tools | Express a measurement in given constituent units |
| USIMPLIFY | Units > Tools | Simplify units to a compound unit |
| →HMS | PPL / Catlg | Decimal value to degrees/hours-minutes-seconds |
| HMS→ | PPL / Catlg | Hexagesimal value to decimal |
| B→R | Programming > Integer | Base-m integer to decimal |
| R→B | Programming > Integer | Decimal integer to default base |
| SETBASE | Programming > Integer | Display an integer in a chosen base |
| GETBASE | Programming > Integer | Base of an integer |
| SETBITS | Programming > Integer | Set number of bits representing an integer |
| GETBITS | Programming > Integer | Number of bits encoding an integer |

## Programming (PPL) — Structure & Flow

| Function/Command | Access | Description |
|------------------|--------|-------------|
| BEGIN…END | PPL > Tmplt > Block | Group commands into a block |
| RETURN | PPL > Tmplt > Block | Return the value of an expression |
| KILL | PPL > Tmplt > Block | Stop step-by-step (debug) execution |
| IF THEN | PPL > Tmplt > Branch | Execute commands if test is true |
| IF THEN ELSE | PPL > Tmplt > Branch | Choose between two command blocks |
| CASE | PPL > Tmplt > Branch | Multi-branch selection with optional default |
| IFERR | PPL > Tmplt > Branch | Run commands, handling any error |
| IFERR ELSE | PPL > Tmplt > Branch | Error handling with an else clause |
| FOR | PPL > Tmplt > Loop | Count-controlled loop incrementing by 1 |
| FOR STEP | PPL > Tmplt > Loop | For-loop with a custom increment |
| FOR DOWNTO | PPL > Tmplt > Loop | Descending for-loop |
| FOR STEP DOWN | PPL > Tmplt > Loop | Descending for-loop with custom step |
| WHILE | PPL > Tmplt > Loop | Repeat while test is true |
| REPEAT | PPL > Tmplt > Loop | Repeat until test is true |
| BREAK | PPL > Tmplt > Loop | Exit n loop levels |
| CONTINUE | PPL > Tmplt > Loop | Jump to next loop iteration |
| LOCAL | PPL > Tmplt > Variable | Declare variables local to a program |
| EXPORT | PPL > Tmplt > Variable/Function | Export variables/functions globally |
| VIEW | PPL > Tmplt > Function | Add a custom entry to the app View menu |
| KEY | PPL > Tmplt > Function | Prefix for a key name in a user keyboard |
| ITERATE | PPL > Cmds > More | Recursively evaluate an expression n times |
| BITAND | PPL > Cmds > Integer | Bitwise AND of integers |
| BITOR | PPL > Cmds > Integer | Bitwise OR of integers |
| BITXOR | PPL > Cmds > Integer | Bitwise exclusive OR |
| BITNOT | PPL > Cmds > Integer | Bitwise NOT |
| BITSL | PPL > Cmds > Integer | Bitwise shift left |
| BITSR | PPL > Cmds > Integer | Bitwise shift right |

## Programming — Variables & I/O

| Function/Command | Access | Description |
|------------------|--------|-------------|
| := | Catlg | Store an evaluated expression in a variable |
| CAS | PPL > Cmds > More | Run a function/variable via the CAS |
| INPUT | PPL > Cmds > I/O | Prompt for values in a dialog box |
| MSGBOX | PPL > Cmds > I/O | Display a message box |
| PRINT | PPL > Cmds > I/O | Print to the program terminal |
| CHOOSE | PPL > Cmds > I/O | Display a choose (pick-list) box |
| EDITLIST | PPL > Cmds > I/O | Open the List Editor on a list variable |
| EDITMAT | PPL > Cmds > I/O / Matrix | Open the Matrix Editor on a matrix |
| GETKEY | PPL > Cmds > I/O | Return the ID of the next buffered key |
| ISKEYDOWN | PPL > Cmds > I/O | Test whether a given key is pressed |
| MOUSE | PPL > Cmds > I/O | Current pointer/touch position and gesture |
| WAIT | PPL > Cmds > I/O | Pause execution for n seconds |
| FREEZE | PPL > Cmds > Drawing | Pause redraw until a key is pressed |
| ASC | PPL > Cmds > Strings | ASCII codes of a string |
| CHAR | PPL > Cmds > Strings | String from character codes |
| DIM | PPL > Cmds > Strings | Number of characters in a string |
| STRING | PPL > Cmds > Strings | Convert an expression to a string |
| INSTRING | PPL > Cmds > Strings | Index of first occurrence of a substring |
| LEFT | PPL > Cmds > Strings | First n characters of a string |
| RIGHT | PPL > Cmds > Strings | Last n characters of a string |
| MID | PPL > Cmds > Strings | Extract characters from a string |
| ROTATE | PPL > Cmds > Strings | Cyclically shift characters in a string |
| LOWER | PPL > Cmds > Strings | Convert a string to lowercase |
| UPPER | PPL > Cmds > Strings | Convert a string to uppercase |
| REPLACE | PPL > Cmds > Strings/Matrix | Replace part of a string/matrix/vector |
| STRINGFROMID | PPL > Cmds > Strings | Built-in localized string by ID |
| EVALLIST | PPL > Cmds > More | Evaluate each element of a list |
| EXECON | PPL > Cmds > More | Build a list by applying an expression across lists |
| TICKS | PPL > Cmds > More | Internal clock value in milliseconds |
| TEVAL | PPL > Cmds > More | Time taken to evaluate a parameter |
| TYPE | PPL > Cmds > More | Type code of an object |

## Programming — Drawing

Cartesian drawing commands act on the app plot window; each has a `_P` pixel-coordinate variant.

| Function/Command | Access | Description |
|------------------|--------|-------------|
| RGB | PPL > Cmds > Drawing | Colour integer from red/green/blue (+alpha) |
| C→PX | PPL > Cmds > Drawing | Cartesian to pixel coordinates |
| PX→C | PPL > Cmds > Drawing | Pixel to Cartesian coordinates |
| DRAWMENU | PPL > Cmds > Drawing | Draw a six-button softkey menu |
| ARC / ARC_P | PPL > Cmds > Drawing | Draw an arc or circle |
| LINE / LINE_P | PPL > Cmds > Drawing | Draw line(s), with optional 3D transform |
| RECT / RECT_P | PPL > Cmds > Drawing | Draw/fill a rectangle (clear screen) |
| TRIANGLE / TRIANGLE_P | PPL > Cmds > Drawing | Draw/fill triangle(s), with optional 3D transform |
| FILLPOLY / FILLPOLY_P | PPL > Cmds > Drawing | Fill a polygon |
| PIXON / PIXON_P | PPL > Cmds > Drawing | Set a pixel's colour |
| PIXOFF / PIXOFF_P | PPL > Cmds > Drawing | Set a pixel to white |
| GETPIX / GETPIX_P | PPL > Cmds > Drawing | Colour of a pixel |
| INVERT / INVERT_P | PPL > Cmds > Drawing | Reverse-video a region |
| BLIT / BLIT_P | PPL > Cmds > Drawing | Copy a region between graphics |
| SUBGROB / SUBGROB_P | PPL > Cmds > Drawing | Copy a sub-region into a graphic |
| DIMGROB / DIMGROB_P | PPL > Cmds > Drawing | Set graphic dimensions/data |
| GROBW / GROBW_P | PPL > Cmds > Drawing | Width of a graphic |
| GROBH / GROBH_P | PPL > Cmds > Drawing | Height of a graphic |
| TEXTOUT / TEXTOUT_P | PPL > Cmds > Drawing | Draw text onto a graphic |

## Programming — App control

| Function/Command | Access | Description |
|------------------|--------|-------------|
| STARTAPP | PPL > Cmds > App Functions | Launch an app by name |
| STARTVIEW | PPL > Cmds > App Functions | Start a numbered app/system view |
| VIEW | PPL > Cmds > App Functions | Add a custom View-menu entry running a program |
| ADDCOL | PPL > Cmds > Matrix | Insert a column into a matrix |
| ADDROW | PPL > Cmds > Matrix | Insert a row into a matrix |
| DELCOL | PPL > Cmds > Matrix | Delete a matrix column |
| DELROW | PPL > Cmds > Matrix | Delete a matrix row |
| REDIM | PPL > Cmds > Matrix | Redimension a matrix/vector |
| SCALE | PPL > Cmds > Matrix | Multiply a matrix row by a value |
| SCALEADD | PPL > Cmds > Matrix | Row operation: scale one row and add to another |
| SUB | PPL > Cmds > Matrix | Extract a sub-object into a variable |
| SWAPCOL | PPL > Cmds > Matrix | Swap two matrix columns |
| SWAPROW | PPL > Cmds > Matrix | Swap two matrix rows |
| AFiles / AFilesB | PPL app variables | Access an app's associated files |
| AVars / DelAVars | PPL app variables | Access or delete app variables |
| ANote | PPL app variables | Get/set an app's note |
| AProgram | PPL app variables | Get/set an app's program |

## Notes
- Names are exact; descriptions are original one-line summaries.
- Home vs CAS: Math-menu and keyboard functions are numeric (Home view, capitalised, e.g. `CEILING`); CAS-menu items are symbolic/exact (lowercase, e.g. `diff`, `factor`). Some overlap; a CAS command can run from Home via a `CAS.` prefix.
- Distribution functions come in density (…), cumulative (`_CDF`), and inverse (`_ICDF`) forms; Beta and Cauchy variants are on the Catlg menu.
- Drawing commands each have a pixel-coordinate `_P` variant; only representative pairs are listed.
- This catalogues the principal documented families; the full Catlg exposes additional lowercase CAS commands not individually enumerated here. Any illegible entry would be marked [?] (none required).
