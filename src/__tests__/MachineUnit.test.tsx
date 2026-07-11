// Step-7 integration test (docs/responsive-layout.md §14.1): the machine is
// ONE bezel containing nameplate, LCD slot, paper bay and keyboard — the
// calculator anatomy the v1 split regions broke.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MachineUnit } from "@/components/calculator/MachineUnit";
import { MODELS } from "@/components/calculator/models";
import type { RpnCalculator } from "@/hooks/useRpnCalculator";
import type { RplCalculator } from "@/hooks/useRplCalculator";
import type { RpnState } from "@/components/calculator/Display";
import { bn, type Value } from "@/lib/engine/config";
import { createRpn } from "@/lib/engine/rpn";
import { createRpl } from "@/lib/engine/rpl";

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
  hist: [],
};

const fmt = (n: Value, dec?: number) => n.toFixed(dec ?? 2);
const renderLatex = (tex: string) => ({ __html: tex });
const noop = () => {};

const rpn: RpnCalculator = {
  state,
  prefix: "none",
  press: noop,
  soft: noop,
  arm: noop,
  recall: noop,
  fmt,
  renderLatex,
  engine: createRpn(),
  restore: noop,
};
const rpl: RplCalculator = {
  state: { ...state, rpl: [] },
  prefix: "none",
  press: noop,
  soft: noop,
  arm: noop,
  recall: noop,
  fmt,
  renderLatex,
  engine: createRpl(),
  restore: noop,
};

describe("MachineUnit", () => {
  it("hosts nameplate, LCD slot, paper bay and keyboard inside ONE bezel", () => {
    const { container } = render(
      <MachineUnit
        model={MODELS["HP-12C"]}
        rpn={rpn}
        rpl={rpl}
        lcd={<div data-testid="the-lcd" />}
        paper={<div data-testid="the-paper" />}
      />,
    );
    const machine = container.querySelector<HTMLElement>('[data-slot="machine"]');
    if (!machine) throw new Error("no machine bezel");
    // all four areas live INSIDE the one bezel element
    for (const slot of ["machine-np", "machine-lcd", "machine-aux", "machine-kbd"]) {
      expect(machine.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull();
    }
    expect(machine.querySelector('[data-testid="the-lcd"]')).not.toBeNull();
    expect(machine.querySelector('[data-testid="the-paper"]')).not.toBeNull();
    expect(machine.querySelector('[data-slot="keyboard"]')).not.toBeNull();
    // nameplate: our brand + the BARE model number, no third-party marks (§14 rev 7)
    expect(machine.textContent).toContain("HELLO·CALC");
    expect(machine.textContent).not.toContain("HEWLETT");
    expect(machine.textContent).not.toContain("HP-12C");
    expect(machine.querySelector('[data-slot="machine-np"]')?.textContent).toContain("12C");
    expect(machine.querySelector('[data-slot="hc-badge"]')).not.toBeNull();
    expect(machine.dataset.family).toBe("voyager");
  });

  it("classic machines wear a centred text-only nameplate (below the keys via CSS)", () => {
    const { container } = render(
      <MachineUnit model={MODELS["HP-35"]} rpn={rpn} rpl={rpl} lcd={<div />} />,
    );
    const machine = container.querySelector<HTMLElement>('[data-slot="machine"]');
    if (!machine) throw new Error("no machine bezel");
    expect(machine.dataset.family).toBe("classic");
    const np = machine.querySelector('[data-slot="machine-np"]');
    expect(np?.textContent).toContain("HELLO·CALC");
    expect(np?.textContent).toContain("35");
    // the classic 35 printed no logo on the face
    expect(np?.querySelector('[data-slot="hc-badge"]')).toBeNull();
  });

  it("renders the family keyboard for RPL models too", () => {
    const { container } = render(
      <MachineUnit model={MODELS["HP-48G"]} rpn={rpn} rpl={rpl} lcd={<div />} />,
    );
    const machine = container.querySelector<HTMLElement>('[data-slot="machine"]');
    if (!machine) throw new Error("no machine bezel");
    expect(
      machine.querySelector('[data-slot="keyboard"] [aria-label="ENTER"]'),
    ).not.toBeNull();
  });
});
