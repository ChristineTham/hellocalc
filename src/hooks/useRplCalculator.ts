// src/hooks/useRplCalculator.ts
// React seam over the RPL object-stack engine (src/lib/engine/rpl.ts, P12).
// Produces the same RpnState shape the Display consumes, with the dynamic
// `rpl` array carrying PRE-FORMATTED object rows and `menu` carrying the
// active softkey labels (the Display branches on family === "rpl").
"use client";

import { useCallback, useMemo, useState } from "react";
import katex from "katex";
import {
  createRpl,
  dispatchRpl,
  menuLabels,
  pressSoft,
  push,
  type RplEngine,
} from "@/lib/engine/rpl";
import { formatObj } from "@/lib/engine/rpl/object";
import { formatValue } from "@/lib/engine/format";
import { bn, type Value } from "@/lib/engine/config";
import type { RpnState } from "@/components/calculator/Display";

export type RplPrefix = "none" | "ls" | "rs" | "alpha";

export interface RplCalculator {
  state: RpnState;
  prefix: RplPrefix;
  press: (fn: string) => void;
  /** softkey 1..6 under the glass — resolves the active menu label (P12) */
  soft: (i: number) => void;
  arm: (p: RplPrefix) => void;
  /** Recall an exact history value onto the stack. */
  recall: (raw: string) => void;
  fmt: (v: Value, dec?: number) => string;
  renderLatex: (tex: string) => { __html: string };
  /** Persistence seam (FR-STATE-1/4). */
  engine: RplEngine;
  restore: (engine: RplEngine) => void;
}

const clone = (e: RplEngine): RplEngine => ({
  ...e,
  stack: [...e.stack],
  vars: { ...e.vars },
  flags: [...e.flags],
  last: [...e.last],
  lastCmd: [...e.lastCmd],
  undoSnap: e.undoSnap ? [...e.undoSnap] : null,
  menu: e.menu ? { ...e.menu } : null,
  modes: { ...e.modes },
  sdat: e.sdat.map((r) => [...r]),
  cols: [...e.cols],
  ppar: { ...e.ppar, pmin: [...e.ppar.pmin], pmax: [...e.ppar.pmax], axes: [...e.ppar.axes] },
  disp: { ...e.disp },
});

export function useRplCalculator(): RplCalculator {
  const [engine, setEngine] = useState<RplEngine>(() => createRpl());
  const [prefix, setPrefix] = useState<RplPrefix>("none");

  const fmt = useCallback(
    (v: Value, d?: number) =>
      formatValue(v, { mode: engine.disp.mode, digits: d ?? engine.disp.digits }),
    [engine.disp],
  );

  const press = useCallback((fn: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      dispatchRpl(next, fn);
      return next;
    });
    setPrefix("none");
  }, []);

  const soft = useCallback((i: number) => {
    setEngine((prev) => {
      const next = clone(prev);
      pressSoft(next, i);
      return next;
    });
    setPrefix("none");
  }, []);

  const recall = useCallback((raw: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      push(next, bn(raw));
      return next;
    });
  }, []);

  const arm = useCallback((p: RplPrefix) => {
    setPrefix((cur) => (cur === p ? "none" : p));
  }, []);

  const restore = useCallback((next: RplEngine) => {
    setEngine(next);
    setPrefix("none");
  }, []);

  const zero = useMemo(() => bn(0), []);
  const state = useMemo<RpnState>(
    () => ({
      T: zero,
      Z: zero,
      Y: zero,
      X: zero,
      lastX: zero,
      entry: engine.entry,
      dec: engine.disp.digits,
      ang: engine.angle,
      prefix,
      latex: "",
      err: engine.error ?? undefined,
      msg: engine.msg ?? undefined,
      rpl: engine.stack.map((o) => formatObj(o, engine.disp, engine.base)),
      menu: engine.menu
        ? {
            name: engine.menu.name,
            labels: menuLabels(engine),
            page: engine.menu.page,
            pages: 1, // paging wraps in the engine; the row only needs labels
          }
        : undefined,
      hist: engine.hist.map((h) => ({ op: h.op, v: "", raw: h.raw })),
    }),
    [engine, prefix, zero],
  );

  // Math output is always typeset (AGENTS §3) — same KaTeX seam as the RPN hook.
  const renderLatex = useCallback(
    (tex: string) => ({ __html: katex.renderToString(tex, { throwOnError: false }) }),
    [],
  );

  return { state, prefix, press, soft, arm, recall, fmt, renderLatex, engine, restore };
}
