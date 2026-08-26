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
      await page.goto("/general-qc");

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
      await expect(page.getByRole("button", { name: "List" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      await expect(
        page
          .getByRole("main")
          .getByRole("link")
          .filter({ hasText: "Inspection Planning" })
      ).toHaveAttribute("href", "/general-qc/general-qc-inspection-planning");
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

  test("captures the final General QC Process detail composition", async ({
    page
  }) => {
    await page.setViewportSize({ width: 1536, height: 1024 });
    await page.goto("/general-qc/general-qc-ncr");

    await expect(
      page.getByRole("heading", { name: "Non-Conformity Reporting (NCR)" })
    ).toBeVisible();
    await expect(page.getByText("Field Workflow")).toBeVisible();
    await expect(page.getByText("What to Capture")).toBeVisible();
    await expect(page.getByText("Common Mistakes")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Key Reminders" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Typical Outputs" })
    ).toBeVisible();

    const geometry = await page.evaluate(() => {
      const bounds = (testId: string) => {
        const element = document.querySelector(`[data-testid="${testId}"]`);

        if (!element) throw new Error(`Missing ${testId}`);

        const rect = element.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      };

      const title = document.querySelector(
        '[data-testid="general-qc-detail-title"]'
      );

      if (!title) throw new Error("Missing detail title");

      return {
        breadcrumb: bounds("general-qc-detail-breadcrumb"),
        header: bounds("general-qc-detail-header"),
        icon: bounds("general-qc-detail-icon"),
        main: bounds("general-qc-detail-main"),
        rail: bounds("general-qc-detail-rail"),
        tabs: bounds("general-qc-detail-tabs"),
        titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
        whenToUse: bounds("general-qc-when-to-use"),
        workflow: bounds("general-qc-workflow-panel"),
        workflowIcon: bounds("general-qc-workflow-step-icon"),
        workflowNumber: bounds("general-qc-workflow-step-number")
      };
    });

    expect(geometry.main.x).toBeGreaterThanOrEqual(270);
    expect(geometry.main.x).toBeLessThanOrEqual(292);
    expect(geometry.main.width).toBeGreaterThanOrEqual(850);
    expect(geometry.main.width).toBeLessThanOrEqual(895);
    expect(geometry.rail.width).toBeGreaterThanOrEqual(315);
    expect(geometry.rail.width).toBeLessThanOrEqual(342);
    expect(geometry.rail.x - (geometry.main.x + geometry.main.width)).toBe(24);
    expect(geometry.icon.width).toBe(76);
    expect(geometry.icon.height).toBe(76);
    expect(geometry.titleFontSize).toBe(28);
    expect(geometry.tabs.height).toBe(48);
    expect(geometry.workflowNumber.width).toBe(26);
    expect(geometry.workflowNumber.height).toBe(26);
    expect(geometry.workflowIcon.width).toBe(44);
    expect(geometry.workflowIcon.height).toBe(44);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
    await page.screenshot({
      fullPage: true,
      path: screenshot("general-qc-detail-ncr")
    });

    const processScreenshots = [
      {
        id: "general-qc-inspection-planning",
        name: "inspection-planning",
        title: "Inspection Planning"
      },
      {
        id: "general-qc-itp-execution",
        name: "itp-pie-prie",
        title: "ITP / PIE / PRIE Execution"
      },
      {
        id: "general-qc-quality-evidence",
        name: "quality-evidence",
        title: "Quality Evidence & Photo Documentation"
      },
      {
        id: "general-qc-traceability",
        name: "traceability",
        title: "Traceability"
      },
      {
        id: "general-qc-quality-closeout",
        name: "quality-closeout",
        title: "Quality Closeout"
      }
    ];

    for (const process of processScreenshots) {
      await page.goto(`/general-qc/${process.id}`);
      await expect(
        page.getByRole("heading", { name: process.title })
      ).toBeVisible();
      await expect(
        page.getByRole("tab", { name: "Field Workflow" })
      ).toHaveAttribute("aria-selected", "true");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth
        )
      ).toBe(false);
      await page.screenshot({
        fullPage: true,
        path: screenshot(`general-qc-detail-${process.name}`)
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
