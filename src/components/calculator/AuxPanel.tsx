// src/components/calculator/AuxPanel.tsx
// The aux region (docs/responsive-layout.md §14.3): paper on the desk — stack
// note, TVM note (financial models), and the history tape, arranged by
// AuxColumn (notes first, tape printing downward; the tablet-wide template
// reflows the column into a row via CSS; the side machine hosts the compact
// "bay" variant below its LCD).
"use client";

import { AuxColumn } from "./PaperAux";
import type { RpnState } from "./Display";
import type { Family } from "./models";

export interface AuxPanelProps {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
  /** financial models (HP-12C): include the TVM registers note */
  showRegisters?: boolean;
  /** "bay": the side-machine's compact below-LCD arrangement */
  variant?: "flow" | "bay";
}

export function AuxPanel({ state, family, fmt, showRegisters, variant }: AuxPanelProps) {
  return (
    <AuxColumn
      state={state}
      family={family}
      fmt={fmt}
      showRegisters={showRegisters}
      variant={variant}
    />
  );
}
