// ============================================================
// CartPage.js
// Page object for the Cart page.
// ============================================================

const { expect } = require('@playwright/test');
const { messages } = require('../utils/testData');

class CartPage {
  // Save the page and all locators of the Cart page
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('.cart li');                       // Each row in the cart
    this.cartItemNames = page.locator('.cart li h3');                // Product name in each row
    this.deleteButtons = page.locator('.cart li .btn-danger');       // Red delete button in each row
    this.emptyCartMessage = page.locator('h1', { hasText: messages.cartEmpty }); // Empty cart text
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  // Remove every product so each test starts with an empty cart
  // (the cart is saved on the server, so old items can still be there)
  async clearCart() {
    // Wait until the cart has loaded: either a delete button or the "empty" text appears
    await this.deleteButtons.first().or(this.emptyCartMessage).waitFor();

    // Count how many items are in the cart now
    let count = await this.deleteButtons.count();

    // Delete the first item until none are left
    while (count > 0) {
      await this.deleteButtons.first().click();
      count = count - 1;
      // Wait until the item is really gone before deleting the next one
      await expect(this.deleteButtons).toHaveCount(count);
    }
  }

  // Assert: a product with this name is in the cart
  async verifyProductInCart(productName) {
    await expect(this.cartItemNames.filter({ hasText: productName })).toBeVisible();
  }

  // Assert: every product in the list is in the cart
  async verifyProductsInCart(productList) {
    for (const productName of productList) {
      await this.verifyProductInCart(productName);
    }
  }

  // Click delete on the row of this product
  async removeProduct(productName) {
    const row = this.cartItems.filter({ hasText: productName });
    await row.locator('.btn-danger').click();
  }

  // Assert: the cart is empty
  async verifyCartEmpty() {
    await expect(this.emptyCartMessage).toBeVisible();
    await expect(this.cartItems).toHaveCount(0);
  }

  // Click Checkout
  async clickCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
