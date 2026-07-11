// src/components/calculator/Display.tsx
// The LCD (docs/responsive-layout.md §5) + the aux StackPanel, wired to the
// --hp-* tokens. BOTH LCD subtrees render — a wide/short single-line bar
// (`.lcd-line`, with a 1–2 line stack echo, §11 #8) and a mini 4:3 multi-line
// panel (`.lcd-mini`: KaTeX hero + compact stack + TVM row). CSS picks the
// default via the @container/lcd size query in globals.css; the chevron sets
// data-lcd-force, whose attribute rules WIN by specificity (§5.3) — no JS ever
// reads the container. Each subtree carries its own correctly-labelled toggle.
// KaTeX is injected via `renderLatex` so this file has no hard katex dependency.
"use client";

import { useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

export type LcdMode = "line" | "mini";

export interface DisplayProps {
  state: RpnState;
  family: Family;
  showAngle?: boolean;
  showRegisters?: boolean; // HP-12C financial readout
  /**
   * Line-mode stack echo (§11 #8, resolved ON): the single-line bar grows to
   * two lines and echoes the top of the stack so Y/Z/T are never fully lost
   * when no in-plane aux exists. Pass false to suppress.
   */
  showStack?: boolean;
  /**
   * Test/SSR seam only (§5.3): pins the branch via data-lcd-force exactly like
   * a user toggle. Production omits it — the container query decides.
   */
  defaultMode?: LcdMode;
  /** inject your KaTeX renderer so this file has no hard dependency */
  renderLatex: (tex: string) => { __html: string };
  fmt: (n: number, dec?: number) => string;
}

const num = "font-display tracking-[0.02em] text-hp-display-fg";
// The glass plane (§13.1): each subtree is its own glass panel.
const glass =
  "rounded-lg border border-hp-display-border bg-hp-display p-[var(--hp-lcd-pad)] shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-10px_20px_rgb(0_0_0/0.14)]";

function Annunciator({ label, hot }: { label: string; hot?: boolean }) {
  return (
    <span
      className={cn(
        "font-mono text-hp-lcd-annun font-bold tracking-[0.14em]",
        hot ? "text-hp-display-fg opacity-100" : "text-hp-display-dim opacity-40",
      )}
    >
      {label}
    </span>
  );
}

/** Status row shared by both LCD states; `toggle` is the state's own chevron. */
function AnnunRow({
  s,
  family,
  showAngle,
  toggle,
}: {
  s: RpnState;
  family: Family;
  showAngle?: boolean;
  toggle: React.ReactNode;
}) {
  const isRpl = family === "rpl";
  return (
    <div className="mb-1.5 flex items-center justify-end gap-3">
      <Annunciator label="f" hot={s.prefix === "f"} />
      <Annunciator label="g" hot={s.prefix === "g"} />
      {showAngle && s.ang && <Annunciator label={s.ang} hot />}
      <Annunciator label={isRpl ? "RPL" : "RPN"} hot />
      {family === "voyager" && <Annunciator label={s.beg ? "BEG" : "END"} hot />}
      {s.err && <Annunciator label="Error" hot />}
      {toggle}
    </div>
  );
}

export function Display({
  state: s,
  family,
  showAngle,
  showRegisters,
  showStack,
  defaultMode,
  renderLatex,
  fmt,
}: DisplayProps) {
  const isRpl = family === "rpl";
  // §5.3: null ⇒ no data-lcd-force attribute ⇒ the @container/lcd default
  // applies. The chevron sets an explicit mode (line's chevron forces mini and
  // vice versa) — user intent, later persisted (§12.6).
  const [userForce, setUserForce] = useState<LcdMode | null>(null);
  const force = userForce ?? defaultMode ?? null;

  const lineValue =
    s.entry != null
      ? s.entry
      : isRpl
        ? s.rpl && s.rpl.length
          ? fmt(s.rpl[s.rpl.length - 1], s.dec)
          : "0"
        : fmt(s.X, s.dec);
  // Line-state stack echo (§11 #8): the register just under the top.
  const echo = isRpl
    ? s.rpl && s.rpl.length > 1
      ? { label: "2:", value: fmt(s.rpl[s.rpl.length - 2], s.dec) }
      : null
    : { label: "Y", value: fmt(s.Y, s.dec) };

  return (
    <div className="lcd-panel w-full" data-lcd-force={force ?? undefined}>
      {/* ── State A: single line + annunciators (+ stack echo) ─────────────── */}
      <div data-lcd-mode="line" className={cn(glass, "lcd-line")}>
        <AnnunRow
          s={s}
          family={family}
          showAngle={showAngle}
          toggle={
            <button
              type="button"
              onClick={() => setUserForce("mini")}
              aria-label="Expand display"
              className="ml-1 text-hp-display-dim transition-colors hover:text-hp-display-fg"
            >
              <ChevronsUpDown className="size-3.5" />
            </button>
          }
        />
        <div
          className="flex items-center justify-end"
          style={{ minBlockSize: "var(--calc-lcd-line-h)" }}
        >
          <span className={cn(num, "text-hp-lcd-value")}>{lineValue}</span>
        </div>
        {showStack !== false && echo && (
          <div className="flex items-baseline justify-between border-t border-hp-display-dim/30 pt-1">
            <span className="font-mono text-hp-lcd-reg font-semibold tracking-[0.1em] text-hp-display-dim">
              {echo.label}
            </span>
            <span className={cn("text-hp-lcd-stack", "font-display text-hp-display-dim")}>
              {echo.value}
            </span>
          </div>
        )}
      </div>

      {/* ── State B: mini 4:3 multi-line (§5.2) ─────────────────────────────── */}
      <div data-lcd-mode="mini" className={cn(glass, "lcd-mini")}>
        <AnnunRow
          s={s}
          family={family}
          showAngle={showAngle}
          toggle={
            <button
              type="button"
              onClick={() => setUserForce("line")}
              aria-label="Collapse display"
              className="ml-1 text-hp-display-dim transition-colors hover:text-hp-display-fg"
            >
              <ChevronsDownUp className="size-3.5" />
            </button>
          }
        />

        {/* KaTeX hero */}
        <div
          className="flex items-center text-hp-lcd-hero text-hp-display-fg"
          style={{ minBlockSize: "var(--calc-lcd-line-h)" }}
          dangerouslySetInnerHTML={renderLatex(s.latex)}
        />

        {/* compact stack */}
        {isRpl ? (
          <RplStack rpl={s.rpl ?? []} entry={s.entry} fmt={(n) => fmt(n, s.dec)} />
        ) : (
          <div className="mt-2">
            <StackRow label="T" value={fmt(s.T, s.dec)} muted />
            <StackRow label="Z" value={fmt(s.Z, s.dec)} muted />
            <StackRow label="Y" value={fmt(s.Y, s.dec)} />
            <div className="my-[3px] h-px bg-hp-display-dim opacity-30" />
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-hp-lcd-reg font-bold tracking-[0.1em] text-hp-display-fg opacity-70">
                X
              </span>
              <span className={cn(num, "text-hp-lcd-hero")}>
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
                  "font-mono text-hp-lcd-reg",
                  s.reg![k] ? "text-hp-display-fg" : "text-hp-display-dim",
                )}
              >
                <b className="text-hp-display-dim">{k} </b>
                {s.reg![k] || "—"}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
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
      <span className="font-mono text-hp-lcd-reg font-semibold tracking-[0.1em] text-hp-display-dim">
        {label}
      </span>
      <span className={cn("text-hp-lcd-stack", muted ? "font-display text-hp-display-dim" : num)}>
        {value}
      </span>
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
        <div className="py-5 text-center font-mono text-hp-lcd-stack text-hp-display-dim">
          ( empty stack )
        </div>
      ) : (
        lines.map((l) => (
          <div
            key={l.lvl}
            className="flex items-baseline gap-2.5 border-t border-black/10 py-[3px]"
          >
            <span className="min-w-[20px] font-mono text-hp-lcd-reg text-hp-display-dim">
              {l.lvl}:
            </span>
            <span className={cn("flex-1 text-right text-hp-lcd-stack", num)}>{l.val}</span>
          </div>
        ))
      )}
      <div className="mt-1.5 flex items-center gap-1.5 border-t-2 border-hp-display-border pt-1.5">
        <span className="font-mono text-hp-lcd-reg text-hp-display-dim">⊳</span>
        <span className={cn("flex-1 text-hp-lcd-stack", num)}>{entry ?? ""}</span>
      </div>
    </div>
  );
}

// ---- StackPanel (aux: live stack ABOVE history — §12.5) ---------------------
export interface StackPanelProps {
  state: RpnState;
  family: Family;
  fmt: (n: number, dec?: number) => string;
  className?: string;
  /** when provided (mobile drawer), renders a close button */
  onClose?: () => void;
  /** equation/variable/TVM strip (§12.5) — pinned between the stack and history */
  varsRow?: React.ReactNode;
}

export function StackPanel({ state: s, family, fmt, className, onClose, varsRow }: StackPanelProps) {
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
      {/* live stack first — glanced at every keystroke, nearest the LCD (§12.5) */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {isRpl ? "RPL Stack" : "RPN Stack"}
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
      <div>
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between py-0.5">
            <span className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
              {row.lab}
            </span>
            <span
              className={cn(
                // salvia = informational accent (§13.3) — gold stays reserved
                // for the brand and f-shift semantics
                "font-mono text-[14px]",
                row.hot ? "text-salvia" : "text-foreground",
              )}
            >
              {row.val}
            </span>
          </div>
        ))}
      </div>

      {/* equation/variable/TVM strip — glanceable without opening anything (§12.5) */}
      {varsRow}

      {/* history — the archive, scrolls away beneath (§12.5) */}
      <h3 className="mt-3.5 mb-2.5 border-t border-border pt-3.5 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        History
      </h3>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
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
    </aside>
  );
}
