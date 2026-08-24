import { expect, test } from "@playwright/test";

test("loads the QC Field Guide foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Foundation Home" })
  ).toBeVisible();
  await expect(
    page.getByText("Temporary development scaffold").first()
  ).toBeVisible();
});
