#!/usr/bin/env node
/**
 * MCP Dependency Validation Script
 * Crypto MCP Suite - Phase 5 Automated Validation
 *
 * Validates:
 * - Node.js MCPs have node_modules/ directories
 * - Python MCPs have .venv/ directories
 * - TypeScript MCPs are compiled (build/ directories exist)
 *
 * Usage: node scripts/validate-mcp-dependencies.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

// Counters
let passed = 0;
let failed = 0;
let warnings = 0;

// Helper functions
function printStatus(success, message) {
    if (success) {
        console.log(`${colors.green}✅ PASS${colors.reset}: ${message}`);
        passed++;
    } else {
        console.log(`${colors.red}❌ FAIL${colors.reset}: ${message}`);
        failed++;
    }
}

function printWarning(message) {
    console.log(`${colors.yellow}⚠️  WARN${colors.reset}: ${message}`);
    warnings++;
}

function printInfo(message) {
    console.log(`${colors.cyan}ℹ️  INFO${colors.reset}: ${message}`);
}

function fileExists(filePath) {
    return fs.existsSync(filePath);
}

function dirExists(dirPath) {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

// Node.js MCPs configuration
const nodeMCPs = [
    { name: 'bridge-rates-mcp', typescript: false, buildPath: null },
    { name: 'ccxt-mcp', typescript: true, buildPath: 'build/index.js' },
    { name: 'crypto-indicators-mcp', typescript: false, buildPath: null },
    { name: 'binance-alpha-mcp', typescript: false, buildPath: null },
    { name: 'uniswap-trader-mcp', typescript: false, buildPath: null },
    { name: 'jupiter-mcp', typescript: false, buildPath: null },
    { name: 'uniswap-price-mcp', typescript: false, buildPath: null },
    { name: 'tokenmetrics-mcp', typescript: true, buildPath: 'build/src/cli.js' },
    { name: 'lunarcrush-mcp', typescript: false, buildPath: null },
    { name: 'sui-trader-mcp', typescript: false, buildPath: null },
    { name: 'raydium-launchlab-mcp', typescript: false, buildPath: null }
];

// Python MCPs (detected via pyproject.toml)
const libPath = path.join(process.cwd(), 'native', 'lib');

console.log('==========================================');
console.log('Crypto MCP Suite - Dependency Validation');
console.log('Phase 5: MCP Dependencies Check');
console.log('==========================================\n');

// Validation 1: Check Node.js MCPs
console.log('Validating Node.js MCP dependencies...\n');

nodeMCPs.forEach(mcp => {
    const mcpPath = path.join(libPath, mcp.name);
    const packageJsonPath = path.join(mcpPath, 'package.json');
    const nodeModulesPath = path.join(mcpPath, 'node_modules');

    // Check if MCP directory exists
    if (!dirExists(mcpPath)) {
        printStatus(false, `${mcp.name} - Directory not found`);
        return;
    }

    // Check package.json exists
    if (!fileExists(packageJsonPath)) {
        printStatus(false, `${mcp.name} - package.json not found`);
        return;
    }

    // Check node_modules exists
    if (!dirExists(nodeModulesPath)) {
        printStatus(false, `${mcp.name} - node_modules/ not found (run: cd native/lib/${mcp.name} && npm install)`);
        return;
    }

    // If TypeScript, check build path
    if (mcp.typescript) {
        const buildPath = path.join(mcpPath, mcp.buildPath);
        if (!fileExists(buildPath)) {
            printStatus(false, `${mcp.name} - TypeScript not compiled: ${mcp.buildPath} not found (run: cd native/lib/${mcp.name} && npm run build)`);
            return;
        } else {
            printStatus(true, `${mcp.name} - Dependencies + TypeScript compilation OK`);
        }
    } else {
        printStatus(true, `${mcp.name} - Dependencies installed`);
    }
});

console.log('\nValidating Python MCP dependencies...\n');

// Validation 2: Check Python MCPs
let pythonMCPsFound = 0;
let pythonMCPsValid = 0;

if (!dirExists(libPath)) {
    printStatus(false, 'native/lib directory not found');
} else {
    const dirs = fs.readdirSync(libPath);

    dirs.forEach(dir => {
        const mcpPath = path.join(libPath, dir);
        const pyprojectPath = path.join(mcpPath, 'pyproject.toml');

        if (fileExists(pyprojectPath)) {
            pythonMCPsFound++;
            const venvPath = path.join(mcpPath, '.venv');

            if (!dirExists(venvPath)) {
                printStatus(false, `${dir} - .venv/ not found (run: cd native/lib/${dir} && uv sync)`);
            } else {
                printStatus(true, `${dir} - Python virtualenv OK`);
                pythonMCPsValid++;
            }
        }
    });
}

console.log('\nValidating ecosystem.config.js paths...\n');

// Validation 3: Check ecosystem.config.js critical paths
const ecosystemPath = path.join(process.cwd(), 'native', 'config', 'ecosystem.config.js');

if (!fileExists(ecosystemPath)) {
    printStatus(false, 'ecosystem.config.js not found');
} else {
    const ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');

    // Check tokenmetrics-mcp path (Phase 8D P0-4 fix)
    if (ecosystemContent.includes("'tokenmetrics-mcp', 'build', 'src', 'cli.js'") ||
        ecosystemContent.includes('tokenmetrics-mcp/build/src/cli.js')) {
        printStatus(true, 'tokenmetrics-mcp - Correct path in ecosystem.config.js (build/src/cli.js)');
    } else if (ecosystemContent.includes('tokenmetrics-mcp/dist/index.js')) {
        printStatus(false, 'tokenmetrics-mcp - WRONG path in ecosystem.config.js (should be build/src/cli.js, not dist/index.js)');
    } else {
        printWarning('tokenmetrics-mcp - Could not verify path in ecosystem.config.js');
    }

    // Check ccxt-mcp path
    if (ecosystemContent.includes("'ccxt-mcp', 'build', 'index.js'") ||
        ecosystemContent.includes('ccxt-mcp/build/index.js')) {
        printStatus(true, 'ccxt-mcp - Correct path in ecosystem.config.js (build/index.js)');
    } else {
        printWarning('ccxt-mcp - Could not verify path in ecosystem.config.js');
    }
}

// Summary
console.log('\n==========================================');
console.log('Dependency Validation Summary');
console.log('==========================================');
console.log(`${colors.green}Passed:${colors.reset} ${passed} checks`);
console.log(`${colors.red}Failed:${colors.reset} ${failed} checks`);
console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings} checks\n`);

console.log('Node.js MCPs: ' + nodeMCPs.length + ' total');
console.log('Python MCPs: ' + pythonMCPsFound + ' found, ' + pythonMCPsValid + ' valid\n');

if (failed === 0) {
    console.log(`${colors.green}✅ ALL DEPENDENCIES VALIDATED${colors.reset} - Ready for deployment!`);
    console.log('\nNext steps:');
    console.log('1. Run: ./scripts/test-api-keys.sh (if using API-dependent MCPs)');
    console.log('2. Deploy: pm2 start native/config/ecosystem.config.js --only <tier-preset>');
    console.log('3. Validate: node scripts/health-check.js (after deployment)\n');
    process.exit(0);
} else {
    console.log(`${colors.red}❌ DEPENDENCY VALIDATION FAILED${colors.reset} - Fix issues above before deployment`);
    console.log('\nCommon fixes:');
    console.log('- Node.js MCPs: cd native/lib/<mcp-name> && npm install');
    console.log('- Python MCPs: cd native/lib/<mcp-name> && uv sync');
    console.log('- TypeScript MCPs: cd native/lib/<mcp-name> && npm run build');
    console.log('- ecosystem.config.js: Fix paths (tokenmetrics-mcp: build/src/cli.js, ccxt-mcp: build/index.js)\n');
    process.exit(1);
}
