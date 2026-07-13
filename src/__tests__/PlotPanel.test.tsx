// PlotPanel routes each PlotReq kind to the right renderer: 2D line/scatter/
// pixel series to function-plot, statistical bars and 3D surfaces to the lazy
// Plotly panel (architecture §4.10). Both grapher libs are mocked so the test
// asserts the DELEGATION + mount, not the third-party drawing.
import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { PlotPanel } from "@/components/calculator/PlotPanel";
import type { PlotReq } from "@/lib/engine/rpl/plot";

const react = vi.fn();
const purge = vi.fn();
vi.mock("plotly.js-dist-min", () => ({ default: { react, purge } }));
const functionPlot = vi.fn();
vi.mock("function-plot", () => ({ default: functionPlot }));

const base = { pmin: [0, 0] as [number, number], pmax: [5, 5] as [number, number], axes: true };

describe("PlotPanel renderer routing", () => {
  it("sends a bar chart to Plotly", async () => {
    const plot: PlotReq = { kind: "bars", cats: [1, 2, 3], values: [2, 5, 3], ...base };
    const { container } = render(<PlotPanel plot={plot} />);
    const panel = container.querySelector('[data-slot="plotly-panel"]');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("aria-label")).toBe("Statistical bar plot");
    await waitFor(() => expect(react).toHaveBeenCalled());
    const [, data] = react.mock.calls.at(-1)!;
    expect(data[0].type).toBe("bar");
    expect(data[0].y).toEqual([2, 5, 3]);
  });

  it("sends a 3D surface to Plotly", async () => {
    const plot: PlotReq = {
      kind: "surface",
      xs: [0, 1],
      ys: [0, 1],
      z: [
        [0, 1],
        [1, 2],
      ],
      src: "X+Y",
      ...base,
    };
    const { container } = render(<PlotPanel plot={plot} />);
    const panel = container.querySelector('[data-slot="plotly-panel"]');
    expect(panel?.getAttribute("aria-label")).toContain("3D surface");
    await waitFor(() => expect(react).toHaveBeenCalled());
    const [, data] = react.mock.calls.at(-1)!;
    expect(data[0].type).toBe("surface");
  });

  it("keeps 2D series on function-plot (not Plotly)", async () => {
    const plot: PlotReq = {
      kind: "fn",
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      ...base,
    };
    const { container } = render(<PlotPanel plot={plot} />);
    expect(container.querySelector('[data-slot="plot-panel"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="plotly-panel"]')).toBeNull();
    await waitFor(() => expect(functionPlot).toHaveBeenCalled());
  });
});
