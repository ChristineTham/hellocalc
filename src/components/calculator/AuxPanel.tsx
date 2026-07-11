// src/components/calculator/AuxPanel.tsx
// The aux region (docs/responsive-layout.md §3.1, §12.5): authoritative live
// stack pinned ABOVE the scrolling history, with the equation/variable/TVM
// strip between them — glanceable without opening anything. Inline in the
// shell's aux grid area on md+; hosted in the bottom sheet below that.
"use client";

import { StackPanel, type RpnState } from "./Display";
import type { Family } from "./models";

export interface AuxPanelProps {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
  /** financial models (HP-12C): pin the TVM register strip under the stack */
  showRegisters?: boolean;
}

const TVM_KEYS = ["n", "i", "PV", "PMT", "FV"] as const;

/** TVM chip row — registers read “—” until set (finance module fills them). */
function TvmStrip({ state }: { state: RpnState }) {
  return (
    <div
      data-slot="tvm-strip"
      className="mt-3.5 border-t border-border pt-3.5"
    >
      <h3 className="mb-2 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        TVM Registers
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {TVM_KEYS.map((k) => (
          <span
            key={k}
            className="inline-flex items-baseline gap-1.5 rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px]"
          >
            <b className="text-muted-foreground">{k}</b>
            <span className="text-foreground">{state.reg?.[k] || "—"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function AuxPanel({ state, family, fmt, showRegisters }: AuxPanelProps) {
  return (
    <StackPanel
      state={state}
      family={family}
      fmt={fmt}
      className="size-full max-w-none min-w-0"
      varsRow={showRegisters ? <TvmStrip state={state} /> : undefined}
    />
  );
}
