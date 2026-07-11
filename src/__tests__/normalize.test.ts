// Model-adapter legend normalization: printed legends → canonical engine ids
// (lib/models/normalize.ts). Guards the "legend strings ARE dispatch ids"
// seam the classic faceplates rely on.
import { describe, expect, it } from "vitest";
import { INVERSE_OF, normalizeFn } from "@/lib/models/normalize";
import { applyFunction, createRpn } from "@/lib/engine/rpn";
import { bn } from "@/lib/engine/config";

describe("normalizeFn", () => {
  it("maps era spellings to canonical ids", () => {
    expect(normalizeFn("ENTER↑")).toBe("ENTER");
    expect(normalizeFn("CLX")).toBe("CLx");
    expect(normalizeFn("CL X")).toBe("CLx");
    expect(normalizeFn("CLEAR")).toBe("CLR");
    expect(normalizeFn("LAST x")).toBe("LSTx");
    expect(normalizeFn("LST X")).toBe("LSTx");
    expect(normalizeFn("ln")).toBe("LN");
    expect(normalizeFn("sin⁻¹")).toBe("SIN⁻¹");
    expect(normalizeFn("e^x")).toBe("eˣ");
    expect(normalizeFn("n!")).toBe("x!");
    expect(normalizeFn("%CH")).toBe("Δ%");
    expect(normalizeFn("+/−")).toBe("CHS");
  });

  it("is identity for unmapped strings — ambiguous prints stay inert", () => {
    expect(normalizeFn("STK")).toBe("STK"); // clear-stack (25) vs print-stack (67)
    expect(normalizeFn("GTO")).toBe("GTO");
  });

  it("every mapped id the engine implements actually dispatches", () => {
    // (mode/format ids like FIX/SCI stay inert by design)
    for (const printed of ["CLX", "LAST x", "ln", "e^x", "n!", "%CH", "·"]) {
      const s = createRpn();
      s.x = bn(3);
      expect(applyFunction(s, normalizeFn(printed)), printed).toBe(true);
    }
  });
});

describe("INVERSE_OF (HP-65 f⁻¹)", () => {
  it("inverts the documented pairs both ways where defined", () => {
    expect(INVERSE_OF["SIN"]).toBe("SIN⁻¹");
    expect(INVERSE_OF["LN"]).toBe("eˣ");
    expect(INVERSE_OF["√x"]).toBe("x²");
    expect(INVERSE_OF["x²"]).toBe("√x");
    expect(INVERSE_OF["yˣ"]).toBe("ˣ√y");
    expect(INVERSE_OF["R↓"]).toBe("R↑");
    expect(INVERSE_OF["1/x"]).toBe("1/x"); // self-inverse
  });
});
