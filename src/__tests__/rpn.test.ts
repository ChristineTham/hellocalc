import { describe, it, expect } from "vitest";
import {
  createRpn,
  applyFunction,
  inputDigit,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";

/** Key a multi-digit number via inputDigit. */
function key(s: RpnEngine, digits: string) {
  for (const d of digits) inputDigit(s, d);
}
/**
 * Run a sequence of tokens: a multi-digit numeric literal is keyed digit by
 * digit; anything else is dispatched as a function id.
 */
function run(s: RpnEngine, ...toks: string[]) {
  for (const t of toks) {
    if (t.length > 1 && /^\d+\.?\d*$/.test(t)) key(s, t);
    else applyFunction(s, t);
  }
}

describe("RPN stack engine", () => {
  it("adds: 2 ENTER 3 + = 5", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "3", "+");
    expect(s.x).toBe(5);
  });

  it("chains without ENTER between op and next number: 2 ENTER 3 + 4 × = 20", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "3", "+", "4", "×");
    expect(s.x).toBe(20);
  });

  it("ENTER disables stack lift: 5 ENTER 2 keys 2 into X (not a lift to 52)", () => {
    const s = createRpn();
    run(s, "5", "ENTER", "2");
    expect(xval(s)).toBe(2);
    expect(s.y).toBe(5);
  });

  it("lift is enabled after an operation: 3 ENTER 4 + 5 lifts", () => {
    const s = createRpn();
    run(s, "3", "ENTER", "4", "+"); // X=7
    inputDigit(s, "5"); // new number lifts 7 into Y
    expect(xval(s)).toBe(5);
    expect(s.y).toBe(7);
  });

  it("binary op duplicates T on drop: fill stack then add", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4"); // T=1 Z=2 Y=3 X=4
    expect([s.t, s.z, s.y, xval(s)]).toEqual([1, 2, 3, 4]);
    applyFunction(s, "+"); // X=7, Y=2, Z=1, T=1 (T duplicated)
    expect([s.t, s.z, s.y, s.x]).toEqual([1, 1, 2, 7]);
  });

  it("LAST X recalls the pre-operation X: 5 ENTER 2 − LSTx = 2", () => {
    const s = createRpn();
    run(s, "5", "ENTER", "2", "−"); // X=3, lastX=2
    expect(s.x).toBe(3);
    applyFunction(s, "LSTx");
    expect(s.x).toBe(2);
    expect(s.y).toBe(3); // 3 lifted into Y
  });

  it("CHS negates entry then value", () => {
    const s = createRpn();
    key(s, "42");
    applyFunction(s, "CHS");
    expect(xval(s)).toBe(-42);
  });

  it("unary √x does not drop the stack", () => {
    const s = createRpn();
    run(s, "3", "ENTER", "9"); // Y=3 X=9
    applyFunction(s, "√x"); // X=3
    expect(s.x).toBe(3);
    expect(s.y).toBe(3);
  });

  it("division by zero flags an error", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "0", "÷");
    expect(s.error).toBe("Error");
  });

  it("returns false for unimplemented functions (e.g. financial NPV)", () => {
    const s = createRpn();
    expect(applyFunction(s, "NPV")).toBe(false);
  });

  it("x% of y: 200 ENTER 10 % = 20 (Y stays 200)", () => {
    const s = createRpn();
    run(s, "200", "ENTER", "10", "%");
    expect(s.x).toBe(20);
    expect(s.y).toBe(200);
  });
});
