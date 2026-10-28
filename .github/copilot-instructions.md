# Rules for Copilot and the Playwright Healer agent in this repo

This is a Playwright + JavaScript framework with three folders:
- `tests/`: `*.spec.js` files. They only call page object functions.
- `pageObjects/`: one class per page. ALL locators are in the constructor.
- `utils/`: `testData.js` holds all data and expected messages. `utils/healer/` holds the CI auto-heal scripts.

When fixing a failing test:
1. **Fix locators only in the `pageObjects/` constructors.** Never add a locator inside a `tests/*.spec.js` file.
2. Keep the existing style: `page.locator('css')` with single quotes outside and double quotes inside the selector. Keep the comment at the end of the line.
3. Prefer stable selectors: id, then `name` / `formcontrolname` / `placeholder` attributes, then stable class names. No `nth-child`, no auto-generated classes (`ng-tns-...`, `_ngcontent-...`).
4. If the app's **text** changed (a toast or error message), update the value in `utils/testData.js` (`messages`). Do not change it in tests or page objects.
5. **Never weaken an assertion** to make a test pass: don't remove `expect`, don't swap `toHaveText` for `toBeVisible`, don't add `test.skip`.
6. If the app itself looks broken (not just a changed selector or text), mark the test `test.fixme()` with a comment explaining what happens instead.
7. Keep the code simple and commented, like the rest of the framework. No new libraries.
8. Never edit `utils/testData.js` user credentials, and never run `npm run register`.
