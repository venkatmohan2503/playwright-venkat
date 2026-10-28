// ============================================================
// products.spec.js
// P01-P03 -> product list and search
// ============================================================

const { test } = require('@playwright/test');
const { LoginPage } = require('../pageObjects/LoginPage');
const { DashboardPage } = require('../pageObjects/DashboardPage');
const { registeredUsers, products, noMatchSearch } = require('../utils/testData');
const { saveFailureSnapshot } = require('../utils/healer/saveFailureSnapshot');

// After every test: if it failed, save page HTML + error for the auto-heal script
test.afterEach(saveFailureSnapshot);

test.describe('Products and search', () => {
  let dashboardPage;

  // Before every test: log in with user 1
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUsers[0]);
    await dashboardPage.verifyPageLoaded();
  });

  test('P01 - products are listed after login', async () => {
    await dashboardPage.verifyProductsListed();
  });

  test('P02 - search shows only the matching product', async () => {
    await dashboardPage.searchProduct(products[0]);
    await dashboardPage.verifyOnlyProductShown(products[0]);
  });

  test('P03 - search with no match shows no products', async () => {
    await dashboardPage.searchProduct(noMatchSearch);
    await dashboardPage.verifyNoProductsShown();
  });
});
