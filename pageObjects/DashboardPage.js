// ============================================================
// DashboardPage.js
// Page object for the Dashboard (product list) page + top menu.
// ============================================================

const { expect } = require('@playwright/test');
const { urls, messages } = require('../utils/testData');

class DashboardPage {
  // Save the page and all locators of the Dashboard
  constructor(page) {
    this.page = page;
    this.productCards = page.locator('.card-body');                 // Each product box
    this.productNames = page.locator('.card-body b');               // Product name inside each box
    this.searchInput = page.locator("div[class='py-2 border-bottom ml-3'] input[placeholder='search']")    // Search box in the left filter
    this.cartButton = page.locator('[routerlink*="cart"]');         // "Cart" in top menu
    this.ordersButton = page.locator('button[routerlink*="myorders"]'); // "ORDERS" in top menu
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' }); // "Sign Out" in top menu
    this.toastMessage = page.locator('#toast-container');           // Pop-up message
  }

  // Open the Dashboard directly (user must be logged in)
  async goto() {
    await this.page.goto(urls.dashboard);
  }

  // Assert: dashboard URL is open and products are shown
  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.productCards.first()).toBeVisible();
  }

  // Assert: at least one product is listed
  async verifyProductsListed() {
    await expect(this.productCards.first()).toBeVisible();
    const count = await this.productCards.count();
    expect(count).toBeGreaterThan(0);
  }

  // Type a product name in search and press Enter
  async searchProduct(productName) {
    await this.searchInput.fill(productName);
    await this.searchInput.press('Enter');
  }

  // Assert: ONLY this one product is shown after search
  async verifyOnlyProductShown(productName) {
    await expect(this.productNames).toHaveText([productName]);
  }

  // Assert: no products are shown (search with no match)
  async verifyNoProductsShown() {
    await expect(this.productCards).toHaveCount(0);
  }

  // Click "Add To Cart" on the product with this name
  async addProductToCart(productName) {
    const product = this.productCards.filter({ hasText: productName });
    await product.getByRole('button', { name: 'Add To Cart' }).click();
  }

  // Add a product AND assert the success toast
  async addProductAndVerify(productName) {
    await this.addProductToCart(productName);
    await expect(this.toastMessage).toContainText(messages.productAdded);
  }

  // Add many products, one by one
  async addProductsToCart(productList) {
    for (const productName of productList) {
      await this.addProductAndVerify(productName);
    }
  }

  // Open the Cart page from the top menu
  async openCart() {
    await this.cartButton.click();
  }

  // Open the Orders page from the top menu
  async openOrders() {
    await this.ordersButton.click();
  }

  // Click Sign Out and assert the logout toast
  async signOut() {
    await this.signOutButton.click();
    await expect(this.toastMessage).toContainText(messages.logoutSuccess);
  }
}

module.exports = { DashboardPage };
