// Step-6 hotkey-map oracle (docs/responsive-layout.md §12.2, FR-UI-2): the
// pure key→target map the dispatcher and the `?` cheat-sheet both consume.
import { describe, expect, it } from "vitest";
import { cheatsheetRows, hotkeyTarget } from "@/lib/hotkeys";

describe("hotkeyTarget", () => {
  it("maps digits, decimal and operators for every family", () => {
    for (const family of ["voyager", "classic", "rpl"] as const) {
      expect(hotkeyTarget("7", family)).toEqual({ type: "key", labels: ["7"] });
      expect(hotkeyTarget(".", family)).toEqual({ type: "key", labels: [".", "•", "·"] });
      expect(hotkeyTarget("*", family)).toEqual({ type: "key", labels: ["×"] });
      expect(hotkeyTarget("/", family)).toEqual({ type: "key", labels: ["÷"] });
      expect(hotkeyTarget("Enter", family)).toEqual({
        type: "key",
        labels: ["ENTER", "ENTER↑"],
      });
    }
  });

  it("Backspace is ←/CLx (era spellings, backspace first) on RPN families and DROP on RPL", () => {
    expect(hotkeyTarget("Backspace", "voyager")).toEqual({
      type: "key",
      labels: ["←", "⌫", "CLx", "CLX", "CL X"],
    });
    expect(hotkeyTarget("Backspace", "classic")).toEqual({
      type: "key",
      labels: ["←", "⌫", "CLx", "CLX", "CL X"],
    });
    expect(hotkeyTarget("Backspace", "rpl")).toEqual({ type: "kind", kind: "bksp" });
  });

  it("f/g arm on RPN families (no-op when the model lacks the key); h on classic; [/] on RPL", () => {
    expect(hotkeyTarget("f", "voyager")).toEqual({ type: "key", labels: ["f"] });
    expect(hotkeyTarget("f", "classic")).toEqual({ type: "key", labels: ["f"] });
    expect(hotkeyTarget("h", "classic")).toEqual({ type: "key", labels: ["h"] });
    expect(hotkeyTarget("h", "voyager")).toBeNull();
    expect(hotkeyTarget("f", "rpl")).toBeNull();
    expect(hotkeyTarget("[", "rpl")).toEqual({ type: "kind", kind: "ls" });
    expect(hotkeyTarget("]", "rpl")).toEqual({ type: "kind", kind: "rs" });
    expect(hotkeyTarget("[", "voyager")).toBeNull();
  });

  it("negate maps per family (CHS vs +/−); swap/roll only on RPN families", () => {
    expect(hotkeyTarget("n", "voyager")).toEqual({ type: "key", labels: ["CHS"] });
    expect(hotkeyTarget("n", "rpl")).toEqual({ type: "key", labels: ["+/−"] });
    expect(hotkeyTarget("x", "classic")).toEqual({ type: "key", labels: ["x⇄y"] });
    expect(hotkeyTarget("x", "rpl")).toBeNull();
    expect(hotkeyTarget("q", "voyager")).toBeNull(); // unmapped keys stay inert
  });
});

describe("cheatsheetRows", () => {
  it("lists family-appropriate rows (no drift from the map's semantics)", () => {
    const voyager = cheatsheetRows("voyager").map((r) => r.keys);
    expect(voyager).toContain("F / G");
    expect(voyager).not.toContain("[ / ]");
    const rpl = cheatsheetRows("rpl").map((r) => r.keys);
    expect(rpl).toContain("[ / ]");
    expect(rpl).not.toContain("F / G");
  });
});
