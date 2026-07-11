// src/hooks/useRplCalculator.ts
// React seam over the RPL dynamic-stack engine (src/lib/engine/rpl.ts). Produces
// the same RpnState shape the Display consumes, with the dynamic `rpl` array set
// (the Display branches on family === "rpl").
"use client";

import { useCallback, useMemo, useState } from "react";
import katex from "katex";
import { applyRplFunction, createRpl, type RplEngine } from "@/lib/engine/rpl";
import type { RpnState } from "@/components/calculator/Display";

export type RplPrefix = "none" | "ls" | "rs" | "alpha";

export interface RplCalculator {
  state: RpnState;
  prefix: RplPrefix;
  press: (fn: string) => void;
  arm: (p: RplPrefix) => void;
  fmt: (n: number, dec?: number) => string;
  renderLatex: (tex: string) => { __html: string };
}

export function useRplCalculator(dec = 2): RplCalculator {
  const [engine, setEngine] = useState<RplEngine>(() => createRpl());
  const [prefix, setPrefix] = useState<RplPrefix>("none");

  const fmt = useCallback(
    (n: number, d = dec) => (Number.isFinite(n) ? n.toFixed(d) : "Error"),
    [dec],
  );

  const press = useCallback((fn: string) => {
    setEngine((prev) => {
      const next: RplEngine = { ...prev, stack: [...prev.stack] };
      applyRplFunction(next, fn);
      return next;
    });
    setPrefix("none");
  }, []);

  const arm = useCallback((p: RplPrefix) => {
    setPrefix((cur) => (cur === p ? "none" : p));
  }, []);

  const state = useMemo<RpnState>(
    () => ({
      T: 0,
      Z: 0,
      Y: 0,
      X: 0,
      lastX: 0,
      entry: engine.entry,
      dec,
      ang: engine.angle,
      prefix,
      latex: "",
      err: engine.error ?? undefined,
      rpl: engine.stack,
    }),
    [engine, prefix, dec],
  );

  // Math output is always typeset (AGENTS §3) — same KaTeX seam as the RPN hook.
  const renderLatex = useCallback(
    (tex: string) => ({ __html: katex.renderToString(tex, { throwOnError: false }) }),
    [],
  );

  return { state, prefix, press, arm, fmt, renderLatex };
}
