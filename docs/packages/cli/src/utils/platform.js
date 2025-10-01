/**
 * Platform detection and system utilities
 */

const os = require('os');
const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * Detect the current operating system and package manager
 */
function detectPlatform() {
  const platform = os.platform();
  const arch = os.arch();

  let config = {
    platform,
    arch,
    os: 'unknown',
    packageManager: null,
    shell: process.env.SHELL || 'sh',
  };

  switch (platform) {
    case 'darwin':
      config.os = 'macOS';
      config.packageManager = 'brew';
      config.nodeInstall = 'brew install node@18';
      config.pythonInstall = 'brew install python@3.11';
      config.redisInstall = 'brew install redis';
      config.postgresInstall = 'brew install postgresql@15';
      config.timescaleInstall = 'brew tap timescale/tap && brew install timescaledb';
      break;

    case 'linux':
      config.os = 'Linux';
      // Detect distro
      try {
        const releaseInfo = execSync('cat /etc/os-release', { encoding: 'utf8' });
        if (releaseInfo.includes('Ubuntu') || releaseInfo.includes('Debian')) {
          config.distro = 'Ubuntu/Debian';
          config.packageManager = 'apt';
          config.nodeInstall = 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs';
          config.pythonInstall = 'sudo apt install -y python3.11 python3.11-venv python3-pip';
          config.redisInstall = 'sudo apt install -y redis-server';
          config.postgresInstall = 'sudo apt install -y postgresql-15 postgresql-contrib';
          config.timescaleInstall = 'sudo add-apt-repository ppa:timescale/timescaledb-ppa && sudo apt install -y timescaledb-postgresql-15';
        } else if (releaseInfo.includes('Fedora') || releaseInfo.includes('Red Hat')) {
          config.distro = 'Fedora/RHEL';
          config.packageManager = 'dnf';
          config.nodeInstall = 'sudo dnf install -y nodejs';
          config.pythonInstall = 'sudo dnf install -y python3.11';
          config.redisInstall = 'sudo dnf install -y redis';
          config.postgresInstall = 'sudo dnf install -y postgresql-server postgresql-contrib';
          config.timescaleInstall = 'echo "Manual TimescaleDB installation required"';
        }
      } catch (error) {
        console.error(chalk.yellow('⚠️  Could not detect Linux distribution'));
      }
      break;

    case 'win32':
      config.os = 'Windows';
      config.packageManager = 'choco';
      config.nodeInstall = 'choco install nodejs-lts -y';
      config.pythonInstall = 'choco install python311 -y';
      config.redisInstall = 'choco install redis-64 -y';
      config.postgresInstall = 'choco install postgresql15 -y';
      config.timescaleInstall = 'echo "TimescaleDB requires manual installation on Windows"';
      config.wslRecommended = true;
      break;

    default:
      console.error(chalk.red(`❌ Unsupported platform: ${platform}`));
      process.exit(1);
  }

  return config;
}

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    const checkCmd = os.platform() === 'win32'
      ? `where ${command}`
      : `command -v ${command}`;
    execSync(checkCmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));

  if (major < 18) {
    return {
      valid: false,
      current: version,
      required: '>=18.0.0',
      message: `Node.js ${version} is too old. Please upgrade to v18 or later.`
    };
  }

  return {
    valid: true,
    current: version,
    required: '>=18.0.0'
  };
}

/**
 * Check Python version
 */
function checkPythonVersion() {
  try {
    const version = execSync('python3 --version', { encoding: 'utf8' }).trim();
    const match = version.match(/Python (\d+)\.(\d+)/);

    if (!match) {
      return { valid: false, current: 'unknown', required: '>=3.10' };
    }

    const major = parseInt(match[1]);
    const minor = parseInt(match[2]);

    if (major < 3 || (major === 3 && minor < 10)) {
      return {
        valid: false,
        current: version,
        required: '>=3.10',
        message: `Python ${version} is too old. Please upgrade to 3.10 or later.`
      };
    }

    return {
      valid: true,
      current: version,
      required: '>=3.10'
    };
  } catch {
    return {
      valid: false,
      current: 'not found',
      required: '>=3.10',
      message: 'Python 3 is not installed'
    };
  }
}

/**
 * Get system resource information
 */
function getSystemResources() {
  return {
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpuCount: os.cpus().length,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: os.uptime()
  };
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  detectPlatform,
  commandExists,
  checkNodeVersion,
  checkPythonVersion,
  getSystemResources,
  formatBytes
};
