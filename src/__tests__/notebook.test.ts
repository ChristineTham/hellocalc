import { describe, it, expect } from "vitest";
import { evalNotebook } from "@/lib/engine/notebook";

describe("native-mode notebook (P23, FR-UI-4)", () => {
  it("blocks share ONE scope in order: definitions flow downstream", () => {
    const out = evalNotebook(["5 'A' STO A", "A 2 +", "'A^2' EVAL"]);
    expect(out.map((r) => r.text)).toEqual(["5", "7", "25"]);
    expect(out.every((r) => r.ok)).toBe(true);
  });

  it("re-running re-evaluates downstream with the new definition", () => {
    const out = evalNotebook(["6 'A' STO A", "A 2 +"]);
    expect(out[1].text).toBe("8");
  });

  it("a bad block reports its error and does not poison the next", () => {
    const out = evalNotebook(["1 0 ÷", "2 3 +"]);
    expect(out[0].ok).toBe(false);
    expect(out[0].text).toBe("Infinite Result");
    expect(out[1]).toEqual({ ok: true, text: "5" });
  });

  it("empty blocks pass through", () => {
    expect(evalNotebook(["", "4"])).toEqual([
      { ok: true, text: "" },
      { ok: true, text: "4" },
    ]);
  });
});
