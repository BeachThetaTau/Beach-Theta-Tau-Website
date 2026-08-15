import { expect, test } from "@playwright/test";

test("public home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("THETA TAU AT LONG BEACH", { exact: true })).toBeVisible();
});
