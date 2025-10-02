#!/usr/bin/env node
/**
 * Post-Deployment Health Check Script
 * Crypto MCP Suite - Phase 5 Automated Validation
 *
 * Validates:
 * - PM2 process status (all MCPs online)
 * - Restart counts (no restart loops)
 * - Error log analysis
 * - Resource usage (CPU, memory)
 * - Port availability
 *
 * Usage: node scripts/health-check.js
 */

const { execSync } = require('child_process');
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

function printMetric(label, value, unit = '') {
    console.log(`${colors.magenta}📊 METRIC${colors.reset}: ${label}: ${value}${unit}`);
}

function execCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        return null;
    }
}

console.log('==========================================');
console.log('Crypto MCP Suite - Post-Deployment Health Check');
console.log('Phase 5: MCP Health Validation');
console.log('==========================================\n');

// Check 1: PM2 is running
console.log('Checking PM2 daemon status...\n');

const pm2Status = execCommand('pm2 ping');
if (pm2Status === 'pong') {
    printStatus(true, 'PM2 daemon is running');
} else {
    printStatus(false, 'PM2 daemon is not running (start with: pm2 ping)');
    console.log('\nCannot proceed with health check without PM2 running.');
    process.exit(1);
}

// Check 2: Get PM2 process list
console.log('\nChecking PM2 process list...\n');

const pm2List = execCommand('pm2 jlist');
if (!pm2List) {
    printStatus(false, 'Cannot retrieve PM2 process list');
    process.exit(1);
}

let processes;
try {
    processes = JSON.parse(pm2List);
} catch (error) {
    printStatus(false, 'Cannot parse PM2 process list JSON');
    process.exit(1);
}

if (processes.length === 0) {
    printStatus(false, 'No PM2 processes running (deploy MCPs first)');
    console.log('\nDeploy MCPs using:');
    console.log('  pm2 start native/config/ecosystem.config.js --only <tier-preset>');
    process.exit(1);
}

printInfo(`Total PM2 processes: ${processes.length}`);

// Check 3: Process status analysis
console.log('\nAnalyzing process status...\n');

let onlineCount = 0;
let stoppedCount = 0;
let errorCount = 0;
let restartLoops = [];

processes.forEach(proc => {
    const name = proc.name;
    const status = proc.pm2_env.status;
    const restarts = proc.pm2_env.restart_time;

    if (status === 'online') {
        onlineCount++;
    } else if (status === 'stopped') {
        stoppedCount++;
        printStatus(false, `${name} - Status: ${status}`);
    } else if (status === 'errored') {
        errorCount++;
        printStatus(false, `${name} - Status: ${status} (check logs: pm2 logs ${name} --err)`);
    }

    // Check for restart loops (restart count > 10 is suspicious)
    if (restarts > 10) {
        restartLoops.push({ name, restarts });
        printWarning(`${name} - Restart count: ${restarts} (possible restart loop)`);
    }
});

printMetric('Online MCPs', onlineCount, ` / ${processes.length}`);
printMetric('Stopped MCPs', stoppedCount);
printMetric('Errored MCPs', errorCount);

if (onlineCount === processes.length) {
    printStatus(true, 'All MCPs are online');
} else {
    printStatus(false, `${processes.length - onlineCount} MCPs are NOT online`);
}

// Check 4: Restart loop detection
console.log('\nChecking for restart loops...\n');

if (restartLoops.length === 0) {
    printStatus(true, 'No restart loops detected (all restart counts < 10)');
} else {
    printStatus(false, `${restartLoops.length} MCPs have high restart counts (> 10)`);
    restartLoops.forEach(({ name, restarts }) => {
        printInfo(`${name}: ${restarts} restarts`);
    });
}

// Check 5: Resource usage analysis
console.log('\nAnalyzing resource usage...\n');

let totalCPU = 0;
let totalMemoryMB = 0;
let highCPUProcesses = [];
let highMemoryProcesses = [];

processes.forEach(proc => {
    const name = proc.name;
    const cpu = proc.monit.cpu || 0;
    const memoryBytes = proc.monit.memory || 0;
    const memoryMB = Math.round(memoryBytes / (1024 * 1024));

    totalCPU += cpu;
    totalMemoryMB += memoryMB;

    // Flag high CPU usage (> 20%)
    if (cpu > 20) {
        highCPUProcesses.push({ name, cpu });
    }

    // Flag high memory usage (> 500MB)
    if (memoryMB > 500) {
        highMemoryProcesses.push({ name, memoryMB });
    }
});

printMetric('Total CPU Usage', totalCPU.toFixed(2), '%');
printMetric('Total Memory Usage', totalMemoryMB, 'MB');

if (totalCPU < 50) {
    printStatus(true, `Total CPU usage ${totalCPU.toFixed(2)}% is acceptable (< 50%)`);
} else {
    printStatus(false, `Total CPU usage ${totalCPU.toFixed(2)}% is HIGH (> 50%)`);
}

if (totalMemoryMB < 4096) {
    printStatus(true, `Total memory usage ${totalMemoryMB}MB is acceptable (< 4GB)`);
} else {
    printStatus(false, `Total memory usage ${totalMemoryMB}MB is HIGH (> 4GB)`);
}

if (highCPUProcesses.length > 0) {
    printWarning(`${highCPUProcesses.length} MCPs have high CPU usage (> 20%)`);
    highCPUProcesses.forEach(({ name, cpu }) => {
        printInfo(`${name}: ${cpu}% CPU`);
    });
}

if (highMemoryProcesses.length > 0) {
    printWarning(`${highMemoryProcesses.length} MCPs have high memory usage (> 500MB)`);
    highMemoryProcesses.forEach(({ name, memoryMB }) => {
        printInfo(`${name}: ${memoryMB}MB memory`);
    });
}

// Check 6: Error log analysis
console.log('\nAnalyzing recent error logs...\n');

const errorLogs = execCommand('pm2 logs --err --lines 100 --nostream');
if (errorLogs) {
    const criticalErrors = errorLogs.split('\n').filter(line =>
        line.match(/error|failed|exception/i) &&
        !line.match(/ErrorEvent|error_handler|errorMiddleware/i) // Filter false positives
    );

    if (criticalErrors.length === 0) {
        printStatus(true, 'No critical errors in recent logs');
    } else {
        printStatus(false, `${criticalErrors.length} critical errors found in recent logs`);
        printInfo('Run "pm2 logs --err" for full error details');

        // Show first 5 errors
        criticalErrors.slice(0, 5).forEach(error => {
            printInfo(error.substring(0, 100) + (error.length > 100 ? '...' : ''));
        });
    }

    // Check for API key errors
    const apiKeyErrors = errorLogs.split('\n').filter(line =>
        line.match(/401|403|unauthorized|forbidden|invalid.*key/i)
    );

    if (apiKeyErrors.length > 0) {
        printWarning(`${apiKeyErrors.length} API key/authentication errors detected`);
        printInfo('Run: ./scripts/test-api-keys.sh to validate API keys');
    }

    // Check for dependency errors
    const depErrors = errorLogs.split('\n').filter(line =>
        line.match(/cannot find module|module not found/i)
    );

    if (depErrors.length > 0) {
        printWarning(`${depErrors.length} dependency errors detected`);
        printInfo('Run: node scripts/validate-mcp-dependencies.js to check dependencies');
    }
} else {
    printInfo('No error logs available (or PM2 logs empty)');
}

// Check 7: Tier detection
console.log('\nDetecting deployed tier...\n');

const mcpNames = processes.map(p => p.name).sort();
const mcpCount = mcpNames.length;

let detectedTier = 'UNKNOWN';
if (mcpCount === 25) {
    detectedTier = 'FREE';
} else if (mcpCount >= 30 && mcpCount <= 36) {
    detectedTier = 'FREEMIUM';
} else if (mcpCount === 41) {
    detectedTier = 'FULL (Premium-Plus)';
}

printInfo(`Detected tier: ${detectedTier} (${mcpCount} MCPs deployed)`);

// Check for tier6 premium MCPs
const tier6MCPs = ['tokenmetrics-mcp', 'lunarcrush-mcp', 'ethereum-validator-queue-mcp', 'crypto-rss-mcp', 'crypto-whitepapers-mcp'];
const tier6Deployed = mcpNames.filter(name => tier6MCPs.includes(name));

if (tier6Deployed.length > 0) {
    printInfo(`Tier 6 Premium AI MCPs deployed: ${tier6Deployed.join(', ')}`);
}

// Check 8: Port availability (tier6 MCPs)
console.log('\nChecking port availability (tier6 MCPs)...\n');

const tier6Ports = [
    { mcp: 'tokenmetrics-mcp', port: 3078 },
    { mcp: 'lunarcrush-mcp', port: 3079 }
];

tier6Ports.forEach(({ mcp, port }) => {
    if (mcpNames.includes(mcp)) {
        // Check if port is listening (platform-specific)
        const portCheck = execCommand(`lsof -i :${port} 2>/dev/null || netstat -ano 2>/dev/null | grep :${port}`);
        if (portCheck) {
            printInfo(`${mcp} - Port ${port} is listening`);
        } else {
            printWarning(`${mcp} - Port ${port} may not be listening (check if MCP has HTTP endpoint)`);
        }
    }
});

// Summary
console.log('\n==========================================');
console.log('Health Check Summary');
console.log('==========================================');
console.log(`${colors.green}Passed:${colors.reset} ${passed} checks`);
console.log(`${colors.red}Failed:${colors.reset} ${failed} checks`);
console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings} checks\n`);

// Health score calculation
const totalChecks = passed + failed;
const healthScore = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 0;

console.log(`${colors.magenta}Health Score:${colors.reset} ${healthScore}%\n`);

if (failed === 0 && warnings === 0) {
    console.log(`${colors.green}✅ PERFECT HEALTH${colors.reset} - All MCPs are running optimally!`);
    console.log('\nNext steps:');
    console.log('1. Monitor logs: pm2 logs');
    console.log('2. Set up monitoring: pm2 monit');
    console.log('3. Configure log rotation: pm2 install pm2-logrotate');
    console.log('4. Enable startup script: pm2 startup && pm2 save\n');
    process.exit(0);
} else if (failed === 0) {
    console.log(`${colors.yellow}⚠️  HEALTHY WITH WARNINGS${colors.reset} - MCPs are running but some issues detected`);
    console.log('\nRecommended actions:');
    console.log('1. Review warnings above and address if needed');
    console.log('2. Monitor restart counts: pm2 status');
    console.log('3. Check resource usage: pm2 monit');
    console.log('4. Review error logs: pm2 logs --err\n');
    process.exit(0);
} else {
    console.log(`${colors.red}❌ UNHEALTHY${colors.reset} - Critical issues detected, MCPs may not be functioning properly`);
    console.log('\nRequired actions:');
    console.log('1. Fix failed checks above');
    console.log('2. Restart failed MCPs: pm2 restart <mcp-name>');
    console.log('3. Check detailed logs: pm2 logs <mcp-name> --err');
    console.log('4. Consider rollback if issues persist: pm2 stop all\n');
    process.exit(1);
}
