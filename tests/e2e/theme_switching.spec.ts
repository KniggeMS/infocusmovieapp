import { test, expect } from '@playwright/test';

test.use({ 
  viewport: { width: 1280, height: 720 }, // Force Desktop to ensure Sidebar is visible
  headless: true // Force Headless
});

test.describe('Theme Switching', () => {
  test('should allow user to switch themes', async ({ page }) => {
    // FALLBACK: Use manual test user
    const user = process.env.TEST_USER_EMAIL || 'user1@test.com';
    const pass = process.env.TEST_USER_PASSWORD || 'password123';

    console.log('Starting Theme Test...');

    // 1. Login
    await page.goto('/');
    
    // Wait for App to settle (either Home or Login)
    const homeIndicator = page.locator('#search-movies');
    const loginIndicator = page.locator('input[type="email"]');

    console.log('Waiting for App to settle...');
    await Promise.race([
        homeIndicator.waitFor({ state: 'visible', timeout: 30000 }),
        loginIndicator.waitFor({ state: 'visible', timeout: 30000 })
    ]).catch(() => {
        console.log('Timeout waiting for Home or Login.');
    });

    // Check if we are already logged in or need login
    if (await loginIndicator.isVisible()) {
        console.log('Logging in...');
        await loginIndicator.fill(user);
        await page.locator('input[type="password"]').fill(pass);
        await page.click('button[type="submit"]');

        // Wait for either Success (Search) or Failure (Error Message)
        const success = page.locator('#search-movies');
        const failure = page.locator('.bg-red-900\\/50'); // Error alert class based on LoginScreen.tsx

        await Promise.race([
            success.waitFor({ state: 'visible', timeout: 20000 }),
            failure.waitFor({ state: 'visible', timeout: 20000 }).then(async () => {
                 const msg = await failure.textContent();
                 throw new Error(`Login failed: ${msg}`);
            })
        ]);
    } else {
        // Already logged in?
        console.log('Already on Home.');
        await expect(page.locator('#search-movies')).toBeVisible({ timeout: 20000 });
    }
    
    console.log('Login successful/verified.');

    // 2. Open Profile
    await page.click('button[aria-label="Profile"]');
    // Wait for modal content
    await expect(page.locator('text=InFocus v2.8.1').or(page.locator('text=Sign Out'))).toBeVisible();
    console.log('Profile Modal opened.');

    // 3. Navigate to Appearance
    // Try click by text first (i18n safe?) -> Fallback to icon class structure
    // We look for the button inside the Sidebar (hidden on mobile, but we forced desktop)
    const appearanceTab = page.locator('button').filter({ has: page.locator('svg.lucide-palette') }).first();
    await appearanceTab.click();
    console.log('Switched to Appearance Tab.');
    
    // Wait for theme options to appear
    await expect(page.locator('text=Glassmorphism')).toBeVisible();

    // 4. Switch to Light Mode
    console.log('Switching to Light...');
    await page.click('text=Light'); // Matches "Light" (EN) or "Hell" (DE)? Our test user is likely EN or DE.
    // Better: Click the button that *contains* the Sun icon
    // await page.locator('button').filter({ has: page.locator('svg.lucide-sun') }).click();
    
    // Let's rely on the text from our i18n file, assuming EN default or checking both
    const lightBtn = page.locator('button').filter({ hasText: /Light|Hell/ }).first();
    await lightBtn.click();
    
    // Verify HTML attribute
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light', { timeout: 5000 });
    console.log('Verified Light Theme.');
    
    // 5. Switch to Glass Mode
    console.log('Switching to Glass...');
    const glassBtn = page.locator('button').filter({ hasText: 'Glassmorphism' }).first();
    await glassBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'glass');
    console.log('Verified Glass Theme.');

    // 6. Switch back to Dark Mode (Reset state)
    console.log('Resetting to Dark...');
    const darkBtn = page.locator('button').filter({ hasText: /Dark|Dunkel/ }).first();
    await darkBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    console.log('Theme switching verified successfully.');
  });
});