// src/components/calculator/Printer.tsx
// The HP-97's thermal PRINTER — the desktop machine's signature. Sits to the
// RIGHT of the compact display in the machine's top deck (§14 desktop deck):
// a dark print-head housing with a paper slot, and a cream paper tape curling
// down out of it with the recent print/history lines (newest at the print head
// on top, older below), a torn/perforated bottom edge. Paper is a fixed warm
// off-white in BOTH themes — it's paper, like the LCD glass is always green.
"use client";

import { cn } from "@/lib/utils";
import type { RpnState } from "./Display";

export interface PrinterProps {
  hist: RpnState["hist"];
}

export function Printer({ hist }: PrinterProps) {
  // newest at the top, just under the print head — the freshest print
  const lines = (hist ?? []).slice().reverse().slice(0, 20);
  return (
    <div data-slot="printer" className="flex min-h-0 min-w-0 flex-col">
      {/* print-head housing — the mechanism the paper feeds through */}
      <div className="relative flex h-4 shrink-0 items-center rounded-t-md bg-hp-bezel-border shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
        <div className="mx-2 h-[3px] flex-1 rounded-full bg-black/55" />
      </div>

      {/* the paper tape */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden px-2 pt-1.5 pb-3 font-mono text-[11px] leading-[1.35] text-[#3b352a]"
        style={{
          background: "linear-gradient(#efe9db, #e7e0cf)",
          // perforated tear along the bottom edge
          WebkitMaskImage:
            "radial-gradient(circle at 6px bottom, transparent 0 3px, black 3.5px) 0 0 / 12px 100% repeat-x",
          maskImage:
            "radial-gradient(circle at 6px bottom, transparent 0 3px, black 3.5px) 0 0 / 12px 100% repeat-x",
          boxShadow: "inset 0 8px 10px -8px rgb(0 0 0 / 0.28)",
        }}
      >
        {lines.length === 0 ? (
          <div className="pt-2 text-center text-[10px] tracking-wide text-[#8a8375]">
            — paper —
          </div>
        ) : (
          <div className="flex flex-col gap-[1px]">
            {lines.map((e, i) => (
              <div
                key={`${i}-${e.op}-${e.v}`}
                className="flex items-baseline justify-between gap-2 tabular-nums"
              >
                <span className="truncate text-[9px] tracking-wide text-[#8a8375] uppercase">
                  {e.op}
                </span>
                <span className={cn("shrink-0", i === 0 && "font-semibold")}>{e.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
