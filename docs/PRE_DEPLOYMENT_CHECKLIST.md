# Pre-Deployment Checklist
## Crypto MCP Suite - 5-Phase Deployment Validation Framework

**Version:** Phase 8D Production-Ready
**Last Updated:** October 2, 2025
**Total Deployment Time:** 30-60 minutes (depending on tier)
**Success Rate Target:** 100% (0 failures)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Phase A: Pre-Deployment Local Validation](#phase-a-pre-deployment-local-validation)
3. [Phase B: Deployment Preparation](#phase-b-deployment-preparation)
4. [Phase C: Deployment Execution](#phase-c-deployment-execution)
5. [Phase D: Post-Deployment Validation](#phase-d-post-deployment-validation)
6. [Phase E: Rollback Procedures](#phase-e-rollback-procedures)
7. [Tier-Specific Checklists](#tier-specific-checklists)

---

## Quick Start

**Choose Your Deployment Tier:**

| Tier | MCPs | API Keys | Time | Cost | Use Case |
|------|------|----------|------|------|----------|
| **FREE** | 25 | 0 | 15-20 min | $0 | Proof of concept, testing |
| **FREEMIUM** | 35 | 10 (free tiers) | 30-45 min | $0 | Production (free limits acceptable) |
| **FULL** | 41 | 17+ | 45-60 min | $0-$150/mo | Production (premium features) |

**Pre-Deployment Quick Check:**
```bash
# 1. Verify prerequisites (5 minutes)
node --version    # Should be 18.0+
python3 --version # Should be 3.10+
uv --version      # Should show version
git --version     # Should be 2.30+
pm2 --version     # Should show version

# 2. Run automated validation (2 minutes)
./scripts/pre-deployment-check.sh

# 3. Check current status
pm2 status
git status
```

---

## Phase A: Pre-Deployment Local Validation
**Estimated Time:** 10-15 minutes
**Objective:** Verify all prerequisites and dependencies before deployment

### A1: System Requirements Validation

- [ ] **Node.js 18.0+ installed**
  ```bash
  node --version
  # Expected: v18.0.0 or higher
  ```

- [ ] **Python 3.10+ installed**
  ```bash
  python3 --version
  # Expected: Python 3.10.0 or higher
  ```

- [ ] **uv package manager installed**
  ```bash
  uv --version
  # Expected: uv X.X.X
  # If missing: curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

- [ ] **Git with submodule support**
  ```bash
  git --version
  # Expected: git version 2.30.0 or higher
  ```

- [ ] **PM2 process manager installed**
  ```bash
  pm2 --version
  # Expected: X.X.X
  # If missing: npm install -g pm2
  ```

- [ ] **Sufficient disk space (5 GB minimum)**
  ```bash
  df -h .
  # Expected: At least 5 GB free
  ```

- [ ] **Memory available (4 GB minimum, 8 GB recommended)**
  ```bash
  free -h  # Linux/macOS
  # Windows: systeminfo | findstr /C:"Available Physical Memory"
  ```

### A2: Repository & Submodule Validation

- [ ] **Repository cloned with submodules**
  ```bash
  git submodule status | wc -l
  # Expected: 41
  # If 0: git submodule update --init --recursive
  ```

- [ ] **All 41 submodules initialized**
  ```bash
  ls native/lib/ | wc -l
  # Expected: 41 directories
  ```

- [ ] **No uncommitted changes (clean working tree)**
  ```bash
  git status
  # Expected: "nothing to commit, working tree clean"
  ```

### A3: Dependency Validation (Node.js)

- [ ] **bridge-rates-mcp dependencies installed**
  ```bash
  ls -la native/lib/bridge-rates-mcp/node_modules | head -5
  # Expected: Directory exists with 167 packages
  # If missing: cd native/lib/bridge-rates-mcp && npm install
  ```

- [ ] **ccxt-mcp dependencies installed**
  ```bash
  ls -la native/lib/ccxt-mcp/node_modules | head -5
  # Expected: Directory exists with 103 packages
  # If missing: cd native/lib/ccxt-mcp && npm install
  ```

- [ ] **crypto-indicators-mcp dependencies installed**
  ```bash
  ls -la native/lib/crypto-indicators-mcp/node_modules | head -5
  # Expected: Directory exists with 123 packages
  # If missing: cd native/lib/crypto-indicators-mcp && npm install
  ```

- [ ] **All 11 Node.js MCPs have node_modules/**
  ```bash
  find native/lib -name "package.json" -not -path "*/node_modules/*" -exec dirname {} \; | while read dir; do
    if [ ! -d "$dir/node_modules" ]; then
      echo "❌ MISSING: $dir/node_modules"
    else
      echo "✅ OK: $dir"
    fi
  done
  # Expected: All ✅ OK
  ```

### A4: Dependency Validation (Python)

- [ ] **All 30 Python MCPs have .venv/**
  ```bash
  find native/lib -name "pyproject.toml" -exec dirname {} \; | while read dir; do
    if [ ! -d "$dir/.venv" ]; then
      echo "❌ MISSING: $dir/.venv"
    else
      echo "✅ OK: $dir"
    fi
  done
  # Expected: All ✅ OK
  ```

- [ ] **Python MCPs missing .venv (from Phase 8D)**
  ```bash
  # If any Python MCPs missing .venv, run:
  for dir in native/lib/*/; do
    if [ -f "$dir/pyproject.toml" ] && [ ! -d "$dir/.venv" ]; then
      echo "Installing $dir..."
      cd "$dir" && uv sync && cd - > /dev/null
    fi
  done
  ```

### A5: TypeScript Compilation Validation

- [ ] **ccxt-mcp compiled (build/ directory exists)**
  ```bash
  ls -la native/lib/ccxt-mcp/build/index.js
  # Expected: File exists
  # If missing: cd native/lib/ccxt-mcp && npm run build
  ```

- [ ] **tokenmetrics-mcp compiled (build/src/cli.js exists)**
  ```bash
  ls -la native/lib/tokenmetrics-mcp/build/src/cli.js
  # Expected: File exists
  # If missing: cd native/lib/tokenmetrics-mcp && npm run build
  ```

- [ ] **TypeScript compilation complete (2/2 MCPs)**
  ```bash
  # Verify both TypeScript MCPs are compiled
  [ -f "native/lib/ccxt-mcp/build/index.js" ] && echo "✅ ccxt-mcp compiled" || echo "❌ ccxt-mcp NOT compiled"
  [ -f "native/lib/tokenmetrics-mcp/build/src/cli.js" ] && echo "✅ tokenmetrics-mcp compiled" || echo "❌ tokenmetrics-mcp NOT compiled"
  ```

### A6: Configuration File Validation

- [ ] **ecosystem.config.js exists and is valid**
  ```bash
  node -c native/config/ecosystem.config.js
  # Expected: No syntax errors
  ```

- [ ] **.env.example exists as template**
  ```bash
  ls -la .env.example
  # Expected: File exists
  ```

- [ ] **.env.local created (or will be created in Phase B)**
  ```bash
  ls -la .env.local
  # Expected: File exists (or create in Phase B)
  ```

- [ ] **All critical MCP paths in ecosystem.config.js are correct**
  ```bash
  # Verify tokenmetrics-mcp path fix (Phase 8D P0-4)
  grep -A2 "tokenmetrics-mcp" native/config/ecosystem.config.js | grep "build/src/cli.js"
  # Expected: Path should be build/src/cli.js (NOT dist/index.js)
  ```

---

## Phase B: Deployment Preparation
**Estimated Time:** 10-20 minutes (depending on tier)
**Objective:** Configure API keys and prepare environment for deployment

### B1: API Key Configuration (Choose Your Tier)

#### B1a: FREE Tier (0 API Keys Required)

- [ ] **Skip API key configuration entirely**
  ```bash
  # No API keys needed for FREE tier (25 MCPs)
  echo "FREE tier selected - no API keys required"
  ```

#### B1b: FREEMIUM Tier (10 API Keys - All FREE Tiers)

- [ ] **Create .env.local from template**
  ```bash
  cp .env.example .env.local
  ```

- [ ] **Configure TOKENMETRICS_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://tokenmetrics.com/api
  echo "TOKENMETRICS_API_KEY=your_key_here" >> .env.local
  echo "TOKENMETRICS_API_KEY=your_key_here" > native/lib/tokenmetrics-mcp/.env
  ```

- [ ] **Configure LUNARCRUSH_API_KEY (FREE 50 req/day)**
  ```bash
  # Get FREE tier key: https://lunarcrush.com/developers
  echo "LUNARCRUSH_API_KEY=your_key_here" >> .env.local
  echo "LUNARCRUSH_API_KEY=your_key_here" > native/lib/lunarcrush-mcp/.env
  ```

- [ ] **Configure INFURA_API_KEY (FREE 100k req/day)**
  ```bash
  # Get FREE tier key: https://infura.io/register
  echo "INFURA_API_KEY=your_key_here" >> .env.local
  echo "INFURA_API_KEY=your_key_here" > native/lib/uniswap-price-mcp/.env
  echo "INFURA_API_KEY=your_key_here" > native/lib/ens-mcp/.env
  ```

- [ ] **Configure THEGRAPH_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://thegraph.com/studio/
  echo "THEGRAPH_API_KEY=your_key_here" >> .env.local
  echo "THEGRAPH_API_KEY=your_key_here" > native/lib/aave-mcp/.env
  echo "THEGRAPH_API_KEY=your_key_here" > native/lib/uniswap-pools-mcp/.env
  ```

- [ ] **Configure DUNE_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://dune.com/settings/api
  echo "DUNE_API_KEY=your_key_here" >> .env.local
  echo "DUNE_API_KEY=your_key_here" > native/lib/wallet-inspector-mcp/.env
  ```

- [ ] **Configure SANTIMENT_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://app.santiment.net/account
  echo "SANTIMENT_API_KEY=your_key_here" >> .env.local
  echo "SANTIMENT_API_KEY=your_key_here" > native/lib/crypto-sentiment-mcp/.env
  ```

- [ ] **Configure CRYPTOPANIC_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://cryptopanic.com/developers/api/
  echo "CRYPTOPANIC_API_KEY=your_key_here" >> .env.local
  echo "CRYPTOPANIC_API_KEY=your_key_here" > native/lib/cryptopanic-mcp-server/.env
  ```

- [ ] **Configure SOLSNIFFER_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://solsniffer.com/
  echo "SOLSNIFFER_API_KEY=your_key_here" >> .env.local
  echo "SOLSNIFFER_API_KEY=your_key_here" > native/lib/rug-check-mcp/.env
  ```

- [ ] **Configure WHALE_ALERT_API_KEY (FREE tier)**
  ```bash
  # Get FREE tier key: https://whale-alert.io/
  echo "WHALE_ALERT_API_KEY=your_key_here" >> .env.local
  echo "WHALE_ALERT_API_KEY=your_key_here" > native/lib/whale-tracker-mcp/.env
  ```

- [ ] **Configure optional BEACONCHAIN_API_KEY (100 req/day free)**
  ```bash
  # Optional: https://beaconcha.in/api/v1/docs
  echo "BEACONCHAIN_API_KEY=your_key_here" >> .env.local
  echo "BEACONCHAIN_API_KEY=your_key_here" > native/lib/ethereum-validator-queue-mcp/.env
  ```

#### B1c: FULL Tier (17+ API Keys - Includes Test Wallets)

- [ ] **Complete all FREEMIUM tier API keys above**

- [ ] **⚠️ CRITICAL: Configure test wallets only (< $10 balance)**
  ```bash
  # Ethereum test wallet (uniswap-trader-mcp)
  # WARNING: Test wallets ONLY - never production wallets!
  echo "WALLET_PRIVATE_KEY=your_test_eth_key_here" >> .env.local
  echo "WALLET_PRIVATE_KEY=your_test_eth_key_here" > native/lib/uniswap-trader-mcp/.env
  echo "INFURA_API_KEY=your_key_here" >> native/lib/uniswap-trader-mcp/.env

  # Solana test wallet (jupiter-mcp)
  echo "PRIVATE_KEY=your_test_sol_key_here" >> .env.local
  echo "PRIVATE_KEY=your_test_sol_key_here" > native/lib/jupiter-mcp/.env
  ```

- [ ] **Configure optional RESERVOIR_API_KEY (20k req/month free)**
  ```bash
  # Optional: https://reservoir.tools/
  echo "RESERVOIR_API_KEY=your_key_here" >> .env.local
  echo "RESERVOIR_API_KEY=your_key_here" > native/lib/nft-analytics-mcp/.env
  ```

- [ ] **Configure optional BINANCE_API_KEY (free tier)**
  ```bash
  # Optional: https://www.binance.com/en/my/settings/api-management
  echo "BINANCE_API_KEY=your_key_here" >> .env.local
  echo "BINANCE_API_SECRET=your_secret_here" >> .env.local
  echo "BINANCE_API_KEY=your_key_here" > native/lib/binance-alpha-mcp/.env
  echo "BINANCE_API_SECRET=your_secret_here" >> native/lib/binance-alpha-mcp/.env
  ```

### B2: API Key Validation

- [ ] **Run API key validation script**
  ```bash
  ./scripts/test-api-keys.sh
  # Expected: All configured API keys return 200 OK (or valid response)
  ```

- [ ] **Verify .env files exist for all API-dependent MCPs**
  ```bash
  # Check critical MCPs (tier-specific)
  [ -f "native/lib/tokenmetrics-mcp/.env" ] && echo "✅ tokenmetrics" || echo "❌ tokenmetrics"
  [ -f "native/lib/lunarcrush-mcp/.env" ] && echo "✅ lunarcrush" || echo "❌ lunarcrush"
  [ -f "native/lib/uniswap-price-mcp/.env" ] && echo "✅ uniswap-price" || echo "❌ uniswap-price"
  ```

### B3: Backup Current State

- [ ] **Backup existing PM2 processes (if any)**
  ```bash
  pm2 save
  pm2 list > pm2-backup-$(date +%Y%m%d-%H%M%S).txt
  ```

- [ ] **Backup .env.local (encrypted storage recommended)**
  ```bash
  cp .env.local .env.local.backup-$(date +%Y%m%d-%H%M%S)
  # CRITICAL: Store backup in secure location (not in git)
  ```

- [ ] **Create deployment log file**
  ```bash
  echo "Deployment started: $(date)" > deployment-$(date +%Y%m%d-%H%M%S).log
  ```

### B4: Client Configuration (Optional - For Claude Desktop/Code CLI)

**Note:** Client configuration is optional during server deployment. Clients can be configured later for testing.

- [ ] **Choose client type**
  ```bash
  # Claude Desktop: Uses claude_desktop_config.json
  # Claude Code CLI: Uses .mcp.json
  # Both: Use stdio transport (100% compatible with all 41 MCPs)
  ```

- [ ] **Install client configuration (Windows - Claude Desktop)**
  ```bash
  Copy-Item "configs\claude_desktop_config_windows.json" "$env:APPDATA\Claude\claude_desktop_config.json"
  ```

- [ ] **Install client configuration (Linux - Claude Desktop)**
  ```bash
  cp configs/claude_desktop_config_linux.json ~/.config/Claude/claude_desktop_config.json
  ```

- [ ] **Install client configuration (macOS - Claude Desktop)**
  ```bash
  cp configs/claude_desktop_config_macos.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
  ```

- [ ] **Install client configuration (Claude Code CLI - any platform)**
  ```bash
  cp configs/.mcp.json .mcp.json
  # Or copy to user scope: ~/.mcp.json
  ```

- [ ] **Customize client configuration paths**
  ```bash
  # Edit config file and replace placeholder paths with actual installation directory
  # Windows: C:\\Users\\User\\mcp-servers\\...
  # Linux: /home/deploy/workcraft-mcp/...
  # macOS: /Users/username/crypto-mcp-suite/...
  ```

- [ ] **Test client connectivity (optional - can be done in Phase D)**
  ```bash
  # Test configuration before deployment
  node scripts/test-client-connections.js --config "$env:APPDATA\Claude\claude_desktop_config.json"  # Windows
  node scripts/test-client-connections.js --config ~/.config/Claude/claude_desktop_config.json      # Linux/macOS
  node scripts/test-client-connections.js --config .mcp.json                                         # Claude Code

  # Expected: 100% connectivity (all MCPs reachable via stdio)
  ```

**See:** [Client Setup Guide](CLIENT_SETUP_GUIDE.md) for detailed client configuration instructions.

---

## Phase C: Deployment Execution
**Estimated Time:** 5-10 minutes
**Objective:** Deploy MCPs using PM2 with appropriate tier preset

### C1: Choose Deployment Strategy

#### C1a: FREE Tier Deployment (25 MCPs)

- [ ] **Deploy crypto-plus preset (tier1 + tier5 FREE MCPs only)**
  ```bash
  pm2 start native/config/ecosystem.config.js --only crypto-plus
  # Expected: 25 MCPs started
  ```

#### C1b: FREEMIUM Tier Deployment (35 MCPs)

- [ ] **Deploy enhanced preset (tier1 + tier2)**
  ```bash
  pm2 start native/config/ecosystem.config.js --only enhanced
  # Expected: 35 MCPs started (includes FREEMIUM API MCPs)
  ```

#### C1c: FULL Tier Deployment (41 MCPs)

- [ ] **Deploy premium-plus preset (all tiers including tier6)**
  ```bash
  pm2 start native/config/ecosystem.config.js --only premium-plus
  # Expected: 41 MCPs started
  ```

### C2: Monitor Initial Startup

- [ ] **Check PM2 status immediately after deployment**
  ```bash
  pm2 status
  # Expected: All MCPs show status "online"
  # If any show "errored" or "stopped", check logs
  ```

- [ ] **Monitor startup logs for first 30 seconds**
  ```bash
  pm2 logs --lines 50
  # Expected: No ERROR messages, all MCPs initializing
  # Watch for: "MCP server running", "Server started", etc.
  ```

- [ ] **Identify any restart loops (MCPs restarting repeatedly)**
  ```bash
  pm2 status
  # Check "restart" column - should be 0 or very low (< 3)
  # If restart count > 10: Critical error, check logs
  ```

### C3: Save PM2 Configuration

- [ ] **Save PM2 process list for persistence**
  ```bash
  pm2 save
  # Expected: Process list dumped
  ```

- [ ] **Configure PM2 startup script (optional - for production)**
  ```bash
  pm2 startup
  # Follow instructions to set PM2 to start on system boot
  # Then run: pm2 save
  ```

---

## Phase D: Post-Deployment Validation
**Estimated Time:** 10-15 minutes
**Objective:** Verify all MCPs are running correctly with full functionality

### D1: Process Health Check

- [ ] **Run automated health check script**
  ```bash
  node scripts/health-check.js
  # Expected: All MCPs respond with healthy status
  ```

- [ ] **Verify all MCPs are online (PM2 status)**
  ```bash
  pm2 status | grep -c "online"
  # Expected: Count matches number of deployed MCPs
  # FREE: 25 | FREEMIUM: 35 | FULL: 41
  ```

- [ ] **Check for any MCPs in error state**
  ```bash
  pm2 status | grep -i "error\|stopped\|errored"
  # Expected: No results (empty output)
  ```

- [ ] **Verify restart counts are low (< 3 per MCP)**
  ```bash
  pm2 status
  # Check "restart" column for all MCPs
  # If any MCP has restart > 10: Investigate immediately
  ```

### D2: Functionality Validation (Tier-Specific)

#### D2a: FREE Tier Validation

- [ ] **Test ccxt-mcp (exchange data)**
  ```bash
  pm2 logs ccxt-mcp --lines 20 --nostream
  # Expected: No errors, may see initialization messages
  ```

- [ ] **Test crypto-feargreed-mcp (public API)**
  ```bash
  pm2 logs crypto-feargreed-mcp --lines 20 --nostream
  # Expected: Fear & Greed Index data retrieved
  ```

- [ ] **Test bridge-rates-mcp (cross-chain)**
  ```bash
  pm2 logs bridge-rates-mcp --lines 20 --nostream
  # Expected: Bridge rates initialized
  ```

#### D2b: FREEMIUM Tier Validation (Additional)

- [ ] **Test tokenmetrics-mcp (API key required)**
  ```bash
  pm2 logs tokenmetrics-mcp --lines 20 --nostream
  # Expected: API connection successful, no 401/403 errors
  # If 401: API key invalid
  ```

- [ ] **Test lunarcrush-mcp (API key required)**
  ```bash
  pm2 logs lunarcrush-mcp --lines 20 --nostream
  # Expected: Social data retrieved, no authentication errors
  ```

- [ ] **Test uniswap-price-mcp (Infura API)**
  ```bash
  pm2 logs uniswap-price-mcp --lines 20 --nostream
  # Expected: Price data available, Infura connection OK
  ```

#### D2c: FULL Tier Validation (Additional)

- [ ] **Test uniswap-trader-mcp (wallet + Infura)**
  ```bash
  pm2 logs uniswap-trader-mcp --lines 20 --nostream
  # Expected: Wallet connected, no transaction errors
  # Should NOT attempt trades unless explicitly triggered
  ```

- [ ] **Test jupiter-mcp (Solana wallet)**
  ```bash
  pm2 logs jupiter-mcp --lines 20 --nostream
  # Expected: Solana RPC connected, wallet loaded
  ```

### D3: Error Log Analysis

- [ ] **Check for critical errors across all MCPs**
  ```bash
  pm2 logs --err --lines 100 --nostream | grep -i "error\|failed\|exception"
  # Expected: No critical errors (initialization warnings OK)
  ```

- [ ] **Identify top 3 MCPs with most errors (if any)**
  ```bash
  pm2 logs --err --lines 1000 --nostream | awk '{print $2}' | sort | uniq -c | sort -rn | head -3
  # Investigate MCPs with high error counts
  ```

- [ ] **Check for API key errors (401, 403, invalid key)**
  ```bash
  pm2 logs --err --lines 100 --nostream | grep -i "401\|403\|unauthorized\|forbidden\|invalid.*key"
  # Expected: No results
  # If found: Reconfigure API keys in Phase E rollback
  ```

### D4: Dependency Verification (Post-Deployment)

- [ ] **Verify no missing dependencies reported**
  ```bash
  pm2 logs --err --lines 200 --nostream | grep -i "cannot find module\|module not found"
  # Expected: No results
  # If found: Re-run Phase A4 dependency installation
  ```

- [ ] **Check for TypeScript compilation errors**
  ```bash
  pm2 logs --err --lines 100 --nostream | grep -i "typescript\|tsc\|build.*failed"
  # Expected: No results
  # If found: Re-run Phase A5 TypeScript compilation
  ```

### D5: Resource Monitoring

- [ ] **Check CPU usage (all MCPs combined < 50%)**
  ```bash
  pm2 monit
  # Or: pm2 status (check CPU% column)
  # Expected: Individual MCPs < 10% CPU each
  ```

- [ ] **Check memory usage (all MCPs combined < 4 GB)**
  ```bash
  pm2 status
  # Check memory column
  # Expected: Individual MCPs < 200 MB each
  # High memory (> 500 MB): May indicate memory leak
  ```

- [ ] **Set up PM2 log rotation (prevent disk space issues)**
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 30
  pm2 set pm2-logrotate:compress true
  ```

### D6: Client Connection Testing (Optional)

**Note:** Test client connectivity if you configured clients in Phase B4.

- [ ] **Test Claude Desktop configuration connectivity**
  ```bash
  # Windows
  node scripts/test-client-connections.js --config "$env:APPDATA\Claude\claude_desktop_config.json"

  # Linux
  node scripts/test-client-connections.js --config ~/.config/Claude/claude_desktop_config.json

  # macOS
  node scripts/test-client-connections.js --config ~/Library/Application\ Support/Claude/claude_desktop_config.json
  ```

- [ ] **Test Claude Code CLI configuration connectivity**
  ```bash
  node scripts/test-client-connections.js --config .mcp.json
  # Or if using user scope: node scripts/test-client-connections.js --config ~/.mcp.json
  ```

- [ ] **Verify 100% client connectivity**
  ```
  Expected Output:
  ==========================================
  Crypto MCP Suite - Client Connection Test
  ==========================================

  Testing MCP connections...

  ✅ PASS: ccxt-mcp - Reachable (stdio transport)
  ✅ PASS: chainlist-mcp - Reachable (stdio transport)
  ✅ PASS: tokenmetrics-mcp - Reachable (stdio transport)
  ... (all 41 MCPs)

  Connection Health Score: 100%

  ✅ PERFECT CONNECTIVITY - All MCPs are reachable!
  ```

- [ ] **If connectivity fails, check common issues:**
  ```bash
  # Issue: "Command not found" errors
  # Solution: Verify node, uv are in PATH

  # Issue: "Module not found" errors
  # Solution: Re-run dependency installation (Phase A3, A4)

  # Issue: "Path not found" errors
  # Solution: Update config paths to absolute paths

  # Issue: "Timeout" errors
  # Solution: Verify MCPs can start manually, check for port conflicts
  ```

- [ ] **Restart clients after configuration**
  ```bash
  # Claude Desktop: Quit and restart application
  # Claude Code CLI: No restart needed (auto-detected)
  ```

**See:** [Client Setup Guide](CLIENT_SETUP_GUIDE.md) for comprehensive client troubleshooting.

---

## Phase E: Rollback Procedures
**Estimated Time:** 5-10 minutes (if needed)
**Objective:** Safely rollback deployment if critical issues detected

### E1: Identify Rollback Trigger

**Rollback if ANY of the following occur:**

- [ ] More than 10% of MCPs (4+ MCPs) fail to start
- [ ] Critical API key errors (401/403) on essential MCPs (tokenmetrics, lunarcrush, infura)
- [ ] Restart loops (restart count > 20) on any MCP
- [ ] System resource exhaustion (CPU > 90%, Memory > 90%)
- [ ] Data integrity issues (corrupted database, malformed responses)

### E2: Emergency Rollback Steps

- [ ] **Stop all deployed MCPs immediately**
  ```bash
  pm2 stop all
  # Or stop specific tier:
  pm2 stop crypto-plus  # FREE tier
  pm2 stop enhanced     # FREEMIUM tier
  pm2 stop premium-plus # FULL tier
  ```

- [ ] **Delete PM2 processes from list**
  ```bash
  pm2 delete all
  # Or delete specific tier:
  pm2 delete crypto-plus
  ```

- [ ] **Restore previous PM2 state (if backup exists)**
  ```bash
  # Find backup file
  ls -lt pm2-backup-*.txt | head -1
  # Manually restore processes from backup file
  ```

- [ ] **Check system resources are released**
  ```bash
  pm2 status
  # Expected: "No processes running" or previous safe state

  # Verify no orphaned processes
  ps aux | grep -i "node\|python" | grep -v grep
  ```

### E3: Diagnose Root Cause

- [ ] **Review error logs from failed deployment**
  ```bash
  pm2 logs --err --lines 500 --nostream > rollback-errors-$(date +%Y%m%d-%H%M%S).log
  ```

- [ ] **Identify specific failed MCPs**
  ```bash
  # Check which MCPs had restart loops or errors
  pm2 status | awk '$6 > 10 {print $2}' # MCPs with restart > 10
  ```

- [ ] **Cross-reference with ERROR_PATTERN_LIBRARY.md**
  ```bash
  # Match error patterns to known issues
  # Categories: Dependency, TypeScript, Configuration, Python, API Key
  ```

### E4: Fix and Retry

- [ ] **Fix identified issues based on error category**

  **Dependency Errors:**
  ```bash
  # Re-run Phase A3 (Node.js) or A4 (Python)
  cd native/lib/<failed-mcp> && npm install  # Node.js
  cd native/lib/<failed-mcp> && uv sync      # Python
  ```

  **TypeScript Errors:**
  ```bash
  # Re-run Phase A5
  cd native/lib/<failed-mcp> && npm run build
  ```

  **API Key Errors:**
  ```bash
  # Reconfigure API keys in Phase B1
  # Verify API key validity: ./scripts/test-api-keys.sh
  ```

  **Configuration Errors:**
  ```bash
  # Check ecosystem.config.js paths
  # Verify tokenmetrics-mcp uses build/src/cli.js (NOT dist/index.js)
  ```

- [ ] **Retry deployment with fixes applied**
  ```bash
  # Start from Phase C (Deployment Execution) after fixes
  pm2 start native/config/ecosystem.config.js --only <tier-preset>
  ```

### E5: Escalation Path

**If rollback fails or issues persist:**

- [ ] **Contact support with diagnostic bundle**
  ```bash
  # Create diagnostic bundle
  tar -czf diagnostic-$(date +%Y%m%d-%H%M%S).tar.gz \
    deployment-*.log \
    rollback-errors-*.log \
    pm2-backup-*.txt \
    .env.local.backup-*

  # Report to: https://github.com/justmy2satoshis/crypto-mcp-suite/issues
  ```

- [ ] **Review documentation for manual fixes**
  - [ERROR_PATTERN_LIBRARY.md](ERROR_PATTERN_LIBRARY.md)
  - [MCP_CAPABILITY_MATRIX.md](MCP_CAPABILITY_MATRIX.md)
  - [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)

- [ ] **Consider tier downgrade (FULL → FREEMIUM → FREE)**
  ```bash
  # If FULL tier fails, try FREEMIUM:
  pm2 delete all
  pm2 start native/config/ecosystem.config.js --only enhanced

  # If FREEMIUM fails, try FREE:
  pm2 delete all
  pm2 start native/config/ecosystem.config.js --only crypto-plus
  ```

---

## Tier-Specific Checklists

### FREE Tier Checklist (15-20 minutes)

**Phase A: Validation (10 min)**
- [x] System requirements (A1)
- [x] Repository & submodules (A2)
- [x] Node.js dependencies (A3)
- [x] Python dependencies (A4)
- [x] TypeScript compilation (A5)

**Phase B: Preparation (0 min)**
- [x] Skip API key configuration (B1a)

**Phase C: Deployment (2 min)**
- [x] Deploy crypto-plus preset (C1a)
- [x] Monitor startup (C2)
- [x] Save PM2 config (C3)

**Phase D: Validation (5 min)**
- [x] Process health check (D1)
- [x] FREE tier functionality (D2a)
- [x] Error log analysis (D3)

**Phase E: Rollback (if needed)**
- [x] Follow E1-E5 procedures

### FREEMIUM Tier Checklist (30-45 minutes)

**Phase A: Validation (10 min)** - Same as FREE

**Phase B: Preparation (15 min)**
- [x] Create .env.local (B1)
- [x] Configure 10 API keys (B1b)
- [x] Validate API keys (B2)
- [x] Backup state (B3)

**Phase C: Deployment (2 min)**
- [x] Deploy enhanced preset (C1b)
- [x] Monitor startup (C2)
- [x] Save PM2 config (C3)

**Phase D: Validation (10 min)**
- [x] Process health check (D1)
- [x] FREEMIUM tier functionality (D2b)
- [x] Error log analysis (D3)
- [x] Resource monitoring (D5)

**Phase E: Rollback (if needed)**
- [x] Follow E1-E5 procedures

### FULL Tier Checklist (45-60 minutes)

**Phase A: Validation (10 min)** - Same as FREE

**Phase B: Preparation (25 min)**
- [x] Create .env.local (B1)
- [x] Configure 10 FREEMIUM API keys (B1b)
- [x] Configure test wallets (B1c) ⚠️ CRITICAL
- [x] Configure optional API keys (B1c)
- [x] Validate all API keys (B2)
- [x] Backup state (B3)

**Phase C: Deployment (5 min)**
- [x] Deploy premium-plus preset (C1c)
- [x] Monitor startup closely (C2)
- [x] Save PM2 config (C3)

**Phase D: Validation (15 min)**
- [x] Process health check (D1)
- [x] FULL tier functionality (D2c)
- [x] Error log analysis (D3)
- [x] Dependency verification (D4)
- [x] Resource monitoring (D5)

**Phase E: Rollback (if needed)**
- [x] Follow E1-E5 procedures
- [x] Consider tier downgrade (E5)

---

## Automated Validation Scripts

### Quick Validation (2 minutes)

```bash
# Run all automated checks
./scripts/pre-deployment-check.sh          # System requirements
./scripts/validate-mcp-dependencies.js     # Dependencies
./scripts/test-api-keys.sh                 # API keys
node scripts/health-check.js               # Post-deployment health
```

### Manual Validation Commands

```bash
# Check all critical paths
find native/lib -name "package.json" -not -path "*/node_modules/*" -exec dirname {} \; | wc -l  # Should be 11
find native/lib -name "pyproject.toml" -exec dirname {} \; | wc -l  # Should be 30

# Verify TypeScript compilation
ls -la native/lib/ccxt-mcp/build/index.js
ls -la native/lib/tokenmetrics-mcp/build/src/cli.js

# Check PM2 process count by tier
pm2 status | grep -c "online"  # FREE: 25 | FREEMIUM: 35 | FULL: 41
```

---

## Success Criteria

**Deployment is considered SUCCESSFUL when:**

✅ **All deployed MCPs show "online" status in PM2**
✅ **Restart count < 3 for all MCPs (no restart loops)**
✅ **No critical errors in PM2 logs (--err flag)**
✅ **API-dependent MCPs show successful API connections**
✅ **System resources within acceptable limits (CPU < 50%, Memory < 4 GB)**
✅ **Health check script returns 100% healthy**
✅ **No missing dependencies or compilation errors**

**Deployment is considered FAILED when:**

❌ **More than 10% of MCPs (4+ MCPs) fail to start**
❌ **Critical API key errors (401/403) on essential MCPs**
❌ **Restart loops (restart > 20) on any MCP**
❌ **System resource exhaustion (CPU > 90%, Memory > 90%)**
❌ **Missing dependencies or TypeScript compilation failures**
❌ **Data integrity issues or corrupted responses**

---

## Next Steps After Successful Deployment

1. ✅ **Configure Monitoring** - Set up PM2 monitoring dashboard (`pm2 web`)
2. ✅ **Enable Log Rotation** - Prevent disk space issues (`pm2 install pm2-logrotate`)
3. ✅ **Set Up Startup Script** - Ensure MCPs restart on system reboot (`pm2 startup`)
4. ✅ **Document Custom Configurations** - Record any deviations from standard setup
5. ✅ **Schedule Regular Health Checks** - Run `health-check.js` daily/weekly
6. ✅ **Monitor API Usage** - Track API key usage to avoid rate limits
7. ✅ **Backup Configuration** - Regularly backup .env.local and PM2 config

---

## References

- **Installation Guide:** [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)
- **Error Patterns:** [ERROR_PATTERN_LIBRARY.md](ERROR_PATTERN_LIBRARY.md)
- **MCP Capabilities:** [MCP_CAPABILITY_MATRIX.md](MCP_CAPABILITY_MATRIX.md)
- **API Key Setup:** [API_KEY_SETUP_GUIDE.md](../API_KEY_SETUP_GUIDE.md)
- **Validation Scripts:** [scripts/](../scripts/) (Phase 5)

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude <noreply@anthropic.com>
