// src/components/calculator/Display.tsx
// Calculator display + side StackPanel, wired to the --hp-* tokens.
// The display shows: annunciators, a KaTeX "hero" of the last result, the RPN
// stack (T/Z/Y/X + LAST X), and — on financial models — the TVM register row.
// KaTeX is injected via `renderLatex` so this file has no hard katex dependency
// (render with katex.renderToString(tex, { throwOnError: false }) at the seam).
"use client";

import { useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Family } from "./models";

// ---- shared types the engine/hook exposes ----------------------------------
export interface RpnState {
  T: number;
  Z: number;
  Y: number;
  X: number;
  lastX: number;
  entry: string | null; // in-progress keyed number, or null
  dec: number; // FIX digits
  ang?: "DEG" | "RAD" | "GRD";
  prefix: "none" | "f" | "g" | "ls" | "rs" | "arc" | "alpha";
  beg?: boolean; // 12C begin/end
  err?: string;
  latex: string; // last result, as KaTeX source
  reg?: Record<"n" | "i" | "PV" | "PMT" | "FV", string>; // TVM readout
  rpl?: number[]; // RPL dynamic stack (bottom -> top)
  hist?: { op: string; v: string }[];
}

export interface DisplayProps {
  state: RpnState;
  family: Family;
  showAngle?: boolean;
  showRegisters?: boolean; // HP-12C financial readout
  /** inject your KaTeX renderer so this file has no hard dependency */
  renderLatex: (tex: string) => { __html: string };
  fmt: (n: number, dec?: number) => string;
}

const num = "font-display tracking-[0.02em] text-hp-display-fg";

function Annunciator({ label, hot }: { label: string; hot?: boolean }) {
  return (
    <span
      className={cn(
        "font-mono text-[9.5px] font-bold tracking-[0.14em]",
        hot ? "text-hp-display-fg opacity-100" : "text-hp-display-dim opacity-40",
      )}
    >
      {label}
    </span>
  );
}

function StackRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-px">
      <span className="font-mono text-[11px] font-semibold tracking-[0.1em] text-hp-display-dim">
        {label}
      </span>
      <span className={cn("text-[17px]", muted ? "font-display text-hp-display-dim" : num)}>
        {value}
      </span>
    </div>
  );
}

export function Display({
  state: s,
  family,
  showAngle,
  showRegisters,
  renderLatex,
  fmt,
}: DisplayProps) {
  const isRpl = family === "rpl";
  // Collapsible LCD: full multi-line view on larger screens; on small screens it
  // defaults to a compact single-line readout resembling the real device, with a
  // toggle to expand (FR-UI-9). `null` = follow the responsive default.
  const compactByDefault = useMediaQuery("(max-width: 639px)");
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const expanded = userExpanded ?? !compactByDefault;
  const compactValue =
    s.entry != null
      ? s.entry
      : isRpl
        ? s.rpl && s.rpl.length
          ? fmt(s.rpl[s.rpl.length - 1], s.dec)
          : "0"
        : fmt(s.X, s.dec);

  return (
    <div className="flex flex-col rounded-lg border border-hp-display-border bg-hp-display p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-10px_20px_rgb(0_0_0/0.14)]">
      {/* annunciators + expand/collapse toggle */}
      <div className="mb-1.5 flex items-center justify-end gap-3">
        <Annunciator label="f" hot={s.prefix === "f"} />
        <Annunciator label="g" hot={s.prefix === "g"} />
        {showAngle && s.ang && <Annunciator label={s.ang} hot />}
        <Annunciator label={isRpl ? "RPL" : "RPN"} hot />
        {family === "voyager" && <Annunciator label={s.beg ? "BEG" : "END"} hot />}
        {s.err && <Annunciator label="Error" hot />}
        <button
          type="button"
          onClick={() => setUserExpanded(!expanded)}
          aria-label={expanded ? "Collapse display" : "Expand display"}
          aria-expanded={expanded}
          className="ml-1 text-hp-display-dim transition-colors hover:text-hp-display-fg"
        >
          {expanded ? (
            <ChevronsDownUp className="size-3.5" />
          ) : (
            <ChevronsUpDown className="size-3.5" />
          )}
        </button>
      </div>

      {expanded ? (
        <>
          {/* KaTeX hero */}
          <div
            className="flex min-h-[52px] items-center text-[30px] text-hp-display-fg"
            dangerouslySetInnerHTML={renderLatex(s.latex)}
          />

          {/* stack */}
          {isRpl ? (
            <RplStack rpl={s.rpl ?? []} entry={s.entry} fmt={(n) => fmt(n, s.dec)} />
          ) : (
            <div className="mt-2">
              <StackRow label="T" value={fmt(s.T, s.dec)} muted />
              <StackRow label="Z" value={fmt(s.Z, s.dec)} muted />
              <StackRow label="Y" value={fmt(s.Y, s.dec)} />
              <div className="my-[3px] h-px bg-hp-display-dim opacity-30" />
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-hp-display-fg opacity-70">
                  X
                </span>
                <span className={cn(num, "text-[30px]")}>
                  {s.entry != null ? s.entry : fmt(s.X, s.dec)}
                </span>
              </div>
              <StackRow label="LST x" value={fmt(s.lastX, s.dec)} muted />
            </div>
          )}

          {/* TVM registers (HP-12C) */}
          {showRegisters && s.reg && (
            <div className="mt-2.5 flex flex-wrap gap-2.5 border-t border-hp-display-dim pt-2">
              {(["n", "i", "PV", "PMT", "FV"] as const).map((k) => (
                <span
                  key={k}
                  className={cn(
                    "font-mono text-[10px]",
                    s.reg![k] ? "text-hp-display-fg" : "text-hp-display-dim",
                  )}
                >
                  <b className="text-hp-display-dim">{k} </b>
                  {s.reg![k] || "—"}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        // Compact single-line readout — resembles the real device's LCD.
        <div className="flex min-h-[52px] items-center justify-end">
          <span className={cn(num, "text-[32px]")}>{compactValue}</span>
        </div>
      )}
    </div>
  );
}

function RplStack({
  rpl,
  entry,
  fmt,
}: {
  rpl: number[];
  entry: string | null;
  fmt: (n: number) => string;
}) {
  const start = Math.max(0, rpl.length - 6);
  const lines = rpl
    .slice(start)
    .map((val, i) => ({ lvl: rpl.length - (start + i), val: fmt(val) }));
  return (
    <div className="mt-1 flex flex-1 flex-col justify-end gap-px">
      {lines.length === 0 ? (
        <div className="py-5 text-center font-mono text-[13px] text-hp-display-dim">
          ( empty stack )
        </div>
      ) : (
        lines.map((l) => (
          <div
            key={l.lvl}
            className="flex items-baseline gap-2.5 border-t border-black/10 py-[3px]"
          >
            <span className="min-w-[20px] font-mono text-[11px] text-hp-display-dim">
              {l.lvl}:
            </span>
            <span className={cn("flex-1 text-right text-[20px]", num)}>{l.val}</span>
          </div>
        ))
      )}
      <div className="mt-1.5 flex items-center gap-1.5 border-t-2 border-hp-display-border pt-1.5">
        <span className="font-mono text-[13px] text-hp-display-dim">⊳</span>
        <span className={cn("flex-1 text-[18px]", num)}>{entry ?? ""}</span>
      </div>
    </div>
  );
}

// ---- StackPanel (side rail: history + live stack) ---------------------------
export interface StackPanelProps {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
  className?: string;
  /** when provided (mobile drawer), renders a close button */
  onClose?: () => void;
}

export function StackPanel({ state: s, family, fmt, className, onClose }: StackPanelProps) {
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
    <aside
      className={cn(
        "flex w-full max-w-[420px] min-w-[260px] flex-col self-stretch rounded-[var(--radius-bezel)] border border-border bg-hp-panel p-5",
        className,
      )}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          History
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex min-h-[200px] flex-1 flex-col gap-2.5 overflow-y-auto">
        {(s.hist ?? [])
          .slice()
          .reverse()
          .map((e, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between border-b border-border pb-2"
            >
              <span className="font-legend text-[13px] font-semibold text-muted-foreground">
                {e.op}
              </span>
              <span className="font-mono text-[14px] text-foreground">{e.v}</span>
            </div>
          ))}
      </div>
      <div className="mt-3.5 border-t border-border pt-3.5">
        <h3 className="mb-2.5 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {isRpl ? "RPL Stack" : "RPN Stack"}
        </h3>
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between py-0.5">
            <span className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
              {row.lab}
            </span>
            <span
              className={cn(
                "font-mono text-[14px]",
                row.hot ? "text-primary" : "text-foreground",
              )}
            >
              {row.val}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
