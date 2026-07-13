// Step-1 component tests (docs/responsive-layout.md §9): each family keyboard
// renders an aspect-locked grid of uniform tracks with correct spans, driven by
// model.geometry — the structural guarantee behind Priority 1.
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Keyboard } from "@/components/calculator/Keyboard";
import { ClassicKeyboard } from "@/components/calculator/ClassicKeyboard";
import { RplKeyboard } from "@/components/calculator/RplKeyboard";
import { MODELS } from "@/components/calculator/models";
import { bn, type Value } from "@/lib/engine/config";
import { createRpn } from "@/lib/engine/rpn";
import { createRpl } from "@/lib/engine/rpl";

const noop = () => {};

function keyboardRoot(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="keyboard"]');
  if (!el) throw new Error('missing [data-slot="keyboard"] root');
  return el;
}

// jsdom normalizes `aspect-ratio: 0.72` to "0.72 / 1" — compare numerically.
function styleAspectOf(el: HTMLElement): number {
  return Number.parseFloat(el.style.aspectRatio);
}

describe("Keyboard (voyager)", () => {
  const model = MODELS["HP-12C"];
  if (model.family !== "voyager") throw new Error("HP-12C must be voyager");

  it("renders an aspect-locked 10×4 grid with one button per key", () => {
    const { container } = render(
      <Keyboard
        keys={model.keys}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const root = keyboardRoot(container);
    expect(styleAspectOf(root)).toBeCloseTo(model.geometry.aspect, 5);
    expect(root.style.gridTemplateColumns).toBe("repeat(10, minmax(0, 1fr))");
    expect(root.style.gridTemplateRows).toBe("repeat(4, minmax(0, 1fr))");
    expect(container.querySelectorAll("button")).toHaveLength(model.keys.length);
  });

  it("the tall ENTER spans 2 rows (consumes existing slots)", () => {
    const { container } = render(
      <Keyboard
        keys={model.keys}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const enter = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "ENTER",
    );
    if (!enter) throw new Error("no ENTER key rendered");
    expect(enter.style.gridRow).toMatch(/span 2/);
  });
});

describe("prefix promotion (§12.3 rev 6) — armed shift takes the primary slot", () => {
  const voyager = MODELS["HP-12C"];
  if (voyager.family !== "voyager") throw new Error("HP-12C must be voyager");
  const rplModel = MODELS["HP-48G"];
  if (rplModel.family !== "rpl") throw new Error("HP-48G must be rpl");

  const primarySlotOf = (btn: HTMLElement) =>
    btn.querySelector<HTMLElement>(".row-start-2, .z-10");

  it("voyager: arming f shows the gold function AS the key label (n → AMORT)", () => {
    const { container } = render(
      <Keyboard keys={voyager.keys} geometry={voyager.geometry} prefix="f" onArm={noop} onPress={noop} />,
    );
    const n = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "n",
    );
    if (!n) throw new Error("no n key");
    expect(primarySlotOf(n)?.textContent).toBe("AMORT");
    // …and the small gold row emptied (the word moved down)
    expect(n.querySelector(".key-shift")?.textContent).toBe("");
  });

  it("voyager: disarmed keys show their primary again", () => {
    const { container } = render(
      <Keyboard keys={voyager.keys} geometry={voyager.geometry} prefix="none" onArm={noop} onPress={noop} />,
    );
    const n = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "n",
    );
    expect(n && primarySlotOf(n)?.textContent).toBe("n");
  });

  it("rpl: arming left-shift shows the purple function AS the key label (7 → SOLVE)", () => {
    const { container } = render(
      <RplKeyboard rows={rplModel.rows} geometry={rplModel.geometry} prefix="ls" onArm={noop} onPress={noop} />,
    );
    const seven = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "7",
    );
    if (!seven) throw new Error("no 7 key");
    expect(seven.querySelector(".z-10")?.textContent).toBe("SOLVE");
  });

  it("rpl: arming alpha shows the letter AS the key label (SIN → S), small copy empties", () => {
    const { container } = render(
      <RplKeyboard rows={rplModel.rows} geometry={rplModel.geometry} prefix="alpha" onArm={noop} onPress={noop} />,
    );
    const sin = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "SIN",
    );
    if (!sin) throw new Error("no SIN key");
    expect(sin.querySelector(".z-10")?.textContent).toBe("S");
    expect(sin.querySelector(".key-shift")?.textContent).toBe("");
  });

  it("rpl: alpha letters are visible at rest (the 48G prints them on every key)", () => {
    const { container } = render(
      <RplKeyboard rows={rplModel.rows} geometry={rplModel.geometry} prefix="none" onArm={noop} onPress={noop} />,
    );
    const sin = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "SIN",
    );
    expect(sin?.querySelector(".key-shift")?.textContent).toBe("S");
  });

  it("classic: arming arc shows the inverse AS the trig key label (sin → SIN⁻¹)", () => {
    const model = MODELS["HP-35"];
    if (model.family !== "classic") throw new Error("HP-35 must be classic");
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const arc = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "arc",
    );
    if (!arc) throw new Error("no arc key");
    fireEvent.click(arc);
    const sin = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "sin",
    );
    expect(sin?.querySelector(".row-start-2")?.textContent).toBe("SIN⁻¹");
  });

  it("shifted classic (HP-25): arming f promotes the gold word (SST → FIX) and dispatch normalizes print → engine id", () => {
    const model = MODELS["HP-25"];
    if (model.family !== "classic") throw new Error("HP-25 must be classic");
    const pressed: string[] = [];
    const { container } = render(
      <ClassicKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="f"
        onArm={noop}
        onPress={(fn) => pressed.push(fn)}
      />,
    );
    const byLabel = (label: string) => {
      const b = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
        (x) => x.getAttribute("aria-label") === label,
      );
      if (!b) throw new Error(`no ${label} key`);
      return b;
    };
    expect(byLabel("SST").querySelector(".row-start-2")?.textContent).toBe("FIX");
    // printed "ln" (f of 7) dispatches the canonical engine id "LN"
    fireEvent.click(byLabel("7"));
    expect(pressed).toEqual(["LN"]);
  });

  it("HP-65: arming f⁻¹ promotes the INVERSE of each gold word (7's LN → eˣ)", () => {
    const model = MODELS["HP-65"];
    if (model.family !== "classic") throw new Error("HP-65 must be classic");
    const pressed: string[] = [];
    const { container } = render(
      <ClassicKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="fi"
        onArm={noop}
        onPress={(fn) => pressed.push(fn)}
      />,
    );
    const seven = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "7",
    );
    if (!seven) throw new Error("no 7 key");
    expect(seven.querySelector(".row-start-2")?.textContent).toBe("eˣ");
    fireEvent.click(seven);
    expect(pressed).toEqual(["eˣ"]);
  });

  it("HP-41: arming ALPHA promotes each key's letter (LN → E) and types α-ids", () => {
    const model = MODELS["HP-41C-CV"];
    if (model.family !== "hp41") throw new Error("HP-41C-CV must be hp41");
    const pressed: string[] = [];
    const { container } = render(
      <ClassicKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="alpha"
        onArm={noop}
        onPress={(fn) => pressed.push(fn)}
      />,
    );
    const ln = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "LN",
    );
    if (!ln) throw new Error("no LN key");
    expect(ln.querySelector(".row-start-2")?.textContent).toBe("E");
    // ALPHA entry (P6): the letter dispatches its α-append id
    fireEvent.click(ln);
    expect(pressed).toEqual(["αE"]);
  });

  it("HP-67: the black h plane renders and promotes (9 → R↑)", () => {
    const model = MODELS["HP-67"];
    if (model.family !== "classic") throw new Error("HP-67 must be classic");
    const { container } = render(
      <ClassicKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="h"
        onArm={noop}
        onPress={noop}
      />,
    );
    const nine = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "9",
    );
    expect(nine?.querySelector(".row-start-2")?.textContent).toBe("R↑");
  });
});

describe("merged two-block machines (28C clamshell / 97 desk)", () => {
  it("HP-28C: every merged row fills exactly 13 units across the hinge gaps", () => {
    const model = MODELS["HP-28C"];
    if (model.family !== "rpl") throw new Error("HP-28C must be rpl");
    const { container } = render(
      <RplKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const root = keyboardRoot(container);
    expect(root.style.gridTemplateColumns).toBe("repeat(13, minmax(0, 1fr))");
    const children = Array.from(root.children) as HTMLElement[];
    let i = 0;
    for (const row of model.rows) {
      let units = 0;
      for (let k = 0; k < row.length; k++, i++) {
        const m = /span (\d+)/.exec(children[i].style.gridColumn);
        if (!m) throw new Error(`cell ${i} has no span`);
        units += Number(m[1]);
      }
      expect(units).toBe(13);
    }
    // the red single shift arms ls; letters are primaries on the left half
    expect(container.querySelector('[data-kind="ls"]')).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll<HTMLElement>("button")).find(
        (b) => b.getAttribute("aria-label") === "A",
      ),
    ).toBeTruthy();
  });

  it("HP-97: gap cells render no button; classic merged rows fill 12 units", () => {
    const model = MODELS["HP-97"];
    if (model.family !== "classic") throw new Error("HP-97 must be classic");
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const keyCount = model.rows.reduce(
      (n, r) => n + r.filter((k) => k.kind !== "gap").length,
      0,
    );
    expect(container.querySelectorAll("button")).toHaveLength(keyCount);
    const root = keyboardRoot(container);
    const children = Array.from(root.children) as HTMLElement[];
    let i = 0;
    model.rows.forEach((row, ri) => {
      let units = 0;
      for (let k = 0; k < row.length; k++, i++) {
        const m = /span (\d+)/.exec(children[i].style.gridColumn);
        if (!m) throw new Error(`cell ${i} has no span`);
        units += Number(m[1]);
      }
      // every row fills 12 columns EXCEPT the last: its 12th column is owned by
      // the double-height `+` spanning down from the row above
      expect(units).toBe(ri === model.rows.length - 1 ? 11 : 12);
    });
  });
});

describe("shifted-classic row fill (HP-25 5-over-4 dual pitch)", () => {
  it("every HP-25 row fills the lcm(5,4)=20 subgrid exactly", () => {
    const model = MODELS["HP-25"];
    if (model.family !== "classic") throw new Error("HP-25 must be classic");
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    let i = 0;
    for (const row of model.rows) {
      let units = 0;
      for (let k = 0; k < row.length; k++, i++) {
        const m = /span (\d+)/.exec(buttons[i].style.gridColumn);
        if (!m) throw new Error(`key ${i} has no span`);
        units += Number(m[1]);
      }
      expect(units).toBe(20);
    }
  });
});

describe("ClassicKeyboard (HP-35) — dual-pitch subcolumn grid", () => {
  const model = MODELS["HP-35"];
  if (model.family !== "classic") throw new Error("HP-35 must be classic");

  it("uses lcm(5,4)=20 subcolumns: function keys span 4, wide digit keys span 5, ENTER↑ spans 8", () => {
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const root = keyboardRoot(container);
    expect(styleAspectOf(root)).toBeCloseTo(model.geometry.aspect, 5);
    // 5-key function rows over 4-key digit rows → lcm(5,4)=20 subcolumns.
    expect(root.style.gridTemplateColumns).toBe("repeat(20, minmax(0, 1fr))");
    const keyCount = model.rows.reduce((n, r) => n + r.length, 0);
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    expect(buttons).toHaveLength(keyCount);

    const byLabel = (label: string) => {
      const b = buttons.find((x) => x.getAttribute("aria-label") === label);
      if (!b) throw new Error(`no ${label} key rendered`);
      return b;
    };
    // placement is now explicit (START / span N); assert the column SPAN
    expect(byLabel("ENTER↑").style.gridColumn).toMatch(/ span 8$/); // flex-2 in a 5-unit row
    expect(byLabel("log").style.gridColumn).toMatch(/ span 4$/); // 5-unit function row
    expect(byLabel("7").style.gridColumn).toMatch(/ span 5$/); // 4-unit digit row (wider!)
    // a normal (non-tall) key spans exactly one row
    expect(byLabel("7").style.gridRow).toMatch(/ span 1$/);
  });

  it("HP-97: the + key is double-height (spans two rows) and PRINT x is double-width", () => {
    const hp97 = MODELS["HP-97"];
    if (hp97.family !== "classic") throw new Error("HP-97 must be classic");
    const { container } = render(
      <ClassicKeyboard rows={hp97.rows} geometry={hp97.geometry} onPress={noop} />,
    );
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    const byLabel = (label: string) => {
      const b = buttons.find((x) => x.getAttribute("aria-label") === label);
      if (!b) throw new Error(`no ${label} key rendered`);
      return b;
    };
    expect(byLabel("+").style.gridRow).toMatch(/ span 2$/); // tall + (R5–R6)
    expect(byLabel("PRINT x").style.gridColumn).toMatch(/ span 2$/); // wide PRINT x
    // DSP still renders (it flows into the column left of the tall +)
    expect(byLabel("DSP")).toBeTruthy();
  });

  it("every row fills its subgrid exactly — no auto-flow scrambling", () => {
    // Regression guard: a plain 5-col grid let the 4-key digit rows under-fill
    // and pulled the next row's first key up a row (caught visually).
    const { container } = render(
      <ClassicKeyboard rows={model.rows} geometry={model.geometry} onPress={noop} />,
    );
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    let i = 0;
    for (const row of model.rows) {
      let units = 0;
      for (let k = 0; k < row.length; k++, i++) {
        const m = /span (\d+)/.exec(buttons[i].style.gridColumn);
        if (!m) throw new Error(`key ${i} has no span`);
        units += Number(m[1]);
      }
      expect(units).toBe(20); // each row sums to the full subgrid width
    }
  });
});

describe("RplKeyboard (HP-49G/50g) — 10-row grid with cursor-diamond gaps", () => {
  const model = MODELS["HP-49G"];
  if (model.family !== "rpl") throw new Error("HP-49G must be rpl");

  it("gap cells consume grid slots but render no button; rows still fill exactly", () => {
    const { container } = render(
      <RplKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const keyCount = model.rows.reduce(
      (n, r) => n + r.filter((k) => k.kind !== "gap").length,
      0,
    );
    expect(container.querySelectorAll("button")).toHaveLength(keyCount);
    // every child (buttons AND gap spacers) spans; each row sums to subcols
    const root = keyboardRoot(container);
    expect(root.style.gridTemplateColumns).toBe("repeat(30, minmax(0, 1fr))"); // lcm(6,5)
    const children = Array.from(root.children) as HTMLElement[];
    let i = 0;
    for (const row of model.rows) {
      let units = 0;
      for (let k = 0; k < row.length; k++, i++) {
        const m = /span (\d+)/.exec(children[i].style.gridColumn);
        if (!m) throw new Error(`cell ${i} has no span`);
        units += Number(m[1]);
      }
      expect(units).toBe(30);
    }
  });

  it("ENTER is a normal-width bottom-right key (unlike the 48-series)", () => {
    const { container } = render(
      <RplKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const enter = Array.from(container.querySelectorAll<HTMLElement>("button")).find(
      (b) => b.getAttribute("aria-label") === "ENTER",
    );
    expect(enter?.style.gridColumn).toBe("span 6 / span 6"); // w1 in a 5-unit row
  });
});

describe("per-model shift palette (MachineUnit override)", () => {
  it("HP-48SX re-themes the RAW --hp-shift-ls/rs at the bezel root (@theme inline)", async () => {
    const { MachineUnit } = await import("@/components/calculator/MachineUnit");
    const model = MODELS["HP-48SX"];
    const zero = bn(0);
    const state = {
      T: zero, Z: zero, Y: zero, X: zero, lastX: zero, entry: null, dec: 2,
      prefix: "none" as const, latex: "0", hist: [], rpl: [],
    };
    const stub = {
      state,
      prefix: "none" as const,
      press: noop,
      arm: noop,
      recall: noop,
      fmt: (n: Value) => n.toFixed(2),
      renderLatex: (tex: string) => ({ __html: tex }),
    };
    const { container } = render(
      <MachineUnit
        model={model}
        rpn={{ ...stub, soft: noop, engine: createRpn(), restore: noop }}
        rpl={{ ...stub, soft: noop, runLine: noop, engine: createRpl(), restore: noop }}
        lcd={<div />}
      />,
    );
    const machine = container.querySelector<HTMLElement>('[data-slot="machine"]');
    expect(machine?.style.getPropertyValue("--hp-shift-ls")).toBe("var(--hp-shift-ls-sx)");
    expect(machine?.style.getPropertyValue("--hp-shift-rs")).toBe("var(--hp-shift-rs-sx)");
    // the 48G keeps the family default — no inline override
    const g = render(
      <MachineUnit
        model={MODELS["HP-48G"]}
        rpn={{ ...stub, soft: noop, engine: createRpn(), restore: noop }}
        rpl={{ ...stub, soft: noop, runLine: noop, engine: createRpl(), restore: noop }}
        lcd={<div />}
      />,
    );
    const gm = g.container.querySelector<HTMLElement>('[data-slot="machine"]');
    expect(gm?.style.getPropertyValue("--hp-shift-ls")).toBe("");
  });
});

describe("RplKeyboard (HP-48G) — dual-pitch subcolumn grid", () => {
  const model = MODELS["HP-48G"];
  if (model.family !== "rpl") throw new Error("HP-48G must be rpl");

  it("uses lcm(6,5)=30 subcolumns: function keys span 5, digits span 6, ENTER spans 10", () => {
    const { container } = render(
      <RplKeyboard
        rows={model.rows}
        geometry={model.geometry}
        prefix="none"
        onArm={noop}
        onPress={noop}
      />,
    );
    const root = keyboardRoot(container);
    expect(styleAspectOf(root)).toBeCloseTo(model.geometry.aspect, 5);
    expect(root.style.gridTemplateColumns).toBe("repeat(30, minmax(0, 1fr))");
    expect(root.style.gridTemplateRows).toBe(`repeat(${model.rows.length}, minmax(0, 1fr))`);

    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    const keyCount = model.rows.reduce((n, r) => n + r.length, 0);
    expect(buttons).toHaveLength(keyCount);

    const byLabel = (label: string) => {
      const b = buttons.find((x) => x.getAttribute("aria-label") === label);
      if (!b) throw new Error(`no ${label} key rendered`);
      return b;
    };
    expect(byLabel("ENTER").style.gridColumn).toBe("span 10 / span 10"); // w2 in a 6-unit row
    expect(byLabel("MTH").style.gridColumn).toBe("span 5 / span 5"); // 6-unit function row
    expect(byLabel("7").style.gridColumn).toBe("span 6 / span 6"); // 5-unit digit row (wider!)
  });
});
