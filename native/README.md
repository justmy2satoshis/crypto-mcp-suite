# Crypto MCP Suite - Native Installation (Windows)

**Version:** 0.1.0-alpha
**Platform:** Windows 10/11 (Windows-First Release)
**Installation Type:** User-Level (No Administrator Rights Required)

---

## 🎯 Overview

Native installation runs MCPs directly on your host OS using **PM2 process manager**, without Docker/Podman containers. This provides:

- ✅ Lower resource overhead (no container runtime)
- ✅ Direct access to system resources
- ✅ Easier debugging and development
- ✅ Familiar OS-native service management

---

## 📋 Prerequisites

### Required

1. **Node.js 20+** - JavaScript runtime
   - Download: https://nodejs.org/
   - Verify: `node --version` (must show v20.x.x or higher)

2. **npm 10+** - Package manager (bundled with Node.js)
   - Verify: `npm --version`

### Recommended (for full functionality)

3. **Redis** - Caching layer (60-80% API cost reduction)
   - Windows: https://github.com/tporadowski/redis/releases
   - Or WSL: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
   - Verify: `redis-cli ping` should return `PONG`

4. **PostgreSQL 15+** - Time-series database
   - Download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Verify: `psql --version`

---

## 🚀 Quick Installation

### Option 1: Automated Installation (Recommended)

```powershell
# 1. Navigate to installation directory
cd "C:\Users\User\mcp-servers\Crypto MCPs\Crypto-MCP-Suite\native"

# 2. Run installer
.\install-native.ps1

# 3. Run configuration wizard
.\config-wizard.ps1

# 4. Start MCPs
crypto-mcp start
```

### Option 2: Manual Installation

See detailed manual installation guide below.

---

## 📦 Installation Tiers

Choose your tier based on needs:

| Tier | MCPs | Description | Resource Usage |
|------|------|-------------|----------------|
| **Essential** | 7 | Core functionality only | ~500MB RAM |
| **Enhanced** | 15 | Essential + advanced tools | ~1.2GB RAM |
| **Advanced** | 21 | Enhanced + database MCPs | ~1.8GB RAM |
| **Premium/Full** | 25 | All MCPs including premium | ~2.5GB RAM |

### Tier 1 - Essential (Always Active)
- Memory Federation
- Filesystem Federation
- GitHub Federation
- Expert Role Prompt
- Sequential Thinking
- Desktop Commander
- Web Search

### Tier 2 - Enhanced (+8 MCPs)
- Context7
- Perplexity
- Playwright
- Notion
- Git Ops
- Converse Enhanced
- GitHub Manager
- Brave Web Search

### Tier 3 - Advanced (+6 MCPs)
- DuckDB
- PostgreSQL Pro
- Kafka
- MongoDB
- Redis MCP
- SQLite

### Tier 4 - Premium/Full (+4 MCPs)
- Kimi K2 Code Context
- Kimi K2 Resilient
- RAG Context
- Crypto Analytics

---

## 🛠️ Detailed Installation Steps

### Step 1: Prerequisite Verification

```powershell
# Check Node.js version (must be >= 20.0.0)
node --version

# Check npm
npm --version

# Check Redis (optional but recommended)
redis-cli ping

# Check PostgreSQL (optional but recommended)
psql --version
```

### Step 2: Run Installer

```powershell
cd "C:\Users\User\mcp-servers\Crypto MCPs\Crypto-MCP-Suite\native"
.\install-native.ps1
```

**What the installer does:**
1. Verifies Node.js 20+ installed
2. Checks/installs PM2 globally (`npm install -g pm2`)
3. Creates directory structure at `%LOCALAPPDATA%\crypto-mcp\`
4. Copies configuration files
5. Adds `crypto-mcp` to PATH

**Installation Location:** `C:\Users\{YourUsername}\AppData\Local\crypto-mcp\`

### Step 3: Configuration Wizard

```powershell
.\config-wizard.ps1
```

The wizard will:
- Select installation tier (Essential/Enhanced/Advanced/Premium)
- Test database connectivity (Redis, PostgreSQL)
- Collect API keys (optional, can add later)
- Generate `.env` configuration file

### Step 4: Verify Installation

```powershell
# Check installation location
dir $env:LOCALAPPDATA\crypto-mcp

# Verify PM2 is ready
pm2 --version

# Check configuration
type $env:LOCALAPPDATA\crypto-mcp\config\.env
```

---

## 🎮 Usage

### Starting MCPs

```powershell
# Start all MCPs in your selected tier
crypto-mcp start

# Start specific tier
crypto-mcp start essential
crypto-mcp start enhanced

# Start specific MCP
crypto-mcp start memory-federation
```

### Checking Status

```powershell
# Show all running MCPs
crypto-mcp status

# PM2 detailed status
pm2 list

# PM2 monitoring dashboard
pm2 monit
```

### Viewing Logs

```powershell
# View all logs
crypto-mcp logs

# Follow logs in real-time
crypto-mcp logs -f

# View specific MCP logs
crypto-mcp logs memory-federation

# PM2 log commands
pm2 logs
pm2 logs memory-federation --lines 100
```

### Stopping MCPs

```powershell
# Stop all MCPs
crypto-mcp stop

# Stop specific MCP
crypto-mcp stop memory-federation

# Restart all
crypto-mcp restart

# Restart specific MCP
crypto-mcp restart github-federation
```

---

## 📁 Directory Structure

```
%LOCALAPPDATA%\crypto-mcp\
├── bin/                    # Management scripts and CLI tools
│   ├── crypto-mcp.ps1     # Main CLI interface
│   ├── start-crypto-mcp.ps1
│   └── stop-crypto-mcp.ps1
├── lib/                    # MCP server implementations
├── config/                 # Configuration files
│   ├── .env               # Your configuration (generated)
│   ├── .env.template      # Configuration template
│   ├── ecosystem.config.js # PM2 configuration
│   └── installation.json  # Installation metadata
├── logs/                   # PM2 logs and application logs
├── data/                   # Persistent data
│   └── .pm2/              # PM2 process data
└── tmp/                    # Temporary files
```

---

## 🔧 Configuration

### Environment Variables

Edit `%LOCALAPPDATA%\crypto-mcp\config\.env` to configure:

```bash
# Installation tier
INSTALLATION_TIER=essential

# Database connections
REDIS_HOST=localhost
REDIS_PORT=6379
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=crypto_mcp_suite

# API keys (optional)
GITHUB_TOKEN=your_token_here
BRAVE_API_KEY=your_key_here

# Logging
LOG_LEVEL=info
```

### Reconfigure

Run configuration wizard again:

```powershell
cd $env:LOCALAPPDATA\crypto-mcp
.\config-wizard.ps1
```

---

## 🐛 Troubleshooting

### Issue: "Node.js not found"

**Solution:**
1. Install Node.js 20+ from https://nodejs.org/
2. Restart terminal
3. Verify: `node --version`

### Issue: "PM2 not found after installation"

**Solution:**
```powershell
# Install PM2 manually
npm install -g pm2

# Verify installation
pm2 --version

# If still not found, check npm global path
npm config get prefix
# Should be in PATH
```

### Issue: "MCPs won't start"

**Solution:**
```powershell
# Check PM2 status
pm2 status

# View error logs
pm2 logs --err

# Check configuration
type $env:LOCALAPPDATA\crypto-mcp\config\.env

# Restart PM2
pm2 kill
crypto-mcp start
```

### Issue: "Redis/PostgreSQL connection failed"

**Solution:**
1. Verify services running:
   - Redis: `redis-cli ping` → should return `PONG`
   - PostgreSQL: `psql --version` → should show version

2. Check Windows services:
   ```powershell
   sc query Redis
   sc query postgresql-x64-17
   ```

3. Update `.env` with correct connection strings

### Issue: "Permission denied"

**Solution:**
- User-level installation doesn't require admin rights
- If running installer, ensure executing from user directory
- Check PowerShell execution policy: `Get-ExecutionPolicy`
- If restricted: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

---

## 🗑️ Uninstallation

```powershell
# Stop all MCPs
crypto-mcp stop

# Run uninstaller
.\uninstall-native.ps1

# Or manual removal:
pm2 delete all
rm -r $env:LOCALAPPDATA\crypto-mcp
```

---

## 📚 Additional Resources

- **Main Documentation:** `../README.md`
- **Containerized Installation:** `../containerized/README.md`
- **Architecture Docs:** `../docs/`
- **PM2 Documentation:** https://pm2.keymetrics.io/

---

## 🎯 Next Steps

After installation:

1. ✅ Verify all MCPs started: `crypto-mcp status`
2. ✅ Test health endpoints: `curl http://localhost:3001/health`
3. ✅ View logs: `crypto-mcp logs -f`
4. ✅ Configure API keys in `.env`
5. ✅ Review documentation for each MCP

---

**Version:** 0.1.0-alpha
**Last Updated:** 2025-10-01
**Platform:** Windows 10/11 (Windows-First Release)
