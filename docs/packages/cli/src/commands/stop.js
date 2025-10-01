/**
 * Stop command - Stop MCPs and services
 */

const chalk = require('chalk');
const ora = require('ora');

/**
 * Stop MCP services
 */
async function stop(mcpName, options) {
  if (mcpName) {
    await stopSingleMCP(mcpName, options);
  } else {
    await stopAllMCPs(options);
  }
}

/**
 * Stop all MCPs
 */
async function stopAllMCPs(options) {
  console.log(chalk.blue.bold('\n🛑 Stopping Crypto MCP Suite\n'));

  const mcps = [
    'crypto-indicators-mcp',
    'bridge-rates-mcp',
    'crypto-sentiment-mcp',
    'whale-tracker-mcp',
    'crypto-feargreed-mcp'
  ];

  for (const mcp of mcps) {
    await stopMCP(mcp, options.force);
  }

  console.log(chalk.green.bold('\n✅ All services stopped\n'));
}

/**
 * Stop a single MCP
 */
async function stopSingleMCP(mcpName, options) {
  console.log(chalk.blue(`\nStopping ${mcpName}...\n`));

  await stopMCP(mcpName, options.force);

  console.log(chalk.green(`\n✅ ${mcpName} stopped\n`));
}

/**
 * Stop an MCP process
 */
async function stopMCP(mcpName, force = false) {
  const spinner = ora(`Stopping ${mcpName}...`).start();

  try {
    // Simulate stopping MCP
    await new Promise(resolve => setTimeout(resolve, 300));

    spinner.succeed(`${mcpName} stopped`);
  } catch (error) {
    if (force) {
      spinner.warn(`Force stopped ${mcpName}`);
    } else {
      spinner.fail(`Failed to stop ${mcpName}`);
      console.error(chalk.red(error.message));
    }
  }
}

module.exports = stop;
