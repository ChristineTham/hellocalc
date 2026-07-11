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
    await expect(page.locator('[data-lcd-mode="mini"]').getByText("5.00").first()).toBeVisible();
  });

  test("model picker groups models, searches, and disables unimplemented ones", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Select calculator model" }).click();
    await expect(page.getByText("Voyager", { exact: true })).toBeVisible();
    // a planned-but-unimplemented model is shown disabled
    await expect(page.getByRole("option", { name: "HP-16C", exact: true })).toBeDisabled();
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

  test("device matrix: keyboard placement per template (§3.3, geometry-first)", async ({
    page,
  }) => {
    const kbd = () => page.locator('[data-slot="keyboard"]');

    // phone 393×852 — `stack`: keyboard owns the full-width bottom band
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    let box = await kbd().boundingBox();
    if (!box) throw new Error("no keyboard box (phone)");
    expect(box.width).toBeGreaterThan(340); // fills the width (minus bezel chrome)
    expect(box.y + box.height).toBeGreaterThan(852 - 80); // anchored at the bottom
    // …and NOT clipped: key min-content must never outgrow the band (§13.5 —
    // fixed-px legends once pushed the Voyager grid past the viewport)
    expect(box.y + box.height).toBeLessThanOrEqual(852 + 1);
    await expect(page.locator("main.calc-shell")).toHaveAttribute("data-template", "stack");

    // desktop 1366×800, portrait model (HP-48G) — `desktop-wide`: right column
    await page.setViewportSize({ width: 1366, height: 800 });
    await selectModel(page, "HP-48G");
    await expect(page.locator("main.calc-shell")).toHaveAttribute(
      "data-template",
      "desktop-wide",
    );
    box = await kbd().boundingBox();
    if (!box) throw new Error("no keyboard box (desktop 48G)");
    expect(box.x).toBeGreaterThan(1366 / 2); // keyboard on the right side
    // LCD sits left of the keyboard (§12.1 diagonal: read left, act right)
    const lcd = await page.locator('[data-region="lcd"]').boundingBox();
    if (!lcd) throw new Error("no lcd box");
    expect(lcd.x + lcd.width).toBeLessThanOrEqual(box.x + 1);

    // same viewport, landscape model (HP-12C) — `desktop-landscape`: bottom band
    await selectModel(page, "HP-12C");
    await expect(page.locator("main.calc-shell")).toHaveAttribute(
      "data-template",
      "desktop-landscape",
    );
    box = await kbd().boundingBox();
    if (!box) throw new Error("no keyboard box (desktop 12C)");
    expect(box.y + box.height).toBeGreaterThan(800 - 80); // anchored at the bottom
  });

  test("device matrix extended: tablet corner, phone landscape, large desktop (§10)", async ({
    page,
  }) => {
    const kbd = () => page.locator('[data-slot="keyboard"]');

    // tablet-portrait 834×1112, portrait model (48G) — `tablet-portrait-corner`:
    // LCD top, aux bottom-LEFT, keyboard bottom-RIGHT (§12.1 diagonal)
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto("/");
    await selectModel(page, "HP-48G");
    await expect(page.locator("main.calc-shell")).toHaveAttribute(
      "data-template",
      "tablet-portrait-corner",
    );
    const kbdBox = await kbd().boundingBox();
    if (!kbdBox) throw new Error("no keyboard box (tablet corner)");
    expect(kbdBox.x).toBeGreaterThan(834 / 2); // bottom-right corner
    expect(kbdBox.y).toBeGreaterThan(1112 / 3);
    const aux = await page.locator('[data-region="aux"]').boundingBox();
    if (!aux) throw new Error("no aux box (tablet corner)");
    expect(aux.x + aux.width).toBeLessThanOrEqual(kbdBox.x + 1); // aux left of keyboard

    // phone-landscape 852×393 — the short-viewport override: keyboard right-side
    await page.setViewportSize({ width: 852, height: 393 });
    await expect(page.locator("main.calc-shell")).toHaveAttribute(
      "data-template",
      "phone-landscape",
    );
    const plBox = await kbd().boundingBox();
    if (!plBox) throw new Error("no keyboard box (phone landscape)");
    expect(plBox.x).toBeGreaterThan(852 / 2);

    // large desktop 1680×950, HP-12C — TVM register strip pinned in aux (§12.5)
    await page.setViewportSize({ width: 1680, height: 950 });
    await selectModel(page, "HP-12C");
    const strip = page.locator('[data-slot="tvm-strip"]');
    await expect(strip).toBeVisible();
    for (const k of ["PV", "PMT", "FV"]) {
      await expect(strip.getByText(k, { exact: true })).toBeVisible();
    }
  });

  test("width-tier boundaries: JS labels match the CSS-active template (§10 parity)", async ({
    page,
  }) => {
    await page.goto("/"); // HP-12C (landscape) active
    const cases: ReadonlyArray<readonly [number, string]> = [
      [639, "stack"],
      [640, "stack"], // sm reuses stack (§11 #2)
      [767, "stack"],
      [768, "tablet-portrait-wide"],
      [1023, "tablet-portrait-wide"],
      [1024, "desktop-landscape"],
      [1279, "desktop-landscape"],
      [1280, "desktop-landscape"],
      [1535, "desktop-landscape"],
      [1536, "desktop-landscape"],
    ];
    for (const [width, id] of cases) {
      await page.setViewportSize({ width, height: 900 }); // tall: no short-landscape override
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
    await expect(page.locator('[data-lcd-mode="mini"]').getByText("5.00").first()).toBeVisible();
  });

  test("HP-48G RPL faceplate pushes and adds on the dynamic stack", async ({ page }) => {
    await page.goto("/");
    await selectModel(page, "HP-48G");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.locator('[data-lcd-mode="mini"]').getByText("5.00").first()).toBeVisible();
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
      page.locator('[data-lcd-mode="mini"]').getByText("5.00").first(),
    ).toBeVisible();

    // typing `f` arms the gold prefix and DIMS the primary plane (§12.3)
    const primary7 = page
      .locator('[data-region="keyboard"] button[aria-label="7"] span')
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
      "HP-12C": 2.887,
      "HP-15C": 2.887,
      "HP-35": 0.703,
      "HP-48G": 0.722,
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
    // history/stack is behind a toggle → opens a BOTTOM sheet (§12.4), Escape closes
    await page.getByRole("button", { name: "Toggle history and stack" }).click();
    const sheet = page.getByRole("dialog", { name: "History and stack" });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute("data-side", "bottom");
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
