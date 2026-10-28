// ============================================================
// login.spec.js
// L01      -> valid login for each of the 3 users (parameterized)
// L02-L05  -> negative / edge login checks
// L06      -> logout
// ============================================================

const { test } = require('@playwright/test');
const { LoginPage } = require('../pageObjects/LoginPage');
const { DashboardPage } = require('../pageObjects/DashboardPage');
const { registeredUsers, invalidUsers, messages } = require('../utils/testData');
const { saveFailureSnapshot } = require('../utils/healer/saveFailureSnapshot');

// After every test: if it failed, save page HTML + error for the auto-heal script
test.afterEach(saveFailureSnapshot);

// ---------- L01: valid login for every user in utils ----------
for (const user of registeredUsers) {
  test(`L01 - valid login for ${user.email}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(user);

    // Assert: success toast, dashboard URL and products visible
    await loginPage.verifyLoginSuccess();
    await dashboardPage.verifyPageLoaded();
  });
}

test.describe('Login - negative, edge and logout', () => {
  let loginPage;
  let dashboardPage;

  // Before every test: open the Login page
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('L02 - wrong password shows error', async () => {
    await loginPage.login(invalidUsers.wrongPassword);

    // Assert: error toast and still on login page
    await loginPage.verifyToastMessage(messages.loginFailed);
    await loginPage.verifyLoginPageShown();
  });

  test('L03 - unregistered email shows error', async () => {
    await loginPage.login(invalidUsers.unregistered);

    await loginPage.verifyToastMessage(messages.loginFailed);
    await loginPage.verifyLoginPageShown();
  });

  test('L04 - empty email and password show required errors', async () => {
    await loginPage.login(invalidUsers.empty);

    await loginPage.verifyFieldError(messages.emailRequired);
    await loginPage.verifyFieldError(messages.passwordRequired);
    await loginPage.verifyLoginPageShown();
  });

  test('L05 - invalid email format shows error', async () => {
    await loginPage.login(invalidUsers.invalidFormat);

    await loginPage.verifyFieldError(messages.invalidEmail);
    await loginPage.verifyLoginPageShown();
  });

  test('L06 - user can log out', async () => {
    await loginPage.login(registeredUsers[0]);
    await loginPage.verifyLoginSuccess();

    // signOut() also asserts the "Logout Successfully" toast
    await dashboardPage.signOut();

    // Assert: back on the login page
    await loginPage.verifyLoginPageShown();
  });
});
