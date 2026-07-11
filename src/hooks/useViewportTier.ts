// src/hooks/useViewportTier.ts
// SSR-safe viewport-tier hook (docs/responsive-layout.md §14.2, §10): returns
// null on the server / before mount, then the live width tier + the short-
// viewport flag (§14.1 — stacked machines would crush portrait/tall keyboards
// below ~34rem of height). Used ONLY to stamp data-template / data-chrome /
// data-machine as test/diagnostic labels — CSS media queries (from the same
// breakpoints source) drive the actual layout, so a late stamp can never
// cause a layout flash.
"use client";

import { useEffect, useState } from "react";
import { widthTierOf, type WidthTier } from "@/lib/layout/breakpoints";

/** Mirrors the §14.1 side-variant / short-override media condition. */
export const SHORT_VIEWPORT_QUERY = "(max-height: 34rem)";

export interface ViewportTier {
  /** null until mounted (SSR-deterministic, mirrors useMediaQuery's contract). */
  tier: WidthTier | null;
  shortViewport: boolean;
}

export function useViewportTier(): ViewportTier {
  const [state, setState] = useState<ViewportTier>({
    tier: null,
    shortViewport: false,
  });

  useEffect(() => {
    // jsdom lacks matchMedia unless mocked; guard so component tests can mount.
    const mql =
      typeof window.matchMedia === "function"
        ? window.matchMedia(SHORT_VIEWPORT_QUERY)
        : null;
    const update = () =>
      setState({
        tier: widthTierOf(window.innerWidth),
        shortViewport: mql?.matches ?? false,
      });
    update();
    window.addEventListener("resize", update);
    mql?.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mql?.removeEventListener("change", update);
    };
  }, []);

  return state;
}
