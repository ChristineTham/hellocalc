// FR-STATE-3: named workspaces persist whole-session JSON under a name and can
// be listed, loaded, and deleted (the storage seam behind the Settings UI).
import { afterEach, describe, expect, it } from "vitest";
import {
  deleteWorkspace,
  listWorkspaces,
  loadWorkspace,
  saveWorkspace,
} from "@/lib/storage";

afterEach(() => localStorage.clear());

describe("named workspaces (FR-STATE-3)", () => {
  it("saves, lists (sorted), loads and deletes", () => {
    saveWorkspace("mortgage", '{"v":1}');
    saveWorkspace("apollo", '{"v":2}');
    expect(listWorkspaces()).toEqual(["apollo", "mortgage"]); // sorted
    expect(loadWorkspace("mortgage")).toBe('{"v":1}');
    expect(loadWorkspace("missing")).toBeNull();
    deleteWorkspace("apollo");
    expect(listWorkspaces()).toEqual(["mortgage"]);
  });

  it("overwriting a name replaces its blob", () => {
    saveWorkspace("w", "first");
    saveWorkspace("w", "second");
    expect(listWorkspaces()).toEqual(["w"]);
    expect(loadWorkspace("w")).toBe("second");
  });
});
