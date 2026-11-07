import { expect, test } from "@playwright/test";

test("public home page renders", async ({ page }) => {
  await page.goto("/");
  // Match the DOM text. The hero eyebrow is upper-cased by CSS (text-transform).
  await expect(page.getByText("Theta Tau at Long Beach", { exact: true })).toBeVisible();
});
