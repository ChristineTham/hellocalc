// src/components/calculator/CalcShell.tsx
// The responsive shell (docs/responsive-layout.md §14.2): one CSS grid over
// four regions — topbar / sidebar / MACHINE / aux — whose template is
// selected by width media tier × the static per-model aspect class. The
// machine (nameplate + LCD + keyboard) is one integrated region; no template
// separates the display from the keys. Layout is pure CSS (globals.css
// @layer components) — this component stamps the selection inputs
// (data-aspect + per-model --kbd-* data) and, post-mount, the §10 diagnostic
// labels from the SAME oracle the tests assert (computePlacement), so labels
// can never drift from an independent guess.
"use client";

import { useViewportTier } from "@/hooks/useViewportTier";
import { computePlacement } from "@/lib/layout/templates";
import type { Model } from "./models";

export interface CalcShellProps {
  model: Model;
  topbar: React.ReactNode;
  machine: React.ReactNode;
  aux?: React.ReactNode;
  sidebar?: React.ReactNode;
}

/** CSSProperties plus the per-model keyboard data vars the templates consume. */
type ShellStyle = React.CSSProperties & {
  "--kbd-a": string;
  "--kbd-cols": string;
  "--kbd-rows": string;
};

export function CalcShell({ model, topbar, machine, aux, sidebar }: CalcShellProps) {
  const { tier, shortViewport } = useViewportTier();
  const g = model.geometry;
  const placement = tier ? computePlacement(g.aspectClass, tier, { shortViewport }) : null;
  const style: ShellStyle = {
    "--kbd-a": String(g.aspect),
    "--kbd-cols": String(g.cols),
    "--kbd-rows": String(g.rows),
  };

  return (
    <main
      className="calc-shell bg-background text-foreground"
      data-aspect={g.aspectClass}
      data-template={placement?.id}
      data-chrome={placement?.chrome}
      data-machine={placement?.machine}
      style={style}
    >
      {/* keyboard users jump straight past the chrome to the machine (a11y) */}
      <a
        href="#machine"
        className="sr-only z-50 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to calculator
      </a>
      <div data-region="topbar">{topbar}</div>
      <aside data-region="sidebar" aria-label="Navigation">
        {sidebar}
      </aside>
      <div data-region="machine" id="machine" tabIndex={-1}>
        {machine}
      </div>
      <div data-region="aux">{aux}</div>
    </main>
  );
}
