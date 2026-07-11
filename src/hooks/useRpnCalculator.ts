// src/hooks/useRpnCalculator.ts
// React seam over the pure RPN engine (src/lib/engine/rpn.ts, BigNumber
// tower). Holds the engine (which now carries its own history + display
// format) and exposes what the faceplate needs: a display state, a key
// dispatcher, history recall, snapshot/restore for persistence, and the
// format.ts-backed formatter.
"use client";

import { useCallback, useMemo, useState } from "react";
import katex from "katex";
import {
  createRpn,
  dispatch,
  menu42Labels,
  pressSoft42,
  pushX,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";
import { formatValue } from "@/lib/engine/format";
import { intFormat } from "@/lib/engine/integer";
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
  /** 42S softkey (P16): top-row key i resolves the active menu label. */
  soft: (i: number) => void;
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
const clone = (e: RpnEngine): RpnEngine => ({
  ...e,
  disp: { ...e.disp },
  regs: [...e.regs],
  regsS: [...e.regsS],
  userAsn: { ...e.userAsn },
  fin: { ...e.fin, cfs: e.fin.cfs.map((c) => ({ ...c })) },
  imag: { ...e.imag },
  mats: { ...e.mats },
  int: { ...e.int },
  sum: { ...e.sum },
  prgm: { ...e.prgm, steps: [...e.prgm.steps], flags: [...e.prgm.flags], ret: [...e.prgm.ret] },
  pending: e.pending ? { ...e.pending } : null,
  menu: e.menu ? { ...e.menu } : null,
  menuStack: [...e.menuStack],
  custom42: [...e.custom42],
  pts: e.pts.map((pt) => [...pt] as [number, number]),
});

export function useRpnCalculator(): RpnCalculator {
  const [engine, setEngine] = useState<RpnEngine>(() => createRpn());
  const [prefix, setPrefix] = useState<Prefix>("none");

  const fmt = useCallback(
    (v: Value, d?: number) =>
      engine.int.on
        ? intFormat(v, engine.int) // the 16C's base display (P10)
        : formatValue(v, { mode: engine.disp.mode, digits: d ?? engine.disp.digits }),
    [engine.disp, engine.int],
  );

  const press = useCallback((fn: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      dispatch(next, fn);
      return next;
    });
    // ALPHA is a latched MODE on the 41/Prime (unlike one-shot f/g): it stays
    // armed while α characters are typed and drops on any other dispatch
    setPrefix((p) => (p === "alpha" && fn.startsWith("α") ? p : "none"));
  }, []);

  const soft = useCallback((i: number) => {
    setEngine((prev) => {
      const next = clone(prev);
      pressSoft42(next, i);
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

  const state = useMemo<RpnState>(() => {
    // registers note (§14 rev 5): M + the nonzero R0–R9 + Σn, formatted
    const registers: { name: string; value: string }[] = [];
    if (!engine.mem.isZero()) registers.push({ name: "M", value: fmt(engine.mem) });
    engine.regs.forEach((r, i) => {
      if (!r.isZero()) registers.push({ name: `R${i}`, value: fmt(r) });
    });
    if (!engine.iReg.isZero()) registers.push({ name: "I", value: fmt(engine.iReg) });
    for (const [name, m] of Object.entries(engine.mats)) {
      registers.push({ name: `MAT ${name}`, value: `${m.length}×${m[0]?.length ?? 0}` });
    }
    if (!engine.sum.n.isZero()) registers.push({ name: "Σn", value: fmt(engine.sum.n, 0) });
    return {
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
      alpha: engine.alpha,
      intBase: engine.int.on
        ? { 16: "HEX", 10: "DEC", 8: "OCT", 2: "BIN" }[engine.int.base]
        : undefined,
      imX: engine.cpx && !engine.imag.x.isZero() ? fmt(engine.imag.x) : undefined,
      beg: engine.fin.beg,
      reg: {
        n: fmt(engine.fin.n),
        i: fmt(engine.fin.i),
        PV: fmt(engine.fin.pv),
        PMT: fmt(engine.fin.pmt),
        FV: fmt(engine.fin.fv),
      },
      registers,
      prgm: {
        mode: engine.prgm.mode,
        pc: engine.prgm.pc,
        steps: [...engine.prgm.steps],
      },
      // the 42S menu row (P16): labels ride the top key row + the glass
      menu: engine.menu
        ? {
            name: engine.menu.name,
            // "@" marks a nested menu internally; the glass shows the bare name
            labels: menu42Labels(engine).map((l) => l.replace(/^@/, "")),
            page: engine.menu.page,
            pages: 1,
          }
        : undefined,
      hist: engine.hist.map((h) => ({ op: h.op, v: fmt(bn(h.raw)), raw: h.raw })),
    };
  }, [engine, prefix, fmt]);

  // Math output is always typeset (AGENTS §3): KaTeX renders synchronously at
  // first render — no post-mount flash. katex.min.css is imported in layout.tsx.
  const renderLatex = useCallback(
    (tex: string) => ({ __html: katex.renderToString(tex, { throwOnError: false }) }),
    [],
  );

  return { state, prefix, press, soft, arm, recall, fmt, renderLatex, engine, restore };
}
