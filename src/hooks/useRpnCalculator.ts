// src/hooks/useRpnCalculator.ts
// React seam over the pure RPN engine (src/lib/engine/rpn.ts). Holds the engine
// + view state (armed prefix, history, FIX digits) and exposes what the
// faceplate needs: a display state, a key dispatcher, and formatters.
"use client";

import { useCallback, useMemo, useState } from "react";
import katex from "katex";
import {
  applyFunction,
  createRpn,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";
import type { RpnState } from "@/components/calculator/Display";

export type Prefix = "none" | "f" | "g";

const DIGIT = /^[0-9]$/;
const isValueKey = (fn: string) => DIGIT.test(fn) || fn === "•" || fn === ".";

export interface RpnCalculator {
  state: RpnState;
  prefix: Prefix;
  /** Dispatch a resolved function id (already prefix-resolved) to the engine. */
  press: (fn: string) => void;
  /** Toggle the armed f/g prefix. */
  arm: (p: Prefix) => void;
  fmt: (n: number, dec?: number) => string;
  renderLatex: (tex: string) => { __html: string };
}

interface CalcState {
  engine: RpnEngine;
  hist: { op: string; v: string }[];
}

export function useRpnCalculator(dec = 2): RpnCalculator {
  // engine + history live in ONE state so the press updater stays pure — a
  // setState inside another updater double-fires under StrictMode (the tape
  // printed every operation twice).
  const [calc, setCalc] = useState<CalcState>(() => ({ engine: createRpn(), hist: [] }));
  const { engine, hist } = calc;
  const [prefix, setPrefix] = useState<Prefix>("none");

  const fmt = useCallback(
    (n: number, d = dec) => (Number.isFinite(n) ? n.toFixed(d) : "Error"),
    [dec],
  );

  const press = useCallback(
    (fn: string) => {
      setCalc((prev) => {
        const engine = { ...prev.engine };
        const handled = applyFunction(engine, fn);
        const hist =
          handled && !isValueKey(fn)
            ? [...prev.hist.slice(-49), { op: fn, v: fmt(xval(engine)) }]
            : prev.hist;
        return { engine, hist };
      });
      setPrefix("none");
    },
    [fmt],
  );

  const arm = useCallback((p: Prefix) => {
    setPrefix((cur) => (cur === p ? "none" : p));
  }, []);

  const state = useMemo<RpnState>(
    () => ({
      T: engine.t,
      Z: engine.z,
      Y: engine.y,
      X: xval(engine),
      lastX: engine.lastX,
      entry: engine.entry,
      dec,
      ang: engine.angle,
      prefix,
      latex: fmt(xval(engine)),
      err: engine.error ?? undefined,
      hist,
    }),
    [engine, prefix, dec, fmt, hist],
  );

  // Math output is always typeset (AGENTS §3): KaTeX renders synchronously at
  // first render — no post-mount flash. katex.min.css is imported in layout.tsx.
  const renderLatex = useCallback(
    (tex: string) => ({ __html: katex.renderToString(tex, { throwOnError: false }) }),
    [],
  );

  return { state, prefix, press, arm, fmt, renderLatex };
}
