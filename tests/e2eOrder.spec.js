// ============================================================
// e2eOrder.spec.js
// O01 + H01 -> full end-to-end order for each of the 3 users:
// login -> add products -> cart -> checkout -> place order
//       -> thank-you page -> order history -> order details
// ============================================================

const { test } = require('@playwright/test');
const { LoginPage } = require('../pageObjects/LoginPage');
const { DashboardPage } = require('../pageObjects/DashboardPage');
const { CartPage } = require('../pageObjects/CartPage');
const { CheckoutPage } = require('../pageObjects/CheckoutPage');
const { OrderConfirmationPage } = require('../pageObjects/OrderConfirmationPage');
const { OrdersPage } = require('../pageObjects/OrdersPage');
const { registeredUsers, products, checkout } = require('../utils/testData');
const { saveFailureSnapshot } = require('../utils/healer/saveFailureSnapshot');

// After every test: if it failed, save page HTML + error for the auto-heal script
test.afterEach(saveFailureSnapshot);

// One test per user from utils (parameterized)
for (const user of registeredUsers) {
  test(`O01/H01 - E2E order and history for ${user.email}`, async ({ page }) => {
    // Create all page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const confirmationPage = new OrderConfirmationPage(page);
    const ordersPage = new OrdersPage(page);

    // Step 1: Login
    await loginPage.goto();
    await loginPage.login(user);
    await loginPage.verifyLoginSuccess();
    await dashboardPage.verifyPageLoaded();

    // Step 2: Empty the cart so old items do not affect the test
    await dashboardPage.openCart();
    await cartPage.clearCart();
    await dashboardPage.goto();
    await dashboardPage.verifyPageLoaded();

    // Step 3: Add products (each add asserts the success toast)
    await dashboardPage.addProductsToCart(products);

    // Step 4: Open cart and check the products
    await dashboardPage.openCart();
    await cartPage.verifyProductsInCart(products);

    // Step 5: Checkout - check email, choose country
    await cartPage.clickCheckout();
    await checkoutPage.verifyUserEmail(user.email);
    await checkoutPage.selectCountry(checkout.countrySearch, checkout.country);
    await checkoutPage.verifyCountrySelected(checkout.country);

    // Step 6: Place the order
    await checkoutPage.placeOrder();

    // Step 7: Thank-you page and order ID
    await confirmationPage.verifyThankYouMessage();
    const orderId = await confirmationPage.getOrderId();

    // Step 8: Order history has the order
    await dashboardPage.openOrders();
    await ordersPage.verifyOrderInList(orderId);

    // Step 9: Order details show the same order ID
    await ordersPage.viewOrder(orderId);
    await ordersPage.verifyOrderDetails(orderId);
  });
}
