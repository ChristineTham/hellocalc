// src/components/calculator/CalcShell.tsx
// The responsive shell (docs/responsive-layout.md §3): one CSS grid whose
// template is selected by width media tier × the static per-model aspect
// class. Layout is pure CSS (globals.css @layer components) — this component
// stamps the selection inputs (data-aspect + the per-model --kbd-* data) and,
// post-mount, the §10 diagnostic labels from the SAME oracle the tests assert
// (computePlacement), so labels can never drift from an independent guess.
"use client";

import { useViewportTier } from "@/hooks/useViewportTier";
import { computePlacement } from "@/lib/layout/templates";
import type { Model } from "./models";

export interface CalcShellProps {
  model: Model;
  topbar: React.ReactNode;
  lcd: React.ReactNode;
  keyboard: React.ReactNode;
  aux?: React.ReactNode;
  sidebar?: React.ReactNode;
}

/** CSSProperties plus the per-model keyboard data vars the templates consume. */
type ShellStyle = React.CSSProperties & {
  "--kbd-a": string;
  "--kbd-cols": string;
  "--kbd-rows": string;
};

export function CalcShell({ model, topbar, lcd, keyboard, aux, sidebar }: CalcShellProps) {
  const { tier, shortLandscape } = useViewportTier();
  const g = model.geometry;
  const placement = tier ? computePlacement(g.aspectClass, tier, { shortLandscape }) : null;
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
      data-kbd-placement={placement?.kbdPlacement}
      style={style}
    >
      <div data-region="topbar">{topbar}</div>
      <aside data-region="sidebar" aria-label="Navigation">
        {sidebar}
      </aside>
      <div data-region="lcd">{lcd}</div>
      <div data-region="aux">{aux}</div>
      <div data-region="keyboard">{keyboard}</div>
    </main>
  );
}
