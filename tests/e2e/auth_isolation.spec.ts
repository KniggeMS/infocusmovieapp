import { test, expect } from '@playwright/test';

test.describe('Auth & Data Isolation', () => {
  
  test('should clear watchlist upon logout and show only user-specific data', async ({ page }) => {
    // Enable browser console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    const user1 = 'user1@test.com';
    const user2 = 'user2@test.com';
    const pass = 'password123';

    // 1. Go to App
    await page.goto('/');
    
    // 2. Login User 1
    await page.fill('input[type="email"]', user1);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');

    // 3. Wait for Home Screen
    const searchInput = page.locator('#search-movies');
    await expect(searchInput).toBeVisible({ timeout: 20000 });
    console.log('User 1 logged in successfully.');
    
    // 4. Search and Add a movie
    await searchInput.fill('Inception');
    await page.waitForTimeout(2000); // Wait for results
    
    const addBtn = page.locator('button:has(svg.lucide-plus)').first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();
    console.log('Clicked Add button.');

    // Check if error appears
    const errorBox = page.locator('.bg-red-900');
    if (await errorBox.count() > 0 && await errorBox.first().isVisible()) {
        console.error('Error during ADD:', await errorBox.first().textContent());
    }
    
    // 5. Clear search and verify presence in personal watchlist
    await searchInput.fill('');
    await page.waitForTimeout(2000);
    
    const trashBtn = page.locator('button:has(svg.lucide-trash2)').first();
    await expect(trashBtn).toBeVisible({ timeout: 10000 });
    console.log('Movie confirmed in User 1 watchlist.');

    // 6. Logout User 1
    await page.click('button[aria-label="Profile"]');
    await page.click('text=Sign Out');
    await expect(page.locator('text=InFocus')).toBeVisible();
    console.log('User 1 logged out.');

    // 7. Login User 2
    await page.fill('input[type="email"]', user2);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');

    // 8. Wait for Home Screen (User 2)
    await expect(page.locator('#search-movies')).toBeVisible({ timeout: 20000 });
    console.log('User 2 logged in.');

    // 9. CRITICAL CHECK: User 2 should NOT see any Trash icons
    await page.waitForTimeout(3000); 
    const trashIconsCount = await page.locator('svg.lucide-trash2').count();
    console.log(`Isolation Check: Trash icons found for User 2: ${trashIconsCount}`);
    
    expect(trashIconsCount).toBe(0);
    
    console.log('VERIFIED: User data is strictly isolated.');
  });
});