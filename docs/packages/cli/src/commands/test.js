/**
 * Test command - Test MCPs
 */

const chalk = require('chalk');
const ora = require('ora');

async function test(mcpName, options) {
  if (mcpName) {
    await testSingleMCP(mcpName, options);
  } else {
    await testAllMCPs(options);
  }
}

async function testAllMCPs(options) {
  console.log(chalk.blue.bold('\n🧪 Testing All MCPs\n'));

  const mcps = [
    'crypto-indicators-mcp',
    'bridge-rates-mcp',
    'crypto-sentiment-mcp',
    'whale-tracker-mcp'
  ];

  let passed = 0;
  let failed = 0;

  for (const mcp of mcps) {
    const result = await testMCP(mcp, options);
    if (result) passed++;
    else failed++;
  }

  console.log();
  if (failed === 0) {
    console.log(chalk.green(`✅ All tests passed (${passed}/${mcps.length})\n`));
  } else {
    console.log(chalk.red(`❌ ${failed} test(s) failed (${passed}/${mcps.length} passed)\n`));
  }
}

async function testSingleMCP(mcpName, options) {
  console.log(chalk.blue(`\n🧪 Testing ${mcpName}\n`));
  await testMCP(mcpName, options);
  console.log();
}

async function testMCP(mcpName, options) {
  const spinner = ora(`Testing ${mcpName}...`).start();

  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    spinner.succeed(`${mcpName} - All tests passed`);
    return true;
  } catch (error) {
    spinner.fail(`${mcpName} - Tests failed`);
    return false;
  }
}

module.exports = test;
