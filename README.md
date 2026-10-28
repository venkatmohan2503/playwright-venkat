# Playwright Shopping Framework

Simple end-to-end automation for https://rahulshettyacademy.com/client using Playwright + JavaScript.

## Folder structure
```
tests/         -> *.spec.js files, only call page object functions
pageObjects/   -> one class per page: locators in constructor + action/assert functions
utils/         -> testData.js: users, invalid data, products, checkout data, messages
TEST_PLAN.md   -> all scenarios (ID, steps, expected result) + flakiness notes
HEALING.md     -> auto-heal: Claude API script (CI) + Playwright Healer agent (VS Code)
utils/healer/  -> saveFailureSnapshot.js, healSelectors.js, healConfig.js
.github/       -> workflows/playwright.yml (CI + auto-heal PR), agents/ (Healer), copilot-instructions.md
```

## Setup
```bash
npm install           # includes @anthropic-ai/sdk for the auto-heal script
npx playwright install chromium
```

## Run
```bash
npm run register      # ONE time only: registers the 3 users from utils/testData.js
npm test              # all other tests (register-once test is skipped)
npm run test:headed   # same, with the browser visible
npm run report        # open the HTML report
npm run heal          # after a failed run: heal broken CSS selectors (needs ANTHROPIC_API_KEY)
```

See `HEALING.md` for the GitHub Actions setup and the VS Code Healer agent.

> After the first `npm run register`, do not run it again — the emails already exist.
> To use new users, change the 3 emails in `utils/testData.js` and run it once more.

## Run one file or one test
```bash
npx playwright test tests/login.spec.js
npx playwright test -g "L02"
```

## Page objects
| File | Main functions |
|---|---|
| LoginPage | goto, login, clickRegisterLink, verifyLoginSuccess, verifyToastMessage, verifyFieldError, verifyLoginPageShown |
| RegisterPage | goto, fillRegisterForm, tickAgeCheckbox, clickRegister, verifyRegisterSuccess, verifyToastMessage, verifyFieldError, verifyNotRegistered |
| DashboardPage | goto, verifyPageLoaded, verifyProductsListed, searchProduct, verifyOnlyProductShown, verifyNoProductsShown, addProductAndVerify, addProductsToCart, openCart, openOrders, signOut |
| CartPage | clearCart, verifyProductInCart, verifyProductsInCart, removeProduct, verifyCartEmpty, clickCheckout |
| CheckoutPage | verifyUserEmail, selectCountry, verifyCountrySelected, applyCoupon, verifyCouponMessage, placeOrder, verifyToastMessage, verifyStillOnCheckout |
| OrderConfirmationPage | verifyThankYouMessage, getOrderId |
| OrdersPage | verifyOrderInList, viewOrder, verifyOrderDetails |
