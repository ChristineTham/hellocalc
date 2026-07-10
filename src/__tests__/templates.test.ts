// Width-tier + template-placement oracle (docs/responsive-layout.md §9 Step 0,
// §10 "no-drift guarantee"): BREAKPOINTS is the single source both the CSS
// media queries and the JS tiers derive from; computePlacement mirrors the
// §3.3 enumeration table exactly.
import { describe, expect, it } from "vitest";
import { BREAKPOINTS, TIER_ORDER, widthTierOf } from "@/lib/layout/breakpoints";
import type { WidthTier } from "@/lib/layout/breakpoints";
import { computePlacement, TEMPLATES } from "@/lib/layout/templates";
import type { TemplateId } from "@/lib/layout/templates";
import type { KeyboardAspectClass } from "@/lib/layout/keyboardGeometry";

describe("BREAKPOINTS — single shared source (§10)", () => {
  it("matches the documented §3.3 rem values at 16px/rem", () => {
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
    [700, "sm"], // the §11 #2 large-phone band, explicit
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

describe("computePlacement — the §3.3 enumeration table", () => {
  const EXPECTED: Record<KeyboardAspectClass, Record<WidthTier, TemplateId>> = {
    landscape: {
      phone: "stack",
      sm: "stack",
      md: "tablet-portrait-wide",
      lg: "desktop-landscape",
      xl: "desktop-landscape",
      "2xl": "desktop-landscape",
    },
    portrait: {
      phone: "stack",
      sm: "stack",
      md: "tablet-portrait-corner",
      lg: "desktop-wide",
      xl: "desktop-wide",
      "2xl": "desktop-wide",
    },
    tall: {
      phone: "stack",
      sm: "stack",
      md: "tablet-portrait-corner",
      lg: "desktop-wide", // tall@lg reuses desktop-wide
      xl: "desktop-tall",
      "2xl": "desktop-tall",
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

  it("the 700px large-phone case: sm reuses the phone stack template (§11 #2)", () => {
    const t = computePlacement("portrait", widthTierOf(700));
    expect(t.id).toBe("stack");
    expect(t.chrome).toBe("drawer");
    expect(t.kbdPlacement).toBe("bottom-full");
  });

  it("the short-landscape override supersedes the width tier (§3.3)", () => {
    const t = computePlacement("landscape", "2xl", { shortLandscape: true });
    expect(t.id).toBe("phone-landscape");
    expect(t.kbdPlacement).toBe("right-side");
    expect(t.chrome).toBe("drawer");
  });
});

describe("template invariants (§3.3)", () => {
  it("drawer templates host aux/sidebar in Sheets; sidebar templates inline both", () => {
    for (const t of Object.values(TEMPLATES)) {
      if (t.chrome === "sidebar") {
        expect(t.regionsInline).toEqual({ aux: true, sidebar: true });
      } else {
        expect(t.regionsInline.sidebar).toBe(false);
      }
    }
  });

  it("keyboard anchors bottom or right in every template (§12.1 diagonal)", () => {
    for (const t of Object.values(TEMPLATES)) {
      expect(["bottom-full", "bottom-band", "bottom-right", "right-side", "right-edge"]).toContain(
        t.kbdPlacement,
      );
    }
  });
});
