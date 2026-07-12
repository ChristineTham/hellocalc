// Accessibility regression guard. Scans the whole UI — chrome (dialogs,
// sheets, About, native surface) AND the calculator FACEPLATE — for WCAG A/AA
// violations and asserts zero, in BOTH light and dark themes. The faceplate
// silk-screen legends, prefix-key inks and LCD dim text were brought to strict
// AA (decoupled shift key-bg / legend -text tokens), so nothing is excluded.
// Disabled controls remain WCAG-exempt from contrast.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function selectModel(page: Page, label: string) {
  const option = page.getByRole("option", { name: label, exact: true });
  try {
    await option.click({ timeout: 2000 });
  } catch {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await option.click();
    await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCount(0);
  }
}

const axe = (page: Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

const serious = (r: Awaited<ReturnType<typeof axe>>) =>
  r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

/** Wait for a closing dialog (content AND its backdrop) to fully unmount, so
 * a scan never catches it mid-fade over the page behind. */
async function closed(page: Page) {
  await expect(
    page.locator('[data-slot="dialog-content"],[data-slot="dialog-overlay"]'),
  ).toHaveCount(0);
}

/** Overlays fade IN over ~150ms; axe must scan the SETTLED state (a partial
 * opacity blends every colour toward the backdrop and fails contrast). Wait
 * until every open dialog/sheet reports opacity 1. */
async function settle(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const els = document.querySelectorAll<HTMLElement>(
          '[data-slot="dialog-content"],[data-slot="sheet-content"]',
        );
        return [...els].every((el) => getComputedStyle(el).opacity === "1");
      }),
    )
    .toBe(true);
}

// classic (f/g), RPL (ls/rs + per-model palette), single-shift, plain
const FACEPLATES = ["HP-12C", "HP-48SX", "HP-28C", "HP-35"];

for (const theme of ["light", "dark"] as const) {
  test(`no serious/critical a11y violations — ${theme}`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const goto = async (path: string) => {
      await page.goto(path);
      if (theme === "dark")
        await page.evaluate(() => document.documentElement.classList.add("dark"));
    };

    await goto("/about");
    expect(serious(await axe(page))).toEqual([]);

    await goto("/");

    // faceplates (the whole machine, at rest)
    for (const m of FACEPLATES) {
      await selectModel(page, m);
      await closed(page);
      expect(serious(await axe(page)), `faceplate ${m}`).toEqual([]);
    }

    // settings dialog (theme control + workspace state actions)
    await page.locator('[data-region="sidebar"]').getByRole("button", { name: "Settings" }).click();
    await settle(page);
    expect(serious(await axe(page))).toEqual([]);
    await page.keyboard.press("Escape");
    await closed(page);

    // native surface (all engine chrome)
    await selectModel(page, "Native mode");
    await closed(page);
    expect(serious(await axe(page))).toEqual([]);

    // mobile history/program sheet
    await page.setViewportSize({ width: 393, height: 852 });
    await selectModel(page, "HP-12C");
    await closed(page);
    await page.getByRole("button", { name: "Toggle history tape" }).click();
    await settle(page);
    expect(serious(await axe(page))).toEqual([]);
  });
}

test("theme toggle switches, persists, and has no flash", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/");
  const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
  const sidebar = page.locator('[data-region="sidebar"]');
  const openSettings = async () => {
    await sidebar.getByRole("button", { name: "Settings" }).click();
    return page.getByRole("dialog", { name: "Settings" });
  };

  // the theme control lives in the Settings dialog now — open it and pick Dark
  let dialog = await openSettings();
  await dialog.getByRole("radio", { name: "Dark" }).click();
  expect(await isDark()).toBe(true);
  await page.keyboard.press("Escape");

  // the choice survives a reload with the class applied before paint
  await page.reload();
  expect(await isDark()).toBe(true);
  dialog = await openSettings();
  await expect(dialog.getByRole("radio", { name: "Dark" })).toHaveAttribute(
    "aria-checked",
    "true",
  );

  // back to Light
  await dialog.getByRole("radio", { name: "Light" }).click();
  expect(await isDark()).toBe(false);
  await page.reload();
  expect(await isDark()).toBe(false);
});
