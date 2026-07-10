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
});
