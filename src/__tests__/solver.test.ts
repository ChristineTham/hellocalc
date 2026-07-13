// The equation SOLVER on the menu machines (17B family / 27S / 35s): type an
// equation, get its variable menu, store values, solve for any one.
import { describe, it, expect } from "vitest";
import {
  createRpn,
  dispatch,
  menu42Labels,
  pressSoft42,
  xval,
  type RpnEngine,
} from "@/lib/engine/rpn";
import { num } from "@/lib/engine/config";

/** Type an equation string into the SOLVER (maps chars to key ids). */
function typeEquation(s: RpnEngine, eq: string) {
  dispatch(s, "EQN"); // start equation entry
  const OP: Record<string, string> = { "*": "×", "/": "÷", "^": "yˣ", "-": "−" };
  for (const ch of eq) {
    if (/[A-Za-z]/.test(ch)) dispatch(s, "α" + ch);
    else dispatch(s, OP[ch] ?? ch);
  }
  dispatch(s, "ENTER"); // commit → opens the variable menu
}

// key through dispatch (not inputDigit) so s.fresh is set exactly as the real
// keyboard does — the store-vs-solve decision hinges on it
const keyNum = (s: RpnEngine, digits: string) => {
  for (const d of digits) dispatch(s, d);
};

describe("equation SOLVER", () => {
  it("EQN starts entry; ENTER commits and opens the variable menu", () => {
    const s = createRpn();
    typeEquation(s, "FV=PV*(1+R)^N");
    expect(s.solver?.eq).toBe("FV=PV*(1+R)^N");
    expect(s.menu?.name).toBe("SOLVER");
    expect(menu42Labels(s).slice(0, 4)).toEqual(["FV", "PV", "R", "N"]);
  });

  it("stores keyed values and solves for the remaining variable", () => {
    const s = createRpn();
    typeEquation(s, "FV=PV*(1+R)^N");
    // labels: [FV, PV, R, N]
    keyNum(s, "100");
    pressSoft42(s, 1); // store PV = 100
    keyNum(s, "0.1");
    pressSoft42(s, 2); // store R = 0.1
    keyNum(s, "5");
    pressSoft42(s, 3); // store N = 5
    pressSoft42(s, 0); // solve for FV (no fresh entry) → 100·1.1^5 = 161.051
    expect(num(xval(s))).toBeCloseTo(161.051, 3);
    expect(s.solver?.vars.FV).toBeDefined();
  });

  it("solves the same equation for a different unknown", () => {
    const s = createRpn();
    typeEquation(s, "FV=PV*(1+R)^N");
    keyNum(s, "200");
    pressSoft42(s, 0); // FV = 200
    keyNum(s, "100");
    pressSoft42(s, 1); // PV = 100
    keyNum(s, "7");
    pressSoft42(s, 3); // N = 7
    pressSoft42(s, 2); // solve for R → 200 = 100(1+R)^7 → R ≈ 0.104090
    expect(num(xval(s))).toBeCloseTo(0.10409, 4);
  });

  it("EXIT during entry cancels without setting an equation", () => {
    const s = createRpn();
    dispatch(s, "EQN");
    dispatch(s, "α" + "A");
    dispatch(s, "EXIT");
    expect(s.eqEntry).toBe(false);
    expect(s.solver).toBeNull();
  });
});
