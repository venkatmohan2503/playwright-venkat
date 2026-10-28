const { After, Given, Then, When } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { LoginPage } = require('../../pageObjects/LoginPage');
const { DashboardPage } = require('../../pageObjects/DashboardPage');
const { OrderConfirmationPage } = require('../../pageObjects/OrderConfirmationPage');
const { OrdersPage } = require('../../pageObjects/OrdersPage');
const { CheckoutPage } = require('../../pageObjects/CheckoutPage');
const { CartPage } = require('../../pageObjects/CartPage');
const { registeredUsers, products, checkout } = require('../../utils/testData');

Given('A login to ecommerce application', async function () {
    // Reuse shared fixtures from testData.js instead of expecting feature arguments.
    this.user = registeredUsers[0];
    this.browser = await chromium.launch();
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.goto();
    await this.loginPage.login(this.user);
    this.dashboardPage = new DashboardPage(this.page);
    this.cartPage = new CartPage(this.page);
})

When('A customer search for products and add to the cart', async function () {
    // Use the imported shared product list; this step has no Cucumber parameters.
    await this.dashboardPage.addProductsToCart(products);
    await this.dashboardPage.openCart();
    await this.cartPage.verifyProductsInCart(products);
})

Then('Customer can go to cart and place the order', async function () {
    await this.cartPage.clickCheckout();
    this.checkoutPage = new CheckoutPage(this.page);
    await this.checkoutPage.verifyUserEmail(this.user.email);
    // Use shared checkout values rather than an uncaptured step argument.
    await this.checkoutPage.selectCountry(checkout.countrySearch, checkout.country);
    await this.checkoutPage.verifyCountrySelected(checkout.country);
    await this.checkoutPage.placeOrder();
})

Then('Customer gets order ID', async function () {
    const confirmationPage = new OrderConfirmationPage(this.page);
    await confirmationPage.verifyThankYouMessage();
    this.orderId = await confirmationPage.getOrderId();
})

Then('validate the orderID with OrderHistory', async function () {
    const ordersPage = new OrdersPage(this.page);
    await this.dashboardPage.openOrders();
    await ordersPage.verifyOrderInList(this.orderId);
    await ordersPage.viewOrder(this.orderId);
    await ordersPage.verifyOrderDetails(this.orderId);
})

After(async function () {
    // Close the browser after the scenario, including when a step fails.
    if (this.browser) {
        await this.browser.close();
    }
})
