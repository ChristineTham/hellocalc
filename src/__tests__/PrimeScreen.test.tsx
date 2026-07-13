// The HP Prime colour screen renders the four Home-view sections natively
// (title bar, history, entry line, menu) with real fonts / KaTeX math — not a
// pixel LCD.
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PrimeScreen } from "@/components/calculator/PrimeScreen";
import { bn, type Value } from "@/lib/engine/config";
import type { RpnState } from "@/components/calculator/Display";

const fmt = (n: Value, dec?: number) => n.toFixed(dec ?? 2);
const renderLatex = (tex: string) => ({ __html: `<span class="katex">${tex}</span>` });

const base: RpnState = {
  T: bn(0),
  Z: bn(0),
  Y: bn(0),
  X: bn(42),
  lastX: bn(0),
  entry: null,
  dec: 2,
  prefix: "none",
  latex: "42",
  hist: [
    { op: "+", v: "5.00" },
    { op: "×", v: "42.00" },
  ],
};

describe("PrimeScreen", () => {
  it("renders the Home title bar, history and menu", () => {
    render(<PrimeScreen state={base} fmt={fmt} renderLatex={renderLatex} />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("DEG")).toBeTruthy(); // angle annunciator
    expect(screen.getByText("5.00")).toBeTruthy(); // an older history result
    expect(screen.getByText("Menu")).toBeTruthy(); // a softkey
  });

  it("shows the shift annunciator only when shift is armed", () => {
    const { rerender, container } = render(
      <PrimeScreen state={base} fmt={fmt} renderLatex={renderLatex} />,
    );
    expect(within(container).queryByText("SS")).toBeNull();
    rerender(<PrimeScreen state={{ ...base, prefix: "g" }} fmt={fmt} renderLatex={renderLatex} />);
    expect(within(container).getByText("SS")).toBeTruthy();
  });

  it("typesets the newest result as native browser math (KaTeX)", () => {
    const { container } = render(
      <PrimeScreen state={base} fmt={fmt} renderLatex={renderLatex} />,
    );
    expect(container.querySelector(".katex")).toBeTruthy();
  });
});
