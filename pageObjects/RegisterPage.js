// ============================================================
// RegisterPage.js
// Page object for the Register page.
// ============================================================

const { expect } = require('@playwright/test');
const { urls, messages } = require('../utils/testData');

class RegisterPage {
  // Save the page and all locators of the Register page
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#userEmail');
    this.mobileInput = page.locator('#userMobile');
    this.occupationSelect = page.locator('select[formcontrolname="occupation"]'); // Dropdown
    this.maleRadio = page.locator('input[value="Male"]');
    this.femaleRadio = page.locator('input[value="Female"]');
    this.passwordInput = page.locator('#userPassword');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.ageCheckbox = page.locator(':text-is("I am 18 year or Older")')   // "I am 18 year or older"
    this.registerButton = page.locator('#login');                 // Register button (id is "login")
    this.successHeading = page.locator('h1.headcolor');          // "Account Created Successfully"
    this.toastMessage = page.locator('#toast-container');        // Pop-up message
    this.fieldErrors = page.locator('.invalid-feedback');        // Red text under fields
  }

  // Open the Register page directly
  async goto() {
    await this.page.goto(urls.register);
  }

  // Fill every field of the form using one user object from utils
  async fillRegisterForm(user) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.mobileInput.fill(user.mobile);
    await this.occupationSelect.selectOption({ label: user.occupation });

    // Pick the gender radio button
    if (user.gender === 'Female') {
      await this.femaleRadio.check();
    } else {
      await this.maleRadio.check();
    }

    await this.passwordInput.fill(user.password);
    // Use confirmPassword if the user object has one, else repeat the password
    await this.confirmPasswordInput.fill(user.confirmPassword || user.password);
  }

  // Tick the "18 years or older" checkbox
  async tickAgeCheckbox() {
    await this.ageCheckbox.check();
  }

  // Click Register
  async clickRegister() {
    await this.registerButton.click();
  }

  // Assert: account was created
  async verifyRegisterSuccess() {
    await expect(this.successHeading).toHaveText(messages.registerSuccess);
  }

  // Assert: pop-up message text (e.g. user already exists)
  async verifyToastMessage(expectedText) {
    await expect(this.toastMessage).toContainText(expectedText);
  }

  // Assert: a red field error with the expected text is visible
  async verifyFieldError(expectedText) {
    await expect(this.fieldErrors.filter({ hasText: expectedText })).toBeVisible();
  }

  // Assert: page did NOT move to the success screen
  async verifyNotRegistered() {
    await expect(this.successHeading).toBeHidden();
    await expect(this.page).toHaveURL(/register/);
  }
}

module.exports = { RegisterPage };
