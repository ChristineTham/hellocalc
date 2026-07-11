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
import { applyFunction, createRpn } from "@/lib/engine/rpn";

/** Probe: does the RPN engine implement this canonical id today?
 * A fresh engine per probe so error states can't leak between ids. */
const rpnImplements = (fn: string) => applyFunction(createRpn(), fn);

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

  it("coverage reports honestly for models awaiting their engine phase", () => {
    // the 12C's finance plane is Phase 7 — the report must SAY so, not hide it
    const report = coverage("HP-12C", rpnImplements);
    expect(report.implemented.length).toBeGreaterThan(10);
    expect(report.missing.length).toBeGreaterThan(0);
  });
});
