import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
    test('should display login form elements', async ({ page }) => {
        await page.goto('/login');
        const emailField = await page.isVisible('input[name="email"]');
        const passwordField = await page.isVisible('input[name="password"]');
        const loginButton = await page.isVisible('button[type="submit"]');
        expect(emailField).toBeTruthy();
        expect(passwordField).toBeTruthy();
        expect(loginButton).toBeTruthy();
    });

    test('should show validation errors on empty form submission', async ({ page }) => {
        await page.goto('/login');
        await page.click('button[type="submit"]');

        const emailFocused = await page.evaluate(() => {
            const activeElement = document.activeElement as HTMLInputElement;
            return activeElement.name === 'email';
        });
        expect(emailFocused).toBeTruthy();

        const emailValidity = await page.$eval('input[name="email"]', (input) => (input as HTMLInputElement).checkValidity());
        expect(emailValidity).toBeFalsy();
    });

    test('should show an error for invalid email format', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'invalidemail');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        const emailFocused = await page.evaluate(() => {
            const activeElement = document.activeElement as HTMLInputElement;
            return activeElement.name === 'email';
        });
        expect(emailFocused).toBeTruthy();

        const emailValidity = await page.$eval('input[name="email"]', (input) => (input as HTMLInputElement).checkValidity());
        expect(emailValidity).toBeFalsy();
    });

    test.skip('should successfully log in with valid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'user@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should have a working "Sign Up" link', async ({ page }) => {
        await page.goto('/login');
        await page.click('text="Sign Up"');
        await expect(page).toHaveURL('/signup');
    });

    test('should render correctly on mobile devices', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/login');
        const emailField = await page.isVisible('input[name="email"]');
        const passwordField = await page.isVisible('input[name="password"]');
        const loginButton = await page.isVisible('button[type="submit"]');
        expect(emailField).toBeTruthy();
        expect(passwordField).toBeTruthy();
        expect(loginButton).toBeTruthy();
    });
});