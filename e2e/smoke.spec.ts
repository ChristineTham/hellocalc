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
    await expect(page.getByText("5.00").first()).toBeVisible();
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
  });

  test("HP-35 classic faceplate does RPN arithmetic", async ({ page }) => {
    await page.goto("/");
    await selectModel(page, "HP-35");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER↑", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.getByText("5.00").first()).toBeVisible();
  });

  test("HP-48G RPL faceplate pushes and adds on the dynamic stack", async ({ page }) => {
    await page.goto("/");
    await selectModel(page, "HP-48G");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.getByText("5.00").first()).toBeVisible();
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

  test("small screens: faceplate fits, LCD collapses, history is a drawer", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto("/");
    // faceplate scaled to fit — no horizontal page overflow
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    expect(noOverflow).toBe(true);
    // LCD starts compact on small screens → an "Expand display" control is shown
    await expect(page.getByRole("button", { name: "Expand display" })).toBeVisible();
    // history/stack is behind a toggle → opens a drawer, then closes
    await page.getByRole("button", { name: "Toggle history and stack" }).click();
    await expect(page.getByRole("dialog", { name: "History and stack" })).toBeVisible();
    await page.getByRole("button", { name: "Close panel", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "History and stack" })).toHaveCount(0);
  });
});
