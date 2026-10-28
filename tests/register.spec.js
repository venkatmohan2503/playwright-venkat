// ============================================================
// register.spec.js
// R01      -> registers the 3 users. Run ONE time only: npm run register
//             (its title has the tag @registerOnce so "npm test" skips it)
// R02-R07  -> negative / edge registration checks (run with npm test)
// ============================================================

const { test } = require('@playwright/test');
const { RegisterPage } = require('../pageObjects/RegisterPage');
const { registeredUsers, invalidRegisterData, messages } = require('../utils/testData');
const { saveFailureSnapshot } = require('../utils/healer/saveFailureSnapshot');

// After every test: if it failed, save page HTML + error for the auto-heal script
test.afterEach(saveFailureSnapshot);

// ---------- R01: register each of the 3 users (parameterized) ----------
// The loop creates one separate test per user from utils.
for (const user of registeredUsers) {
  test(`R01 - register user ${user.email} @registerOnce`, async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.fillRegisterForm(user);
    await registerPage.tickAgeCheckbox();
    await registerPage.clickRegister();

    // Assert: account created
    await registerPage.verifyRegisterSuccess();
  });
}

test.describe('Registration - negative and edge cases', () => {
  // A new RegisterPage for each test
  let registerPage;

  // Before every test: open the Register page
  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('R02 - email that is already registered shows error', async () => {
    await registerPage.fillRegisterForm(registeredUsers[0]);
    await registerPage.tickAgeCheckbox();
    await registerPage.clickRegister();

    // Assert: "already exists" toast and no success screen
    await registerPage.verifyToastMessage(messages.userAlreadyExists);
    await registerPage.verifyNotRegistered();
  });

  test('R03 - empty form shows required field errors', async () => {
    await registerPage.clickRegister();

    // Assert: required-field errors and no success screen
    await registerPage.verifyFieldError(messages.firstNameRequired);
    await registerPage.verifyFieldError(messages.emailRequired);
    await registerPage.verifyNotRegistered();
  });

  test('R04 - invalid email format shows error', async () => {
    // Copy user 1 and change only the email
    const user = { ...registeredUsers[0], email: invalidRegisterData.badEmail };

    await registerPage.fillRegisterForm(user);
    await registerPage.tickAgeCheckbox();
    await registerPage.clickRegister();

    await registerPage.verifyFieldError(messages.invalidEmail);
    await registerPage.verifyNotRegistered();
  });

  test('R05 - phone number with 9 digits shows error', async () => {
    // Copy user 1 and change only the mobile number
    const user = { ...registeredUsers[0], mobile: invalidRegisterData.shortPhone };

    await registerPage.fillRegisterForm(user);
    await registerPage.tickAgeCheckbox();
    await registerPage.clickRegister();

    await registerPage.verifyFieldError(messages.phoneTenDigits);
    await registerPage.verifyNotRegistered();
  });

  test('R06 - passwords that do not match show error', async () => {
    // Copy user 1 and give a different confirm password
    const user = { ...registeredUsers[0], confirmPassword: invalidRegisterData.mismatchPassword };

    await registerPage.fillRegisterForm(user);
    await registerPage.tickAgeCheckbox();
    await registerPage.clickRegister();

    await registerPage.verifyFieldError(messages.passwordMismatch);
    await registerPage.verifyNotRegistered();
  });

  test('R07 - age checkbox not ticked shows error', async () => {
    await registerPage.fillRegisterForm(registeredUsers[0]);
    // Do NOT tick the age checkbox
    await registerPage.clickRegister();

    await registerPage.verifyFieldError(messages.ageCheckboxRequired);
    await registerPage.verifyNotRegistered();
  });
});
