# Hello Calc - AI Instructions

## Project Overview
Hello Calc is an experimental advanced calculator reimagined as a modern web application designed for a desktop/browser-native experience. Its ultimate goal is to achieve full feature parity with the legendary **HP48 calculator series**.

### Key Objectives
*   Deliver complex functions (RPN, Matrices, Dimensional Analysis/Units, Statistics, Symbolics, and Macro Programmability).
*   Provide a seamless toggle between modern Algebraic textbook entry and a classic RPN (Reverse Polish Notation) Stack representation.

### Architecture & Tech Stack Rules
*   **Framework:** Next.js (using pure React Client Components since no backend DB is necessary).
*   **Styling:** Tailwind CSS + `shadcn/ui`. **CRITICAL:** The app must be built using the [Rosely colour palette](https://rosely.hellotham.com/design/colours-and-palettes/). You must map the 16 Rosely colours (Greys, Pinks, Purples, Colourful) into the Tailwind configuration. Always use modern UI concepts (subtle animations, intelligent theming).
*   **Math Engine:** `math.js`. **CRITICAL:** You MUST instantiate `math.js` globally configured to use `BigNumbers` to ensure zero IEEE 754 floating-point errors (e.g., $0.1 + 0.2 \neq 0.300000004$). Core Units must use `math.js`'s built-in dimensional tracking.
*   **Symbolic CAS:** `Nerdamer`. Only use this for complex symbolics (solving for unknowns, taking derivatives, or polynomial factorization).
*   **Rendering:** `KaTeX` (`react-katex`). Do not output raw math strings to the user. Always typeset algebraic and symbolic results.
*   **Plotting:** `Plotly.js`.

## Implementation Guidelines
Refer to the `README.md` for the strictly phased Implementation Roadmap.
1. When developing RPN architecture, ensure the React state manages a strict LIFO array.
2. When creating Financial calculations, always build the formulas referencing high-precision `BigNumbers`, preventing compounding rounding faults.
3. Keep the styling incredibly premium and responsive to match modern desktop web standards.
