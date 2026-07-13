// FR-IO-4: Mathematica / Wolfram-Language interchange for algebraic expressions.
import { describe, expect, it } from "vitest";
import { fromWolfram, toWolfram } from "@/lib/engine/rpl/wolfram";
import { createRpl, dispatchRpl } from "@/lib/engine/rpl";

describe("Wolfram interchange (FR-IO-4)", () => {
  it("exports algebraic → Wolfram InputForm", () => {
    expect(toWolfram("sin(x)+x^2")).toBe("(Sin[x] + (x ^ 2))");
    expect(toWolfram("ln(pi)*sqrt(2)")).toBe("(Log[Pi] * Sqrt[2])");
    expect(toWolfram("atan(y/x)")).toBe("ArcTan[(y / x)]");
  });

  it("imports Wolfram InputForm → algebraic", () => {
    expect(fromWolfram("Sin[x] + Cos[y]")).toBe("sin(x) + cos(y)");
    expect(fromWolfram("Sqrt[Pi]")).toBe("sqrt(pi)");
    expect(fromWolfram("ArcTan[y/x]")).toBe("atan(y/x)");
  });

  it("round-trips a simple expression through both directions", () => {
    const wl = toWolfram("cos(2*x)");
    expect(wl).toBe("Cos[(2 * x)]");
    // fromWolfram back yields an equivalent algebraic the parser accepts
    expect(fromWolfram(wl)).toBe("cos((2 * x))");
  });

  it("exposes →WL and WL→ as RPL commands", () => {
    const s = createRpl();
    s.stack.push({ k: "alg", src: "sin(x)" });
    dispatchRpl(s, "→WL");
    expect(s.stack.at(-1)).toMatchObject({ k: "str", v: "Sin[x]" });
    dispatchRpl(s, "WL→");
    expect(s.stack.at(-1)).toMatchObject({ k: "alg", src: "sin(x)" });
  });
});
