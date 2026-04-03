---
name: rpn-stack-logic
description: Guidelines on implementing an RPN LIFO stack architecture utilizing React state and Math.js BigNumbers
---

# Implementing RPN Stack Logic in React

When building an RPN (Reverse Polish Notation) mode, you must manage a Last-In, First-Out (LIFO) stack representing the user's operands.

## State Structure
Maintain the stack as an array of numerical strings or `math.js` BigNumber objects in React State.

```typescript
const [stack, setStack] = useState<math.BigNumber[]>([]);
const [currentInput, setCurrentInput] = useState<string>("");
```

## Operation Flow

### 1. Pushing to the Stack ('Enter' Key)
When the user commits a number:
1. Parse the string into a high-precision decimal.
2. Unshift/push it into the stack array.
3. Clear the current input.

### 2. Executing Operations (e.g., '+', '*', 'sin')
Operators trigger stack mutations:
1. **Binary Operators (+, -, *, /)**: Pop the top two items. Provide them to the `math.js` evaluate engine. Push the result back on top.
2. **Unary Operators (sin, cos, sqrt)**: Pop the top one item. Evaluate. Push the result back iteratively.

### Handling Unit Operations
For dimensional analysis (e.g., converting cm to inches in RPN), ensure the type stored in the stack resolves safely between `math.Unit` and standard scalar big numbers.
