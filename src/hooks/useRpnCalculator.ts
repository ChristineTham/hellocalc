// src/hooks/useRpnCalculator.ts
// React seam over the pure RPN engine (src/lib/engine/rpn.ts, BigNumber
// tower). Holds the engine (which now carries its own history + display
// format) and exposes what the faceplate needs: a display state, a key
// dispatcher, history recall, snapshot/restore for persistence, and the
// format.ts-backed formatter.
"use client";

import { useCallback, useMemo, useState } from "react";
import katex from "katex";
import { createRpn, dispatch, pushX, xval, type RpnEngine } from "@/lib/engine/rpn";
import { formatValue } from "@/lib/engine/format";
import { bn, type Value } from "@/lib/engine/config";
import type { RpnState } from "@/components/calculator/Display";

// f/g are the Voyager planes; h (HP-67 black) and fi (HP-65 f⁻¹ gold inverse)
// arrive with the classic programmables; alpha with the HP-41 (letters are
// promoted visually but inert until alpha entry lands). The engine never sees
// a prefix — keyboards resolve (key, prefix) → one function id before press().
export type Prefix = "none" | "f" | "g" | "h" | "fi" | "alpha";

export interface RpnCalculator {
  state: RpnState;
  prefix: Prefix;
  /** Dispatch a resolved function id (already prefix-resolved) to the engine. */
  press: (fn: string) => void;
  /** Toggle the armed f/g prefix. */
  arm: (p: Prefix) => void;
  /** Recall an exact history value into X (lifts the stack). */
  recall: (raw: string) => void;
  fmt: (v: Value, dec?: number) => string;
  renderLatex: (tex: string) => { __html: string };
  /** Persistence seam (FR-STATE-1/4). */
  engine: RpnEngine;
  restore: (engine: RpnEngine) => void;
}

/** Clone before mutating so the setState updater stays pure under StrictMode
 * (values are immutable BigNumbers; hist is replaced, never pushed in place). */
const clone = (e: RpnEngine): RpnEngine => ({ ...e, disp: { ...e.disp } });

export function useRpnCalculator(): RpnCalculator {
  const [engine, setEngine] = useState<RpnEngine>(() => createRpn());
  const [prefix, setPrefix] = useState<Prefix>("none");

  const fmt = useCallback(
    (v: Value, d?: number) =>
      formatValue(v, { mode: engine.disp.mode, digits: d ?? engine.disp.digits }),
    [engine.disp],
  );

  const press = useCallback((fn: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      dispatch(next, fn);
      return next;
    });
    setPrefix("none");
  }, []);

  const recall = useCallback((raw: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      pushX(next, bn(raw));
      return next;
    });
  }, []);

  const arm = useCallback((p: Prefix) => {
    setPrefix((cur) => (cur === p ? "none" : p));
  }, []);

  const restore = useCallback((next: RpnEngine) => {
    setEngine(next);
    setPrefix("none");
  }, []);

  const state = useMemo<RpnState>(
    () => ({
      T: engine.t,
      Z: engine.z,
      Y: engine.y,
      X: xval(engine),
      lastX: engine.lastX,
      entry: engine.entry,
      dec: engine.disp.digits,
      ang: engine.angle,
      prefix,
      latex: fmt(xval(engine)),
      err: engine.error ?? undefined,
      hist: engine.hist.map((h) => ({ op: h.op, v: fmt(bn(h.raw)), raw: h.raw })),
    }),
    [engine, prefix, fmt],
  );

  // Math output is always typeset (AGENTS §3): KaTeX renders synchronously at
  // first render — no post-mount flash. katex.min.css is imported in layout.tsx.
  const renderLatex = useCallback(
    (tex: string) => ({ __html: katex.renderToString(tex, { throwOnError: false }) }),
    [],
  );

  return { state, prefix, press, arm, recall, fmt, renderLatex, engine, restore };
}
