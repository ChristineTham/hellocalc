// The business machines' menu navigation + leaf math (HP-17B/17BII/18C/19B/
// 19BII): MAIN → FIN/BUS/SUM/TIME/SOLVE softkey tree on the shared RPN engine,
// the BUS percentages, and the TVM legend remap onto the 12C registers.
import { describe, it, expect } from "vitest";
import {
  createRpn,
  dispatch,
  inputDigit,
  menu42Labels,
  pressSoft42,
  pushX,
  xval,
} from "@/lib/engine/rpn";
import { bn, num } from "@/lib/engine/config";

/** The display-facing labels (menu42Labels keeps the internal "@" nesting mark
 * that the hook strips before it reaches the glass). */
const labels = (s: ReturnType<typeof createRpn>) =>
  menu42Labels(s).map((l) => l.replace(/^@/, ""));

/** Key a multi-digit number through the entry path (so a TVM register STORES). */
const keyNum = (s: ReturnType<typeof createRpn>, digits: string) => {
  for (const d of digits) inputDigit(s, d);
};

describe("business machines — menu navigation", () => {
  it("wakes into MAIN with the five common apps", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    expect(labels(s).slice(0, 5)).toEqual(["FIN", "BUS", "SUM", "TIME", "SOLVE"]);
  });

  it("MAIN → FIN shows the financial applications", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 0); // FIN
    expect(labels(s)).toEqual(["TVM", "ICNV", "CFLO", "BOND", "DEPRC", "BS"]);
  });

  it("FIN → TVM shows the five registers + OTHER, EXIT pops back", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 0); // FIN
    pressSoft42(s, 0); // TVM
    expect(labels(s)).toEqual(["N", "I%YR", "PV", "PMT", "FV", "OTHER"]);
    dispatch(s, "EXIT");
    expect(labels(s)).toEqual(["TVM", "ICNV", "CFLO", "BOND", "DEPRC", "BS"]);
  });

  it("MAIN → BUS shows the percentages plus CURRX/UNITS", () => {
    const s = createRpn();
    dispatch(s, "MAIN");
    pressSoft42(s, 1); // BUS
    expect(labels(s)).toEqual(["%CHG", "%TOTL", "MU%C", "MU%P", "CURRX", "UNITS"]);
  });
});

describe("business machines — BUS leaf math off the stack", () => {
  const bus = (label: string, y: number, x: number) => {
    const s = createRpn();
    pushX(s, bn(y));
    pushX(s, bn(x));
    dispatch(s, label);
    return num(xval(s));
  };

  it("%TOTL: 30 as a percent of 150 = 20%", () => {
    expect(bus("%TOTL", 150, 30)).toBeCloseTo(20, 8);
  });
  it("MU%C: cost 80, price 100 → 25% markup on cost", () => {
    expect(bus("MU%C", 80, 100)).toBeCloseTo(25, 8);
  });
  it("MU%P: cost 80, price 100 → 20% margin on price", () => {
    expect(bus("MU%P", 80, 100)).toBeCloseTo(20, 8);
  });
});

describe("business machines — TVM legends reuse the 12C registers", () => {
  it("N/I%YR store into the shared financial registers", () => {
    const s = createRpn();
    keyNum(s, "360");
    dispatch(s, "N"); // 17B legend → 12C n (freshly keyed ⇒ STORE)
    keyNum(s, "0.5");
    dispatch(s, "I%YR"); // 17B legend → 12C i
    expect(num(s.fin.n)).toBe(360);
    expect(num(s.fin.i)).toBeCloseTo(0.5, 8);
  });
});
