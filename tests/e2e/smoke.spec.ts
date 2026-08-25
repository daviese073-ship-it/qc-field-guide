import { expect, test } from "@playwright/test";

const screenshot = (name: string) =>
  `test-results/phase017-correction-${name}.png`;

test.describe("Phase 017 correction visual composition", () => {
  test("captures the corrected Home interface at approved comparison widths", async ({
    page
  }) => {
    test.setTimeout(60000);

    const viewports = [
      { name: "home-1536", width: 1536, height: 1024 },
      { name: "home-1440", width: 1440, height: 900 },
      { name: "home-1280", width: 1280, height: 800 },
      { name: "home-1024", width: 1024, height: 768 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: "What will you inspect today?" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Inspection Systems" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Recently Visited Systems" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Field Tips" })
      ).toBeVisible();
      await expect(page.getByText("Quick Inspection")).toHaveCount(0);
      await expect(page.getByText("What Are You Doing?")).toHaveCount(0);
      await expect(page.getByText("Production data")).toHaveCount(0);
      await expect(page.getByRole("main").getByRole("link")).toHaveCount(15);

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );

      expect(hasHorizontalOverflow).toBe(false);
      await page.screenshot({
        fullPage: true,
        path: screenshot(`layer2a-${viewport.name}`)
      });
    }
  });

  test("captures the General QC Processes rebuild at approved comparison widths", async ({
    page
  }) => {
    test.setTimeout(60000);

    const viewports = [
      { name: "general-qc-1536", width: 1536, height: 1024 },
      { name: "general-qc-1280", width: 1280, height: 800 },
      { name: "general-qc-1024", width: 1024, height: 768 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      await page.goto("/search?q=general%20qc%20processes");

      await expect(
        page.getByRole("heading", { name: "General QC Processes" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "All Processes" })
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Grid" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      await expect(page.getByRole("button", { name: "List" })).toBeDisabled();
      await expect(
        page.getByRole("heading", { name: "Commonly Used" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Field Tips" })
      ).toBeVisible();
      await expect(page.getByText("Related Searches")).toHaveCount(0);
      await expect(page.getByText("Search Tip")).toHaveCount(0);
      await expect(page.getByText("Filters")).toHaveCount(0);

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );

      expect(hasHorizontalOverflow).toBe(false);
      await page.screenshot({
        fullPage: true,
        path: screenshot(viewport.name)
      });
    }
  });

  test("keeps the shared shell usable across Layer 1 viewport targets", async ({
    page
  }) => {
    test.setTimeout(60000);

    const viewports = [
      { name: "large-desktop", width: 1440, height: 900 },
      { name: "standard-laptop", width: 1280, height: 800 },
      { name: "landscape-tablet", width: 1024, height: 768 },
      { name: "narrow-tablet", width: 820, height: 1180 },
      { name: "phone", width: 390, height: 844 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      await page.goto("/section/10");

      await expect(
        page.getByRole("link", { name: "QC Field Guide home" })
      ).toBeVisible();
      await expect(
        page.getByRole("searchbox", { name: "Search" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /Fire & Life-Safety Construction/i })
      ).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );

      expect(hasHorizontalOverflow).toBe(false);
      await page.screenshot({
        fullPage: true,
        path: screenshot(`layer1-shell-${viewport.name}`)
      });
    }
  });

  test("keeps language preference changes separate from canonical routing", async ({
    page
  }) => {
    await page.goto("/section/10");

    await page.getByRole("button", { name: "FR" }).click();

    await expect(page).toHaveURL(/\/section\/10$/);
    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
    await page.screenshot({
      fullPage: true,
      path: screenshot("layer1-shell-french")
    });
  });

  test("captures the primary route-bound production screens", async ({
    page
  }) => {
    test.setTimeout(60000);

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "What will you inspect today?" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Inspection Systems" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recently Visited Systems" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Field Tips" })
    ).toBeVisible();
    await expect(page.getByText("Quick Inspection")).toHaveCount(0);
    await expect(page.getByText("Production data")).toHaveCount(0);
    await page.screenshot({ fullPage: true, path: screenshot("home") });

    await page.goto("/section/10");
    await expect(
      page.getByRole("heading", { name: /Fire & Life-Safety Construction/i })
    ).toBeVisible();
    await expect(page.getByText("Activities in this system")).toBeVisible();
    await page.screenshot({ fullPage: true, path: screenshot("system") });

    await page.goto("/activity/10.3");
    await expect(
      page.getByRole("heading", { name: /10.3 Firestopping/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Quick" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.getByText("Watch for").first()).toBeVisible();
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-quick")
    });

    await page.goto("/activity/10.3?mode=full");
    await expect(page.getByRole("tab", { name: "Full" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.getByLabel("Full activity content")).toBeVisible();
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-full")
    });

    await page.goto("/activity/10.3?mode=learn");
    await expect(page.getByRole("tab", { name: "Learn" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.getByText("Learn the inspection logic")).toBeVisible();
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-learn")
    });

    await page.goto("/workflow/WF-FIRE-01");
    await expect(
      page.getByRole("heading", { name: /Firestop Inspection/i })
    ).toBeVisible();
    await expect(page.getByText("Workflow Information")).toBeVisible();
    await page.screenshot({ fullPage: true, path: screenshot("workflow") });

    await page.goto("/preconcealment/PC-FIRE-01");
    await expect(
      page.getByRole("heading", {
        name: /Before Closing Fire-Rated Assembly/i
      })
    ).toBeVisible();
    await expect(page.getByText("Blocking").first()).toBeVisible();
    await page.screenshot({
      fullPage: true,
      path: screenshot("preconcealment")
    });

    await page.goto("/gate/G-INT-01");
    await expect(
      page.getByRole("heading", { name: /Interior Wall/i })
    ).toBeVisible();
    await expect(page.getByText("Gate Tip")).toBeVisible();
    await page.screenshot({ fullPage: true, path: screenshot("gate") });

    await page.goto("/search?q=firestop");
    await expect(
      page.getByRole("heading", { name: /Search Results/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /10.3 Firestopping/i }).first()
    ).toBeVisible();
    await page.screenshot({ fullPage: true, path: screenshot("search") });

    await page.goto("/term/TERM-FIRE-FIRESTOPPING");
    await expect(
      page.getByRole("heading", { name: /Firestopping/i })
    ).toBeVisible();
    await expect(page.getByText("EN / FR source data")).toBeVisible();
    await page.screenshot({ fullPage: true, path: screenshot("terminology") });
  });

  test("captures the activity route on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/activity/10.3");

    await expect(
      page.getByRole("heading", { name: /10.3 Firestopping/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Quick" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-mobile")
    });
  });
});
