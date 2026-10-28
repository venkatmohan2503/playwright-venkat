# Brainstorming Prompt: Playwright E2E Automation for a Shopping App

Copy the prompt below into Claude (or any AI assistant) to brainstorm and extend this framework.

---

## The Prompt

> I am building an **end-to-end test automation framework** for a **shopping web application** using **Playwright with JavaScript**.
>
> **Application under test:** https://rahulshettyacademy.com/client/#/auth/login
>
> ### Folder structure (must follow exactly)
> ```
> project-root/
> ├── tests/          → all test files, named *.spec.js
> ├── pageObjects/    → one class per page; locators in the constructor + action/assert functions
> ├── utils/          → datasets (registered users, invalid data, products, checkout data, messages)
> ├── playwright.config.js
> └── package.json
> ```
>
> ### Rules
> 1. **tests/** only call page object functions. No raw locators in tests.
> 2. **pageObjects/** classes take `page` in the constructor, declare **all locators in the constructor**, and expose simple async functions.
> 3. **utils/** holds all test data. Tests and page objects import from it, with no hard-coded values elsewhere.
> 4. **Simple code only**: plain `async/await`, `for...of` loops, Playwright `expect`. No complex logic.
> 5. **Comment every function and every important line.**
> 6. **Every validation has an assertion** (toasts, field errors, URLs, page text, order ID).
>
> ### Test data
> - 3 fixed dummy users, registered once (`npm run register`), then reused by parameterized tests.
> - Invalid data: wrong password, unregistered email, bad email format, empty fields, 9-digit phone, mismatched passwords.
>
> ### End-to-end flow
> Register → Login → clear cart → add products → cart → checkout (email, country, coupon) → place order → thank-you + order ID → order history → order details.
>
> ### What I want from you
> - Test scenarios (positive, negative, edge) in a table: ID, title, steps, expected result.
> - The page objects needed and their functions.
> - The dataset structure for utils.
> - The code, following the rules above.
> - Anything that could make the tests flaky, and the simple fix.

---

## Questions to answer while brainstorming
| Topic | Question |
|---|---|
| Scope | Smoke set vs. full regression? |
| Data | Keep data in JS, or move it to JSON/CSV? |
| Browsers | Chromium only, or Firefox/WebKit too? |
| API | Use the app's API to log in or clear the cart faster? |
| Reporting | Built-in HTML report or Allure? |
| CI | GitHub Actions / Jenkins? |
