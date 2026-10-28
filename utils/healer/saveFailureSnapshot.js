// ============================================================
// saveFailureSnapshot.js
// Used in every spec file as:   test.afterEach(saveFailureSnapshot);
// When a test FAILS, it saves the page HTML and the error message
// into the heal-data folder. The heal script reads them later.
// ============================================================

const fs = require('fs');
const path = require('path');
const { healConfig } = require('./healConfig');

async function saveFailureSnapshot({ page }, testInfo) {
  // File names for this test (testId is unique per test)
  const htmlFile = path.join(healConfig.snapshotFolder, testInfo.testId + '.html');
  const jsonFile = path.join(healConfig.snapshotFolder, testInfo.testId + '.json');

  // Test passed (for example on retry) -> delete any old snapshot and stop
  if (testInfo.status === testInfo.expectedStatus) {
    fs.rmSync(htmlFile, { force: true });
    fs.rmSync(jsonFile, { force: true });
    return;
  }

  // Create the heal-data folder if it does not exist
  fs.mkdirSync(healConfig.snapshotFolder, { recursive: true });

  // Read the page HTML at the moment of failure
  let html = '';
  try {
    html = await page.content();
  } catch (error) {
    // The page may already be closed - then there is nothing to save
    return;
  }

  // Save the HTML
  fs.writeFileSync(htmlFile, html);

  // Join ALL error messages (the locator detail is sometimes in the 2nd error)
  let allErrors = '';
  for (const error of testInfo.errors) {
    allErrors += (error.message || '') + '\n';
  }

  // Save the test name, error messages and HTML file location
  const failureInfo = {
    title: testInfo.title,
    testFile: path.basename(testInfo.file),
    error: allErrors,
    htmlFile: htmlFile,
  };
  fs.writeFileSync(jsonFile, JSON.stringify(failureInfo, null, 2));
}

module.exports = { saveFailureSnapshot };
