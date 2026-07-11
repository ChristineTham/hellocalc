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

describe("classic-era ops (HP-25/45/65/67 planes)", () => {
  it("R↑ is the inverse of R↓ (one full cycle restores the stack)", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4"); // T1 Z2 Y3 X4
    applyFunction(s, "R↑"); // X gets old T
    expect([s.t, s.z, s.y, xval(s)]).toEqual([2, 3, 4, 1]);
    applyFunction(s, "R↓");
    expect([s.t, s.z, s.y, xval(s)]).toEqual([1, 2, 3, 4]);
  });

  it("ABS / INT / FRAC (HP-25 g-plane reference: 3.7)", () => {
    const s = createRpn();
    run(s, "3.7", "CHS", "ABS");
    expect(xval(s)).toBeCloseTo(3.7, 12);
    applyFunction(s, "INT");
    expect(xval(s)).toBe(3);
    const s2 = createRpn();
    run(s2, "3.7", "FRAC");
    expect(xval(s2)).toBeCloseTo(0.7, 12);
  });

  it("x! = 120 for 5 (HP-45 n!); non-integers flag Error", () => {
    const s = createRpn();
    run(s, "5", "x!");
    expect(xval(s)).toBe(120);
    const s2 = createRpn();
    run(s2, "2.5", "x!");
    expect(s2.error).toBe("Error");
  });

  it("Δ%: from y=200 to x=250 is +25 (Y stays)", () => {
    const s = createRpn();
    run(s, "200", "ENTER", "250", "Δ%");
    expect(xval(s)).toBe(25);
    expect(s.y).toBe(200);
  });

  it("ˣ√y: cube root of 8 is 2 (HP-65 f⁻¹ of yˣ) — stack drops", () => {
    const s = createRpn();
    run(s, "8", "ENTER", "3", "ˣ√y");
    expect(xval(s)).toBeCloseTo(2, 12);
  });

  it("D→R / R→D convert degrees↔radians", () => {
    const s = createRpn();
    run(s, "180", "D→R");
    expect(xval(s)).toBeCloseTo(Math.PI, 12);
    applyFunction(s, "R→D");
    expect(xval(s)).toBeCloseTo(180, 12);
  });

  it("← backspaces the in-progress entry digit by digit, then behaves like CLx", () => {
    const s = createRpn();
    key(s, "123");
    applyFunction(s, "←");
    expect(xval(s)).toBe(12);
    applyFunction(s, "←");
    applyFunction(s, "←");
    expect(xval(s)).toBe(0);
    expect(s.entry).toBeNull();
    // no entry: clears X (like CLx), stack intact
    const s2 = createRpn();
    run(s2, "7", "ENTER", "9");
    applyFunction(s2, "ENTER");
    applyFunction(s2, "←");
    expect(s2.x).toBe(0);
    expect(s2.y).toBe(9);
  });

  it("DEG/RAD/GRD set the angle mode used by trig (sin 100 grads = 1)", () => {
    const s = createRpn();
    applyFunction(s, "RAD");
    expect(s.angle).toBe("RAD");
    run(s, "90", "SIN");
    expect(xval(s)).toBeCloseTo(Math.sin(90), 12);
    const s2 = createRpn();
    applyFunction(s2, "GRD");
    run(s2, "100", "SIN");
    expect(xval(s2)).toBeCloseTo(1, 12);
  });
});
