import { describe, it, expect } from "vitest";
import {
  createRpn,
  applyFunction,
  dispatch,
  inputDigit,
  menu42Labels,
  pressSoft42,
  pushX,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";
import { bn, num, type Value } from "@/lib/engine/config";
import { intFormat } from "@/lib/engine/integer";

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

  it("returns false for unimplemented functions (e.g. RPL's →LIST)", () => {
    const s = createRpn();
    expect(applyFunction(s, "→LIST")).toBe(false);
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

describe("Phase-7: the 12C finance engine", () => {
  it("TVM mortgage reference: 360 n, 0.5 i, 100000 PV → PMT −599.55", () => {
    const s = createRpn();
    for (const k of ["3", "6", "0", "n", "0", "•", "5", "i"]) dispatch(s, k);
    for (const k of ["1", "0", "0", "0", "0", "0", "PV"]) dispatch(s, k);
    dispatch(s, "PMT"); // nothing keyed → SOLVE
    expect(xval(s).toFixed(2)).toBe("-599.55");
  });

  it("TVM keys STORE after a keyed number and SOLVE otherwise; i round-trips", () => {
    const s = createRpn();
    for (const k of ["3", "6", "n"]) dispatch(s, k);
    for (const k of ["3", "0", "0", "0", "PV"]) dispatch(s, k);
    for (const k of ["1", "0", "0", "CHS", "PMT"]) dispatch(s, k);
    for (const k of ["0", "FV"]) dispatch(s, k);
    dispatch(s, "i"); // solve the rate
    const i = num(xval(s));
    expect(i).toBeGreaterThan(0.9);
    expect(i).toBeLessThan(1.1); // ≈1.02%/mo for 36×100 on 3000
    // and the solved rate reproduces the payment
    dispatch(s, "PMT");
    expect(xval(s).toFixed(2)).toBe("-100.00");
  });

  it("12× and 12÷ store converted n and i", () => {
    const s = createRpn();
    for (const k of ["3", "0", "12×"]) dispatch(s, k);
    expect(s.fin.n.toString()).toBe("360");
    for (const k of ["6", "12÷"]) dispatch(s, k);
    expect(s.fin.i.toString()).toBe("0.5");
  });

  it("BEG mode raises an annuity's value (annuity due)", () => {
    const s = createRpn();
    for (const k of ["1", "2", "n", "1", "i"]) dispatch(s, k);
    for (const k of ["1", "0", "0", "CHS", "PMT"]) dispatch(s, k);
    dispatch(s, "FV");
    const end = num(xval(s));
    dispatch(s, "BEG");
    expect(s.fin.beg).toBe(true);
    dispatch(s, "FV");
    const beg = num(xval(s));
    expect(beg).toBeCloseTo(end * 1.01, 6);
  });

  it("cash flows: NPV at the IRR is zero", () => {
    const s = createRpn();
    for (const k of ["1", "0", "0", "0", "CHS", "CFo"]) dispatch(s, k);
    for (const k of ["4", "0", "0", "CFj"]) dispatch(s, k);
    dispatch(s, "3");
    dispatch(s, "Nj"); // 400 × 3 years
    dispatch(s, "IRR");
    const rate = num(xval(s));
    expect(rate).toBeGreaterThan(9);
    expect(rate).toBeLessThan(10.5); // ≈9.7%
    dispatch(s, "NPV");
    expect(Math.abs(num(xval(s)))).toBeLessThan(1e-9);
  });

  it("AMORT: interest + principal equals the payments; PV reduces", () => {
    const s = createRpn();
    for (const k of ["3", "6", "0", "n", "0", "•", "5", "i"]) dispatch(s, k);
    for (const k of ["1", "0", "0", "0", "0", "0", "PV"]) dispatch(s, k);
    dispatch(s, "PMT");
    const pmt = num(xval(s));
    for (const k of ["1", "2", "AMORT"]) dispatch(s, k);
    const interest = num(s.x);
    const principal = num(s.y);
    expect(interest + principal).toBeCloseTo(12 * pmt, 6);
    expect(num(s.fin.pv)).toBeCloseTo(100000 + principal, 6);
    expect(interest).toBeLessThan(0); // payment-signed, like the 12C
  });

  it("calendar: ΔDYS and DATE (M.DY) — Jun 3 1984 → Jun 15 1984 is 12 days", () => {
    const s = createRpn();
    run(s, "6.031984", "ENTER", "6.151984", "ΔDYS");
    expect(n(xval(s))).toBe(12);
    const s2 = createRpn();
    run(s2, "6.031984", "ENTER", "12", "DATE");
    expect(xval(s2).toString()).toBe("6.151984");
  });

  it("depreciation: SL 1800/yr; SOYD year-1 3000; DB(200%) year-1 4000", () => {
    const s = createRpn();
    for (const k of ["1", "0", "0", "0", "0", "PV"]) dispatch(s, k);
    for (const k of ["1", "0", "0", "0", "FV"]) dispatch(s, k);
    for (const k of ["5", "n"]) dispatch(s, k);
    run(s, "1", "DEPR SL"); // the 12C's SL resolves via its model override
    expect(n(s.x)).toBe(1800);
    run(s, "1", "SOYD");
    expect(n(s.x)).toBe(3000);
    for (const k of ["2", "0", "0", "i"]) dispatch(s, k);
    run(s, "1", "DB");
    expect(n(s.x)).toBe(4000);
  });

  it("bond price/yield round-trip; one-period bond prices exactly", () => {
    const s = createRpn();
    // yield 6, coupon 6, settle exactly one period before maturity:
    // price = (100+3)/(1.03) − 0 accrued = 100 exactly (par)
    for (const k of ["6", "i"]) dispatch(s, k);
    for (const k of ["6", "PMT"]) dispatch(s, k);
    run(s, "12.011999", "ENTER", "6.012000", "PRICE"); // Dec 1 1999 → Jun 1 2000
    expect(xval(s).toFixed(6)).toBe("100.000000");
    // YTM recovers the yield from the price
    for (const k of ["1", "0", "0", "PV"]) dispatch(s, k);
    run(s, "12.011999", "ENTER", "6.012000", "YTM");
    expect(num(xval(s))).toBeCloseTo(6, 6);
  });

  it("%T: 300 total, 75 part → 25 percent of total", () => {
    const s = createRpn();
    run(s, "300", "ENTER", "75", "%T");
    expect(n(s.x)).toBe(25);
    expect(n(s.y)).toBe(300);
  });

  it("linear estimate ŷ,r on a perfect line y=2x: ŷ(3)=6, r=1", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "1", "Σ+"); // y=2, x=1
    run(s, "4", "ENTER", "2", "Σ+");
    run(s, "6", "ENTER", "3", "Σ+");
    run(s, "3", "ŷ,r");
    expect(n(s.x)).toBeCloseTo(6, 12);
    expect(n(s.y)).toBeCloseTo(1, 12);
  });

  it("CLEAR FIN zeroes the financial registers, keeping modes", () => {
    const s = createRpn();
    for (const k of ["1", "2", "n", "BEG"]) dispatch(s, k);
    applyFunction(s, "CLEAR FIN");
    expect(n(s.fin.n)).toBe(0);
    expect(s.fin.beg).toBe(true);
  });
});

describe("Phase-8: probability + 11C extras", () => {
  it("Cy,x: 52 choose 5 = 2 598 960; Py,x: 5 pick 2 = 20 (exact)", () => {
    const s = createRpn();
    run(s, "52", "ENTER", "5", "Cy,x");
    expect(xval(s).toString()).toBe("2598960");
    const s2 = createRpn();
    run(s2, "5", "ENTER", "2", "Py,x");
    expect(xval(s2).toString()).toBe("20");
  });

  it("RAN# is deterministic, seeded, and uniform in [0,1)", () => {
    const a = createRpn();
    const b = createRpn();
    applyFunction(a, "RAN#");
    applyFunction(b, "RAN#");
    expect(a.x.toString()).toBe(b.x.toString()); // same seed → same draw
    const first = a.x;
    applyFunction(a, "RAN#");
    expect(a.x.toString()).not.toBe(first.toString()); // sequence advances
    expect(num(a.x)).toBeGreaterThanOrEqual(0);
    expect(num(a.x)).toBeLessThan(1);
  });

  it("HYP arms hyperbolics: HYP SIN, HYP⁻¹ TAN; domain errors flag", () => {
    const s = createRpn();
    run(s, "1", "HYP", "SIN");
    expect(n(xval(s))).toBeCloseTo(Math.sinh(1), 12);
    const s2 = createRpn();
    run(s2, "2", "HYP⁻¹", "TAN"); // atanh(2) is out of domain
    expect(s2.error).toBe("Error");
  });

  it("L.R. puts the intercept in X and slope in Y (y = 1 + 2x)", () => {
    const s = createRpn();
    run(s, "3", "ENTER", "1", "Σ+");
    run(s, "5", "ENTER", "2", "Σ+");
    run(s, "7", "ENTER", "3", "Σ+");
    applyFunction(s, "L.R.");
    expect(n(s.x)).toBeCloseTo(1, 12); // A
    expect(n(s.y)).toBeCloseTo(2, 12); // B
  });

  it("DSE counts down and program-skips at the target", () => {
    const s = createRpn();
    dispatch(s, "W/PRGM");
    for (const k of ["LBL", "A", "2", "×", "DSE", "1", "GTO", "A", "RTN"]) dispatch(s, k);
    dispatch(s, "W/PRGM");
    run(s, "3", "STO n", "1"); // count 3 → skips when ≤ 0
    run(s, "1", "ENTER");
    applyFunction(s, "A");
    expect(n(s.x)).toBe(8); // ×2 three times
  });

  it("x⇄(i) swaps X with the register I points at", () => {
    const s = createRpn();
    run(s, "5", "ST I", "CLx", "9", "STO n", "5", "CLx", "3");
    applyFunction(s, "x⇄(i)");
    expect(n(s.x)).toBe(9);
    run(s, "RCL n", "5");
    expect(n(s.x)).toBe(3);
  });
});

describe("Phase-9: complex, matrices, SOLVE & ∫ (HP-15C)", () => {
  it("complex arithmetic on the parallel stack: (2+3i)(4+5i) = −7+22i", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "3", "I"); // 2+3i
    run(s, "4", "ENTER", "5", "I"); // 4+5i
    applyFunction(s, "×");
    expect(n(s.x)).toBeCloseTo(-7, 10);
    expect(n(s.imag.x)).toBeCloseTo(22, 10);
  });

  it("Re≷Im swaps the parts; (i) cpx toggles complex mode off and clears imag", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2", "I");
    applyFunction(s, "Re≷Im");
    expect(n(s.x)).toBe(2);
    expect(n(s.imag.x)).toBe(1);
    applyFunction(s, "(i) cpx");
    expect(s.cpx).toBe(false);
    expect(n(s.imag.x)).toBe(0);
  });

  it("DIM + the R0/R1 element protocol fills a matrix; MATRIX 9 takes its det", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "2", "DIM", "A"); // A: 2×2
    run(s, "MATRIX", "1"); // R0=R1=1
    for (const v of ["1", "2", "3", "4"]) {
      run(s, v, "STO n", "A"); // elements walk col-first with wrap
    }
    run(s, "RESULT", "A");
    run(s, "MATRIX", "9"); // det → X
    expect(n(xval(s))).toBeCloseTo(-2, 10);
  });

  it("MATRIX 5 forms AᵀB into RESULT", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "2", "DIM", "A");
    run(s, "2", "ENTER", "2", "DIM", "B");
    run(s, "MATRIX", "1");
    for (const v of ["1", "0", "0", "1"]) run(s, v, "STO n", "A"); // identity
    run(s, "MATRIX", "1");
    for (const v of ["5", "6", "7", "8"]) run(s, v, "STO n", "B");
    run(s, "RESULT", "C");
    run(s, "MATRIX", "5"); // C = Aᵀ·B = B
    expect(s.mats["C"]).toEqual([[5, 6], [7, 8]]);
  });

  it("SOLVE finds the root of a programmed f(x): x²−4 → 2", () => {
    const s = createRpn();
    dispatch(s, "W/PRGM");
    for (const k of ["LBL", "A", "x²", "4", "−", "RTN"]) dispatch(s, k);
    dispatch(s, "W/PRGM");
    run(s, "1", "ENTER", "3"); // guesses
    run(s, "SOLVE", "A");
    expect(n(xval(s))).toBeCloseTo(2, 9);
  });

  it("∫ˣy integrates a programmed f: ∫₀^π sin = 2 (RAD)", () => {
    const s = createRpn();
    applyFunction(s, "RAD");
    dispatch(s, "W/PRGM");
    for (const k of ["LBL", "B", "SIN", "RTN"]) dispatch(s, k);
    dispatch(s, "W/PRGM");
    run(s, "0", "ENTER", "π", "∫ˣy", "B");
    expect(n(xval(s))).toBeCloseTo(2, 6);
  });

  it("TEST n steers program flow (TEST 5 is x=y)", () => {
    const s = createRpn();
    dispatch(s, "W/PRGM");
    for (const k of ["TEST", "5", "GTO", "1", "0", "R/S", "LBL", "1", "1", "R/S"]) dispatch(s, k);
    dispatch(s, "W/PRGM");
    run(s, "4", "ENTER", "4");
    applyFunction(s, "R/S");
    expect(n(xval(s))).toBe(1);
  });

  it("x≷ n exchanges X with a register", () => {
    const s = createRpn();
    run(s, "9", "STO n", "4", "CLx", "3");
    run(s, "x≷", "4");
    expect(n(s.x)).toBe(9);
    run(s, "RCL n", "4");
    expect(n(s.x)).toBe(3);
  });
});

describe("Phase-10: the 16C integer universe", () => {
  const hex = (s2: RpnEngine) => applyFunction(s2, "HEX");

  it("hex entry with A–F digits; word arithmetic wraps and sets carry", () => {
    const s = createRpn();
    hex(s);
    run(s, "8", "STO"); // keep an anchor in M (unrelated)
    for (const k of ["F", "F"]) applyFunction(s, k); // FF
    applyFunction(s, "ENTER");
    applyFunction(s, "1");
    // word size 8: FF + 1 wraps to 00 with carry
    run(s, "CLx", "8", "WSIZE");
    for (const k of ["F", "F"]) applyFunction(s, k);
    applyFunction(s, "ENTER");
    applyFunction(s, "1");
    applyFunction(s, "+");
    expect(xval(s).toString()).toBe("0");
    expect(s.int.carry).toBe(true);
  });

  it("AND / OR / XOR / NOT are word-exact; DEC shows signed 2's complement", () => {
    const s = createRpn();
    hex(s);
    run(s, "1", "6", "WSIZE"); // hex 16 = 22?? — careful: entry is HEX now
    // set word size via decimal base to avoid confusion
    applyFunction(s, "DEC");
    run(s, "16", "WSIZE");
    applyFunction(s, "HEX");
    for (const k of ["F", "0"]) applyFunction(s, k);
    applyFunction(s, "ENTER");
    for (const k of ["3", "C"]) applyFunction(s, k);
    applyFunction(s, "AND");
    expect(xval(s).toString()).toBe("48"); // 0xF0 & 0x3C = 0x30
    applyFunction(s, "NOT");
    // ~0x30 in 16-bit 2's = 0xFFCF = −49 signed
    expect(xval(s).toString()).toBe("-49");
  });

  it("CHS in 2's complement negates through the word (−1 shows FFFF h)", () => {
    const s = createRpn();
    hex(s);
    applyFunction(s, "DEC");
    run(s, "16", "WSIZE");
    applyFunction(s, "HEX");
    applyFunction(s, "1");
    applyFunction(s, "CHS");
    expect(intFormat(xval(s), s.int)).toBe("FFFF h");
  });

  it("shifts and rotates: SL carries the top bit out; RRn rotates by count", () => {
    const s = createRpn();
    hex(s);
    applyFunction(s, "DEC");
    run(s, "8", "WSIZE");
    run(s, "129", "SL"); // 1000_0001 << 1 → 0000_0010, carry 1
    expect(xval(s).toString()).toBe("2");
    expect(s.int.carry).toBe(true);
    const s2 = createRpn();
    applyFunction(s2, "DEC");
    run(s2, "8", "WSIZE");
    run(s2, "1", "ENTER", "1", "RRn"); // rotate 1 right by 1 → 1000_0000 = −128
    expect(xval(s2).toString()).toBe("-128");
  });

  it("bit ops: SB/CB set and clear; MASKR builds masks; #B counts bits", () => {
    const s = createRpn();
    applyFunction(s, "DEC");
    run(s, "8", "WSIZE");
    run(s, "0", "ENTER", "3", "SB");
    expect(xval(s).toString()).toBe("8"); // bit 3 set
    run(s, "ENTER", "3", "CB");
    expect(xval(s).toString()).toBe("0");
    run(s, "4", "MASKR");
    expect(xval(s).toString()).toBe("15"); // 0000_1111
    applyFunction(s, "#B");
    expect(xval(s).toString()).toBe("4");
  });

  it("RMD and DBL×: remainder and the full double product", () => {
    const s = createRpn();
    applyFunction(s, "DEC");
    run(s, "16", "WSIZE");
    run(s, "7", "ENTER", "3", "RMD");
    expect(xval(s).toString()).toBe("1");
    applyFunction(s, "UNSGN");
    run(s, "65535", "ENTER", "65535", "DBL×");
    expect(s.x.toString()).toBe("1"); // low word of 0xFFFE0001
    expect(s.y.toString()).toBe("65534"); // high word
  });

  it("FLOAT n leaves the integer universe with FIX digits", () => {
    const s = createRpn();
    hex(s);
    run(s, "FLOAT", "4");
    expect(s.int.on).toBe(false);
    expect(s.disp).toEqual({ mode: "FIX", digits: 4 });
  });

  it("SF 4 / F? mirror the carry flag (the 16C's flag map)", () => {
    const s = createRpn();
    run(s, "SF", "4");
    expect(s.int.carry).toBe(true);
    run(s, "CF", "4");
    expect(s.int.carry).toBe(false);
  });
});

describe("Phase-11: the 41CX time module (XEQ catalog)", () => {
  it("XEQ TIME / DATE / DOW use the injectable clock (pinned in tests)", async () => {
    const { setClock } = await import("@/lib/engine/rpn");
    setClock(() => new Date(2026, 6, 11, 14, 30, 45)); // Jul 11 2026 14:30:45
    const s = createRpn();
    s.alpha = "TIME";
    applyFunction(s, "XEQ");
    expect(xval(s).toString()).toBe("14.3045");
    s.alpha = "DATE";
    applyFunction(s, "XEQ"); // M.DY default
    expect(xval(s).toString()).toBe("7.112026");
    s.alpha = "DOW";
    applyFunction(s, "XEQ"); // Jul 11 2026 is a Saturday
    expect(xval(s).toString()).toBe("6");
    setClock(() => new Date());
  });

  it("XEQ DDAYS is the CX name for date differences", () => {
    const s = createRpn();
    run(s, "6.031984", "ENTER", "6.151984");
    s.alpha = "DDAYS";
    applyFunction(s, "XEQ");
    expect(n(xval(s))).toBe(12);
  });

  it("the catalog wins over key ids: XEQ DATE pushes today, never date-adds", () => {
    const s = createRpn();
    run(s, "1", "ENTER", "2"); // would be date-add operands for the 12C key
    s.alpha = "DATE";
    applyFunction(s, "XEQ");
    expect(s.error).toBeNull(); // pushed a date instead of erroring on decode
  });
});

describe("Phase-16: the HP-42S menu-driven RPN", () => {
  const feed = (s: ReturnType<typeof createRpn>, pairs: [number, number][]) => {
    for (const [x, y] of pairs) run(s, String(y), "ENTER", String(x), "Σ+");
  };

  it("CFIT LINF: exact line y = 3x + 2 → SLOPE 3, YINT 2, CORR 1", () => {
    const s = createRpn();
    feed(s, [[1, 5], [2, 8], [3, 11], [4, 14]]);
    dispatch(s, "SLOPE");
    expect(n(xval(s))).toBeCloseTo(3, 12);
    dispatch(s, "YINT");
    expect(n(xval(s))).toBeCloseTo(2, 12);
    dispatch(s, "CORR");
    expect(n(xval(s))).toBeCloseTo(1, 12);
    run(s, "10");
    dispatch(s, "FCSTY");
    expect(n(xval(s))).toBeCloseTo(32, 10);
    run(s, "32");
    dispatch(s, "FCSTX");
    expect(n(xval(s))).toBeCloseTo(10, 10);
  });

  it("EXPF and PWRF recover generated models; BEST auto-picks", () => {
    const s = createRpn();
    // y = 2·e^(0.5x)
    feed(s, [[1, 2 * Math.exp(0.5)], [2, 2 * Math.exp(1)], [3, 2 * Math.exp(1.5)], [4, 2 * Math.exp(2)]]);
    dispatch(s, "EXPF");
    dispatch(s, "SLOPE");
    expect(n(xval(s))).toBeCloseTo(0.5, 9);
    dispatch(s, "YINT");
    expect(n(xval(s))).toBeCloseTo(2, 9);
    dispatch(s, "BEST"); // exponential data → EXPF wins
    expect(s.fit).toBe("EXPF");
    // y = 4·x^0.7
    const t = createRpn();
    feed(t, [[1, 4], [2, 4 * Math.pow(2, 0.7)], [3, 4 * Math.pow(3, 0.7)], [5, 4 * Math.pow(5, 0.7)]]);
    dispatch(t, "PWRF");
    dispatch(t, "SLOPE");
    expect(n(xval(t))).toBeCloseTo(0.7, 9);
    dispatch(t, "YINT");
    expect(n(xval(t))).toBeCloseTo(4, 9);
  });

  it("Σ− removes the last CFIT point; SUM and WMN read the registers", () => {
    const s = createRpn();
    feed(s, [[1, 2], [2, 4], [9, 9]]);
    run(s, "9", "ENTER", "9", "Σ−");
    expect(s.pts).toEqual([[1, 2], [2, 4]]);
    dispatch(s, "SUM"); // Σx in X, Σy in Y
    expect(n(xval(s))).toBe(3);
    expect(n(s.y)).toBe(6);
    dispatch(s, "WMN"); // Σxy/Σy = (2+8)/6
    expect(n(xval(s))).toBeCloseTo(10 / 6, 12);
  });

  it("menus: STAT opens, @CFIT nests, EXIT pops, ▼ pages", () => {
    const s = createRpn();
    dispatch(s, "STAT");
    expect(menu42Labels(s)).toEqual(["Σ+", "SUM", "MEAN", "WMN", "SDEV", "@CFIT"]);
    pressSoft42(s, 5); // → CFIT
    expect(menu42Labels(s)[2]).toBe("SLOPE");
    pressSoft42(s, 5); // → MODL
    expect(menu42Labels(s)[0]).toBe("LINF");
    dispatch(s, "EXIT");
    expect(s.menu?.name).toBe("CFIT");
    dispatch(s, "EXIT");
    expect(s.menu?.name).toBe("STAT");
    dispatch(s, "EXIT");
    expect(s.menu).toBeNull();
  });

  it("PROB menu reuses the P8 core: 5C3=10, 5!=120, GAMMA(5)=24", () => {
    const s = createRpn();
    run(s, "5", "ENTER", "3");
    dispatch(s, "COMB");
    expect(n(xval(s))).toBe(10);
    run(s, "5");
    dispatch(s, "N!");
    expect(n(xval(s))).toBe(120);
    run(s, "5");
    dispatch(s, "GAMMA");
    expect(n(xval(s))).toBeCloseTo(24, 9);
  });

  it("CONVERT menu maps the 42S prints onto the P2 conversions", () => {
    const s = createRpn();
    run(s, "1.3", "ENTER"); // 1h30m
    dispatch(s, "→HR");
    expect(n(xval(s))).toBeCloseTo(1.5, 12);
    dispatch(s, "→HMS");
    expect(n(xval(s))).toBeCloseTo(1.3, 12);
    run(s, "180");
    dispatch(s, "→RAD");
    expect(n(xval(s))).toBeCloseTo(Math.PI, 12);
    dispatch(s, "→DEG");
    expect(n(xval(s))).toBeCloseTo(180, 12);
  });

  it("ASSIGN captures the next key onto the CUSTOM row and it executes", () => {
    const s = createRpn();
    dispatch(s, "ASSIGN");
    dispatch(s, "SIN");
    expect(s.custom42).toEqual(["SIN"]);
    dispatch(s, "CUSTOM");
    expect(menu42Labels(s)[0]).toBe("SIN");
    run(s, "90");
    pressSoft42(s, 0); // SIN in DEG
    expect(n(xval(s))).toBeCloseTo(1, 12);
  });

  it("MATRIX menu: DIM A, DET/TRN/INV act on the named matrix", () => {
    const s = createRpn();
    run(s, "2", "ENTER", "2");
    dispatch(s, "DIM");
    dispatch(s, "A");
    s.mats = { ...s.mats, A: [[4, 0], [0, 2]] };
    dispatch(s, "DET");
    dispatch(s, "A");
    expect(n(xval(s))).toBeCloseTo(8, 12);
    dispatch(s, "INV");
    dispatch(s, "A");
    expect(s.mats["A"][0][0]).toBeCloseTo(0.25, 12);
    dispatch(s, "TRN");
    dispatch(s, "A");
    expect(s.mats["A"][1][0]).toBeCloseTo(0, 12);
  });

  it("SOLVER menu lists program labels and solves through them", () => {
    const s = createRpn();
    // program: LBL A: x² − 4  (root at 2)
    s.prgm = { ...s.prgm, steps: ["LBL", "A", "x²", "4", "−", "RTN"] };
    dispatch(s, "SOLVER");
    expect(menu42Labels(s)[0]).toBe("A");
    run(s, "1", "ENTER", "3"); // bracket
    pressSoft42(s, 0);
    expect(n(xval(s))).toBeCloseTo(2, 6);
  });

  it("ALPHA menu types into the alpha register", () => {
    const s = createRpn();
    dispatch(s, "ALPHA");
    pressSoft42(s, 0); // A
    pressSoft42(s, 1); // B
    expect(s.alpha).toBe("AB");
  });

  it("the CLEAR menu id is model-scoped: CLEARM opens it, CLST zeroes", () => {
    const s = createRpn();
    run(s, "5", "ENTER", "6");
    dispatch(s, "CLEARM");
    expect(s.menu?.name).toBe("CLEAR");
    dispatch(s, "CLST");
    expect(n(xval(s))).toBe(0);
    expect(n(s.y)).toBe(0);
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
