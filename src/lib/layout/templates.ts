// src/lib/layout/templates.ts
// The seven §3.3 layout templates, enumerated in TS so the shell can stamp
// data-template / data-chrome / data-kbd-placement from the SAME source the
// tests assert (docs/responsive-layout.md §10 — labels never drift from an
// independent CSS guess; geometry remains the primary e2e assertion).
// Pure TS — no React/DOM. The actual layout is CSS (§3.3 grid templates);
// this module is the oracle + label source.

import type { WidthTier } from "./breakpoints";
import type { KeyboardAspectClass } from "./keyboardGeometry";

export type TemplateId =
  | "stack"
  | "phone-landscape"
  | "tablet-portrait-wide"
  | "tablet-portrait-corner"
  | "desktop-landscape"
  | "desktop-wide"
  | "desktop-tall";

export type ChromeMode = "drawer" | "sidebar";

export type KbdPlacement =
  | "bottom-full" // phone/sm: entire bottom band, toolstrip beneath
  | "bottom-band" // full-width band with inline panels beside the LCD
  | "bottom-right" // tablet-portrait corner (aux bottom-left)
  | "right-side" // height-bound right column
  | "right-edge"; // tall models: full-height right edge

export interface LayoutTemplate {
  id: TemplateId;
  chrome: ChromeMode;
  kbdPlacement: KbdPlacement;
  /** false ⇒ that region is Sheet-hosted rather than an inline grid area. */
  regionsInline: Record<"aux" | "sidebar", boolean>;
}

export const TEMPLATES: Record<TemplateId, LayoutTemplate> = {
  stack: {
    id: "stack",
    chrome: "drawer",
    kbdPlacement: "bottom-full",
    regionsInline: { aux: false, sidebar: false },
  },
  "phone-landscape": {
    id: "phone-landscape",
    chrome: "drawer",
    kbdPlacement: "right-side",
    regionsInline: { aux: false, sidebar: false },
  },
  "tablet-portrait-wide": {
    id: "tablet-portrait-wide",
    chrome: "drawer",
    kbdPlacement: "bottom-band",
    regionsInline: { aux: true, sidebar: false },
  },
  "tablet-portrait-corner": {
    id: "tablet-portrait-corner",
    chrome: "drawer",
    kbdPlacement: "bottom-right",
    regionsInline: { aux: true, sidebar: false },
  },
  "desktop-landscape": {
    id: "desktop-landscape",
    chrome: "sidebar",
    kbdPlacement: "bottom-band",
    regionsInline: { aux: true, sidebar: true },
  },
  "desktop-wide": {
    id: "desktop-wide",
    chrome: "sidebar",
    kbdPlacement: "right-side",
    regionsInline: { aux: true, sidebar: true },
  },
  "desktop-tall": {
    id: "desktop-tall",
    chrome: "sidebar",
    kbdPlacement: "right-edge",
    regionsInline: { aux: true, sidebar: true },
  },
};

/** The §3.3 enumeration table: every (aspectClass × tier) cell, duplicates collapsed. */
const CELLS: Record<KeyboardAspectClass, Record<WidthTier, TemplateId>> = {
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
    lg: "desktop-wide", // tall@lg reuses desktop-wide (§3.3)
    xl: "desktop-tall",
    "2xl": "desktop-tall",
  },
};

export interface PlacementOptions {
  /**
   * The §3.3 short-viewport override (`orientation:landscape` + `max-height:34rem`):
   * orthogonal to the width tier — supersedes whatever the tier would pick.
   */
  shortLandscape?: boolean;
}

/** Which template serves a model of this aspect class at this width tier. */
export function computePlacement(
  aspectClass: KeyboardAspectClass,
  tier: WidthTier,
  opts: PlacementOptions = {},
): LayoutTemplate {
  if (opts.shortLandscape) return TEMPLATES["phone-landscape"];
  return TEMPLATES[CELLS[aspectClass][tier]];
}
