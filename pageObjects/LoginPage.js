// ============================================================
// LoginPage.js
// Page object for the Login page.
// Locators are in the constructor; actions + assertions are functions.
// ============================================================

const { expect } = require('@playwright/test');
const { urls, messages } = require('../utils/testData');

class LoginPage {
  // Save the page and all locators of the Login page
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#userEmail');                   // Email box
    this.passwordInput = page.locator('#userPassword');             // Password box
    this.loginButton = page.locator('#login');                      // Login button
    this.registerLink = page.locator('a', { hasText: 'Register here' }); // Link to Register page
    this.toastMessage = page.locator('#toast-container');           // Pop-up message (top right)
    this.fieldErrors = page.locator('.invalid-feedback');           // Red text under fields
  }

  // Open the Login page
  async goto() {
    await this.page.goto(urls.login);
  }

  // Type email + password and click Login
  async login(user) {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }

  // Click "Register here" to open the Register page
  async clickRegisterLink() {
    await this.registerLink.click();
  }

  // Assert: login worked (success toast + dashboard URL)
  async verifyLoginSuccess() {
    await expect(this.toastMessage).toContainText(messages.loginSuccess);
    await expect(this.page).toHaveURL(/dashboard/);
  }

  // Assert: the pop-up message has the expected text
  async verifyToastMessage(expectedText) {
    await expect(this.toastMessage).toContainText(expectedText);
  }

  // Assert: a red field error with the expected text is visible
  async verifyFieldError(expectedText) {
    await expect(this.fieldErrors.filter({ hasText: expectedText })).toBeVisible();
  }

  // Assert: we are still on (or back on) the Login page
  async verifyLoginPageShown() {
    await expect(this.page).toHaveURL(/auth\/login/);
    await expect(this.loginButton).toBeVisible();
  }
}

module.exports = { LoginPage };
