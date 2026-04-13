import { expect, test } from "@playwright/test";

test("landing screen starts a run and advances a quarter", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /run the airline badly on purpose/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /start a new run/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /temporary credibility is still the most valuable asset/i,
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: /armonk blue/i }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "armonk-blue",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "armonk-blue",
  );

  const decisionTray = page
    .getByRole("heading", { name: /choose where the pain goes next/i })
    .locator("xpath=ancestor::section[1]");
  const consequenceFeed = page
    .getByRole("heading", { name: /the world answers back/i })
    .locator("xpath=ancestor::section[1]");

  const historyCountBefore = await consequenceFeed.locator("article").count();
  expect(historyCountBefore).toBeGreaterThan(0);

  const firstDecision = decisionTray.locator("button[aria-pressed]").first();
  await firstDecision.press("Space");
  await expect(firstDecision).toHaveAttribute("aria-pressed", "true");

  await decisionTray
    .getByRole("button", { name: /resolve the quarter/i })
    .click();

  await expect(consequenceFeed.getByText(/^R2$/).first()).toBeVisible();
  await expect
    .poll(async () => consequenceFeed.locator("article").count())
    .toBeGreaterThan(historyCountBefore);
});
