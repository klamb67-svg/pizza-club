import { test, expect, Page } from '@playwright/test';

const APP_URL = 'http://localhost:8081';

// Helper function to wait for page to be ready
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Small delay for React to render
}

// Helper function to capture console errors
async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      errors.push(text);
      console.log(`[CONSOLE ERROR] ${text}`);
    }
  });
  page.on('pageerror', (error) => {
    const errorMsg = `${error.name}: ${error.message}\n${error.stack}`;
    errors.push(errorMsg);
    console.log(`[PAGE ERROR] ${errorMsg}`);
  });
  return errors;
}

// Helper to type with delays (like a real user)
async function typeLikeUser(page: Page, selector: string, text: string) {
  await page.fill(selector, '');
  for (const char of text) {
    await page.type(selector, char, { delay: 50 + Math.random() * 50 });
  }
}

test.describe('Pizza Club Member Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors for each test
    const errors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      console.log(`[BROWSER CONSOLE ${msg.type()}]: ${text}`);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    page.on('pageerror', (error) => {
      const errorMsg = `${error.name}: ${error.message}\n${error.stack}`;
      errors.push(errorMsg);
      console.log(`[PAGE ERROR]: ${errorMsg}`);
    });
    (page as any).__capturedErrors = errors;
  });

  test('Home screen loads correctly', async ({ page }) => {
    console.log('\n=== TEST: Home screen loads ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    // Check if home screen elements are present
    const hasImage = await page.locator('img').count() > 0;
    expect(hasImage).toBeTruthy();
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
      throw new Error(`Console errors found: ${errors.join(', ')}`);
    }
    console.log('✅ Home screen loaded successfully');
  });

  test('New member flow: Home → Login → Signup → Frontdoor → Menu', async ({ page }) => {
    console.log('\n=== TEST: New member flow ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    // Click on home to go to login
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    // Verify we're on login page
    const loginTitle = page.locator('text=/Who goes there/i');
    await expect(loginTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ Navigated to login page');
    
    // Enter name for new member - use fill directly since input is hidden
    const nameInput = page.locator('input').first();
    await nameInput.fill('Test Pizza One');
    await waitForPageReady(page);
    
    // Set up dialog handler before clicking
    let dialogMessage = '';
    page.on('dialog', dialog => {
      dialogMessage = dialog.message();
      console.log(`[DIALOG]: ${dialogMessage}`);
      dialog.accept();
    });
    
    // Press Enter key (input has onSubmitEditing handler)
    console.log('Pressing Enter key to submit...');
    await nameInput.press('Enter');
    
    // Wait for navigation - the login function will navigate to signup for new members
    await page.waitForTimeout(2000);
    
    // Check current URL and console for errors
    const currentUrl = page.url();
    console.log(`Current URL after click: ${currentUrl}`);
    
    if (dialogMessage) {
      console.log(`⚠️ Dialog shown: ${dialogMessage}`);
    }
    
    // Check for alerts or errors in page content
    const pageContent = await page.content();
    if (pageContent.includes('Need first and last') || pageContent.includes('error')) {
      console.log('⚠️ Validation error or alert detected in page content');
    }
    
    // Log any captured errors
    const capturedErrors = (page as any).__capturedErrors || [];
    if (capturedErrors.length > 0) {
      console.log('❌ ERRORS CAPTURED:', capturedErrors);
    }
    
    // Should navigate to signup page
    await page.waitForURL(/signup/, { timeout: 15000 });
    // Wait for page to be fully loaded and fonts to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait longer for fonts and rendering
    
    // Check for signup page - look for input fields
    // React Native Web may mark elements as "hidden" due to CSS, but they're still interactable
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input fields on signup page`);
    
    // Get inputs by index - address, phone, password
    const addressInput = inputs.nth(0);
    const phoneInput = inputs.nth(1);
    const passwordInput = inputs.nth(2);
    
    // Fill inputs - use force if needed since React Native Web may mark them as hidden
    await addressInput.fill('123 Test Street', { force: true });
    await phoneInput.fill('555-123-4567', { force: true });
    await passwordInput.fill('testpass123', { force: true });
    console.log('✅ Filled signup form');
    
    // Set up dialog handler BEFORE clicking submit
    page.on('dialog', async dialog => {
      console.log(`[DIALOG]: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Submit form by focusing password field and pressing Enter
    // This triggers onSubmitEditing which calls the submit function
    await passwordInput.focus({ force: true });
    await page.waitForTimeout(300); // Brief pause for focus to register
    await page.keyboard.press('Enter');
    console.log('✅ Submitted signup form via Enter key');
    
    // Wait for signup to process - check console for success/error
    await page.waitForTimeout(3000);
    
    // Check current URL to see where we are
    const signupUrl = page.url();
    console.log(`Current URL after signup submit: ${signupUrl}`);
    
    // Check for any console errors related to signup
    const errors = (page as any).__capturedErrors || [];
    const signupErrors = errors.filter((e: string) => e.includes('SIGNUP') || e.includes('INSERT'));
    if (signupErrors.length > 0) {
      console.log('❌ SIGNUP ERRORS:', signupErrors);
    }
    
    // Should navigate to frontdoor after alert is accepted
    // The signup shows an alert, then navigates in the alert callback
    await page.waitForURL(/frontdoor/, { timeout: 25000 });
    console.log('✅ Navigated to frontdoor');
    
    // Click on door to go to menu
    const doorImage = page.locator('img').first();
    await doorImage.click();
    await waitForPageReady(page);
    
    // Should navigate to menu
    await page.waitForURL(/menu/, { timeout: 10000 });
    const menuTitle = page.locator('text=/Choose Your Pizza/i');
    await expect(menuTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ Navigated to menu - New member flow complete!');
    
    const finalErrors = (page as any).__capturedErrors || [];
    if (finalErrors.length > 0) {
      console.log('❌ ERRORS FOUND:', finalErrors);
    }
  });

  test('Existing member flow: Home → Login → Frontdoor → Menu', async ({ page }) => {
    console.log('\n=== TEST: Existing member flow ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    // Click on home to go to login
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    // Verify we're on login page
    const loginTitle = page.locator('text=/Who goes there/i');
    await expect(loginTitle).toBeVisible({ timeout: 5000 });
    
    // Enter name for existing member (test_pizza_1)
    const nameInput = page.locator('input').first();
    await nameInput.fill('test pizza 1');
    await waitForPageReady(page);
    
    // Press Enter key to submit (same as new member flow)
    console.log('Pressing Enter key to submit...');
    await nameInput.press('Enter');
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Check current URL and console for errors
    const currentUrl = page.url();
    console.log(`Current URL after click: ${currentUrl}`);
    
    // Should navigate directly to frontdoor (existing member)
    await page.waitForURL(/frontdoor/, { timeout: 20000 });
    console.log('✅ Navigated to frontdoor (existing member)');
    
    // Click on door to go to menu
    const doorImage = page.locator('img').first();
    await doorImage.click();
    await waitForPageReady(page);
    
    // Should navigate to menu
    await page.waitForURL(/menu/, { timeout: 10000 });
    const menuTitle = page.locator('text=/Choose Your Pizza/i');
    await expect(menuTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ Navigated to menu - Existing member flow complete!');
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Test member: test_pizza_1', async ({ page }) => {
    console.log('\n=== TEST: test_pizza_1 member ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    await nameInput.fill('test pizza 1');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    // Should go to frontdoor or signup
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Test member: test_member_2', async ({ page }) => {
    console.log('\n=== TEST: test_member_2 member ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    await nameInput.fill('test member 2');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Test member: qa_user_3', async ({ page }) => {
    console.log('\n=== TEST: qa_user_3 member ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    await nameInput.fill('qa user 3');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Empty name', async ({ page }) => {
    console.log('\n=== STRESS TEST: Empty name ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    // Leave empty
    await nameInput.fill('');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    // Should show error or stay on login page
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Space-only name', async ({ page }) => {
    console.log('\n=== STRESS TEST: Space-only name ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    await nameInput.fill('   ');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Long name', async ({ page }) => {
    console.log('\n=== STRESS TEST: Long name ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    const longName = 'A'.repeat(200) + ' B'.repeat(200);
    await nameInput.fill(longName);
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Special characters', async ({ page }) => {
    console.log('\n=== STRESS TEST: Special characters ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    await nameInput.fill('Test!@#$%^&*() User');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    await enterButton.click();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Fast double-clicks on button', async ({ page }) => {
    console.log('\n=== STRESS TEST: Fast double-clicks ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    const nameInput = page.locator('input').first();
    await nameInput.fill('Test User');
    
    const enterButton = page.locator('button:has-text("ENTER")').or(page.locator('text=/ENTER/i')).or(page.locator('button')).first();
    // Fast double-click
    await enterButton.click();
    await enterButton.click();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Back/forward navigation', async ({ page }) => {
    console.log('\n=== STRESS TEST: Back/forward navigation ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    await waitForPageReady(page);
    
    // Go back
    await page.goBack();
    await waitForPageReady(page);
    
    // Go forward
    await page.goForward();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });

  test('Stress test: Refresh during loading', async ({ page }) => {
    console.log('\n=== STRESS TEST: Refresh during loading ===');
    await page.goto(APP_URL);
    await waitForPageReady(page);
    
    const homeImage = page.locator('img').first();
    await homeImage.click();
    
    // Refresh immediately (during navigation)
    await page.reload();
    await waitForPageReady(page);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    
    const errors = (page as any).__capturedErrors || [];
    if (errors.length > 0) {
      console.log('❌ ERRORS FOUND:', errors);
    }
  });
});

