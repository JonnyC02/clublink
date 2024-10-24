import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBe('ClubLink - Find your Club');
  });

  test('should display the correct header', async ({ page }) => {
    await page.goto('/');
    const header = await page.textContent('h1');
    expect(header).toBe('Discover Your Passion with ClubLink');
  });

  test('should have a login button', async ({ page }) => {
    await page.goto('/');
    const loginButton = await page.$('text="Login"');
    expect(loginButton).toBeTruthy();
  });
});
