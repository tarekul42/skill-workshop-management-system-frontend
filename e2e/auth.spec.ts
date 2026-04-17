import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page with all elements", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/Sign In | Skill Workshop/);
    await expect(page.locator("h1")).toContainText("Skill Workshop");
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill("wrong@example.com");
    await page.getByLabel(/Password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Since we don't have a backend running in this environment, 
    // it might fail with a network error or a real error if the backend is mocked.
    // We just check that the button shows loading state or an error appears.
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Sign up/i, exact: true }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
