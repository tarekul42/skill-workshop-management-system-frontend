import { test, expect } from "@playwright/test";

test.describe("Workshop Management", () => {
  test("should redirect to login if accessing dashboard without session", async ({ page }) => {
    await page.goto("/admin/workshops", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });

  test("should show workshop list page elements", async ({ page }) => {
    await page.goto("/workshops", { waitUntil: "domcontentloaded" });

    await expect(page.getByPlaceholder(/Search workshops/i)).toBeVisible();
    // Use a broader selector for the Categories link — it may be in nav, header, or banner
    await expect(page.getByRole("link", { name: "Categories" }).first()).toBeVisible();
  });
});
