// The primary nav: a selectable model tree grouped by class, plus a footer with
// Settings (theme + FR-STATE-4 actions) and an About link. Rendered in two hosts
// (persistent sidebar at lg+, hamburger sheet below lg).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SidebarNav } from "@/components/calculator/SidebarNav";
import { SettingsDialog } from "@/components/calculator/SettingsDialog";

describe("SidebarNav", () => {
  it("renders a selectable model tree grouped by class", () => {
    render(<SidebarNav activeModel="HP-12C" onSelectModel={() => {}} />);
    // classes are listboxes; models are options
    expect(screen.getByRole("listbox", { name: "Voyager" })).toBeTruthy();
    const opt = screen.getByRole("option", { name: "HP-12C" });
    expect(opt.getAttribute("aria-selected")).toBe("true");
  });

  it("selecting a model fires onSelectModel with its id", () => {
    const onSelect = vi.fn();
    render(<SidebarNav activeModel="HP-12C" onSelectModel={onSelect} />);
    fireEvent.click(screen.getByRole("option", { name: "HP-15C" }));
    expect(onSelect).toHaveBeenCalledWith("HP-15C");
  });

  it("footer links to the /about page", () => {
    render(<SidebarNav activeModel="HP-12C" onSelectModel={() => {}} />);
    const link = screen.getByRole("link", { name: "About" });
    expect(link.getAttribute("href")).toBe("/about");
  });

  it("footer surfaces a Settings entry point", () => {
    render(<SidebarNav activeModel="HP-12C" onSelectModel={() => {}} />);
    expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
  });
});

describe("SettingsDialog", () => {
  it("exposes the theme control and the FR-STATE-4 actions", () => {
    render(<SettingsDialog onExport={() => {}} onImportFile={() => {}} onReset={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Dark" })).toBeTruthy();
    for (const name of ["Import state", "Export state", "Reset state"]) {
      const btn = screen.getByRole("button", { name: new RegExp(name) });
      expect(btn).toBeTruthy();
      expect(btn).toHaveProperty("disabled", false); // wired here
    }
  });

  it("disables the state actions until wired", () => {
    render(<SettingsDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    for (const name of ["Import state", "Export state", "Reset state"]) {
      expect(screen.getByRole("button", { name: new RegExp(name) })).toHaveProperty(
        "disabled",
        true,
      );
    }
  });
});
