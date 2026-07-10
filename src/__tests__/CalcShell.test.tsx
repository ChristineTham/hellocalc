// Step-2 shell tests (docs/responsive-layout.md §9): CalcShell stamps the
// static data-aspect + per-model --kbd-* data (layout inputs, SSR-known) and,
// post-mount, the diagnostic labels from computePlacement. Geometry-driven
// placement itself is asserted in Playwright — jsdom has no layout engine.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CalcShell } from "@/components/calculator/CalcShell";
import { MODELS } from "@/components/calculator/models";
import { widthTierOf } from "@/lib/layout/breakpoints";
import { computePlacement } from "@/lib/layout/templates";

function renderShell(modelId: string) {
  const model = MODELS[modelId];
  return render(
    <CalcShell
      model={model}
      topbar={<span>topbar</span>}
      lcd={<span>lcd</span>}
      keyboard={<span>kbd</span>}
      aux={<span>aux</span>}
    />,
  );
}

function shellRoot(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>("main.calc-shell");
  if (!el) throw new Error("missing main.calc-shell");
  return el;
}

describe("CalcShell", () => {
  it("stamps the static data-aspect and per-model --kbd-* data from geometry", () => {
    const { container } = renderShell("HP-48G");
    const root = shellRoot(container);
    expect(root.dataset.aspect).toBe("portrait");
    expect(root.style.getPropertyValue("--kbd-a")).toBe(
      String(MODELS["HP-48G"].geometry.aspect),
    );
    expect(root.style.getPropertyValue("--kbd-cols")).toBe("6");
    expect(root.style.getPropertyValue("--kbd-rows")).toBe("9");
  });

  it("renders all five region slots", () => {
    const { container } = renderShell("HP-12C");
    for (const region of ["topbar", "sidebar", "lcd", "aux", "keyboard"]) {
      expect(
        container.querySelector(`[data-region="${region}"]`),
        region,
      ).not.toBeNull();
    }
  });

  it("stamps post-mount labels from the SAME oracle the tests use (no drift)", () => {
    // jsdom mounts with a real innerWidth (default 1024) — whatever it is,
    // the stamped label must equal computePlacement over that width.
    const { container } = renderShell("HP-12C");
    const root = shellRoot(container);
    const expected = computePlacement(
      MODELS["HP-12C"].geometry.aspectClass,
      widthTierOf(window.innerWidth),
    );
    expect(root.dataset.template).toBe(expected.id);
    expect(root.dataset.chrome).toBe(expected.chrome);
    expect(root.dataset.kbdPlacement).toBe(expected.kbdPlacement);
  });
});
