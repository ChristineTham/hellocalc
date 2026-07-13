// src/lib/layout/keyboardGeometry.ts
// Priority-1 geometry oracle (docs/responsive-layout.md §4): derives each
// model's keyboard-block aspect ratio from its REAL key grid — never a magic
// number. The result feeds `--kbd-a` (the aspect-locked fitter) and
// `data-aspect` (template selection).
//
// Pure TS — no React/DOM, and deliberately no imports from src/components/*:
// inputs are minimal structural types that VoyagerKey / ClassicKey / RplKey
// already satisfy, so this module stays layer-clean and unit-testable.

/** Families whose key data this oracle understands (per-family key aspect k). */
export type GeometryFamily = "voyager" | "classic" | "hp41" | "pioneer" | "rpl";

export type KeyboardAspectClass = "landscape" | "portrait" | "tall";

/** Voyager-style key: explicit grid placement, optional row span (tall ENTER). */
export interface PlacedKeyLike {
  col: number;
  row: number;
  rowSpan?: number;
}

/** Row-authored key (classic `flex` / RPL `w`): span in column slots. */
export interface RowKeyLike {
  flex?: number;
  w?: number;
}

export type KeyboardLayoutLike =
  | { keys: readonly PlacedKeyLike[] }
  | { rows: readonly (readonly RowKeyLike[])[] };

export interface KeyboardGeometry {
  /** Max over rows of Σ(key column-span). A double-WIDTH ENTER spans 2 existing slots. */
  cols: number;
  /** max(row + rowSpan − 1). A double-HEIGHT ENTER spans 2 existing rows. */
  rows: number;
  /** k — base key aspect (w:h), a per-family value (§4.1). */
  keyAspect: number;
  /** g — inter-key gap as a fraction of key width (§4.1). */
  gap: number;
  /** A_exact = (cols + (cols−1)g) / (rows/k + (rows−1)g) → the `--kbd-a` invariant. */
  aspect: number;
  /** Placement class. Threshold-derived unless overridden per model (§11 #4). */
  aspectClass: KeyboardAspectClass;
}

/** Per-family base key aspect k (w:h) — §4.1 [judgment], pinned in Step 1. */
export const KEY_ASPECT: Record<GeometryFamily, number> = {
  voyager: 1.15,
  classic: 1.15,
  hp41: 1.15, // same key sculpt as the classic handhelds
  pioneer: 1.15, // menu-driven era (42S) + moderns (35s/Prime) share the sculpt
  rpl: 1.1,
};

/** Inter-key gap as a fraction of key width — §4.1 [judgment]. */
export const KEY_GAP_FRACTION = 0.12;

/** aspectClass thresholds (§4.2): A ≥ 1.30 landscape · A ≤ 0.68 tall · else portrait. */
export const ASPECT_LANDSCAPE_MIN = 1.3;
export const ASPECT_TALL_MAX = 0.68;

/** Block aspect from grid + key metrics: (cols + (cols−1)g) / (rows/k + (rows−1)g). */
export function keyboardAspect(g: {
  cols: number;
  rows: number;
  keyAspect: number;
  gap: number;
}): number {
  return (
    (g.cols + (g.cols - 1) * g.gap) /
    (g.rows / g.keyAspect + (g.rows - 1) * g.gap)
  );
}

export function aspectClassOf(aspect: number): KeyboardAspectClass {
  if (aspect >= ASPECT_LANDSCAPE_MIN) return "landscape";
  if (aspect <= ASPECT_TALL_MAX) return "tall";
  return "portrait";
}

const span = (k: RowKeyLike): number => k.flex ?? k.w ?? 1;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

/** Column-slot units per row (Σ of key spans). */
export function rowUnitsOf(rows: readonly (readonly RowKeyLike[])[]): number[] {
  return rows.map((row) => row.reduce((s, k) => s + span(k), 0));
}

/**
 * Dual-pitch subgrid (§4.4 caveat): rows of differing unit counts (HP-35's
 * 4-key digit rows under 5-key function rows; the 48G's 5-under-6) share one
 * physical width — the shorter rows simply have WIDER keys. Rendering uses an
 * lcm-of-row-units subcolumn grid so every row fills exactly and each key's
 * span is an integer: span(key) = keyUnits × (subcols / rowUnits).
 */
export function subgridColumns(rowUnits: readonly number[]): number {
  return rowUnits.reduce(lcm, 1);
}

/** A key's integer span in the lcm subgrid. */
export function subgridSpan(
  key: RowKeyLike,
  rowUnits: number,
  subcols: number,
): number {
  return span(key) * (subcols / rowUnits);
}

/** Row-authored key that may also span rows (the HP-97's double-height `+`). */
export interface SpanKeyLike extends RowKeyLike {
  hspan?: number;
}

/** Explicit grid placement of one key: 1-indexed start line + spans (subcols). */
export interface RowKeyPlacement {
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
}

/**
 * Explicit 2-D placement for row-authored keyboards (§4.4), supporting keys
 * that span ROWS as well as columns. Auto-flow can't express a row-spanning key
 * (the next row's trailing key collides with it), so we place every key
 * explicitly instead: walk each row left→right, skipping columns still occupied
 * by a taller key from above, and reserve a taller key's cells so the rows below
 * flow around it. `subcols` is the lcm of PHYSICAL row widths (real keys + the
 * cells taller keys push down into), keeping every row an integer column grid.
 */
export function placeRowKeys(rows: readonly (readonly SpanKeyLike[])[]): {
  subcols: number;
  placements: RowKeyPlacement[][];
} {
  const nRows = rows.length;
  const realUnits = rows.map((row) => row.reduce((s, k) => s + span(k), 0));
  // physical width per row = its own keys + spans that taller keys push down
  const pushedDown = new Array<number>(nRows).fill(0);
  rows.forEach((row, ri) => {
    row.forEach((k) => {
      for (let d = 1; d < (k.hspan ?? 1); d++) {
        if (ri + d < nRows) pushedDown[ri + d] += span(k);
      }
    });
  });
  const physicalUnits = realUnits.map((u, i) => u + pushedDown[i]);
  const subcols = physicalUnits.reduce(lcm, 1);

  const blockedThrough = new Array<number>(subcols + 2).fill(-1); // col → last row idx
  const placements: RowKeyPlacement[][] = rows.map((row, ri) => {
    const perUnit = subcols / physicalUnits[ri];
    let col = 1;
    return row.map((k) => {
      const colSpan = span(k) * perUnit;
      while (blockedThrough[col] >= ri) col += 1; // skip cells a taller key owns
      const rowSpan = k.hspan ?? 1;
      const placed: RowKeyPlacement = { col, colSpan, row: ri + 1, rowSpan };
      if (rowSpan > 1) {
        for (let c = col; c < col + colSpan; c++) blockedThrough[c] = ri + rowSpan - 1;
      }
      col += colSpan;
      return placed;
    });
  });
  return { subcols, placements };
}

export interface ComputeGeometryOptions {
  /** Override k (defaults to the family value from KEY_ASPECT). */
  keyAspect?: number;
  /** Override g (defaults to KEY_GAP_FRACTION). */
  gap?: number;
  /**
   * Per-model aspect-class override (§11 #4 resolved): placement is a
   * deliberate choice, never a threshold artifact. Omit to derive from A.
   */
  aspectClass?: KeyboardAspectClass;
}

/**
 * Derive a keyboard block's geometry from its key data.
 * Voyager passes `{ keys }` (explicit col/row grid); classic/RPL pass
 * `{ rows }` (authored rows whose `flex`/`w` are column spans).
 */
export function computeKeyboardGeometry(
  layout: KeyboardLayoutLike,
  family: GeometryFamily,
  opts: ComputeGeometryOptions = {},
): KeyboardGeometry {
  const cols =
    "keys" in layout
      ? Math.max(...layout.keys.map((k) => k.col))
      : Math.max(...layout.rows.map((row) => row.reduce((s, k) => s + span(k), 0)));
  const rows =
    "keys" in layout
      ? Math.max(...layout.keys.map((k) => k.row + (k.rowSpan ?? 1) - 1))
      : layout.rows.length;
  if (!Number.isFinite(cols) || !Number.isFinite(rows) || cols < 1 || rows < 1) {
    throw new Error("computeKeyboardGeometry: empty keyboard layout");
  }

  const keyAspect = opts.keyAspect ?? KEY_ASPECT[family];
  const gap = opts.gap ?? KEY_GAP_FRACTION;
  const aspect = keyboardAspect({ cols, rows, keyAspect, gap });
  return {
    cols,
    rows,
    keyAspect,
    gap,
    aspect,
    aspectClass: opts.aspectClass ?? aspectClassOf(aspect),
  };
}
