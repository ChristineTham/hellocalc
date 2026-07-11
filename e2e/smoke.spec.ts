import { test, expect, type Page } from "@playwright/test";

/** Select a model via the grouped model picker. */
async function selectModel(page: Page, label: string) {
  await page.getByRole("button", { name: "Select calculator model" }).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test.describe("hellocalc — smoke", () => {
  test("loads the faceplate shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Hello Calc" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Select calculator model" })).toBeVisible();
    await expect(page.getByRole("button", { name: "ENTER", exact: true })).toBeVisible();
  });

  test("performs RPN arithmetic: 2 ENTER 3 + = 5.00", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    // scope to the visible mini subtree — the hidden line subtree echoes values too
    await expect(
      page.locator('[data-lcd-mode]:visible').getByText("5.00").first(),
    ).toBeVisible();
  });

  test("Phase 1 on the live HP-35: exact 0.1+0.2, STO/RCL, EEX, history recall", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-35");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');

    // exact decimal arithmetic on the BigNumber tower (FR-NUM-1)
    await key("·");
    await key("1");
    await key("ENTER↑");
    await key("·");
    await key("2");
    await key("+");
    await expect(glass().getByText("0.30").first()).toBeVisible();

    // STO / RCL round-trip on the single memory register
    await key("7");
    await key("STO");
    await key("CLx");
    await key("RCL");
    await expect(glass().getByText("7.00").first()).toBeVisible();

    // EEX keys a real exponent: 5 EEX 3 ENTER = 5000
    await key("5");
    await key("EEX");
    await key("3");
    await key("ENTER↑");
    await expect(glass().getByText("5000.00").first()).toBeVisible();

    // history recall: the tape's "+" line (0.30) pushes its exact value back
    await page.getByRole("button", { name: "Recall 0.30" }).first().click();
    await expect(glass().getByText("0.30").first()).toBeVisible();
  });

  test("Phase 2 on the live HP-45: gold plane, statistics, register arithmetic", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-45");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');

    // gold sequence: f then x² dispatches its promoted √x — 9 f √x → 3
    await key("9");
    await key("f");
    await key("x²");
    await expect(glass().getByText("3.00").first()).toBeVisible();

    // statistics: 2 Σ+ 4 Σ+ 6 Σ+ then f R↓ (x̄,s) → mean 4 in X
    for (const seq of ["2", "Σ+", "4", "Σ+", "6", "Σ+"]) await key(seq);
    await key("f");
    await key("R↓");
    await expect(glass().getByText("4.00").first()).toBeVisible();

    // register arithmetic: 10 STO 1, 5 STO + 1, RCL 1 → 15; the Registers
    // note surfaces R1
    for (const seq of ["1", "0", "STO", "1"]) await key(seq);
    for (const seq of ["5", "STO", "+", "1"]) await key(seq);
    await key("RCL");
    await key("1");
    await expect(glass().getByText("15.00").first()).toBeVisible();
    await expect(
      page.locator('[data-slot="regs-note"]:visible').first(),
    ).toContainText("R1");
  });

  test("Phase 3 on the live HP-65: record a program, run it from a user key", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-65");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();

    // the program note is on the desk for programmable models
    const note = page.locator('[data-slot="prgm-note"]:visible').first();
    await expect(note).toBeVisible();

    // flip to W/PRGM (the 65's slide switch) and key: LBL A 2 × RTN
    await note.getByRole("button", { name: "Switch to W/PRGM mode" }).click();
    for (const seq of ["LBL", "A", "2", "×", "RTN"]) await key(seq);
    await expect(note).toContainText("LBL");
    await note.getByRole("button", { name: "Switch to RUN mode" }).click();

    // 6, then the A user key runs the program → 12.00
    await key("6");
    await key("ENTER↑");
    await key("A");
    await expect(
      page.locator('[data-lcd-mode]:visible').getByText("12.00").first(),
    ).toBeVisible();
  });

  test("Phase 12 on the live HP-28C: STACK menu softkeys, algebraic STO/EVAL, retention", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-28C");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');

    // red-shift G opens the STACK menu — its labels take over the soft keys
    await key("7");
    await key("ENTER");
    await key("◄"); // the single red shift
    await key("G"); // → STACK
    const soft1 = page.getByRole("button", { name: "menu" }).first();
    await expect(soft1).toContainText("DUP");
    await soft1.click(); // softkey DUP duplicates level 1
    await expect(glass().getByText("2:").first()).toBeVisible();

    // algebraic entry via the ◆ delimiter key: 'X+1', then 4 'X' STO, EVAL → 5
    for (const k of ["◆", "X", "+", "1", "◆"]) await key(k);
    await key("ENTER");
    await key("4");
    await key("ENTER");
    for (const k of ["◆", "X", "◆"]) await key(k);
    await key("ENTER");
    await key("STO");
    await key("EVAL");
    await expect(glass().getByText("5", { exact: true }).first()).toBeVisible();

    // model switch and back: the RPL object stack is retained (FR-STATE-2)
    await selectModel(page, "HP-12C");
    await selectModel(page, "HP-28C");
    await expect(glass().getByText("5", { exact: true }).first()).toBeVisible();
  });

  test("Phase 13 on the live HP-28C: UNITS catalog builds, adds, and rejects quantities", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-28C");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');
    const soft = (i: number) => page.getByRole("button", { name: "menu" }).nth(i).click();

    // red-shift R opens the UNITS catalog; LENG lists length units
    await key("◄");
    await key("R"); // → UNITS
    await expect(page.getByRole("button", { name: "menu" }).first()).toContainText("LENG");
    await soft(0); // LENG
    // 5 cm + 2 in → 10.08 cm, exactly (FR-UNIT-1)
    await key("5");
    await soft(1); // cm attaches → 5_cm
    await expect(glass().getByText("5_cm").first()).toBeVisible();
    await key("2");
    await soft(5); // in attaches → 2_in
    await key("+");
    await expect(glass().getByText("10.08_cm").first()).toBeVisible();

    // dimensionally incompatible add reports an error (FR-UNIT-2)
    await key("3");
    await key("ENTER");
    await key("◄");
    await key("R");
    await soft(3); // TIME
    await soft(0); // s → 3_s
    await key("+"); // 10.08_cm + 3_s
    await expect(glass().getByText("Error").first()).toBeVisible();
  });

  test("Phase 14 on the live HP-28C: d/dx lazy-loads the CAS and differentiates", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-28C");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');

    // 'X^2' — the ^ rides the red shift of ×
    for (const k of ["◆", "X"]) await key(k);
    await key("◄");
    await key("×"); // → ^ (types into the algebraic)
    await key("2");
    await key("◆");
    await key("ENTER");
    // 'X' then shift-6 → d/dx (first press lazy-loads the nerdamer chunk)
    for (const k of ["◆", "X", "◆"]) await key(k);
    await key("ENTER");
    await key("◄");
    await key("6"); // → d/dx
    await expect(glass().getByText("'2*X'").first()).toBeVisible({ timeout: 15000 });
  });

  test("Phase 15 on the live HP-28S: MEMORY menu creates and enters directories", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-28S");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');
    const soft = (i: number) => page.getByRole("button", { name: "menu" }).nth(i).click();

    // 'D1' CRDIR via the MEMORY menu (red-shift I)
    for (const k of ["◆", "D", "1", "◆"]) await key(k);
    await key("ENTER");
    await key("◄");
    await key("I"); // → MEMORY
    await expect(page.getByRole("button", { name: "menu" }).first()).toContainText("MEM");
    await soft(5); // CRDIR
    // typing the bare name enters the directory
    await key("D");
    await key("1");
    await key("ENTER");
    await key("◄");
    await key("I");
    await soft(3); // PATH
    await expect(glass().getByText("{ 'HOME' 'D1' }").first()).toBeVisible();
  });

  test("Phase 16 on the live HP-42S: STAT→CFIT menus fit a line; ASSIGN→CUSTOM", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-42S");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');

    // y = 3x + 2 through (1,5) (2,8) (3,11): y ENTER x Σ+
    for (const [x, y] of [[1, 5], [2, 8], [3, 11]] as const) {
      for (const d of String(y)) await key(d);
      await key("ENTER");
      for (const d of String(x)) await key(d);
      await key("Σ+");
    }
    // f ÷ opens STAT; the XEQ-position key is softkey 6 (CFIT), √x is SLOPE
    await key("f");
    await key("÷"); // → STAT
    await expect(glass().locator('[data-slot="menu-row"]').first()).toContainText("CFIT");
    await key("XEQ"); // softkey 6 → CFIT
    await key("√x"); // softkey 3 → SLOPE
    await expect(glass().getByText("3.00").first()).toBeVisible();
    await key("EXIT");
    await key("EXIT");
    await key("EXIT");

    // ASSIGN SIN to the CUSTOM row and run it from there
    await key("f");
    await key("1"); // ASSIGN
    await key("SIN");
    await key("f");
    await key("2"); // CUSTOM
    await expect(glass().locator('[data-slot="menu-row"]').first()).toContainText("SIN");
    for (const d of "90") await key(d);
    await key("Σ+"); // softkey 1 → SIN (DEG)
    await expect(glass().getByText("1.00").first()).toBeVisible();
  });

  test("Phase 17 on the live HP-48SX: plot SIN(X) via STEQ/DRAW; EquationWriter entry", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-48SX");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');
    const soft = (i: number) => page.getByRole("button", { name: "menu" }).nth(i).click();
    // the 48SX prints ◄ three times (cursor/backspace/shift) — target by kind
    const ls = () => page.locator('button[data-kind="ls"]').click();

    // build 'SIN(X)' — tick opens the algebraic, α+1/x types X, ENTER auto-closes
    await key("′");
    await key("SIN");
    await ls(); // left shift
    await key("÷"); // → ( )
    await key("α");
    await key("1/x"); // → X
    await key("ENTER");
    // SOLVE menu (left-shift 7) → STEQ stores the equation
    await ls();
    await key("7"); // → SOLVE
    await soft(0); // STEQ
    // PLOT menu (left-shift 8) → DRAW samples and the panel renders
    await ls();
    await key("8"); // → PLOT
    await soft(5); // DRAW
    await expect(glass().locator('[data-slot="plot-panel"] svg').first()).toBeVisible({
      timeout: 15000,
    });
    await key("ON"); // ATTN clears the picture
    await expect(glass().locator('[data-slot="plot-panel"]')).toHaveCount(0);

    // EquationWriter-lite: left-shift ENTER opens algebraic entry
    await ls();
    await key("ENTER"); // → EQUATION
    await key("α");
    await key("1/x"); // X
    await key("ENTER");
    await expect(glass().getByText("'X'").first()).toBeVisible();
  });

  test("Phase 18 on the live HP-48G: STAT app scatter-plots ΣDAT (FR-PLOT-3)", async ({
    page,
  }) => {
    await page.goto("/");
    await selectModel(page, "HP-48G");
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true }).click();
    const glass = () => page.locator('[data-lcd-mode]:visible');
    const soft = (i: number) => page.getByRole("button", { name: "menu" }).nth(i).click();
    const rs = () => page.locator('button[data-kind="rs"]').click();

    // three data pairs through the STAT application (right-shift 5)
    for (const [x, y] of [[1, 2], [2, 4], [3, 6]] as const) {
      await rs();
      await key("+"); // → { }
      await key(String(x));
      await key("SPC");
      await key(String(y));
      await key("ENTER");
      await rs();
      await key("5"); // → STAT app
      await soft(0); // Σ+
    }
    // autoscale + scatter: SCLΣ/DRWΣ live on the PLOT menu's later pages —
    // reach the STAT roster's plot page instead (NXT ×5 → SCATRPLOT)
    await rs();
    await key("5");
    for (let i = 0; i < 5; i++) await key("NXT");
    await soft(0); // SCATRPLOT
    await expect(glass().locator('[data-slot="plot-panel"] svg').first()).toBeVisible({
      timeout: 15000,
    });
    await key("ON");
    await expect(glass().locator('[data-slot="plot-panel"]')).toHaveCount(0);
  });

  test("persistence: the session survives a reload (FR-STATE-1)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "7", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    // autosave is effect-driven; the write lands within a frame of the press
    await page.waitForTimeout(200);
    await page.reload();
    await expect(
      page.locator('[data-lcd-mode]:visible').getByText("7.00").first(),
    ).toBeVisible();
    // the stack note shows the restored Y too (7 ENTER left X=Y=7)
    await expect(page.locator('[data-slot="stack-note"]:visible').first()).toContainText(
      "7.00",
    );
  });

  test("model picker groups models, searches, and disables unimplemented ones", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Select calculator model" }).click();
    await expect(page.getByText("Voyager", { exact: true })).toBeVisible();
    // a planned-but-unimplemented model is shown disabled (native = Phase 23)
    await expect(page.getByRole("option", { name: "Native mode", exact: true })).toBeDisabled();
    // search narrows the grouped list
    await page.getByRole("textbox", { name: "Search models" }).fill("48");
    await expect(page.getByRole("option", { name: "HP-48G", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "HP-35", exact: true })).toHaveCount(0);
  });

  test("switches models, retaining engine state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "7", exact: true }).click();
    await selectModel(page, "HP-15C");
    // HP-15C is a distinct model with its own scientific keys (e.g. SIN)
    await expect(page.getByRole("button", { name: "SIN", exact: true })).toBeVisible();
    // the keyed 7 survived the switch (shared engine)
    await expect(page.getByText("7.00").first()).toBeVisible();
    // the shell re-stamped the new model's static aspect class (§3.1)
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-aspect", "landscape");
  });

  test("device matrix: the machine is ONE integrated unit (§14)", async ({ page }) => {
    const machine = () => page.locator('[data-slot="machine"]');
    const lcdSlot = () => page.locator('[data-slot="machine-lcd"]');
    const kbd = () => page.locator('[data-slot="keyboard"]');
    const boxOf = async (loc: ReturnType<typeof machine>) => {
      const b = await loc.boundingBox();
      if (!b) throw new Error("missing box");
      return b;
    };

    // phone 393×852 — `stack`: nameplate → LCD → keys inside one bezel
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-template", "stack");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-machine", "stack");
    let m = await boxOf(machine());
    let lcd = await boxOf(lcdSlot());
    let k = await boxOf(kbd());
    expect(m.width).toBeGreaterThan(340); // machine fills the phone width
    // LCD and keyboard both INSIDE the bezel; LCD above the keys; no clipping
    expect(lcd.x).toBeGreaterThanOrEqual(m.x - 1);
    expect(lcd.x + lcd.width).toBeLessThanOrEqual(m.x + m.width + 1);
    expect(k.y + k.height).toBeLessThanOrEqual(m.y + m.height + 1);
    expect(m.y + m.height).toBeLessThanOrEqual(852 + 1);
    expect(lcd.y + lcd.height).toBeLessThanOrEqual(k.y + 1);

    // desktop 1366×800, portrait model (48G) — `desktop`: machine right of the
    // sidebar, paper column to the machine's RIGHT — and the machine itself is
    // SIDE-BY-SIDE (§14.1 rev 3): LCD left of the full-height keyboard
    await page.setViewportSize({ width: 1366, height: 800 });
    await selectModel(page, "HP-48G");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-template", "desktop");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-machine", "side");
    m = await boxOf(machine());
    const sidebar = await boxOf(page.locator('[data-region="sidebar"]'));
    expect(m.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width - 1);
    lcd = await boxOf(lcdSlot());
    k = await boxOf(kbd());
    expect(lcd.x + lcd.width).toBeLessThanOrEqual(k.x + 1); // glass beside the keys
    expect(k.x + k.width).toBeLessThanOrEqual(m.x + m.width + 1); // same bezel
    // §14 rev 5 — one home each: VARIABLES in the bay below the glass, the
    // history tape in the page's right column (machine takes full height)
    await expect(
      page.locator('[data-slot="machine-aux"] [data-slot="vars-note"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="machine-aux"] [data-slot="history-tape"]'),
    ).toBeHidden();
    const tallAux = await boxOf(page.locator('[data-region="aux"]'));
    expect(tallAux.x).toBeGreaterThanOrEqual(m.x + m.width - 1); // tape right of machine
    await expect(
      page.locator('[data-region="aux"] [data-slot="history-tape"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-region="aux"] [data-slot="vars-note"]'),
    ).toBeHidden();

    // portrait classic (HP-35): keeps the LCD-above-keys look on desktop
    await selectModel(page, "HP-35");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-machine", "stack");
    m = await boxOf(machine());
    lcd = await boxOf(lcdSlot());
    k = await boxOf(kbd());
    expect(lcd.y + lcd.height).toBeLessThanOrEqual(k.y + 1); // classic anatomy

    // same viewport, landscape model (12C): the classic anatomy — LCD above
    // keys, paper column to the machine's RIGHT
    await selectModel(page, "HP-12C");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-template", "desktop");
    m = await boxOf(machine());
    lcd = await boxOf(lcdSlot());
    k = await boxOf(kbd());
    expect(lcd.y + lcd.height).toBeLessThanOrEqual(k.y + 1);
    expect(k.y + k.height).toBeLessThanOrEqual(m.y + m.height + 1);
    const aux = await boxOf(page.locator('[data-region="aux"]'));
    expect(aux.x).toBeGreaterThanOrEqual(m.x + m.width - 1);
  });

  test("device matrix extended: tablet paper-left, side machine, large desktop (§14)", async ({
    page,
  }) => {
    const machine = () => page.locator('[data-slot="machine"]');

    // tablet-portrait 834×1112, portrait model (48G) — `tablet`: paper LEFT
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto("/");
    await selectModel(page, "HP-48G");
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-template", "tablet");
    const mBox = await machine().boundingBox();
    const aux = await page.locator('[data-region="aux"]').boundingBox();
    if (!mBox || !aux) throw new Error("missing tablet boxes");
    expect(aux.x + aux.width).toBeLessThanOrEqual(mBox.x + 1); // paper column left of machine

    // short viewport 852×393 — `machine-side`: ONE bezel, LCD left of keys
    await page.setViewportSize({ width: 852, height: 393 });
    await expect(page.locator("main.calc-shell")).toHaveAttribute(
      "data-template",
      "machine-side",
    );
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-machine", "side");
    const sideM = await machine().boundingBox();
    const lcd = await page.locator('[data-slot="machine-lcd"]').boundingBox();
    const k = await page.locator('[data-slot="keyboard"]').boundingBox();
    if (!sideM || !lcd || !k) throw new Error("missing side boxes");
    expect(lcd.x + lcd.width).toBeLessThanOrEqual(k.x + 1); // side by side
    expect(k.x + k.width).toBeLessThanOrEqual(sideM.x + sideM.width + 1); // same bezel

    // large desktop 1680×950, HP-12C — TVM register strip pinned in aux (§12.5)
    await page.setViewportSize({ width: 1680, height: 950 });
    await selectModel(page, "HP-12C");
    const strip = page.locator('[data-region="aux"] [data-slot="tvm-strip"]');
    await expect(strip).toBeVisible();
    for (const key of ["PV", "PMT", "FV"]) {
      await expect(strip.getByText(key, { exact: true })).toBeVisible();
    }
  });

  test("width-tier boundaries: JS labels match the CSS-active template (§10 parity)", async ({
    page,
  }) => {
    await page.goto("/"); // HP-12C (landscape) active
    const cases: ReadonlyArray<readonly [number, string]> = [
      [639, "stack"],
      [640, "stack"],
      [767, "stack"],
      [768, "tablet-wide"],
      [1023, "tablet-wide"],
      [1024, "desktop"],
      [1279, "desktop"],
      [1280, "desktop"],
      [1535, "desktop"],
      [1536, "desktop"],
    ];
    for (const [width, id] of cases) {
      await page.setViewportSize({ width, height: 900 }); // tall: no short override
      await expect(page.locator("main.calc-shell")).toHaveAttribute("data-template", id);
      // geometry cross-check at the stack↔md boundary: inline aux appears at 768
      if (width === 767) {
        await expect(page.locator('[data-region="aux"]')).toBeHidden();
      }
      if (width === 768) {
        await expect(page.locator('[data-region="aux"]')).toBeVisible();
      }
    }
  });

  test("HP-35 classic faceplate does RPN arithmetic", async ({ page }) => {
    await page.goto("/");
    await selectModel(page, "HP-35");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER↑", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(
      page.locator('[data-lcd-mode]:visible').getByText("5.00").first(),
    ).toBeVisible();
  });

  test("HP-48G RPL faceplate pushes and adds on the dynamic stack", async ({ page }) => {
    await page.goto("/");
    await selectModel(page, "HP-48G");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    // the RPL machines power on in STD display (P12) — no fixed decimals
    await expect(
      page.locator('[data-lcd-mode]:visible').getByText("5", { exact: true }).first(),
    ).toBeVisible();
  });

  test("typing & polish: physical keyboard, prefix plane, cheat-sheet (§12.2/§12.3)", async ({
    page,
  }) => {
    await page.goto("/");
    // data-template is stamped post-mount → hydration + effects (hotkeys) ready
    await page.waitForSelector("main.calc-shell[data-template]");

    // physical-keyboard arithmetic: keystrokes press the faceplate's own keys
    await page.keyboard.type("2");
    await page.keyboard.press("Enter");
    await page.keyboard.type("3");
    await page.keyboard.press("+");
    await expect(
      page.locator('[data-lcd-mode]:visible').getByText("5.00").first(),
    ).toBeVisible();

    // typing `f` arms the gold prefix and DIMS the primary plane (§12.3)
    const primary7 = page
      .locator('[data-slot="machine-kbd"] button[aria-label="7"] span')
      .nth(1);
    await page.keyboard.press("f");
    await expect
      .poll(() => primary7.evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeLessThan(0.9);
    // Escape disarms — the plane returns
    await page.keyboard.press("Escape");
    await expect
      .poll(() => primary7.evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBe(1);

    // `?` opens the shortcut cheat-sheet
    await page.keyboard.press("?");
    await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toHaveCount(0);
  });

  test("keyboard blocks keep their real aspect ratio (Priority 1 regression guard)", async ({ page }) => {
    // Expected block aspects derived from the key data — the Vitest oracle in
    // src/__tests__/keyboardGeometry.test.ts pins the same values (±0.02).
    // Guards the old RPL flex layout bug that stretched 48G keys ~1.9× wide.
    const EXPECTED: Record<string, number> = {
      "HP-11C": 2.887,
      "HP-12C": 2.887,
      "HP-15C": 2.887,
      "HP-16C": 2.887,
      "HP-35": 0.703,
      "HP-45": 0.703,
      "HP-65": 0.703,
      "HP-25": 0.805,
      "HP-67": 0.703,
      "HP-41C/CV": 0.624,
      "HP-41CX": 0.624,
      "HP-48SX": 0.722,
      "HP-48G": 0.722,
      "HP-49G": 0.649,
      "HP-50g": 0.649,
      "HP-42S": 0.97,
      "HP-35s": 0.847,
      "HP Prime": 0.751,
      "HP-97": 2.29,
      "HP-28C": 2.038,
      "HP-28S": 2.038,
    };
    await page.goto("/");
    for (const [label, aspect] of Object.entries(EXPECTED)) {
      await selectModel(page, label);
      const box = await page.locator('[data-slot="keyboard"]').boundingBox();
      if (!box) throw new Error(`no keyboard box for ${label}`);
      const ratio = box.width / box.height;
      expect(Math.abs(ratio - aspect) / aspect).toBeLessThan(0.02);
    }
  });

  test("small screens: keyboard fits, LCD fills the estate, history is a drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto("/");
    // no horizontal page overflow
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    expect(noOverflow).toBe(true);
    // the LCD slot is tall enough on a phone → container default is MINI
    // ("LCD takes most of the remaining estate"); user can force the
    // single-line state and back (§5.3 data-lcd-force)
    await expect(page.locator('[data-lcd-mode="mini"]')).toBeVisible();
    await page.getByRole("button", { name: "Collapse display" }).click();
    await expect(page.locator('[data-lcd-mode="line"]')).toBeVisible();
    await expect(page.locator('[data-lcd-mode="mini"]')).toBeHidden();
    await expect(page.locator(".lcd-panel")).toHaveAttribute("data-lcd-force", "line");
    await page.getByRole("button", { name: "Expand display" }).click();
    await expect(page.locator('[data-lcd-mode="mini"]')).toBeVisible();
    // each paper panel has its OWN toggle (§14.3) → bottom sheets, Escape closes
    await expect(page.getByRole("button", { name: "Toggle history tape" })).toBeVisible();
    await page.getByRole("button", { name: "Toggle stack" }).click();
    const sheet = page.getByRole("dialog", { name: "Stack", exact: true });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute("data-side", "bottom");
    await expect(sheet.locator('[data-slot="stack-note"]')).toBeVisible();
    // toBeVisible ignores opacity — assert the enter transition actually
    // completes (Base UI removes data-starting-style via rAF; a regression
    // here leaves the sheet permanently invisible at opacity 0)
    await expect
      .poll(async () =>
        sheet.evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBe(1);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
  });

  test("chrome: left nav sheet below lg; persistent sidebar at lg+ (§12.4)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const nav = page.getByRole("dialog", { name: "Navigation" });
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute("data-side", "left");
    // FR-STATE-4 entry points are surfaced
    await expect(nav.getByRole("button", { name: /Import state/ })).toBeVisible();
    await expect(nav.getByRole("button", { name: /Export state/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(nav).toHaveCount(0);

    // lg+: hamburger gone; the persistent sidebar hosts the same nav
    await page.setViewportSize({ width: 1366, height: 800 });
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
    const sidebar = page.locator('[data-region="sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("button", { name: /Export state/ })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "About" })).toBeVisible();
  });

  test("KaTeX hero renders a .katex node in the mini LCD (AGENTS §6)", async ({ page }) => {
    await page.goto("/"); // desktop default: lcd slot tall → mini
    await expect(page.locator('[data-lcd-mode="mini"]')).toBeVisible();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.locator('[data-lcd-mode="mini"] .katex').first()).toBeVisible();
  });
});
