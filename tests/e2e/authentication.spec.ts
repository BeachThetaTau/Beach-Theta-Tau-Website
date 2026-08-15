import { expect, test } from "@playwright/test";

test("protected routes redirect to login", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);
});
