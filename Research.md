# Advanced Calculator Library Research (React/TypeScript)

Based on the requirements for a client-side calculator built in NextJS supporting RPN (Reverse Polish Notation), algebraic logic, symbolic mode, an equation solver, financial calculations, and a Computer Algebra System (CAS), I have compiled a list of the most suitable JavaScript/TypeScript libraries.

> [!NOTE]
> Since this is a client-side Next.js application, all recommended libraries can run entirely in the browser without relying on Node.js backend services.

## 1. Core Engine & CAS (Computer Algebra System)

To support symbolic mathematics, algebraic modes, and equation solving, you need a powerful math engine.

### Math.js (Highly Recommended)
*   **Description**: The most comprehensive general-purpose math library for JavaScript.
*   **Capabilities**: Extensive numerical operations, big numbers (for precision), complex numbers, matrices, and units. It features a robust expression parser suitable for algebraic mode.
*   **Symbolic/CAS**: It has built-in symbolic capabilities including expression simplification, basic derivatives, and variable substitution.
*   **TypeScript**: Excellent built-in type definitions.
*   **Usage in your App**: Ideal for powering the algebraic engine and evaluating complex expressions entered by the user.

### Nerdamer
*   **Description**: A modular, lightweight Computer Algebra System written in JavaScript.
*   **Capabilities**: Solving equations, finding roots, factoring polynomials, and managing algebra.
*   **Symbolic/CAS**: Excellent symbolic integration and differentiation. It includes a dedicated solver module (`nerdamer/Solve`).
*   **TypeScript**: TypeScript definitions are available, though historically community-maintained.
*   **Usage in your App**: Perfect for the dedicated "Equation Solver" and "Symbolic Mode" features, as it handles symbolic algebra better than `math.js`.

### Algebrite
*   **Description**: A heavy-duty, dedicated Computer Algebra System built in TypeScript/CoffeeScript.
*   **Capabilities**: Arbitrary-precision arithmetic, symbolic roots, tensors.
*   **Symbolic/CAS**: Performs deep symbolic manipulation (expansion, integrals, gradients).
*   **Usage in your App**: An alternative to Nerdamer if you need extremely complex calculus features, though it can be slightly heavier. 

## 2. Setting Up RPN & Algebraic Modes

> [!IMPORTANT]
> There are no standard "React RPN libraries" because RPN is an algorithmic approach rather than a complex mathematical problem. 

**For RPN Mode**:
Use React's built-in state management. An RPN calculator relies on a LIFO (Last-In, First-Out) stack.
*   **State Structure**: `const [stack, setStack] = useState<number[]>([])`
*   **Logic**: 
    - Input number -> `stack.push(val)`
    - Input operator -> Pop last two `a, b`, compute `a * b`, and push result.
*   **Calculation Engine**: Use `Decimal.js` (see below) or `Math.js` to perform the actual arithmetic to prevent floating-point errors.

**For Algebraic Mode**:
Use the `math.js` expression parser. Users type `3 + 4 * 2`, and `math.evaluate('3 + 4 * 2')` parses and solves it according to standard order of operations.

## 3. High Precision & Financial Calculations

Native JavaScript numbers use IEEE 754 floating-point arithmetic, which is notoriously bad for financial data (e.g., `0.1 + 0.2 = 0.30000000000000004`).

### Decimal.js / Big.js
*   **Description**: Arbitrary-precision decimal arithmetic.
*   **Usage**: Underpinning the entire calculator to ensure floating-point errors do not occur. `Math.js` actually uses `decimal.js` under the hood when configured for big numbers.

### Finance.js / tvm-financejs
*   **Description**: Libraries dedicated to standard financial formulas that mimic Excel.
*   **Capabilities**: Present Value (PV), Future Value (FV), Payment amounts (PMT), Net Present Value (NPV), and Internal Rate of Return (IRR).
*   **TypeScript**: Definitions are generally available via DefinitelyTyped.
*   **Usage in your App**: Wire these directly into your custom "Finance Mode" UI.

## 4. UI Display & Rendering in React

When building an advanced calculator, displaying symbolic math beautifully (like native fractions, integrals, and superscripts) is critical.

### KaTeX / react-katex
*   **Description**: The fastest math typesetting library for the web.
*   **Usage**: When Nerdamer or Math.js outputs an equation string or LaTeX format, pass it to `<BlockMath math={result} />` to render beautiful, textbook-quality math equations on the screen.

---

## Recommended Technology Stack for the Calculator

1.  **Framework:** Next.js (Client Components) + TypeScript
2.  **Core Math & Algebraic Parsing:** `math.js` (Configured to use BigNumbers to handle precision perfectly).
3.  **Equation Solving & CAS:** `nerdamer` (For solving algebraic text variables and integrals).
4.  **Financial Formulas:** `finance.js` (or custom implement TVM logic using `decimal.js`).
5.  **Equation Rendering:** `react-katex` (To format symbolic answers).
6.  **RPN Logic:** Custom React `useState`/`useReducer` utilizing the precision math engine.
