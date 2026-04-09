import { expect, test } from "@playwright/test";

test("landing screen starts a run", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /run the airline badly on purpose/i })).toBeVisible();
  await page.getByRole("button", { name: /start a new run/i }).click();
  await expect(page.getByRole("heading", { name: /temporary credibility is still the most valuable asset/i })).toBeVisible();
});
