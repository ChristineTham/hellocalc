// Step-8 paper-aux tests (docs/responsive-layout.md §14.3): three SEPARATE
// paper components — stack note, TVM note, history tape — arranged notes-first
// with the tape printing downward; the side machine gets the compact bay.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuxPanel } from "@/components/calculator/AuxPanel";
import type { RpnState } from "@/components/calculator/Display";
import { bn, type Value } from "@/lib/engine/config";

const zero = bn(0);
const state: RpnState = {
  T: zero,
  Z: zero,
  Y: zero,
  X: zero,
  lastX: zero,
  entry: null,
  dec: 2,
  prefix: "none",
  latex: "0",
  hist: [{ op: "+", v: "5.00" }],
};

const fmt = (n: Value, dec?: number) => n.toFixed(dec ?? 2);

describe("AuxPanel (paper aux)", () => {
  it("renders stack note, TVM note and history tape as separate paper pieces", () => {
    const { container } = render(
      <AuxPanel state={state} family="voyager" fmt={fmt} showRegisters />,
    );
    for (const slot of ["stack-note", "vars-note", "history-tape"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull();
    }
    // TVM registers read — until the finance module fills them
    expect(screen.getAllByText("—")).toHaveLength(5);
    // the tape prints the history
    expect(screen.getByText("5.00")).toBeTruthy();
  });

  it("orders content notes → tape (§14.3: tape prints downward)", () => {
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

  it("RPL models get NO paper stack (glass owns it) but DO get a Variables note (§14 rev 5)", () => {
    const { container } = render(<AuxPanel state={state} family="rpl" fmt={fmt} />);
    expect(container.querySelector('[data-slot="stack-note"]')).toBeNull();
    expect(container.querySelector('[data-slot="vars-note"]')).not.toBeNull();
    expect(container.textContent).toContain("Variables");
    expect(container.querySelector('[data-slot="history-tape"]')).not.toBeNull();
  });

  it("the bay carries vars + tape with CSS-swap classes (§14 rev 5)", () => {
    const { container } = render(
      <AuxPanel state={state} family="rpl" fmt={fmt} variant="bay" />,
    );
    expect(container.querySelector('[data-slot="vars-note"].bay-vars')).not.toBeNull();
    expect(container.querySelector('[data-slot="history-tape"].bay-tape')).not.toBeNull();
    expect(container.querySelector('[data-slot="stack-note"]')).toBeNull();
  });
});
