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

test("responsive run layout keeps touch controls and section jumps reachable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /start a new run/i }).click();

  const viewport = page.viewportSize();
  const runSections = page.getByRole("navigation", { name: /run sections/i });

  if (viewport && viewport.width <= 1180) {
    await expect(runSections).toBeVisible();
    await expect(
      runSections.getByRole("link", { name: /decisions/i }),
    ).toBeVisible();
    await expect(
      runSections.getByRole("link", { name: /state/i }),
    ).toBeVisible();
  } else {
    await expect(runSections).toBeHidden();
  }

  if (viewport && viewport.width <= 860) {
    const decisionTray = page
      .getByRole("heading", { name: /choose where the pain goes next/i })
      .locator("xpath=ancestor::section[1]");
    const controls = page.getByTestId("quarter-controls");

    await decisionTray.scrollIntoViewIfNeeded();
    await expect(controls).toBeVisible();
    await expect(controls.getByText("0/2 selected")).toBeVisible();
    await decisionTray.locator("button[aria-pressed]").first().click();

    await expect(controls.getByText("1/2 selected")).toBeVisible();
    await controls.getByRole("button", { name: /resolve the quarter/i }).click();
    await expect(page.getByText(/^R2$/).first()).toBeVisible();
  }
});
