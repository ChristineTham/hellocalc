// src/components/calculator/AuxPanel.tsx
// The aux region (docs/responsive-layout.md §3.1, §12.5): authoritative live
// stack pinned ABOVE the scrolling history (StackPanel renders that order),
// plus — in Step 5 — the equation/variable/TVM strip. Inline in the shell's
// aux grid area on md+; hosted in the drawer/Sheet below that.
"use client";

import { StackPanel, type RpnState } from "./Display";
import type { Family } from "./models";

export interface AuxPanelProps {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
}

export function AuxPanel({ state, family, fmt }: AuxPanelProps) {
  return <StackPanel state={state} family={family} fmt={fmt} className="size-full max-w-none min-w-0" />;
}
