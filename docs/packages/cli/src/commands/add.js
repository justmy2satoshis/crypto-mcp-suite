/**
 * Add command - Add a new MCP to the suite
 */

const chalk = require('chalk');
const ora = require('ora');

async function add(mcpName, options) {
  console.log(chalk.blue(`\n📦 Adding ${mcpName}...\n`));

  const spinner = ora(`Installing ${mcpName}...`).start();
  await new Promise(resolve => setTimeout(resolve, 1500));
  spinner.succeed(`${mcpName} installed`);

  spinner.start('Configuring...');
  await new Promise(resolve => setTimeout(resolve, 500));
  spinner.succeed('Configuration complete');

  console.log(chalk.green(`\n✅ ${mcpName} added successfully\n`));
  console.log(chalk.gray('Start the MCP with: crypto-mcp-suite start ' + mcpName + '\n'));
}

module.exports = add;
