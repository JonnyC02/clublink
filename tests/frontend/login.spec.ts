import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
    test('should load the login page', async ({ page }) => {
        await page.goto('/login');
        const title = await page.title();
        expect(title).toBe('ClubLink - Login');
    });

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
        const emailError = await page.textContent('text="Email is required"');
        const passwordError = await page.textContent('text="Password is required"');
        expect(emailError).toBeTruthy();
        expect(passwordError).toBeTruthy();
    });

    test('should show an error for invalid email format', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'invalidemail');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        const emailError = await page.textContent('text="Invalid email format"');
        expect(emailError).toBeTruthy();
    });

    test('should successfully log in with valid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'user@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should display error for incorrect credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'user@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        const errorMessage = await page.textContent('text="Invalid email or password"');
        expect(errorMessage).toBeTruthy();
    });

    test('should have a working "Forgot Password" link', async ({ page }) => {
        await page.goto('/login');
        await page.click('text="Forgot Password?"');
        await expect(page).toHaveURL('/forgot-password');
    });

    test('should have a working "Sign Up" link', async ({ page }) => {
        await page.goto('/login');
        await page.click('text="Sign Up"');
        await expect(page).toHaveURL('/signup');
    });

    test('should prevent login button spam during submission', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'user@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        const isDisabled = await page.isDisabled('button[type="submit"]');
        expect(isDisabled).toBeTruthy();
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

    test('should focus the email input on page load', async ({ page }) => {
        await page.goto('/login');
        const emailFieldFocused = await page.evaluate(() => {
            const activeElement = document.activeElement;
            return activeElement?.tagName === 'INPUT' && (activeElement as HTMLInputElement).name === 'email';
        });
        expect(emailFieldFocused).toBeTruthy();
    });
});