// Step-3 LCD tests (docs/responsive-layout.md §9, §5.3) — PROP-DRIVEN ONLY:
// jsdom has no layout engine, so the @container/lcd default is asserted in
// Playwright. Here we assert the mechanism's DOM contract: both subtrees
// render; data-lcd-force reflects defaultMode/user toggles; the line state
// carries the §11 #8 stack echo.
import { describe, expect, it } from "vitest";
import { fireEvent, render, within } from "@testing-library/react";
import { Display, type RpnState } from "@/components/calculator/Display";
import { bn, type Value } from "@/lib/engine/config";

const state: RpnState = {
  T: bn(4),
  Z: bn(3),
  Y: bn(2),
  X: bn(5),
  lastX: bn(1),
  entry: null,
  dec: 2,
  prefix: "none",
  latex: "5",
  hist: [],
};

const fmt = (n: Value, dec?: number) => n.toFixed(dec ?? 2);
const renderLatex = (tex: string) => ({ __html: `<span class="katex">${tex}</span>` });

function renderDisplay(props: Partial<React.ComponentProps<typeof Display>> = {}) {
  return render(
    <Display
      state={state}
      family="voyager"
      annun={{ f: true, g: true, h: false, alpha: false, begEnd: false }}
      renderLatex={renderLatex}
      fmt={fmt}
      {...props}
    />,
  );
}

function panel(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".lcd-panel");
  if (!el) throw new Error("missing .lcd-panel");
  return el;
}

function subtree(container: HTMLElement, mode: "line" | "mini"): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-lcd-mode="${mode}"]`);
  if (!el) throw new Error(`missing ${mode} subtree`);
  return el;
}

describe("Display — §5.3 line↔mini mechanism (prop-driven)", () => {
  it("always renders BOTH subtrees; no data-lcd-force by default", () => {
    const { container } = renderDisplay();
    expect(subtree(container, "line")).toBeTruthy();
    expect(subtree(container, "mini")).toBeTruthy();
    expect(panel(container).hasAttribute("data-lcd-force")).toBe(false);
  });

  it("defaultMode pins the branch via data-lcd-force (test/SSR seam)", () => {
    const { container } = renderDisplay({ defaultMode: "mini" });
    expect(panel(container).dataset.lcdForce).toBe("mini");
  });

  it("the line chevron forces mini; the mini chevron forces line; user wins over defaultMode", () => {
    const { container } = renderDisplay({ defaultMode: "mini" });
    // each subtree carries its own correctly-labelled toggle
    fireEvent.click(within(subtree(container, "mini")).getByLabelText("Collapse display"));
    expect(panel(container).dataset.lcdForce).toBe("line");
    fireEvent.click(within(subtree(container, "line")).getByLabelText("Expand display"));
    expect(panel(container).dataset.lcdForce).toBe("mini");
  });

  it("line state echoes the stack (Y) by default — §11 #8 resolved ON", () => {
    const { container } = renderDisplay();
    const line = subtree(container, "line");
    expect(within(line).getByText("Y")).toBeTruthy();
    expect(within(line).getByText("2.00")).toBeTruthy();
  });

  it("showStack={false} suppresses the echo", () => {
    const { container } = renderDisplay({ showStack: false });
    expect(within(subtree(container, "line")).queryByText("Y")).toBeNull();
  });

  it("RPL line echo shows level 2 when the stack is ≥2 deep", () => {
    const { container } = renderDisplay({
      family: "rpl",
      state: { ...state, rpl: ["7.00", "9.00"] },
    });
    const line = subtree(container, "line");
    expect(within(line).getByText("2:")).toBeTruthy();
    expect(within(line).getByText("7.00")).toBeTruthy();
  });

  it("RPL glass uses dot-matrix numerals; segment families keep DSEG7 (the 48 is a 131×64 pixel matrix)", () => {
    const rpl = renderDisplay({ family: "rpl", state: { ...state, rpl: ["5.00"] } });
    expect(panel(rpl.container).dataset.lcdFamily).toBe("rpl");
    expect(rpl.container.querySelector(".font-lcd-dot")).toBeTruthy();
    expect(rpl.container.querySelector(".font-display")).toBeNull();

    const voyager = renderDisplay();
    expect(panel(voyager.container).dataset.lcdFamily).toBe("voyager");
    expect(voyager.container.querySelector(".font-display")).toBeTruthy();
    expect(voyager.container.querySelector(".font-lcd-dot")).toBeNull();
  });

  it("mini renders the KaTeX hero and the TVM row when registers are shown", () => {
    const { container } = renderDisplay({
      showRegisters: true,
      state: { ...state, reg: { n: "12", i: "", PV: "", PMT: "", FV: "" } },
    });
    const mini = subtree(container, "mini");
    expect(mini.querySelector(".katex")).toBeTruthy();
    expect(within(mini).getByText("12")).toBeTruthy();
  });
});
