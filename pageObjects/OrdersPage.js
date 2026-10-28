// ============================================================
// OrdersPage.js
// Page object for "Your Orders" (order history) and order details.
// ============================================================

const { expect } = require('@playwright/test');

class OrdersPage {
  // Save the page and all locators of the Orders pages
  constructor(page) {
    this.page = page;
    this.orderRows = page.locator('tbody tr');      // Each order in the history table
    this.orderDetailsId = page.locator('.col-text'); // Order ID on the details page
  }

  // Assert: an order with this ID is in the history table
  async verifyOrderInList(orderId) {
    await expect(this.orderRows.first()).toBeVisible();
    await expect(this.orderRows.filter({ hasText: orderId })).toBeVisible();
  }

  // Click "View" on the row of this order
  async viewOrder(orderId) {
    const row = this.orderRows.filter({ hasText: orderId });
    await row.getByRole('button', { name: 'View' }).click();
  }

  // Assert: details page shows the same order ID
  async verifyOrderDetails(orderId) {
    await expect(this.orderDetailsId).toContainText(orderId);
  }
}

module.exports = { OrdersPage };
