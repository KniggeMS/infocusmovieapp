import { test, expect } from '@playwright/test';

test.describe('Initial Data Load', () => {
  
  test('should automatically load watchlist after login without manual interaction', async ({ page }) => {
    const user = 'user1@test.com';
    const pass = 'password123';

    // 1. Go to App
    await page.goto('/');
    
    // 2. Login
    await page.fill('input[type="email"]', user);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');

    // 3. Wait for the search bar (indicates we are on the home screen)
    await expect(page.locator('#search-movies')).toBeVisible({ timeout: 20000 });

    // 4. CRITICAL CHECK: Check if any watchlist items (with trash icons) appear
    // We expect the watchlist to load automatically.
    // We give it a generous 10 seconds to finish the network request and render.
    const trashIcon = page.locator('svg.lucide-trash2').first();
    
    try {
        await expect(trashIcon).toBeVisible({ timeout: 10000 });
        console.log('Success: Watchlist loaded automatically.');
    } catch (e) {
        console.error('FAILED: Watchlist did not load automatically. Manual interaction might be required.');
        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/failed-initial-load.png' });
        throw e;
    }
  });
});
