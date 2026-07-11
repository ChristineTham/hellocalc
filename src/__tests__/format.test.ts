// Phase-1 display formatting (FR-NUM-7): FIX/SCI with digits, straight from
// BigNumber — plus the HP auto-SCI fallbacks at the display-range edges.
import { describe, expect, it } from "vitest";
import { bn } from "@/lib/engine/config";
import { formatValue } from "@/lib/engine/format";

describe("formatValue", () => {
  it("FIX renders fixed decimals from the exact value", () => {
    expect(formatValue(bn(5), { mode: "FIX", digits: 2 })).toBe("5.00");
    expect(formatValue(bn("0.1").plus(bn("0.2")), { mode: "FIX", digits: 2 })).toBe("0.30");
    expect(formatValue(bn("-3.456"), { mode: "FIX", digits: 1 })).toBe("-3.5");
    expect(formatValue(bn(0), { mode: "FIX", digits: 4 })).toBe("0.0000");
  });

  it("SCI renders a mantissa + exponent without a plus sign", () => {
    expect(formatValue(bn(5000), { mode: "SCI", digits: 2 })).toBe("5.00e3");
    expect(formatValue(bn("0.005"), { mode: "SCI", digits: 2 })).toBe("5.00e-3");
  });

  it("FIX overflows to SCI past the 10-digit integer field (HP auto-SCI)", () => {
    expect(formatValue(bn("1e10"), { mode: "FIX", digits: 2 })).toBe("1.00e10");
    expect(formatValue(bn("9999999999"), { mode: "FIX", digits: 2 })).toBe("9999999999.00");
  });

  it("FIX underflows to SCI when the value would display as all zeros", () => {
    expect(formatValue(bn("0.0001"), { mode: "FIX", digits: 2 })).toBe("1.00e-4");
    // …but a value that rounds to a visible digit stays FIX
    expect(formatValue(bn("0.005"), { mode: "FIX", digits: 2 })).toBe("0.01");
  });

  it("ENG snaps the exponent to a multiple of 3 (HP-25)", () => {
    expect(formatValue(bn(12345), { mode: "ENG", digits: 2 })).toBe("12.35e3");
    expect(formatValue(bn("0.0042"), { mode: "ENG", digits: 2 })).toBe("4.20e-3");
    expect(formatValue(bn("1e5"), { mode: "ENG", digits: 2 })).toBe("100.00e3");
    expect(formatValue(bn(0), { mode: "ENG", digits: 2 })).toBe("0.00e0");
  });

  it("non-finite values render as Error", () => {
    expect(formatValue(bn(1).div(bn(0)), { mode: "FIX", digits: 2 })).toBe("Error");
  });
});
