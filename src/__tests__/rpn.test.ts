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

describe("Phase-2: registers, statistics, conversions (HP-45)", () => {
  it("STO n / RCL n round-trip through R1–R9; RCL lifts", () => {
    const s = createRpn();
    run(s, "7", "STO n", "1", "CLx");
    expect(n(xval(s))).toBe(0);
    run(s, "3", "ENTER", "RCL n", "1");
    expect(n(s.x)).toBe(7);
    expect(n(s.y)).toBe(3);
  });

  it("register arithmetic: 5 STO + 1 adds into R1 in place", () => {
    const s = createRpn();
    run(s, "10", "STO n", "1"); // R1 = 10
    run(s, "5", "STO n", "+", "1"); // R1 += 5
    run(s, "RCL n", "1");
    expect(n(s.x)).toBe(15);
  });

  it("a non-argument key cancels the pending state and runs normally", () => {
    const s = createRpn();
    run(s, "5", "STO n", "ENTER"); // STO abandoned; ENTER just enters
    expect(s.pending).toBeNull();
    expect(n(s.y)).toBe(5);
    run(s, "2"); // 2 keys as a NUMBER (not a register argument)
    expect(n(xval(s))).toBe(2);
  });

  it("descriptive statistics: 2,4,6 via Σ+ → x̄ = 4, s = 2 (HP-45 reference)", () => {
    const s = createRpn();
    run(s, "2", "Σ+", "4", "Σ+", "6", "Σ+");
    expect(n(xval(s))).toBe(3); // Σ+ leaves n in X
    applyFunction(s, "x̄");
    expect(n(xval(s))).toBe(4);
    applyFunction(s, "s");
    expect(n(xval(s))).toBe(2);
  });

  it("x̄,s (the 45's one key): mean to X, std dev to Y; Σ− removes a sample", () => {
    const s = createRpn();
    run(s, "2", "Σ+", "4", "Σ+", "6", "Σ+", "9", "Σ+");
    run(s, "9", "Σ−"); // withdraw the bad sample
    applyFunction(s, "x̄,s");
    expect(n(s.x)).toBe(4);
    expect(n(s.y)).toBe(2);
  });

  it("Σ+ disables stack lift (the next number overwrites n)", () => {
    const s = createRpn();
    run(s, "2", "Σ+", "5");
    expect(n(xval(s))).toBe(5);
    expect(n(s.y)).not.toBe(1); // the n=1 was overwritten, not lifted
  });

  it("→P: 3 ENTER 4 →P gives r=5, θ=atan2(3,4) in DEG (HP-45 reference)", () => {
    const s = createRpn();
    run(s, "3", "ENTER", "4", "→P");
    expect(n(s.x)).toBeCloseTo(5, 12);
    expect(n(s.y)).toBeCloseTo(36.86989764584402, 10);
    applyFunction(s, "→R"); // and back
    expect(n(s.x)).toBeCloseTo(4, 12);
    expect(n(s.y)).toBeCloseTo(3, 12);
  });

  it("→D.MS / D.MS→: 30.5° ⇄ 30°30′00″ exactly", () => {
    const s = createRpn();
    run(s, "30.5", "→D.MS");
    expect(xval(s).toString()).toBe("30.3");
    applyFunction(s, "D.MS→");
    expect(xval(s).toString()).toBe("30.5");
  });

  it("metric constants push exactly and lift (never auto-convert)", () => {
    const s = createRpn();
    run(s, "100", "ENTER", "cm/in");
    expect(xval(s).toString()).toBe("2.54");
    expect(n(s.y)).toBe(100); // ÷ then gives inches
    applyFunction(s, "÷");
    expect(n(s.x)).toBeCloseTo(39.3700787, 6);
  });

  it("CLEAR (HP-45 gold) wipes stack + registers + Σ, keeps M", () => {
    const s = createRpn();
    run(s, "9", "STO"); // M = 9 (the 35's plain STO)
    run(s, "7", "STO n", "2", "4", "Σ+", "CLEAR");
    expect(n(s.regs[2])).toBe(0);
    expect(n(s.sum.n)).toBe(0);
    expect(n(s.x)).toBe(0);
    expect(n(s.mem)).toBe(9);
  });

  it("FIX/SCI consume a following digit as the digit count", () => {
    const s = createRpn();
    run(s, "FIX", "4");
    expect(s.disp).toEqual({ mode: "FIX", digits: 4 });
    expect(s.entry).toBeNull(); // the 4 was an argument, not entry
    run(s, "SCI", "1");
    expect(s.disp).toEqual({ mode: "SCI", digits: 1 });
    run(s, "ENG", "3");
    expect(s.disp).toEqual({ mode: "ENG", digits: 3 }); // HP-25
  });

  it("the tape prints argument sequences composed: STO + 1, FIX 4", () => {
    const s = createRpn();
    dispatch(s, "5");
    dispatch(s, "STO n");
    dispatch(s, "+");
    dispatch(s, "1");
    dispatch(s, "FIX");
    dispatch(s, "4");
    expect(s.hist.map((h) => h.op)).toEqual(["STO + 1", "FIX 4"]);
  });
});

describe("Phase-3: keystroke programmability (HP-65)", () => {
  /** Record a program through the real recorder (dispatch in PRGM mode). */
  function record(s: RpnEngine, ...keys: string[]) {
    dispatch(s, "W/PRGM");
    for (const k of keys) dispatch(s, k);
    dispatch(s, "W/PRGM");
  }

  it("records keystrokes as steps and plays them back: LBL A 2 × RTN", () => {
    const s = createRpn();
    record(s, "LBL", "A", "2", "×", "RTN");
    expect(s.prgm.steps).toEqual(["LBL", "A", "2", "×", "RTN"]);
    run(s, "6", "ENTER");
    applyFunction(s, "A"); // user key runs from LBL A
    expect(n(s.x)).toBe(12);
    applyFunction(s, "A"); // and again — programs are reusable
    expect(n(s.x)).toBe(24);
  });

  it("R/S runs from the top; a stored R/S pauses and resumes", () => {
    const s = createRpn();
    record(s, "3", "×", "R/S", "2", "+");
    run(s, "5", "ENTER");
    applyFunction(s, "R/S"); // runs 5×3, pauses at the stored R/S
    expect(n(s.x)).toBe(15);
    applyFunction(s, "R/S"); // resumes: +2
    expect(n(s.x)).toBe(17);
  });

  it("conditionals skip the next instruction (argument included) on false", () => {
    const s = createRpn();
    // if x=y double, else… GTO 1 is SKIPPED (2 slots) when the test fails
    record(s, "x=y", "GTO", "1", "9", "9", "R/S", "LBL", "1", "2", "×", "RTN");
    run(s, "4", "ENTER", "4"); // x=y true → jumps to LBL 1 → ×2
    applyFunction(s, "R/S");
    expect(n(s.x)).toBe(8);
    const s2 = createRpn();
    s2.prgm = {
      ...s.prgm,
      steps: [...s.prgm.steps],
      pc: 0,
      mode: "RUN",
      flags: [false, false, false, false],
      ret: [],
    };
    run(s2, "4", "ENTER", "5"); // false → skips GTO 1, keys 99, halts at R/S
    applyFunction(s2, "R/S");
    expect(n(xval(s2))).toBe(99);
  });

  it("flags: SF 2 set → TF 2 passes; clear flag → skips", () => {
    const s = createRpn();
    record(s, "TF 2", "GTO", "1", "0", "R/S", "LBL", "1", "1", "R/S");
    applyFunction(s, "SF 2");
    applyFunction(s, "R/S");
    expect(n(xval(s))).toBe(1); // flag set → took the branch
  });

  it("DSZ decrements R8 and loops until zero (GTO loop with an exit)", () => {
    const s = createRpn();
    record(s, "LBL", "A", "2", "×", "DSZ", "GTO", "A", "RTN");
    run(s, "3", "STO n", "8"); // loop 3 times
    run(s, "1", "ENTER");
    applyFunction(s, "A");
    expect(n(s.x)).toBe(8); // 1×2×2×2
  });

  it("a GTO loop with no exit halts on the op budget with Error (NFR-9)", () => {
    const s = createRpn();
    record(s, "LBL", "A", "1", "+", "GTO", "A");
    applyFunction(s, "A");
    expect(s.error).toBe("Error"); // runaway stopped, UI thread never hangs
  });

  it("PRGM-mode edits: SST/BST move the cursor, DEL removes a step", () => {
    const s = createRpn();
    dispatch(s, "W/PRGM");
    for (const k of ["1", "2", "+"]) dispatch(s, k);
    dispatch(s, "BST"); // cursor before "+"
    dispatch(s, "DEL"); // deletes "2"
    dispatch(s, "W/PRGM");
    expect(s.prgm.steps).toEqual(["1", "+"]);
  });

  it("CLEAR PRGM empties the program; CLEAR STK / CLEAR REG scope correctly", () => {
    const s = createRpn();
    record(s, "1", "+");
    run(s, "7", "STO n", "3", "ENTER");
    applyFunction(s, "CLEAR PRGM");
    expect(s.prgm.steps).toEqual([]);
    expect(n(s.regs[3])).toBe(7); // registers untouched
    applyFunction(s, "CLEAR REG");
    expect(n(s.regs[3])).toBe(0);
    expect(n(s.y)).toBe(7); // stack untouched by CLEAR REG
    applyFunction(s, "CLEAR STK");
    expect(n(s.y)).toBe(0);
  });

  it("DSP n sets display digits without changing the mode", () => {
    const s = createRpn();
    run(s, "DSP", "4");
    expect(s.disp).toEqual({ mode: "FIX", digits: 4 });
  });

  it("→OCT / OCT→ integer base views: 8 → 10 and back; 9 in octal is Error", () => {
    const s = createRpn();
    run(s, "8", "→OCT");
    expect(xval(s).toString()).toBe("10");
    applyFunction(s, "OCT→");
    expect(xval(s).toString()).toBe("8");
    const s2 = createRpn();
    run(s2, "9", "OCT→");
    expect(s2.error).toBe("Error");
  });

  it("D.MS+ adds in degrees-minutes-seconds space: 1.45 + 0.30 = 2.15", () => {
    const s = createRpn();
    run(s, "1.45", "ENTER", "0.30", "D.MS+"); // 1°45′ + 0°30′ = 2°15′
    expect(xval(s).toString()).toBe("2.15");
  });

  it("programs persist through the state codec", () => {
    const s = createRpn();
    record(s, "LBL", "A", "2", "×", "RTN");
    // round-trip through JSON via the persistence test path is covered in
    // persistence.test.ts; here assert the engine fields are plain data
    expect(JSON.parse(JSON.stringify(s.prgm))).toEqual(s.prgm);
  });
});

describe("Phase-5: subroutines, indirect I, secondary regs, printing (67/97)", () => {
  function record(s: RpnEngine, ...keys: string[]) {
    dispatch(s, "W/PRGM");
    for (const k of keys) dispatch(s, k);
    dispatch(s, "W/PRGM");
  }

  it("GSB calls a subroutine; RTN returns to the caller", () => {
    const s = createRpn();
    // main: LBL A → GSB B → +1 → R/S · sub B: ×2 → RTN
    record(s, "LBL", "A", "GSB", "B", "1", "+", "R/S", "LBL", "B", "2", "×", "RTN");
    run(s, "5", "ENTER");
    applyFunction(s, "A");
    expect(n(s.x)).toBe(11); // (5×2)+1 — RTN came BACK instead of stopping
  });

  it("keyboard GSB runs a labelled routine directly", () => {
    const s = createRpn();
    record(s, "LBL", "3", "9", "×", "RTN");
    run(s, "2", "ENTER", "GSB", "3");
    expect(n(s.x)).toBe(18);
  });

  it("ST I / RC I / x⇄I manage the index register; (i) addresses through it", () => {
    const s = createRpn();
    run(s, "4", "ST I", "CLx"); // I = 4
    run(s, "7", "STO n", "(i)"); // R[I]=R4 ← 7
    run(s, "RCL n", "4");
    expect(n(s.x)).toBe(7);
    run(s, "9", "x⇄I");
    expect(n(xval(s))).toBe(4); // old I into X…
    applyFunction(s, "RC I");
    expect(n(s.x)).toBe(9); // …new I is 9
  });

  it("DSZ I / ISZ I count on I; DSZ (i) counts the register I points at", () => {
    const s = createRpn();
    run(s, "2", "ST I");
    applyFunction(s, "DSZ I");
    applyFunction(s, "RC I");
    expect(n(s.x)).toBe(1);
    run(s, "3", "ST I", "CLx", "5", "STO n", "3");
    applyFunction(s, "DSZ (i)"); // R3 -= 1
    run(s, "RCL n", "3");
    expect(n(s.x)).toBe(4);
  });

  it("SF/CF/F? use four flags; F? in a program skips on clear", () => {
    const s = createRpn();
    record(s, "F?", "3", "GTO", "1", "0", "R/S", "LBL", "1", "1", "R/S");
    run(s, "SF", "3");
    applyFunction(s, "R/S");
    expect(n(xval(s))).toBe(1);
    const s2 = createRpn();
    s2.prgm = { ...s.prgm, steps: [...s.prgm.steps], pc: 0, mode: "RUN", flags: [false, false, false, false], ret: [] };
    applyFunction(s2, "R/S");
    expect(n(xval(s2))).toBe(0); // flag clear → skipped the branch
  });

  it("P⇄S swaps the primary and secondary register files", () => {
    const s = createRpn();
    run(s, "7", "STO n", "2", "P⇄S");
    run(s, "RCL n", "2");
    expect(n(s.x)).toBe(0); // secondary file is empty
    applyFunction(s, "P⇄S");
    run(s, "RCL n", "2");
    expect(n(s.x)).toBe(7); // primaries back
  });

  it("RND rounds X to the displayed value", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "3", "÷"); // 0.666…
    applyFunction(s, "RND");
    expect(xval(s).toString()).toBe("0.67"); // FIX 2
  });

  it("PRINT x / PRINT STACK / PRINT SPACE print onto the history tape", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2", "ENTER", "3", "ENTER", "4");
    applyFunction(s, "PRINT x");
    applyFunction(s, "PRINT STACK");
    applyFunction(s, "PRINT SPACE");
    const ops = s.hist.map((h) => h.op);
    expect(ops).toContain("🖨 x");
    expect(ops.filter((o) => o.startsWith("🖨"))).toHaveLength(5); // x + T/Z/Y/X
    expect(ops[ops.length - 1]).toBe("⋯");
  });

  it("the 97's lowercase labels run too: LBL a", () => {
    const s = createRpn();
    record(s, "LBL", "a", "3", "×", "RTN");
    run(s, "3", "ENTER");
    applyFunction(s, "a");
    expect(n(s.x)).toBe(9);
  });
});

describe("Phase-6: ALPHA, XEQ-by-name, USER assignments (HP-41)", () => {
  it("α ids type into the alpha register; CL x/A clears it before X", () => {
    const s = createRpn();
    for (const c of "SIN") applyFunction(s, `α${c}`);
    expect(s.alpha).toBe("SIN");
    applyFunction(s, "CL x/A");
    expect(s.alpha).toBe("");
    run(s, "5", "ENTER");
    applyFunction(s, "CL x/A"); // alpha empty → behaves like CLx
    expect(n(s.x)).toBe(0);
  });

  it("XEQ executes the typed NAME through the id space: XEQ SIN, XEQ x!", () => {
    const s = createRpn();
    run(s, "30", "ENTER");
    for (const c of "SIN") applyFunction(s, `α${c}`);
    applyFunction(s, "XEQ");
    expect(n(xval(s))).toBeCloseTo(0.5, 12);
    const s2 = createRpn();
    run(s2, "5", "ENTER");
    for (const c of "X!") applyFunction(s2, `α${c}`);
    // names normalize like prints? ids are exact — use the engine id
    s2.alpha = "x!";
    applyFunction(s2, "XEQ");
    expect(n(xval(s2))).toBe(120);
  });

  it("XEQ of an unknown name flags NONEXISTENT (the 41's message)", () => {
    const s = createRpn();
    s.alpha = "FROBNICATE";
    applyFunction(s, "XEQ");
    expect(s.error).toBe("NONEXISTENT");
  });

  it("XEQ runs a program label typed in alpha", () => {
    const s = createRpn();
    dispatch(s, "W/PRGM");
    for (const k of ["LBL", "A", "2", "×", "RTN"]) dispatch(s, k);
    dispatch(s, "W/PRGM");
    run(s, "6", "ENTER");
    s.alpha = "A";
    applyFunction(s, "XEQ");
    expect(n(s.x)).toBe(12);
  });

  it("ASN + USER: an assigned key executes its name; USER off restores it", () => {
    const s = createRpn();
    s.alpha = "x!";
    applyFunction(s, "ASN"); // pending: next key takes the assignment
    dispatch(s, "1/x"); // assign x! onto the 1/x key
    dispatch(s, "USER");
    run(s, "5", "ENTER");
    dispatch(s, "1/x"); // USER mode → runs x!
    expect(n(s.x)).toBe(120);
    dispatch(s, "USER");
    dispatch(s, "1/x"); // normal again
    expect(n(s.x)).toBeCloseTo(1 / 120, 12);
  });

  it("ISG counts with the iiiii.fffcc encoding and skips past the target", () => {
    const s = createRpn();
    // R1 = 0.00302: loop to 3 by steps of 2 → 2.00302, 4.00302(skip)
    dispatch(s, "W/PRGM");
    for (const k of ["LBL", "A", "ISG", "1", "GTO", "A", "RTN"]) dispatch(s, k);
    dispatch(s, "W/PRGM");
    run(s, "0.00302", "STO n", "1");
    applyFunction(s, "A");
    expect(s.regs[1].toFixed(5)).toBe("4.00302");
    expect(s.error).toBeNull(); // the loop exited by ISG, not the budget
  });

  it("VIEW n prints the register to the tape; CLΣ clears only Σ", () => {
    const s = createRpn();
    run(s, "7", "STO n", "3", "4", "Σ+");
    dispatch(s, "VIEW");
    dispatch(s, "3");
    expect(s.hist.some((h) => h.op === "🖨 R3" && h.raw === "7")).toBe(true);
    applyFunction(s, "CLΣ");
    expect(n(s.sum.n)).toBe(0);
    expect(n(s.regs[3])).toBe(7);
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
