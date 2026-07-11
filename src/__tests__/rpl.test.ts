import { describe, it, expect } from "vitest";
import {
  createRpl,
  applyRplFunction,
  dispatchRpl,
  inputDigit,
  push,
  type RplEngine,
} from "@/lib/engine/rpl";
import { bn, num, type Value } from "@/lib/engine/config";

/** Down-convert the stack for numeric assertions. */
const nums = (stack: Value[]) => stack.map((v) => num(v));

function run(s: RplEngine, ...toks: string[]) {
  for (const t of toks) {
    if (t.length > 1 && /^\d+\.?\d*$/.test(t)) for (const d of t) inputDigit(s, d);
    else applyRplFunction(s, t);
  }
}

describe("RPL dynamic-stack engine (BigNumber tower)", () => {
  it("ENTER pushes the entry to level 1: 2 ENTER 3 gives stack [2,3]", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3");
    // 3 is still an entry until committed; commit via a no-op op
    applyRplFunction(s, "DUP");
    expect(nums(s.stack.slice(-3))).toEqual([2, 3, 3]);
  });

  it("adds across the dynamic stack: 2 ENTER 3 + = 5", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3", "+");
    expect(nums(s.stack)).toEqual([5]);
  });

  it("0.1 ENTER 0.2 + is EXACTLY 0.3 on the tower", () => {
    const s = createRpl();
    run(s, "0.1", "ENTER", "0.2", "+");
    expect(s.stack[0].toString()).toBe("0.3");
  });

  it("grows without a fixed depth: push 6 numbers", () => {
    const s = createRpl();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4", "ENTER", "5", "ENTER", "6", "ENTER");
    expect(nums(s.stack)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("DUP / SWAP / DROP / CLEAR", () => {
    const s = createRpl();
    run(s, "1", "ENTER", "2", "ENTER"); // [1,2]
    applyRplFunction(s, "DUP");
    expect(nums(s.stack)).toEqual([1, 2, 2]);
    applyRplFunction(s, "SWAP"); // no change on equal tops, use distinct
    run(s, "9", "SWAP"); // [1,2,2,9] -> swap -> [1,2,9,2]
    expect(nums(s.stack)).toEqual([1, 2, 9, 2]);
    applyRplFunction(s, "DROP");
    expect(nums(s.stack)).toEqual([1, 2, 9]);
    applyRplFunction(s, "CLEAR");
    expect(s.stack).toEqual([]);
  });

  it("ENTER with no entry DUPs the top", () => {
    const s = createRpl();
    run(s, "7", "ENTER", "ENTER");
    expect(nums(s.stack)).toEqual([7, 7]);
  });

  it("flags too-few-arguments instead of crashing", () => {
    const s = createRpl();
    run(s, "5", "+");
    expect(s.error).toBe("Too Few Arguments");
  });

  it("unary √x on the top only", () => {
    const s = createRpl();
    run(s, "3", "ENTER", "9", "√x");
    expect(nums(s.stack)).toEqual([3, 3]);
  });

  it("returns false for unimplemented commands (e.g. PLOT)", () => {
    const s = createRpl();
    expect(applyRplFunction(s, "PLOT")).toBe(false);
  });

  it("ˣ√y: 8 ENTER 3 XROOT = 2 (49G/50g right-shift of √x)", () => {
    const s = createRpl();
    run(s, "8", "ENTER", "3", "ˣ√y");
    expect(s.stack).toHaveLength(1);
    expect(num(s.stack[0])).toBeCloseTo(2, 12);
  });

  it("ABS on the top only", () => {
    const s = createRpl();
    run(s, "5", "+/−", "ABS");
    expect(nums(s.stack)).toEqual([5]);
  });
});

describe("Phase-1 additions: EEX, history, recall push", () => {
  it("EEX keys an exponent: 5 EEX 3 ENTER = 5000", () => {
    const s = createRpl();
    run(s, "5", "EEX", "3", "ENTER");
    expect(nums(s.stack)).toEqual([5000]);
  });

  it("dispatchRpl records committed commands with exact raw values", () => {
    const s = createRpl();
    dispatchRpl(s, "2");
    dispatchRpl(s, "ENTER");
    dispatchRpl(s, "3");
    dispatchRpl(s, "+");
    expect(s.hist.map((h) => h.op)).toEqual(["ENTER", "+"]);
    expect(s.hist[1].raw).toBe("5");
  });

  it("push (history recall) commits any entry first, then pushes", () => {
    const s = createRpl();
    run(s, "7");
    push(s, bn("0.3"));
    expect(s.stack.map((v) => v.toString())).toEqual(["7", "0.3"]);
  });
});
