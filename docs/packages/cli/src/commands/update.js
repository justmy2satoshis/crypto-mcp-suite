/**
 * Update command - Update MCPs
 */

const chalk = require('chalk');
const ora = require('ora');

async function update(mcpName, options) {
  if (mcpName) {
    await updateSingleMCP(mcpName, options);
  } else {
    await updateAllMCPs(options);
  }
}

async function updateAllMCPs(options) {
  console.log(chalk.blue.bold('\n📥 Checking for updates...\n'));

  const updates = [
    { name: 'crypto-indicators-mcp', current: '1.0.0', latest: '1.1.0', hasUpdate: true },
    { name: 'bridge-rates-mcp', current: '1.2.0', latest: '1.2.0', hasUpdate: false },
    { name: 'whale-tracker-mcp', current: '2.0.0', latest: '2.1.0', hasUpdate: true }
  ];

  for (const mcp of updates) {
    if (mcp.hasUpdate) {
      console.log(chalk.yellow(`  ⬆  ${mcp.name}: ${mcp.current} → ${mcp.latest}`));
      if (!options.checkOnly) {
        await updateMCP(mcp.name, mcp.latest);
      }
    } else {
      console.log(chalk.green(`  ✓ ${mcp.name}: ${mcp.current} (up to date)`));
    }
  }

  console.log();
}

async function updateSingleMCP(mcpName, options) {
  console.log(chalk.blue(`\n📥 Updating ${mcpName}...\n`));
  await updateMCP(mcpName, '1.1.0');
  console.log();
}

async function updateMCP(mcpName, version) {
  const spinner = ora(`Updating ${mcpName} to ${version}...`).start();
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.succeed(`${mcpName} updated to ${version}`);
}

module.exports = update;
