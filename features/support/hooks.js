
const { chromium } = require('@playwright/test');
const { playwright } = require('@playwright/test');
const { Before, After } = require('@cucumber/cucumber');
const { LoginPage } = require('../../pageObjects/LoginPage');
const { registeredUsers } = require('../../utils/testData');




Before(async function()
{
    this.browser = await chromium.launch({headless: false});
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    this.user = registeredUsers[0];

    this.loginPage = new LoginPage(this.page);
    await this.loginPage.goto();
    await this.loginPage.login(this.user);


})

After(async function()
{
   console.log("This is my last execution")
    // Close the browser after the scenario, including when a step fails.
    if (this.browser) {
        await this.browser.close();
    }
})

