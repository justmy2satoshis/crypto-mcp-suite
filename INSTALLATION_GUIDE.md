# Installation Guide
## Crypto MCP Suite - Step-by-Step Deployment

**Version:** Phase 8D (41/66 MCPs - 62% Coverage)
**Last Updated:** October 2, 2025
**Target Audience:** Developers, Traders, Analysts

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Pre-Installation Checklist](#pre-installation-checklist)
4. [Installation Steps](#installation-steps)
5. [API Key Configuration](#api-key-configuration)
6. [Starting MCPs](#starting-mcps)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|-------------|
| **Node.js** | 18.0+ | Run Node.js MCPs (3 MCPs) | https://nodejs.org/ |
| **Python** | 3.10+ | Run Python MCPs (38 MCPs) | https://python.org/ |
| **uv** | Latest | Python dependency manager | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| **Git** | 2.30+ | Submodule support | https://git-scm.com/ |
| **PM2** | Latest | Process management | `npm install -g pm2` |

### Optional Software

- **Redis** (for caching, optional but recommended)
- **PostgreSQL** (for advanced analytics, optional)

---

## System Requirements

### Minimum Requirements

- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 2 GB free space
- **OS:** macOS 11+, Ubuntu 20.04+, Debian 11+, Fedora 38+, Windows 10/11 (WSL 2)

### Recommended Requirements

- **CPU:** 4+ cores
- **RAM:** 8+ GB
- **Storage:** 5 GB free space (includes dependencies)
- **OS:** Linux/macOS for production

---

## Pre-Installation Checklist

**Before you begin, ensure you have:**

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.10+ installed (`python3 --version`)
- [ ] uv package manager installed (`uv --version`)
- [ ] Git with submodule support (`git --version`)
- [ ] PM2 process manager (`pm2 --version`)
- [ ] GitHub account (for cloning repository)
- [ ] API keys ready (see [API_KEY_SETUP_GUIDE.md](API_KEY_SETUP_GUIDE.md))
- [ ] Terminal/Shell access with ~30 minutes available

---

## Installation Steps

### Step 1: Clone Repository with Submodules

**CRITICAL:** Use `--recurse-submodules` flag to clone all 41 MCP repositories:

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/justmy2satoshis/crypto-mcp-suite.git

# Navigate to directory
cd crypto-mcp-suite
```

**If you already cloned without submodules:**
```bash
cd crypto-mcp-suite
git submodule update --init --recursive
```

**Verify submodules:**
```bash
git submodule status | wc -l
# Should output: 41
```

---

### Step 2: Install Node.js Dependencies

**3 Node.js MCPs require npm dependencies:**

```bash
# Install bridge-rates-mcp dependencies
cd native/lib/bridge-rates-mcp
npm install
cd ../../..

# Install ccxt-mcp dependencies
cd native/lib/ccxt-mcp
npm install
cd ../../..

# Install crypto-indicators-mcp dependencies
cd native/lib/crypto-indicators-mcp
npm install
cd ../../..
```

**Expected Output:**
- bridge-rates-mcp: 167 packages installed
- ccxt-mcp: 103 packages installed
- crypto-indicators-mcp: 123 packages installed (1 low severity vulnerability - documented)

**Verify:**
```bash
# Check node_modules directories exist
ls -la native/lib/bridge-rates-mcp/node_modules | head -5
ls -la native/lib/ccxt-mcp/node_modules | head -5
ls -la native/lib/crypto-indicators-mcp/node_modules | head -5
```

---

### Step 3: Install Python Dependencies

**38 Python MCPs require uv dependencies:**

```bash
# Automated installation for all Python MCPs
for dir in native/lib/*/; do
  if [ -f "$dir/pyproject.toml" ]; then
    echo "Installing $dir..."
    cd "$dir"
    uv sync
    cd - > /dev/null
  fi
done
```

**Manual installation (alternative):**
```bash
# Install each Python MCP individually
cd native/lib/chainlist-mcp && uv sync && cd ../../..
cd native/lib/crypto-feargreed-mcp && uv sync && cd ../../..
cd native/lib/crypto-liquidations-mcp && uv sync && cd ../../..
# ... (repeat for all 38 Python MCPs)
```

**Verify:**
```bash
# Count Python MCPs with .venv directories
find native/lib -type d -name ".venv" | wc -l
# Should output: 38
```

---

### Step 4: Compile TypeScript MCPs

**2 TypeScript MCPs require compilation:**

```bash
# Compile ccxt-mcp
cd native/lib/ccxt-mcp
npm run build
cd ../../..

# Compile tokenmetrics-mcp
cd native/lib/tokenmetrics-mcp
npm run build
cd ../../..
```

**Expected Output:**
- ccxt-mcp: Creates `build/` directory with compiled JavaScript
- tokenmetrics-mcp: Creates `build/src/cli.js` and `build/src/index.js`

**Verify:**
```bash
# Check compiled files exist
ls -la native/lib/ccxt-mcp/build/
ls -la native/lib/tokenmetrics-mcp/build/src/cli.js
```

---

### Step 5: Configure API Keys

**Create root-level .env.local file:**

```bash
# Copy template
cp .env.example .env.local

# Edit with your API keys
nano .env.local  # or use your preferred editor
```

**CRITICAL API Keys (Required for 10 MCPs):**

```bash
# Premium AI Analytics (FREE tiers available)
TOKENMETRICS_API_KEY=your_key_here
LUNARCRUSH_API_KEY=your_key_here

# Infrastructure APIs
INFURA_API_KEY=your_key_here
THEGRAPH_API_KEY=your_key_here
DUNE_API_KEY=your_key_here
SANTIMENT_API_KEY=your_key_here
CRYPTOPANIC_API_KEY=your_key_here
COINGLASS_API_KEY=your_key_here
SOLSNIFFER_API_KEY=your_key_here

# Test wallets (⚠️ < $10 balance only)
WALLET_PRIVATE_KEY=your_test_eth_key_here
PRIVATE_KEY=your_test_sol_key_here
```

**Create individual MCP .env files:**

See [API_KEY_SETUP_GUIDE.md](API_KEY_SETUP_GUIDE.md) for detailed instructions on creating .env files for each MCP.

**Quick setup for critical MCPs:**
```bash
# Create .env for tokenmetrics-mcp
echo "TOKENMETRICS_API_KEY=your_key_here" > native/lib/tokenmetrics-mcp/.env

# Create .env for lunarcrush-mcp
echo "LUNARCRUSH_API_KEY=your_key_here" > native/lib/lunarcrush-mcp/.env

# Create .env for uniswap-trader-mcp
echo "INFURA_API_KEY=your_key_here" > native/lib/uniswap-trader-mcp/.env
echo "WALLET_PRIVATE_KEY=your_test_key_here" >> native/lib/uniswap-trader-mcp/.env
```

---

### Step 6: Install PM2 Globally

**PM2 is required for MCP process management:**

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Set PM2 to start on system boot (optional)
pm2 startup
pm2 save
```

---

### Step 7: Start MCPs

**Option A: Start All 41 MCPs (Premium-Plus Tier)**

```bash
pm2 start native/config/ecosystem.config.js --only premium-plus
```

**Option B: Start Specific Tier Preset**

```bash
# Essential only (10 MCPs)
pm2 start native/config/ecosystem.config.js --only essential

# Enhanced (18 MCPs)
pm2 start native/config/ecosystem.config.js --only enhanced

# Advanced (23 MCPs)
pm2 start native/config/ecosystem.config.js --only advanced

# Premium (30 MCPs)
pm2 start native/config/ecosystem.config.js --only premium

# Full (36 MCPs, excludes tier6 premium)
pm2 start native/config/ecosystem.config.js --only full

# Crypto-Plus (16 MCPs - tier1 + tier5)
pm2 start native/config/ecosystem.config.js --only crypto-plus
```

**Option C: Start Individual MCPs**

```bash
# Start specific MCP by name
pm2 start native/config/ecosystem.config.js --only tokenmetrics-mcp
pm2 start native/config/ecosystem.config.js --only lunarcrush-mcp
```

---

### Step 8: Verify Installation

**Check PM2 status:**
```bash
pm2 status
```

**Expected Output:**
```
┌─────┬───────────────────────────┬─────────┬─────────┬─────────┬─────────┐
│ id  │ name                      │ mode    │ ↺       │ status  │ cpu     │
├─────┼───────────────────────────┼─────────┼─────────┼─────────┼─────────┤
│ 0   │ tokenmetrics-mcp          │ fork    │ 0       │ online  │ 0%      │
│ 1   │ lunarcrush-mcp            │ fork    │ 0       │ online  │ 0%      │
│ ... │ ...                       │ ...     │ ...     │ ...     │ ...     │
└─────┴───────────────────────────┴─────────┴─────────┴─────────┴─────────┘
```

**Check MCP logs:**
```bash
# View all logs
pm2 logs

# View specific MCP logs
pm2 logs tokenmetrics-mcp
pm2 logs lunarcrush-mcp

# View last 100 lines
pm2 logs --lines 100
```

**Test MCP connectivity:**
```bash
# Test if MCPs are responding on their ports
# Tier 6 premium MCPs use ports 3078-3082

# Check tokenmetrics-mcp (port 3078)
curl http://localhost:3078/health || echo "MCP may not have health endpoint"

# Check if port is listening
lsof -i :3078  # macOS/Linux
netstat -ano | findstr :3078  # Windows
```

---

## Pre-Deployment Validation

**Before deploying to production**, validate your installation using our comprehensive pre-deployment framework:

### Quick Validation (2-5 minutes)

```bash
# Step 1: Validate system requirements
./scripts/pre-deployment-check.sh

# Step 2: Verify dependencies
node scripts/validate-mcp-dependencies.js

# Step 3: Test API keys (if using API-dependent MCPs)
./scripts/test-api-keys.sh
```

### Comprehensive Deployment Framework

For production deployments, follow our **5-phase validation framework** (30-60 minutes):

**Phase A: Pre-Deployment Local Validation**
- System requirements (Node.js, Python, uv, Git, PM2)
- Repository & submodule status
- Node.js & Python dependencies
- TypeScript compilation
- Configuration file validation

**Phase B: Deployment Preparation**
- API key configuration (tier-specific)
- API key validation
- Backup current state

**Phase C: Deployment Execution**
- Choose tier (FREE, FREEMIUM, FULL)
- Deploy with PM2
- Monitor startup

**Phase D: Post-Deployment Validation**
- Process health check
- Functionality validation (tier-specific)
- Error log analysis
- Resource monitoring

**Phase E: Rollback Procedures** (if needed)
- Emergency rollback steps
- Root cause diagnosis
- Fix and retry

**📋 [Pre-Deployment Checklist](docs/PRE_DEPLOYMENT_CHECKLIST.md)** - Complete 5-phase framework

### Additional Resources

- **[MCP Capability Matrix](docs/MCP_CAPABILITY_MATRIX.md)** - Complete 41-MCP capability reference with dependencies, API keys, and tiers
- **[Error Pattern Library](docs/ERROR_PATTERN_LIBRARY.md)** - Troubleshooting guide with real Phase 8D error patterns and fixes
- **[API Key Setup Guide](API_KEY_SETUP_GUIDE.md)** - Detailed API signup and configuration

---

## Client Configuration

### Overview

After installing MCPs server-side with PM2, you need to configure **client connections** for:
- ✅ **Claude Desktop** - MCP support via `claude_desktop_config.json`
- ✅ **Claude Code CLI** - MCP support via `.mcp.json`

**Key Point:** Clients spawn **independent MCP processes** (not connected to PM2). PM2 is for server-side development and monitoring only.

### Step 1: Choose Client Configuration Template

All 41 crypto MCPs use **stdio transport** (100% client compatibility).

| Client | Config File | Location |
|--------|-------------|----------|
| **Claude Desktop (Windows)** | `configs/claude_desktop_config_windows.json` | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Claude Desktop (Linux)** | `configs/claude_desktop_config_linux.json` | `~/.config/Claude/claude_desktop_config.json` |
| **Claude Desktop (macOS)** | `configs/claude_desktop_config_macos.json` | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Claude Code CLI** | `configs/.mcp.json` | Project root or `~/.mcp.json` |

### Step 2: Install Configuration

```bash
# Windows (PowerShell) - Claude Desktop
Copy-Item "configs\claude_desktop_config_windows.json" "$env:APPDATA\Claude\claude_desktop_config.json"

# Linux - Claude Desktop
cp configs/claude_desktop_config_linux.json ~/.config/Claude/claude_desktop_config.json

# macOS - Claude Desktop
cp configs/claude_desktop_config_macos.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Claude Code CLI (any platform)
cp configs/.mcp.json .mcp.json
```

### Step 3: Customize Paths

Edit the installed configuration file and replace placeholder paths with your actual installation directory:

**Windows Example:**
```json
"C:\\Users\\User\\mcp-servers\\Crypto MCPs\\Crypto-MCP-Suite\\native\\lib\\ccxt-mcp\\build\\index.js"
```

**Linux Example:**
```json
"/home/deploy/workcraft-mcp/native/lib/ccxt-mcp/build/index.js"
```

**macOS Example:**
```json
"/Users/username/crypto-mcp-suite/native/lib/ccxt-mcp/build/index.js"
```

### Step 4: Test Client Connectivity

**Automated Testing:**
```bash
# Test Claude Desktop configuration
node scripts/test-client-connections.js --config "$env:APPDATA\Claude\claude_desktop_config.json"  # Windows
node scripts/test-client-connections.js --config ~/.config/Claude/claude_desktop_config.json      # Linux/macOS

# Test Claude Code CLI configuration
node scripts/test-client-connections.js --config .mcp.json
```

**Expected Output:**
```
==========================================
Crypto MCP Suite - Client Connection Test
==========================================

ℹ️  INFO: Testing configuration: .mcp.json
ℹ️  INFO: Found 41 MCP servers configured

Testing MCP connections...

✅ PASS: ccxt-mcp - Reachable (stdio transport)
✅ PASS: chainlist-mcp - Reachable (stdio transport)
✅ PASS: tokenmetrics-mcp - Reachable (stdio transport)
...

==========================================
Connection Test Summary
==========================================
Passed: 41/41 MCPs
Failed: 0/41 MCPs
Warnings: 0 checks

Connection Health Score: 100%

✅ PERFECT CONNECTIVITY - All MCPs are reachable!
```

### Step 5: Restart Client

- **Claude Desktop:** Quit and restart the application completely
- **Claude Code CLI:** Configuration auto-detected on next session (no restart needed)

### Deployment Tiers

Configure a subset of MCPs based on your needs:

- **FREE Tier** (25 MCPs, 0 API keys) - Only MCPs without API requirements
- **FREEMIUM Tier** (35 MCPs, free API tiers) - Includes TokenMetrics/LunarCrush free tiers
- **FULL Tier** (41 MCPs, all features) - Complete suite with all API keys configured

### Comprehensive Documentation

- **[Client Setup Guide](docs/CLIENT_SETUP_GUIDE.md)** - 7-section comprehensive guide with architecture diagrams and troubleshooting
- **[Configuration Templates](configs/)** - OS-specific config files with detailed README
- **[Transport Types Audit](docs/MCP_TRANSPORT_TYPES.md)** - Complete 41-MCP transport analysis

### Client Connection Troubleshooting

**Issue: MCPs not appearing in client**

**Solution:**
1. Verify configuration file is in correct location
2. Check JSON syntax (use `jq` or online validator)
3. Ensure all paths are absolute (not relative)
4. Restart client completely

**Issue: "Command not found" errors**

**Solution:**
1. Verify `node` is in PATH: `node --version`
2. Verify `uv` is installed: `uv --version`
3. Windows: Use full path to uv.exe: `C:\\Users\\User\\.local\\bin\\uv.exe`

**Issue: Module not found errors**

**Solution:**
1. Node.js MCPs: Run `npm install` in MCP directory
2. Python MCPs: Run `uv sync` in MCP directory
3. TypeScript MCPs: Run `npm run build` and verify build output exists

For detailed troubleshooting, see **[Client Setup Guide](docs/CLIENT_SETUP_GUIDE.md)** Section 6.

---

## Post-Installation Tasks

### 1. Configure Client Connections

See **[Client Configuration](#client-configuration)** section above for complete instructions on setting up:
- Claude Desktop configuration (`claude_desktop_config.json`)
- Claude Code CLI configuration (`.mcp.json`)
- Client connectivity testing

### 2. Enable PM2 Monitoring

```bash
# Enable PM2 monitoring dashboard
pm2 monit

# Set up PM2 web dashboard (optional)
pm2 web
```

### 3. Backup Configuration

```bash
# Backup your API keys (encrypted storage recommended)
cp .env.local ~/.crypto-mcp-suite-backup.env

# Backup PM2 configuration
pm2 save
```

---

## Troubleshooting

### Common Issues

#### 1. Submodules Not Cloned

**Symptom:** `native/lib/` directory is empty or missing MCPs

**Solution:**
```bash
git submodule update --init --recursive
```

#### 2. Node.js Dependencies Failed

**Symptom:** `npm install` fails with permission errors

**Solution:**
```bash
# Use sudo (Linux/macOS)
sudo npm install -g pm2

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 3. Python uv Not Found

**Symptom:** `uv: command not found`

**Solution:**
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### 4. TypeScript Compilation Failed

**Symptom:** `npm run build` fails with TypeScript errors

**Solution:**
```bash
# Install dependencies first
npm install

# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 5. PM2 MCPs Keep Restarting

**Symptom:** PM2 shows MCPs in `restart` status

**Solution:**
```bash
# Check logs for error details
pm2 logs <mcp-name> --err

# Common causes:
# - Missing API keys: Check .env files
# - Missing dependencies: Re-run installation steps
# - Port conflicts: Check if port is already in use
```

#### 6. API Key Not Working

**Symptom:** MCP fails with "Invalid API key" error

**Solution:**
1. Verify API key is correct (check for typos)
2. Check API key has proper permissions
3. Verify API key is in correct .env file location
4. Restart PM2 process: `pm2 restart <mcp-name>`

---

## Advanced Configuration

### Port Allocation

**Current Port Mapping:**
- **tier1:** 3001-3010 (10 MCPs)
- **tier2:** 3011-3018 (8 MCPs)
- **tier3:** 3019-3023 (5 MCPs)
- **tier4:** 3024-3030 (7 MCPs)
- **tier5:** 3031-3036 (6 MCPs)
- **tier6:** 3078-3082 (5 MCPs - Premium AI)

**Infrastructure MCPs:** 3037-3060 (24 MCPs)

### Tier Customization

Edit `native/config/ecosystem.config.js` to customize tier mappings:

```javascript
const TIERS = {
  essential: ['tier1'],
  enhanced: ['tier1', 'tier2'],
  advanced: ['tier1', 'tier2', 'tier3'],
  premium: ['tier1', 'tier2', 'tier3', 'tier4'],
  full: ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'],
  'premium-plus': ['tier1', 'tier2', 'tier3', 'tier4', 'tier5', 'tier6'],
  'crypto-plus': ['tier1', 'tier5']
};
```

---

## Performance Optimization

### 1. Memory Limits

**Adjust PM2 memory limits per MCP:**

```bash
# Edit ecosystem.config.js
max_memory_restart: '200M',  // Restart if MCP exceeds 200MB
```

### 2. Log Rotation

**Configure PM2 log rotation:**

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 3. Startup Script

**Create startup script for all MCPs:**

```bash
#!/bin/bash
# start-crypto-mcp-suite.sh

# Load environment variables
export $(cat .env.local | xargs)

# Start PM2
pm2 start native/config/ecosystem.config.js --only premium-plus

# Save PM2 state
pm2 save

# Show status
pm2 status
```

---

## Next Steps

After successful installation:

1. ✅ **Configure API Keys** - See [API_KEY_SETUP_GUIDE.md](API_KEY_SETUP_GUIDE.md)
2. ✅ **Test MCPs** - Verify each MCP responds correctly
3. ✅ **Monitor Logs** - Use `pm2 logs` to check for errors
4. ✅ **Set Up Monitoring** - Configure PM2 monitoring dashboard
5. ✅ **Backup Configuration** - Save your .env.local and PM2 config
6. ✅ **Update Documentation** - Document any custom configurations

---

## Support

- **Documentation:** [README.md](README.md)
- **MCP Status:** [MCP_INSTALLATION_STATUS.md](MCP_INSTALLATION_STATUS.md)
- **Phase 8D Report:** [PHASE_8D_COMPLETION_REPORT.md](PHASE_8D_COMPLETION_REPORT.md)
- **Issues:** https://github.com/justmy2satoshis/crypto-mcp-suite/issues

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude <noreply@anthropic.com>
