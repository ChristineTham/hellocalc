// Accessibility regression guard. Scans the app CHROME (dialogs, sheets, the
// About page, native surface) for WCAG A/AA violations and asserts zero. The
// calculator FACEPLATE ([data-region="machine"]) is deliberately excluded: its
// key silk-screen legends and the segment/LCD dim text are skeuomorphic period
// styling whose contrast is an owned design trade-off (see the a11y report),
// not a chrome defect. Disabled controls are WCAG-exempt from contrast.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function selectModel(page: Page, label: string) {
  await page.getByRole("button", { name: "Select calculator model" }).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude('[data-region="machine"]') // skeuomorphic faceplate — owned trade-off
    .exclude('[data-slot="machine-aux"]') // the bay's in-machine LCD-adjacent paper
    .analyze();

const serious = (r: Awaited<ReturnType<typeof axe>>) =>
  r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

/** Overlays fade in over ~150ms; axe must scan the SETTLED state (a partial
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

test("chrome has no serious/critical a11y violations", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1366, height: 900 });

  await page.goto("/about");
  expect(serious(await axe(page))).toEqual([]);

  await page.goto("/");
  // model picker dialog
  await page.getByRole("button", { name: "Select calculator model" }).click();
  await settle(page);
  expect(serious(await axe(page))).toEqual([]);
  await page.keyboard.press("Escape");

  // native surface (all engine chrome) — selectModel closes the picker, so
  // wait for its close animation to finish before scanning
  await selectModel(page, "Native mode");
  await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  expect(serious(await axe(page))).toEqual([]);

  // mobile history/program sheet
  await page.setViewportSize({ width: 393, height: 852 });
  await selectModel(page, "HP-12C");
  await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle history tape" }).click();
  await settle(page); // scan only the settled (opaque) sheet
  expect(serious(await axe(page))).toEqual([]);
});
