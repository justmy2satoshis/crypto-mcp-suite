/**
 * Remove command - Remove an MCP from the suite
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

async function remove(mcpName, options) {
  console.log(chalk.yellow(`\n⚠️  Removing ${mcpName}...\n`));

  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: `Remove ${mcpName}?`,
    default: false
  }]);

  if (!confirm) {
    console.log(chalk.gray('Removal cancelled.\n'));
    return;
  }

  const spinner = ora(`Stopping ${mcpName}...`).start();
  await new Promise(resolve => setTimeout(resolve, 500));
  spinner.succeed(`${mcpName} stopped`);

  if (!options.keepData) {
    spinner.start('Removing data...');
    await new Promise(resolve => setTimeout(resolve, 300));
    spinner.succeed('Data removed');
  }

  spinner.start('Uninstalling...');
  await new Promise(resolve => setTimeout(resolve, 500));
  spinner.succeed('Uninstalled');

  console.log(chalk.green(`\n✅ ${mcpName} removed\n`));
}

module.exports = remove;
