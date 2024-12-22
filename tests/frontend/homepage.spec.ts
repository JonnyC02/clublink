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

  test('should navigate to login page when login button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.click('text="Login"');
    await expect(page).toHaveURL('/login');
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto('/');
    const navLinks = await page.locator('nav a').allTextContents();
    expect(navLinks).toEqual(['Home', 'Browse Clubs', 'Events', 'About']);
  });

  test('should load dynamic content', async ({ page }) => {
    await page.goto('/');
    const dynamicContent = await page.textContent('.dynamic-section');
    expect(dynamicContent).toContain('Popular Clubs');
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const isVisible = await page.isVisible('text="Login"');
    expect(isVisible).toBeTruthy();
  });

  test('should match homepage screenshot', async ({ page }) => {
    await page.goto('/');
    expect(await page.screenshot()).toMatchSnapshot('homepage.png');
  });

  test('should have accessibility attributes on main header', async ({ page }) => {
    await page.goto('/');
    const headerRole = await page.getAttribute('h1', 'role');
    expect(headerRole).toBe('heading');
  });
});