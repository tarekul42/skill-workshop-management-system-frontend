import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page with all elements", async ({ page }) => {
    await page.goto("/login");

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

    const email = page.locator('input[name="email"]');
    const password = page.locator('input[name="password"]');

    await email.click();
    await email.pressSequentially("invalid@example.com");
    await password.click();
    await password.pressSequentially("wrongpassword");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up as Student" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
