// src/components/calculator/KeyboardFitter.tsx
// Priority-1 fitter box (docs/responsive-layout.md §4.3): the .kbd-module CSS
// (globals.css) applies the contain formula
//   inline-size: min(100cqi, (100cqb − chrome)·A, --calc-kbd-max-w)
// inside the shell's container:kbd/size slot, and margin:auto centres it.
// No transform, no ResizeObserver — pure CSS; the child (KeyboardZone) is
// nameplate chrome + an aspect-locked key grid that fills this width.
"use client";

export function KeyboardFitter({ children }: { children: React.ReactNode }) {
  return <div className="kbd-module">{children}</div>;
}
