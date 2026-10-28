// ============================================================
// healSelectors.js
// Auto-heal for broken CSS selectors, using the Claude API.
// Run with:  npm run heal   (needs env ANTHROPIC_API_KEY)
//
// For each failed test saved in heal-data/ it:
//   1. Checks the error is "element not found" (not a wrong text etc.)
//   2. Reads the failed selector from the error, e.g. locator('#userEmail')
//   3. Finds that selector in a pageObjects file
//   4. Confirms the selector really matches nothing in the saved HTML
//   5. Asks Claude for a new CSS selector for the same element
//   6. Confirms the new selector matches an element in the saved HTML
//   7. Replaces the old selector in the page object file
//   8. Writes heal-report.json and heal-summary.md
// ============================================================

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { Anthropic } = require('@anthropic-ai/sdk');
const { healConfig } = require('./healConfig');

// ---------- Small helper functions ----------

// Remove colour codes (like \u001b[31m) that Playwright adds to error messages
function cleanError(errorText) {
  return errorText.replace(/\u001b\[[0-9;]*m/g, '');
}

// True when the error means "the element was not found on the page"
function isElementNotFound(errorText) {
  if (errorText.includes('element(s) not found')) {
    return true;
  }
  // "Timeout" or "timeout" + "waiting for locator(" = an action could not find the element
  if (errorText.toLowerCase().includes('timeout') && errorText.includes('waiting for locator(')) {
    return true;
  }
  return false;
}

// Read the first selector inside locator('...') from the error message
function getFailedSelector(errorText) {
  const match = errorText.match(/locator\('([^']+)'\)/);
  if (match) {
    return match[1];
  }
  return null;
}

// Find which page object file and line contain the selector
function findSelectorInPageObjects(selector) {
  const files = fs.readdirSync(healConfig.pageObjectsFolder);

  for (const fileName of files) {
    const filePath = path.join(healConfig.pageObjectsFolder, fileName);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');

    for (let i = 0; i < lines.length; i++) {
      // Selectors are written in single quotes: page.locator('#userEmail')
      if (lines[i].includes(`'${selector}'`)) {
        return {
          file: filePath,
          lineNumber: i + 1,
          // The line above (often a comment) + the line itself, for context
          codeContext: (lines[i - 1] || '') + '\n' + lines[i],
        };
      }
    }
  }
  return null;
}

// Remove scripts, styles and SVG icons so the HTML is smaller and safe to load
function cleanHtml(html) {
  let result = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<style[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  return result.slice(0, healConfig.maxHtmlLength);
}

// Ask Claude for a new selector. Returns { newSelector, reason }
async function askClaude(client, oldSelector, codeContext, errorText, html) {
  const prompt = `A Playwright test failed because this CSS selector no longer matches any element.

Old selector: ${oldSelector}

Page object code (the comment says what the element is):
${codeContext}

Error message:
${errorText.slice(0, 2000)}

Current page HTML (at the moment of failure):
${html}

Find the element in the HTML that the old selector was meant to match, and give a new CSS selector for it.
Rules:
- CSS selector only (no XPath, no Playwright text= or role= syntax).
- Prefer: id, then attributes like name / formcontrolname / placeholder / type, then stable class names.
- Do not use nth-child or auto-generated classes (for example ng-tns-..., _ngcontent-...).
- Use double quotes inside the selector, never single quotes.
- If you are not confident the element is in the HTML, set newSelector to null.

Reply with JSON only, like: {"newSelector": "#email", "reason": "id changed from userEmail to email"}`;

  const response = await client.messages.create({
    model: healConfig.model,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  // Take the text answer and read the JSON part from it
  const text = response.content[0].text;
  const jsonText = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return { newSelector: null, reason: 'Could not read Claude answer: ' + text };
  }
}

// Replace the old selector with the new one in the page object file
function updatePageObject(filePath, oldSelector, newSelector) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(`'${oldSelector}'`, `'${newSelector}'`);
  fs.writeFileSync(filePath, updated);
}

// Tell GitHub Actions whether anything was healed (used by the workflow "if:")
function setGitHubOutput(healedCount) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `healed=${healedCount > 0}\n`);
  }
}

// Write heal-report.json and heal-summary.md (pull request text)
function writeReports(healed, skipped) {
  fs.writeFileSync(healConfig.reportFile, JSON.stringify({ healed, skipped }, null, 2));

  let summary = '## Auto-heal: updated CSS selectors\n\n';
  summary += 'These selectors no longer matched the app, and Claude suggested new ones. Please review before merging.\n\n';
  summary += '| Page object | Line | Old selector | New selector | Reason | Failed test |\n';
  summary += '|---|---|---|---|---|---|\n';
  for (const item of healed) {
    summary += `| ${item.file} | ${item.lineNumber} | \`${item.oldSelector}\` | \`${item.newSelector}\` | ${item.reason} | ${item.test} |\n`;
  }
  if (skipped.length > 0) {
    summary += '\n### Not healed (needs a person or the Playwright Healer agent)\n\n';
    for (const item of skipped) {
      summary += `- **${item.test}**: ${item.why}\n`;
    }
  }
  fs.writeFileSync(healConfig.summaryFile, summary);
}

// ---------- Main flow ----------

async function main() {
  const healed = [];          // selectors we fixed
  const skipped = [];         // failures we could not / should not fix
  const checkedSelectors = []; // so the same selector is only handled once

  // Nothing to do if no test saved a failure snapshot
  if (!fs.existsSync(healConfig.snapshotFolder)) {
    console.log('No heal-data folder - no failed tests to heal.');
    writeReports(healed, skipped);
    setGitHubOutput(0);
    return;
  }

  // The API key must be set (GitHub secret ANTHROPIC_API_KEY)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY is not set - cannot heal.');
    process.exit(1);
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Every failed test saved one .json file
  const jsonFiles = fs.readdirSync(healConfig.snapshotFolder).filter((name) => name.endsWith('.json'));

  for (const jsonFile of jsonFiles) {
    const failure = JSON.parse(fs.readFileSync(path.join(healConfig.snapshotFolder, jsonFile), 'utf8'));
    const errorText = cleanError(failure.error);
    console.log(`\nChecking failed test: ${failure.title}`);

    // Step 1: only heal "element not found" errors
    if (!isElementNotFound(errorText)) {
      skipped.push({ test: failure.title, why: 'Not an element-not-found error (e.g. wrong text or URL).' });
      continue;
    }

    // Step 2: which selector failed?
    const oldSelector = getFailedSelector(errorText);
    if (!oldSelector) {
      skipped.push({ test: failure.title, why: 'No CSS locator(...) found in the error (getByRole/getByText are not healed here).' });
      continue;
    }
    if (checkedSelectors.includes(oldSelector)) {
      console.log(`  Selector ${oldSelector} already handled - skipping.`);
      continue;
    }
    checkedSelectors.push(oldSelector);

    // Step 3: where is it in the page objects?
    const found = findSelectorInPageObjects(oldSelector);
    if (!found) {
      skipped.push({ test: failure.title, why: `Selector ${oldSelector} not found in pageObjects.` });
      continue;
    }

    // Step 4: load the saved HTML and confirm the old selector really finds nothing
    const html = cleanHtml(fs.readFileSync(failure.htmlFile, 'utf8'));
    await page.setContent(html);
    const oldCount = await page.locator(oldSelector).count();
    if (oldCount > 0) {
      skipped.push({ test: failure.title, why: `Selector ${oldSelector} still matches the page - the failure is not a selector change (timing or app issue).` });
      continue;
    }

    // Step 5: ask Claude for a new selector
    console.log(`  Asking Claude for a new selector for: ${oldSelector}`);
    const answer = await askClaude(client, oldSelector, found.codeContext, errorText, html);
    const newSelector = answer.newSelector;
    if (!newSelector || newSelector.includes("'")) {
      skipped.push({ test: failure.title, why: `Claude found no safe new selector for ${oldSelector}: ${answer.reason}` });
      continue;
    }

    // Step 6: confirm the new selector matches something in the HTML
    let newCount = 0;
    try {
      newCount = await page.locator(newSelector).count();
    } catch (error) {
      newCount = 0; // invalid CSS
    }
    if (newCount === 0) {
      skipped.push({ test: failure.title, why: `Suggested selector ${newSelector} matches nothing - not applied.` });
      continue;
    }

    // Step 7: update the page object file
    updatePageObject(found.file, oldSelector, newSelector);
    console.log(`  HEALED ${found.file}:${found.lineNumber}  ${oldSelector}  ->  ${newSelector}`);
    healed.push({
      test: failure.title,
      file: found.file,
      lineNumber: found.lineNumber,
      oldSelector: oldSelector,
      newSelector: newSelector,
      matches: newCount,
      reason: answer.reason,
      time: new Date().toISOString(),
    });
  }

  await browser.close();

  // Step 8: reports + GitHub output
  writeReports(healed, skipped);
  setGitHubOutput(healed.length);
  console.log(`\nDone. Healed: ${healed.length}, not healed: ${skipped.length}. See ${healConfig.reportFile}`);
}

// Run main() only when this file is started directly (npm run heal)
if (require.main === module) {
  main().catch((error) => {
    console.error('Auto-heal stopped with an error:', error.message);
    process.exit(1);
  });
}

// Exported so the helper functions can be tested on their own
module.exports = {
  cleanError,
  isElementNotFound,
  getFailedSelector,
  findSelectorInPageObjects,
  cleanHtml,
  updatePageObject,
};
