---
name: cas-latex-renderer
description: Workflow for bridging Nerdamer symbolic CAS outputs into beautiful React KaTeX renders
---

# Symbolic Math Typesetting with KaTeX

When the user is in Algebraic or Symbolic modes, raw mathematical output from engines like `Nerdamer` or `Math.js` is unreadable natively in HTML. You must convert these outputs to LaTeX and render them safely.

## Workflow

### 1. Perform Calculation
Calculate the symbolic string natively.
```javascript
import nerdamer from "nerdamer";
require("nerdamer/Algebra"); // if solving equations

// Example symbolic evaluation
const result = nerdamer('expand((x+y)^2)'); 
```

### 2. Format to LaTeX
Both `nerdamer` and `math.js` have `.toTeX()` capabilities.
```javascript
const latexString = result.toTeX();
```

### 3. Render in React Component
Import `react-katex` to safely typeset without manually injecting inner HTML, avoiding XSS threats and styling issues.

```tsx
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

export const DisplayEquation = ({ latexString }) => {
  return (
    <div className="math-display-container">
      <BlockMath math={latexString} />
    </div>
  );
};
```
