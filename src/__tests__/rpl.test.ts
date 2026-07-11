import { describe, it, expect } from "vitest";
import {
  createRpl,
  dispatchRpl,
  menuLabels,
  pressSoft,
  push,
  type RplEngine,
} from "@/lib/engine/rpl";
import { formatObj, type RplObj } from "@/lib/engine/rpl/object";
import { bn, num } from "@/lib/engine/config";

/** Down-convert a stack of REAL objects for numeric assertions. */
const nums = (stack: RplObj[]) =>
  stack.map((o) => {
    if (o.k !== "real") throw new Error(`expected real, got ${o.k}`);
    return num(o.v);
  });

/** Dispatch keys; multi-digit numeric tokens are typed digit by digit. */
function run(s: RplEngine, ...toks: string[]) {
  for (const t of toks) {
    if (t.length > 1 && /^\d+\.?\d*$/.test(t)) for (const d of t) dispatchRpl(s, d);
    else dispatchRpl(s, t);
  }
}

/** Put source text on the command line and ENTER it (keyboard-equivalent). */
function line(s: RplEngine, text: string) {
  s.entry = text;
  dispatchRpl(s, "ENTER");
}

const fmtTop = (s: RplEngine): string =>
  formatObj(s.stack[s.stack.length - 1], s.disp, s.base);

describe("RPL dynamic object stack (P12 core)", () => {
  it("ENTER pushes the entry to level 1: 2 ENTER 3 DUP", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3", "DUP");
    expect(nums(s.stack)).toEqual([2, 3, 3]);
  });

  it("adds across the dynamic stack: 2 ENTER 3 + = 5", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3", "+");
    expect(nums(s.stack)).toEqual([5]);
  });

  it("0.1 ENTER 0.2 + is EXACTLY 0.3 on the tower", () => {
    const s = createRpl();
    run(s, "0.1", "ENTER", "0.2", "+");
    const top = s.stack[0];
    expect(top.k === "real" && top.v.toString()).toBe("0.3");
  });

  it("grows without a fixed depth, and whole lines parse at once", () => {
    const s = createRpl();
    line(s, "1 2 3 4 5 6");
    expect(nums(s.stack)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("HP reference: 1 2 3 DEPTH → 3; ROT rotates level 3 up", () => {
    const s = createRpl();
    line(s, "1 2 3 DEPTH");
    expect(nums(s.stack)).toEqual([1, 2, 3, 3]);
    line(s, "DROP ROT");
    expect(nums(s.stack)).toEqual([2, 3, 1]);
  });

  it("stack ops: OVER, PICK, ROLL, ROLLD, DUPN, DROPN, DUP2, DROP2", () => {
    const s = createRpl();
    line(s, "1 2 OVER");
    expect(nums(s.stack)).toEqual([1, 2, 1]);
    line(s, "3 PICK");
    expect(nums(s.stack)).toEqual([1, 2, 1, 1]);
    line(s, "CLEAR 1 2 3 3 ROLL");
    expect(nums(s.stack)).toEqual([2, 3, 1]);
    line(s, "3 ROLLD");
    expect(nums(s.stack)).toEqual([1, 2, 3]);
    line(s, "2 DUPN");
    expect(nums(s.stack)).toEqual([1, 2, 3, 2, 3]);
    line(s, "2 DROPN DUP2");
    expect(nums(s.stack)).toEqual([1, 2, 3, 2, 3]);
    line(s, "DROP2 DROP2");
    expect(nums(s.stack)).toEqual([1]);
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

  it("unary √ on the top only; √ of a negative goes complex, like the 28C", () => {
    const s = createRpl();
    run(s, "3", "ENTER", "9", "√");
    expect(nums(s.stack)).toEqual([3, 3]);
    line(s, "CLEAR -4 √");
    expect(s.stack[0]).toEqual({ k: "cpx", re: 0, im: 2 });
  });

  it("returns false for unknown ids (the coverage probe's contract)", () => {
    const s = createRpl();
    expect(dispatchRpl(s, "NO-SUCH-KEY-9Q")).toBe(false);
  });

  it("ˣ√y: 8 ENTER 3 → 2", () => {
    const s = createRpl();
    run(s, "8", "ENTER", "3", "ˣ√y");
    expect(nums(s.stack)[0]).toBeCloseTo(2, 12);
  });

  it("EEX keys an exponent: 5 EEX 3 ENTER = 5000; CHS negates the exponent", () => {
    const s = createRpl();
    run(s, "5", "EEX", "3", "ENTER");
    expect(nums(s.stack)).toEqual([5000]);
    const t = createRpl();
    run(t, "5", "EEX", "3", "CHS", "ENTER");
    expect(nums(t.stack)).toEqual([0.005]);
  });

  it("history records committed commands with exact raw values", () => {
    const s = createRpl();
    run(s, "2", "ENTER", "3", "+");
    expect(s.hist[s.hist.length - 1].op).toBe("+ → 5");
    expect(s.hist[s.hist.length - 1].raw).toBe("5");
  });

  it("push (history recall) commits any entry first, then pushes", () => {
    const s = createRpl();
    run(s, "7");
    push(s, bn("0.3"));
    expect(s.stack.map((o) => o.k === "real" && o.v.toString())).toEqual(["7", "0.3"]);
  });
});

describe("P12 object types", () => {
  it("strings: entry, concatenation, CHR/NUM/POS/SUB/SIZE", () => {
    const s = createRpl();
    line(s, '"AB" "CD" +');
    expect(s.stack[0]).toEqual({ k: "str", v: "ABCD" });
    line(s, "SIZE");
    expect(nums(s.stack)).toEqual([4]);
    line(s, "CLEAR 66 CHR");
    expect(s.stack[0]).toEqual({ k: "str", v: "B" });
    line(s, "NUM");
    expect(nums(s.stack)).toEqual([66]);
    line(s, 'CLEAR "HELLO" "LL" POS');
    expect(nums(s.stack)).toEqual([3]);
    line(s, 'CLEAR "HELLO" 2 4 SUB');
    expect(s.stack[0]).toEqual({ k: "str", v: "ELL" });
  });

  it("→STR / STR→ round-trip evaluates the string as a command line", () => {
    const s = createRpl();
    line(s, "42 →STR");
    expect(s.stack[0]).toEqual({ k: "str", v: "42" });
    line(s, "STR→");
    expect(nums(s.stack)).toEqual([42]);
    line(s, 'CLEAR "1 2 +" STR→');
    expect(nums(s.stack)).toEqual([3]);
  });

  it("lists: →LIST / LIST→ (HP reference), GET/PUT, + concat", () => {
    const s = createRpl();
    line(s, "1 2 3 3 →LIST");
    expect(s.stack).toHaveLength(1);
    expect(fmtTop(s)).toBe("{ 1 2 3 }");
    line(s, "LIST→");
    expect(nums(s.stack)).toEqual([1, 2, 3, 3]);
    line(s, "CLEAR { 10 20 30 } 2 GET");
    expect(nums(s.stack)).toEqual([20]);
    line(s, "CLEAR { 1 2 } 1 99 PUT");
    expect(fmtTop(s)).toBe("{ 99 2 }");
    line(s, "CLEAR { 1 } { 2 3 } +");
    expect(fmtTop(s)).toBe("{ 1 2 3 }");
  });

  it("complex: (1,2)+(3,4), ×, ABS, C→R, R→C, ARG in degrees", () => {
    const s = createRpl();
    line(s, "(1,2) (3,4) +");
    expect(s.stack[0]).toEqual({ k: "cpx", re: 4, im: 6 });
    line(s, "CLEAR (1,2) (3,4) ×");
    expect(s.stack[0]).toEqual({ k: "cpx", re: -5, im: 10 });
    line(s, "CLEAR (3,4) ABS");
    expect(nums(s.stack)).toEqual([5]);
    line(s, "CLEAR (3,4) C→R");
    expect(nums(s.stack)).toEqual([3, 4]);
    line(s, "CLEAR 3 4 R→C");
    expect(s.stack[0]).toEqual({ k: "cpx", re: 3, im: 4 });
    line(s, "CLEAR (0,1) ARG");
    expect(nums(s.stack)).toEqual([90]); // DEG mode
  });

  it("vectors & matrices: →ARRY, DOT, CROSS, DET, TRN, INV", () => {
    const s = createRpl();
    line(s, "[ 1 2 3 ] [ 4 5 6 ] DOT");
    expect(nums(s.stack)).toEqual([32]);
    line(s, "CLEAR [ 1 0 0 ] [ 0 1 0 ] CROSS");
    expect(fmtTop(s)).toBe("[ 0 0 1 ]");
    line(s, "CLEAR [ [ 1 2 ] [ 3 4 ] ] DET");
    expect(nums(s.stack)).toEqual([-2]);
    line(s, "CLEAR [ [ 1 2 ] [ 3 4 ] ] TRN");
    expect(fmtTop(s)).toBe("[[ 1 3 ][ 2 4 ]]");
    line(s, "CLEAR 1 2 3 4 { 2 2 } →ARRY");
    expect(fmtTop(s)).toBe("[[ 1 2 ][ 3 4 ]]");
    line(s, "CLEAR [ [ 4 0 ] [ 0 2 ] ] INV [ [ 4 0 ] [ 0 2 ] ] ×");
    expect(fmtTop(s)).toBe("[[ 1 0 ][ 0 1 ]]");
  });

  it("binary integers: # entry per base, word arithmetic, shifts, logic", () => {
    const s = createRpl();
    dispatchRpl(s, "HEX");
    line(s, "# FF # 1 +");
    expect(fmtTop(s)).toBe("# 100h");
    line(s, "CLEAR 4 STWS # F # 3 +"); // 4-bit word wraps
    expect(fmtTop(s)).toBe("# 2h");
    line(s, "CLEAR 64 STWS # 6 SL");
    expect(fmtTop(s)).toBe("# Ch");
    line(s, "CLEAR # C # A AND");
    expect(fmtTop(s)).toBe("# 8h");
    line(s, "CLEAR # FF B→R");
    expect(nums(s.stack)).toEqual([255]);
    line(s, "CLEAR 26 R→B");
    expect(fmtTop(s)).toBe("# 1Ah");
    dispatchRpl(s, "BIN");
    expect(fmtTop(s)).toBe("# 11010b");
    dispatchRpl(s, "DEC");
  });

  it("TYPE and SAME follow the 28C's numbering and identity", () => {
    const s = createRpl();
    line(s, "1 TYPE");
    expect(nums(s.stack)).toEqual([0]);
    line(s, 'CLEAR "A" TYPE { 1 } TYPE');
    expect(nums(s.stack)).toEqual([2, 5]);
    line(s, "CLEAR { 1 2 } { 1 2 } SAME");
    expect(nums(s.stack)).toEqual([1]);
  });
});

describe("P13 units & dimensional analysis", () => {
  it("FR-UNIT-1: 5_cm + 2_in auto-converts to the left unit, exactly", () => {
    const s = createRpl();
    line(s, "5_cm 2_in +");
    const top = s.stack[0];
    expect(top.k).toBe("unit");
    if (top.k === "unit") {
      expect(top.mag.toString()).toBe("10.08"); // exact on BigNumber
      expect(top.u).toBe("cm");
    }
  });

  it("FR-UNIT-2: 3_m + 4_s reports Inconsistent Units, never NaN", () => {
    const s = createRpl();
    line(s, "3_m 4_s +");
    expect(s.error).toBe("Inconsistent Units");
    line(s, "CLEAR 3 4_s +"); // bare real + quantity is inconsistent too
    expect(s.error).toBe("Inconsistent Units");
  });

  it("FR-UNIT-3: CONVERT 100_km/h to m/s; UBASE of 1_N; UVAL strips", () => {
    const s = createRpl();
    line(s, "100_km/h 1_m/s CONVERT");
    const top = s.stack[0];
    expect(top.k === "unit" && top.u).toBe("m/s");
    expect(top.k === "unit" && top.mag.toFixed(10)).toBe("27.7777777778");
    line(s, "CLEAR 1_N UBASE");
    const si = s.stack[0];
    expect(si.k === "unit" && si.u).toBe("(kg m) / s^2");
    line(s, "UVAL");
    expect(nums(s.stack)).toEqual([1]);
  });

  it("×/÷/^ compose and cancel dimensions", () => {
    const s = createRpl();
    line(s, "6_m 2_s ÷");
    expect(fmtTop(s)).toBe("3_m / s");
    line(s, "CLEAR 3_m 3 ^");
    const v = s.stack[0];
    expect(v.k === "unit" && v.mag.toString()).toBe("27");
    expect(v.k === "unit" && v.u).toBe("m^3");
    line(s, "CLEAR 6_m 2_m ÷"); // dimensionless → plain real
    expect(nums(s.stack)).toEqual([3]);
    line(s, "CLEAR 2 5_cm ×");
    expect(fmtTop(s)).toBe("10_cm");
  });

  it("affine temperature converts through the catalog path", () => {
    const s = createRpl();
    line(s, "100_degC 1_degF CONVERT");
    const top = s.stack[0];
    expect(top.k === "unit" && top.mag.toString()).toBe("212");
  });

  it("→UNIT attaches; NEG/ABS work on quantities; SAME compares", () => {
    const s = createRpl();
    line(s, "9.81 'm/s^2' →UNIT");
    expect(fmtTop(s)).toBe("9.81_m/s^2");
    line(s, "NEG ABS");
    expect(fmtTop(s)).toBe("9.81_m/s^2");
    line(s, "9.81_m/s^2 SAME");
    expect(nums(s.stack)).toEqual([1]);
  });

  it("the UNITS catalog menu: categories → units; attach and convert", () => {
    const s = createRpl();
    dispatchRpl(s, "UNITS");
    expect(menuLabels(s)[0]).toBe("LENG");
    pressSoft(s, 0); // open LENG
    expect(menuLabels(s)).toEqual(["m", "cm", "mm", "km", "um", "in"]);
    line(s, "5");
    pressSoft(s, 1); // cm → attach
    expect(fmtTop(s)).toBe("5_cm");
    pressSoft(s, 5); // in → convert the quantity
    const top = s.stack[0];
    expect(top.k === "unit" && top.u).toBe("in");
    // every catalog entry must be a unit math.js accepts
  });

  it("the whole units catalog parses through math.js (no dead softkeys)", async () => {
    const { UNIT_MENUS } = await import("@/lib/engine/units-catalog");
    const { validUnit } = await import("@/lib/engine/units");
    for (const [cat, units] of Object.entries(UNIT_MENUS)) {
      const bad = units.filter((u) => !validUnit(u));
      expect(bad, `category ${cat}`).toEqual([]);
    }
  });

  it("unit quantities persist (FR-STATE-1)", async () => {
    const { snapshot, restore } = await import("@/lib/engine/persistence");
    const { createRpn } = await import("@/lib/engine/rpn");
    const s = createRpl();
    line(s, "5_cm 2_in +");
    const state = JSON.parse(JSON.stringify(snapshot(createRpn(), s, "HP-28C")));
    const engines = restore(state);
    const top = engines.rpl.stack[0];
    expect(top.k === "unit" && top.mag.toString()).toBe("10.08");
    expect(top.k === "unit" && top.u).toBe("cm");
  });
});

describe("P12 variables, algebraics, programs (the evaluator)", () => {
  it("STO / RCL / PURGE over named variables", () => {
    const s = createRpl();
    line(s, "42 'A' STO");
    expect(s.stack).toEqual([]);
    expect(s.home.vars["A"]).toEqual({ k: "real", v: bn(42) });
    line(s, "'A' RCL");
    expect(nums(s.stack)).toEqual([42]);
    line(s, "'A' PURGE");
    expect(s.home.vars["A"]).toBeUndefined();
  });

  it("HP reference: « 1 + » 4 SWAP EVAL → 5", () => {
    const s = createRpl();
    line(s, "« 1 + » 4 SWAP EVAL");
    expect(nums(s.stack)).toEqual([5]);
  });

  it("DoD flow: 'X+1' with 4 'X' STO evaluates to 5", () => {
    const s = createRpl();
    line(s, "4 'X' STO");
    line(s, "'X+1' EVAL");
    expect(nums(s.stack)).toEqual([5]);
  });

  it("algebraics with unresolved names stay symbolic on EVAL", () => {
    const s = createRpl();
    line(s, "'Q+1' EVAL");
    expect(s.stack[0]).toEqual({ k: "alg", src: "Q+1" });
    expect(s.error).toBeNull();
  });

  it("an undefined name evaluates to itself; a defined one to its value", () => {
    const s = createRpl();
    line(s, "ZILCH");
    expect(s.stack[0]).toEqual({ k: "name", v: "ZILCH" });
    line(s, "CLEAR 7 'W' STO W 1 +");
    expect(nums(s.stack)).toEqual([8]);
  });

  it("a name bound to a program runs it when evaluated", () => {
    const s = createRpl();
    line(s, "« DUP × » 'SQR' STO");
    line(s, "6 SQR");
    expect(nums(s.stack)).toEqual([36]);
  });

  it("HP reference: 1 5 FOR i i NEXT leaves 1 2 3 4 5", () => {
    const s = createRpl();
    line(s, "« 1 5 FOR i i NEXT » EVAL");
    expect(nums(s.stack)).toEqual([1, 2, 3, 4, 5]);
  });

  it("FOR … STEP with a step of 2, and START counted loops", () => {
    const s = createRpl();
    line(s, "« 1 9 FOR i i 2 STEP » EVAL");
    expect(nums(s.stack)).toEqual([1, 3, 5, 7, 9]);
    line(s, "CLEAR « 1 3 START 7 NEXT » EVAL");
    expect(nums(s.stack)).toEqual([7, 7, 7]);
  });

  it("IF/THEN/ELSE/END branches on the test clause", () => {
    const s = createRpl();
    line(s, "« IF 1 2 < THEN 10 ELSE 20 END » EVAL");
    expect(nums(s.stack)).toEqual([10]);
    line(s, "CLEAR « IF 1 2 > THEN 10 ELSE 20 END » EVAL");
    expect(nums(s.stack)).toEqual([20]);
  });

  it("DO…UNTIL…END and WHILE…REPEAT…END loop correctly", () => {
    const s = createRpl();
    line(s, "0 'N' STO");
    line(s, "« DO 'N' RCL 1 + 'N' STO UNTIL N 3 ≥ END » EVAL N");
    expect(nums(s.stack)).toEqual([3]);
    line(s, "CLEAR 0 'N' STO « WHILE N 4 < REPEAT N 1 + 'N' STO END » EVAL N");
    expect(nums(s.stack)).toEqual([4]);
  });

  it("IFT and IFTE take objects from the stack", () => {
    const s = createRpl();
    line(s, "1 42 IFT");
    expect(nums(s.stack)).toEqual([42]);
    line(s, "CLEAR 0 'X' 'Y' IFTE");
    expect(s.stack[0]).toEqual({ k: "name", v: "Y" });
  });

  it("local variables: → a b « … » binds two levels", () => {
    const s = createRpl();
    line(s, "« → a b « a b - » » 'SUB2' STO 10 4 SUB2");
    expect(nums(s.stack)).toEqual([6]);
  });

  it("IFERR traps engine errors and exposes ERRM", () => {
    const s = createRpl();
    line(s, "« IFERR 1 0 ÷ THEN 99 END » EVAL");
    expect(nums(s.stack)).toEqual([99]);
    line(s, "ERRM");
    expect(s.stack[1]).toEqual({ k: "str", v: "Infinite Result" });
  });

  it("a runaway loop hits the op budget instead of hanging (NFR-9)", () => {
    const s = createRpl();
    line(s, "« DO 1 DROP UNTIL 0 END » EVAL");
    expect(s.error).toMatch(/budget/i);
  });

  it("STO+ arithmetic on a stored variable; SNEG/SINV", () => {
    const s = createRpl();
    line(s, "10 'V' STO 5 'V' STO+ 'V' RCL");
    expect(nums(s.stack)).toEqual([15]);
    line(s, "CLEAR 'V' SNEG 'V' RCL");
    expect(nums(s.stack)).toEqual([-15]);
  });

  it("ROOT finds a numeric root and stores it: 'X^2-4' 'X' 3 → 2", () => {
    const s = createRpl();
    line(s, "'X^2-4' 'X' 3 ROOT");
    expect(s.stack).toHaveLength(1);
    expect(nums(s.stack)[0]).toBeCloseTo(2, 9);
    const x = s.home.vars["X"];
    expect(x && x.k === "real" && num(x.v)).toBeCloseTo(2, 9);
  });
});

describe("P14 light CAS (nerdamer tier behind CasProvider)", () => {
  // load the real provider once — a local module, deterministic, no network
  const casLoaded = (async () => {
    const { loadNerdamerProvider } = await import("@/lib/engine/cas/nerdamer-provider");
    const { setCas } = await import("@/lib/engine/cas/provider");
    setCas(await loadNerdamerProvider());
  })();

  it("FR-CAS-1: d/dx of 'X^2' is the algebraic '2*X'", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'X^2' 'X' d/dx");
    expect(s.stack[0]).toEqual({ k: "alg", src: "2*X" });
  });

  it("FR-CAS-2: ∫ of '2*X' is 'X^2' (no +C, documented); →NUM evaluates", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'2*X' 'X' ∫");
    expect(s.stack[0]).toEqual({ k: "alg", src: "X^2" });
    line(s, "3 'X' STO");
    dispatchRpl(s, "→NUM");
    expect(nums(s.stack)).toEqual([9]);
  });

  it("FR-CAS-3: EXPAN and COLCT rewrite; FACTOR by name", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'(Q+1)^2' EXPAN");
    expect(s.stack[0]).toEqual({ k: "alg", src: "1+2*Q+Q^2" });
    line(s, "CLEAR 'Q+Q+2*Q' COLCT");
    expect(s.stack[0]).toEqual({ k: "alg", src: "4*Q" });
    line(s, "CLEAR 'Q^2-4' FACTOR");
    expect(s.stack[0]).toEqual({ k: "alg", src: "(-2+Q)*(2+Q)" });
  });

  it("FR-CAS-4: ISOL solves 'X^2-4' for X → the solution list {2, -2}", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'X^2-4' 'X' ISOL");
    expect(fmtTop(s)).toBe("{ 2 -2 }");
  });

  it("TAYLR builds the Maclaurin polynomial from derivatives", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'EXP(Z)' 'Z' 3 TAYLR EVAL"); // no Z defined → stays symbolic
    const top = s.stack[0];
    expect(top.k).toBe("alg");
    // evaluate at Z = 1: 1 + 1 + 1/2 + 1/6 = 2.6666…
    line(s, "1 'Z' STO");
    dispatchRpl(s, "EVAL");
    expect(nums(s.stack)[0]).toBeCloseTo(2.666666667, 6);
  });

  it("SHOW lists an algebraic's variables; SIZE counts top-level objects", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'A+B*C' SHOW");
    expect(fmtTop(s)).toBe("{ 'A' 'B' 'C' }");
    line(s, "CLEAR 'A+B' SIZE");
    expect(nums(s.stack)).toEqual([3]); // operator + two operands
  });

  it("FR-CAS-6/FR-IO-1: toLatex feeds KaTeX without throwing", async () => {
    await casLoaded;
    const { getCas } = await import("@/lib/engine/cas/provider");
    const { objToTex } = await import("@/lib/render/tex");
    const katex = (await import("katex")).default;
    const tex = getCas()!.toLatex("X^2+1");
    expect(tex).toBe("X^{2}+1");
    const rendered = katex.renderToString(
      objToTex({ k: "alg", src: "X^2+1" }, { mode: "STD", digits: 4 }, 10),
      { throwOnError: true },
    );
    expect(rendered).toContain("katex");
  });

  it("subexpression editing defers honestly to the heavy tier", async () => {
    await casLoaded;
    const s = createRpl();
    line(s, "'X+1' 1 FORM");
    expect(s.error).toMatch(/P19/);
  });
});

describe("P17 the 48SX: plotting, polynomials, 48 keys", () => {
  it("DoD: 'X^2-3' STEQ DRAW samples a parabola crossing zero near ±√3", () => {
    const s = createRpl();
    line(s, "'X^2-3' STEQ");
    dispatchRpl(s, "DRAW");
    expect(s.plot?.kind).toBe("fn");
    const pts = (s.plot?.points ?? []).filter((p) => p.y !== null) as { x: number; y: number }[];
    expect(pts.length).toBeGreaterThan(100);
    // sign change brackets √3 ≈ 1.732
    const cross = pts.find((p, i) => i > 0 && pts[i - 1].y < 0 && p.y >= 0 && p.x > 0);
    expect(cross && Math.abs(cross.x - Math.sqrt(3)) < 0.2).toBe(true);
    dispatchRpl(s, "ERASE");
    expect(s.plot).toBeNull();
  });

  it("POLAR plots r(θ) in cartesian space", () => {
    const s = createRpl();
    line(s, "RAD '2' STEQ POLAR DRAW"); // r = 2 → a circle of radius 2
    const pts = (s.plot?.points ?? []).filter((p) => p.y !== null) as { x: number; y: number }[];
    expect(s.plot?.kind).toBe("polar");
    for (const p of pts.slice(0, 10)) {
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(2, 9);
    }
    dispatchRpl(s, "ON");
    expect(s.plot).toBeNull();
  });

  it("DoD: PROOT of [1 0 -3] → ±√3; PEVAL evaluates by Horner", () => {
    const s = createRpl();
    line(s, "[ 1 0 -3 ] PROOT");
    const top = s.stack[0];
    expect(top.k).toBe("list");
    if (top.k === "list") {
      const roots = top.items.map((o) => (o.k === "real" ? num(o.v) : NaN)).sort((a, b) => a - b);
      expect(roots[0]).toBeCloseTo(-Math.sqrt(3), 7);
      expect(roots[1]).toBeCloseTo(Math.sqrt(3), 7);
    }
    line(s, "CLEAR [ 2 3 4 ] 10 PEVAL"); // 2x²+3x+4 at 10
    expect(nums(s.stack)).toEqual([234]);
  });

  it("→V2/→V3/V→ build and explode vectors; OBJ→ decomposes", () => {
    const s = createRpl();
    line(s, "3 4 →V2 ABS");
    expect(nums(s.stack)).toEqual([5]);
    line(s, "CLEAR 1 2 3 →V3 V→");
    expect(nums(s.stack)).toEqual([1, 2, 3]);
    line(s, "CLEAR { 7 8 } OBJ→");
    expect(nums(s.stack)).toEqual([7, 8, 2]);
    line(s, "CLEAR (3,4) OBJ→");
    expect(nums(s.stack)).toEqual([3, 4]);
  });

  it("→Q finds the rational form; DEF defines a callable function", () => {
    const s = createRpl();
    line(s, "0.5 →Q");
    expect(s.stack[0]).toEqual({ k: "alg", src: "1/2" });
    line(s, "CLEAR 'F(X)=X^2+1' DEF 4 F");
    expect(nums(s.stack)).toEqual([17]);
  });

  it("ENTER auto-closes open delimiters, like the 48", () => {
    const s = createRpl();
    s.entry = "« 1 2 +";
    dispatchRpl(s, "ENTER");
    expect(s.stack[0]).toEqual({ k: "prog", body: "1 2 +" });
    line(s, "CLEAR");
    s.entry = "{ 1 2";
    dispatchRpl(s, "ENTER");
    expect(fmtTop(s)).toBe("{ 1 2 }");
  });

  it("alpha-access ids (αA) type; MTH nests submenus; VAR is the vars menu", () => {
    const s = createRpl();
    dispatchRpl(s, "αA");
    dispatchRpl(s, "αB");
    expect(s.entry).toBe("AB");
    dispatchRpl(s, "ON");
    dispatchRpl(s, "MTH");
    expect(menuLabels(s)).toEqual(["PARTS", "PROB", "HYP", "MATR", "VECTR", "BASE"]);
    pressSoft(s, 1); // PROB
    expect(menuLabels(s)[0]).toBe("COMB");
    line(s, "5 3");
    pressSoft(s, 0); // COMB
    expect(nums(s.stack)).toEqual([10]);
    dispatchRpl(s, "VAR");
    expect(s.menu?.name).toBe("USER");
  });

  it("PICT primitives: PIXON, LINE, PVIEW, PX→C round-trip", () => {
    const s = createRpl();
    line(s, "(0,0) PIXON (1,1) (0,0) LINE");
    expect(s.pict.length).toBeGreaterThan(1);
    dispatchRpl(s, "PVIEW");
    expect(s.plot?.kind).toBe("pict");
    line(s, "CLEAR (65,32) PX→C C→PX"); // centre pixel round-trips
    const z = s.stack[0];
    expect(z.k === "cpx" && Math.abs(z.re - 65) <= 1).toBe(true);
  });

  it("the TIME key opens its menu; TIME/DATE ride the injectable clock", async () => {
    const { setRplClock } = await import("@/lib/engine/rpl");
    setRplClock(() => new Date(2026, 6, 11, 9, 5, 30));
    const s = createRpl();
    dispatchRpl(s, "TIME"); // the KEY opens the menu
    expect(menuLabels(s)[0]).toBe("DATE");
    pressSoft(s, 1); // the TIME command
    expect(fmtTop(s)).toBe("9.053");
    pressSoft(s, 0); // DATE → 7.112026
    expect(fmtTop(s)).toBe("7.112026");
    setRplClock(() => new Date());
  });

  it("I/O and LIBRARY stub honestly; EQUATION opens algebraic entry", () => {
    const s = createRpl();
    dispatchRpl(s, "I/O");
    pressSoft(s, 0); // SEND
    expect(s.error).toMatch(/No I\/O port/);
    dispatchRpl(s, "EQUATION");
    expect(s.entry).toBe("'");
  });
});

describe("P18 the 48G: stat plots, fits, lists, linear algebra, TVM", () => {
  it("the right-shift APP launchers open their menus (oracle ids)", () => {
    const s = createRpl();
    dispatchRpl(s, "SOLVE (cmd menu)");
    expect(s.menu?.name).toBe("SOLVE");
    dispatchRpl(s, "SYMBOLIC (cmd menu)");
    expect(menuLabels(s)[0]).toBe("COLCT");
  });

  it("list processing: SORT/REVLIST/ΣLIST/ΠLIST/ΔLIST, DOLIST, STREAM, SEQ", () => {
    const s = createRpl();
    line(s, "{ 3 1 2 } SORT");
    expect(fmtTop(s)).toBe("{ 1 2 3 }");
    line(s, "REVLIST");
    expect(fmtTop(s)).toBe("{ 3 2 1 }");
    line(s, "ΣLIST");
    expect(nums(s.stack)).toEqual([6]);
    line(s, "CLEAR { 1 2 3 4 } ΠLIST");
    expect(nums(s.stack)).toEqual([24]);
    line(s, "CLEAR { 1 4 9 } ΔLIST");
    expect(fmtTop(s)).toBe("{ 3 5 }");
    line(s, "CLEAR { 1 2 3 } « 2 × » DOLIST");
    expect(fmtTop(s)).toBe("{ 2 4 6 }");
    line(s, "CLEAR { 1 2 3 4 } « + » STREAM");
    expect(nums(s.stack)).toEqual([10]);
    line(s, "CLEAR 'X^2' 'X' 1 4 1 SEQ");
    expect(fmtTop(s)).toBe("{ 1 4 9 16 }");
  });

  it("linear algebra tokens: RREF, RANK, LU, QR, SVD, EGVL", () => {
    const s = createRpl();
    line(s, "[ [ 1 2 ] [ 2 4 ] ] RANK");
    expect(nums(s.stack)).toEqual([1]);
    line(s, "CLEAR [ [ 1 2 ] [ 3 4 ] ] RREF");
    expect(fmtTop(s)).toBe("[[ 1 0 ][ 0 1 ]]");
    line(s, "CLEAR [ [ 4 3 ] [ 6 3 ] ] LU");
    expect(s.stack).toHaveLength(2); // L and U
    line(s, "CLEAR [ [ 2 0 ] [ 0 3 ] ] EGVL");
    const vals = s.stack[0];
    expect(vals.k === "list" && vals.items.length).toBe(2);
    line(s, "CLEAR [ [ 3 0 ] [ 0 4 ] ] SVD");
    expect(s.stack).toHaveLength(3); // U, S, V
  });

  it("48G curve fits ride the P16 core: EXPFIT recovers 2·e^(0.5x); PREDY forecasts", () => {
    const s = createRpl();
    for (const [x, y] of [[1, 2 * Math.exp(0.5)], [2, 2 * Math.exp(1)], [3, 2 * Math.exp(1.5)]]) {
      line(s, `{ ${x} ${y} } Σ+`);
    }
    dispatchRpl(s, "BESTFIT");
    expect(s.fitModel).toBe("EXPFIT");
    line(s, "4 PREDY");
    expect(nums(s.stack)[0]).toBeCloseTo(2 * Math.exp(2), 6);
    line(s, `CLEAR ${2 * Math.exp(2)} PREDX`);
    expect(nums(s.stack)[0]).toBeCloseTo(4, 6);
  });

  it("FR-PLOT-3: SCLΣ autoscales, DRWΣ scatters, BARPLOT/HISTPLOT draw segments", () => {
    const s = createRpl();
    for (const [x, y] of [[1, 2], [2, 4], [3, 6]]) line(s, `{ ${x} ${y} } Σ+`);
    dispatchRpl(s, "SCLΣ");
    dispatchRpl(s, "DRWΣ");
    expect(s.plot?.kind).toBe("pict");
    expect(s.plot?.points).toHaveLength(3);
    dispatchRpl(s, "BARPLOT");
    expect(s.plot?.kind).toBe("fn");
    // one segment (2 points + gap) per bar
    expect(s.plot?.points.length).toBe(9);
    dispatchRpl(s, "HISTPLOT");
    expect(s.plot?.points.length).toBeGreaterThan(0);
  });

  it("XRNG/YRNG/AUTO control the window", () => {
    const s = createRpl();
    line(s, "'X^2' STEQ -2 2 XRNG AUTO");
    expect(s.ppar.pmin[0]).toBe(-2);
    expect(s.ppar.pmax[1]).toBeCloseTo(4, 6);
    line(s, "0 10 YRNG");
    expect(s.ppar.pmax[1]).toBe(10);
  });

  it("FR-PLOT-2: WIREFRAME projects a 3D surface to polylines", () => {
    const s = createRpl();
    line(s, "'X+Y' STEQ WIREFRAME");
    expect(s.plot?.kind).toBe("polar"); // free-extent projection
    const finite = (s.plot?.points ?? []).filter((p) => p.y !== null);
    expect(finite.length).toBeGreaterThan(200); // 2×15 polylines × 15 samples
  });

  it("FR-FIN: TVMROOT solves PMT on the P7 engine; AMORT splits payments", () => {
    const s = createRpl();
    // the P7 reference mortgage: 360 months, 6%/yr, 100k → PMT ≈ −599.55
    line(s, "360 'N' STO 6 'I%YR' STO 100000 'PV' STO 0 'FV' STO");
    line(s, "'PMT' TVMROOT");
    expect(nums(s.stack)[0]).toBeCloseTo(-599.55, 2);
    line(s, "CLEAR 12 AMORT");
    // positive convention: principal retired + interest paid; balance falls
    const [pr, iTot, bal] = nums(s.stack);
    expect(pr + iTot).toBeCloseTo(599.55 * 12, 1);
    expect(bal).toBeCloseTo(100000 - pr, 1);
    expect(iTot).toBeGreaterThan(5900); // first-year interest ≈ 5967
  });

  it("MSGBOX shows; INFORM/CHOOSE and MSOLVR/RKF defer honestly", () => {
    const s = createRpl();
    line(s, '"HI" MSGBOX');
    expect(s.msg).toBe("HI");
    dispatchRpl(s, "INFORM");
    expect(s.error).toMatch(/async UI bridge/);
    dispatchRpl(s, "MSOLVR");
    expect(s.error).toMatch(/deferred/);
  });
});

describe("P12 command line, editing, and recovery", () => {
  it("the ◆ key types the algebraic delimiter; operators append in text mode", () => {
    const s = createRpl();
    run(s, "◆", "X", "+", "1", "◆");
    expect(s.entry).toBe("'X+1'");
    dispatchRpl(s, "ENTER");
    expect(s.stack[0]).toEqual({ k: "alg", src: "X+1" });
  });

  it("« » program entry from keys: commands TYPE their names inside «", () => {
    const s = createRpl();
    run(s, "«", "1", "SPACE", "+", "≫");
    expect(s.entry).toBe("« 1 + »");
    dispatchRpl(s, "ENTER");
    expect(s.stack[0]).toEqual({ k: "prog", body: "1 +" });
  });

  it("a syntax error keeps the command line for correction", () => {
    const s = createRpl();
    s.entry = "1 ) 2"; // stray closer (unclosed delimiters auto-close, P17)
    dispatchRpl(s, "ENTER");
    expect(s.error).toBe("Syntax Error");
    expect(s.entry).toBe("1 ) 2");
  });

  it("DEL backspaces the line; ON clears it", () => {
    const s = createRpl();
    run(s, "1", "2");
    dispatchRpl(s, "DEL");
    expect(s.entry).toBe("1");
    dispatchRpl(s, "ON");
    expect(s.entry).toBeNull();
  });

  it("EDIT puts level 1 back on the command line, losslessly", () => {
    const s = createRpl();
    line(s, "{ 1 2 3 }");
    dispatchRpl(s, "EDIT");
    expect(s.entry).toBe("{ 1 2 3 }");
  });

  it("COMMAND recalls the previous command line", () => {
    const s = createRpl();
    line(s, "1 2 +");
    dispatchRpl(s, "COMMAND");
    expect(s.entry).toBe("1 2 +");
  });

  it("UNDO restores the stack from before the last line; LAST re-pushes args", () => {
    const s = createRpl();
    line(s, "1 2 +");
    expect(nums(s.stack)).toEqual([3]);
    dispatchRpl(s, "UNDO");
    expect(s.stack).toEqual([]);
    dispatchRpl(s, "UNDO");
    expect(nums(s.stack)).toEqual([3]);
    dispatchRpl(s, "LAST");
    expect(nums(s.stack)).toEqual([3, 1, 2]);
  });

  it("executable keys commit the open line first: 3 then + adds to the stack", () => {
    const s = createRpl();
    line(s, "5");
    run(s, "3", "+");
    expect(nums(s.stack)).toEqual([8]);
  });
});

describe("P12 softkey MENU system", () => {
  it("STACK opens its menu; NEXT/PREV page; labels come from the roster", () => {
    const s = createRpl();
    dispatchRpl(s, "STACK");
    expect(menuLabels(s)).toEqual(["DUP", "OVER", "DUP2", "DROP2", "ROT", "LIST→"]);
    dispatchRpl(s, "NEXT");
    expect(menuLabels(s)).toEqual(["ROLLD", "PICK", "DUPN", "DROPN", "DEPTH", "→LIST"]);
    dispatchRpl(s, "PREV");
    expect(menuLabels(s)[0]).toBe("DUP");
  });

  it("a softkey executes its label: STACK/DUP duplicates level 1", () => {
    const s = createRpl();
    line(s, "7");
    dispatchRpl(s, "STACK");
    pressSoft(s, 0); // DUP
    expect(nums(s.stack)).toEqual([7, 7]);
  });

  it("TRIG softkeys run engine trig; MODE FIX takes its digits from the stack", () => {
    const s = createRpl();
    line(s, "30");
    dispatchRpl(s, "TRIG");
    pressSoft(s, 0); // SIN (DEG)
    expect(nums(s.stack)[0]).toBeCloseTo(0.5, 12);
    line(s, "CLEAR 4");
    dispatchRpl(s, "MODE");
    pressSoft(s, 1); // FIX
    expect(s.disp).toEqual({ mode: "FIX", digits: 4 });
    line(s, "2");
    expect(fmtTop(s)).toBe("2.0000");
    pressSoft(s, 0); // STD
    expect(s.disp.mode).toBe("STD");
  });

  it("the USER menu lists variables; its softkey evaluates the variable", () => {
    const s = createRpl();
    line(s, "« 2 × » 'DBL' STO");
    dispatchRpl(s, "USER");
    expect(menuLabels(s)[0]).toBe("DBL");
    line(s, "21");
    pressSoft(s, 0);
    expect(nums(s.stack)).toEqual([42]);
  });

  it("BRANCH softkeys TYPE program words into the command line", () => {
    const s = createRpl();
    dispatchRpl(s, "BRANCH");
    pressSoft(s, 0); // IF
    expect(s.entry).toBe("IF ");
  });

  it("ALGEBRA opens its menu (execution is the P14 suite's concern)", () => {
    const s = createRpl();
    dispatchRpl(s, "ALGEBRA");
    expect(menuLabels(s)).toEqual(["COLCT", "EXPAN", "SIZE", "FORM", "OBSUB", "EXSUB"]);
  });

  it("SOLVR lists the equation's variables; softkey stores level 1", () => {
    const s = createRpl();
    line(s, "'A+B' STEQ");
    dispatchRpl(s, "SOLV");
    pressSoft(s, 2); // SOLVR
    expect(menuLabels(s).slice(0, 2)).toEqual(["A", "B"]);
    line(s, "5");
    pressSoft(s, 0); // store into A
    expect(s.home.vars["A"]).toEqual({ k: "real", v: bn(5) });
  });
});

describe("P15 directories & the HP-28S deltas", () => {
  it("CRDIR/HOME/PATH/VARS: the directory tree navigates and lists", () => {
    const s = createRpl();
    line(s, "'D1' CRDIR PATH");
    expect(fmtTop(s)).toBe("{ 'HOME' }");
    line(s, "CLEAR D1 PATH"); // evaluating a directory name enters it
    expect(fmtTop(s)).toBe("{ 'HOME' 'D1' }");
    line(s, "CLEAR 42 'D' STO VARS");
    expect(fmtTop(s)).toBe("{ 'D' }");
    dispatchRpl(s, "HOME");
    line(s, "CLEAR VARS");
    expect(fmtTop(s)).toBe("{ 'D1' }");
  });

  it("name resolution walks UP the path: HOME vars visible from a subdir", () => {
    const s = createRpl();
    line(s, "7 'G' STO 'D1' CRDIR D1");
    line(s, "G 1 +"); // G resolves in HOME from inside D1
    expect(nums(s.stack)).toEqual([8]);
    line(s, "CLEAR 9 'G' STO G"); // a local G shadows HOME's
    expect(nums(s.stack)).toEqual([9]);
    dispatchRpl(s, "HOME");
    line(s, "CLEAR G");
    expect(nums(s.stack)).toEqual([7]);
  });

  it("PURGE removes only EMPTY subdirectories, like the 28S", () => {
    const s = createRpl();
    line(s, "'D1' CRDIR D1 1 'V' STO");
    dispatchRpl(s, "HOME");
    line(s, "'D1' PURGE");
    expect(s.error).toBe("Non-Empty Directory");
    line(s, "D1 'V' PURGE");
    dispatchRpl(s, "HOME");
    line(s, "'D1' PURGE VARS");
    expect(fmtTop(s)).toBe("{  }"); // empty list
  });

  it("COMB and PERM are exact on the tower", () => {
    const s = createRpl();
    line(s, "52 5 COMB");
    expect(nums(s.stack)).toEqual([2598960]);
    line(s, "CLEAR 10 3 PERM");
    expect(nums(s.stack)).toEqual([720]);
  });

  it("MEMORY menu opens; MENU builds the CUSTOM row; MENUS is the meta-menu", () => {
    const s = createRpl();
    dispatchRpl(s, "MEMORY");
    expect(menuLabels(s)).toEqual(["MEM", "MENU", "ORDER", "PATH", "HOME", "CRDIR"]);
    line(s, "{ DUP DROP } MENU");
    expect(menuLabels(s).slice(0, 2)).toEqual(["DUP", "DROP"]);
    line(s, "5");
    pressSoft(s, 0); // CUSTOM/DUP executes the command
    expect(nums(s.stack)).toEqual([5, 5]);
    dispatchRpl(s, "MENUS");
    expect(menuLabels(s)[0]).toBe("STACK");
    pressSoft(s, 0); // opens the STACK menu
    expect(menuLabels(s)[0]).toBe("DUP");
  });

  it("the 28S MODE menu single-toggles flip the P12 mode flags", () => {
    const s = createRpl();
    expect(s.modes.cmd).toBe(true);
    dispatchRpl(s, "CMD"); // the 28S single-toggle, reachable as a command id
    expect(s.modes.cmd).toBe(false);
    dispatchRpl(s, "TRAC");
    expect(s.modes.trace).toBe(true);
  });

  it("the directory tree persists (round-trip incl. path)", async () => {
    const { snapshot, restore } = await import("@/lib/engine/persistence");
    const { createRpn } = await import("@/lib/engine/rpn");
    const s = createRpl();
    line(s, "'D1' CRDIR D1 3 'K' STO");
    const state = JSON.parse(JSON.stringify(snapshot(createRpn(), s, "HP-28S")));
    const engines = restore(state);
    expect(engines.rpl.path).toEqual(["D1"]);
    expect(engines.rpl.home.subs["D1"].vars["K"]).toEqual({ k: "real", v: bn(3) });
  });
});

describe("P12 modes, flags, stats, printing", () => {
  it("user flags: SF / FS? / FC?C", () => {
    const s = createRpl();
    line(s, "5 SF 5 FS?");
    expect(nums(s.stack)).toEqual([1]);
    line(s, "CLEAR 5 FC?C 5 FS?");
    expect(nums(s.stack)).toEqual([0, 0]); // FC? of a set flag = 0, then cleared
  });

  it("Σ+ accumulates; MEAN/SDEV/TOT on one column", () => {
    const s = createRpl();
    line(s, "1 Σ+ 2 Σ+ 3 Σ+ NΣ MEAN TOT");
    expect(nums(s.stack)).toEqual([3, 2, 6]);
  });

  it("two-column stats: LR fits y = 2x, PREDV predicts", () => {
    const s = createRpl();
    line(s, "{ 1 2 } Σ+ { 2 4 } Σ+ { 3 6 } Σ+ LR");
    const [b, m] = nums(s.stack);
    expect(b).toBeCloseTo(0, 9);
    expect(m).toBeCloseTo(2, 9);
    line(s, "CLEAR 10 PREDV");
    expect(nums(s.stack)[0]).toBeCloseTo(20, 9);
  });

  it("UTPN: standard normal upper tail at 0 is 0.5", () => {
    const s = createRpl();
    line(s, "0 1 0 UTPN");
    expect(nums(s.stack)[0]).toBeCloseTo(0.5, 6);
  });

  it("PR1 prints the top to the tape; DISP shows a message line", () => {
    const s = createRpl();
    line(s, "42 PR1");
    expect(s.hist.some((h) => h.op === "🖨 42")).toBe(true);
    line(s, '"HELLO" 1 DISP');
    expect(s.msg).toBe("HELLO");
    dispatchRpl(s, "CLLCD");
    expect(s.msg).toBeNull();
  });

  it("RAND is deterministic from the RDZ seed", () => {
    const a = createRpl();
    const b = createRpl();
    line(a, "7 RDZ RAND");
    line(b, "7 RDZ RAND");
    expect(fmtTop(a)).toBe(fmtTop(b));
  });
});
