// src/lib/layout/breakpoints.ts
// THE single source of truth for width tiers (docs/responsive-layout.md §10
// "no-drift guarantee"): the JS `WidthTier` thresholds here MUST equal the CSS
// `@media` breakpoints used by the §3.3 grid templates in globals.css (Tailwind
// v4 defaults — sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem @ 16px/rem).
// A Vitest oracle asserts the parity; Playwright asserts it end-to-end at each
// boundary (639/640, 767/768, 1023/1024, 1279/1280, 1535/1536).
// Pure TS — no React/DOM (usable from tests, hooks, and the shell alike).

/** Lower bound (px) of each named breakpoint. Below `sm` is the `phone` tier. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type WidthTier = "phone" | keyof typeof BREAKPOINTS;

/** Tiers in ascending width order (useful for table-driven tests/UI). */
export const TIER_ORDER = ["phone", "sm", "md", "lg", "xl", "2xl"] as const satisfies readonly WidthTier[];

/** Map a viewport width in px to its width tier. */
export function widthTierOf(widthPx: number): WidthTier {
  if (widthPx >= BREAKPOINTS["2xl"]) return "2xl";
  if (widthPx >= BREAKPOINTS.xl) return "xl";
  if (widthPx >= BREAKPOINTS.lg) return "lg";
  if (widthPx >= BREAKPOINTS.md) return "md";
  if (widthPx >= BREAKPOINTS.sm) return "sm";
  return "phone";
}
