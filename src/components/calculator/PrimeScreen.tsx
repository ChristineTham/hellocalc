// src/components/calculator/PrimeScreen.tsx
// The HP Prime's 320×240 COLOUR touchscreen — rendered at BROWSER resolution
// with real fonts and KaTeX-typeset math, NOT a pixel/dot-matrix emulation.
// Mirrors the four Home-view sections from the user guide (ch. 2, "The
// display"): a dark TITLE BAR (app name + annunciators + time + battery), the
// HISTORY of past calculations (input above, textbook result right-aligned
// below), the ENTRY LINE, and the context MENU buttons. Device-screen colours
// are fixed in both themes — like a real LCD, the glass doesn't follow the app
// theme.
"use client";

import { cn } from "@/lib/utils";
import type { RpnState } from "./Display";
import type { Value } from "@/lib/engine/config";

export interface PrimeScreenProps {
  state: RpnState;
  fmt: (n: Value, dec?: number) => string;
  /** inject the KaTeX renderer so results typeset as native browser math */
  renderLatex: (tex: string) => { __html: string };
}

// The Home-view menu (context-sensitive softkeys along the bottom of the glass).
const HOME_MENU = ["Sto▸", "", "", "", "", "Menu"];

function Annun({ label, color }: { label: string; color: string }) {
  return (
    <span className="font-semibold tracking-wide" style={{ color }}>
      {label}
    </span>
  );
}

export function PrimeScreen({ state: s, fmt, renderLatex }: PrimeScreenProps) {
  const shift = s.prefix === "g";
  const alpha = s.prefix === "alpha";
  // most-recent calculations, oldest first (newest sits above the entry line)
  const rows = (s.hist ?? []).slice(-8);
  const entry = s.prefix === "alpha" ? `${s.alpha ?? ""}` : s.entry;

  return (
    <div
      data-slot="prime-screen"
      className="flex size-full min-h-0 flex-col overflow-hidden rounded-[3px] text-[13px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.25)]"
      style={{ background: "#f4f5f7", color: "#12151b", fontFamily: "var(--font-archivo), system-ui, sans-serif" }}
    >
      {/* ── TITLE BAR ─────────────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center justify-between px-2 py-1 text-[11px] text-white"
        style={{ background: "linear-gradient(#4a5468, #3b4353)" }}
      >
        <span className="font-semibold tracking-wide">Home</span>
        <div className="flex items-center gap-2">
          {shift && <Annun label="SS" color="#2fd0e6" />}
          {alpha && <Annun label="A…Z" color="#ff9d2e" />}
          <Annun
            label={s.ang === "RAD" ? "RAD" : s.ang === "GRD" ? "GRD" : "DEG"}
            color="#9ccc4f"
          />
          <span className="tabular-nums opacity-90">12:00</span>
          {/* battery */}
          <span className="relative inline-block h-2.5 w-4 rounded-[1px] border border-white/70">
            <span className="absolute inset-[1px] right-1 rounded-[0.5px] bg-[#9ccc4f]" />
            <span className="absolute top-1/2 -right-[3px] h-1 w-[2px] -translate-y-1/2 rounded-r bg-white/70" />
          </span>
        </div>
      </div>

      {/* ── HISTORY ───────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-2 py-1.5">
        {rows.length === 0 ? (
          <div className="text-center text-[12px] text-black/35">— Home —</div>
        ) : (
          rows.map((e, i) => {
            const last = i === rows.length - 1;
            return (
              <div key={`${i}-${e.op}-${e.v}`} className="flex flex-col items-end leading-tight">
                {/* input expression (muted, smaller) */}
                <span className="text-[11px] text-black/45">{e.op}</span>
                {/* result — the newest is typeset via KaTeX (textbook display) */}
                {last && s.latex ? (
                  <span
                    className="text-[17px] text-[#12151b]"
                    dangerouslySetInnerHTML={renderLatex(s.latex)}
                  />
                ) : (
                  <span className="text-[15px] tabular-nums text-[#12151b]">{e.v}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── ENTRY LINE ────────────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center justify-end gap-0.5 border-t px-2 py-1 text-[15px] tabular-nums"
        style={{ background: "#e7eaef", borderColor: "rgb(0 0 0 / 0.12)" }}
      >
        <span>{entry != null && entry !== "" ? entry : fmt(s.X, s.dec)}</span>
        <span className="ml-[1px] inline-block h-4 w-[2px] animate-pulse bg-[#12151b]" />
      </div>

      {/* ── MENU BUTTONS ──────────────────────────────────────────────────── */}
      <div
        className="grid shrink-0 grid-cols-6 gap-px border-t"
        style={{ background: "#3b4353", borderColor: "rgb(0 0 0 / 0.3)" }}
      >
        {HOME_MENU.map((label, i) => (
          <span
            key={i}
            className={cn(
              "truncate px-0.5 py-1 text-center text-[10px] font-semibold text-white/90",
              i < HOME_MENU.length - 1 && "border-r border-white/10",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
