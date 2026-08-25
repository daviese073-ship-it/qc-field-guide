import { expect, test } from "@playwright/test";

const screenshot = (name: string) =>
  `test-results/phase017-correction-${name}.png`;

test.describe("Phase 017 correction visual composition", () => {
  test("captures the primary route-bound production screens", async ({
    page
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Browse Systems" })
    ).toBeVisible();
    await expect(page.getByText("Production data")).toBeVisible();
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
    await expect(
      page.getByLabel("Full activity content")
    ).toBeVisible();
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
