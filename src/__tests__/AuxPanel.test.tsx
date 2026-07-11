// Step-5 aux tests (docs/responsive-layout.md §12.5): stack above history with
// the TVM register strip between them for financial models.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuxPanel } from "@/components/calculator/AuxPanel";
import type { RpnState } from "@/components/calculator/Display";

const state: RpnState = {
  T: 0,
  Z: 0,
  Y: 0,
  X: 0,
  lastX: 0,
  entry: null,
  dec: 2,
  prefix: "none",
  latex: "0",
  hist: [],
};

const fmt = (n: number, dec?: number) => n.toFixed(dec ?? 2);

describe("AuxPanel", () => {
  it("pins the TVM register strip for financial models (unset registers read —)", () => {
    const { container } = render(
      <AuxPanel state={state} family="voyager" fmt={fmt} showRegisters />,
    );
    expect(container.querySelector('[data-slot="tvm-strip"]')).toBeTruthy();
    for (const k of ["n", "i", "PV", "PMT", "FV"]) {
      expect(screen.getByText(k)).toBeTruthy();
    }
    expect(screen.getAllByText("—")).toHaveLength(5);
  });

  it("orders content stack → TVM → history (§12.5 glance priority)", () => {
    const { container } = render(
      <AuxPanel state={state} family="voyager" fmt={fmt} showRegisters />,
    );
    const text = container.textContent ?? "";
    const stackAt = text.indexOf("RPN Stack");
    const tvmAt = text.indexOf("TVM Registers");
    const histAt = text.indexOf("History");
    expect(stackAt).toBeGreaterThanOrEqual(0);
    expect(tvmAt).toBeGreaterThan(stackAt);
    expect(histAt).toBeGreaterThan(tvmAt);
  });

  it("omits the strip for non-financial models", () => {
    const { container } = render(<AuxPanel state={state} family="rpl" fmt={fmt} />);
    expect(container.querySelector('[data-slot="tvm-strip"]')).toBeNull();
  });
});
