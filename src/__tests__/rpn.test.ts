import { describe, it, expect } from "vitest";
import {
  createRpn,
  applyFunction,
  dispatch,
  inputDigit,
  pushX,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";
import { bn, num, type Value } from "@/lib/engine/config";

/** Down-convert for numeric assertions (display never does this). */
const n = (v: Value) => num(v);

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

describe("RPN stack engine (BigNumber tower)", () => {
  it("adds: 2 ENTER 3 + = 5", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "3", "+");
    expect(n(s.x)).toBe(5);
  });

  it("0.1 ENTER 0.2 + is EXACTLY 0.3 (the reason the tower exists)", () => {
    const s = createRpn();
    run(s, "0.1", "ENTER", "0.2", "+");
    expect(xval(s).toString()).toBe("0.3");
  });

  it("chains without ENTER between op and next number: 2 ENTER 3 + 4 × = 20", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "3", "+", "4", "×");
    expect(n(s.x)).toBe(20);
  });

  it("ENTER disables stack lift: 5 ENTER 2 keys 2 into X (not a lift to 52)", () => {
    const s = createRpn();
    run(s, "5", "ENTER", "2");
    expect(n(xval(s))).toBe(2);
    expect(n(s.y)).toBe(5);
  });

  it("lift is enabled after an operation: 3 ENTER 4 + 5 lifts", () => {
    const s = createRpn();
    run(s, "3", "ENTER", "4", "+"); // X=7
    inputDigit(s, "5"); // new number lifts 7 into Y
    expect(n(xval(s))).toBe(5);
    expect(n(s.y)).toBe(7);
  });

  it("binary op duplicates T on drop: fill stack then add", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4"); // T=1 Z=2 Y=3 X=4
    expect([s.t, s.z, s.y, xval(s)].map(n)).toEqual([1, 2, 3, 4]);
    applyFunction(s, "+"); // X=7, Y=2, Z=1, T=1 (T duplicated)
    expect([s.t, s.z, s.y, s.x].map(n)).toEqual([1, 1, 2, 7]);
  });

  it("LAST X recalls the pre-operation X: 5 ENTER 2 − LSTx = 2", () => {
    const s = createRpn();
    run(s, "5", "ENTER", "2", "−"); // X=3, lastX=2
    expect(n(s.x)).toBe(3);
    applyFunction(s, "LSTx");
    expect(n(s.x)).toBe(2);
    expect(n(s.y)).toBe(3); // 3 lifted into Y
  });

  it("CHS negates entry then value", () => {
    const s = createRpn();
    key(s, "42");
    applyFunction(s, "CHS");
    expect(n(xval(s))).toBe(-42);
  });

  it("30 sin (DEG) = 0.5 — HP-35 reference", () => {
    const s = createRpn();
    run(s, "30", "SIN");
    expect(n(xval(s))).toBeCloseTo(0.5, 12);
  });

  it("unary √x does not drop the stack", () => {
    const s = createRpn();
    run(s, "3", "ENTER", "9"); // Y=3 X=9
    applyFunction(s, "√x"); // X=3
    expect(n(s.x)).toBe(3);
    expect(n(s.y)).toBe(3);
  });

  it("division by zero flags an error; √ of a negative flags an error", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "0", "÷");
    expect(s.error).toBe("Error");
    const s2 = createRpn();
    run(s2, "4", "CHS", "√x");
    expect(s2.error).toBe("Error");
  });

  it("returns false for unimplemented functions (e.g. financial NPV)", () => {
    const s = createRpn();
    expect(applyFunction(s, "NPV")).toBe(false);
  });

  it("x% of y: 200 ENTER 10 % = 20 (Y stays 200)", () => {
    const s = createRpn();
    run(s, "200", "ENTER", "10", "%");
    expect(n(s.x)).toBe(20);
    expect(n(s.y)).toBe(200);
  });
});

describe("Phase-1 additions: EEX, STO/RCL, FIX/SCI, history", () => {
  it("EEX keys a real exponent: 5 EEX 3 = 5000", () => {
    const s = createRpn();
    run(s, "5", "EEX", "3", "ENTER");
    expect(n(s.x)).toBe(5000);
  });

  it("EEX with nothing keyed means 1×10^x: EEX 2 = 100", () => {
    const s = createRpn();
    run(s, "EEX", "2", "ENTER");
    expect(n(s.x)).toBe(100);
  });

  it("CHS during exponent entry negates the EXPONENT: 5 EEX 3 CHS = 0.005", () => {
    const s = createRpn();
    run(s, "5", "EEX", "3", "CHS", "ENTER");
    expect(xval(s).toString()).toBe("0.005");
  });

  it("a third exponent digit shifts left (2-digit field): 1 EEX 1 2 3 = 1e23", () => {
    const s = createRpn();
    run(s, "1", "EEX", "1", "2", "3", "ENTER");
    expect(xval(s).toString()).toBe("1e+23");
  });

  it("STO stores X to memory; RCL lifts it back (HP-35 single register)", () => {
    const s = createRpn();
    run(s, "7", "STO", "CLx");
    expect(n(xval(s))).toBe(0);
    applyFunction(s, "RCL");
    expect(n(xval(s))).toBe(7);
    // RCL lifts: keyed 3 first, RCL pushes 3 into Y
    const s2 = createRpn();
    run(s2, "9", "STO", "CLx", "3", "ENTER", "RCL");
    expect(n(s2.x)).toBe(9);
    expect(n(s2.y)).toBe(3);
  });

  it("FIX/SCI flip the display mode in engine state", () => {
    const s = createRpn();
    expect(s.disp.mode).toBe("FIX");
    applyFunction(s, "SCI");
    expect(s.disp.mode).toBe("SCI");
    applyFunction(s, "FIX");
    expect(s.disp.mode).toBe("FIX");
  });

  it("dispatch records committed ops (with exact raw values), not digit entry", () => {
    const s = createRpn();
    dispatch(s, "1");
    dispatch(s, "0");
    expect(s.hist).toHaveLength(0); // digits are entry, not history
    dispatch(s, "ENTER");
    dispatch(s, "3");
    dispatch(s, "+");
    expect(s.hist.map((h) => h.op)).toEqual(["ENTER", "+"]);
    expect(s.hist[1].raw).toBe("13");
  });

  it("pushX (history recall) lifts the stack like a constant", () => {
    const s = createRpn();
    run(s, "5", "ENTER");
    pushX(s, bn("0.3"));
    expect(xval(s).toString()).toBe("0.3");
    expect(n(s.y)).toBe(5);
  });
});

describe("classic-era ops (HP-25/45/65/67 planes)", () => {
  it("R↑ is the inverse of R↓ (one full cycle restores the stack)", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4"); // T1 Z2 Y3 X4
    applyFunction(s, "R↑"); // X gets old T
    expect([s.t, s.z, s.y, xval(s)].map(n)).toEqual([2, 3, 4, 1]);
    applyFunction(s, "R↓");
    expect([s.t, s.z, s.y, xval(s)].map(n)).toEqual([1, 2, 3, 4]);
  });

  it("ABS / INT / FRAC are exact on the tower (3.7)", () => {
    const s = createRpn();
    run(s, "3.7", "CHS", "ABS");
    expect(xval(s).toString()).toBe("3.7");
    applyFunction(s, "INT");
    expect(xval(s).toString()).toBe("3");
    const s2 = createRpn();
    run(s2, "3.7", "FRAC");
    expect(xval(s2).toString()).toBe("0.7"); // no 0.7000000000000002 here
  });

  it("x! = 120 for 5 (HP-45 n!); non-integers flag Error", () => {
    const s = createRpn();
    run(s, "5", "x!");
    expect(n(xval(s))).toBe(120);
    const s2 = createRpn();
    run(s2, "2.5", "x!");
    expect(s2.error).toBe("Error");
  });

  it("Δ%: from y=200 to x=250 is +25 (Y stays)", () => {
    const s = createRpn();
    run(s, "200", "ENTER", "250", "Δ%");
    expect(n(xval(s))).toBe(25);
    expect(n(s.y)).toBe(200);
  });

  it("ˣ√y: cube root of 8 is 2 (HP-65 f⁻¹ of yˣ) — stack drops", () => {
    const s = createRpn();
    run(s, "8", "ENTER", "3", "ˣ√y");
    expect(n(xval(s))).toBeCloseTo(2, 12);
  });

  it("D→R / R→D convert degrees↔radians", () => {
    const s = createRpn();
    run(s, "180", "D→R");
    expect(n(xval(s))).toBeCloseTo(Math.PI, 12);
    applyFunction(s, "R→D");
    expect(n(xval(s))).toBeCloseTo(180, 12);
  });

  it("← backspaces the in-progress entry digit by digit, then behaves like CLx", () => {
    const s = createRpn();
    key(s, "123");
    applyFunction(s, "←");
    expect(n(xval(s))).toBe(12);
    applyFunction(s, "←");
    applyFunction(s, "←");
    expect(n(xval(s))).toBe(0);
    expect(s.entry).toBeNull();
    // no entry: clears X (like CLx), stack intact
    const s2 = createRpn();
    run(s2, "7", "ENTER", "9");
    applyFunction(s2, "ENTER");
    applyFunction(s2, "←");
    expect(n(s2.x)).toBe(0);
    expect(n(s2.y)).toBe(9);
  });

  it("DEG/RAD/GRD set the angle mode used by trig (sin 100 grads = 1)", () => {
    const s = createRpn();
    applyFunction(s, "RAD");
    expect(s.angle).toBe("RAD");
    run(s, "90", "SIN");
    expect(n(xval(s))).toBeCloseTo(Math.sin(90), 12);
    const s2 = createRpn();
    applyFunction(s2, "GRD");
    run(s2, "100", "SIN");
    expect(n(xval(s2))).toBeCloseTo(1, 12);
  });
});
