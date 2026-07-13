// src/components/calculator/PlotPanel.tsx
// The 48-series picture surface (P17, FR-PLOT-1): renders the engine's
// sampled PlotReq. 2D line/scatter/pixel series draw through function-plot
// (light, D3); statistical bars and 3D surfaces hand off to the lazy Plotly
// panel (architecture §4.10). Both grapher libraries are dynamically imported
// so neither enters the initial bundle (NFR-3). The engine samples; this only
// draws.
"use client";

import { useEffect, useRef } from "react";
import type { RpnState } from "./Display";
import { PlotlyPanel } from "./PlotlyPanel";

type PlotSpec = NonNullable<RpnState["plot"]>;

export function PlotPanel({ plot }: { plot: PlotSpec }) {
  // statistical / 3D requests render natively in Plotly
  if (plot.kind === "bars" || plot.kind === "surface") {
    return <PlotlyPanel plot={plot} />;
  }
  return <SeriesPanel plot={plot} />;
}

function SeriesPanel({ plot }: { plot: Extract<PlotSpec, { kind: "fn" | "polar" | "pict" }> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    void import("function-plot").then(({ default: functionPlot }) => {
      const el = ref.current;
      if (disposed || !el) return;
      el.innerHTML = "";
      const pts = plot.points
        .filter((p): p is { x: number; y: number } => p.y !== null)
        .map((p) => [p.x, p.y] as [number, number]);
      const spread = plot.kind === "polar"; // polar samples carry their own extent
      try {
        functionPlot({
          target: el,
          width: el.clientWidth || 320,
          height: 190,
          xAxis: spread ? {} : { domain: [plot.pmin[0], plot.pmax[0]] },
          yAxis: spread ? {} : { domain: [plot.pmin[1], plot.pmax[1]] },
          grid: plot.axes,
          disableZoom: true,
          data: [
            {
              points: pts,
              fnType: "points",
              graphType: plot.kind === "pict" ? "scatter" : "polyline",
            },
          ],
        });
      } catch (e) {
        // an empty/degenerate series must not crash the glass — say so
        el.textContent = `plot error: ${e instanceof Error ? e.message : "unknown"}`;
      }
    });
    return () => {
      disposed = true;
    };
  }, [plot]);

  return (
    <div
      data-slot="plot-panel"
      ref={ref}
      role="img"
      aria-label={plot.src ? `Plot of ${plot.src}` : "Plot"}
      className="w-full overflow-hidden rounded-md bg-white/85 [&_svg]:max-w-full"
    />
  );
}
