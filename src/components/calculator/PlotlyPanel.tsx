// src/components/calculator/PlotlyPanel.tsx
// The statistical / 3D surface renderer (FR-PLOT-2/3, architecture §4.10):
// draws the engine's `bars` and `surface` plot requests with Plotly, which is
// dynamically imported HERE so the ~1 MB library never enters the initial
// bundle (NFR-3). The engine samples; this only draws.
"use client";

import { useEffect, useRef } from "react";
import type { PlotBarsReq, PlotSurfaceReq } from "@/lib/engine/rpl/plot";

type PlotlySpec = PlotBarsReq | PlotSurfaceReq;

// a compact HP-glass palette for the plot marks (kept local — Plotly wants
// literal colours, and these live only on this off-glass rendered surface)
const INK = "#1c1e1a";
const GRID = "rgba(0,0,0,0.12)";
const BAR = "#4a7c3f";
const SURFACE: [number, string][] = [
  [0, "#2b3a55"],
  [0.5, "#4a7c3f"],
  [1, "#d9b23a"],
];

export function PlotlyPanel({ plot }: { plot: PlotlySpec }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let el: HTMLDivElement | null = null;
    void import("plotly.js-dist-min").then((mod) => {
      const Plotly = mod.default;
      el = ref.current;
      if (disposed || !el) return;
      const font = { color: INK, size: 10, family: "var(--font-mono), monospace" };
      const layout: Partial<Plotly.Layout> = {
        margin: { l: 34, r: 8, t: 8, b: 24 },
        height: 210,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font,
        showlegend: false,
      };
      const config: Partial<Plotly.Config> = { displayModeBar: false, responsive: true };

      if (plot.kind === "bars") {
        const data: Plotly.Data[] = [
          {
            type: "bar",
            x: plot.cats,
            y: plot.values,
            marker: { color: BAR },
            width: plot.histogram ? undefined : 0.6,
          },
        ];
        layout.xaxis = { gridcolor: GRID, zerolinecolor: GRID };
        layout.yaxis = { gridcolor: GRID, zerolinecolor: GRID };
        if (plot.histogram) layout.bargap = 0.02;
        void Plotly.react(el, data, layout, config);
      } else {
        const data: Plotly.Data[] = [
          {
            type: "surface",
            x: plot.xs,
            y: plot.ys,
            z: plot.z,
            colorscale: SURFACE,
            showscale: false,
          },
        ];
        layout.scene = {
          xaxis: { title: { text: plot.src ? "X" : "" }, color: INK },
          yaxis: { title: { text: "Y" }, color: INK },
          zaxis: { color: INK },
          camera: { eye: { x: 1.5, y: 1.5, z: 1.1 } },
        };
        void Plotly.react(el, data, layout, config);
      }
    });
    return () => {
      disposed = true;
      const node = el;
      if (node)
        void import("plotly.js-dist-min").then((mod) => mod.default.purge(node)).catch(() => {});
    };
  }, [plot]);

  return (
    <div
      data-slot="plotly-panel"
      ref={ref}
      role="img"
      aria-label={
        plot.kind === "surface"
          ? `3D surface plot${plot.src ? ` of ${plot.src}` : ""}`
          : "Statistical bar plot"
      }
      className="w-full overflow-hidden rounded-md bg-white/85"
    />
  );
}
