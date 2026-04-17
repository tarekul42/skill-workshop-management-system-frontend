import { test, expect } from "@playwright/test";

test.describe("Workshop Management", () => {
  test("should redirect to login if accessing dashboard without session", async ({ page }) => {
    await page.goto("/admin/workshops");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should show workshop list page elements", async ({ page }) => {
    // This would normally require login, but we can check the public workshops page
    await page.goto("/workshops");
    
    await expect(page.getByPlaceholder(/Search workshops/i)).toBeVisible();
    // Check if some filter exists
    await expect(page.getByText(/Categories/i)).toBeVisible();
  });
});
