// The Pioneer/clamshell business machines (HP-17B/17BII/19B/19BII/18C):
// BUS percentages, ICNV interest conversion, and the algebraic SOLVER.
import { describe, expect, it } from "vitest";
import { bn, num } from "@/lib/engine/config";
import {
  effToNom,
  markupOnCost,
  markupOnPrice,
  nomToEff,
  pctChange,
  pctTotal,
  solveEquation,
  solverVariables,
} from "@/lib/engine/business";

describe("BUS percentages (FR-BUS-*)", () => {
  it("%CHG from 40 to 50 is +25%", () => {
    expect(num(pctChange(bn(40), bn(50))!)).toBeCloseTo(25, 10);
  });
  it("%TOTL: 30 of 150 is 20%", () => {
    expect(num(pctTotal(bn(150), bn(30))!)).toBeCloseTo(20, 10);
  });
  it("MU%C: cost 80, price 100 → 25% markup on cost", () => {
    expect(num(markupOnCost(bn(80), bn(100))!)).toBeCloseTo(25, 10);
  });
  it("MU%P: cost 80, price 100 → 20% margin on price", () => {
    expect(num(markupOnPrice(bn(80), bn(100))!)).toBeCloseTo(20, 10);
  });
  it("guards divide-by-zero bases", () => {
    expect(pctChange(bn(0), bn(5))).toBeNull();
    expect(pctTotal(bn(0), bn(5))).toBeNull();
    expect(markupOnCost(bn(0), bn(5))).toBeNull();
    expect(markupOnPrice(bn(5), bn(0))).toBeNull();
  });
});

describe("ICNV nominal ⇄ effective (FR-FIN-ICNV)", () => {
  it("10% nominal, monthly compounding → 10.4713% effective", () => {
    expect(num(nomToEff(bn(10), bn(12)))).toBeCloseTo(10.4713, 4);
  });
  it("round-trips effective→nominal→effective", () => {
    const eff = nomToEff(bn(18), bn(12));
    const nom = effToNom(eff, bn(12));
    expect(num(nom)).toBeCloseTo(18, 8);
  });
  it("continuous-limit sanity: more periods ⇒ higher effective rate", () => {
    expect(num(nomToEff(bn(12), bn(1)))).toBeCloseTo(12, 8);
    expect(num(nomToEff(bn(12), bn(365)))).toBeGreaterThan(num(nomToEff(bn(12), bn(12))));
  });
});

describe("SOLVER — variable discovery", () => {
  it("lists variables in first-appearance order, skipping functions", () => {
    expect(solverVariables("MU%C = (PRICE - COST) / COST * 100")).toEqual([
      "MU",
      "C",
      "PRICE",
      "COST",
    ]);
  });
  it("treats a plain markup identity's names as variables", () => {
    expect(solverVariables("MARGIN = (PRICE - COST) / PRICE")).toEqual([
      "MARGIN",
      "PRICE",
      "COST",
    ]);
  });
  it("skips known functions like sqrt/ln", () => {
    expect(solverVariables("Y = sqrt(X) + ln(Z)")).toEqual(["Y", "X", "Z"]);
  });
  it("returns null without an '='", () => {
    expect(solverVariables("A + B")).toBeNull();
  });
});

describe("SOLVER — solve for any variable", () => {
  it("solves a linear equation for the unknown (markup on cost)", () => {
    // MARGIN = (PRICE - COST)/COST ; given MARGIN=0.25, COST=80 → PRICE=100
    const r = solveEquation(
      "MARGIN = (PRICE - COST) / COST",
      { MARGIN: bn("0.25"), COST: bn(80) },
      "PRICE",
      bn(90),
    )!;
    expect(r).not.toBeNull();
    expect(num(r.value)).toBeCloseTo(100, 6);
    expect(r.converged).toBe(true);
  });

  it("solves a nonlinear equation (compound growth) for the rate", () => {
    // FV = PV*(1+R)^N ; 161.051 = 100*(1+R)^5 → R = 0.10
    const r = solveEquation(
      "FV = PV * (1 + R)^N",
      { FV: bn("161.051"), PV: bn(100), N: bn(5) },
      "R",
      bn("0.05"),
    )!;
    expect(r).not.toBeNull();
    expect(num(r.value)).toBeCloseTo(0.1, 5);
  });

  it("solves the same equation for a different unknown (N)", () => {
    const r = solveEquation(
      "FV = PV * (1 + R)^N",
      { FV: bn(200), PV: bn(100), R: bn("0.07") },
      "N",
      bn(5),
    )!;
    expect(r).not.toBeNull();
    // ln2 / ln1.07 ≈ 10.2448
    expect(num(r.value)).toBeCloseTo(10.2448, 3);
  });

  it("returns null when no root can be bracketed", () => {
    // X^2 + 1 = 0 has no real root
    const r = solveEquation("Y = X^2 + 1", { Y: bn(0) }, "X", bn(0));
    expect(r).toBeNull();
  });
});
