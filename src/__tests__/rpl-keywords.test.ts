import { describe, it, expect } from "vitest";
import { RPL_COMMANDS, RPL_COMMAND_SET } from "@/lib/rpl/keywords";
import { CATALOG_COMMANDS } from "@/lib/engine/rpl/menu";

describe("RPL editor vocabulary", () => {
  it("is the sorted, de-duplicated union of the catalog + extras", () => {
    // no duplicates
    expect(RPL_COMMANDS.length).toBe(new Set(RPL_COMMANDS).size);
    // sorted
    expect([...RPL_COMMANDS].sort((a, b) => a.localeCompare(b))).toEqual(RPL_COMMANDS);
    // superset of every menu command
    for (const c of CATALOG_COMMANDS) expect(RPL_COMMAND_SET.has(c)).toBe(true);
  });

  it("covers the words a paste-and-run user reaches for", () => {
    for (const c of ["DUP", "SWAP", "→LIST", "STO", "EVAL", "d/dx", "∫", "IF", "FOR", "SIN"]) {
      expect(RPL_COMMAND_SET.has(c), c).toBe(true);
    }
  });

  it("every command that runs through the engine dispatches (spot check)", async () => {
    const { createRpl, dispatchRpl } = await import("@/lib/engine/rpl");
    // a representative sample resolves (returns true) rather than being inert
    for (const c of ["DUP", "DEPTH", "CLEAR", "DEC", "STD", "DEG", "π"]) {
      expect(dispatchRpl(createRpl(), c), c).toBe(true);
    }
  });
});
