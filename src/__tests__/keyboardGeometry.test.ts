// Priority-1 geometry oracle tests (docs/responsive-layout.md §9 Step 0):
// the per-model keyboard-block aspects are DERIVED from real key data and must
// match the plan's pinned values within ±0.02.
import { describe, expect, it } from "vitest";
import {
  ASPECT_LANDSCAPE_MIN,
  ASPECT_TALL_MAX,
  aspectClassOf,
  computeKeyboardGeometry,
  keyboardAspect,
  KEY_ASPECT,
  KEY_GAP_FRACTION,
} from "@/lib/layout/keyboardGeometry";
import { MODELS } from "@/components/calculator/models";

describe("keyboardAspect — the §4.2 formula", () => {
  it("computes A_exact = (cols + (cols−1)g) / (rows/k + (rows−1)g)", () => {
    // Worked check from the plan §4.4: HP-12C 10×4, k=1.15, g=0.12 → 2.887
    expect(
      keyboardAspect({ cols: 10, rows: 4, keyAspect: 1.15, gap: 0.12 }),
    ).toBeCloseTo(2.887, 2);
  });
});

describe("per-model geometry (MODELS registry, derived not hand-tuned)", () => {
  it.each([
    ["HP-11C", 10, 4, 2.887, "landscape"],
    ["HP-12C", 10, 4, 2.887, "landscape"],
    ["HP-15C", 10, 4, 2.887, "landscape"],
    ["HP-16C", 10, 4, 2.887, "landscape"],
    ["HP-35", 5, 8, 0.703, "portrait"],
    ["HP-48G", 6, 9, 0.722, "tall"], // per-model override: 9-row kbd behaves tall (§14 rev 5)
  ] as const)(
    "%s → %d×%d, A≈%f (±0.02), %s",
    (id, cols, rows, aspect, aspectClass) => {
      const g = MODELS[id].geometry;
      expect(g.cols).toBe(cols);
      expect(g.rows).toBe(rows);
      expect(Math.abs(g.aspect - aspect)).toBeLessThan(0.02);
      expect(g.aspectClass).toBe(aspectClass);
    },
  );

  it("uses the per-family k and shared g", () => {
    expect(MODELS["HP-12C"].geometry.keyAspect).toBe(KEY_ASPECT.voyager);
    expect(MODELS["HP-48G"].geometry.keyAspect).toBe(KEY_ASPECT.rpl);
    expect(MODELS["HP-35"].geometry.gap).toBe(KEY_GAP_FRACTION);
  });
});

describe("span rules (§4.1)", () => {
  it("a double-HEIGHT ENTER consumes 2 existing row slots — adds no row", () => {
    // Voyager-style: 2 columns × 3 rows with a rowSpan-2 key in column 1.
    const g = computeKeyboardGeometry(
      {
        keys: [
          { col: 1, row: 1 },
          { col: 2, row: 1 },
          { col: 1, row: 2, rowSpan: 2 }, // tall ENTER
          { col: 2, row: 2 },
          { col: 2, row: 3 },
        ],
      },
      "voyager",
    );
    expect(g.cols).toBe(2);
    expect(g.rows).toBe(3);
  });

  it("a double-WIDTH ENTER consumes 2 existing column slots — adds no column", () => {
    // Classic-style: 5-wide rows; the ENTER row is 4 keys, one with flex 2.
    const g = computeKeyboardGeometry(
      {
        rows: [
          [{}, {}, {}, {}, {}],
          [{ flex: 2 }, {}, {}, {}], // ENTER↑ spans 2 → Σ = 5
        ],
      },
      "classic",
    );
    expect(g.cols).toBe(5);
    expect(g.rows).toBe(2);
  });

  it("RPL `w` spans count the same way, and short bottom rows don't shrink cols", () => {
    const g = computeKeyboardGeometry(
      {
        rows: [
          [{}, {}, {}, {}, {}, {}], // 6-wide top block
          [{ w: 2 }, {}, {}, {}, {}], // ENTER row: Σ = 6
          [{}, {}, {}, {}, {}], // 5-wide digit row
        ],
      },
      "rpl",
    );
    expect(g.cols).toBe(6);
    expect(g.rows).toBe(3);
  });

  it("throws on an empty layout rather than emitting nonsense geometry", () => {
    expect(() => computeKeyboardGeometry({ rows: [] }, "classic")).toThrow();
  });
});

describe("aspectClassOf boundaries (§4.2)", () => {
  it.each([
    [ASPECT_LANDSCAPE_MIN, "landscape"], // 1.30 inclusive
    [1.299, "portrait"],
    [ASPECT_TALL_MAX, "tall"], // 0.68 inclusive
    [0.681, "portrait"],
    [2.887, "landscape"],
    [0.722, "portrait"],
  ] as const)("A=%f → %s", (aspect, cls) => {
    expect(aspectClassOf(aspect)).toBe(cls);
  });

  it("honours a per-model aspectClass override (§11 #4 — deliberate, not artifact)", () => {
    const g = computeKeyboardGeometry(
      { rows: [[{}, {}, {}, {}, {}, {}]] },
      "rpl",
      { aspectClass: "tall" },
    );
    expect(g.aspectClass).toBe("tall");
  });
});
