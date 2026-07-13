// FR-NUM-2: IEEE-754 float evaluation as the alternative to the exact tower.
import { describe, expect, it } from "vitest";
import { evalFloat } from "@/lib/engine/rpl/floateval";
import { parseExpr } from "@/lib/engine/rpl/parse";
import { createRpl, dispatchRpl } from "@/lib/engine/rpl";
import { num } from "@/lib/engine/config";

const f = (src: string) => evalFloat(parseExpr(src), () => null);

describe("IEEE-754 float evaluation (FR-NUM-2)", () => {
  it("reproduces the classic binary artifact 0.1 + 0.2 ≠ 0.3", () => {
    expect(f("0.1+0.2")).toBe(0.30000000000000004);
    expect(f("0.1+0.2")).not.toBe(0.3);
  });

  it("evaluates functions + constants in doubles", () => {
    expect(f("sin(pi/6)")).toBeCloseTo(0.5, 12);
    expect(f("sqrt(2)^2")).toBe(2.0000000000000004); // the double-precision drift
  });

  it("EVALF pushes the IEEE result — where the exact tower would give 0.3", () => {
    const s = createRpl();
    s.stack.push({ k: "alg", src: "0.1+0.2" });
    dispatchRpl(s, "EVALF");
    const top = s.stack.at(-1)!;
    expect(top.k).toBe("real");
    expect(top.k === "real" && num(top.v)).toBe(0.30000000000000004);
  });
});
