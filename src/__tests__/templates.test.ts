// Width-tier + template-placement oracle (docs/responsive-layout.md §14.2,
// §10 "no-drift guarantee"): BREAKPOINTS is the single source both the CSS
// media queries and the JS tiers derive from; computePlacement mirrors the
// v2 enumeration exactly. v2 invariant: the machine (nameplate + LCD +
// keyboard) is ONE region — no template separates them.
import { describe, expect, it } from "vitest";
import { BREAKPOINTS, TIER_ORDER, widthTierOf } from "@/lib/layout/breakpoints";
import type { WidthTier } from "@/lib/layout/breakpoints";
import { computePlacement, TEMPLATES } from "@/lib/layout/templates";
import type { TemplateId } from "@/lib/layout/templates";
import type { KeyboardAspectClass } from "@/lib/layout/keyboardGeometry";

describe("BREAKPOINTS — single shared source (§10)", () => {
  it("matches the documented rem values at 16px/rem", () => {
    expect(BREAKPOINTS).toEqual({
      sm: 40 * 16, // 640
      md: 48 * 16, // 768
      lg: 64 * 16, // 1024
      xl: 80 * 16, // 1280
      "2xl": 96 * 16, // 1536
    });
  });

  it.each([
    [320, "phone"],
    [639, "phone"],
    [640, "sm"],
    [700, "sm"], // the large-phone band, explicit
    [767, "sm"],
    [768, "md"],
    [1023, "md"],
    [1024, "lg"],
    [1279, "lg"],
    [1280, "xl"],
    [1535, "xl"],
    [1536, "2xl"],
    [2560, "2xl"],
  ] as const)("widthTierOf(%d) → %s", (px, tier) => {
    expect(widthTierOf(px)).toBe(tier);
  });
});

describe("computePlacement — the §14.2 enumeration", () => {
  const EXPECTED: Record<KeyboardAspectClass, Record<WidthTier, TemplateId>> = {
    landscape: {
      phone: "stack",
      sm: "stack",
      md: "tablet-wide",
      lg: "desktop",
      xl: "desktop",
      "2xl": "desktop",
    },
    portrait: {
      phone: "stack",
      sm: "stack",
      md: "tablet",
      lg: "desktop",
      xl: "desktop",
      "2xl": "desktop",
    },
    tall: {
      phone: "stack",
      sm: "stack",
      md: "tablet",
      lg: "desktop",
      xl: "desktop",
      "2xl": "desktop",
    },
  };

  for (const aspectClass of Object.keys(EXPECTED) as KeyboardAspectClass[]) {
    for (const tier of TIER_ORDER) {
      it(`${aspectClass} @ ${tier} → ${EXPECTED[aspectClass][tier]}`, () => {
        expect(computePlacement(aspectClass, tier).id).toBe(
          EXPECTED[aspectClass][tier],
        );
      });
    }
  }

  it("short viewports flip portrait/tall machines to the side variant (§14.1)", () => {
    const t = computePlacement("portrait", "lg", { shortViewport: true });
    expect(t.id).toBe("machine-side");
    expect(t.machine).toBe("side");
    expect(t.aux).toBe("in-machine");
  });

  it("landscape machines keep stacking on short viewports (pitch stays large)", () => {
    const t = computePlacement("landscape", "lg", { shortViewport: true });
    expect(t.id).toBe("stack");
    expect(t.machine).toBe("stack");
  });
});

describe("template invariants (§14.2)", () => {
  it("every template has an integrated machine (stack or side) — never split", () => {
    for (const t of Object.values(TEMPLATES)) {
      expect(["stack", "side"]).toContain(t.machine);
    }
  });

  it("sidebar chrome only on desktop; drawer templates host panels in sheets", () => {
    for (const t of Object.values(TEMPLATES)) {
      if (t.chrome === "sidebar") {
        expect(t.regionsInline).toEqual({ aux: true, sidebar: true });
      } else {
        expect(t.regionsInline.sidebar).toBe(false);
      }
    }
  });

  it("aux placement is coherent with its inline flag", () => {
    for (const t of Object.values(TEMPLATES)) {
      const inline = t.regionsInline.aux;
      if (t.aux === "sheets" || t.aux === "in-machine") {
        expect(inline).toBe(false);
      } else {
        expect(inline).toBe(true);
      }
    }
  });
});
