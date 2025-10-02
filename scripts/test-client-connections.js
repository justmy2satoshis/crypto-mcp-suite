#!/usr/bin/env node
/**
 * Client Connection Test Script
 * Crypto MCP Suite - Automated MCP Connectivity Verification
 *
 * Purpose: Verify that client configurations can successfully connect to all configured MCPs
 *
 * Usage:
 *   node scripts/test-client-connections.js --config <path-to-config>
 *   node scripts/test-client-connections.js --config "$env:APPDATA\Claude\claude_desktop_config.json"
 *   node scripts/test-client-connections.js --config .mcp.json
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Counters
let passed = 0;
let failed = 0;
let warnings = 0;
let tested = 0;

// Helper functions
function printStatus(success, message) {
  if (success) {
    console.log(`${colors.green}✅ PASS${colors.reset}: ${message}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAIL${colors.reset}: ${message}`);
    failed++;
  }
  tested++;
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠️  WARN${colors.reset}: ${message}`);
  warnings++;
}

function printInfo(message) {
  console.log(`${colors.cyan}ℹ️  INFO${colors.reset}: ${message}`);
}

function printMetric(label, value, unit = '') {
  console.log(`${colors.magenta}📊 METRIC${colors.reset}: ${label}: ${value}${unit}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
let configPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--config' && i + 1 < args.length) {
    configPath = args[i + 1];
    break;
  }
}

if (!configPath) {
  console.error(`${colors.red}Error: Missing --config argument${colors.reset}`);
  console.log('Usage: node scripts/test-client-connections.js --config <path-to-config>');
  console.log('Examples:');
  console.log('  Windows: node scripts/test-client-connections.js --config "$env:APPDATA\\Claude\\claude_desktop_config.json"');
  console.log('  Linux:   node scripts/test-client-connections.js --config ~/.config/Claude/claude_desktop_config.json');
  console.log('  macOS:   node scripts/test-client-connections.js --config ~/Library/Application\\ Support/Claude/claude_desktop_config.json');
  console.log('  Claude Code: node scripts/test-client-connections.js --config .mcp.json');
  process.exit(1);
}

// Expand environment variables in path (basic support)
configPath = configPath.replace(/\$env:APPDATA/g, process.env.APPDATA || '');
configPath = configPath.replace(/~/g, process.env.HOME || process.env.USERPROFILE || '');

console.log('==========================================');
console.log('Crypto MCP Suite - Client Connection Test');
console.log('==========================================\n');

printInfo(`Testing configuration: ${configPath}`);

// Check if config file exists
if (!fs.existsSync(configPath)) {
  console.error(`${colors.red}Error: Configuration file not found: ${configPath}${colors.reset}`);
  process.exit(1);
}

// Load and parse configuration
let config;
try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configContent);
} catch (error) {
  console.error(`${colors.red}Error: Cannot parse configuration file: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Validate configuration structure
if (!config.mcpServers || typeof config.mcpServers !== 'object') {
  console.error(`${colors.red}Error: Invalid configuration - missing 'mcpServers' object${colors.reset}`);
  process.exit(1);
}

const mcpServers = Object.entries(config.mcpServers).filter(
  ([key]) => !key.startsWith('_comment')
);

printInfo(`Found ${mcpServers.length} MCP servers configured\n`);

// Test each MCP server
async function testMCPConnection(name, mcpConfig) {
  return new Promise((resolve) => {
    const { command, args = [], env = {} } = mcpConfig;

    // Validate configuration
    if (!command) {
      printStatus(false, `${name} - Missing 'command' in configuration`);
      resolve({ name, success: false, error: 'Missing command' });
      return;
    }

    // Check if command exists (basic validation)
    const commandPath = args[0] || command;
    if (!fs.existsSync(commandPath) && !commandPath.includes('/') && !commandPath.includes('\\')) {
      // It's a system command (node, python, uv) - assume it's in PATH
      // We'll rely on spawn to validate
    } else if (commandPath.includes('/') || commandPath.includes('\\')) {
      // It's a file path - validate existence
      if (!fs.existsSync(commandPath)) {
        printStatus(false, `${name} - File not found: ${commandPath}`);
        resolve({ name, success: false, error: 'File not found' });
        return;
      }
    }

    // Prepare test payload (MCP initialize request)
    const testPayload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '0.1.0',
        capabilities: {},
        clientInfo: {
          name: 'test-client-connections',
          version: '1.0.0'
        }
      }
    });

    // Spawn MCP process
    const childEnv = { ...process.env, ...env };
    const child = spawn(command, args, {
      env: childEnv,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let responded = false;
    const timeout = 5000; // 5 second timeout

    const timer = setTimeout(() => {
      if (!responded) {
        child.kill();
        printStatus(false, `${name} - Timeout (no response in ${timeout}ms)`);
        resolve({ name, success: false, error: 'Timeout' });
      }
    }, timeout);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      // Check if we have a complete JSON response
      try {
        const response = JSON.parse(stdout.trim());
        if (response.result || response.error) {
          clearTimeout(timer);
          responded = true;
          child.kill();

          if (response.result) {
            printStatus(true, `${name} - Reachable (stdio transport)`);
            resolve({ name, success: true, response });
          } else {
            printStatus(false, `${name} - Error response: ${JSON.stringify(response.error)}`);
            resolve({ name, success: false, error: response.error });
          }
        }
      } catch (e) {
        // Not complete JSON yet, keep reading
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      if (!responded) {
        responded = true;
        printStatus(false, `${name} - Spawn error: ${error.message}`);
        resolve({ name, success: false, error: error.message });
      }
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (!responded) {
        responded = true;
        if (code !== 0) {
          printStatus(false, `${name} - Exited with code ${code}`);
          if (stderr) {
            printInfo(`  stderr: ${stderr.substring(0, 200)}`);
          }
          resolve({ name, success: false, error: `Exit code ${code}` });
        } else {
          printWarning(`${name} - Closed without response`);
          resolve({ name, success: false, error: 'No response' });
        }
      }
    });

    // Send test payload
    child.stdin.write(testPayload + '\n');
    child.stdin.end();
  });
}

// Test all MCPs
(async () => {
  console.log('Testing MCP connections...\n');

  const results = [];
  for (const [name, mcpConfig] of mcpServers) {
    const result = await testMCPConnection(name, mcpConfig);
    results.push(result);
  }

  // Summary
  console.log('\n==========================================');
  console.log('Connection Test Summary');
  console.log('==========================================');
  console.log(`${colors.green}Passed:${colors.reset} ${passed}/${tested} MCPs`);
  console.log(`${colors.red}Failed:${colors.reset} ${failed}/${tested} MCPs`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings} checks\n`);

  // Health score
  const healthScore = tested > 0 ? Math.round((passed / tested) * 100) : 0;
  console.log(`${colors.magenta}Connection Health Score:${colors.reset} ${healthScore}%\n`);

  // Failed MCPs analysis
  if (failed > 0) {
    console.log('Failed MCPs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    console.log('');
  }

  // Recommendations
  if (failed === 0 && warnings === 0) {
    console.log(`${colors.green}✅ PERFECT CONNECTIVITY${colors.reset} - All MCPs are reachable!`);
    console.log('\nNext steps:');
    console.log('1. Start Claude Desktop or Claude Code CLI');
    console.log('2. Test MCP tools in a conversation');
    console.log('3. Monitor for any runtime errors\n');
    process.exit(0);
  } else if (failed === 0) {
    console.log(`${colors.yellow}⚠️  CONNECTIVITY WITH WARNINGS${colors.reset} - All MCPs reachable but some issues detected`);
    console.log('\nRecommended actions:');
    console.log('1. Review warnings above');
    console.log('2. Test MCPs in client to confirm functionality');
    console.log('3. Monitor for runtime issues\n');
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ CONNECTIVITY ISSUES${colors.reset} - Some MCPs are not reachable`);
    console.log('\nRequired actions:');
    console.log('1. Fix failed MCPs (see errors above)');
    console.log('2. Verify file paths are correct and absolute');
    console.log('3. Ensure dependencies are installed:');
    console.log('   - Node.js MCPs: npm install');
    console.log('   - Python MCPs: uv sync');
    console.log('   - TypeScript MCPs: npm run build');
    console.log('4. Re-run this test script after fixes\n');
    process.exit(1);
  }
})();
