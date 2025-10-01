/**
 * Status command - Show status of all MCPs and services
 */

const chalk = require('chalk');
const Table = require('cli-table3');
const fs = require('fs-extra');
const path = require('path');
const { checkDatabaseStatus } = require('../utils/database');
const { getSystemResources, formatBytes } = require('../utils/platform');

/**
 * Display status of all services
 */
async function status(options) {
  console.log(chalk.blue.bold('\n📊 Crypto MCP Suite Status\n'));

  // Database status
  await displayDatabaseStatus();

  // MCP status
  await displayMCPStatus();

  // System resources
  if (options.verbose) {
    displaySystemResources();
  }

  // Output JSON if requested
  if (options.json) {
    const statusData = await getStatusData();
    console.log(JSON.stringify(statusData, null, 2));
  }
}

/**
 * Display database service status
 */
async function displayDatabaseStatus() {
  const dbStatus = await checkDatabaseStatus();

  const table = new Table({
    head: [chalk.cyan('Database'), chalk.cyan('Status'), chalk.cyan('Version')],
    colWidths: [20, 15, 30]
  });

  // Redis
  table.push([
    'Redis',
    dbStatus.redis.running
      ? chalk.green('● Running')
      : chalk.red('○ Stopped'),
    dbStatus.redis.version || chalk.gray('N/A')
  ]);

  // PostgreSQL
  table.push([
    'PostgreSQL',
    dbStatus.postgresql.running
      ? chalk.green('● Running')
      : chalk.red('○ Stopped'),
    dbStatus.postgresql.version || chalk.gray('N/A')
  ]);

  console.log(chalk.bold('Databases:'));
  console.log(table.toString());
  console.log();
}

/**
 * Display MCP status
 */
async function displayMCPStatus() {
  // Simulated MCP status (in production, would read from actual processes)
  const mcps = [
    { name: 'crypto-indicators-mcp', status: 'running', uptime: '2h 34m', memory: '45 MB', requests: 1247 },
    { name: 'bridge-rates-mcp', status: 'running', uptime: '2h 34m', memory: '38 MB', requests: 892 },
    { name: 'crypto-sentiment-mcp', status: 'running', uptime: '1h 12m', memory: '52 MB', requests: 345 },
    { name: 'whale-tracker-mcp', status: 'running', uptime: '2h 34m', memory: '61 MB', requests: 2341 },
    { name: 'crypto-feargreed-mcp', status: 'stopped', uptime: '-', memory: '-', requests: 0 }
  ];

  const table = new Table({
    head: [
      chalk.cyan('MCP'),
      chalk.cyan('Status'),
      chalk.cyan('Uptime'),
      chalk.cyan('Memory'),
      chalk.cyan('Requests')
    ],
    colWidths: [30, 15, 12, 12, 12]
  });

  for (const mcp of mcps) {
    table.push([
      mcp.name,
      mcp.status === 'running'
        ? chalk.green('● Running')
        : chalk.red('○ Stopped'),
      mcp.uptime,
      mcp.memory,
      mcp.requests.toLocaleString()
    ]);
  }

  console.log(chalk.bold('MCPs:'));
  console.log(table.toString());
  console.log();

  // Summary
  const running = mcps.filter(m => m.status === 'running').length;
  const total = mcps.length;

  if (running === total) {
    console.log(chalk.green(`✓ All ${total} MCPs running\n`));
  } else {
    console.log(chalk.yellow(`⚠️  ${running}/${total} MCPs running\n`));
  }
}

/**
 * Display system resources
 */
function displaySystemResources() {
  const resources = getSystemResources();

  const memoryUsedPercent = ((resources.totalMemory - resources.freeMemory) / resources.totalMemory * 100).toFixed(1);

  console.log(chalk.bold('System Resources:'));
  console.log(chalk.gray(`  Platform: ${resources.platform} (${resources.arch})`));
  console.log(chalk.gray(`  CPU Cores: ${resources.cpuCount}`));
  console.log(chalk.gray(`  Total Memory: ${formatBytes(resources.totalMemory)}`));
  console.log(chalk.gray(`  Free Memory: ${formatBytes(resources.freeMemory)} (${100 - memoryUsedPercent}%)`));
  console.log(chalk.gray(`  System Uptime: ${Math.floor(resources.uptime / 3600)}h ${Math.floor((resources.uptime % 3600) / 60)}m`));
  console.log();
}

/**
 * Get status data for JSON output
 */
async function getStatusData() {
  const dbStatus = await checkDatabaseStatus();
  const resources = getSystemResources();

  return {
    timestamp: new Date().toISOString(),
    databases: dbStatus,
    mcps: [
      { name: 'crypto-indicators-mcp', status: 'running', uptime: 9240, memory: 47185920 },
      { name: 'bridge-rates-mcp', status: 'running', uptime: 9240, memory: 39845888 }
    ],
    system: resources
  };
}

module.exports = status;
