// src/lib/layout/templates.ts
// The §14.2 v2 layout templates, enumerated in TS so the shell can stamp
// data-template / data-chrome / data-machine from the SAME source the tests
// assert (labels never drift from an independent CSS guess; geometry remains
// the primary e2e assertion). v2: the machine (nameplate + LCD + keyboard) is
// ONE integrated region — no template ever separates the LCD from the keys.
// Pure TS — no React/DOM. The actual layout is CSS (globals.css @layer
// components); this module is the oracle + label source.

import type { WidthTier } from "./breakpoints";
import type { KeyboardAspectClass } from "./keyboardGeometry";

export type TemplateId =
  | "stack" // < md: topbar / machine; aux via sheets
  | "machine-side" // short viewports: side-variant machine, aux in its left column
  | "tablet" // md, portrait/tall: paper column LEFT, machine right
  | "tablet-wide" // md, landscape: machine stacked, paper row below
  | "desktop"; // lg+: sidebar | machine | paper column RIGHT

export type ChromeMode = "drawer" | "sidebar";

/** The machine bezel's internal arrangement (§14.1). */
export type MachineVariant = "stack" | "side";

/** Where the paper aux (tape + notes) lives in this template (§14.3). */
export type AuxPlacement = "sheets" | "left" | "below" | "right" | "in-machine";

export interface LayoutTemplate {
  id: TemplateId;
  chrome: ChromeMode;
  machine: MachineVariant;
  aux: AuxPlacement;
  /** false ⇒ that region is Sheet-hosted rather than an inline grid area. */
  regionsInline: Record<"aux" | "sidebar", boolean>;
}

export const TEMPLATES: Record<TemplateId, LayoutTemplate> = {
  stack: {
    id: "stack",
    chrome: "drawer",
    machine: "stack",
    aux: "sheets",
    regionsInline: { aux: false, sidebar: false },
  },
  "machine-side": {
    id: "machine-side",
    chrome: "drawer",
    machine: "side",
    aux: "in-machine",
    regionsInline: { aux: false, sidebar: false },
  },
  tablet: {
    id: "tablet",
    chrome: "drawer",
    machine: "stack",
    aux: "left",
    regionsInline: { aux: true, sidebar: false },
  },
  "tablet-wide": {
    id: "tablet-wide",
    chrome: "drawer",
    machine: "stack",
    aux: "below",
    regionsInline: { aux: true, sidebar: false },
  },
  desktop: {
    id: "desktop",
    chrome: "sidebar",
    machine: "stack",
    aux: "right",
    regionsInline: { aux: true, sidebar: true },
  },
};

/** The §14.2 enumeration: every (aspectClass × tier) cell. */
const CELLS: Record<KeyboardAspectClass, Record<WidthTier, TemplateId>> = {
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

export interface PlacementOptions {
  /**
   * The §14.1 short-viewport condition (`max-height: 34rem`): stacked would
   * crush portrait/tall keyboards, so their machine goes side-by-side.
   * Landscape models keep stacking even here (their stacked pitch stays
   * large) — they just drop to the simple stack template (aux via sheets).
   */
  shortViewport?: boolean;
}

/** Which template serves a model of this aspect class at this width tier. */
export function computePlacement(
  aspectClass: KeyboardAspectClass,
  tier: WidthTier,
  opts: PlacementOptions = {},
): LayoutTemplate {
  if (opts.shortViewport) {
    return aspectClass === "landscape" ? TEMPLATES.stack : TEMPLATES["machine-side"];
  }
  return TEMPLATES[CELLS[aspectClass][tier]];
}
