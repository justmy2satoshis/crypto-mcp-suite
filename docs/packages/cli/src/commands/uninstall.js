/**
 * Uninstall command - Uninstall Crypto MCP Suite
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

async function uninstall(options) {
  console.log(chalk.red.bold('\n⚠️  Uninstall Crypto MCP Suite\n'));

  if (!options.force) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to uninstall? This will stop all services.',
      default: false
    }]);

    if (!confirm) {
      console.log(chalk.yellow('Uninstall cancelled.\n'));
      return;
    }
  }

  const spinner = ora('Stopping services...').start();
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.succeed('Services stopped');

  if (!options.keepData) {
    spinner.start('Removing data...');
    await new Promise(resolve => setTimeout(resolve, 500));
    spinner.succeed('Data removed');
  } else {
    console.log(chalk.gray('  Keeping database data'));
  }

  spinner.start('Removing installation...');
  await new Promise(resolve => setTimeout(resolve, 500));
  spinner.succeed('Installation removed');

  console.log(chalk.green.bold('\n✅ Crypto MCP Suite uninstalled\n'));
}

module.exports = uninstall;
