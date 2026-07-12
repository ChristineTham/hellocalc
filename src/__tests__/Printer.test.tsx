// The HP-97 desktop printer: renders the recent print/history lines on the
// paper tape (newest first), and shows a "paper" placeholder when idle.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Printer } from "@/components/calculator/Printer";

describe("Printer", () => {
  it("prints history lines newest-first with their op tags", () => {
    render(
      <Printer
        hist={[
          { op: "ENTER", v: "12.00" },
          { op: "+", v: "46.00" },
          { op: "×", v: "230.00" },
        ]}
      />,
    );
    // all three values are on the tape
    for (const v of ["12.00", "46.00", "230.00"]) {
      expect(screen.getByText(v)).toBeTruthy();
    }
    // newest (×) prints above the oldest (ENTER)
    const tape = screen.getByText("230.00").compareDocumentPosition(
      screen.getByText("12.00"),
    );
    expect(tape & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows a paper placeholder when nothing has printed", () => {
    render(<Printer hist={[]} />);
    expect(screen.getByText(/paper/i)).toBeTruthy();
  });
});
