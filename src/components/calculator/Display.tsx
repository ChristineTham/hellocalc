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
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Family } from "./models";
import type { Value } from "@/lib/engine/config";

// ---- shared types the engine/hook exposes ----------------------------------
// Values are BigNumbers end-to-end (Phase 1 value tower); components never
// compute on them — everything passes through fmt() to a string.
export interface RpnState {
  T: Value;
  Z: Value;
  Y: Value;
  X: Value;
  lastX: Value;
  entry: string | null; // in-progress keyed number, or null
  dec: number; // FIX digits
  ang?: "DEG" | "RAD" | "GRD";
  prefix: "none" | "f" | "g" | "h" | "fi" | "ls" | "rs" | "arc" | "alpha";
  beg?: boolean; // 12C begin/end
  err?: string;
  latex: string; // last result, as KaTeX source
  reg?: Record<"n" | "i" | "PV" | "PMT" | "FV", string>; // TVM readout
  rpl?: Value[]; // RPL dynamic stack (bottom -> top)
  hist?: { op: string; v: string; raw?: string }[];
}

export type LcdMode = "line" | "mini";

export interface DisplayProps {
  state: RpnState;
  family: Family;
  showAngle?: boolean;
  showRegisters?: boolean; // HP-12C financial readout
  /** Per-model glass proportions (e.g. the 50g's "131 / 80"); defaults to the
   * family token (--hp-lcd-aspect-rpl, the 48-series 131:64). */
  lcdAspect?: string;
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
  fmt: (n: Value, dec?: number) => string;
}

// Segment numerals (DSEG7) for the seven-segment families; dot-matrix
// (Silkscreen) for RPL machines — the HP-48 display is a 131×64 pixel
// matrix, never a segment readout.
const segNum = "font-display tracking-[0.02em] text-hp-display-fg";
const dotNum = "font-lcd-dot tracking-normal text-hp-display-fg";
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
      <Annunciator label="f" hot={s.prefix === "f" || s.prefix === "fi"} />
      <Annunciator label="g" hot={s.prefix === "g"} />
      {s.prefix === "h" && <Annunciator label="h" hot />}
      {s.prefix === "alpha" && family !== "rpl" && <Annunciator label="ALPHA" hot />}
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
  lcdAspect,
  renderLatex,
  fmt,
}: DisplayProps) {
  const isRpl = family === "rpl";
  // §5.3: null ⇒ no data-lcd-force attribute ⇒ the @container/lcd default
  // applies. The chevron sets an explicit mode (line's chevron forces mini and
  // vice versa) — user intent, later persisted (§12.6).
  const [userForce, setUserForce] = useState<LcdMode | null>(null);
  const force = userForce ?? defaultMode ?? null;
  // dot-matrix glass: the RPL machines AND the menu-driven/modern RPN line
  // (42S/35s/Prime) — segment digits belong to the LED/LCD-digit eras
  const num = isRpl || family === "pioneer" ? dotNum : segNum;

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

  // Per-model glass proportions (the 50g is 131×80 vs the 48-series 131×64):
  // override the aspect token locally so the family CSS picks it up.
  const panelStyle = lcdAspect
    ? ({ "--hp-lcd-aspect-rpl": lcdAspect } as React.CSSProperties)
    : undefined;

  return (
    <div
      className="lcd-panel w-full"
      data-lcd-force={force ?? undefined}
      data-lcd-family={family}
      style={panelStyle}
    >
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
          // RPN echo is `lcd-stack`: hidden when a paper stack is in-plane
          // (§14.3 rev 3). RPL keeps its echo — the glass owns the RPL stack.
          <div
            className={cn(
              !isRpl && "lcd-stack",
              "flex items-baseline justify-between border-t border-hp-display-dim/30 pt-1",
            )}
          >
            <span className="font-mono text-hp-lcd-reg font-semibold tracking-[0.1em] text-hp-display-dim">
              {echo.label}
            </span>
            <span
              className={cn(
                "text-hp-lcd-stack",
                isRpl ? "font-lcd-dot" : "font-display",
                "text-hp-display-dim",
              )}
            >
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

        {/* compact stack — for RPN it is `lcd-stack` (one home: paper when
            in-plane, glass otherwise, §14.3 rev 3); the RPL glass ALWAYS
            shows its stack — that is what a 48G display is */}
        {isRpl ? (
          <RplStack rpl={s.rpl ?? []} entry={s.entry} fmt={(n) => fmt(n, s.dec)} />
        ) : (
          <div className="lcd-stack mt-2">
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
      <span
        className={cn("text-hp-lcd-stack", muted ? "font-display text-hp-display-dim" : segNum)}
      >
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
  rpl: Value[];
  entry: string | null;
  fmt: (n: Value) => string;
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
            <span className={cn("flex-1 text-right text-hp-lcd-stack", dotNum)}>{l.val}</span>
          </div>
        ))
      )}
      <div className="mt-1.5 flex items-center gap-1.5 border-t-2 border-hp-display-border pt-1.5">
        <span className="font-mono text-hp-lcd-reg text-hp-display-dim">⊳</span>
        <span className={cn("flex-1 text-hp-lcd-stack", dotNum)}>{entry ?? ""}</span>
      </div>
    </div>
  );
}
