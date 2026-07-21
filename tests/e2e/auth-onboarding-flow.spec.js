import { test, expect } from '@playwright/test';

test.describe('Auth Onboarding / Profile Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock Supabase Auth Session Resolution
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mock-user-uuid',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
        }),
      });
    });

    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-user-uuid',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        }),
      });
    });

    // 2. Mock Supabase Database Reads for profile (uncompleted first)
    await page.route('**/rest/v1/users?id=eq.*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mock-user-uuid',
              email: 'test@example.com',
              full_name: 'Test User',
              phone: null,
              city: null,
              role: 'client',
              profile_completed: false, // Uncompleted profile
            },
          ]),
        });
      } else if (method === 'PATCH') {
        // Assert the correct payload is sent
        const payload = route.request().postDataJSON();
        expect(payload.phone).toBe('555-0199');
        expect(payload.city).toBe('Hyderabad');
        expect(payload.profile_completed).toBe(true);

        await route.fulfill({
          status: 204,
          contentType: 'application/json',
        });
      }
    });

    // Mock designer applications read to prevent dashboard loading crashes
    await page.route('**/rest/v1/designer_applications?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('forces redirect to /complete-profile on login when profile is incomplete', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');

    // Intercept subsequent GET users to show completed after the PATCH triggers
    let profileUpdated = false;
    await page.route('**/rest/v1/users?id=eq.*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mock-user-uuid',
              email: 'test@example.com',
              full_name: 'Test User',
              phone: profileUpdated ? '555-0199' : null,
              city: profileUpdated ? 'Hyderabad' : null,
              role: 'client',
              profile_completed: profileUpdated,
            },
          ]),
        });
      } else if (method === 'PATCH') {
        profileUpdated = true;
        await route.fulfill({ status: 204 });
      }
    });

    // Click sign in
    await page.click('button:has-text("Sign In")');

    // Verify it intercepts and redirects to /complete-profile
    await expect(page).toHaveURL(/\/complete-profile/);

    // Locate fields and type complete data
    await page.fill('input[id="phone"]', '555-0199');
    await page.fill('input[id="city"]', 'Hyderabad');

    // Click submit
    await page.click('button:has-text("Explore Marketplace")');

    // Verify redirect back to homepage (or dashboard) after completing profile
    await expect(page).toHaveURL('/');
  });
});
