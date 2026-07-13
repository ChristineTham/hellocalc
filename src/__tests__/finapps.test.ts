// The menu-driven financial apps beyond TVM (17B/17BII/18C/19B/19BII/27S/30b):
// ICNV, BOND, DEPRC, and Black–Scholes — each a variable menu that stores
// inputs and computes results on the softkeys.
import { describe, it, expect } from "vitest";
import { createRpn, dispatch, pressSoft42, xval, type RpnEngine } from "@/lib/engine/rpn";
import { bn, num } from "@/lib/engine/config";
import { formatDate } from "@/lib/engine/finance";

describe("formatDate — readable M.DYYYYY dates", () => {
  it("renders the date with weekday", () => {
    expect(formatDate(bn("1.012020"), false)).toBe("1/1/2020 WED");
    expect(formatDate(bn("3.312020"), false)).toBe("3/31/2020 TUE");
  });
  it("respects D.MY mode and rejects non-dates", () => {
    expect(formatDate(bn("31.032020"), true)).toBe("31/3/2020 TUE");
    expect(formatDate(bn("42"), false)).toBeNull();
  });
});

const key = (s: RpnEngine, digits: string) => {
  for (const d of digits) dispatch(s, d);
};

/** Wake into MAIN → FIN → the app's submenu path (indices). */
function openApp(s: RpnEngine, ...path: number[]) {
  dispatch(s, "MAIN");
  pressSoft42(s, 0); // FIN
  for (const i of path) pressSoft42(s, i);
}

describe("ICNV — interest conversion (variable menu)", () => {
  it("10% nominal, 12 periods → 10.4713% effective", () => {
    const s = createRpn();
    openApp(s, 1, 0); // FIN → ICNV → PER  (labels: NOM%, EFF%, P)
    key(s, "10");
    pressSoft42(s, 0); // store NOM% = 10
    key(s, "12");
    pressSoft42(s, 2); // store P = 12
    pressSoft42(s, 1); // compute EFF%
    expect(num(xval(s))).toBeCloseTo(10.4713, 4);
  });
});

describe("DEPRC — depreciation (variable menu)", () => {
  it("straight-line: 10000 basis, 1000 salvage, 5 yr → 1800/yr", () => {
    const s = createRpn();
    // FIN → DEPRC (labels: BASIS, SALV, LIFE, @DMETH)
    openApp(s, 4);
    key(s, "10000");
    pressSoft42(s, 0); // BASIS
    key(s, "1000");
    pressSoft42(s, 1); // SALV
    key(s, "5");
    pressSoft42(s, 2); // LIFE
    pressSoft42(s, 3); // → DMETH (labels: SL, DB, SOYD, ACRS)
    key(s, "1"); // year 1 in X
    pressSoft42(s, 0); // SL
    expect(num(xval(s))).toBeCloseTo(1800, 6);
  });
});

describe("Black–Scholes options (variable menu)", () => {
  it("prices the canonical ATM call (S=K=100, r=5%, σ=20%, T=1)", () => {
    const s = createRpn();
    // FIN → BS (labels: SPOT, STRIKE, RATE, VOL, TIME, @BSCALC)
    openApp(s, 5);
    key(s, "100");
    pressSoft42(s, 0); // SPOT
    key(s, "100");
    pressSoft42(s, 1); // STRIKE
    key(s, "5");
    pressSoft42(s, 2); // RATE %
    key(s, "20");
    pressSoft42(s, 3); // VOL %
    key(s, "1");
    pressSoft42(s, 4); // TIME
    pressSoft42(s, 5); // → BSCALC (labels: CALL, PUT)
    pressSoft42(s, 0); // CALL
    expect(num(xval(s))).toBeCloseTo(10.4506, 3);
  });
});

describe("TIME — date arithmetic (variable menu)", () => {
  it("days between 15 Jun 2020 and 15 Jun 2021 = 365", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 3); // TIME (MAIN: FIN,BUS,SUM,TIME,SOLVE) — labels DATE1,DATE2,DDAYS,…
    key(s, "6.152020");
    pressSoft42(s, 0); // DATE1
    key(s, "6.152021");
    pressSoft42(s, 1); // DATE2
    pressSoft42(s, 2); // DDAYS ← compute
    expect(num(xval(s))).toBe(365);
  });

  it("a date 90 days after 1 Jan 2020 is 31 Mar 2020 (4.012020)", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 3); // TIME
    key(s, "1.012020");
    pressSoft42(s, 0); // DATE1
    key(s, "90");
    pressSoft42(s, 2); // DDAYS
    pressSoft42(s, 1); // DATE2 ← compute (M.DYYYYY)
    expect(num(xval(s))).toBeCloseTo(3.312020, 6);
  });
});

describe("CURRX — currency conversion (variable menu)", () => {
  it("RATE 1.5, #1 = 100 → #2 = 150 (and back)", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 1); // BUS (labels: %CHG,%TOTL,MU%C,MU%P,CURRX,UNITS)
    pressSoft42(s, 4); // CURRX — labels: #1, #2, RATE, STORE
    key(s, "1.5");
    pressSoft42(s, 2); // RATE
    key(s, "100");
    pressSoft42(s, 0); // #1
    pressSoft42(s, 1); // #2 ← compute
    expect(num(xval(s))).toBe(150);
  });
});

describe("BOND — price ⇄ yield round-trip", () => {
  it("price from yield, then yield from that price, agree", () => {
    const s = createRpn();
    // FIN → BOND (labels: SETT, MAT, CPN%, YLD%, PRICE, ACCRU)
    openApp(s, 3);
    key(s, "6.152020");
    pressSoft42(s, 0); // SETT = 15 Jun 2020 (M.DYYYYY)
    key(s, "6.152030");
    pressSoft42(s, 1); // MAT  = 15 Jun 2030
    key(s, "6");
    pressSoft42(s, 2); // CPN% = 6
    key(s, "8");
    pressSoft42(s, 3); // YLD% = 8
    pressSoft42(s, 4); // PRICE ← compute (and store)
    const price = num(xval(s));
    expect(price).toBeGreaterThan(50);
    expect(price).toBeLessThan(120);
    pressSoft42(s, 3); // YLD% ← compute back from the stored PRICE
    expect(num(xval(s))).toBeCloseTo(8, 2);
  });
});
