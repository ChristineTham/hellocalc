// src/hooks/useViewportTier.ts
// SSR-safe viewport-tier hook (docs/responsive-layout.md §3.1, §10): returns
// null on the server / before mount, then the live width tier + the §3.3
// short-landscape override flag. Used ONLY to stamp data-template /
// data-chrome / data-kbd-placement as test/diagnostic labels — CSS media
// queries (from the same breakpoints source) drive the actual layout, so a
// late stamp can never cause a layout flash.
"use client";

import { useEffect, useState } from "react";
import { widthTierOf, type WidthTier } from "@/lib/layout/breakpoints";

/** Mirrors the §3.3 phone-landscape template's media condition. */
export const SHORT_LANDSCAPE_QUERY =
  "(min-width: 40rem) and (max-height: 34rem) and (orientation: landscape)";

export interface ViewportTier {
  /** null until mounted (SSR-deterministic, mirrors useMediaQuery's contract). */
  tier: WidthTier | null;
  shortLandscape: boolean;
}

export function useViewportTier(): ViewportTier {
  const [state, setState] = useState<ViewportTier>({
    tier: null,
    shortLandscape: false,
  });

  useEffect(() => {
    // jsdom lacks matchMedia unless mocked; guard so component tests can mount.
    const mql =
      typeof window.matchMedia === "function"
        ? window.matchMedia(SHORT_LANDSCAPE_QUERY)
        : null;
    const update = () =>
      setState({
        tier: widthTierOf(window.innerWidth),
        shortLandscape: mql?.matches ?? false,
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
