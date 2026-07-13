// src/hooks/useRplCalculator.ts
// React seam over the RPL object-stack engine (src/lib/engine/rpl.ts, P12).
// Produces the same RpnState shape the Display consumes, with the dynamic
// `rpl` array carrying PRE-FORMATTED object rows and `menu` carrying the
// active softkey labels (the Display branches on family === "rpl").
"use client";

import { useCallback, useMemo, useState } from "react";
import katex from "katex";
import {
  cloneDir,
  createRpl,
  dispatchRpl,
  menuLabels,
  pressSoft,
  push,
  type RplEngine,
} from "@/lib/engine/rpl";
import { formatObj } from "@/lib/engine/rpl/object";
import { formatValue } from "@/lib/engine/format";
import { casReady, getCas } from "@/lib/engine/cas/provider";
import { loadNerdamerProvider } from "@/lib/engine/cas/nerdamer-provider";
import { setCas } from "@/lib/engine/cas/provider";
import { objToTex } from "@/lib/render/tex";
import { bn, type Value } from "@/lib/engine/config";
import type { RpnState } from "@/components/calculator/Display";

export type RplPrefix = "none" | "ls" | "rs" | "alpha";

/** Keys/softkeys that need the lazy CAS tier (P14). */
const CAS_FNS = new Set([
  "d/dx", "∂", "∫", "COLCT", "EXPAN", "FACTOR", "ISOL", "QUAD", "TAYLR",
  "DERVX", "INTVX", "SIMPLIFY", "SOLVEVX", "ZEROS", "SUBST", // 49G, light tier
]);

/** 49G operations that need the HEAVY (Pyodide+SymPy) tier — multi-MB WASM
 * from the CDN, loaded on first use with an explicit state (P19, NFR-3/4). */
const HEAVY_FNS = new Set([
  "lim", "LIMIT", "SERIES", "PARTFRAC", "TEXPAND", "RISCH", "DESOLVE", "LAP", "ILAP",
]);

export interface RplCalculator {
  state: RpnState;
  prefix: RplPrefix;
  press: (fn: string) => void;
  /** softkey 1..6 under the glass — resolves the active menu label (P12) */
  soft: (i: number) => void;
  arm: (p: RplPrefix) => void;
  /** Recall an exact history value onto the stack. */
  recall: (raw: string) => void;
  /** Native mode (P23): put source text on the command line and ENTER it. */
  runLine: (text: string) => void;
  fmt: (v: Value, dec?: number) => string;
  renderLatex: (tex: string) => { __html: string };
  /** Persistence seam (FR-STATE-1/4). */
  engine: RplEngine;
  restore: (engine: RplEngine) => void;
}

const clone = (e: RplEngine): RplEngine => ({
  ...e,
  stack: [...e.stack],
  home: cloneDir(e.home),
  path: [...e.path],
  custom: [...e.custom],
  pict: [...e.pict],
  menuStack48: [...e.menuStack48],
  ans: e.ans,

  // the plot is rebuilt wholesale by each plot command, never mutated in
  // place, so a shallow copy is enough across the union's kinds
  plot: e.plot ? { ...e.plot } : null,
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

  // CAS keys lazy-load the light tier on FIRST use (P14, NFR-3/NFR-4): show
  // an explicit loading line, import the chunk, register, then dispatch.
  const withCas = useCallback((go: (e: RplEngine) => void) => {
    setEngine((prev) => {
      const next = clone(prev);
      next.msg = "CAS loading…";
      return next;
    });
    void loadNerdamerProvider().then((p) => {
      setCas(p);
      setEngine((prev) => {
        const next = clone(prev);
        next.msg = null;
        go(next);
        return next;
      });
    });
  }, []);

  // the heavy tier loads over the network (WASM + sympy wheel) — explicit
  const withHeavy = useCallback((go: (e: RplEngine) => void) => {
    setEngine((prev) => {
      const next = clone(prev);
      next.msg = "Loading advanced CAS (SymPy, multi-MB — first use only)…";
      return next;
    });
    void import("@/lib/engine/cas/pyodide-provider")
      .then(({ loadPyodideProvider }) => loadPyodideProvider())
      .then((p) => {
        setCas(p);
        setEngine((prev) => {
          const next = clone(prev);
          next.msg = null;
          go(next);
          return next;
        });
      })
      .catch(() => {
        setEngine((prev) => {
          const next = clone(prev);
          next.msg = null;
          next.error = "Advanced CAS failed to load (network required)";
          return next;
        });
      });
  }, []);

  const heavyReady = () => {
    const c = getCas();
    return c !== null && "limit" in c;
  };

  const press = useCallback(
    (fn: string) => {
      if (HEAVY_FNS.has(fn) && !heavyReady()) {
        withHeavy((e) => dispatchRpl(e, fn));
      } else if (CAS_FNS.has(fn) && !casReady()) {
        withCas((e) => dispatchRpl(e, fn));
      } else {
        setEngine((prev) => {
          const next = clone(prev);
          dispatchRpl(next, fn);
          return next;
        });
      }
      setPrefix("none");
    },
    [withCas, withHeavy],
  );

  const soft = useCallback(
    (i: number) => {
      setEngine((prev) => {
        const label = menuLabels(prev)[i] ?? "";
        if (HEAVY_FNS.has(label) && !heavyReady()) {
          withHeavy((e) => pressSoft(e, i));
          const next = clone(prev);
          next.msg = "Loading advanced CAS (SymPy, multi-MB — first use only)…";
          return next;
        }
        if (CAS_FNS.has(label) && !casReady()) {
          // re-enter through the loader; return the loading state for now
          withCas((e) => pressSoft(e, i));
          const next = clone(prev);
          next.msg = "CAS loading…";
          return next;
        }
        const next = clone(prev);
        pressSoft(next, i);
        return next;
      });
      setPrefix("none");
    },
    [withCas, withHeavy],
  );

  const recall = useCallback((raw: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      push(next, bn(raw));
      return next;
    });
  }, []);

  const runLine = useCallback((text: string) => {
    setEngine((prev) => {
      const next = clone(prev);
      next.entry = text;
      dispatchRpl(next, "ENTER");
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
      // the unified LaTeX pipeline (P14, FR-IO-1): units, algebraics and
      // binaries typeset on the hero line; reals stay on the dot-matrix rows
      latex: (() => {
        const top = engine.stack[engine.stack.length - 1];
        if (!top || top.k === "real") return "";
        return objToTex(top, engine.disp, engine.base);
      })(),
      err: engine.error ?? undefined,
      msg: engine.msg ?? undefined,
      plot: engine.plot ?? undefined,
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

  return { state, prefix, press, soft, arm, recall, runLine, fmt, renderLatex, engine, restore };
}
