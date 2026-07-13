// The LIST-based menu apps: CFLO (uneven cash flows → IRR/NPV) and SUM
// (statistics data → total/mean/median/std-dev/range). INPUT accumulates the
// list; the CALC submenu computes from it.
import { describe, it, expect } from "vitest";
import { createRpn, dispatch, pressSoft42, xval, type RpnEngine } from "@/lib/engine/rpn";
import { num } from "@/lib/engine/config";

const key = (s: RpnEngine, digits: string) => {
  for (const d of digits) dispatch(s, d);
};
const input = (s: RpnEngine) => dispatch(s, "INPUT");

describe("CFLO — cash-flow list (IRR / NPV)", () => {
  function setup() {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 0); // FIN
    pressSoft42(s, 2); // CFLO
    // flows: −1000, 500, 500, 500
    key(s, "1000");
    dispatch(s, "CHS");
    input(s);
    for (let k = 0; k < 3; k++) {
      key(s, "500");
      input(s);
    }
    return s;
  }

  it("accumulates the flows in the list", () => {
    const s = setup();
    expect(s.list?.items.length).toBe(4);
  });

  it("IRR of −1000, 500, 500, 500 ≈ 23.375%", () => {
    const s = setup();
    pressSoft42(s, 0); // CALC → CFLOCALC
    pressSoft42(s, 0); // IRR%
    expect(num(xval(s))).toBeCloseTo(23.375, 2);
  });

  it("NPV at 10% ≈ 243.43", () => {
    const s = setup();
    pressSoft42(s, 0); // CALC → CFLOCALC (labels: IRR%, NPV, NUS, NFV)
    key(s, "10"); // discount rate keyed as X
    pressSoft42(s, 1); // NPV
    expect(num(xval(s))).toBeCloseTo(243.43, 1);
  });
});

describe("SUM — statistics list", () => {
  function setup() {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 2); // SUM (MAIN: FIN,BUS,SUM,TIME,SOLVE)
    for (const v of ["2", "4", "6", "8"]) {
      key(s, v);
      input(s);
    }
    pressSoft42(s, 0); // CALC → SUMCALC (TOTAL, MEAN, MEDN, STDEV, RANG, MORE)
    return s;
  }

  it("TOTAL = 20, MEAN = 5", () => {
    const s = setup();
    pressSoft42(s, 0); // TOTAL
    expect(num(xval(s))).toBe(20);
    pressSoft42(s, 1); // MEAN
    expect(num(xval(s))).toBe(5);
  });

  it("MEDN = 5, RANG = 6", () => {
    const s = setup();
    pressSoft42(s, 2); // MEDN
    expect(num(xval(s))).toBe(5);
    pressSoft42(s, 4); // RANG
    expect(num(xval(s))).toBe(6);
  });

  it("sample STDEV of 2,4,6,8 ≈ 2.582", () => {
    const s = setup();
    pressSoft42(s, 3); // STDEV
    expect(num(xval(s))).toBeCloseTo(2.582, 3);
  });
});
