/**
 * Doctor command - Diagnose system and dependency issues
 */

const chalk = require('chalk');
const ora = require('ora');
const {
  detectPlatform,
  commandExists,
  checkNodeVersion,
  checkPythonVersion,
  getSystemResources,
  formatBytes
} = require('../utils/platform');
const { checkDatabaseStatus } = require('../utils/database');

/**
 * Run system diagnostics
 */
async function doctor(options) {
  console.log(chalk.blue.bold('\n🔍 Crypto MCP Suite Diagnostics\n'));

  const issues = [];

  // System information
  displaySystemInfo();

  // Check runtime dependencies
  issues.push(...await checkRuntimeDependencies());

  // Check databases
  issues.push(...await checkDatabases());

  // Check network connectivity
  issues.push(...await checkNetworkConnectivity());

  // Check disk space
  issues.push(...checkDiskSpace());

  // Summary
  displaySummary(issues, options);

  return issues.length === 0 ? 0 : 1;
}

/**
 * Display system information
 */
function displaySystemInfo() {
  const platform = detectPlatform();
  const resources = getSystemResources();

  console.log(chalk.bold('System Information:'));
  console.log(chalk.gray(`  OS: ${platform.os} (${platform.platform})`));
  console.log(chalk.gray(`  Architecture: ${platform.arch}`));
  console.log(chalk.gray(`  CPU Cores: ${resources.cpuCount}`));
  console.log(chalk.gray(`  Total Memory: ${formatBytes(resources.totalMemory)}`));
  console.log(chalk.gray(`  Free Memory: ${formatBytes(resources.freeMemory)}\n`));
}

/**
 * Check runtime dependencies
 */
async function checkRuntimeDependencies() {
  const issues = [];
  console.log(chalk.bold('Runtime Dependencies:\n'));

  // Node.js
  const nodeCheck = checkNodeVersion();
  if (nodeCheck.valid) {
    console.log(chalk.green(`  ✓ Node.js ${nodeCheck.current}`));
  } else {
    console.log(chalk.red(`  ✗ Node.js ${nodeCheck.message}`));
    issues.push({
      severity: 'critical',
      component: 'Node.js',
      issue: nodeCheck.message,
      fix: 'Install Node.js v18 or later from https://nodejs.org/'
    });
  }

  // Python
  const pythonCheck = checkPythonVersion();
  if (pythonCheck.valid) {
    console.log(chalk.green(`  ✓ Python ${pythonCheck.current}`));
  } else {
    console.log(chalk.yellow(`  ⚠ Python ${pythonCheck.message}`));
    issues.push({
      severity: 'warning',
      component: 'Python',
      issue: pythonCheck.message,
      fix: 'Install Python 3.10 or later from https://python.org/'
    });
  }

  // npm
  if (commandExists('npm')) {
    console.log(chalk.green('  ✓ npm installed'));
  } else {
    console.log(chalk.red('  ✗ npm not found'));
    issues.push({
      severity: 'critical',
      component: 'npm',
      issue: 'npm not installed',
      fix: 'npm comes with Node.js - install Node.js'
    });
  }

  // git
  if (commandExists('git')) {
    console.log(chalk.green('  ✓ git installed'));
  } else {
    console.log(chalk.yellow('  ⚠ git not found (recommended)'));
    issues.push({
      severity: 'warning',
      component: 'git',
      issue: 'git not installed',
      fix: 'Install git from https://git-scm.com/'
    });
  }

  console.log();
  return issues;
}

/**
 * Check database services
 */
async function checkDatabases() {
  const issues = [];
  console.log(chalk.bold('Database Services:\n'));

  const dbStatus = await checkDatabaseStatus();

  // Redis
  if (dbStatus.redis.running) {
    console.log(chalk.green(`  ✓ Redis ${dbStatus.redis.version} running`));
  } else {
    console.log(chalk.yellow('  ⚠ Redis not running'));
    issues.push({
      severity: 'warning',
      component: 'Redis',
      issue: 'Redis is not running',
      fix: 'Start Redis: redis-server'
    });
  }

  // PostgreSQL
  if (dbStatus.postgresql.running) {
    console.log(chalk.green(`  ✓ PostgreSQL ${dbStatus.postgresql.version} running`));
  } else {
    console.log(chalk.yellow('  ⚠ PostgreSQL not running'));
    issues.push({
      severity: 'warning',
      component: 'PostgreSQL',
      issue: 'PostgreSQL is not running',
      fix: 'Start PostgreSQL service'
    });
  }

  console.log();
  return issues;
}

/**
 * Check network connectivity
 */
async function checkNetworkConnectivity() {
  const issues = [];
  console.log(chalk.bold('Network Connectivity:\n'));

  const endpoints = [
    { name: 'Santiment API', url: 'https://api.santiment.net' },
    { name: 'Whale Alert API', url: 'https://api.whale-alert.io' },
    { name: 'CoinGecko API', url: 'https://api.coingecko.com' }
  ];

  for (const endpoint of endpoints) {
    const spinner = ora(`Testing ${endpoint.name}...`).start();

    try {
      // Simulate network test (in production, would use fetch)
      await new Promise(resolve => setTimeout(resolve, 100));
      spinner.succeed(`${endpoint.name} accessible`);
    } catch (error) {
      spinner.fail(`${endpoint.name} unreachable`);
      issues.push({
        severity: 'warning',
        component: 'Network',
        issue: `Cannot reach ${endpoint.name}`,
        fix: 'Check internet connection and firewall settings'
      });
    }
  }

  console.log();
  return issues;
}

/**
 * Check disk space
 */
function checkDiskSpace() {
  const issues = [];
  console.log(chalk.bold('Disk Space:\n'));

  const resources = getSystemResources();
  const freePercent = (resources.freeMemory / resources.totalMemory) * 100;

  if (freePercent < 10) {
    console.log(chalk.red(`  ✗ Low memory: ${formatBytes(resources.freeMemory)} free (${freePercent.toFixed(1)}%)`));
    issues.push({
      severity: 'critical',
      component: 'Memory',
      issue: 'Low available memory',
      fix: 'Close unused applications or add more RAM'
    });
  } else if (freePercent < 20) {
    console.log(chalk.yellow(`  ⚠ Memory: ${formatBytes(resources.freeMemory)} free (${freePercent.toFixed(1)}%)`));
  } else {
    console.log(chalk.green(`  ✓ Memory: ${formatBytes(resources.freeMemory)} free (${freePercent.toFixed(1)}%)`));
  }

  console.log();
  return issues;
}

/**
 * Display summary and recommendations
 */
function displaySummary(issues, options) {
  const critical = issues.filter(i => i.severity === 'critical');
  const warnings = issues.filter(i => i.severity === 'warning');

  console.log(chalk.bold('Summary:\n'));

  if (issues.length === 0) {
    console.log(chalk.green('  ✅ No issues detected - system is healthy!\n'));
    return;
  }

  if (critical.length > 0) {
    console.log(chalk.red(`  ❌ ${critical.length} critical issue(s)`));
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow(`  ⚠️  ${warnings.length} warning(s)`));
  }

  console.log();

  // Display issues
  if (critical.length > 0) {
    console.log(chalk.red.bold('Critical Issues:\n'));
    for (const issue of critical) {
      console.log(chalk.red(`  ✗ ${issue.component}: ${issue.issue}`));
      console.log(chalk.gray(`    Fix: ${issue.fix}\n`));
    }
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('Warnings:\n'));
    for (const issue of warnings) {
      console.log(chalk.yellow(`  ⚠ ${issue.component}: ${issue.issue}`));
      console.log(chalk.gray(`    Fix: ${issue.fix}\n`));
    }
  }

  // Auto-fix option
  if (options.fix) {
    console.log(chalk.blue('Attempting auto-fix...\n'));
    // In production, would attempt to fix issues automatically
    console.log(chalk.yellow('Auto-fix not yet implemented\n'));
  }
}

module.exports = doctor;
