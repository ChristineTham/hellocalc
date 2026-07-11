// src/lib/engine/stats-fit.ts
// HP-42S CFIT curve fitting (P16, FR-STAT-2): LINF/LOGF/EXPF/PWRF over the
// accumulated (x,y) points, plus BEST (highest |correlation| wins) and the
// FCSTX/FCSTY forecasts. Computed on float64 from RAW points (we keep the
// pairs, not just the 42S's summation registers — better conditioned, same
// UX; documented). Pure TS — no dependencies (a stats library for four
// closed-form fits is unjustified, AGENTS §3).

export type FitModel = "LINF" | "LOGF" | "EXPF" | "PWRF";
export const FIT_MODELS: FitModel[] = ["LINF", "LOGF", "EXPF", "PWRF"];

export interface Fit {
  model: FitModel;
  slope: number; // m in the transformed line
  yint: number; // b as the 42S reports it (back-transformed)
  corr: number; // correlation in the transformed space
}

const sum = (a: number[]): number => a.reduce((x, y) => x + y, 0);
const mean = (a: number[]): number => sum(a) / a.length;

function lineFit(xs: number[], ys: number[]): { m: number; b: number; r: number } {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  const m = sxy / sxx;
  return { m, b: my - m * mx, r: sxy / Math.sqrt(sxx * syy) };
}

/** The model's (x,y) → transformed-line space; throws on domain violations
 * (the 42S rejects ln of non-positive data the same way). */
function transform(model: FitModel, pts: [number, number][]): { xs: number[]; ys: number[] } {
  const need = (ok: boolean): void => {
    if (!ok) throw new Error("Invalid Data");
  };
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pts) {
    switch (model) {
      case "LINF":
        xs.push(x);
        ys.push(y);
        break;
      case "LOGF": // y = b + m·ln x
        need(x > 0);
        xs.push(Math.log(x));
        ys.push(y);
        break;
      case "EXPF": // y = b·e^(m·x)
        need(y > 0);
        xs.push(x);
        ys.push(Math.log(y));
        break;
      case "PWRF": // y = b·x^m
        need(x > 0 && y > 0);
        xs.push(Math.log(x));
        ys.push(Math.log(y));
        break;
    }
  }
  return { xs, ys };
}

export function fit(pts: [number, number][], model: FitModel): Fit {
  if (pts.length < 2) throw new Error("Insufficient Data");
  const { xs, ys } = transform(model, pts);
  const { m, b, r } = lineFit(xs, ys);
  const yint = model === "EXPF" || model === "PWRF" ? Math.exp(b) : b;
  return { model, slope: m, yint, corr: r };
}

/** BEST — the model with the highest |corr| that fits the data's domain. */
export function bestFit(pts: [number, number][]): Fit {
  let best: Fit | null = null;
  for (const model of FIT_MODELS) {
    try {
      const f = fit(pts, model);
      if (!best || Math.abs(f.corr) > Math.abs(best.corr)) best = f;
    } catch {
      // domain-invalid for this model — skip it, like the 42S
    }
  }
  if (!best) throw new Error("Insufficient Data");
  return best;
}

/** ŷ at x under the fitted model. */
export function forecastY(f: Fit, x: number): number {
  switch (f.model) {
    case "LINF":
      return f.yint + f.slope * x;
    case "LOGF":
      return f.yint + f.slope * Math.log(x);
    case "EXPF":
      return f.yint * Math.exp(f.slope * x);
    case "PWRF":
      return f.yint * Math.pow(x, f.slope);
  }
}

/** x̂ at y — the inverse forecast. */
export function forecastX(f: Fit, y: number): number {
  switch (f.model) {
    case "LINF":
      return (y - f.yint) / f.slope;
    case "LOGF":
      return Math.exp((y - f.yint) / f.slope);
    case "EXPF":
      return Math.log(y / f.yint) / f.slope;
    case "PWRF":
      return Math.pow(y / f.yint, 1 / f.slope);
  }
}
