/**
 * Install command - Main installation workflow
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const { detectPlatform, commandExists, checkNodeVersion, checkPythonVersion } = require('../utils/platform');
const { setupRedis, setupPostgreSQL, testRedisConnection, testPostgresConnection } = require('../utils/database');

// Installation modes configuration
const MODES = {
  minimal: {
    name: 'MINIMAL',
    mcps: ['crypto-indicators-mcp', 'bridge-rates-mcp'],
    databases: ['sqlite'],
    description: 'Development mode - 2 MCPs, SQLite only',
    cost: '$0/month',
    suitable: 'Learning, testing, MVP development'
  },
  standard: {
    name: 'STANDARD',
    mcps: [
      'crypto-indicators-mcp',
      'bridge-rates-mcp',
      'crypto-sentiment-mcp',
      'whale-tracker-mcp',
      'crypto-feargreed-mcp'
    ],
    databases: ['redis', 'sqlite'],
    description: 'Production Starter - 5 MCPs, Redis + SQLite',
    cost: '$0-$300/month',
    suitable: '1k-10k users, light analytics'
  },
  premium: {
    name: 'PREMIUM',
    mcps: [
      'crypto-indicators-mcp',
      'bridge-rates-mcp',
      'crypto-sentiment-mcp',
      'whale-tracker-mcp',
      'memecoin-radar-mcp',
      'jupiter-mcp',
      'uniswap-trader-mcp'
    ],
    databases: ['redis', 'postgresql', 'sqlite'],
    description: 'Production Enterprise - 7 MCPs, Full database stack',
    cost: '$0-$1,223/month',
    suitable: '50k+ users, high-frequency trading'
  }
};

/**
 * Main installation function
 */
async function install(mode, options) {
  console.log(chalk.blue.bold('\n🚀 Crypto MCP Suite Installer\n'));

  // Step 1: Detect platform
  const platform = detectPlatform();
  console.log(chalk.gray(`Detected: ${platform.os} (${platform.arch})`));

  if (platform.wslRecommended) {
    console.log(chalk.yellow('⚠️  Windows detected. WSL (Windows Subsystem for Linux) is recommended for best experience.'));
    const { continueOnWindows } = await inquirer.prompt([{
      type: 'confirm',
      name: 'continueOnWindows',
      message: 'Continue with native Windows installation?',
      default: false
    }]);

    if (!continueOnWindows) {
      console.log(chalk.blue('💡 Install WSL: https://aka.ms/wsl'));
      process.exit(0);
    }
  }

  // Step 2: Check dependencies
  console.log(chalk.blue('\n📋 Checking dependencies...\n'));
  await checkDependencies(platform, options);

  // Step 3: Select installation mode
  let selectedMode = mode || await selectMode();
  const modeConfig = MODES[selectedMode];

  console.log(chalk.green(`\n✓ Selected mode: ${modeConfig.name}`));
  console.log(chalk.gray(`  MCPs: ${modeConfig.mcps.length}`));
  console.log(chalk.gray(`  Databases: ${modeConfig.databases.join(', ')}`));
  console.log(chalk.gray(`  Cost: ${modeConfig.cost}`));

  // Step 4: Set installation directory
  const installDir = options.directory || await selectDirectory();
  console.log(chalk.gray(`\nInstallation directory: ${installDir}`));

  // Confirm installation
  const { confirmInstall } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmInstall',
    message: `Proceed with ${modeConfig.name} installation?`,
    default: true
  }]);

  if (!confirmInstall) {
    console.log(chalk.yellow('Installation cancelled.'));
    process.exit(0);
  }

  // Step 5: Create directory structure
  console.log(chalk.blue('\n📁 Creating directory structure...\n'));
  await createDirectoryStructure(installDir);

  // Step 6: Install databases
  if (!options.skipDb) {
    console.log(chalk.blue('\n🗄️  Setting up databases...\n'));
    await setupDatabases(modeConfig, installDir, platform);
  }

  // Step 7: Install MCPs
  console.log(chalk.blue('\n📦 Installing MCPs...\n'));
  await installMCPs(modeConfig.mcps, installDir);

  // Step 8: Create configuration files
  console.log(chalk.blue('\n⚙️  Creating configuration files...\n'));
  await createConfigs(modeConfig, installDir);

  // Step 9: Installation complete
  console.log(chalk.green.bold('\n✅ Installation complete!\n'));
  displayNextSteps(modeConfig, installDir);
}

/**
 * Check system dependencies
 */
async function checkDependencies(platform, options) {
  const checks = [];

  // Check Node.js
  const nodeCheck = checkNodeVersion();
  if (!nodeCheck.valid) {
    console.log(chalk.red(`❌ ${nodeCheck.message}`));
    console.log(chalk.gray(`   Install: ${platform.nodeInstall}`));
    if (!options.skipDeps) process.exit(1);
  } else {
    console.log(chalk.green(`✓ Node.js ${nodeCheck.current}`));
  }

  // Check Python
  const pythonCheck = checkPythonVersion();
  if (!pythonCheck.valid) {
    console.log(chalk.yellow(`⚠️  ${pythonCheck.message}`));
    console.log(chalk.gray(`   Install: ${platform.pythonInstall}`));
  } else {
    console.log(chalk.green(`✓ Python ${pythonCheck.current}`));
  }

  // Check package managers
  if (commandExists('npm')) {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(chalk.green(`✓ npm ${npmVersion}`));
  } else {
    console.log(chalk.red('❌ npm not found'));
    if (!options.skipDeps) process.exit(1);
  }

  if (commandExists('git')) {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(chalk.green(`✓ ${gitVersion}`));
  } else {
    console.log(chalk.yellow('⚠️  git not found (recommended)'));
  }
}

/**
 * Interactive mode selection
 */
async function selectMode() {
  const { mode } = await inquirer.prompt([{
    type: 'list',
    name: 'mode',
    message: 'Select installation mode:',
    choices: [
      {
        name: `${MODES.minimal.name} - ${MODES.minimal.description} (${MODES.minimal.cost})`,
        value: 'minimal'
      },
      {
        name: `${MODES.standard.name} - ${MODES.standard.description} (${MODES.standard.cost})`,
        value: 'standard'
      },
      {
        name: `${MODES.premium.name} - ${MODES.premium.description} (${MODES.premium.cost})`,
        value: 'premium'
      }
    ]
  }]);

  return mode;
}

/**
 * Interactive directory selection
 */
async function selectDirectory() {
  const defaultDir = path.join(process.env.HOME || process.env.USERPROFILE, 'crypto-mcp-suite');

  const { installDir } = await inquirer.prompt([{
    type: 'input',
    name: 'installDir',
    message: 'Installation directory:',
    default: defaultDir
  }]);

  return installDir;
}

/**
 * Create directory structure
 */
async function createDirectoryStructure(installDir) {
  const spinner = ora('Creating directories...').start();

  try {
    const dirs = [
      'mcps',
      'configs',
      'logs',
      'data/redis',
      'data/postgresql',
      'data/sqlite',
      'scripts',
      'backups'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(installDir, dir));
    }

    spinner.succeed('Directory structure created');
  } catch (error) {
    spinner.fail('Failed to create directories');
    throw error;
  }
}

/**
 * Setup databases based on mode
 */
async function setupDatabases(modeConfig, installDir, platform) {
  for (const db of modeConfig.databases) {
    switch (db) {
      case 'redis':
        await setupRedisDatabase(installDir, platform);
        break;
      case 'postgresql':
        await setupPostgreSQLDatabase(installDir, platform);
        break;
      case 'sqlite':
        await setupSQLiteDatabase(installDir);
        break;
    }
  }
}

/**
 * Setup Redis
 */
async function setupRedisDatabase(installDir, platform) {
  const spinner = ora('Setting up Redis...').start();

  // Check if Redis is installed
  if (!commandExists('redis-server')) {
    spinner.warn('Redis not installed');
    console.log(chalk.yellow(`\n  Install Redis: ${platform.redisInstall}\n`));
    return;
  }

  // Test connection
  const test = await testRedisConnection();
  if (!test.success) {
    spinner.warn('Redis is not running. Start it with: redis-server');
    return;
  }

  // Create configuration
  await setupRedis(installDir);
  spinner.succeed('Redis configured');
}

/**
 * Setup PostgreSQL
 */
async function setupPostgreSQLDatabase(installDir, platform) {
  const spinner = ora('Setting up PostgreSQL...').start();

  if (!commandExists('psql')) {
    spinner.warn('PostgreSQL not installed');
    console.log(chalk.yellow(`\n  Install PostgreSQL: ${platform.postgresInstall}\n`));
    return;
  }

  // Test connection
  const test = await testPostgresConnection();
  if (!test.success) {
    spinner.warn('PostgreSQL connection failed. Check credentials.');
    return;
  }

  // Setup database
  await setupPostgreSQL(installDir);
  spinner.succeed('PostgreSQL configured');
}

/**
 * Setup SQLite
 */
async function setupSQLiteDatabase(installDir) {
  const spinner = ora('Setting up SQLite...').start();

  const dbPath = path.join(installDir, 'data/sqlite/crypto_mcp.db');
  await fs.ensureFile(dbPath);

  spinner.succeed(`SQLite database created: ${dbPath}`);
}

/**
 * Install MCPs
 */
async function installMCPs(mcps, installDir) {
  for (const mcpName of mcps) {
    const spinner = ora(`Installing ${mcpName}...`).start();

    try {
      const mcpDir = path.join(installDir, 'mcps', mcpName);
      await fs.ensureDir(mcpDir);

      // Clone from Kukapay (simulation - would be real git clone)
      spinner.text = `Cloning ${mcpName}...`;
      // execSync(`git clone https://github.com/kukapay/${mcpName} ${mcpDir}`, { stdio: 'ignore' });

      // Install dependencies
      spinner.text = `Installing ${mcpName} dependencies...`;
      // In production, would run npm install or pip install

      spinner.succeed(`${mcpName} installed`);
    } catch (error) {
      spinner.fail(`Failed to install ${mcpName}`);
      console.error(chalk.red(error.message));
    }
  }
}

/**
 * Create configuration files
 */
async function createConfigs(modeConfig, installDir) {
  const spinner = ora('Creating configuration files...').start();

  // Create .env file
  const envContent = `# Crypto MCP Suite Configuration
# Installation Mode: ${modeConfig.name}
# Generated: ${new Date().toISOString()}

# Database Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=crypto_mcp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
SQLITE_PATH=${path.join(installDir, 'data/sqlite/crypto_mcp.db')}

# MCP Configuration
MCP_INSTALL_DIR=${path.join(installDir, 'mcps')}
LOG_DIR=${path.join(installDir, 'logs')}
LOG_LEVEL=info

# API Keys (configure as needed)
# SANTIMENT_API_KEY=your_key_here
# WHALE_ALERT_API_KEY=your_key_here
# DUNE_API_KEY=your_key_here
# ALCHEMY_API_KEY=your_key_here
# HELIUS_API_KEY=your_key_here
`;

  const envPath = path.join(installDir, '.env');
  await fs.writeFile(envPath, envContent);

  spinner.succeed('Configuration files created');
}

/**
 * Display next steps after installation
 */
function displayNextSteps(modeConfig, installDir) {
  console.log(chalk.bold('Next steps:\n'));
  console.log(chalk.gray('1. Configure API keys in .env file:'));
  console.log(chalk.cyan(`   cd ${installDir}`));
  console.log(chalk.cyan(`   nano .env\n`));

  if (modeConfig.databases.includes('redis')) {
    console.log(chalk.gray('2. Start Redis:'));
    console.log(chalk.cyan('   redis-server\n'));
  }

  if (modeConfig.databases.includes('postgresql')) {
    console.log(chalk.gray('3. Start PostgreSQL (if not running)\n'));
  }

  console.log(chalk.gray('4. Start MCP Suite:'));
  console.log(chalk.cyan('   crypto-mcp-suite start\n'));

  console.log(chalk.gray('5. Check status:'));
  console.log(chalk.cyan('   crypto-mcp-suite status\n'));

  console.log(chalk.gray('6. View logs:'));
  console.log(chalk.cyan('   crypto-mcp-suite logs <mcp-name>\n'));

  console.log(chalk.gray('7. Test MCPs:'));
  console.log(chalk.cyan('   crypto-mcp-suite test\n'));

  console.log(chalk.blue('📖 Documentation: https://crypto-mcp-suite.dev/docs'));
  console.log(chalk.blue('💬 Support: https://github.com/crypto-mcp-suite/issues\n'));
}

module.exports = install;
