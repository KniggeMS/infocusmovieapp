import { test, expect } from '@playwright/test';

test.describe('Movie Details & Streaming Providers', () => {
  
  test('should open details modal and show streaming providers', async ({ page }) => {
    // 1. Intercept TMDB Details Call
    await page.route('**/3/movie/550?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 550,
          title: 'Fight Club',
          overview: 'Project Mayhem.',
          release_date: '1999-10-15',
          runtime: 139,
          poster_path: '/poster.jpg',
          credits: {
            crew: [{ job: 'Director', name: 'David Fincher' }],
            cast: [{ name: 'Brad Pitt', character: 'Tyler Durden', profile_path: '/pitt.jpg' }]
          },
          'watch/providers': {
            results: {
              DE: {
                flatrate: [{ provider_name: 'Netflix', logo_path: '/netflix.jpg' }],
                buy: [{ provider_name: 'Amazon', logo_path: '/amazon.jpg' }]
              }
            }
          }
        })
      });
    });

    // 2. Intercept Trending Call (to have a movie to click on)
    // We mock the Supabase logic or just rely on the app state being empty and manually adding?
    // Easier strategy: Inject a movie directly into the DOM or State via console script if possible, 
    // BUT since we use a real app, let's just MOCK the initial load if possible.
    // Assuming the app does a LOAD_MOVIES on start. If Supabase is empty, we see nothing.
    // Strategy: Search for "Fight Club" (mocked search) -> Add it -> Click it.
    
    // Mock Search
    await page.route('**/3/search/movie*', async route => {
        await route.fulfill({
            status: 200,
            body: JSON.stringify({
                results: [{ id: 550, title: 'Fight Club', poster_path: '/poster.jpg' }]
            })
        });
    });

    // Mock Trending (for LOAD_MOVIES call after add)
    await page.route('**/3/discover/movie*sort_by=popularity.desc*', async route => {
        await route.fulfill({
            status: 200,
            body: JSON.stringify({
                results: [{ id: 550, title: 'Fight Club', poster_path: '/poster.jpg', overview: '' }]
            })
        });
    });

    // 3. Start Test Flow
    await page.goto('/');

    // Search and Add (to ensure we have the item locally)
    const searchInput = page.getByPlaceholder('Search movies...');
    await searchInput.fill('Fight Club');
    
    // Wait for search result card
    const movieCard = page.locator('.group').first(); 
    await expect(movieCard).toBeVisible();
    
    // Click Add
    await movieCard.locator('button').click(); // Add button
    
    // Clear search to go back to list
    await searchInput.fill('');
    await expect(page.locator('text=Fight Club')).toHaveCount(1); // Wait for results to stabilize
    
    // 4. Click on the Movie Card Image
    const listCard = page.locator('.group', { hasText: 'Fight Club' }).first();
    await listCard.locator('img').first().click({ force: true });

    // Wait for "Synchronizing..." to disappear
    await expect(page.locator('text=Synchronizing...')).not.toBeVisible();

    // 5. Assert Modal
    // Check Modal Title
    await expect(page.locator('h2', { hasText: 'Fight Club' })).toBeVisible({ timeout: 10000 });

    // Check Director (This proves Credits were fetched and mapped)
    await expect(page.getByText('David Fincher')).toBeVisible();

    // Check Streaming Provider (This proves Watch/Providers were fetched and mapped)
    const netflixLogo = page.locator('img[alt="Netflix"]');
    await expect(netflixLogo).toBeVisible();
    
    // Close Modal
    await page.locator('button:has(.lucide-x)').click();
    await expect(modal).not.toBeVisible();
  });
});
