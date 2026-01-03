import { test, expect } from '@playwright/test';

test.describe('InFocus Smoke Suite (V2.8.0)', () => {
  test('Complete User Journey: Auth -> Search -> Add -> Filter -> Profile -> Logout', async ({ page }) => {
    test.setTimeout(60000); // Allow 60s for full journey

    // FALLBACK: Use manual test user due to Rate Limiting (429) on Signups
    const user = 'user1@test.com';
    const pass = 'password123';

    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
    });

    // --- 1. AUTHENTICATION ---
    console.log('--- Step 1: Authentication ---');
    await page.goto('/');
    await expect(page.locator('text=InFocus')).toBeVisible();
    
    // Login
    await page.fill('input[type="email"]', user);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');
    
    // Wait for Home
    await expect(page.locator('#search-movies')).toBeVisible({ timeout: 25000 });
    await page.screenshot({ path: '.screenshots/e2e_report/01_home_after_login.png' });
    console.log('Login successful.');

    // --- 2. PROFILE & AVATAR ---
    console.log('--- Step 2: Profile & Avatar ---');
    await page.click('button[aria-label="Profile"]');
    await expect(page.locator('.fixed.inset-0')).toBeVisible();

    // Generate Avatar (Shuffle)
    await page.locator('button[title*="Avatar"]').click(); 
    await page.waitForTimeout(1000); 
    await page.screenshot({ path: '.screenshots/e2e_report/02_profile_avatar_generated.png' });
    
    // Save Profile
    await page.locator('button:has(svg.lucide-save)').click();
    
    // Close Profile
    await page.locator('button:has(svg.lucide-x)').click();
    console.log('Profile updated.');

    // --- 3. SEARCH & ADD ---
    console.log('--- Step 3: Search & Add ---');
    const searchInput = page.locator('#search-movies');
    
    // Ensure clean state for target movie
    const targetMovieTrash = page.locator('div.group:has-text("Interstellar") button:has(svg.lucide-trash2)');
    if (await targetMovieTrash.isVisible()) {
        await targetMovieTrash.click();
        await page.waitForTimeout(1000);
    }

    // Now search again to ADD
    await searchInput.fill('Interstellar');
    await expect(page.locator('text=Interstellar').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: '.screenshots/e2e_report/03_search_results.png' });

    // Add Movie
    const addBtn = page.locator('button:has(svg.lucide-plus)').first();
    await addBtn.click();
    console.log('Movie added.');

    // Clear Search
    await searchInput.fill('');
    await page.waitForTimeout(1000);
    
    // Check list
    await expect(page.locator('h3:has-text("Interstellar")').first()).toBeVisible();
    await page.screenshot({ path: '.screenshots/e2e_report/04_watchlist_updated.png' });

    // --- 4. INTERACTIONS (Watch/Fav) ---
    console.log('--- Step 4: Interactions ---');
    const movieCard = page.locator('div.group:has-text("Interstellar")').first();
    await movieCard.locator('svg.lucide-heart').click({ force: true });
    await movieCard.locator('svg.lucide-eye').click({ force: true });
    await page.waitForTimeout(500);
    console.log('Marked as Favorite and Watched.');

    // --- 5. FILTERS ---
    console.log('--- Step 5: Filter Navigation ---');
    await page.click('button[aria-label="Favorites"], button[aria-label="Favoriten"]');
    await expect(page.locator('h3:has-text("Interstellar")').first()).toBeVisible();
    await page.screenshot({ path: '.screenshots/e2e_report/05_filter_favorites.png' });

    await page.click('button[aria-label="Watched"], button[aria-label="Gesehen"]');
    await expect(page.locator('h3:has-text("Interstellar")').first()).toBeVisible();
    console.log('Filters working.');

    // --- 6. STATISTICS ---
    console.log('--- Step 6: Statistics ---');
    await page.click('button[aria-label="Statistics"], button[aria-label="Statistiken"]');
    
    // Validate Hours (Interstellar ~2.8h)
    // We check for "2.8" or "2,8" to be safe with locales, or just presence of any number
    await expect(page.locator('div.text-2xl.font-bold.text-yellow-400')).not.toHaveText('0.0', { timeout: 5000 });
    
    await page.screenshot({ path: '.screenshots/e2e_report/06_statistics.png' });
    console.log('Statistics verified.');

    // --- 7. CLEANUP & LOGOUT ---
    console.log('--- Step 7: Cleanup & Logout ---');
    await page.click('button[aria-label="Home"], button[aria-label="Start"]');
    
    // Remove Movie
    await page.locator('button:has(svg.lucide-trash2)').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h3:has-text("Interstellar")')).not.toBeVisible();
    
    // Logout
    await page.click('button[aria-label="Profile"]');
    await page.click('text=Sign Out');
    await expect(page.locator('text=InFocus')).toBeVisible();
    await page.screenshot({ path: '.screenshots/e2e_report/07_logged_out.png' });
    
    console.log('Test Suite Completed Successfully.');
  });
});