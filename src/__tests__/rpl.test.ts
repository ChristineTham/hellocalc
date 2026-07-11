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

describe("P12 variables, algebraics, programs (the evaluator)", () => {
  it("STO / RCL / PURGE over named variables", () => {
    const s = createRpl();
    line(s, "42 'A' STO");
    expect(s.stack).toEqual([]);
    expect(s.vars["A"]).toEqual({ k: "real", v: bn(42) });
    line(s, "'A' RCL");
    expect(nums(s.stack)).toEqual([42]);
    line(s, "'A' PURGE");
    expect(s.vars["A"]).toBeUndefined();
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
    const x = s.vars["X"];
    expect(x && x.k === "real" && num(x.v)).toBeCloseTo(2, 9);
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
    s.entry = "« 1 +"; // unclosed
    dispatchRpl(s, "ENTER");
    expect(s.error).toBe("Syntax Error");
    expect(s.entry).toBe("« 1 +");
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

  it("ALGEBRA menu opens, but its commands defer honestly to P14", () => {
    const s = createRpl();
    dispatchRpl(s, "ALGEBRA");
    expect(menuLabels(s)[0]).toBe("COLCT");
    line(s, "'X+X'");
    pressSoft(s, 0);
    expect(s.error).toMatch(/P14/);
  });

  it("SOLVR lists the equation's variables; softkey stores level 1", () => {
    const s = createRpl();
    line(s, "'A+B' STEQ");
    dispatchRpl(s, "SOLV");
    pressSoft(s, 2); // SOLVR
    expect(menuLabels(s).slice(0, 2)).toEqual(["A", "B"]);
    line(s, "5");
    pressSoft(s, 0); // store into A
    expect(s.vars["A"]).toEqual({ k: "real", v: bn(5) });
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
