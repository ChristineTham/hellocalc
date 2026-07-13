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

import { useEffect, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnnunSet, Family } from "./models";
import type { Value } from "@/lib/engine/config";
import type { PlotReq } from "@/lib/engine/rpl/plot";
import { PlotPanel } from "./PlotPanel";

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
  /** nonzero storage registers (M, R0–R9, Σn), formatted — the vars note */
  registers?: { name: string; value: string }[];
  /** the equation SOLVER: current equation + its variables/values (var menu) */
  solver?: { eq: string; vars: { name: string; value: string }[] };
  /** the active financial app (ICNV/BOND/DEPRC/BS) + its variable values */
  app?: { title: string; vars: { name: string; value: string }[] };
  /** the active list app (CFLO cash flows / SUM statistics) + its items */
  list?: { title: string; items: string[] };
  /** the equation text being typed (SOLVER entry mode) — echoed on the glass */
  eqEntry?: string;
  /** keystroke program view (P3): mode + steps + pointer for the program note */
  prgm?: { mode: "RUN" | "PRGM"; pc: number; steps: string[] };
  /** the ALPHA register (P6, HP-41) — shown on the glass while ALPHA is armed */
  alpha?: string;
  /** formatted imaginary part of X (15C complex mode), when nonzero */
  imX?: string;
  /** active integer base (16C): HEX / DEC / OCT / BIN */
  intBase?: string;
  /** RPL dynamic stack, PRE-FORMATTED display rows (bottom -> top) — the
   * hook renders objects (P12); the glass never sees engine values */
  rpl?: string[];
  /** RPL softkey menu row (P12): 6 labels + paging state */
  menu?: { name: string; labels: string[]; page: number; pages: number };
  /** RPL DISP message line (P12) */
  msg?: string;
  /** the 48-series plot request (P17) — rendered by the lazy PlotPanel
   * (function-plot for 2D series, Plotly for bars/3D surfaces) */
  plot?: PlotReq;
  hist?: { op: string; v: string; raw?: string }[];
  /** a keystroke program is running under the cooperative scheduler (P3) —
   * the glass shows a RUN annunciator; any key halts it */
  running?: boolean;
  /** algebraic-entry mode (FR-STK-4) — shows an ALG annunciator */
  alg?: boolean;
}

export type LcdMode = "line" | "mini";

/** localStorage key for the persisted LCD line/mini force (§12.6). */
const LCD_FORCE_KEY = "hellocalc-lcd-force";

export interface DisplayProps {
  state: RpnState;
  family: Family;
  /** which annunciator lamps this model's hardware actually has */
  annun: AnnunSet;
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
  /** faceplate Power switch (classics): when false the glass is dark/blank —
   * state is preserved (continuous memory), just not lit. Defaults on. */
  powered?: boolean;
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

/** Status row shared by both LCD states; `toggle` is the state's own chevron.
 * Each lamp is gated on the model's real annunciator set (`annun`) so a machine
 * lights only the lamps it actually has — no phantom `g` on a single-shift unit,
 * no BEG/END on a non-financial one. RPL shifts arm as `ls`/`rs`. */
function AnnunRow({
  s,
  annun,
  isRpl,
  showAngle,
  toggle,
}: {
  s: RpnState;
  annun: AnnunSet;
  isRpl: boolean;
  showAngle?: boolean;
  toggle: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-end gap-3">
      {annun.f && (
        <Annunciator label="f" hot={s.prefix === "f" || s.prefix === "fi" || s.prefix === "ls"} />
      )}
      {annun.g && <Annunciator label="g" hot={s.prefix === "g" || s.prefix === "rs"} />}
      {annun.h && <Annunciator label="h" hot={s.prefix === "h"} />}
      {annun.alpha && s.prefix === "alpha" && <Annunciator label="ALPHA" hot />}
      {s.intBase && <Annunciator label={s.intBase} hot />}
      {showAngle && s.ang && <Annunciator label={s.ang} hot />}
      {s.running && <Annunciator label="RUN" hot />}
      <Annunciator label={isRpl ? "RPL" : s.alg ? "ALG" : "RPN"} hot />
      {annun.begEnd && s.beg && <Annunciator label="BEGIN" hot />}
      {s.err && (
        <span role="status">
          <Annunciator label="Error" hot />
        </span>
      )}
      {toggle}
    </div>
  );
}

export function Display({
  state: s,
  family,
  annun,
  showAngle,
  showRegisters,
  showStack,
  defaultMode,
  lcdAspect,
  renderLatex,
  fmt,
  powered = true,
}: DisplayProps) {
  const isRpl = family === "rpl";
  // §5.3: null ⇒ no data-lcd-force attribute ⇒ the @container/lcd default
  // applies. The chevron sets an explicit mode (line's chevron forces mini and
  // vice versa) — user intent, PERSISTED to localStorage (§12.6). Read on mount
  // (browser-only, so the static prerender never mismatches).
  const [userForce, setUserForce] = useState<LcdMode | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem(LCD_FORCE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-data sync on mount
    if (saved === "line" || saved === "mini") setUserForce(saved);
  }, []);
  const setForce = (m: LcdMode) => {
    setUserForce(m);
    try {
      localStorage.setItem(LCD_FORCE_KEY, m);
    } catch {
      /* private-mode / quota — the preference just won't stick */
    }
  };
  const force = userForce ?? defaultMode ?? null;
  // dot-matrix FONT: the RPL machines, the menu-driven/modern RPN line
  // (42S/35s/Prime) AND the HP-41's 14-segment alphanumeric display (so ALPHA
  // reads as letters, not 7-segment). Segment digits belong to the LED/LCD eras.
  const num = isRpl || family === "pioneer" || family === "hp41" ? dotNum : segNum;
  // the big vertically-stretched HERO number is for the MULTI-LINE dot displays
  // (RPL/pioneer); the single-line HP-41 uses the normal size token in the dot
  // font so its ≤12-char alphanumeric line fits.
  const isDotHero = isRpl || family === "pioneer";
  const heroValue = isDotHero ? "lcd-dot-hero" : "text-hp-lcd-value";
  const heroX = isDotHero ? "lcd-dot-hero" : "text-hp-lcd-hero";

  const lineValue =
    s.eqEntry != null
      ? `${s.eqEntry || "EQ?"}_` // typing a SOLVER equation (echo the text)
      : s.prefix === "alpha" && !isRpl
      ? `${s.alpha ?? ""}_` // ALPHA entry echoes the register (P6)
      : s.entry != null
        ? s.entry
        : isRpl
          ? s.rpl && s.rpl.length
            ? s.rpl[s.rpl.length - 1]
            : "0"
          : s.imX
            ? `${fmt(s.X, s.dec)} +${s.imX}i`
            : fmt(s.X, s.dec);
  // Line-state stack echo (§11 #8): the register just under the top.
  const echo = isRpl
    ? s.rpl && s.rpl.length > 1
      ? { label: "2:", value: s.rpl[s.rpl.length - 2] }
      : null
    : { label: "Y", value: fmt(s.Y, s.dec) };

  // Per-model glass proportions (the 50g is 131×80 vs the 48-series 131×64):
  // override the aspect token locally so the family CSS picks it up.
  const panelStyle = lcdAspect
    ? ({ "--hp-lcd-aspect-rpl": lcdAspect } as React.CSSProperties)
    : undefined;

  // Power switch OFF (classics): the glass is dark — same panel/glass geometry
  // (so the machine doesn't reflow) but no lit content. State is preserved.
  if (!powered) {
    return (
      <div
        className="lcd-panel w-full"
        data-lcd-off
        data-lcd-force={force ?? undefined}
        data-lcd-family={family}
        style={panelStyle}
      >
        <div data-lcd-mode="line" className={cn(glass, "lcd-line")} aria-hidden />
        <div data-lcd-mode="mini" className={cn(glass, "lcd-mini")} aria-hidden />
      </div>
    );
  }

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
          annun={annun}
          isRpl={isRpl}
          showAngle={showAngle}
          toggle={
            <button
              type="button"
              onClick={() => setForce("mini")}
              aria-label="Expand display"
              className="ml-1 text-hp-display-dim transition-colors hover:text-hp-display-fg"
            >
              <ChevronsUpDown className="size-3.5" />
            </button>
          }
        />
        <div
          role="status"
          aria-label="Display"
          className="flex flex-1 items-center justify-end overflow-hidden"
          // Non-dot displays keep the fixed line-height floor. Dot-hero glasses
          // omit it so the status box fits the (sometimes cramped) glass — the
          // hero font is capped to the glass height (cqh) instead, so it never
          // overflows the box and clips.
          style={isDotHero ? undefined : { minBlockSize: "var(--calc-lcd-line-h)" }}
        >
          <span className={cn(num, heroValue)}>{lineValue}</span>
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
        {/* the softkey row shows in BOTH LCD states (P16 — the 42S is a
            two-line machine; its menu row is always visible). Gated to the
            menu-driven families (pioneer + RPL) so a menu left in the shared
            engine never bleeds onto a segment-display classic/voyager. */}
        {s.menu && (family === "pioneer" || isRpl) && <MenuRow menu={s.menu} />}
        {s.plot && <PlotPanel plot={s.plot} />}
      </div>

      {/* ── State B: mini 4:3 multi-line (§5.2) ─────────────────────────────── */}
      <div data-lcd-mode="mini" className={cn(glass, "lcd-mini")}>
        <AnnunRow
          s={s}
          annun={annun}
          isRpl={isRpl}
          showAngle={showAngle}
          toggle={
            <button
              type="button"
              onClick={() => setForce("line")}
              aria-label="Collapse display"
              className="ml-1 text-hp-display-dim transition-colors hover:text-hp-display-fg"
            >
              <ChevronsDownUp className="size-3.5" />
            </button>
          }
        />

        {/* KaTeX hero + LaTeX export (P14, FR-IO-3): the copy control lifts
            the SOURCE the hero renders. RPL machines show their result on the
            stack (level 1), so this hero row would just be a tall empty gap —
            skip it so the glass hugs the stack instead. */}
        {!isRpl && (
          <div
            className="flex items-center gap-2 text-hp-lcd-hero text-hp-display-fg"
            style={{ minBlockSize: "var(--calc-lcd-line-h)" }}
          >
            <div className="min-w-0 flex-1" dangerouslySetInnerHTML={renderLatex(s.latex)} />
            {s.latex && (
              <button
                type="button"
                aria-label="Copy LaTeX"
                title="Copy LaTeX source"
                onClick={() => void navigator.clipboard?.writeText(s.latex)}
                className="shrink-0 text-hp-display-dim transition-colors hover:text-hp-display-fg"
              >
                <Copy className="size-3" />
              </button>
            )}
          </div>
        )}

        {/* compact stack — for RPN it is `lcd-stack` (one home: paper when
            in-plane, glass otherwise, §14.3 rev 3); the RPL glass ALWAYS
            shows its stack — that is what a 48G display is */}
        {isRpl ? (
          <>
            {s.plot && <PlotPanel plot={s.plot} />}
            <RplStack rpl={s.rpl ?? []} entry={s.entry} msg={s.msg} menu={s.menu} />
          </>
        ) : (
          <div className="lcd-stack mt-2">
            <StackRow label="T" value={fmt(s.T, s.dec)} muted />
            <StackRow label="Z" value={fmt(s.Z, s.dec)} muted />
            <StackRow label="Y" value={fmt(s.Y, s.dec)} />
            <div className="my-[3px] h-px bg-hp-display-dim opacity-30" />
            <div role="status" aria-label="X register" className="flex items-baseline justify-between">
              <span className="font-mono text-hp-lcd-reg font-bold tracking-[0.1em] text-hp-display-fg opacity-70">
                X
              </span>
              <span className={cn(num, heroX)}>
                {s.entry != null ? s.entry : fmt(s.X, s.dec)}
              </span>
            </div>
            <StackRow label="LST x" value={fmt(s.lastX, s.dec)} muted />
            {s.menu && <MenuRow menu={s.menu} />}
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
  msg,
  menu,
}: {
  rpl: string[];
  entry: string | null;
  msg?: string;
  menu?: { name: string; labels: string[]; page: number; pages: number };
}) {
  // The real 28/48 glass always prints its level labels — an idle machine
  // shows "4: 3: 2: 1:" down the display, not a blank panel. Render at least
  // four levels (blank where the stack is shorter), newest at the bottom.
  const shown = Math.max(4, Math.min(6, rpl.length));
  const start = Math.max(0, rpl.length - shown);
  const lines = Array.from({ length: shown }, (_, i) => {
    const lvl = shown - i;
    const idx = rpl.length - lvl;
    return { lvl, val: idx >= start && idx >= 0 ? rpl[idx] : "" };
  });
  return (
    <div className="mt-1 flex flex-1 flex-col justify-end gap-px">
      {msg && (
        <div
          data-slot="lcd-msg"
          className={cn("truncate border-t border-black/10 py-[3px]", dotNum, "text-hp-lcd-stack")}
        >
          {msg}
        </div>
      )}
      {lines.map((l) => (
        <div
          key={l.lvl}
          role={l.lvl === 1 ? "status" : undefined}
          aria-label={l.lvl === 1 ? "Stack level 1" : undefined}
          className="flex items-baseline gap-2.5 border-t border-black/10 py-[3px]"
        >
          <span className="min-w-[20px] font-mono text-hp-lcd-stack text-hp-display-dim">
            {l.lvl}:
          </span>
          <span className={cn("flex-1 text-right", dotNum, "lcd-dot-line")}>{l.val}</span>
        </div>
      ))}
      <div className="mt-1.5 flex items-center gap-1.5 border-t-2 border-hp-display-border pt-1.5">
        <span className="font-mono text-hp-lcd-stack text-hp-display-dim">⊳</span>
        <span className={cn("flex-1 text-right", dotNum, "lcd-dot-line")}>{entry ?? ""}</span>
      </div>
      {menu && <MenuRow menu={menu} />}
    </div>
  );
}

/** The softkey label row (P12 RPL / P16 42S): bottom LCD line, 6 boxed labels
 * — the keys directly below (RPL) or the top key row (42S) acquire them. */
function MenuRow({
  menu,
}: {
  menu: { name: string; labels: string[]; page: number; pages: number };
}) {
  return (
    <div data-slot="menu-row" className="mt-1 grid grid-cols-6 gap-[3px]">
      {menu.labels.map((label, i) => (
        <span
          key={`${menu.name}-${i}`}
          className={cn(
            "truncate rounded-[3px] px-0.5 py-[2px] text-center font-mono text-hp-lcd-annun font-bold tracking-tight",
            label
              ? "bg-hp-display-fg/85 text-hp-display"
              : "bg-hp-display-dim/25 text-hp-display-dim",
          )}
        >
          {label || "—"}
        </span>
      ))}
    </div>
  );
}
