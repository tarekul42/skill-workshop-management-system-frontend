import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page with all elements", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Skill Workshop.*Authentication/);
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Invalid email or password",
        }),
      });
    });

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator('input[name="email"]').fill("invalid@example.com");
    await page.locator('input[name="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Sign up as Student" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
