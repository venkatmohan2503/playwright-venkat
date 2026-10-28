// ============================================================
// CheckoutPage.js
// Page object for the Checkout (payment + shipping) page.
// ============================================================

const { expect } = require('@playwright/test');

class CheckoutPage {
  // Save the page and all locators of the Checkout page
  constructor(page) {
    this.page = page;
    this.userEmailLabel = page.locator('.user__name [type="text"]').first(); // Logged-in email shown
    this.countryInput = page.locator('[placeholder*="Country"]');            // Country box
    this.countryResults = page.locator('.ta-results');                       // Country dropdown list
    this.couponInput = page.locator('input[name="coupon"]');                 // Coupon box
    this.applyCouponButton = page.getByRole('button', { name: 'Apply Coupon' });
    this.couponMessage = page.locator('p.mt-1');                         // Coupon result text
    this.placeOrderButton = page.locator('.action__submit');                 // "Place Order"
    this.toastMessage = page.locator('#toast-container');                    // Pop-up message
  }

  // Assert: checkout page shows the logged-in user's email
  async verifyUserEmail(email) {
    await expect(this.userEmailLabel).toHaveText(email);
  }

  // Type a few letters, wait for the list, then click the EXACT country
  async selectCountry(searchText, countryName) {
    // Type slowly so the dropdown list opens (fill() is too fast for it)
    await this.countryInput.pressSequentially(searchText, { delay: 100 });
    // Wait for the dropdown list
    await this.countryResults.waitFor();
    // exact: true -> "India", not "British Indian Ocean Territory"
    await this.countryResults.getByText(countryName, { exact: true }).click();
  }


  // Assert: the country box shows the chosen country
  async verifyCountrySelected(countryName) {
    await expect(this.countryInput).toHaveValue(countryName);
  }

  // Type a coupon and click Apply Coupon
  async applyCoupon(couponCode) {
    await this.couponInput.fill(couponCode);
    await this.applyCouponButton.click();
  }

  // Assert: coupon result message text
  async verifyCouponMessage(expectedText) {
    await expect(this.couponMessage).toHaveText(expectedText);
  }

  // Click Place Order
  async placeOrder() {
    await this.placeOrderButton.click();
  }

  // Assert: pop-up message text (e.g. missing shipping info)
  async verifyToastMessage(expectedText) {
    await expect(this.toastMessage).toContainText(expectedText);
  }

  // Assert: we are still on the checkout page (order not placed)
  async verifyStillOnCheckout() {
    await expect(this.placeOrderButton).toBeVisible();
  }
}

module.exports = { CheckoutPage };
