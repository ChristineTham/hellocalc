// FR-NUM-1: the BigNumber working precision is user-selectable at runtime.
import { afterEach, describe, expect, it } from "vitest";
import { bn, DEFAULT_PRECISION, getPrecision, math, setPrecision } from "@/lib/engine/config";

afterEach(() => setPrecision(DEFAULT_PRECISION)); // never leak precision across tests

describe("value-tower precision (FR-NUM-1)", () => {
  it("defaults to 40 significant digits", () => {
    expect(getPrecision()).toBe(DEFAULT_PRECISION);
  });

  it("raising precision yields more significant digits of 1/3", () => {
    setPrecision(12);
    const low = math.divide(bn(1), bn(3)).toString().replace("0.", "");
    setPrecision(64);
    const high = math.divide(bn(1), bn(3)).toString().replace("0.", "");
    expect(low.length).toBeLessThan(high.length);
    expect(high.length).toBeGreaterThanOrEqual(60);
  });

  it("clamps to the [7, 100] window", () => {
    setPrecision(999);
    expect(getPrecision()).toBe(100);
    setPrecision(1);
    expect(getPrecision()).toBe(7);
  });

  it("exact decimal arithmetic still holds at any precision (0.1 + 0.2)", () => {
    setPrecision(24);
    expect(math.add(bn("0.1"), bn("0.2")).toString()).toBe("0.3");
  });
});
