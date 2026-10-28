// ============================================================
// cart.spec.js
// C01-C03 -> add one product, add two products, remove a product
// ============================================================

const { test } = require('@playwright/test');
const { LoginPage } = require('../pageObjects/LoginPage');
const { DashboardPage } = require('../pageObjects/DashboardPage');
const { CartPage } = require('../pageObjects/CartPage');
const { registeredUsers, products } = require('../utils/testData');
const { saveFailureSnapshot } = require('../utils/healer/saveFailureSnapshot');

// After every test: if it failed, save page HTML + error for the auto-heal script
test.afterEach(saveFailureSnapshot);

test.describe('Cart', () => {
  let dashboardPage;
  let cartPage;

  // Before every test: log in, empty the cart, go back to products
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUsers[0]);
    await dashboardPage.verifyPageLoaded();

    // Start every test with an empty cart
    await dashboardPage.openCart();
    await cartPage.clearCart();
    await dashboardPage.goto();
    await dashboardPage.verifyPageLoaded();
  });

  test('C01 - add one product to the cart', async () => {
    // addProductAndVerify() also asserts the "Product Added To Cart" toast
    await dashboardPage.addProductAndVerify(products[0]);
    await dashboardPage.openCart();

    await cartPage.verifyProductInCart(products[0]);
  });

  test('C02 - add two products to the cart', async () => {
    await dashboardPage.addProductsToCart(products);
    await dashboardPage.openCart();

    await cartPage.verifyProductsInCart(products);
  });

  test('C03 - remove a product from the cart', async () => {
    await dashboardPage.addProductAndVerify(products[0]);
    await dashboardPage.openCart();
    await cartPage.verifyProductInCart(products[0]);

    await cartPage.removeProduct(products[0]);

    // Assert: cart is now empty
    await cartPage.verifyCartEmpty();
  });
});
