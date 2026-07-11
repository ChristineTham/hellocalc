// src/components/calculator/PaperAux.tsx
// The paper aux components (docs/responsive-layout.md §14.3) — three SEPARATE
// pieces, explicitly NOT LCD-styled:
//   HistoryTape — a printing-calculator paper trail (straight top, perforated
//     bottom, mono figures, newest at the top like fresh print).
//   StackNote / VarsNote — clean notebook note cards (warm paper, ruled
//     hairlines, tracked captions).
// AuxColumn arranges them: notes first, tape last (printing downward). The
// tablet-wide template reflows the column into a row via CSS (.aux-flow).
"use client";

import { cn } from "@/lib/utils";
import type { RpnState } from "./Display";
import type { Family } from "./models";

const CAPTION =
  "mb-2 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";
const NOTE =
  "rounded-md border border-paper-line bg-paper p-3.5 shadow-[0_8px_18px_-12px_var(--color-shadow-warm)]";

export function HistoryTape({
  hist,
  className,
}: {
  hist: RpnState["hist"];
  className?: string;
}) {
  const rows = (hist ?? []).slice().reverse(); // newest at the top — fresh print
  return (
    <section data-slot="history-tape" className={cn("flex min-h-0 flex-col", className)}>
      <h3 className={CAPTION}>History</h3>
      <div className="paper-tape flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-sm border border-b-0 border-paper-line px-3 py-2">
        {rows.length === 0 ? (
          <p className="py-3 text-center font-mono text-[11px] text-muted-foreground/70">
            — no entries yet —
          </p>
        ) : (
          rows.map((e, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-3 border-b border-paper-line py-1.5 last:border-0"
            >
              <span className="font-legend text-[12px] font-semibold text-muted-foreground">
                {e.op}
              </span>
              <span className="font-mono text-[13px] tabular-nums text-foreground">{e.v}</span>
            </div>
          ))
        )}
      </div>
      {/* the perforated edge is the tape's ::after — leave room for it */}
      <div className="h-2 shrink-0" />
    </section>
  );
}

export function StackNote({
  state: s,
  family,
  fmt,
  className,
}: {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
  className?: string;
}) {
  const isRpl = family === "rpl";
  const rows = isRpl
    ? (() => {
        const st = s.rpl ?? [];
        const out: { lab: string; val: string; hot: boolean }[] = [];
        for (let i = st.length - 1; i >= Math.max(0, st.length - 5); i--)
          out.push({
            lab: `${st.length - i}:`,
            val: fmt(st[i], s.dec),
            hot: i === st.length - 1,
          });
        return out.length ? out : [{ lab: "1:", val: "—", hot: true }];
      })()
    : (["T", "Z", "Y", "X"] as const).map((k) => ({
        lab: k,
        val: fmt(s[k], s.dec),
        hot: k === "X",
      }));

  return (
    <section data-slot="stack-note" className={cn("flex flex-col", className)}>
      <h3 className={CAPTION}>{isRpl ? "RPL Stack" : "RPN Stack"}</h3>
      <div className={NOTE}>
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-paper-line py-1 last:border-0"
          >
            <span className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
              {row.lab}
            </span>
            <span
              className={cn(
                "font-mono text-[13.5px] tabular-nums",
                row.hot ? "text-salvia" : "text-foreground",
              )}
            >
              {row.val}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

const TVM_KEYS = ["n", "i", "PV", "PMT", "FV"] as const;

export function VarsNote({ state: s, className }: { state: RpnState; className?: string }) {
  return (
    <section data-slot="vars-note" className={cn("flex flex-col", className)}>
      <h3 className={CAPTION}>TVM Registers</h3>
      <div data-slot="tvm-strip" className={NOTE}>
        {TVM_KEYS.map((k) => (
          <div
            key={k}
            className="flex justify-between border-b border-paper-line py-1 last:border-0"
          >
            <span className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
              {k}
            </span>
            <span className="font-mono text-[13.5px] tabular-nums text-foreground">
              {s.reg?.[k] || "—"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export interface AuxColumnProps {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
  /** financial models (HP-12C): include the TVM note */
  showRegisters?: boolean;
  /** "bay": the side-machine's compact below-LCD arrangement (§14.3) */
  variant?: "flow" | "bay";
  className?: string;
}

export function AuxColumn({
  state,
  family,
  fmt,
  showRegisters,
  variant = "flow",
  className,
}: AuxColumnProps) {
  if (variant === "bay") {
    // compact paper resting on the machine body: stack note + tape only
    return (
      <div className={cn("aux-flow w-full", className)}>
        <StackNote state={state} family={family} fmt={fmt} />
        <HistoryTape hist={state.hist} className="min-h-0 flex-1" />
      </div>
    );
  }
  return (
    <div className={cn("aux-flow size-full", className)}>
      <StackNote state={state} family={family} fmt={fmt} />
      {showRegisters && <VarsNote state={state} />}
      <HistoryTape hist={state.hist} className="min-h-0 flex-1" />
    </div>
  );
}
