// ============================================================
// OrderConfirmationPage.js
// Page object for the "Thankyou for the order." page.
// ============================================================

const { expect } = require('@playwright/test');
const { messages } = require('../utils/testData');

class OrderConfirmationPage {
  // Save the page and all locators of the confirmation page
  constructor(page) {
    this.page = page;
    this.thankYouHeading = page.locator('.hero-primary');                // Thank-you heading
    this.orderIdText = page.locator('.em-spacer-1 .ng-star-inserted');   // Order ID, like "| 6a1b2c... |"
  }

  // Assert: the thank-you message is shown
  async verifyThankYouMessage() {
    await expect(this.thankYouHeading).toHaveText(messages.orderSuccess);
  }

  // Read the order ID and remove the "|" characters and spaces
  async getOrderId() {
    await expect(this.orderIdText.first()).toBeVisible();
    const rawText = await this.orderIdText.first().textContent();
    const orderId = rawText.replaceAll('|', '').trim();
    // Assert: the order ID is not empty
    expect(orderId.length).toBeGreaterThan(0);
    return orderId;
  }
}

module.exports = { OrderConfirmationPage };
