// src/lib/engine/rpl/plot.ts
// The 48-series 2D plot subsystem, engine side (P17, FR-PLOT-1): a pure-TS
// sampler turns the current equation + PPAR window into a serializable point
// series; the UI's lazily-loaded function-plot renderer just draws it. The
// PICT pixel model (GROB-lite) shares the same PlotReq shape. No DOM here.

export interface PlotPoint {
  x: number;
  y: number | null; // null = domain gap (undefined name / domain fault)
}

export interface PlotReq {
  kind: "fn" | "polar" | "pict";
  /** the sampled series (fn/polar) or lit pixels as points (pict) */
  points: PlotPoint[];
  src?: string; // the plotted expression, for the caption
  pmin: [number, number];
  pmax: [number, number];
  axes: boolean;
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
