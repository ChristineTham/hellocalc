// Phase-1 model-adapter formalization (architecture §6): the verified
// mapping.json is the dispatch source of truth, and coverage is CHECKABLE —
// the "no key remains inert" DoD line for a wired model is an assertion here,
// not a hope. HP-35 is the first model required to be fully covered.
import { describe, expect, it } from "vitest";
import {
  coverage,
  mappedModels,
  modelFunctions,
  resolveKey,
} from "@/lib/models/adapter";
import { createRpn, dispatch } from "@/lib/engine/rpn";

/** Probe: does the RPN engine implement this canonical id today?
 * A fresh engine per probe so error states can't leak between ids. */
// probe through dispatch — the REAL key path (the P16 menu layer lives there)
const rpnImplements = (fn: string) => dispatch(createRpn(), fn);

describe("model adapter (hp/mapping/mapping.json)", () => {
  it("carries all 21 models", () => {
    expect(mappedModels()).toHaveLength(21);
    expect(mappedModels()).toContain("HP-35");
    expect(mappedModels()).toContain("HP-Prime");
  });

  it("resolves (key, prefix) → canonical engine id through the normalize seam", () => {
    expect(resolveKey("HP-35", "ENTER↑")).toBe("ENTER");
    expect(resolveKey("HP-35", "sin")).toBe("SIN");
    expect(resolveKey("HP-35", "x^y")).toBe("yˣ"); // print → canonical power id
    // `arc` maps as a key of its own — a faceplate-local prefix, not an engine op
    expect(modelFunctions("HP-35").some((f) => f.fn === "arc")).toBe(true);
  });

  it("HP-35: NO key remains inert — every mapped function dispatches (Phase-1 DoD)", () => {
    const report = coverage("HP-35", rpnImplements);
    expect(report.total).toBeGreaterThan(20);
    expect(report.missing).toEqual([]);
  });

  it("HP-45: NO key remains inert — every mapped function dispatches (Phase-2 DoD)", () => {
    const report = coverage("HP-45", rpnImplements);
    expect(report.total).toBeGreaterThan(40);
    expect(report.missing).toEqual([]);
  });

  it("HP-65: NO key remains inert — every mapped function dispatches (Phase-3 DoD)", () => {
    const report = coverage("HP-65", rpnImplements);
    expect(report.total).toBeGreaterThan(50);
    expect(report.missing).toEqual([]);
  });

  it("HP-25: NO key remains inert — every mapped function dispatches (Phase-4 DoD)", () => {
    const report = coverage("HP-25", rpnImplements);
    expect(report.total).toBeGreaterThan(45);
    expect(report.missing).toEqual([]);
  });

  it("model-specific overrides: the faceplate data mirrors MODEL_FN_OVERRIDES", async () => {
    // the 25's CLEAR bracket: mapping resolution and the authored fFn fields
    // must agree, or the oracle would pass while the live keys dispatch wrong
    expect(resolveKey("HP-25", "CHS", "f")).toBe("CLEAR PRGM");
    expect(resolveKey("HP-25", "EEX", "f")).toBe("CLEAR REG");
    expect(resolveKey("HP-25", "CLX", "f")).toBe("CLEAR STK");
    const { MODELS } = await import("@/components/calculator/models");
    const hp25 = MODELS["HP-25"];
    if (hp25.family !== "classic") throw new Error("HP-25 must be classic");
    const byLegend = (legend: string) => {
      const k = hp25.rows.flat().find((x) => x.legend === legend);
      if (!k) throw new Error(`no ${legend} key`);
      return k;
    };
    expect(byLegend("CHS").fFn).toBe("CLEAR PRGM");
    expect(byLegend("EEX").fFn).toBe("CLEAR REG");
    expect(byLegend("CLX").fFn).toBe("CLEAR STK");
  });

  it("HP-67 + HP-97: NO key remains inert (Phase-5 DoD)", () => {
    for (const model of ["HP-67", "HP-97"]) {
      const report = coverage(model, rpnImplements);
      expect(report.missing, model).toEqual([]);
    }
  });

  it("the 67's DSZ/ISZ resolve to the I-register forms (model override)", () => {
    expect(resolveKey("HP-67", "STO", "f")).toBe("DSZ I");
    expect(resolveKey("HP-67", "RCL", "f")).toBe("ISZ I");
    expect(resolveKey("HP-97", "I")).toBe("RC I");
  });

  it("HP-41C/CV + HP-41CX: NO key remains inert, alpha presses included (Phase-6 DoD)", () => {
    for (const model of ["HP-41C-CV", "HP-41CX"]) {
      const report = coverage(model, rpnImplements);
      expect(report.missing, model).toEqual([]);
    }
    // alpha-access presses resolve to α-append ids
    expect(modelFunctions("HP-41C-CV").some((f) => f.fn === "αA")).toBe(true);
  });

  it("HP-12C: NO key remains inert — the finance plane is live (Phase-7 DoD)", () => {
    const report = coverage("HP-12C", rpnImplements);
    expect(report.missing).toEqual([]);
  });

  it("HP-11C: NO key remains inert (Phase-8 DoD)", () => {
    const report = coverage("HP-11C", rpnImplements);
    expect(report.missing).toEqual([]);
  });

  it("HP-15C: NO key remains inert — complex/matrix/SOLVE live (Phase-9 DoD)", () => {
    const report = coverage("HP-15C", rpnImplements);
    expect(report.missing).toEqual([]);
  });

  it("HP-16C: NO key remains inert — the integer plane is live (Phase-10 DoD)", () => {
    const report = coverage("HP-16C", rpnImplements);
    expect(report.missing).toEqual([]);
  });

  it("HP-28C: NO key remains inert — the full plane is live (Phase-14 DoD)", async () => {
    const rpl = await import("@/lib/engine/rpl");
    const probe = (fn: string) => rpl.dispatchRpl(rpl.createRpl(), fn);
    const report = coverage("HP-28C", probe);
    expect(report.missing).toEqual([]);
  });

  it("HP-28S: NO key remains inert — directories + deltas live (Phase-15 DoD)", async () => {
    const rpl = await import("@/lib/engine/rpl");
    const probe = (fn: string) => rpl.dispatchRpl(rpl.createRpl(), fn);
    const report = coverage("HP-28S", probe);
    expect(report.missing).toEqual([]);
  });

  it("HP-42S: NO key remains inert — the menu-driven RPN is live (Phase-16 DoD)", () => {
    const report = coverage("HP-42S", rpnImplements);
    expect(report.missing).toEqual([]);
  });

  it("coverage reports honestly for models awaiting their engine phase", async () => {
    // the 48G's catalog/apps plane is Phase 17 — the report must SAY so
    const rpl = await import("@/lib/engine/rpl");
    const probe = (fn: string) => rpl.dispatchRpl(rpl.createRpl(), fn);
    const report = coverage("HP-48G", probe);
    expect(report.missing.length).toBeGreaterThan(0);
  });
});
