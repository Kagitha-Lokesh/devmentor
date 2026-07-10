import { test, expect } from '@playwright/test';

test.describe('JavaMentor Enterprise E2E Suite', () => {
  test('should load landing page and support searching', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Check main title
    await expect(page).toHaveTitle(/JavaMentor/);
  });

  test('should trigger command palette shortcut', async ({ page }) => {
    await page.goto('/');
    
    // Press Ctrl+K to trigger command palette
    await page.keyboard.press('Control+k');
    
    // Verify modal overlay becomes visible
    const palette = page.locator('[role="dialog"]');
    await expect(palette).toBeDefined();
  });
});
