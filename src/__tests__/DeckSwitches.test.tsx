// The faceplate slide switches are interactive: each is a labelled button whose
// nub reflects live state (power / PRGM-RUN mode / printer trace) and whose click
// drives the matching toggle.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeckSwitches, type SwitchState } from "@/components/calculator/DeckSwitches";
import { MODELS } from "@/components/calculator/models";

const model = MODELS["HP-97"];
const switches = model.switches ?? [];

function baseState(over: Partial<SwitchState> = {}): SwitchState {
  return {
    mode: "RUN",
    onToggleMode: vi.fn(),
    power: true,
    onTogglePower: vi.fn(),
    trace: true,
    onToggleTrace: vi.fn(),
    ...over,
  };
}

describe("DeckSwitches", () => {
  it("renders one labelled button per switch (HP-97: power, mode, trace)", () => {
    render(<DeckSwitches switches={switches} state={baseState()} />);
    expect(screen.getByRole("button", { name: "Power: On" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mode: Run" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Trace: Norm" })).toBeTruthy();
  });

  it("labels reflect the OFF/PRGM/MAN state", () => {
    render(
      <DeckSwitches
        switches={switches}
        state={baseState({ power: false, mode: "PRGM", trace: false })}
      />,
    );
    expect(screen.getByRole("button", { name: "Power: Off" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mode: Prgm" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Trace: Man" })).toBeTruthy();
  });

  it("clicking a switch fires its toggle", () => {
    const st = baseState();
    render(<DeckSwitches switches={switches} state={st} />);
    fireEvent.click(screen.getByRole("button", { name: "Power: On" }));
    fireEvent.click(screen.getByRole("button", { name: "Mode: Run" }));
    fireEvent.click(screen.getByRole("button", { name: "Trace: Norm" }));
    expect(st.onTogglePower).toHaveBeenCalledOnce();
    expect(st.onToggleMode).toHaveBeenCalledOnce();
    expect(st.onToggleTrace).toHaveBeenCalledOnce();
  });

  it("a mode switch with no program engine wired is inert (disabled)", () => {
    render(
      <DeckSwitches
        switches={switches}
        state={baseState({ mode: undefined, onToggleMode: undefined })}
      />,
    );
    const btn = screen.getByRole("button", { name: /^Mode:/ });
    expect(btn).toHaveProperty("disabled", true);
  });
});
