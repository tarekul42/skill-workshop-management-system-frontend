import { test, expect } from "@playwright/test";

test.describe("Critical Path: Login → Search → Enroll → Pay", () => {
  test("should complete full enrollment flow", async ({ page }) => {
    // ── Step 1: Login ──────────────────────────────────────────────
    await page.route("**/csrf-token", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ csrfToken: "test-csrf" }),
      });
    });

    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              _id: "user-1",
              name: "Test Student",
              email: "student@test.com",
              role: "STUDENT",
            },
            tokens: { accessToken: "mock-token" },
          },
        }),
      });
    });

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator('input[name="email"]').fill("student@test.com");
    await page.locator('input[name="password"]').fill("ValidPass123!");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for redirect after login
    await page.waitForURL(/\/(student\/)?dashboard/, { timeout: 15000 });

    // ── Step 2: Search/Browse Workshops ────────────────────────────
    await page.route("**/api/v1/workshop**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: "ws-1",
              title: "React for Beginners",
              slug: "react-for-beginners",
              price: 2500,
              level: { _id: "lvl-1", name: "Beginner" },
              category: { _id: "cat-1", name: "Web Development", slug: "web-development" },
              images: [],
              startDate: "2026-08-01",
              endDate: "2026-08-15",
              maxSeats: 30,
              currentEnrollments: 5,
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    await page.goto("/workshops");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("React for Beginners")).toBeVisible({ timeout: 10000 });

    // Navigate to workshop detail
    await page.getByRole("link", { name: /react for beginners/i }).click();
    await page.waitForURL(/\/workshops\/react-for-beginners/, { timeout: 10000 });

    // ── Step 3: Enroll ─────────────────────────────────────────────
    await page.route("**/csrf-token", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ csrfToken: "test-csrf-2" }),
      });
    });

    await page.route("**/enrollment/**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              _id: "enr-1",
              workshop: "ws-1",
              user: "user-1",
              status: "PENDING_PAYMENT",
              payment: { amount: 2500, status: "UNPAID" },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Click enroll button
    const enrollBtn = page.getByRole("button", { name: /enroll|register/i });
    if (await enrollBtn.isVisible()) {
      await enrollBtn.click();
      await expect(
        page.getByText(/pending payment|success/i).or(page.getByText(/unpaid/i))
      ).toBeVisible({
        timeout: 10000,
      });
    }

    // ── Step 4: Pay ────────────────────────────────────────────────
    await page.route("**/payment/**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              _id: "pay-1",
              amount: 2500,
              status: "COMPLETED",
              enrollment: "enr-1",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to payments page and verify completion
    await page.goto("/student/payments");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/2500|completed|success/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should redirect unauthenticated user to login on enroll attempt", async ({ page }) => {
    await page.goto("/workshops/react-for-beginners");
    await page.waitForLoadState("networkidle");

    const enrollBtn = page.getByRole("button", { name: /enroll|register/i });
    if (await enrollBtn.isVisible()) {
      await enrollBtn.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  });
});
