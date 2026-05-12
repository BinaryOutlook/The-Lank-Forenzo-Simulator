import { expect, test, type Page } from "@playwright/test";

async function expectNoDocumentVerticalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollHeight = Math.max(
      documentElement.scrollHeight,
      body.scrollHeight,
    );

    return {
      overflowPixels: scrollHeight - window.innerHeight,
      scrollY: window.scrollY,
    };
  });

  expect(overflow.overflowPixels).toBeLessThanOrEqual(1);
  expect(overflow.scrollY).toBe(0);
}

async function showRoundPhase(page: Page, phaseName: string | RegExp) {
  await page.getByRole("tab", { name: phaseName }).click();
  await expect(page.getByRole("tabpanel", { name: phaseName })).toBeVisible();
}

async function chooseFirstPlayAndReview(page: Page) {
  await showRoundPhase(page, /choose plays/i);
  await page
    .getByRole("link", { name: /open dedicated decision view/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /select the quarter's damage/i }),
  ).toBeVisible();
  await expect(page.getByText("0/2 selected")).toBeVisible();
  const expandedDecision = page.locator("button[aria-pressed]").first();
  await expandedDecision.click();
  await expect(expandedDecision).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("1/2 selected")).toBeVisible();
  await expandedDecision.click();
  await expect(expandedDecision).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("link", { name: /return to board/i }).click();
  await showRoundPhase(page, /choose plays/i);

  const firstDecision = page.locator("button[aria-pressed]").first();
  await firstDecision.dispatchEvent("pointerdown");
  await expect(firstDecision).toHaveAttribute(
    "data-interaction-feedback",
    "active",
  );
  await firstDecision.click();
  await expect(firstDecision).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /review resolution/i }).click();
  await expect(page.getByRole("tabpanel", { name: /resolve/i })).toBeVisible();
}

test("landing screen starts a run and advances a quarter", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await expect(primaryNav.getByRole("link")).toHaveText([
    "Run",
    "About",
    "Tutorial",
    "Options",
  ]);
  await expect(primaryNav.getByRole("link", { name: "Run" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /run the airline badly on purpose/i }),
  ).toBeVisible();

  await primaryNav.getByRole("link", { name: "Tutorial" }).click();
  await expect(
    page.getByRole("heading", {
      name: /learn the loop before the creditors do/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /leave rich before the bill comes due/i,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: /learn the loop before the creditors do/i,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: /return home/i }).click();
  await expect(
    page.getByRole("heading", { name: /run the airline badly on purpose/i }),
  ).toBeVisible();

  await primaryNav.getByRole("link", { name: "About" }).click();
  await expect(
    page.getByRole("heading", {
      name: /aviation management, viewed from the executive escape hatch/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/why this game exists/i)).toBeVisible();
  await page.getByRole("link", { name: /return to main game/i }).click();
  await expect(
    page.getByRole("heading", { name: /run the airline badly on purpose/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /start a new run/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /temporary credibility is still the most valuable asset/i,
    }),
  ).toBeVisible();
  const phaseNav = page.getByRole("tablist", { name: /round phases/i });
  await expect(phaseNav.getByRole("tab", { name: /read/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(phaseNav.getByRole("tab", { name: /resolve/i })).toBeDisabled();

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

  await primaryNav.getByRole("link", { name: "Options" }).click();
  await expect(
    page.getByRole("heading", {
      name: /tune the room before it turns on you/i,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /runway night/i }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-wallpaper",
    "runway-night",
  );
  await page.getByRole("checkbox", { name: /^music\b/i }).check();
  await expect(page.locator("html")).toHaveAttribute("data-music", "on");
  await expect(page.locator("html")).toHaveAttribute(
    "data-sound-effects",
    "on",
  );
  await page.getByRole("checkbox", { name: /sound effects/i }).uncheck();
  await expect(page.locator("html")).toHaveAttribute(
    "data-sound-effects",
    "off",
  );
  await page.getByRole("checkbox", { name: /visual effects/i }).uncheck();
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-effects",
    "off",
  );
  await page.getByRole("checkbox", { name: /interaction feedback/i }).uncheck();
  await expect(page.locator("html")).toHaveAttribute(
    "data-interaction-effects",
    "off",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-wallpaper",
    "runway-night",
  );
  await expect(page.locator("html")).toHaveAttribute("data-music", "on");
  await expect(page.locator("html")).toHaveAttribute(
    "data-sound-effects",
    "off",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-visual-effects",
    "off",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-interaction-effects",
    "off",
  );
  await page.getByRole("checkbox", { name: /visual effects/i }).check();
  await page.getByRole("checkbox", { name: /interaction feedback/i }).check();
  await expect(page.locator("html")).toHaveAttribute(
    "data-interaction-effects",
    "on",
  );
  await primaryNav.getByRole("link", { name: "Run" }).click();

  const consequenceFeed = page
    .getByRole("heading", { name: /the world answers back/i })
    .locator("xpath=ancestor::section[1]");
  const historyCountBefore = await consequenceFeed.locator("article").count();
  expect(historyCountBefore).toBeGreaterThan(0);

  await chooseFirstPlayAndReview(page);
  await expect(page.getByTestId("quarter-controls")).toBeVisible();
  await page
    .getByTestId("quarter-controls")
    .getByRole("button", { name: /resolve the quarter/i })
    .click();

  await expect(consequenceFeed.getByText(/^R2$/).first()).toBeVisible();
  await expect
    .poll(async () => consequenceFeed.locator("article").count())
    .toBeGreaterThan(historyCountBefore);
});

test("responsive round phases keep choice and resolution controls reachable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /start a new run/i }).click();

  const roundPhases = page.getByRole("tablist", { name: /round phases/i });
  await expect(roundPhases).toBeVisible();
  await expect(roundPhases.getByRole("tab", { name: /read/i })).toBeVisible();
  await expect(
    roundPhases.getByRole("tab", { name: /choose plays/i }),
  ).toBeVisible();
  await expect(
    roundPhases.getByRole("tab", { name: /resolve/i }),
  ).toBeDisabled();

  await showRoundPhase(page, /choose plays/i);
  await expect(
    page.getByRole("heading", { name: /choose where the pain goes next/i }),
  ).toBeVisible();
  await page.locator("button[aria-pressed]").first().click();
  await expect(page.getByText("1/2 plays ready").first()).toBeVisible();
  await page.getByRole("button", { name: /review resolution/i }).click();

  const controls = page.getByTestId("quarter-controls");
  await expect(controls).toBeVisible();
  await expect(controls.getByText("1/2 selected")).toBeVisible();
  await controls.getByRole("button", { name: /resolve the quarter/i }).click();
  await expect(page.getByText(/^R2$/).first()).toBeVisible();
});

test("run screen is a fitted phased app surface across supported viewport projects", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /start a new run/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /temporary credibility is still the most valuable asset/i,
    }),
  ).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);

  const tabs = page.getByRole("tablist", { name: /round phases/i });
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("tab", { name: /read/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: /two ledgers/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /the world answers back/i }),
  ).toBeVisible();

  await showRoundPhase(page, /choose plays/i);
  await expectNoDocumentVerticalOverflow(page);
  await expect(
    page.getByRole("heading", { name: /choose where the pain goes next/i }),
  ).toBeVisible();

  await page.locator("button[aria-pressed]").first().click();
  await expect(page.getByText("1/2 plays ready").first()).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);

  await page.getByRole("button", { name: /review resolution/i }).click();
  await expect(page.getByRole("tabpanel", { name: /resolve/i })).toBeVisible();
  await expect(page.getByTestId("quarter-controls")).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);

  await page
    .getByTestId("quarter-controls")
    .getByRole("button", { name: /resolve the quarter/i })
    .click();
  await expect(page.getByText(/^R2$/).first()).toBeVisible();
  await expect(tabs.getByRole("tab", { name: /read/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expectNoDocumentVerticalOverflow(page);

  await showRoundPhase(page, /choose plays/i);
  await page.locator("button[aria-pressed]").first().click();
  await expect(page.getByText("1/2 plays ready").first()).toBeVisible();
  await page.getByRole("button", { name: /review resolution/i }).click();
  await page
    .getByTestId("quarter-controls")
    .getByRole("button", { name: /resolve the quarter/i })
    .click();
  await expect(page.getByText(/^R3$/).first()).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);
});
