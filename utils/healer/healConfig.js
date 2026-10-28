// ============================================================
// healConfig.js
// Settings for the auto-heal script (healSelectors.js).
// ============================================================

const healConfig = {
  // Claude model used to suggest a new selector (can be changed with env HEAL_MODEL)
  model: process.env.HEAL_MODEL || 'claude-sonnet-5-5',

  // Folder where failed tests save their page HTML + error
  snapshotFolder: 'heal-data',

  // Folder with the page object files that can be healed
  pageObjectsFolder: 'pageObjects',

  // Output files
  reportFile: 'heal-report.json',   // list of all healed selectors
  summaryFile: 'heal-summary.md',   // text used as the pull request description

  // Max characters of HTML sent to Claude (keeps the request small and cheap)
  maxHtmlLength: 100000,
};

module.exports = { healConfig };
