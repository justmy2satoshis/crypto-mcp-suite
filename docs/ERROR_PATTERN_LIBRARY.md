# Error Pattern Library
## Crypto MCP Suite - Production Deployment Troubleshooting

**Version:** 1.0.0
**Last Updated:** October 2, 2025
**Source:** Real error patterns from Phase 8D installer validation and fixes
**Coverage:** 41 Crypto MCPs across 65 total MCPs

---

## Table of Contents

1. [Dependency Errors](#1-dependency-errors)
2. [TypeScript Compilation Errors](#2-typescript-compilation-errors)
3. [Configuration Errors](#3-configuration-errors)
4. [Python Environment Errors](#4-python-environment-errors)
5. [API Key & Runtime Errors](#5-api-key--runtime-errors)

---

## 1. Dependency Errors

### 1.1 Node.js MODULE_NOT_FOUND Patterns

#### Error Pattern

```bash
Error: Cannot find module '/path/to/mcp/index.js'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:815:15)
    at Function.Module._load (internal/modules/cjs/loader.js:667:27)
```

OR

```bash
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'ccxt' imported from /path/to/mcp/index.js
```

#### Affected MCPs (3 MCPs - Real Phase 8D Issues)

- `bridge-rates-mcp` (167 packages required)
- `ccxt-mcp` (103 packages required)
- `crypto-indicators-mcp` (123 packages required)

#### Root Cause

**Missing `node_modules/` directory** - Node.js dependencies not installed via `npm install`

#### Detection Method

```bash
# Check if node_modules exists
if [ ! -d "native/lib/bridge-rates-mcp/node_modules" ]; then
  echo "ERROR: Missing node_modules in bridge-rates-mcp"
fi
```

#### Resolution Procedure

```bash
# STEP 1: Navigate to MCP directory
cd native/lib/bridge-rates-mcp

# STEP 2: Install dependencies
npm install

# STEP 3: Verify installation
ls -la node_modules | head -10

# Expected output: node_modules/ with 167 packages

# STEP 4: Repeat for other Node.js MCPs
cd ../ccxt-mcp && npm install
cd ../crypto-indicators-mcp && npm install
```

#### Prevention Strategy

1. **Pre-Deployment Validation:**
   - Run `scripts/validate-mcp-dependencies.js` before deployment
   - Checks all 41 MCPs for node_modules/ or .venv/ presence

2. **Automated Installation:**
   ```bash
   # Install all Node.js MCPs in one command
   for dir in native/lib/*/; do
     if [ -f "$dir/package.json" ]; then
       cd "$dir" && npm install && cd -
     fi
   done
   ```

3. **CI/CD Integration:**
   - Add npm install step to deployment pipeline
   - Fail build if any MCP lacks dependencies

---

### 1.2 Python uv sync Failures

#### Error Pattern

```bash
error: Failed to download distributions

Caused by:
    0: Failed to fetch wheel: uv-0.1.0.tar.gz
    1: Network unreachable
```

OR

```bash
  × No solution found when resolving dependencies:
  ╰─▶ Because only aiohttp==3.9.0 is available and project depends on aiohttp>=3.9.1, we can conclude that project's requirements are unsatisfiable.
```

#### Affected MCPs (12 MCPs - Real Phase 8D Issues)

1. `chainlist-mcp`
2. `crypto-feargreed-mcp`
3. `crypto-liquidations-mcp`
4. `crypto-portfolio-mcp`
5. `crypto-projects-mcp`
6. `dao-proposals-mcp`
7. `dex-metrics-mcp`
8. `etf-flow-mcp`
9. `honeypot-detector-mcp`
10. `memecoin-radar-mcp`
11. `polymarket-predictions-mcp`
12. `whale-tracker-mcp`

#### Root Cause

**Missing `.venv/` directory** - Python virtual environment not created via `uv sync`

#### Detection Method

```bash
# Check if .venv exists for Python MCPs
for dir in native/lib/*/; do
  if [ -f "$dir/pyproject.toml" ] && [ ! -d "$dir/.venv" ]; then
    echo "ERROR: Missing .venv in $(basename $dir)"
  fi
done
```

#### Resolution Procedure

```bash
# STEP 1: Install uv if not present
curl -LsSf https://astral.sh/uv/install.sh | sh

# STEP 2: Add uv to PATH
export PATH="$HOME/.local/bin:$PATH"

# STEP 3: Sync Python MCP dependencies (example: chainlist-mcp)
cd native/lib/chainlist-mcp
uv sync

# Expected output:
# Resolved 47 packages in 1.2s
# Built chainlist-mcp @ file:///path/to/chainlist-mcp
# Prepared 47 packages in 500ms
# Installed 47 packages in 1.5s

# STEP 4: Verify .venv creation
ls -la .venv

# STEP 5: Automated install for all Python MCPs
cd /path/to/crypto-mcp-suite
for dir in native/lib/*/; do
  if [ -f "$dir/pyproject.toml" ]; then
    echo "Installing $(basename $dir)..."
    cd "$dir" && uv sync && cd - > /dev/null
  fi
done
```

#### Prevention Strategy

1. **System Requirements Check:**
   ```bash
   # Verify uv is installed
   if ! command -v uv &> /dev/null; then
     echo "ERROR: uv not installed - run: curl -LsSf https://astral.sh/uv/install.sh | sh"
     exit 1
   fi
   ```

2. **Pre-Deployment Script:**
   - `scripts/pre-deployment-check.sh` validates uv presence
   - Fails early if uv missing

3. **Dependency Cache:**
   - Use `uv pip compile` to lock dependencies
   - Cache `.venv` directories for faster reinstall

---

### 1.3 Missing package.json/pyproject.toml Detection

#### Error Pattern

```bash
npm ERR! enoent ENOENT: no such file or directory, open '/path/to/mcp/package.json'
```

OR

```bash
error: No `pyproject.toml` found in `/path/to/mcp`
```

#### Root Cause

**Corrupted or incomplete MCP directory** - Missing manifest files

#### Detection Method

```bash
# Validate all MCPs have required manifest files
for dir in native/lib/*/; do
  mcp_name=$(basename "$dir")
  if [ ! -f "$dir/package.json" ] && [ ! -f "$dir/pyproject.toml" ]; then
    echo "ERROR: $mcp_name has no package.json or pyproject.toml"
  fi
done
```

#### Resolution Procedure

```bash
# STEP 1: Re-initialize git submodules
git submodule update --init --recursive

# STEP 2: Verify submodule integrity
git submodule status | grep "^-"
# If any lines start with '-', submodule not initialized

# STEP 3: Force re-fetch specific submodule
git submodule update --init --force native/lib/<mcp-name>

# STEP 4: Verify manifest file exists
ls -la native/lib/<mcp-name>/package.json
```

---

## 2. TypeScript Compilation Errors

### 2.1 Missing dist/ Directory Patterns

#### Error Pattern

```bash
Error: Cannot find module '/path/to/mcp/dist/index.js'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:815:15)
```

OR (PM2-specific):

```bash
[PM2][ERROR] Script not found: /path/to/mcp/dist/index.js
```

#### Affected MCPs (2 MCPs - Real Phase 8D Issues)

- `ccxt-mcp` (TypeScript → `build/index.js`)
- `tokenmetrics-mcp` (TypeScript → `build/src/cli.js`)

#### Root Cause

**TypeScript source not compiled to JavaScript** - Missing `npm run build` step

#### Detection Method

```bash
# Check if TypeScript MCPs have build artifacts
for dir in native/lib/ccxt-mcp native/lib/tokenmetrics-mcp; do
  if [ -f "$dir/tsconfig.json" ] && [ ! -d "$dir/build" ] && [ ! -d "$dir/dist" ]; then
    echo "ERROR: TypeScript MCP $(basename $dir) not compiled"
  fi
done
```

#### Resolution Procedure

```bash
# STEP 1: Install dependencies first (prerequisite)
cd native/lib/ccxt-mcp
npm install

# STEP 2: Compile TypeScript
npm run build

# Expected output:
# > ccxt-mcp@1.0.0 build
# > tsc
# Successfully compiled TypeScript

# STEP 3: Verify build artifacts
ls -la build/

# STEP 4: Repeat for tokenmetrics-mcp
cd ../tokenmetrics-mcp
npm install
npm run build

# STEP 5: Verify correct build path
ls -la build/src/cli.js
```

#### Prevention Strategy

1. **Pre-Commit Hook:**
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   for mcp in ccxt-mcp tokenmetrics-mcp; do
     if [ -f "native/lib/$mcp/tsconfig.json" ]; then
       cd "native/lib/$mcp" && npm run build || exit 1
     fi
   done
   ```

2. **CI/CD Build Step:**
   ```yaml
   # .github/workflows/build.yml
   - name: Compile TypeScript MCPs
     run: |
       cd native/lib/ccxt-mcp && npm run build
       cd ../tokenmetrics-mcp && npm run build
   ```

3. **Validation Script:**
   - `scripts/validate-mcp-dependencies.js` checks for build/ or dist/ directories

---

### 2.2 tsconfig.json Misconfigurations

#### Error Pattern

```bash
error TS5023: Unknown compiler option 'moduleResolution'.
```

OR

```bash
error TS18003: No inputs were found in config file '/path/to/tsconfig.json'.
```

#### Root Cause

**Invalid or incompatible tsconfig.json** - TypeScript version mismatch

#### Resolution Procedure

```bash
# STEP 1: Check TypeScript version
npm list typescript

# STEP 2: Update to compatible version
npm install --save-dev typescript@latest

# STEP 3: Validate tsconfig.json
npx tsc --noEmit --project tsconfig.json

# STEP 4: Rebuild
npm run build
```

---

## 3. Configuration Errors

### 3.1 ecosystem.config.js Path Mismatch Patterns

#### Error Pattern (Real Phase 8D Issue)

```bash
[PM2][ERROR] Script not found: /path/to/tokenmetrics-mcp/dist/index.js
```

**Actual Issue:** ecosystem.config.js referenced `dist/index.js` but TypeScript compiled to `build/src/cli.js`

#### Affected MCPs (1 MCP - Real Phase 8D Issue)

- `tokenmetrics-mcp` (path: `dist/index.js` → **WRONG**, should be `build/src/cli.js`)

#### Root Cause

**Incorrect entry point in ecosystem.config.js** - Path doesn't match actual build output

#### Detection Method

```bash
# Validate all PM2 script paths exist
node -e "
const config = require('./native/config/ecosystem.config.js');
config.apps.forEach(app => {
  const fs = require('fs');
  if (!fs.existsSync(app.script)) {
    console.error('ERROR: Script not found:', app.script, 'for MCP:', app.name);
  }
});
"
```

#### Resolution Procedure (Real Phase 8D Fix)

```bash
# STEP 1: Identify correct entry point
cd native/lib/tokenmetrics-mcp
cat package.json | grep "main"
# OR
ls -la build/src/cli.js

# STEP 2: Update ecosystem.config.js
# BEFORE:
script: path.join(installPath, 'lib', 'tokenmetrics-mcp', 'dist', 'index.js')

# AFTER (CORRECTED):
script: path.join(installPath, 'lib', 'tokenmetrics-mcp', 'build', 'src', 'cli.js')

# STEP 3: Restart PM2 process
pm2 restart tokenmetrics-mcp
```

#### Prevention Strategy

1. **Path Validation Script:**
   ```javascript
   // scripts/validate-pm2-paths.js
   const fs = require('fs');
   const config = require('./native/config/ecosystem.config.js');

   let errors = 0;
   config.apps.forEach(app => {
     if (!fs.existsSync(app.script)) {
       console.error(`❌ ${app.name}: Script not found - ${app.script}`);
       errors++;
     }
   });

   if (errors > 0) {
     console.error(`\n❌ ${errors} MCP(s) have invalid script paths`);
     process.exit(1);
   }
   console.log('✅ All PM2 script paths valid');
   ```

2. **Pre-Deployment Check:**
   - Run validation before `pm2 start ecosystem.config.js`
   - Fail fast if any paths invalid

---

### 3.2 Relative vs Absolute Path Issues

#### Error Pattern

```bash
Error: Cannot find module '../lib/mcp-name/index.js'
```

#### Root Cause

**Relative paths in ecosystem.config.js break when PM2 runs from different directories**

#### Resolution

Always use **absolute paths** in ecosystem.config.js:

```javascript
// ❌ WRONG (relative path):
script: '../lib/ccxt-mcp/build/index.js'

// ✅ CORRECT (absolute path):
script: path.join(installPath, 'lib', 'ccxt-mcp', 'build', 'index.js')
```

---

## 4. Python Environment Errors

### 4.1 uv Binary Missing Patterns

#### Error Pattern

```bash
bash: uv: command not found
```

OR (PM2-specific):

```bash
[PM2][ERROR] spawn uv ENOENT
```

#### Root Cause

**uv not installed or not in PATH**

#### Detection Method

```bash
# Check if uv is installed
if ! command -v uv &> /dev/null; then
  echo "ERROR: uv not installed"
  exit 1
fi

# Check version
uv --version
# Expected: uv 0.1.0 or higher
```

#### Resolution Procedure

```bash
# STEP 1: Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# STEP 2: Add to PATH (permanent)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# STEP 3: Verify installation
uv --version

# STEP 4: Retry Python MCP installation
cd native/lib/chainlist-mcp
uv sync
```

---

### 4.2 Virtual Environment Creation Failures

#### Error Pattern

```bash
error: Failed to create virtualenv at `/path/to/.venv`

Caused by:
    0: Permission denied (os error 13)
```

#### Root Cause

**Insufficient permissions or disk space**

#### Resolution

```bash
# STEP 1: Check disk space
df -h /path/to/crypto-mcp-suite
# Need at least 2GB free

# STEP 2: Check permissions
ls -la native/lib/chainlist-mcp
# Should be writable by current user

# STEP 3: Fix permissions
chmod -R u+w native/lib/

# STEP 4: Retry uv sync
cd native/lib/chainlist-mcp
uv sync
```

---

## 5. API Key & Runtime Errors

### 5.1 Missing .env File Patterns

#### Error Pattern

```bash
[PM2][ERROR] TOKENMETRICS_API_KEY is not defined
```

OR (Python):

```bash
KeyError: 'SANTIMENT_API_KEY'
```

#### Affected MCPs (10 CRITICAL + 6 OPTIONAL)

**CRITICAL API Keys Required:**
1. TOKENMETRICS_API_KEY (tokenmetrics-mcp)
2. LUNARCRUSH_API_KEY (lunarcrush-mcp)
3. INFURA_API_KEY (uniswap-price, uniswap-trader)
4. THEGRAPH_API_KEY (aave, uniswap-pools)
5. DUNE_API_KEY (wallet-inspector)
6. SANTIMENT_API_KEY (crypto-sentiment)
7. CRYPTOPANIC_API_KEY (cryptopanic-mcp-server)
8. COINGLASS_API_KEY (hyperliquid-whalealert)
9. SOLSNIFFER_API_KEY (rug-check)

#### Root Cause

**.env file missing or API keys not set**

#### Detection Method

```bash
# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "ERROR: .env.local not found - copy from .env.example"
  exit 1
fi

# Validate critical API keys are set
for key in TOKENMETRICS_API_KEY LUNARCRUSH_API_KEY INFURA_API_KEY; do
  if ! grep -q "^$key=" .env.local; then
    echo "ERROR: $key not set in .env.local"
  fi
done
```

#### Resolution Procedure

```bash
# STEP 1: Copy template
cp .env.example .env.local

# STEP 2: Edit with API keys
nano .env.local
# Fill in actual API keys (see API_KEY_SETUP_GUIDE.md)

# STEP 3: Verify keys are set
cat .env.local | grep "TOKENMETRICS_API_KEY"

# STEP 4: Restart PM2 with new env vars
pm2 restart ecosystem.config.js

# STEP 5: Check logs for API authentication
pm2 logs tokenmetrics-mcp --lines 20
```

---

### 5.2 Invalid/Expired API Key Detection

#### Error Pattern

```bash
HTTP 401 Unauthorized: Invalid API key
```

OR

```bash
{"error": "API key expired", "code": "KEY_EXPIRED"}
```

#### Root Cause

**API key invalid, expired, or lacks permissions**

#### Detection Method

```bash
# Test TokenMetrics API key
curl -H "Authorization: Bearer $TOKENMETRICS_API_KEY" \
  https://api.tokenmetrics.com/v1/health

# Expected: 200 OK
# If 401: Key invalid

# Test LunarCrush API key
curl "https://lunarcrush.com/api4/public/coins/list?api_key=$LUNARCRUSH_API_KEY"

# Expected: 200 OK with JSON response
```

#### Resolution

1. **Verify API Key Format:**
   - TokenMetrics: Should start with `tm_`
   - LunarCrush: 32-character hex string
   - Infura: UUID format (8-4-4-4-12)

2. **Check API Dashboard:**
   - Log into API provider dashboard
   - Verify key status (active/expired)
   - Check usage limits not exceeded

3. **Regenerate Key:**
   - Delete old key in dashboard
   - Generate new key
   - Update .env.local
   - Restart PM2

---

### 5.3 401/403 Response Handling

#### Error Pattern

```bash
[TokenMetrics] Error: Request failed with status code 403
```

#### Root Cause

**API key lacks required permissions or rate limit exceeded**

#### Resolution

```bash
# STEP 1: Check rate limits
curl -I "https://api.tokenmetrics.com/v1/signals" \
  -H "Authorization: Bearer $TOKENMETRICS_API_KEY"
# Look for X-RateLimit-Remaining header

# STEP 2: Upgrade API tier if needed
# FREE tier: 50 req/day
# Basic tier: 500 req/day ($25/month)

# STEP 3: Implement rate limiting in MCP
# Add retry logic with exponential backoff
```

---

## Quick Reference: Error → Solution Mapping

| Error Pattern | Affected MCPs | Solution | Script |
|---------------|---------------|----------|--------|
| `MODULE_NOT_FOUND` | 3 Node.js MCPs | `npm install` | `validate-mcp-dependencies.js` |
| `.venv missing` | 12 Python MCPs | `uv sync` | `pre-deployment-check.sh` |
| `Script not found` | 2 TypeScript MCPs | `npm run build` | `validate-mcp-dependencies.js` |
| `Path mismatch` | tokenmetrics-mcp | Fix ecosystem.config.js | `validate-pm2-paths.js` |
| `uv: command not found` | All Python MCPs | Install uv | `pre-deployment-check.sh` |
| `API key not defined` | 10+ MCPs | Set in .env.local | `test-api-keys.sh` |
| `401 Unauthorized` | Premium MCPs | Verify/regenerate key | `test-api-keys.sh` |

---

## Prevention Checklist

✅ **Before Deployment:**
1. Run `scripts/pre-deployment-check.sh` (validates Node.js, Python, uv, PM2)
2. Run `scripts/validate-mcp-dependencies.js` (checks all 41 MCPs have deps)
3. Run `scripts/validate-pm2-paths.js` (checks ecosystem.config.js paths)
4. Create `.env.local` from `.env.example` with real API keys
5. Run `scripts/test-api-keys.sh` (validates API key authentication)

✅ **During Deployment:**
1. Initialize all 41 git submodules: `git submodule update --init --recursive`
2. Install Node.js dependencies: `npm install` for 3 MCPs
3. Install Python dependencies: `uv sync` for 38 MCPs
4. Compile TypeScript: `npm run build` for 2 MCPs
5. Verify PM2 config: Check all paths exist

✅ **After Deployment:**
1. Start PM2: `pm2 start native/config/ecosystem.config.js`
2. Check status: `pm2 status` (all should be "online")
3. Review logs: `pm2 logs --lines 50` (no errors)
4. Run health check: `scripts/health-check.js`

---

## Support Resources

- **Installation Guide:** [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)
- **API Key Setup:** [API_KEY_SETUP_GUIDE.md](../API_KEY_SETUP_GUIDE.md)
- **Pre-Deployment Checklist:** [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
- **Validation Report:** [INSTALLER_VALIDATION_REPORT.md](../INSTALLER_VALIDATION_REPORT.md)

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude <noreply@anthropic.com>
