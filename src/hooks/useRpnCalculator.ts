// src/hooks/useRpnCalculator.ts
// React seam over the pure RPN engine (src/lib/engine/rpn.ts). Holds the engine
// + view state (armed prefix, history, FIX digits) and exposes what the
// faceplate needs: a display state, a key dispatcher, and formatters.
"use client";

import { useCallback, useMemo, useState } from "react";
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

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function useRpnCalculator(dec = 2): RpnCalculator {
  const [engine, setEngine] = useState<RpnEngine>(() => createRpn());
  const [prefix, setPrefix] = useState<Prefix>("none");
  const [hist, setHist] = useState<{ op: string; v: string }[]>([]);

  const fmt = useCallback(
    (n: number, d = dec) => (Number.isFinite(n) ? n.toFixed(d) : "Error"),
    [dec],
  );

  const press = useCallback(
    (fn: string) => {
      setEngine((prev) => {
        const next = { ...prev };
        const handled = applyFunction(next, fn);
        if (handled && !isValueKey(fn)) {
          setHist((h) => [...h.slice(-49), { op: fn, v: fmt(xval(next)) }]);
        }
        return next;
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

  const renderLatex = useCallback(
    (tex: string) => ({ __html: escapeHtml(tex) }),
    [],
  );

  return { state, prefix, press, arm, fmt, renderLatex };
}
