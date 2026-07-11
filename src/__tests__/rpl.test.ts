import { describe, it, expect } from "vitest";
import {
  createRpl,
  applyRplFunction,
  inputDigit,
  type RplEngine,
} from "@/lib/engine/rpl";

function run(s: RplEngine, ...toks: string[]) {
  for (const t of toks) {
    if (t.length > 1 && /^\d+\.?\d*$/.test(t)) for (const d of t) inputDigit(s, d);
    else applyRplFunction(s, t);
  }
}

describe("RPL dynamic-stack engine", () => {
  it("ENTER pushes the entry to level 1: 2 ENTER 3 gives stack [2,3]", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3");
    // 3 is still an entry until committed; commit via a no-op op
    applyRplFunction(s, "DUP");
    expect(s.stack.slice(-3)).toEqual([2, 3, 3]);
  });

  it("adds across the dynamic stack: 2 ENTER 3 + = 5", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3", "+");
    expect(s.stack).toEqual([5]);
  });

  it("grows without a fixed depth: push 6 numbers", () => {
    const s = createRpl();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4", "ENTER", "5", "ENTER", "6", "ENTER");
    expect(s.stack).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("DUP / SWAP / DROP / CLEAR", () => {
    const s = createRpl();
    run(s, "1", "ENTER", "2", "ENTER"); // [1,2]
    applyRplFunction(s, "DUP");
    expect(s.stack).toEqual([1, 2, 2]);
    applyRplFunction(s, "SWAP"); // no change on equal tops, use distinct
    run(s, "9", "SWAP"); // [1,2,2,9] -> swap -> [1,2,9,2]
    expect(s.stack).toEqual([1, 2, 9, 2]);
    applyRplFunction(s, "DROP");
    expect(s.stack).toEqual([1, 2, 9]);
    applyRplFunction(s, "CLEAR");
    expect(s.stack).toEqual([]);
  });

  it("ENTER with no entry DUPs the top", () => {
    const s = createRpl();
    run(s, "7", "ENTER", "ENTER");
    expect(s.stack).toEqual([7, 7]);
  });

  it("flags too-few-arguments instead of crashing", () => {
    const s = createRpl();
    run(s, "5", "+");
    expect(s.error).toBe("Too Few Arguments");
  });

  it("unary √x on the top only", () => {
    const s = createRpl();
    run(s, "3", "ENTER", "9", "√x");
    expect(s.stack).toEqual([3, 3]);
  });

  it("returns false for unimplemented commands (e.g. PLOT)", () => {
    const s = createRpl();
    expect(applyRplFunction(s, "PLOT")).toBe(false);
  });

  it("\u02e3\u221ay: 8 ENTER 3 XROOT = 2 (49G/50g right-shift of \u221ax)", () => {
    const s = createRpl();
    run(s, "8", "ENTER", "3", "\u02e3\u221ay");
    expect(s.stack).toHaveLength(1);
    expect(s.stack[0]).toBeCloseTo(2, 12);
  });

  it("ABS on the top only", () => {
    const s = createRpl();
    run(s, "5", "+/\u2212", "ABS");
    expect(s.stack).toEqual([5]);
  });
});
