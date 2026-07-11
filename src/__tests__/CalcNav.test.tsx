// Step-4 chrome tests: CalcNav is ONE component rendered in two hosts (left
// sheet below lg, persistent sidebar at lg+); it must surface the FR-STATE-4
// entry points and open the About dialog.
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CalcNav } from "@/components/calculator/CalcNav";

describe("CalcNav", () => {
  it("surfaces the FR-STATE-4 entry points and app items", () => {
    render(<CalcNav />);
    for (const name of ["Import state", "Export state", "Reset state", "Settings"]) {
      const btn = screen.getByRole("button", { name: new RegExp(name) });
      expect(btn).toBeTruthy();
      expect(btn).toHaveProperty("disabled", true); // wired in the persistence phase
    }
    expect(screen.getByRole("button", { name: "About" })).toBeTruthy();
  });

  it("About opens a dialog describing the app", async () => {
    render(<CalcNav />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));
    expect(await screen.findByText(/HP calculator emulator/)).toBeTruthy();
  });
});
