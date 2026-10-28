// ============================================================
// checkout.spec.js
// O02-O05 -> coupon (valid / invalid), missing country, exact country pick
// ============================================================

const { test } = require('@playwright/test');
const { LoginPage } = require('../pageObjects/LoginPage');
const { DashboardPage } = require('../pageObjects/DashboardPage');
const { CartPage } = require('../pageObjects/CartPage');
const { CheckoutPage } = require('../pageObjects/CheckoutPage');
const { registeredUsers, products, checkout, messages } = require('../utils/testData');
const { saveFailureSnapshot } = require('../utils/healer/saveFailureSnapshot');

// After every test: if it failed, save page HTML + error for the auto-heal script
test.afterEach(saveFailureSnapshot);

test.describe('Checkout', () => {
  let checkoutPage;

  // Before every test: login, empty cart, add 1 product, open checkout
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUsers[0]);
    await dashboardPage.verifyPageLoaded();

    // Empty the cart first
    await dashboardPage.openCart();
    await cartPage.clearCart();
    await dashboardPage.goto();
    await dashboardPage.verifyPageLoaded();

    // Add one product and go to checkout
    await dashboardPage.addProductAndVerify(products[0]);
    await dashboardPage.openCart();
    await cartPage.verifyProductInCart(products[0]);
    await cartPage.clickCheckout();

    // Assert: checkout shows the logged-in user's email
    await checkoutPage.verifyUserEmail(registeredUsers[0].email);
  });

  test('O02 - valid coupon is applied', async () => {
    await checkoutPage.applyCoupon(checkout.validCoupon);
    await checkoutPage.verifyCouponMessage(messages.couponApplied);
  });

  test('O03 - invalid coupon shows error', async () => {
    await checkoutPage.applyCoupon(checkout.invalidCoupon);
    await checkoutPage.verifyCouponMessage(messages.couponInvalid);
  });

  test('O04 - place order without country shows error', async () => {
    await checkoutPage.placeOrder();

    // Assert: error toast and order not placed
    await checkoutPage.verifyToastMessage(messages.shippingRequired);
    await checkoutPage.verifyStillOnCheckout();
  });

  test('O05 - exact country is picked from similar names', async () => {
    // "ind" also matches "British Indian Ocean Territory" - we must pick "India"
    await checkoutPage.selectCountry(checkout.countrySearch, checkout.country);
    await checkoutPage.verifyCountrySelected(checkout.country);
  });
});
