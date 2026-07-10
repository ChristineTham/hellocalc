import { test, expect } from "@playwright/test";

test.describe("hellocalc — smoke", () => {
  test("loads the app shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Hello Calc" })).toBeVisible();
    await expect(page.getByText("History is empty")).toBeVisible();
  });

  test("evaluates an algebraic expression and shows it in history", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder(/Enter expression/i);
    await input.fill("2 + 2");
    await input.press("Enter");

    // Result appears in the history as "= 4"; the entered expression is echoed.
    await expect(page.getByText("= 4")).toBeVisible();
    await expect(page.getByText("2 + 2")).toBeVisible();
    await expect(page.getByText("History is empty")).toHaveCount(0);
  });
});
