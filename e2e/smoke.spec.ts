import { test, expect } from "@playwright/test";

test.describe("hellocalc — smoke", () => {
  test("loads the faceplate shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Hello Calc" })).toBeVisible();
    // model switcher + a faceplate key are present
    await expect(page.getByRole("tab", { name: "HP-12C" })).toBeVisible();
    await expect(page.getByRole("button", { name: "ENTER", exact: true })).toBeVisible();
  });

  test("performs RPN arithmetic: 2 ENTER 3 + = 5.00", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    // 5.00 shows in the display (X register / hero / stack panel)
    await expect(page.getByText("5.00").first()).toBeVisible();
  });

  test("switches models, retaining engine state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "7", exact: true }).click();
    await page.getByRole("tab", { name: "HP-15C" }).click();
    // HP-15C is a distinct model with its own scientific keys (e.g. SIN)
    await expect(page.getByRole("button", { name: "SIN", exact: true })).toBeVisible();
    // the keyed 7 survived the switch (shared engine)
    await expect(page.getByText("7.00").first()).toBeVisible();
  });

  test("HP-35 classic faceplate does RPN arithmetic", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "HP-35" }).click();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER↑", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.getByText("5.00").first()).toBeVisible();
  });

  test("HP-48G RPL faceplate pushes and adds on the dynamic stack", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "HP-48G", exact: true }).click();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: "ENTER", exact: true }).click();
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.getByText("5.00").first()).toBeVisible();
  });
});
