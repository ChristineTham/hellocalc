// src/components/calculator/PaperAux.tsx
// The paper aux components (docs/responsive-layout.md §14.3) — pieces that are
// explicitly NOT LCD-styled:
//   HistoryTape — a printing-calculator paper trail (straight top, perforated
//     bottom, mono figures, newest at the top like fresh print). On a
//     keystroke-PROGRAMMABLE model it doubles as the program editor: in PRGM
//     mode the same panel prints the program being edited instead of history
//     (the machine has one paper trail, not two), with the mode/step controls
//     in its caption row. Both views scroll inside the strip.
//   StackNote / VarsNote — clean notebook note cards (warm paper, ruled
//     hairlines, tracked captions).
// AuxColumn arranges them: notes first, tape last (printing downward). The
// tablet-wide template reflows the column into a row via CSS (.aux-flow).
"use client";

import { cn } from "@/lib/utils";
import type { RpnState } from "./Display";
import type { Family } from "./models";
import type { Value } from "@/lib/engine/config";

const CAPTION =
  "mb-2 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";
const NOTE =
  "rounded-md border border-paper-line bg-paper p-3.5 shadow-[0_8px_18px_-12px_var(--color-shadow-warm)]";
const CHIP =
  "rounded-md border border-paper-line px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-terracotta/10";
// the strip that scrolls: perforated tape look, bounded height, inner overflow
const STRIP =
  "paper-tape flex min-h-0 flex-1 flex-col rounded-t-sm border border-b-0 border-paper-line";
const STRIP_SCROLL = "min-h-0 flex-1 overflow-y-auto px-3 py-2";

export function HistoryTape({
  hist,
  prgm,
  onKey,
  onRecall,
  className,
}: {
  hist: RpnState["hist"];
  /** keystroke-program view (P3): when the model is programmable and in PRGM
   * mode this panel shows the program being EDITED instead of the history. */
  prgm?: RpnState["prgm"];
  /** program controls (W/PRGM, R/S, SST, CLR) dispatch engine ids through the
   * same press() path as the keys — programmable models only. */
  onKey?: (fn: string) => void;
  /** History recall (FR-EXP-5): click a printed line to push its EXACT value
   * back onto the stack (rows carry the raw BigNumber string). */
  onRecall?: (raw: string) => void;
  className?: string;
}) {
  const programmable = Boolean(prgm && onKey);
  const recording = programmable && prgm!.mode === "PRGM";
  const rows = (hist ?? []).slice().reverse(); // newest at the top — fresh print

  return (
    <section data-slot="history-tape" className={cn("min-h-0", className)}>
      {/* caption row — a programmable model carries its mode + step controls
          here so PRGM can be entered/left without leaving the panel */}
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className={cn(CAPTION, "mb-0")}>{recording ? "Program" : "History"}</h2>
        {programmable && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onKey!("W/PRGM")}
              aria-label={recording ? "Switch to RUN mode" : "Switch to W/PRGM mode"}
              className={cn(
                CHIP,
                recording ? "bg-terracotta/15 text-terracotta" : "text-muted-foreground",
              )}
            >
              {recording ? "PRGM" : "RUN"}
            </button>
            <button
              type="button"
              onClick={() => onKey!("R/S")}
              aria-label="Run program"
              className={cn(CHIP, "text-muted-foreground")}
            >
              R/S
            </button>
            <button
              type="button"
              onClick={() => onKey!("SST")}
              aria-label="Single step"
              className={cn(CHIP, "text-muted-foreground")}
            >
              SST
            </button>
            <button
              type="button"
              onClick={() => onKey!("CLEAR PRGM")}
              aria-label="Clear program"
              className={cn(CHIP, "text-muted-foreground")}
            >
              CLR
            </button>
          </div>
        )}
      </div>

      {/* outer strip owns the perforated ::after; the INNER div scrolls, so
          the zigzag edge is never clipped by the scroll container */}
      <div className={STRIP}>
        <div data-slot={recording ? "prgm-note" : undefined} className={STRIP_SCROLL}>
          {recording ? (
            prgm!.steps.length === 0 ? (
              <p className="py-3 text-center font-mono text-[11px] text-muted-foreground">
                — recording: press keys —
              </p>
            ) : (
              prgm!.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-baseline gap-2 border-b border-paper-line py-0.5 last:border-0"
                >
                  <span className="min-w-[26px] font-mono text-[10.5px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-3 font-mono text-[10.5px] text-terracotta">
                    {i === prgm!.pc ? "▶" : ""}
                  </span>
                  <span className="font-legend text-[12px] font-semibold text-foreground">
                    {step}
                  </span>
                </div>
              ))
            )
          ) : rows.length === 0 ? (
            <p className="py-3 text-center font-mono text-[11px] text-muted-foreground">
              — no entries yet —
            </p>
          ) : (
            rows.map((e, i) => {
              const raw = e.raw;
              const line = (
                <>
                  <span className="font-legend text-[12px] font-semibold text-muted-foreground">
                    {e.op}
                  </span>
                  <span className="font-mono text-[13px] tabular-nums text-foreground">
                    {e.v}
                  </span>
                </>
              );
              return onRecall && raw !== undefined ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => onRecall(raw)}
                  aria-label={`Recall ${e.v}`}
                  className="flex w-full cursor-pointer items-baseline justify-between gap-3 border-b border-paper-line py-1.5 text-left transition-colors last:border-0 hover:bg-terracotta/10"
                >
                  {line}
                </button>
              ) : (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-3 border-b border-paper-line py-1.5 last:border-0"
                >
                  {line}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* room for the perforation */}
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
  fmt: (n: Value, dec?: number) => string;
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
            val: st[i], // pre-formatted object rows (P12)
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
    <section data-slot="stack-note" className={className}>
      <h2 className={CAPTION}>{isRpl ? "RPL Stack" : "RPN Stack"}</h2>
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

/**
 * The variables note (§14 rev 5): TVM registers for financial models; the
 * storage-register file (M, R0–R9, Σn) for the other RPN machines (P2); the
 * named-variable directory for RPL machines (placeholder rows until the
 * engine's VAR directory lands — it reserves the bay estate deliberately).
 */
export function VarsNote({
  state: s,
  family,
  tvm,
  className,
}: {
  state: RpnState;
  family: Family;
  /** financial models (HP-12C): show the TVM strip instead of the registers */
  tvm?: boolean;
  className?: string;
}) {
  if (family === "rpl") {
    return (
      <section data-slot="vars-note" className={className}>
        <h2 className={CAPTION}>Variables</h2>
        <div className={NOTE}>
          <p className="py-1 text-center font-mono text-[11px] text-muted-foreground">
            — none yet —
          </p>
        </div>
      </section>
    );
  }
  // the equation SOLVER (17B family / 27S / 35s): the current equation and its
  // variables — the "variable menu" the softkeys select. Takes priority over
  // the TVM/registers view while an equation is active.
  if (s.solver) {
    return (
      <section data-slot="vars-note" className={className}>
        <h2 className={CAPTION}>Solver</h2>
        <div data-slot="solver-note" className={NOTE}>
          <p className="border-b border-paper-line py-1 font-mono text-[11px] break-all text-foreground">
            {s.solver.eq}
          </p>
          {s.solver.vars.length === 0 ? (
            <p className="py-1 text-center font-mono text-[11px] text-muted-foreground">
              — no variables —
            </p>
          ) : (
            s.solver.vars.map((v) => (
              <div
                key={v.name}
                className="flex justify-between border-b border-paper-line py-1 last:border-0"
              >
                <span className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
                  {v.name}
                </span>
                <span className="font-mono text-[13.5px] tabular-nums text-foreground">
                  {v.value}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }
  if (!tvm) {
    const rows = s.registers ?? [];
    return (
      <section data-slot="vars-note" className={className}>
        <h2 className={CAPTION}>Registers</h2>
        <div data-slot="regs-note" className={NOTE}>
          {rows.length === 0 ? (
            <p className="py-1 text-center font-mono text-[11px] text-muted-foreground">
              — empty —
            </p>
          ) : (
            rows.map((r) => (
              <div
                key={r.name}
                className="flex justify-between border-b border-paper-line py-1 last:border-0"
              >
                <span className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground">
                  {r.name}
                </span>
                <span className="font-mono text-[13.5px] tabular-nums text-foreground">
                  {r.value}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }
  return (
    <section data-slot="vars-note" className={className}>
      <h2 className={CAPTION}>TVM Registers</h2>
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
  fmt: (n: Value, dec?: number) => string;
  /** financial models (HP-12C): include the TVM note */
  showRegisters?: boolean;
  /** keystroke-programmable models (P3): include the program note */
  showProgram?: boolean;
  /** program-note controls dispatch engine ids through press() */
  onKey?: (fn: string) => void;
  /** history recall — tape lines push their exact value back (FR-EXP-5) */
  onRecall?: (raw: string) => void;
  /** "bay": the side-machine's compact below-LCD arrangement (§14.3) */
  variant?: "flow" | "bay";
  className?: string;
}

export function AuxColumn({
  state,
  family,
  fmt,
  showRegisters,
  showProgram,
  onKey,
  onRecall,
  variant = "flow",
  className,
}: AuxColumnProps) {
  // One home for the stack (§14.3 rev 3): the RPL glass IS a stack display,
  // so RPL models get no paper StackNote — vars + tape only.
  const paperStack = family !== "rpl";
  const showVars =
    showRegisters || family === "rpl" || (state.registers?.length ?? 0) > 0;
  // the tape doubles as the program editor on programmable models (P3): pass
  // its state + the press() dispatch so PRGM mode swaps history → program.
  const prgm = showProgram && onKey ? state.prgm : undefined;
  if (variant === "bay") {
    // paper resting on the machine body. Both pieces render; CSS picks per
    // context (§14 rev 5): desktop-tall shows VARS (tape lives on the page),
    // short viewports show the TAPE (vars would crowd the cramped bay).
    return (
      <div className={cn("aux-flow w-full", className)}>
        {paperStack && <StackNote state={state} family={family} fmt={fmt} />}
        {showVars && (
          <VarsNote state={state} family={family} tvm={showRegisters} className="bay-vars" />
        )}
        <HistoryTape
          hist={state.hist}
          prgm={prgm}
          onKey={onKey}
          onRecall={onRecall}
          className="bay-tape min-h-0 flex-1"
        />
      </div>
    );
  }
  return (
    <div className={cn("aux-flow size-full", className)}>
      {paperStack && <StackNote state={state} family={family} fmt={fmt} />}
      {showVars && <VarsNote state={state} family={family} tvm={showRegisters} />}
      <HistoryTape
        hist={state.hist}
        prgm={prgm}
        onKey={onKey}
        onRecall={onRecall}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
