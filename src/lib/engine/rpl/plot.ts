// src/lib/engine/rpl/plot.ts
// The 48-series 2D plot subsystem, engine side (P17, FR-PLOT-1): a pure-TS
// sampler turns the current equation + PPAR window into a serializable point
// series; the UI's lazily-loaded function-plot renderer just draws it. The
// PICT pixel model (GROB-lite) shares the same PlotReq shape. No DOM here.

export interface PlotPoint {
  x: number;
  y: number | null; // null = domain gap (undefined name / domain fault)
}

export interface PlotReqBase {
  src?: string; // the plotted expression, for the caption
  pmin: [number, number];
  pmax: [number, number];
  axes: boolean;
}

/** 2D line/scatter/pixel series — drawn by function-plot (light, D3). */
export interface PlotSeriesReq extends PlotReqBase {
  kind: "fn" | "polar" | "pict";
  /** the sampled series (fn/polar) or lit pixels as points (pict) */
  points: PlotPoint[];
}

/** Statistical bar chart / histogram — drawn NATIVELY by Plotly (heavy, lazy),
 * replacing the old segment-column emulation (architecture §4.10). */
export interface PlotBarsReq extends PlotReqBase {
  kind: "bars";
  cats: number[]; // bar centres (x)
  values: number[]; // bar heights
  histogram?: boolean; // contiguous bins vs discrete bars
}

/** 3D surface z = f(x, y) sampled to a grid — drawn as a real rotatable Plotly
 * surface (heavy, lazy), replacing the mono 2D wireframe projection. */
export interface PlotSurfaceReq extends PlotReqBase {
  kind: "surface";
  xs: number[];
  ys: number[];
  /** z[j][i] over (xs[i], ys[j]); null marks a domain gap */
  z: (number | null)[][];
}

export type PlotReq = PlotSeriesReq | PlotBarsReq | PlotSurfaceReq;

/** Sample z = f(x, y) over the window into an (N+1)×(N+1) grid for a surface. */
export function sampleGrid(
  zAt: (x: number, y: number) => number | null,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  steps: number,
): { xs: number[]; ys: number[]; z: (number | null)[][] } {
  const n = Math.max(4, Math.min(60, steps));
  const xs = Array.from({ length: n + 1 }, (_, i) => xmin + ((xmax - xmin) * i) / n);
  const ys = Array.from({ length: n + 1 }, (_, j) => ymin + ((ymax - ymin) * j) / n);
  const z = ys.map((gy) =>
    xs.map((gx) => {
      const v = zAt(gx, gy);
      return v !== null && Number.isFinite(v) ? v : null;
    }),
  );
  return { xs, ys, z };
}

/** Sample y = f(x) (or r = f(θ) mapped to cartesian) over [xmin, xmax]. */
export function sampleSeries(
  evalAt: (x: number) => number | null,
  xmin: number,
  xmax: number,
  steps: number,
  polar: boolean,
): PlotPoint[] {
  const out: PlotPoint[] = [];
  const n = Math.max(16, Math.min(1024, steps));
  for (let i = 0; i <= n; i++) {
    const x = xmin + ((xmax - xmin) * i) / n;
    const y = evalAt(x);
    if (y === null || !Number.isFinite(y)) {
      out.push({ x, y: null });
    } else if (polar) {
      // r(θ): θ rides the sample axis, plot (r·cosθ, r·sinθ)
      out.push({ x: y * Math.cos(x), y: y * Math.sin(x) });
    } else {
      out.push({ x, y });
    }
  }
  return out;
}

/** The 48's 131×64 pixel grid ↔ user coordinates (PX→C / C→PX). */
export const PICT_W = 131;
export const PICT_H = 64;

export function pxToC(
  px: number,
  py: number,
  pmin: [number, number],
  pmax: [number, number],
): [number, number] {
  return [
    pmin[0] + ((pmax[0] - pmin[0]) * px) / (PICT_W - 1),
    pmax[1] - ((pmax[1] - pmin[1]) * py) / (PICT_H - 1),
  ];
}

export function cToPx(
  x: number,
  y: number,
  pmin: [number, number],
  pmax: [number, number],
): [number, number] {
  return [
    Math.round(((x - pmin[0]) / (pmax[0] - pmin[0])) * (PICT_W - 1)),
    Math.round(((pmax[1] - y) / (pmax[1] - pmin[1])) * (PICT_H - 1)),
  ];
}

/** Straight line on the pixel grid (the 48 LINE/BOX primitives). */
export function rasterLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const out: [number, number][] = [];
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    out.push([
      Math.round(x0 + ((x1 - x0) * i) / steps),
      Math.round(y0 + ((y1 - y0) * i) / steps),
    ]);
  }
  return out;
}
