# Non-Containerized Installer Design
**Crypto MCP Suite Infrastructure Design - Phase 3**

**Date**: October 1, 2025
**Project**: Crypto MCP Suite Infrastructure Design
**Phase**: 3 of 7 - Non-Containerized Installer Design
**Status**: ✅ COMPLETE

---

## Executive Summary

This document designs a **production-grade, non-containerized installer** for the Crypto MCP Suite, enabling one-command installation across Windows, macOS, and Linux without Docker dependencies. The installer supports three deployment modes tailored to different use cases:

| Mode | MCPs | Databases | Use Case | Setup Time |
|------|------|-----------|----------|------------|
| **MINIMAL** | 2 | SQLite | Development, testing | 2 minutes |
| **STANDARD** | 5 | Redis + SQLite | Personal use, MVP | 5 minutes |
| **PREMIUM** | 7 | Redis + PostgreSQL | Production, enterprise | 10 minutes |

### Key Design Principles

1. **Zero-Docker Architecture**: Native installation without containerization
2. **Cross-Platform**: Single codebase for Windows, macOS, Linux
3. **One-Command Setup**: `crypto-mcp install` does everything
4. **Graceful Degradation**: Works without databases, adds features when available
5. **Dependency Isolation**: Each MCP in separate virtual environment
6. **Atomic Operations**: Rollback on failure, no partial installations

### Technology Stack

```
Installer Core:
├── Language: Node.js (cross-platform, npm ecosystem)
├── CLI Framework: Commander.js (argument parsing)
├── Package Manager: npm/npx (bundled distribution)
├── Process Manager: PM2 (MCP lifecycle management)
└── Config Management: dotenv + JSON schema validation

Dependency Management:
├── JavaScript MCPs: npm install (isolated node_modules)
├── Python MCPs: venv + pip (isolated virtual environments)
├── Redis: Platform-specific package managers (apt/brew/choco)
└── PostgreSQL: Platform-specific installers (optional)
```

### Installation Flow (STANDARD Mode Example)

```
$ npx crypto-mcp-suite install --mode=standard

Step 1/8: ✓ Checking prerequisites (Node.js 18+, Python 3.10+)
Step 2/8: ✓ Creating installation directory (~/.crypto-mcp-suite)
Step 3/8: ✓ Installing Redis via brew (macOS detected)
Step 4/8: ✓ Installing 5 MCPs (jupiter, uniswap-trader, crypto-sentiment, whale-tracker, bridge-rates)
Step 5/8: ✓ Configuring environment variables (.env created)
Step 6/8: ✓ Starting Redis service
Step 7/8: ✓ Starting MCPs via PM2
Step 8/8: ✓ Running health checks (5/5 MCPs healthy)

✅ Installation complete! (4m 32s)

🚀 Next steps:
  1. Test MCPs: crypto-mcp test
  2. View status: crypto-mcp status
  3. View logs: crypto-mcp logs

📋 Installed MCPs:
  • jupiter-mcp (http://localhost:3001)
  • uniswap-trader-mcp (http://localhost:3002)
  • crypto-sentiment-mcp (http://localhost:3003)
  • whale-tracker-mcp (http://localhost:3004)
  • bridge-rates-mcp (http://localhost:3005)

💾 Databases:
  • Redis: redis://localhost:6379 (running)
  • SQLite: ~/.crypto-mcp-suite/data/cache.db (fallback)
```

---

## Table of Contents

1. [Installation Modes](#installation-modes)
2. [CLI Tool Design](#cli-tool-design)
3. [Dependency Isolation Strategy](#dependency-isolation-strategy)
4. [Platform Support](#platform-support)
5. [Installation UX Flow](#installation-ux-flow)
6. [Configuration Management](#configuration-management)
7. [Error Handling & Recovery](#error-handling--recovery)
8. [Uninstall Procedures](#uninstall-procedures)
9. [Health Checks & Monitoring](#health-checks--monitoring)
10. [Update & Upgrade Strategy](#update--upgrade-strategy)
11. [Security Considerations](#security-considerations)
12. [Performance Optimization](#performance-optimization)

---

## Installation Modes

### 1. MINIMAL Mode

**Purpose**: Development, testing, CI/CD pipelines
**Target Audience**: Developers, automated testing
**Installation Time**: 2 minutes

#### Features

```yaml
MCPs Installed: 2
  - crypto-indicators-mcp (stateless, no API keys)
  - bridge-rates-mcp (no auth required)

Databases:
  - SQLite: ✅ (built-in, no external dependencies)
  - Redis: ❌ (not installed)
  - PostgreSQL: ❌ (not installed)

API Requirements:
  - API keys: 0
  - External services: 0
  - Network: Optional (bridge-rates can work offline with cached routes)

Resource Usage:
  - Disk: 50 MB
  - RAM: 100 MB (2 MCPs × 50 MB)
  - CPU: Negligible

Use Cases:
  - Local development
  - Unit testing
  - CI/CD integration tests
  - Learning the MCP protocol
  - Offline technical analysis
```

#### Installation Command

```bash
npx crypto-mcp-suite install --mode=minimal

# Or with alias
crypto-mcp install --mode=minimal
```

#### File Structure (MINIMAL)

```
~/.crypto-mcp-suite/
├── mcps/
│   ├── crypto-indicators-mcp/
│   │   ├── node_modules/
│   │   ├── index.js
│   │   └── package.json
│   └── bridge-rates-mcp/
│       ├── node_modules/
│       ├── index.js
│       └── package.json
├── data/
│   └── cache.db (SQLite)
├── logs/
│   ├── crypto-indicators.log
│   └── bridge-rates.log
├── config/
│   ├── .env
│   └── mcps.json
└── bin/
    └── crypto-mcp (CLI executable)
```

---

### 2. STANDARD Mode

**Purpose**: Personal use, MVP deployments, small teams
**Target Audience**: Individual traders, hobbyists, startups
**Installation Time**: 5 minutes

#### Features

```yaml
MCPs Installed: 5
  - crypto-indicators-mcp (technical analysis)
  - bridge-rates-mcp (cross-chain bridges)
  - crypto-sentiment-mcp (Santiment API) *requires API key*
  - whale-tracker-mcp (Whale Alert API) *requires API key*
  - jupiter-mcp (Solana DEX) *requires RPC endpoint*

Databases:
  - Redis: ✅ (installed via package manager)
  - SQLite: ✅ (fallback for Redis failures)
  - PostgreSQL: ❌ (not installed)

API Requirements:
  - Santiment API key: Free tier (60 req/min)
  - Whale Alert API key: Free tier (10 req/min)
  - Solana RPC endpoint: Public or free Helius account
  - Total setup time: 10-15 minutes (manual API key signup)

Resource Usage:
  - Disk: 500 MB (MCPs: 200 MB + Redis: 300 MB)
  - RAM: 768 MB (5 MCPs × 100 MB + Redis: 256 MB)
  - CPU: Low (background caching tasks)

Use Cases:
  - Personal portfolio tracking
  - Small trading bots (<100 users)
  - MVP product development
  - Real-time market monitoring
```

#### Installation Command

```bash
crypto-mcp install --mode=standard

# Interactive mode (prompts for API keys)
crypto-mcp install --mode=standard --interactive

# Non-interactive (configure API keys later)
crypto-mcp install --mode=standard --skip-api-keys
```

#### API Key Configuration Flow

```
$ crypto-mcp install --mode=standard --interactive

Step 4/8: Configuring API credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 crypto-sentiment-mcp requires a Santiment API key.

  Free tier: 60 requests/minute
  Paid tier: 600 requests/minute ($135/month)

  Sign up: https://app.santiment.net/

? Enter Santiment API key (or press Enter to skip): ****************************************

✓ API key validated (200 OK from api.santiment.net)
✓ Saved to ~/.crypto-mcp-suite/config/.env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 whale-tracker-mcp requires a Whale Alert API key.

  Free tier: 10 requests/minute (basic transactions)
  Paid tier: 300 requests/minute ($150/month)

  Sign up: https://whale-alert.io/

? Enter Whale Alert API key (or press Enter to skip): ****************************************

✓ API key validated (GET /v1/status returned 200)
✓ Saved to ~/.crypto-mcp-suite/config/.env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 jupiter-mcp requires a Solana RPC endpoint.

  Option 1: Public endpoint (free, rate-limited)
  Option 2: Helius (free tier: 100 req/sec)
  Option 3: QuickNode (starts at $49/month)

? Select RPC provider:
  1) Public endpoint (https://api.mainnet-beta.solana.com)
  2) Helius (enter API key)
  3) QuickNode (enter endpoint URL)
  4) Skip for now
> 1

✓ Using public Solana RPC endpoint
⚠️  Warning: Public RPC is rate-limited. Helius recommended for production.

Continue? (Y/n): Y
```

#### File Structure (STANDARD)

```
~/.crypto-mcp-suite/
├── mcps/
│   ├── crypto-indicators-mcp/         (Node.js)
│   ├── bridge-rates-mcp/              (Node.js)
│   ├── crypto-sentiment-mcp/          (Python)
│   │   ├── venv/                      (isolated virtual env)
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── whale-tracker-mcp/             (Python)
│   │   ├── venv/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── jupiter-mcp/                   (Node.js)
│       ├── node_modules/
│       ├── index.js
│       └── package.json
├── data/
│   ├── cache.db (SQLite fallback)
│   └── redis/
│       └── dump.rdb (Redis persistence)
├── logs/
│   ├── crypto-indicators.log
│   ├── bridge-rates.log
│   ├── crypto-sentiment.log
│   ├── whale-tracker.log
│   ├── jupiter.log
│   └── redis.log
├── config/
│   ├── .env (API keys, secrets)
│   ├── mcps.json (MCP registry)
│   └── redis.conf
└── bin/
    └── crypto-mcp
```

---

### 3. PREMIUM Mode

**Purpose**: Production deployments, institutional clients, high-net-worth investors
**Target Audience**: Trading firms, asset managers, enterprises
**Installation Time**: 10 minutes

#### Features

```yaml
MCPs Installed: 7 (all representative MCPs)
  - crypto-indicators-mcp (technical analysis)
  - bridge-rates-mcp (cross-chain bridges)
  - crypto-sentiment-mcp (Santiment API)
  - whale-tracker-mcp (Whale Alert API)
  - jupiter-mcp (Solana DEX)
  - uniswap-trader-mcp (Ethereum multi-chain DEX)
  - memecoin-radar-mcp (Dune Analytics)

Databases:
  - Redis: ✅ (production config: 2GB, AOF persistence)
  - PostgreSQL: ✅ (with TimescaleDB extension)
  - SQLite: ✅ (development fallback only)

API Requirements:
  - Santiment API key: Paid tier recommended ($135/month)
  - Whale Alert API key: Gold tier recommended ($150/month)
  - Dune Analytics API: Plus tier ($399/month)
  - Solana RPC: Helius Professional ($99/month)
  - Ethereum RPC: Alchemy Growth ($199/month)
  - Total API costs: $982/month (can start with free tiers)

Resource Usage:
  - Disk: 5 GB (MCPs: 500 MB + PostgreSQL: 4 GB + Redis: 500 MB)
  - RAM: 3 GB (7 MCPs × 150 MB + Redis: 512 MB + PostgreSQL: 1 GB)
  - CPU: Medium (background analytics, database queries)

Use Cases:
  - Institutional trading platforms
  - High-net-worth investor portals
  - Professional market research
  - Crypto hedge funds
  - Enterprise analytics
```

#### Installation Command

```bash
crypto-mcp install --mode=premium

# With automatic database setup
crypto-mcp install --mode=premium --auto-db

# With custom PostgreSQL credentials
crypto-mcp install --mode=premium --pg-user=crypto --pg-password=****
```

#### Database Setup Flow

```
$ crypto-mcp install --mode=premium --auto-db

Step 3/10: Setting up databases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Installing Redis...
  ✓ Detected package manager: Homebrew (macOS)
  ✓ Running: brew install redis
  ✓ Redis 7.2.3 installed
  ✓ Configuring: ~/.crypto-mcp-suite/config/redis.conf
    - maxmemory: 2GB
    - maxmemory-policy: allkeys-lru
    - appendonly: yes
  ✓ Starting Redis service: brew services start redis
  ✓ Redis health check passed (PING -> PONG)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Installing PostgreSQL with TimescaleDB...
  ✓ Running: brew install postgresql@15 timescaledb
  ✓ PostgreSQL 15.4 installed
  ✓ Initializing database cluster: initdb -D ~/.crypto-mcp-suite/data/postgres
  ✓ Starting PostgreSQL: brew services start postgresql@15
  ✓ Creating database: createdb crypto_mcp
  ✓ Creating user: createuser crypto_user --pwprompt
    ? Enter password for crypto_user: ************
  ✓ Enabling TimescaleDB: CREATE EXTENSION timescaledb;
  ✓ Importing schema: psql -f schema.sql crypto_mcp
  ✓ PostgreSQL health check passed (SELECT 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Database summary:
  Redis:      redis://localhost:6379 (2 GB, running)
  PostgreSQL: postgresql://crypto_user:****@localhost:5432/crypto_mcp (running)
  SQLite:     ~/.crypto-mcp-suite/data/cache.db (fallback)
```

#### File Structure (PREMIUM)

```
~/.crypto-mcp-suite/
├── mcps/
│   ├── crypto-indicators-mcp/
│   ├── bridge-rates-mcp/
│   ├── crypto-sentiment-mcp/
│   ├── whale-tracker-mcp/
│   ├── jupiter-mcp/
│   ├── uniswap-trader-mcp/
│   └── memecoin-radar-mcp/
├── data/
│   ├── cache.db (SQLite)
│   ├── redis/
│   │   ├── dump.rdb
│   │   └── appendonly.aof
│   └── postgres/
│       └── (PostgreSQL data directory)
├── logs/
│   ├── [7 MCP logs]
│   ├── redis.log
│   └── postgres.log
├── config/
│   ├── .env
│   ├── mcps.json
│   ├── redis.conf
│   └── postgres/
│       ├── postgresql.conf
│       └── pg_hba.conf
├── backups/
│   ├── postgres/
│   │   └── daily/
│   └── redis/
│       └── snapshots/
└── bin/
    └── crypto-mcp
```

---

## CLI Tool Design

### 1. Command Structure

```
crypto-mcp <command> [subcommand] [options]

Core Commands:
  install         Install the Crypto MCP Suite
  uninstall       Remove the Crypto MCP Suite
  start           Start all or specific MCPs
  stop            Stop all or specific MCPs
  restart         Restart all or specific MCPs
  status          Show status of all MCPs and databases
  logs            View MCP logs
  test            Test MCP connectivity
  config          Manage configuration
  update          Update MCPs to latest versions
  backup          Backup databases and configuration
  restore         Restore from backup

Management Commands:
  add <mcp>       Add a new MCP to existing installation
  remove <mcp>    Remove an MCP
  enable <mcp>    Enable an MCP
  disable <mcp>   Disable an MCP

Utility Commands:
  doctor          Diagnose installation issues
  clean           Clean cache and temporary files
  version         Show version information
  help            Show help for any command
```

### 2. Command Reference

#### `crypto-mcp install`

```bash
# Usage
crypto-mcp install [options]

# Options
--mode=<minimal|standard|premium>   Installation mode (default: standard)
--path=<directory>                  Installation directory (default: ~/.crypto-mcp-suite)
--interactive                       Prompt for API keys during installation
--skip-api-keys                     Skip API key configuration (configure later)
--auto-db                           Automatically install databases
--no-db                             Skip database installation
--pg-user=<username>                PostgreSQL username (default: crypto_user)
--pg-password=<password>            PostgreSQL password (prompt if not provided)
--redis-password=<password>         Redis password (optional)
--dry-run                           Show what would be installed without installing

# Examples
crypto-mcp install --mode=minimal
crypto-mcp install --mode=standard --interactive
crypto-mcp install --mode=premium --auto-db --path=/opt/crypto-mcp
crypto-mcp install --dry-run --mode=standard  # Preview installation
```

#### `crypto-mcp status`

```bash
# Usage
crypto-mcp status [options]

# Options
--json                              Output status as JSON
--verbose                          Show detailed status information

# Example Output
$ crypto-mcp status

📊 Crypto MCP Suite Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 MCPs (5/5 running)
  ✓ crypto-indicators-mcp    http://localhost:3001  [PID: 12345]  ↑ 2d 5h
  ✓ bridge-rates-mcp         http://localhost:3002  [PID: 12346]  ↑ 2d 5h
  ✓ crypto-sentiment-mcp     http://localhost:3003  [PID: 12347]  ↑ 2d 5h
  ✓ whale-tracker-mcp        http://localhost:3004  [PID: 12348]  ↑ 2d 5h
  ✓ jupiter-mcp              http://localhost:3005  [PID: 12349]  ↑ 2d 5h

💾 Databases
  ✓ Redis         redis://localhost:6379         Memory: 245 MB / 2 GB (12%)
  ✓ SQLite        ~/.crypto-mcp-suite/data/cache.db    Size: 15 MB

📈 Health Checks (last 5 minutes)
  Uptime: 99.8%
  Avg response time: 245ms
  Failed requests: 3/1,234 (0.2%)

💰 API Quotas (STANDARD mode)
  Santiment:   547 / 3,600 requests/hour (15%)
  Whale Alert: 23 / 600 requests/hour (4%)

🔧 System Resources
  CPU: 3.2% (7 processes)
  RAM: 768 MB / 16 GB (5%)
  Disk: 487 MB / 500 GB (0.1%)
```

#### `crypto-mcp logs`

```bash
# Usage
crypto-mcp logs [mcp-name] [options]

# Options
--follow, -f                        Follow log output (tail -f)
--lines=<n>, -n <n>                Last N lines (default: 50)
--all                              Show logs from all MCPs
--level=<error|warn|info|debug>    Filter by log level

# Examples
crypto-mcp logs                                # All MCPs (last 50 lines)
crypto-mcp logs crypto-sentiment-mcp --follow  # Follow specific MCP
crypto-mcp logs --all --level=error            # All error logs
crypto-mcp logs jupiter-mcp -n 100             # Last 100 lines

# Example Output
$ crypto-mcp logs crypto-sentiment-mcp -n 20

[2025-10-01 14:23:45] INFO  Starting crypto-sentiment-mcp v1.2.0
[2025-10-01 14:23:46] INFO  Connecting to Redis at localhost:6379
[2025-10-01 14:23:46] INFO  Redis connected (latency: 2ms)
[2025-10-01 14:23:47] INFO  Validating Santiment API key
[2025-10-01 14:23:48] INFO  API key valid (tier: free, quota: 60 req/min)
[2025-10-01 14:23:48] INFO  Server listening on http://localhost:3003
[2025-10-01 14:24:12] INFO  [GET /sentiment/bitcoin] 842ms (cache miss)
[2025-10-01 14:24:45] INFO  [GET /sentiment/ethereum] 123ms (cache hit)
[2025-10-01 14:25:03] WARN  Rate limit: 55/60 requests used (92%)
[2025-10-01 14:25:30] INFO  [GET /social-volume/solana] 1,234ms (cache miss)
```

#### `crypto-mcp test`

```bash
# Usage
crypto-mcp test [mcp-name] [options]

# Options
--all                              Test all MCPs
--timeout=<ms>                     Request timeout (default: 5000ms)

# Example Output
$ crypto-mcp test --all

🧪 Testing Crypto MCP Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing crypto-indicators-mcp...
  ✓ HTTP server responding (http://localhost:3001)
  ✓ Calculate RSI: [44, 44.34, 44.09...] → 52.3 (123ms)
  ✓ Calculate MACD: [100, 102, 101...] → {macd: 1.2, signal: 0.8} (87ms)

Testing bridge-rates-mcp...
  ✓ HTTP server responding (http://localhost:3002)
  ✓ Get bridge routes: ETH → MATIC → 5 routes found (1,234ms)
  ✓ Cheapest route: Hop Protocol (fee: $0.42)

Testing crypto-sentiment-mcp...
  ✓ HTTP server responding (http://localhost:3003)
  ✓ Santiment API key valid
  ✓ Get sentiment: BTC → social_volume: 1,234,567 (892ms)
  ⚠  Warning: Rate limit 58/60 (97%)

Testing whale-tracker-mcp...
  ✓ HTTP server responding (http://localhost:3004)
  ✓ Whale Alert API key valid
  ✓ Get recent transactions → 23 whales in last hour (456ms)

Testing jupiter-mcp...
  ✓ HTTP server responding (http://localhost:3005)
  ✓ Solana RPC connection (public endpoint)
  ✓ Get token price: SOL → $145.23 (567ms)
  ⚠  Warning: Public RPC may be rate-limited

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed (5/5 MCPs healthy)
⚠  2 warnings (non-critical)
```

#### `crypto-mcp config`

```bash
# Usage
crypto-mcp config <action> [options]

# Actions
get <key>                          Get configuration value
set <key> <value>                  Set configuration value
list                               List all configuration
edit                               Open config file in editor
validate                           Validate configuration

# Examples
crypto-mcp config get SANTIMENT_API_KEY
crypto-mcp config set SANTIMENT_API_KEY abc123...
crypto-mcp config set REDIS_HOST localhost
crypto-mcp config list
crypto-mcp config edit  # Opens ~/.crypto-mcp-suite/config/.env in $EDITOR
crypto-mcp config validate  # Check for missing/invalid values

# Example Output
$ crypto-mcp config list

📋 Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Database Settings:
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=(not set)
  POSTGRES_HOST=(not configured)
  POSTGRES_PORT=5432
  USE_SQLITE=true

API Keys:
  SANTIMENT_API_KEY=abc123... (valid, free tier)
  WHALE_ALERT_API_KEY=xyz789... (valid, free tier)
  SOLANA_RPC_URL=https://api.mainnet-beta.solana.com (public)
  HELIUS_API_KEY=(not set)
  DUNE_API_KEY=(not set)

MCP Settings:
  MCP_BASE_PORT=3001
  MCP_LOG_LEVEL=info
  MCP_CACHE_TTL=300

Installation:
  INSTALL_MODE=standard
  INSTALL_PATH=~/.crypto-mcp-suite
  VERSION=1.0.0
```

#### `crypto-mcp update`

```bash
# Usage
crypto-mcp update [mcp-name] [options]

# Options
--all                              Update all MCPs
--check                            Check for updates without installing
--version=<version>                Update to specific version

# Examples
crypto-mcp update --check                      # Check for updates
crypto-mcp update --all                        # Update all MCPs
crypto-mcp update crypto-sentiment-mcp         # Update specific MCP
crypto-mcp update jupiter-mcp --version=1.5.0  # Update to specific version

# Example Output
$ crypto-mcp update --check

🔍 Checking for updates...

Updates available:
  crypto-sentiment-mcp: 1.2.0 → 1.3.1 (security patch)
  whale-tracker-mcp:    1.1.0 → 1.2.0 (new features)
  jupiter-mcp:          1.4.0 → 1.5.2 (bug fixes)

Run 'crypto-mcp update --all' to update all MCPs
```

#### `crypto-mcp doctor`

```bash
# Usage
crypto-mcp doctor [options]

# Options
--fix                              Automatically fix issues (where possible)
--verbose                         Show detailed diagnostic information

# Example Output
$ crypto-mcp doctor

🩺 Diagnosing Crypto MCP Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking prerequisites...
  ✓ Node.js 20.10.0 (>= 18.0.0 required)
  ✓ Python 3.11.5 (>= 3.10.0 required)
  ✓ npm 10.2.3
  ✓ pip 23.3.1

Checking installation...
  ✓ Installation directory exists (~/.crypto-mcp-suite)
  ✓ 5 MCPs installed
  ✓ Configuration file valid (.env)
  ✗ Redis not running (expected: redis://localhost:6379)
  ✓ SQLite database exists (15 MB)

Checking MCPs...
  ✓ crypto-indicators-mcp (healthy)
  ✓ bridge-rates-mcp (healthy)
  ✗ crypto-sentiment-mcp (unhealthy - port 3003 not responding)
  ✓ whale-tracker-mcp (healthy)
  ✓ jupiter-mcp (healthy)

Checking API keys...
  ✓ SANTIMENT_API_KEY (valid)
  ✗ WHALE_ALERT_API_KEY (invalid - API returned 401 Unauthorized)
  ✓ SOLANA_RPC_URL (reachable)

Checking disk space...
  ✓ Installation: 487 MB / 500 GB available (99.9% free)
  ✓ Logs: 45 MB (within limits)

Checking permissions...
  ✓ Read/write access to ~/.crypto-mcp-suite
  ✓ Executable permissions on CLI tool

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 3 issues found:

1. Redis not running
   → Fix: crypto-mcp start-db redis
   → Or: brew services start redis (macOS)

2. crypto-sentiment-mcp not responding
   → Fix: crypto-mcp restart crypto-sentiment-mcp
   → Check logs: crypto-mcp logs crypto-sentiment-mcp

3. Invalid Whale Alert API key
   → Fix: crypto-mcp config set WHALE_ALERT_API_KEY <new-key>
   → Get key: https://whale-alert.io/

Run 'crypto-mcp doctor --fix' to automatically fix issues
```

---

## Dependency Isolation Strategy

### 1. Challenge: Multi-Language MCPs

**Problem**: 7 MCPs use different runtimes and dependencies
- 4 JavaScript MCPs (Node.js, different npm packages)
- 3 Python MCPs (Python 3.10+, different pip packages)
- Potential version conflicts (e.g., two MCPs require different `axios` versions)

**Solution**: Complete isolation per MCP

### 2. JavaScript MCP Isolation

#### Strategy: Separate `node_modules` Per MCP

```
~/.crypto-mcp-suite/mcps/
├── jupiter-mcp/
│   ├── node_modules/          ← Isolated dependencies
│   │   ├── @solana/web3.js/
│   │   ├── axios/             (version 1.6.0)
│   │   └── ...
│   ├── package.json
│   ├── package-lock.json
│   └── index.js
├── uniswap-trader-mcp/
│   ├── node_modules/          ← Different dependencies
│   │   ├── ethers/
│   │   ├── axios/             (version 1.5.2 - different version OK!)
│   │   └── ...
│   ├── package.json
│   └── index.js
└── bridge-rates-mcp/
    ├── node_modules/
    └── ...
```

**Installation Process**:

```bash
# For each JavaScript MCP
cd ~/.crypto-mcp-suite/mcps/jupiter-mcp
npm install  # Creates isolated node_modules

cd ~/.crypto-mcp-suite/mcps/uniswap-trader-mcp
npm install  # Separate node_modules, no conflicts

cd ~/.crypto-mcp-suite/mcps/bridge-rates-mcp
npm install  # Each MCP completely isolated
```

**Disk Trade-off**:
- Without isolation: 50 MB (shared node_modules)
- With isolation: 150 MB (3× duplication)
- **Trade-off accepted**: Reliability > disk space

### 3. Python MCP Isolation

#### Strategy: Virtual Environments (`venv`)

```
~/.crypto-mcp-suite/mcps/
├── crypto-sentiment-mcp/
│   ├── venv/                   ← Isolated Python environment
│   │   ├── bin/
│   │   │   ├── python          (symlink to Python 3.11)
│   │   │   └── pip
│   │   └── lib/
│   │       └── python3.11/
│   │           └── site-packages/
│   │               ├── httpx/
│   │               ├── fastmcp/
│   │               └── ...
│   ├── main.py
│   └── requirements.txt
├── whale-tracker-mcp/
│   ├── venv/                   ← Separate environment
│   │   └── lib/
│   │       └── python3.11/
│   │           └── site-packages/
│   │               ├── httpx/  (different version OK)
│   │               ├── tabulate/
│   │               └── ...
│   ├── main.py
│   └── requirements.txt
└── memecoin-radar-mcp/
    ├── venv/
    └── ...
```

**Installation Process**:

```bash
# For each Python MCP
cd ~/.crypto-mcp-suite/mcps/crypto-sentiment-mcp
python3 -m venv venv            # Create virtual environment
source venv/bin/activate        # Activate (Unix)
# venv\Scripts\activate.bat     # Activate (Windows)
pip install -r requirements.txt # Install dependencies in isolation

cd ~/.crypto-mcp-suite/mcps/whale-tracker-mcp
python3 -m venv venv            # Separate environment
source venv/bin/activate
pip install -r requirements.txt # No conflicts with crypto-sentiment-mcp
```

**Activation in Production**:

```javascript
// start-python-mcp.js
const { spawn } = require('child_process');
const path = require('path');

function startPythonMCP(mcpName) {
  const mcpPath = path.join(process.env.HOME, '.crypto-mcp-suite', 'mcps', mcpName);
  const venvPython = path.join(mcpPath, 'venv', 'bin', 'python'); // Unix
  // const venvPython = path.join(mcpPath, 'venv', 'Scripts', 'python.exe'); // Windows

  const process = spawn(venvPython, ['main.py'], {
    cwd: mcpPath,
    env: {
      ...process.env,
      VIRTUAL_ENV: path.join(mcpPath, 'venv'),
    },
  });

  process.stdout.on('data', (data) => console.log(`[${mcpName}] ${data}`));
  process.stderr.on('data', (data) => console.error(`[${mcpName}] ERROR: ${data}`));
}

startPythonMCP('crypto-sentiment-mcp');
```

### 4. Database Isolation

#### Redis: Separate Databases by Index

```javascript
// redis-isolation.js
const Redis = require('ioredis');

// Each MCP gets its own Redis database (0-15)
const redisDatabases = {
  'jupiter-mcp': 0,
  'uniswap-trader-mcp': 1,
  'crypto-sentiment-mcp': 2,
  'whale-tracker-mcp': 3,
  'bridge-rates-mcp': 4,
  'memecoin-radar-mcp': 5,
};

function getRedisClient(mcpName) {
  return new Redis({
    host: 'localhost',
    port: 6379,
    db: redisDatabases[mcpName] || 0,
  });
}

// Usage in jupiter-mcp
const redis = getRedisClient('jupiter-mcp'); // Uses DB 0
await redis.set('token:SOL:price', '145.23');

// Usage in uniswap-trader-mcp
const redis = getRedisClient('uniswap-trader-mcp'); // Uses DB 1
await redis.set('token:ETH:price', '2876.45');
// No conflict with jupiter-mcp's "token:SOL:price" (different databases)
```

#### PostgreSQL: Separate Schemas

```sql
-- Each MCP gets its own schema
CREATE SCHEMA jupiter;
CREATE SCHEMA uniswap;
CREATE SCHEMA sentiment;
CREATE SCHEMA whales;
CREATE SCHEMA memecoins;

-- jupiter-mcp tables
CREATE TABLE jupiter.swap_transactions (...);

-- uniswap-trader-mcp tables
CREATE TABLE uniswap.dex_trades (...);

-- crypto-sentiment-mcp tables
CREATE TABLE sentiment.sentiment_history (...);

-- whale-tracker-mcp tables
CREATE TABLE whales.whale_transactions (...);

-- memecoin-radar-mcp tables
CREATE TABLE memecoins.memecoins (...);
```

### 5. Port Allocation

**Problem**: 7 MCPs need unique HTTP ports
**Solution**: Sequential allocation from base port

```javascript
// port-allocation.js
const BASE_PORT = 3001;

const mcpPorts = {
  'crypto-indicators-mcp': 3001,    // BASE_PORT + 0
  'bridge-rates-mcp': 3002,          // BASE_PORT + 1
  'crypto-sentiment-mcp': 3003,      // BASE_PORT + 2
  'whale-tracker-mcp': 3004,         // BASE_PORT + 3
  'jupiter-mcp': 3005,               // BASE_PORT + 4
  'uniswap-trader-mcp': 3006,        // BASE_PORT + 5
  'memecoin-radar-mcp': 3007,        // BASE_PORT + 6
};

// Configuration file: ~/.crypto-mcp-suite/config/mcps.json
{
  "mcps": [
    {
      "name": "crypto-indicators-mcp",
      "port": 3001,
      "runtime": "node",
      "entry": "index.js"
    },
    {
      "name": "crypto-sentiment-mcp",
      "port": 3003,
      "runtime": "python",
      "entry": "main.py",
      "venv": "venv"
    }
  ]
}
```

### 6. Log File Isolation

```
~/.crypto-mcp-suite/logs/
├── crypto-indicators.log          ← Separate log per MCP
├── bridge-rates.log
├── crypto-sentiment.log
├── whale-tracker.log
├── jupiter.log
├── uniswap-trader.log
├── memecoin-radar.log
├── redis.log                      ← Database logs
└── postgres.log

# Each MCP writes to its own log file
# No log interleaving, easy troubleshooting
```

**Log Rotation** (prevent logs from growing indefinitely):

```bash
# logrotate config: /etc/logrotate.d/crypto-mcp-suite
~/.crypto-mcp-suite/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $USER $USER
}
```

---

## Platform Support

### 1. Supported Platforms

| Platform | Version | Package Manager | Tested |
|----------|---------|-----------------|--------|
| **macOS** | 12+ (Monterey) | Homebrew | ✅ Primary |
| **Linux (Ubuntu)** | 20.04+ | apt | ✅ Primary |
| **Linux (Debian)** | 11+ | apt | ✅ Primary |
| **Linux (Fedora)** | 36+ | dnf | ⚠️ Community |
| **Linux (Arch)** | Rolling | pacman | ⚠️ Community |
| **Windows** | 10/11 | Chocolatey, Scoop | ⚠️ Beta |
| **WSL 2** | Ubuntu 20.04+ | apt | ✅ Recommended (Windows users) |

### 2. Platform-Specific Installation

#### macOS (Homebrew)

```bash
# Prerequisites check
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Redis installation
brew install redis
brew services start redis

# PostgreSQL installation (PREMIUM mode)
brew install postgresql@15 timescaledb
brew services start postgresql@15

# Installer detects Homebrew automatically
crypto-mcp install --mode=standard
```

#### Ubuntu/Debian (apt)

```bash
# Prerequisites
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip python3-venv

# Redis installation
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# PostgreSQL installation (PREMIUM mode)
sudo apt install -y postgresql-15 postgresql-contrib
sudo sh -c 'echo "deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main" > /etc/apt/sources.list.d/timescaledb.list'
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -
sudo apt update
sudo apt install -y timescaledb-2-postgresql-15

# Installer detects apt automatically
crypto-mcp install --mode=standard
```

#### Windows (Chocolatey)

```powershell
# Prerequisites (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install -y nodejs python

# Redis installation
choco install -y redis-64
redis-server --service-install
redis-server --service-start

# PostgreSQL installation (PREMIUM mode)
choco install -y postgresql15
# TimescaleDB requires manual installation on Windows

# Installer detects Chocolatey automatically
crypto-mcp install --mode=standard
```

**⚠️ Windows Recommendation**: Use WSL 2 (Windows Subsystem for Linux) for best compatibility

```bash
# Windows users: Install WSL 2 first
wsl --install -d Ubuntu-22.04

# Then run installer inside WSL
wsl
crypto-mcp install --mode=standard
```

### 3. Platform Detection Logic

```javascript
// platform-detector.js
const os = require('os');
const { execSync } = require('child_process');

function detectPlatform() {
  const platform = os.platform();

  switch (platform) {
    case 'darwin':
      return {
        os: 'macOS',
        packageManager: 'brew',
        redisInstall: 'brew install redis',
        postgresInstall: 'brew install postgresql@15 timescaledb',
        serviceCommand: 'brew services',
      };

    case 'linux':
      // Detect Linux distribution
      try {
        const osRelease = execSync('cat /etc/os-release').toString();

        if (osRelease.includes('Ubuntu') || osRelease.includes('Debian')) {
          return {
            os: 'Ubuntu/Debian',
            packageManager: 'apt',
            redisInstall: 'sudo apt install -y redis-server',
            postgresInstall: 'sudo apt install -y postgresql-15 timescaledb-2-postgresql-15',
            serviceCommand: 'sudo systemctl',
          };
        } else if (osRelease.includes('Fedora')) {
          return {
            os: 'Fedora',
            packageManager: 'dnf',
            redisInstall: 'sudo dnf install -y redis',
            postgresInstall: 'sudo dnf install -y postgresql-server',
            serviceCommand: 'sudo systemctl',
          };
        }
      } catch (err) {
        console.warn('Could not detect Linux distribution');
      }
      break;

    case 'win32':
      // Check if running in WSL
      try {
        execSync('grep -qi microsoft /proc/version');
        return {
          os: 'WSL (Ubuntu)',
          packageManager: 'apt',
          redisInstall: 'sudo apt install -y redis-server',
          postgresInstall: 'sudo apt install -y postgresql-15',
          serviceCommand: 'sudo systemctl',
        };
      } catch {
        // Native Windows
        return {
          os: 'Windows',
          packageManager: 'choco',
          redisInstall: 'choco install -y redis-64',
          postgresInstall: 'choco install -y postgresql15',
          serviceCommand: 'sc',
        };
      }
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

module.exports = { detectPlatform };
```

### 4. Cross-Platform Path Handling

```javascript
// path-utils.js
const os = require('os');
const path = require('path');

function getInstallPath() {
  const platform = os.platform();

  if (platform === 'win32') {
    // Windows: C:\Users\<username>\.crypto-mcp-suite
    return path.join(os.homedir(), '.crypto-mcp-suite');
  } else {
    // Unix: ~/.crypto-mcp-suite
    return path.join(os.homedir(), '.crypto-mcp-suite');
  }
}

function getVenvActivateCommand(mcpPath) {
  const platform = os.platform();

  if (platform === 'win32') {
    return path.join(mcpPath, 'venv', 'Scripts', 'activate.bat');
  } else {
    return `source ${path.join(mcpPath, 'venv', 'bin', 'activate')}`;
  }
}

function getVenvPythonPath(mcpPath) {
  const platform = os.platform();

  if (platform === 'win32') {
    return path.join(mcpPath, 'venv', 'Scripts', 'python.exe');
  } else {
    return path.join(mcpPath, 'venv', 'bin', 'python');
  }
}

module.exports = {
  getInstallPath,
  getVenvActivateCommand,
  getVenvPythonPath,
};
```

---

## Installation UX Flow

### 1. Pre-Installation Checks

```bash
$ crypto-mcp install --mode=standard

🔍 Pre-installation checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking system requirements...
  ✓ Operating system: macOS 14.1 (Sonoma)
  ✓ Architecture: arm64 (Apple Silicon)
  ✓ Node.js: 20.10.0 (>= 18.0.0 required)
  ✓ npm: 10.2.3
  ✓ Python: 3.11.5 (>= 3.10.0 required)
  ✓ pip: 23.3.1
  ✓ Disk space: 487 GB available (500 MB required)
  ✓ Network connectivity: OK

Checking for conflicts...
  ✓ Port 3001-3007: Available
  ✓ Port 6379 (Redis): Available
  ✓ Port 5432 (PostgreSQL): Available
  ✓ Installation directory (~/.crypto-mcp-suite): Not exists (will create)

Checking package managers...
  ✓ Homebrew: 4.1.20 (detected)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All checks passed! Ready to install.

Installation Summary:
  Mode: STANDARD
  MCPs: 5 (crypto-indicators, bridge-rates, crypto-sentiment, whale-tracker, jupiter)
  Databases: Redis, SQLite
  Disk: ~500 MB
  Time: ~5 minutes

Continue? (Y/n): █
```

### 2. Installation Steps (STANDARD Mode)

```bash
Continue? (Y/n): Y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1/8: Creating installation directory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Creating ~/.crypto-mcp-suite...
  ✓ Created mcps/
  ✓ Created config/
  ✓ Created data/
  ✓ Created logs/
  ✓ Created bin/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2/8: Installing databases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 Installing Redis via Homebrew...
    Running: brew install redis
    [####################] 100% (45s)
  ✓ Redis 7.2.3 installed
  ✓ Configuring Redis (maxmemory: 2GB, AOF: enabled)
  ✓ Starting Redis: brew services start redis
  ✓ Health check: PING → PONG

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3/8: Installing MCPs (1/5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 crypto-indicators-mcp (JavaScript)
    Cloning from GitHub...
  ✓ Downloaded (32 files, 150 KB)
    Installing dependencies: npm install
    [####################] 100% (12s)
  ✓ Installed (node_modules: 45 packages, 15 MB)
  ✓ Test: Calculate RSI → 52.3 (98ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3/8: Installing MCPs (2/5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 bridge-rates-mcp (JavaScript)
    Cloning from GitHub...
  ✓ Downloaded (186 files, 320 KB)
    Installing dependencies: npm install
    [####################] 100% (15s)
  ✓ Installed (node_modules: 67 packages, 22 MB)
  ✓ Test: Get routes ETH → MATIC → 5 routes (1,234ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3/8: Installing MCPs (3/5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 crypto-sentiment-mcp (Python)
    Cloning from GitHub...
  ✓ Downloaded (217 files, 450 KB)
    Creating virtual environment: python3 -m venv venv
  ✓ venv created (35 MB)
    Installing dependencies: pip install -r requirements.txt
    [####################] 100% (18s)
  ✓ Installed (15 packages, 45 MB)
  ⚠  Requires API key: SANTIMENT_API_KEY (configure later)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3/8: Installing MCPs (4/5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 whale-tracker-mcp (Python)
    Cloning from GitHub...
  ✓ Downloaded (99 files, 180 KB)
    Creating virtual environment: python3 -m venv venv
  ✓ venv created (35 MB)
    Installing dependencies: pip install -r requirements.txt
    [####################] 100% (14s)
  ✓ Installed (12 packages, 38 MB)
  ⚠  Requires API key: WHALE_ALERT_API_KEY (configure later)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3/8: Installing MCPs (5/5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 jupiter-mcp (JavaScript)
    Cloning from GitHub...
  ✓ Downloaded (172 files, 280 KB)
    Installing dependencies: npm install
    [####################] 100% (16s)
  ✓ Installed (node_modules: 78 packages, 28 MB)
  ⚠  Using public Solana RPC (rate-limited, Helius recommended)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 4/8: Configuring environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Creating .env file...
  ✓ INSTALL_MODE=standard
  ✓ REDIS_HOST=localhost
  ✓ REDIS_PORT=6379
  ✓ MCP_BASE_PORT=3001
  ✓ 12 environment variables configured

  Creating mcps.json registry...
  ✓ Registered 5 MCPs with ports 3001-3005

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 5/8: Installing CLI tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Installing crypto-mcp CLI...
  ✓ Installed to ~/.crypto-mcp-suite/bin/crypto-mcp
  ✓ Added to PATH via ~/.zshrc

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 6/8: Starting services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Starting MCPs via PM2...
  ✓ crypto-indicators-mcp → PID 12345 (http://localhost:3001)
  ✓ bridge-rates-mcp      → PID 12346 (http://localhost:3002)
  ✓ crypto-sentiment-mcp  → PID 12347 (http://localhost:3003)
  ✓ whale-tracker-mcp     → PID 12348 (http://localhost:3004)
  ✓ jupiter-mcp           → PID 12349 (http://localhost:3005)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 7/8: Running health checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Testing crypto-indicators-mcp...
  ✓ HTTP responding (123ms)
  ✓ Calculate RSI test passed

  Testing bridge-rates-mcp...
  ✓ HTTP responding (456ms)
  ✓ Get routes test passed

  Testing crypto-sentiment-mcp...
  ⚠  HTTP responding but API key not configured
    → Configure: crypto-mcp config set SANTIMENT_API_KEY <key>

  Testing whale-tracker-mcp...
  ⚠  HTTP responding but API key not configured
    → Configure: crypto-mcp config set WHALE_ALERT_API_KEY <key>

  Testing jupiter-mcp...
  ✓ HTTP responding (567ms)
  ✓ Solana RPC connection OK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 8/8: Finalizing installation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ Created installation manifest
  ✓ Set up automatic startup (PM2 save + startup)
  ✓ Installation log saved to ~/.crypto-mcp-suite/logs/install.log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Installation complete! (4m 32s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Next steps:

1. Configure API keys (2 MCPs need configuration):
   crypto-mcp config set SANTIMENT_API_KEY <your-key>
   crypto-mcp config set WHALE_ALERT_API_KEY <your-key>

   Get free API keys:
   • Santiment: https://app.santiment.net/ (60 req/min free)
   • Whale Alert: https://whale-alert.io/ (10 req/min free)

2. Test your installation:
   crypto-mcp test

3. Check status:
   crypto-mcp status

4. View logs:
   crypto-mcp logs --follow

📊 Installation summary:
  Mode: STANDARD
  MCPs: 5 installed (2 need API keys)
  Databases: Redis (running), SQLite (ready)
  Disk used: 487 MB
  Services: 5 MCPs running via PM2

📚 Documentation:
  https://github.com/crypto-mcp-suite/docs

💬 Support:
  https://github.com/crypto-mcp-suite/issues
```

### 3. Error Handling During Installation

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2/8: Installing databases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 Installing Redis via Homebrew...
    Running: brew install redis
    ❌ Error: Homebrew installation failed

    Error details:
      Command: brew install redis
      Exit code: 1
      Output: Error: redis 7.2.3 is already installed but not linked.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Installation failed at Step 2/8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Diagnosis:
  Redis is installed but not linked to Homebrew.

🔧 Suggested fix:
  Run: brew link redis
  Then retry: crypto-mcp install --mode=standard --resume

🔄 Rollback:
  Installation has been rolled back.
  No files were created.

💬 Need help?
  • View logs: cat ~/.crypto-mcp-suite/logs/install-error.log
  • Get support: https://github.com/crypto-mcp-suite/issues
  • Run diagnostics: crypto-mcp doctor
```

**Resume After Fix**:

```bash
$ brew link redis
Linking /usr/local/Cellar/redis/7.2.3... 38 symlinks created.

$ crypto-mcp install --mode=standard --resume

🔄 Resuming installation from Step 2/8...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2/8: Installing databases (resumed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ Redis already installed (7.2.3)
  ✓ Configuring Redis...
  ✓ Starting Redis: brew services start redis
  ✓ Health check: PING → PONG

Continuing installation...
```

---

## Configuration Management

### 1. Configuration Files

```
~/.crypto-mcp-suite/config/
├── .env                    # Environment variables (API keys, secrets)
├── mcps.json               # MCP registry and settings
├── redis.conf              # Redis configuration
└── postgres/
    ├── postgresql.conf     # PostgreSQL main config
    └── pg_hba.conf         # PostgreSQL auth config
```

### 2. `.env` File Structure

```bash
# ~/.crypto-mcp-suite/config/.env

# Installation metadata
INSTALL_MODE=standard
INSTALL_PATH=/Users/username/.crypto-mcp-suite
VERSION=1.0.0
INSTALLED_AT=2025-10-01T14:23:45Z

# Database configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
USE_SQLITE=true
SQLITE_PATH=/Users/username/.crypto-mcp-suite/data/cache.db

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=crypto_mcp
POSTGRES_USER=crypto_user
POSTGRES_PASSWORD=<generated-password>

# MCP configuration
MCP_BASE_PORT=3001
MCP_LOG_LEVEL=info
MCP_CACHE_TTL=300

# API Keys (STANDARD mode)
SANTIMENT_API_KEY=
WHALE_ALERT_API_KEY=
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# API Keys (PREMIUM mode)
DUNE_API_KEY=
HELIUS_API_KEY=
ALCHEMY_API_KEY=
QUICKNODE_ENDPOINT=

# Feature flags
ENABLE_CACHING=true
ENABLE_ANALYTICS=false
ENABLE_BACKUPS=true

# Monitoring
PROMETHEUS_ENABLED=false
GRAFANA_ENABLED=false
```

### 3. `mcps.json` Registry

```json
{
  "version": "1.0.0",
  "mode": "standard",
  "mcps": [
    {
      "name": "crypto-indicators-mcp",
      "enabled": true,
      "runtime": "node",
      "entry": "index.js",
      "port": 3001,
      "path": "/Users/username/.crypto-mcp-suite/mcps/crypto-indicators-mcp",
      "dependencies": {
        "node_modules": true,
        "packages": 45
      },
      "requires_api_key": false,
      "requires_database": false,
      "installed_at": "2025-10-01T14:25:12Z",
      "version": "1.0.0"
    },
    {
      "name": "crypto-sentiment-mcp",
      "enabled": true,
      "runtime": "python",
      "entry": "main.py",
      "port": 3003,
      "path": "/Users/username/.crypto-mcp-suite/mcps/crypto-sentiment-mcp",
      "dependencies": {
        "venv": true,
        "packages": 15
      },
      "requires_api_key": true,
      "api_key_env_var": "SANTIMENT_API_KEY",
      "requires_database": "redis",
      "installed_at": "2025-10-01T14:26:45Z",
      "version": "1.2.0"
    }
  ],
  "databases": {
    "redis": {
      "enabled": true,
      "host": "localhost",
      "port": 6379,
      "version": "7.2.3"
    },
    "postgres": {
      "enabled": false
    },
    "sqlite": {
      "enabled": true,
      "path": "/Users/username/.crypto-mcp-suite/data/cache.db",
      "size_mb": 15
    }
  }
}
```

### 4. Configuration Validation

```javascript
// config-validator.js
const Joi = require('joi');

const envSchema = Joi.object({
  INSTALL_MODE: Joi.string().valid('minimal', 'standard', 'premium').required(),
  REDIS_HOST: Joi.string().hostname().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  POSTGRES_HOST: Joi.string().hostname().when('INSTALL_MODE', {
    is: 'premium',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SANTIMENT_API_KEY: Joi.string().when('INSTALL_MODE', {
    is: Joi.string().valid('standard', 'premium'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MCP_BASE_PORT: Joi.number().port().min(3000).max(9000).default(3001),
  MCP_LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
});

function validateConfig(config) {
  const { error, value } = envSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => `${d.path.join('.')}: ${d.message}`);
    throw new Error(`Configuration validation failed:\n  ${errors.join('\n  ')}`);
  }

  return value;
}

module.exports = { validateConfig };
```

---

## Error Handling & Recovery

### 1. Error Categories

| Category | Examples | Recovery Strategy |
|----------|----------|-------------------|
| **Prerequisites** | Node.js not found, Python < 3.10 | Show install instructions, abort |
| **Network** | GitHub clone timeout, npm registry down | Retry 3 times, fallback mirror |
| **Permissions** | Cannot write to ~/.crypto-mcp-suite | Suggest `sudo` or different path |
| **Port Conflicts** | Port 3001 already in use | Auto-increment port, notify user |
| **Dependency** | npm install fails, pip install fails | Show error log, suggest manual fix |
| **Database** | Redis won't start, PostgreSQL auth fails | Rollback, show diagnostic commands |
| **API Keys** | Invalid API key during test | Mark as warning, allow continue |

### 2. Atomic Installation (Rollback on Failure)

```javascript
// installer.js
class Installer {
  constructor() {
    this.steps = [];
    this.completedSteps = [];
    this.rollbackActions = [];
  }

  async install(mode) {
    try {
      await this.executeSteps(mode);
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      await this.rollback();
      throw error;
    }
  }

  async executeStep(step) {
    console.log(`Step ${step.number}/${this.steps.length}: ${step.name}`);

    try {
      // Execute step
      await step.execute();

      // Track for rollback
      this.completedSteps.push(step);
      if (step.rollback) {
        this.rollbackActions.unshift(step.rollback); // LIFO order
      }
    } catch (error) {
      error.step = step.name;
      throw error;
    }
  }

  async rollback() {
    console.log('\n🔄 Rolling back installation...\n');

    for (const [index, action] of this.rollbackActions.entries()) {
      try {
        await action();
        console.log(`  ✓ Rolled back ${index + 1}/${this.rollbackActions.length}`);
      } catch (err) {
        console.error(`  ❌ Rollback failed: ${err.message}`);
      }
    }

    console.log('\n✓ Rollback complete. No files were created.\n');
  }
}

// Example step with rollback
const createDirectoryStep = {
  name: 'Creating installation directory',
  number: 1,
  execute: async () => {
    await fs.mkdir(installPath, { recursive: true });
  },
  rollback: async () => {
    await fs.rm(installPath, { recursive: true, force: true });
  },
};

const installRedisStep = {
  name: 'Installing Redis',
  number: 2,
  execute: async () => {
    await execPromise('brew install redis');
  },
  rollback: async () => {
    await execPromise('brew services stop redis');
    await execPromise('brew uninstall redis');
  },
};
```

### 3. Resume Capability

```javascript
// resume-installer.js
class ResumableInstaller extends Installer {
  async saveCheckpoint(step) {
    const checkpoint = {
      step: step.number,
      timestamp: new Date().toISOString(),
      completedSteps: this.completedSteps.map((s) => s.name),
    };

    await fs.writeFile(
      path.join(installPath, '.install-checkpoint.json'),
      JSON.stringify(checkpoint, null, 2)
    );
  }

  async resume() {
    const checkpointFile = path.join(installPath, '.install-checkpoint.json');

    if (!fs.existsSync(checkpointFile)) {
      throw new Error('No checkpoint found. Cannot resume installation.');
    }

    const checkpoint = JSON.parse(await fs.readFile(checkpointFile, 'utf8'));
    console.log(`🔄 Resuming installation from Step ${checkpoint.step}...\n`);

    // Skip completed steps
    const remainingSteps = this.steps.slice(checkpoint.step - 1);
    await this.executeSteps(remainingSteps);

    // Clean up checkpoint file
    await fs.unlink(checkpointFile);
  }
}
```

---

## Uninstall Procedures

### 1. Complete Uninstall

```bash
$ crypto-mcp uninstall

⚠️  WARNING: This will remove the Crypto MCP Suite and all data.

The following will be deleted:
  • Installation directory: ~/.crypto-mcp-suite (487 MB)
  • 5 MCPs and all dependencies
  • Redis data (245 MB)
  • SQLite database (15 MB)
  • All logs and configuration

Databases will be stopped but NOT uninstalled:
  • Redis (brew services stop redis)
  • PostgreSQL (brew services stop postgresql)

? Are you sure you want to uninstall? (y/N): y

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Uninstalling Crypto MCP Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1/6: Stopping MCPs...
  ✓ Stopped crypto-indicators-mcp (PID: 12345)
  ✓ Stopped bridge-rates-mcp (PID: 12346)
  ✓ Stopped crypto-sentiment-mcp (PID: 12347)
  ✓ Stopped whale-tracker-mcp (PID: 12348)
  ✓ Stopped jupiter-mcp (PID: 12349)

Step 2/6: Stopping databases...
  ✓ Redis stopped (brew services stop redis)

Step 3/6: Removing PM2 processes...
  ✓ Deleted PM2 processes
  ✓ Removed PM2 startup script

Step 4/6: Removing installation directory...
  ✓ Deleted ~/.crypto-mcp-suite (487 MB freed)

Step 5/6: Removing CLI tool...
  ✓ Removed from PATH (~/.zshrc)
  ✓ Deleted /usr/local/bin/crypto-mcp symlink

Step 6/6: Cleaning up...
  ✓ Removed cache files
  ✓ Removed temporary files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Uninstall complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Note: Redis and PostgreSQL were stopped but not uninstalled.
   To completely remove databases:
     brew uninstall redis
     brew uninstall postgresql@15

👋 Thank you for using Crypto MCP Suite!
```

### 2. Partial Uninstall (Remove Individual MCP)

```bash
$ crypto-mcp remove whale-tracker-mcp

⚠️  This will remove whale-tracker-mcp and its dependencies.

? Are you sure? (y/N): y

Removing whale-tracker-mcp...
  ✓ Stopped MCP (PID: 12348)
  ✓ Removed from PM2
  ✓ Deleted ~/.crypto-mcp-suite/mcps/whale-tracker-mcp (83 MB freed)
  ✓ Updated mcps.json registry

✅ whale-tracker-mcp removed successfully!
```

---

## Health Checks & Monitoring

### 1. Built-in Health Checks

```javascript
// health-checker.js
async function runHealthChecks() {
  const checks = [
    checkNodeVersion(),
    checkPythonVersion(),
    checkRedisConnection(),
    checkPostgresConnection(),
    checkMCPsRunning(),
    checkAPIKeys(),
    checkDiskSpace(),
    checkPortAvailability(),
  ];

  const results = await Promise.allSettled(checks);

  const passed = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return {
    passed,
    failed,
    total: results.length,
    healthy: failed === 0,
    results,
  };
}

async function checkRedisConnection() {
  const redis = new Redis({ host: 'localhost', port: 6379 });

  try {
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error('Unexpected response');

    const info = await redis.info('memory');
    const memory = parseRedisMemory(info);

    return {
      status: 'healthy',
      message: `Redis connected (Memory: ${memory})`,
    };
  } catch (error) {
    throw new Error(`Redis connection failed: ${error.message}`);
  } finally {
    await redis.quit();
  }
}
```

### 2. Automated Health Monitoring (Cron)

```bash
# Add to crontab: crontab -e

# Health check every 5 minutes
*/5 * * * * /Users/username/.crypto-mcp-suite/bin/crypto-mcp health-check --silent

# Daily status report at 9 AM
0 9 * * * /Users/username/.crypto-mcp-suite/bin/crypto-mcp status --email=user@example.com
```

---

## Update & Upgrade Strategy

### 1. Version Check

```bash
$ crypto-mcp update --check

🔍 Checking for updates...

Current version: 1.0.0
Latest version: 1.2.0

Updates available for 3 MCPs:
  crypto-sentiment-mcp: 1.2.0 → 1.3.1
    • Security patch for dependency vulnerability
    • New feature: hourly sentiment aggregation
    • Breaking change: API response format changed

  whale-tracker-mcp: 1.1.0 → 1.2.0
    • Bug fix: incorrect USD conversion for BTC
    • New feature: custom wallet tracking

  jupiter-mcp: 1.4.0 → 1.5.2
    • Performance improvement: 20% faster route discovery
    • Bug fix: slippage calculation error

? Update all MCPs? (Y/n):
```

### 2. Safe Update Process (Zero-Downtime)

```bash
$ crypto-mcp update --all --zero-downtime

Updating 3 MCPs with zero downtime...

Step 1/3: crypto-sentiment-mcp (1.2.0 → 1.3.1)
  ✓ Downloaded version 1.3.1
  ✓ Installed dependencies (new venv)
  ✓ Running tests... PASSED
  ✓ Starting new instance on port 3013
  ✓ Health check passed
  ✓ Switching traffic from 3003 → 3013
  ✓ Stopped old instance (PID: 12347)
  ✓ Updated mcps.json

✅ All updates complete (zero downtime achieved)
```

---

## Security Considerations

### 1. API Key Storage

```bash
# ~/.crypto-mcp-suite/config/.env

# Permissions: 600 (read/write for owner only)
-rw------- 1 username username 1.2K Oct  1 14:23 .env

# Never commit .env to git
# Add to .gitignore if initializing git repo
```

### 2. Database Passwords

```javascript
// Prompt for PostgreSQL password (never store in plaintext)
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptPassword() {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';
    console.log('Enter PostgreSQL password: ');

    stdin.on('data', (char) => {
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        console.log('\n');
        resolve(password);
      } else if (char === '\u0003') {
        process.exit();
      } else {
        password += char;
        process.stdout.write('*');
      }
    });
  });
}
```

---

## Performance Optimization

### 1. PM2 Cluster Mode (Production)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'crypto-indicators-mcp',
      script: 'index.js',
      cwd: '/Users/username/.crypto-mcp-suite/mcps/crypto-indicators-mcp',
      instances: 2, // 2 instances for high-frequency requests
      exec_mode: 'cluster',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'crypto-sentiment-mcp',
      script: 'venv/bin/python',
      args: 'main.py',
      cwd: '/Users/username/.crypto-mcp-suite/mcps/crypto-sentiment-mcp',
      instances: 1, // Single instance (API rate-limited)
      env: {
        PORT: 3003,
      },
    },
  ],
};
```

### 2. Redis Connection Pooling

```javascript
// redis-pool.js
const Redis = require('ioredis');
const { Pool } = require('generic-pool');

const redisPool = Pool({
  create: () => new Redis({ host: 'localhost', port: 6379 }),
  destroy: (client) => client.quit(),
  min: 5,
  max: 20,
});

async function getRedisClient() {
  return await redisPool.acquire();
}

async function releaseRedisClient(client) {
  await redisPool.release(client);
}
```

---

## Conclusion

This installer design provides a production-grade, cross-platform solution for deploying the Crypto MCP Suite without Docker dependencies. Key highlights:

✅ **Three installation modes** (MINIMAL, STANDARD, PREMIUM) tailored to different use cases
✅ **Complete dependency isolation** (separate node_modules, venvs, Redis DBs, PostgreSQL schemas)
✅ **Cross-platform support** (macOS, Linux, Windows/WSL)
✅ **One-command installation** with interactive API key setup
✅ **Atomic operations** with automatic rollback on failure
✅ **Resume capability** for interrupted installations
✅ **Comprehensive CLI** with 15+ commands for management
✅ **Health monitoring** and diagnostics built-in
✅ **Zero-downtime updates**
✅ **Production-ready** with PM2 process management

**Next Phase**: Final MCP Selection & Curation (25-30 pages)
- Review all 98 MCPs (63 Kukapay + 35 official)
- Select 20-25 MCPs for high-net-worth investors
- Categorize into TIER S, TIER A, TIER B
- Document justification for each selected MCP

---

**Prepared by**: Solutions Architect
**Review Date**: October 1, 2025
**Next Phase**: Phase 4 - Final MCP Selection & Curation
**Status**: ✅ **READY FOR IMPLEMENTATION**
