// Step-1 component tests (docs/responsive-layout.md §9): each family keyboard
// renders an aspect-locked grid of uniform tracks with correct spans, driven by
// model.geometry — the structural guarantee behind Priority 1.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Keyboard } from "@/components/calculator/Keyboard";
import { ClassicKeyboard } from "@/components/calculator/ClassicKeyboard";
import { RplKeyboard } from "@/components/calculator/RplKeyboard";
import { MODELS } from "@/components/calculator/models";

const noop = () => {};

function keyboardRoot(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="keyboard"]');
  if (!el) throw new Error('missing [data-slot="keyboard"] root');
  return el;
}

// jsdom normalizes `aspect-ratio: 0.72` to "0.72 / 1" — compare numerically.
function styleAspectOf(el: HTMLElement): number {
  return Number.parseFloat(el.style.aspectRatio);
}

describe("Keyboard (voyager)", () => {
  const model = MODELS["HP-12C"];
  if (model.family !== "voyager") throw new Error("HP-12C must be voyager");

  it("renders an aspect-locked 10×4 grid with one button per key", () => {
    const { container } = render(
      <Keyboard
        keys={model.keys}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const root = keyboardRoot(container);
    expect(styleAspectOf(root)).toBeCloseTo(model.geometry.aspect, 5);
    expect(root.style.gridTemplateColumns).toBe("repeat(10, minmax(0, 1fr))");
    expect(root.style.gridTemplateRows).toBe("repeat(4, minmax(0, 1fr))");
    expect(container.querySelectorAll("button")).toHaveLength(model.keys.length);
  });

  it("the tall ENTER spans 2 rows (consumes existing slots)", () => {
    const { container } = render(
      <Keyboard
        keys={model.keys}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const enter = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "ENTER",
    );
    if (!enter) throw new Error("no ENTER key rendered");
    expect(enter.style.gridRow).toMatch(/span 2/);
  });
});

describe("ClassicKeyboard (HP-35) — dual-pitch subcolumn grid", () => {
  const model = MODELS["HP-35"];
  if (model.family !== "classic") throw new Error("HP-35 must be classic");

  it("uses lcm(5,4)=20 subcolumns: function keys span 4, wide digit keys span 5, ENTER↑ spans 8", () => {
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const root = keyboardRoot(container);
    expect(styleAspectOf(root)).toBeCloseTo(model.geometry.aspect, 5);
    // 5-key function rows over 4-key digit rows → lcm(5,4)=20 subcolumns.
    expect(root.style.gridTemplateColumns).toBe("repeat(20, minmax(0, 1fr))");
    const keyCount = model.rows.reduce((n, r) => n + r.length, 0);
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    expect(buttons).toHaveLength(keyCount);

    const byLabel = (label: string) => {
      const b = buttons.find((x) => x.getAttribute("aria-label") === label);
      if (!b) throw new Error(`no ${label} key rendered`);
      return b;
    };
    expect(byLabel("ENTER↑").style.gridColumn).toBe("span 8 / span 8"); // flex-2 in a 5-unit row
    expect(byLabel("log").style.gridColumn).toBe("span 4 / span 4"); // 5-unit function row
    expect(byLabel("7").style.gridColumn).toBe("span 5 / span 5"); // 4-unit digit row (wider!)
  });

  it("every row fills its subgrid exactly — no auto-flow scrambling", () => {
    // Regression guard: a plain 5-col grid let the 4-key digit rows under-fill
    // and pulled the next row's first key up a row (caught visually).
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    let i = 0;
    for (const row of model.rows) {
      let units = 0;
      for (let k = 0; k < row.length; k++, i++) {
        const m = /span (\d+)/.exec(buttons[i].style.gridColumn);
        if (!m) throw new Error(`key ${i} has no span`);
        units += Number(m[1]);
      }
      expect(units).toBe(20); // each row sums to the full subgrid width
    }
  });
});

describe("RplKeyboard (HP-48G) — dual-pitch subcolumn grid", () => {
  const model = MODELS["HP-48G"];
  if (model.family !== "rpl") throw new Error("HP-48G must be rpl");

  it("uses lcm(6,5)=30 subcolumns: function keys span 5, digits span 6, ENTER spans 10", () => {
    const { container } = render(
      <RplKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const root = keyboardRoot(container);
    expect(styleAspectOf(root)).toBeCloseTo(model.geometry.aspect, 5);
    expect(root.style.gridTemplateColumns).toBe("repeat(30, minmax(0, 1fr))");
    expect(root.style.gridTemplateRows).toBe(`repeat(${model.rows.length}, minmax(0, 1fr))`);

    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    const keyCount = model.rows.reduce((n, r) => n + r.length, 0);
    expect(buttons).toHaveLength(keyCount);

    const byLabel = (label: string) => {
      const b = buttons.find((x) => x.getAttribute("aria-label") === label);
      if (!b) throw new Error(`no ${label} key rendered`);
      return b;
    };
    expect(byLabel("ENTER").style.gridColumn).toBe("span 10 / span 10"); // w2 in a 6-unit row
    expect(byLabel("MTH").style.gridColumn).toBe("span 5 / span 5"); // 6-unit function row
    expect(byLabel("7").style.gridColumn).toBe("span 6 / span 6"); // 5-unit digit row (wider!)
  });
});
