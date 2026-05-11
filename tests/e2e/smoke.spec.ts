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

function usesPortraitPanels(page: Page): boolean {
  const viewport = page.viewportSize();

  return Boolean(
    viewport && (viewport.height > viewport.width || viewport.width <= 860),
  );
}

async function showRunPanel(page: Page, panelName: string) {
  if (usesPortraitPanels(page)) {
    await page.getByRole("tab", { name: panelName }).click();
    await expect(page.getByRole("tabpanel", { name: panelName })).toBeVisible();
  }
}

test("landing screen starts a run and advances a quarter", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /run the airline badly on purpose/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: /about/i }).click();
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

  await page.getByRole("link", { name: /options/i }).click();
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
  await page.getByRole("button", { name: /return to run/i }).click();

  await showRunPanel(page, "Feed");
  const decisionTray = page
    .getByRole("heading", { name: /choose where the pain goes next/i })
    .locator("xpath=ancestor::section[1]");
  const consequenceFeed = page
    .getByRole("heading", { name: /the world answers back/i })
    .locator("xpath=ancestor::section[1]");

  const historyCountBefore = await consequenceFeed.locator("article").count();
  expect(historyCountBefore).toBeGreaterThan(0);

  await showRunPanel(page, "Decisions");
  const firstDecision = decisionTray.locator("button[aria-pressed]").first();
  await firstDecision.dispatchEvent("pointerdown");
  await expect(firstDecision).toHaveAttribute(
    "data-interaction-feedback",
    "active",
  );
  await firstDecision.click();
  await expect(firstDecision).toHaveAttribute("aria-pressed", "true");

  await page
    .getByTestId("quarter-controls")
    .getByRole("button", { name: /resolve the quarter/i })
    .click();

  await showRunPanel(page, "Feed");
  await expect(consequenceFeed.getByText(/^R2$/).first()).toBeVisible();
  await expect
    .poll(async () => consequenceFeed.locator("article").count())
    .toBeGreaterThan(historyCountBefore);
});

test("responsive run layout keeps touch controls and portrait panels reachable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /start a new run/i }).click();

  const viewport = page.viewportSize();
  const isPortrait = Boolean(
    viewport && (viewport.height > viewport.width || viewport.width <= 860),
  );
  const runPanels = page.getByRole("tablist", { name: /run panels/i });

  if (isPortrait) {
    await expect(runPanels).toBeVisible();
    await expect(
      runPanels.getByRole("tab", { name: /decisions/i }),
    ).toBeVisible();
    await expect(
      runPanels.getByRole("tab", { name: /state/i }),
    ).toBeVisible();
  } else {
    await expect(runPanels).toBeHidden();
  }

  if (isPortrait) {
    await runPanels.getByRole("tab", { name: /decisions/i }).click();
    await expect(
      page.getByRole("tabpanel", { name: /decisions/i }),
    ).toBeVisible();
  }

  const controls = page.getByTestId("quarter-controls");

  await expect(controls).toBeVisible();
  await expect(controls.getByText("0/2 selected")).toBeVisible();
  await page.locator("button[aria-pressed]").first().click();

  await expect(controls.getByText("1/2 selected")).toBeVisible();
  await controls.getByRole("button", { name: /resolve the quarter/i }).click();
  await expect(page.getByText(/^R2$/).first()).toBeVisible();
});

test("run screen is a fitted app surface across supported viewport projects", async ({
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

  const viewport = page.viewportSize();
  const isPortrait = Boolean(
    viewport && (viewport.height > viewport.width || viewport.width <= 860),
  );

  if (isPortrait) {
    const tabs = page.getByRole("tablist", { name: /run panels/i });
    await expect(tabs).toBeVisible();

    for (const panelName of ["Brief", "State", "Decisions", "Feed"]) {
      await tabs.getByRole("tab", { name: panelName }).click();
      await expect(
        page.getByRole("tabpanel", { name: panelName }),
      ).toBeVisible();
      await expectNoDocumentVerticalOverflow(page);
    }
  } else {
    await expect(
      page.getByRole("heading", {
        name: /temporary credibility is still the most valuable asset/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /two ledgers/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /choose where the pain goes next/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /the world answers back/i }),
    ).toBeVisible();
  }

  if (isPortrait) {
    await page.getByRole("tab", { name: "Decisions" }).click();
  }

  const controls = page.getByTestId("quarter-controls");
  await expect(controls).toBeVisible();
  await expect(controls.getByText("0/2 selected")).toBeVisible();

  await page.locator("button[aria-pressed]").first().click();
  await expect(controls.getByText("1/2 selected")).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);

  await controls.getByRole("button", { name: /resolve the quarter/i }).click();
  await expect(page.getByText(/^R2$/).first()).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);

  if (isPortrait) {
    await page.getByRole("tab", { name: "Feed" }).click();
    await expect(page.getByRole("tabpanel", { name: "Feed" })).toBeVisible();
    await page.getByRole("tab", { name: "Decisions" }).click();
  }

  await page.locator("button[aria-pressed]").first().click();
  await expect(controls.getByText("1/2 selected")).toBeVisible();
  await controls.getByRole("button", { name: /resolve the quarter/i }).click();
  await expect(page.getByText(/^R3$/).first()).toBeVisible();
  await expectNoDocumentVerticalOverflow(page);
});
