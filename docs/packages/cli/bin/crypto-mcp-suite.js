#!/usr/bin/env node

/**
 * Crypto MCP Suite CLI
 * Main entry point for the installer and manager
 */

const { Command } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

// Import commands
const installCmd = require('../src/commands/install');
const startCmd = require('../src/commands/start');
const stopCmd = require('../src/commands/stop');
const statusCmd = require('../src/commands/status');
const logsCmd = require('../src/commands/logs');
const testCmd = require('../src/commands/test');
const configCmd = require('../src/commands/config');
const updateCmd = require('../src/commands/update');
const uninstallCmd = require('../src/commands/uninstall');
const addCmd = require('../src/commands/add');
const removeCmd = require('../src/commands/remove');
const doctorCmd = require('../src/commands/doctor');

const program = new Command();

// CLI metadata
program
  .name('crypto-mcp-suite')
  .description('Crypto MCP Suite - Installer and Manager for 25+ Crypto MCPs')
  .version(pkg.version);

// Global options
program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--no-color', 'Disable colored output');

// Command: install
program
  .command('install [mode]')
  .description('Install Crypto MCP Suite (modes: minimal, standard, premium)')
  .option('-d, --directory <path>', 'Installation directory')
  .option('--skip-deps', 'Skip dependency installation')
  .option('--skip-db', 'Skip database setup')
  .action(installCmd);

// Command: start
program
  .command('start [mcp-name]')
  .description('Start all MCPs or a specific MCP')
  .option('--no-db', 'Start without database services')
  .action(startCmd);

// Command: stop
program
  .command('stop [mcp-name]')
  .description('Stop all MCPs or a specific MCP')
  .option('--force', 'Force stop processes')
  .action(stopCmd);

// Command: status
program
  .command('status')
  .description('Show status of all MCPs and services')
  .option('-j, --json', 'Output as JSON')
  .action(statusCmd);

// Command: logs
program
  .command('logs <mcp-name>')
  .description('Show logs for a specific MCP')
  .option('-f, --follow', 'Follow log output')
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .action(logsCmd);

// Command: test
program
  .command('test [mcp-name]')
  .description('Test all MCPs or a specific MCP')
  .option('--integration', 'Run integration tests')
  .action(testCmd);

// Command: config
program
  .command('config')
  .description('Configure MCP Suite settings')
  .option('-l, --list', 'List all configuration')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-g, --get <key>', 'Get configuration value')
  .action(configCmd);

// Command: update
program
  .command('update [mcp-name]')
  .description('Update all MCPs or a specific MCP')
  .option('--check-only', 'Only check for updates')
  .action(updateCmd);

// Command: uninstall
program
  .command('uninstall')
  .description('Uninstall Crypto MCP Suite')
  .option('--keep-data', 'Keep database data')
  .option('--force', 'Skip confirmation')
  .action(uninstallCmd);

// Command: add
program
  .command('add <mcp-name>')
  .description('Add a new MCP to the suite')
  .action(addCmd);

// Command: remove
program
  .command('remove <mcp-name>')
  .description('Remove an MCP from the suite')
  .option('--keep-data', 'Keep MCP data')
  .action(removeCmd);

// Command: doctor
program
  .command('doctor')
  .description('Diagnose system and dependency issues')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(doctorCmd);

// Parse CLI arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
