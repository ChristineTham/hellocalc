## Hello Calc

Experimental advanced calculator, reimagined as a modern app.

Why do Javascript calculators have to emulate a physical device? Do we really want to hunt and peck virtual keys on a screen? On a tablet or smartphone, possibly, but not on a browser running on a computer with a keyboard and mouse.

This experiment reimagines a calculator as a modern app complete with
* Full feature parity with the legendary HP48 calculator series (including matrices, statistics, and programmability)
* Native support for Units and Dimensional analysis (e.g., `5 cm + 2 inches`)
* Expression evaluator with history stack, variables, expression library
* Advanced Plotting and Graphing (2D and statistical charts)
* Equation solver and symbolic computation (Computer Algebra System)
* Financial calculations (Time Value of Money, high precision currency)
* Editor based block evaluations
* And yes, if you want it, a virtual calculator (supporting both RPN and Algebraic logic modes)

### Architecture

This is a client-side web app built with:
* NextJS (React Client Components)
* shadcn/ui
* Tailwind CSS (strictly configured to the [Rosely colour palette](https://rosely.hellotham.com/design/colours-and-palettes/))
* TypeScript
* [Math.js](https://mathjs.org/) - Core mathematical engine, expression parsing, arbitrary precision (BigNumbers), and native units management
* [Nerdamer](https://nerdamer.com/) - Lightweight Computer Algebra System (CAS) for symbolic operations and solving equations
* [KaTeX](https://katex.org/) (`react-katex`) - Beautiful high-performance rendering for symbolic algebraic outputs
* Finance calculations via custom high-precision evaluation logic (utilizing underlying decimal libraries)
* [Plotly.js](https://plotly.com/javascript/) - Graphing and plotting
* React State Management (`useState`/`useReducer`) - Handling the computation history and RPN LIFO stack

## Implementation Plan

To build this ambitious application effectively, development is broken down into the following stages, progressively adding complexity.

### Phase 1: Foundation & Algebraic Evaluator
* Initialize NextJS, Tailwind, and shadcn/ui.
* Integrate `math.js` for the core evaluation engine.
* Build a standard text-input based calculator (Algebraic mode).
* Implement the session history stack, basic variable assignment, and evaluation logic.

### Phase 2: RPN Architecture & Virtual Interface
* Implement the structural state for the RPN (LIFO) stack.
* Build the "Virtual Calculator" UI (on-screen keypad).
* Allow seamless toggling between Algebraic history mode and RPN stack mode.
* Integrate `KaTeX` + `react-katex` to begin pretty-printing final outputs natively.

### Phase 3: High Precision, Units, & Matrices
* Configure `math.js` to utilize BigNumbers to guarantee precision operations.
* Implement native Unit and Dimensional Analysis UI and parsing mechanisms.
* Add matrix inputs and linear algebra operations (inverses, determinants, dot products).
* Expand the virtual keyboard modes to accommodate vector and unit entry.

### Phase 4: Symbolic Math & CAS (Computer Algebra System)
* Introduce `Nerdamer` to power the CAS features.
* Create a dedicated "Equation Solver" mode.
* Support symbolic calculus operations (differentiation, integration, and polynomial factoring).
* Map Nerdamer's outputs through KaTeX for textbook-quality equation rendering.

### Phase 5: Finance & Statistical parity
* Implement specific UI views for calculating Time Value of Money (TVM: PV, FV, PMT, NPV, IRR) using high-precision logic.
* Implement the statistical and probability functions synonymous with the advanced HP48 suite (linear regressions, standard deviations, distributions).

### Phase 6: Plotting, Notebook Editor, & Programmability
* Integrate `Plotly.js`.
* Link plotting tools directly to equations evaluated in existing Algebraic or CAS states.
* Build out the "Editor based block evaluations" notebook format.
* Implement robust macros and programmability systems, allowing users to save and recall complex functions analogous to HP48 directories.

---

## Next.js Development 

This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`.

### Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

### Deploy on GitHub Pages / Vercel

This application is configured via `.github/workflows/deploy.yml` and `next.config.ts` to statically export to GitHub Pages automatically on push to the `main` branch. 

Alternatively, the easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
