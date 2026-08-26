import { expect, test, type Locator, type Page } from "@playwright/test";

const screenshot = (name: string) =>
  `test-results/phase017-correction-${name}.png`;

const expectInRange = (actual: number, min: number, max: number) => {
  expect(actual).toBeGreaterThanOrEqual(min);
  expect(actual).toBeLessThanOrEqual(max);
};

const roundedBox = async (locator: Locator) => {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();

  return {
    height: Math.round(box?.height ?? 0),
    width: Math.round(box?.width ?? 0)
  };
};

const expectNoHorizontalOverflow = async (page: Page) => {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );

  expect(hasHorizontalOverflow).toBe(false);
};

test.describe("Phase 017 correction visual composition", () => {
  test.describe.configure({ mode: "serial" });

  test("captures the corrected Home interface at approved comparison widths", async ({
    page
  }) => {
    test.setTimeout(120000);

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
    test.setTimeout(120000);

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
    test.setTimeout(120000);

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

  test("captures the final System / Section entry composition", async ({
    page
  }) => {
    test.setTimeout(120000);

    await page.setViewportSize({ width: 1600, height: 1024 });
    await page.goto("/section/1");

    await expect(
      page.getByRole("heading", { name: /01 Sitework & Earthworks/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Activities in this system" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Section QC Focus" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Related Workflows" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Key Interfaces" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "QC Tip" })).toBeVisible();
    await expect(page.getByRole("link", { name: /1\.1/i })).toHaveAttribute(
      "href",
      "/activity/1.1"
    );
    await expect(
      page.getByText("Open the activity for field inspection execution.")
    ).toHaveCount(0);
    await expect(
      page.getByText("This workflow establishes what exists")
    ).toHaveCount(0);

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

      const number = document.querySelector(
        '[data-testid="section-entry-number"]'
      );
      const title = document.querySelector(
        '[data-testid="section-entry-title"]'
      );
      const rail = bounds("section-entry-rail");
      const main = bounds("section-entry-main");
      const firstRow = bounds("section-activity-row");
      const rows = Array.from(
        document.querySelectorAll('[data-testid="section-activity-row"]')
      );
      const arrows = rows.map((row) => {
        const arrow = row.querySelector('[data-testid="section-activity-arrow"]');

        if (!arrow) throw new Error("Missing section activity arrow");

        const rowRect = row.getBoundingClientRect();
        const arrowRect = arrow.getBoundingClientRect();

        return {
          arrowLeft: Math.round(arrowRect.left),
          arrowRight: Math.round(arrowRect.right),
          rowRight: Math.round(rowRect.right),
          rowScrollWidth: Math.round(row.scrollWidth),
          rowClientWidth: Math.round(row.clientWidth)
        };
      });

      if (!number || !title) {
        throw new Error("Missing section identity typography markers");
      }

      return {
        activityHeader: bounds("section-activities-header"),
        activityIconTile: bounds("section-activity-icon-tile"),
        activityIdTile: bounds("section-activity-id-tile"),
        activityRow: firstRow,
        bottomNav: bounds("section-bottom-nav"),
        iconTile: bounds("section-entry-icon-tile"),
        main,
        numberFontSize: Number.parseFloat(getComputedStyle(number).fontSize),
        rail,
        railGap: Math.round(
          bounds("section-rail-related-workflows").y -
            (bounds("section-rail-section-qc-focus").y +
              bounds("section-rail-section-qc-focus").height)
        ),
        railWidth: rail.width,
        rowArrowLefts: arrows.map((arrow) => arrow.arrowLeft),
        rowArrowRightOffsets: arrows.map(
          (arrow) => arrow.rowRight - arrow.arrowRight
        ),
        rowOverflowCount: arrows.filter(
          (arrow) => arrow.rowScrollWidth > arrow.rowClientWidth
        ).length,
        rightRailLeft: rail.x,
        titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize)
      };
    });

    expect(geometry.main.x).toBeGreaterThanOrEqual(276);
    expect(geometry.main.x).toBeLessThanOrEqual(284);
    expect(geometry.railWidth).toBeGreaterThanOrEqual(350);
    expect(geometry.railWidth).toBeLessThanOrEqual(370);
    expect(
      geometry.rightRailLeft - (geometry.main.x + geometry.main.width)
    ).toBe(22);
    expect(geometry.iconTile.width).toBe(72);
    expect(geometry.iconTile.height).toBe(72);
    expect(geometry.numberFontSize).toBe(40);
    expect(geometry.titleFontSize).toBe(40);
    expect(geometry.activityHeader.height).toBe(76);
    expect(geometry.activityRow.height).toBeGreaterThanOrEqual(72);
    expect(geometry.activityRow.height).toBeLessThanOrEqual(78);
    expect(geometry.activityIdTile.width).toBe(60);
    expect(geometry.activityIdTile.height).toBe(50);
    expect(geometry.activityIconTile.width).toBe(52);
    expect(geometry.activityIconTile.height).toBe(52);
    expect(geometry.railGap).toBe(18);
    expect(geometry.bottomNav.height).toBe(80);
    expect(new Set(geometry.rowArrowLefts).size).toBe(1);
    expect(new Set(geometry.rowArrowRightOffsets).size).toBe(1);
    expect(geometry.rowOverflowCount).toBe(0);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
    await page.screenshot({
      fullPage: true,
      path: screenshot("section-entry-sitework")
    });

    const sectionScreenshots = [
      { id: "2", name: "substructure", title: "Substructure" },
      { id: "3", name: "superstructure", title: "Superstructure" },
      { id: "4", name: "building-envelope", title: "Building Envelope" },
      { id: "8", name: "mechanical-services", title: "Mechanical Services" },
      {
        id: "9",
        name: "electrical-building-services",
        title: "Electrical Building Services"
      },
      {
        id: "13",
        name: "testing-commissioning",
        title: "Testing, Commissioning & System Acceptance"
      },
      {
        id: "14",
        name: "deficiencies-closeout",
        title: "Deficiencies, Completion & Closeout"
      }
    ];

    for (const section of sectionScreenshots) {
      await page.goto(`/section/${section.id}`);
      await expect(
        page.getByRole("heading", {
          name: new RegExp(`${section.id.padStart(2, "0")}.*${section.title}`)
        })
      ).toBeVisible();
      await expect(
        page
          .getByRole("navigation", { name: "Primary" })
          .getByRole("link", { name: section.title })
      ).toHaveAttribute("aria-current", "page");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth
        )
      ).toBe(false);
      expect(
        await page
          .locator('[data-testid="section-activity-row"]')
          .evaluateAll((rows) =>
            rows.filter((row) => row.scrollWidth > row.clientWidth).length
          )
      ).toBe(0);
      await page.screenshot({
        fullPage: true,
        path: screenshot(`section-entry-${section.name}`)
      });
    }
  });

  test("keeps the shared shell usable across Layer 1 viewport targets", async ({
    page
  }) => {
    test.setTimeout(120000);

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
    test.setTimeout(120000);

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
    await expect(
      page.getByRole("heading", {
        name: "Quick Check — Essentials in the Field"
      })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Watch For" })).toBeVisible();
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-quick")
    });

    await page.goto("/activity/10.3?mode=full");
    await expect(page.getByRole("tab", { name: "Full" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.getByTestId("activity-full-mode")).toBeVisible();
    await expect(page.getByTestId("full-group-row")).toHaveCount(10);
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-full")
    });

    await page.goto("/activity/10.3?mode=learn");
    await expect(page.getByRole("tab", { name: "Learn" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(
      page.getByRole("heading", { name: "Learn & Understand" })
    ).toBeVisible();
    await expect(page.getByTestId("activity-learn-mode")).toBeVisible();
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

  test("captures final Activity Quick, Full, and Learn visual states", async ({
    page
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1536, height: 1024 });

    await page.goto("/activity/2.1");
    await expect(
      page.getByRole("heading", { name: /2\.1 Foundation Formwork/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Quick Check — Essentials in the Field"
      })
    ).toBeVisible();
    await expect(page.getByTestId("quick-card")).toHaveCount(4);
    await expect(page.getByTestId("quick-do-not-miss")).toBeVisible();
    await expect(page.getByTestId("quick-field-tip")).toBeVisible();
    await expect(page.getByTestId("quick-info-panel")).toContainText("Stage");
    await expect(page.getByTestId("quick-info-panel")).toContainText(
      "Criticality"
    );
    await expect(page.getByTestId("quick-info-panel")).toContainText(
      "Quality Impact"
    );
    await expect(page.getByTestId("activity-relationship-rail")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Next / Related Work" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Related Systems" }))
      .toBeVisible();
    await expect(page.getByRole("heading", { name: "Related Inspections" }))
      .toBeVisible();
    await expect(page.getByTestId("activity-view-all-unavailable"))
      .toBeDisabled();
    await expectNoHorizontalOverflow(page);

    const quickMain = await roundedBox(page.getByTestId("activity-main-column"));
    const quickRail = await roundedBox(
      page.getByTestId("activity-relationship-rail")
    );
    const quickIdentity = await roundedBox(
      page.getByTestId("activity-identity-card")
    );
    const quickTabs = await roundedBox(page.getByTestId("activity-mode-tabs"));
    const quickPanel = await roundedBox(page.getByTestId("activity-quick-mode"));
    const quickCards = await page.getByTestId("quick-card").all();
    const firstQuickCard = await roundedBox(quickCards[0]);
    const secondQuickCardBox = await quickCards[1].boundingBox();
    const firstQuickCardBox = await quickCards[0].boundingBox();
    const quickGridGap =
      Math.round(
        (secondQuickCardBox?.x ?? 0) -
          (firstQuickCardBox?.x ?? 0) -
          (firstQuickCardBox?.width ?? 0)
      ) || 0;
    const quickRailRows = await page.getByTestId("activity-rail-row").all();
    const firstRailRow = await roundedBox(quickRailRows[0]);
    const mainShare = quickMain.width / (quickMain.width + quickRail.width);

    expectInRange(Math.round(mainShare * 100), 74, 76);
    expectInRange(quickRail.width, 276, 284);
    expectInRange(quickIdentity.height, 132, 155);
    expectInRange(quickTabs.height, 42, 48);
    expectInRange(Math.abs(quickPanel.width - quickMain.width), 0, 2);
    expectInRange(firstQuickCard.width, 150, 250);
    expectInRange(quickGridGap, 8, 14);
    expectInRange(firstRailRow.height, 34, 42);
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-foundation-quick")
    });

    const railBefore = await page.getByTestId("activity-relationship-rail")
      .innerText();
    await page.getByRole("tab", { name: "Full" }).click();
    await expect(page).toHaveURL(/\/activity\/2\.1\?mode=full$/);
    await expect(page.getByTestId("activity-id")).toHaveText("2.1");
    await expect(page.getByTestId("activity-full-mode")).toBeVisible();
    await expect(page.getByTestId("full-group-row")).toHaveCount(10);
    expect(await page.getByTestId("activity-relationship-rail").innerText())
      .toBe(railBefore);

    const fullPanel = await roundedBox(page.getByTestId("activity-full-mode"));
    const fullRows = await page.getByTestId("full-group-row").all();
    const firstFullRow = await roundedBox(fullRows[0]);

    expectInRange(Math.abs(fullPanel.width - quickMain.width), 0, 2);
    expectInRange(firstFullRow.height, 42, 58);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-foundation-full")
    });
    await fullRows[2].locator("summary").click();
    await expect(
      page.getByText("latest structural foundation drawings;")
    ).toBeVisible();

    await page.getByRole("tab", { name: "Learn" }).click();
    await expect(page).toHaveURL(/\/activity\/2\.1\?mode=learn$/);
    await expect(page.getByTestId("activity-id")).toHaveText("2.1");
    await expect(page.getByTestId("activity-learn-mode")).toBeVisible();
    await expect(page.getByTestId("learn-card")).toHaveCount(6);
    await expect(page.getByTestId("learn-sequence")).toBeVisible();
    expect(await page.getByTestId("activity-relationship-rail").innerText())
      .toBe(railBefore);

    const learnCards = await page.getByTestId("learn-card").all();
    const firstLearnCard = await roundedBox(learnCards[0]);

    expectInRange(firstLearnCard.width, 180, 310);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      fullPage: true,
      path: screenshot("activity-foundation-learn")
    });
  });

  test("captures cross-activity Quick, Full, and Learn renderer coverage", async ({
    page
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1366, height: 900 });

    const activities = [
      { id: "1.1", name: "sitework" },
      { id: "4.1", name: "building-envelope" },
      { id: "8.1", name: "mechanical" },
      { id: "9.1", name: "electrical" },
      { id: "10.3", name: "fire-life-safety" },
      { id: "13.1", name: "testing-commissioning" },
      { id: "14.1", name: "closeout" }
    ];
    const modes = [
      { mode: "quick", query: "" },
      { mode: "full", query: "?mode=full" },
      { mode: "learn", query: "?mode=learn" }
    ];

    for (const activity of activities) {
      for (const mode of modes) {
        await page.goto(`/activity/${activity.id}${mode.query}`);

        await expect(page.getByTestId("activity-interface")).toBeVisible();
        await expect(page.getByTestId("activity-id")).toHaveText(activity.id);
        await expect(
          page.getByRole("tab", { name: new RegExp(mode.mode, "i") })
        ).toHaveAttribute("aria-selected", "true");
        await expect(page.getByTestId(`activity-${mode.mode}-mode`))
          .toBeVisible();
        await expectNoHorizontalOverflow(page);
        await page.screenshot({
          fullPage: true,
          path: screenshot(`activity-cross-${activity.name}-${mode.mode}`)
        });
      }
    }
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
