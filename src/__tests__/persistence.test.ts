// Phase-1 persistence foundation (architecture §9, FR-STATE-1/4): the
// EngineState tree round-trips EXACTLY (BigNumbers as tagged decimal
// strings), versions are checked, and corrupt input degrades to null
// instead of crashing.
import { describe, expect, it } from "vitest";
import {
  memoryAdapter,
  parseState,
  restore,
  snapshot,
  STATE_VERSION,
} from "@/lib/engine/persistence";
import { createRpn, dispatch, xval } from "@/lib/engine/rpn";
import { createRpl, dispatchRpl } from "@/lib/engine/rpl";

function populated() {
  const rpn = createRpn();
  for (const k of ["0", ".", "1", "ENTER", "0", ".", "2", "+", "STO"]) dispatch(rpn, k);
  const rpl = createRpl();
  for (const k of ["7", "ENTER", "ENTER", "+"]) dispatchRpl(rpl, k);
  return { rpn, rpl };
}

describe("EngineState snapshot/restore", () => {
  it("round-trips through JSON with BigNumber exactness (0.1+0.2 stays 0.3)", () => {
    const { rpn, rpl } = populated();
    const json = JSON.stringify(snapshot(rpn, rpl, "HP-35"));
    const parsed = parseState(json);
    expect(parsed).not.toBeNull();
    if (!parsed) return;
    const engines = restore(parsed);
    expect(xval(engines.rpn).toString()).toBe("0.3");
    expect(engines.rpn.mem.toString()).toBe("0.3");
    expect(engines.rpn.hist.map((h) => h.op)).toEqual(["ENTER", "+", "STO"]);
    expect(engines.rpl.stack.map((o) => o.k === "real" && o.v.toString())).toEqual(["14"]);
    expect(engines.activeModel).toBe("HP-35");
  });

  it("carries modes: angle + display format survive", () => {
    const { rpn, rpl } = populated();
    dispatch(rpn, "RAD");
    dispatch(rpn, "SCI");
    const engines = restore(parseState(JSON.stringify(snapshot(rpn, rpl, "HP-45")))!);
    expect(engines.rpn.angle).toBe("RAD");
    expect(engines.rpn.disp.mode).toBe("SCI");
  });

  it("rejects unknown versions (graceful degrade, no crash)", () => {
    const { rpn, rpl } = populated();
    const state = snapshot(rpn, rpl, "HP-35");
    const forged = JSON.stringify({ ...state, version: STATE_VERSION + 1 });
    expect(parseState(forged)).toBeNull();
  });

  it("rejects garbage, truncated JSON, and shape-valid-but-corrupt values", () => {
    expect(parseState("not json")).toBeNull();
    expect(parseState('{"version":1}')).toBeNull();
    const { rpn, rpl } = populated();
    const state = snapshot(rpn, rpl, "HP-35");
    state.rpn.x = { t: "bn", v: "??not-a-number??" };
    expect(parseState(JSON.stringify(state))).toBeNull();
  });

  it("round-trips registers and Σ state (P2), exactly", () => {
    const rpn = createRpn();
    for (const k of ["0", ".", "3", "STO n", "4", "2", "Σ+"]) dispatch(rpn, k);
    const engines = restore(parseState(JSON.stringify(snapshot(rpn, createRpl(), "HP-45")))!);
    expect(engines.rpn.regs[4].toString()).toBe("0.3");
    expect(engines.rpn.sum.n.toString()).toBe("1");
    expect(engines.rpn.sum.x.toString()).toBe("2");
  });

  it("accepts pre-P2 saves without regs/Σ (forward-compatible v1)", () => {
    const { rpn, rpl } = populated();
    const state = snapshot(rpn, rpl, "HP-35");
    // simulate an old save: strip the P2 fields
    delete (state.rpn as { regs?: unknown }).regs;
    delete (state.rpn as { sum?: unknown }).sum;
    const parsed = parseState(JSON.stringify(state));
    expect(parsed).not.toBeNull();
    if (!parsed) return;
    const engines = restore(parsed);
    expect(engines.rpn.regs).toHaveLength(10);
    expect(engines.rpn.sum.n.toString()).toBe("0");
  });

  it("memoryAdapter load/save/clear behaves like a storage", () => {
    const store = memoryAdapter();
    expect(store.load()).toBeNull();
    store.save("abc");
    expect(store.load()).toBe("abc");
    store.clear();
    expect(store.load()).toBeNull();
  });
});
