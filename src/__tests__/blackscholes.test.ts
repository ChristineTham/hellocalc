// FR-FIN-4: Black–Scholes European option pricing.
import { describe, expect, it } from "vitest";
import { blackScholes } from "@/lib/engine/finance";
import { bn, num } from "@/lib/engine/config";

describe("Black–Scholes (FR-FIN-4)", () => {
  it("prices the canonical ATM option (S=K=100, r=5%, σ=20%, T=1yr)", () => {
    const { call, put } = blackScholes(bn(100), bn(100), bn("0.05"), bn("0.2"), bn(1));
    expect(num(call)).toBeCloseTo(10.4506, 3);
    expect(num(put)).toBeCloseTo(5.5735, 3);
  });

  it("satisfies put–call parity: C − P = S − K·e^(−rT)", () => {
    const { call, put } = blackScholes(bn(120), bn(100), bn("0.03"), bn("0.25"), bn("0.5"));
    const parity = num(call) - num(put);
    expect(parity).toBeCloseTo(120 - 100 * Math.exp(-0.03 * 0.5), 4);
  });

  it("degenerates to discounted intrinsic value at zero vol / zero time", () => {
    const { call, put } = blackScholes(bn(110), bn(100), bn("0.05"), bn(0), bn(1));
    expect(num(call)).toBeCloseTo(110 - 100 * Math.exp(-0.05), 6);
    expect(num(put)).toBe(0); // out of the money
  });
});
