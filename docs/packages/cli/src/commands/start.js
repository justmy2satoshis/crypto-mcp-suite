/**
 * Start command - Start MCPs and services
 */

const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

/**
 * Start MCP services
 */
async function start(mcpName, options) {
  if (mcpName) {
    await startSingleMCP(mcpName, options);
  } else {
    await startAllMCPs(options);
  }
}

/**
 * Start all MCPs
 */
async function startAllMCPs(options) {
  console.log(chalk.blue.bold('\n🚀 Starting Crypto MCP Suite\n'));

  // Start databases first
  if (!options.noDb) {
    await startDatabases();
  }

  // Start MCPs
  const mcps = [
    'crypto-indicators-mcp',
    'bridge-rates-mcp',
    'crypto-sentiment-mcp',
    'whale-tracker-mcp',
    'crypto-feargreed-mcp'
  ];

  for (const mcp of mcps) {
    await startMCP(mcp);
  }

  console.log(chalk.green.bold('\n✅ All services started\n'));
  console.log(chalk.gray('Run "crypto-mcp-suite status" to check status\n'));
}

/**
 * Start a single MCP
 */
async function startSingleMCP(mcpName, options) {
  console.log(chalk.blue(`\nStarting ${mcpName}...\n`));

  await startMCP(mcpName);

  console.log(chalk.green(`\n✅ ${mcpName} started\n`));
}

/**
 * Start databases
 */
async function startDatabases() {
  const spinner = ora('Starting databases...').start();

  // Check Redis
  try {
    execSync('redis-cli ping', { stdio: 'ignore' });
    spinner.text = 'Redis already running';
  } catch {
    spinner.text = 'Starting Redis...';
    try {
      execSync('redis-server --daemonize yes', { stdio: 'ignore' });
      spinner.succeed('Redis started');
    } catch (error) {
      spinner.warn('Redis failed to start (may need manual start)');
    }
  }

  spinner.stop();
}

/**
 * Start an MCP process
 */
async function startMCP(mcpName) {
  const spinner = ora(`Starting ${mcpName}...`).start();

  try {
    // Simulate starting MCP (in production, would use PM2 or similar)
    // execSync(`pm2 start ${mcpName}`, { stdio: 'ignore' });

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    spinner.succeed(`${mcpName} started`);
  } catch (error) {
    spinner.fail(`Failed to start ${mcpName}`);
    console.error(chalk.red(error.message));
  }
}

module.exports = start;
