# Crypto MCP Suite - Native Installation Test Plan

**Version:** 0.1.0-alpha
**Platform:** Windows 10/11
**Test Date:** 2025-10-01
**Status:** ⏳ Ready for Testing

---

## 🎯 Test Objectives

1. Verify installer creates correct directory structure
2. Validate Node.js/PM2 prerequisite detection
3. Confirm configuration wizard functionality
4. Test PM2 ecosystem configuration loads correctly
5. Verify CLI management commands work
6. Validate uninstaller removes all components
7. Measure startup time and resource usage

---

## 📋 Test Environment

### System Requirements
- Windows 10/11 (64-bit)
- PowerShell 5.1 or later
- Node.js 20+ (prerequisite)
- 2GB free RAM
- 500MB free disk space

### Test System Specifications
- OS: Windows 11 (to be confirmed during testing)
- PowerShell: (check with `$PSVersionTable.PSVersion`)
- Node.js: (check with `node --version`)
- RAM: (check with `Get-ComputerInfo | Select TotalPhysicalMemory`)

---

## ✅ Test Cases

### TC-1: Prerequisite Verification

**Objective:** Verify installer detects prerequisites correctly

**Steps:**
1. Open PowerShell
2. Navigate to `Crypto-MCP-Suite\native\`
3. Run `.\install-native.ps1`
4. Observe prerequisite checks

**Expected Results:**
- ✅ Node.js version detected (should be >= 20.0.0)
- ✅ npm version detected (should be >= 10.0.0)
- ✅ PM2 check (installs if missing)
- ✅ Redis check (warns if not found)
- ✅ PostgreSQL check (warns if not found)

**Evidence Required:**
```powershell
# Capture output
.\install-native.ps1 | Tee-Object -FilePath test-results\tc1-prerequisites.log
```

---

### TC-2: Directory Structure Creation

**Objective:** Verify installer creates all required directories

**Steps:**
1. Complete TC-1 (run installer)
2. Navigate to `%LOCALAPPDATA%\crypto-mcp\`
3. List directory structure

**Expected Results:**
- ✅ `bin/` directory exists
- ✅ `lib/` directory exists
- ✅ `config/` directory exists
- ✅ `logs/` directory exists
- ✅ `data/` directory exists
- ✅ `tmp/` directory exists

**Evidence Required:**
```powershell
# List structure
tree /F $env:LOCALAPPDATA\crypto-mcp > test-results\tc2-structure.txt
```

---

### TC-3: File Installation

**Objective:** Verify all files copied correctly

**Steps:**
1. Complete TC-2
2. Check for required files

**Expected Results:**
- ✅ `bin\crypto-mcp.ps1` exists
- ✅ `bin\start-crypto-mcp.ps1` exists
- ✅ `bin\stop-crypto-mcp.ps1` exists
- ✅ `config\.env.template` exists
- ✅ `config\ecosystem.config.js` exists
- ✅ `config\installation.json` exists

**Evidence Required:**
```powershell
# List installed files
Get-ChildItem -Recurse $env:LOCALAPPDATA\crypto-mcp\bin, $env:LOCALAPPDATA\crypto-mcp\config |
    Select-Object FullName > test-results\tc3-files.txt
```

---

### TC-4: PATH Configuration

**Objective:** Verify installer adds bin/ to PATH

**Steps:**
1. Complete TC-3
2. Restart PowerShell (new terminal window)
3. Run `crypto-mcp help`

**Expected Results:**
- ✅ Command executes without full path
- ✅ Help message displays correctly

**Evidence Required:**
```powershell
# Check PATH
$env:PATH -split ';' | Select-String "crypto-mcp" > test-results\tc4-path.txt

# Test command
crypto-mcp help > test-results\tc4-help.txt
```

---

### TC-5: Configuration Wizard

**Objective:** Verify configuration wizard creates .env file

**Steps:**
1. Run `.\config-wizard.ps1`
2. Select tier: 1 (Essential)
3. Accept default database settings
4. Skip API keys (press Enter)
5. Complete wizard

**Expected Results:**
- ✅ Wizard completes without errors
- ✅ `.env` file created in `config/`
- ✅ `INSTALLATION_TIER=essential` in .env
- ✅ Database connection strings present

**Evidence Required:**
```powershell
# Capture .env contents (sanitized)
Get-Content $env:LOCALAPPDATA\crypto-mcp\config\.env |
    Where-Object { $_ -notmatch 'PASSWORD|TOKEN|KEY' } > test-results\tc5-config.txt
```

---

### TC-6: PM2 Ecosystem Loading

**Objective:** Verify PM2 can load ecosystem.config.js

**Steps:**
1. Set environment: `$env:INSTALLATION_TIER = "essential"`
2. Set install path: `$env:CRYPTO_MCP_INSTALL_PATH = "$env:LOCALAPPDATA\crypto-mcp"`
3. Navigate to config directory
4. Test PM2 configuration

**Expected Results:**
- ✅ No syntax errors in ecosystem.config.js
- ✅ PM2 lists 7 MCPs (Essential tier)
- ✅ Tier filtering works correctly

**Evidence Required:**
```powershell
# Validate ecosystem config (dry run)
cd $env:LOCALAPPDATA\crypto-mcp\config
pm2 start ecosystem.config.js --dry-run > test-results\tc6-pm2.txt
```

---

### TC-7: CLI Start Command

**Objective:** Verify crypto-mcp start launches MCPs

**Steps:**
1. Run `crypto-mcp start essential`
2. Wait 30 seconds for startup
3. Check PM2 status

**Expected Results:**
- ✅ Command completes without errors
- ✅ 7 MCPs start (Essential tier)
- ✅ All processes show status: "online"

**Evidence Required:**
```powershell
# Start MCPs
crypto-mcp start essential 2>&1 | Tee-Object test-results\tc7-start.log

# Wait and check status
Start-Sleep -Seconds 30
pm2 list > test-results\tc7-status.txt
```

---

### TC-8: CLI Status Command

**Objective:** Verify crypto-mcp status shows running MCPs

**Steps:**
1. Ensure MCPs running (TC-7)
2. Run `crypto-mcp status`

**Expected Results:**
- ✅ Lists all 7 running MCPs
- ✅ Shows uptime, status, CPU, memory
- ✅ No errors or crashes reported

**Evidence Required:**
```powershell
crypto-mcp status > test-results\tc8-status.txt
```

---

### TC-9: Health Check Endpoints

**Objective:** Verify MCPs respond to health checks

**Steps:**
1. Ensure MCPs running (TC-7)
2. Test health endpoints for each MCP

**Expected Results:**
- ✅ Port 3001 (memory-federation): Returns HTTP 200 + JSON
- ✅ Port 3002 (filesystem-federation): Returns HTTP 200 + JSON
- ✅ Port 3003 (github-federation): Returns HTTP 200 + JSON
- ✅ Port 3004 (expert-role-prompt): Returns HTTP 200 + JSON
- ✅ Port 3005 (sequential-thinking): Returns HTTP 200 + JSON
- ✅ Port 3006 (desktop-commander): Returns HTTP 200 + JSON
- ✅ Port 3007 (web-search): Returns HTTP 200 + JSON

**Evidence Required:**
```powershell
# Test each health endpoint
3001..3007 | ForEach-Object {
    try {
        $response = Invoke-WebRequest "http://localhost:$_/health" -UseBasicParsing
        "Port ${_}: HTTP $($response.StatusCode) - OK"
    } catch {
        "Port ${_}: FAILED - $_"
    }
} | Tee-Object test-results\tc9-health.txt
```

---

### TC-10: CLI Logs Command

**Objective:** Verify log viewing functionality

**Steps:**
1. Run `crypto-mcp logs --Lines 20`
2. Check output contains log entries

**Expected Results:**
- ✅ Displays last 20 lines from all MCPs
- ✅ No errors accessing logs
- ✅ Formatted output readable

**Evidence Required:**
```powershell
crypto-mcp logs -Lines 20 > test-results\tc10-logs.txt
```

---

### TC-11: CLI Restart Command

**Objective:** Verify MCPs can be restarted

**Steps:**
1. Run `crypto-mcp restart`
2. Wait 10 seconds
3. Check status

**Expected Results:**
- ✅ All MCPs restart without errors
- ✅ Uptime resets to ~10 seconds
- ✅ All processes show status: "online"

**Evidence Required:**
```powershell
crypto-mcp restart 2>&1 | Tee-Object test-results\tc11-restart.log
Start-Sleep -Seconds 10
pm2 list > test-results\tc11-status.txt
```

---

### TC-12: CLI Stop Command

**Objective:** Verify MCPs can be stopped gracefully

**Steps:**
1. Run `crypto-mcp stop`
2. Wait 5 seconds
3. Check PM2 status

**Expected Results:**
- ✅ All MCPs stop without errors
- ✅ PM2 shows all processes stopped
- ✅ No zombie processes

**Evidence Required:**
```powershell
crypto-mcp stop 2>&1 | Tee-Object test-results\tc12-stop.log
Start-Sleep -Seconds 5
pm2 list > test-results\tc12-status.txt
```

---

### TC-13: Resource Usage

**Objective:** Measure resource consumption

**Steps:**
1. Start MCPs: `crypto-mcp start essential`
2. Wait 5 minutes for stabilization
3. Measure CPU and memory usage

**Expected Results:**
- ✅ Total memory < 1GB (Essential tier target: ~500MB)
- ✅ Per-MCP memory < 150MB
- ✅ CPU < 5% at idle

**Evidence Required:**
```powershell
# Let MCPs stabilize
crypto-mcp start essential
Start-Sleep -Seconds 300

# Measure resources
pm2 monit > test-results\tc13-resources.txt

# Alternative: Task Manager snapshot
Get-Process node | Select-Object Name, CPU, WS |
    Format-Table -AutoSize > test-results\tc13-process.txt
```

---

### TC-14: Startup Time

**Objective:** Measure time to start all MCPs

**Steps:**
1. Stop all MCPs
2. Measure start time

**Expected Results:**
- ✅ All 7 MCPs start within 60 seconds
- ✅ Health checks respond within 30 seconds after start

**Evidence Required:**
```powershell
pm2 delete all

$startTime = Get-Date
crypto-mcp start essential
Start-Sleep -Seconds 30
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

"Startup time: $duration seconds" > test-results\tc14-timing.txt
pm2 list >> test-results\tc14-timing.txt
```

---

### TC-15: Uninstaller

**Objective:** Verify complete removal

**Steps:**
1. Stop all MCPs
2. Run `.\uninstall-native.ps1 -Force`
3. Verify removal

**Expected Results:**
- ✅ All PM2 processes stopped and deleted
- ✅ Installation directory removed
- ✅ PATH entry removed
- ✅ No residual files

**Evidence Required:**
```powershell
.\uninstall-native.ps1 -Force 2>&1 | Tee-Object test-results\tc15-uninstall.log

# Verify cleanup
Test-Path $env:LOCALAPPDATA\crypto-mcp |
    Out-File test-results\tc15-verify.txt -Append
$env:PATH -split ';' | Select-String "crypto-mcp" |
    Out-File test-results\tc15-verify.txt -Append
pm2 list | Out-File test-results\tc15-verify.txt -Append
```

---

## 📊 Test Summary Template

After completing all tests, fill in:

```markdown
# Native Installation Test Results

**Test Date:** YYYY-MM-DD
**Tester:** [Name]
**System:** Windows [Version]

## Test Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-1: Prerequisite Verification | ✅/❌ | |
| TC-2: Directory Structure | ✅/❌ | |
| TC-3: File Installation | ✅/❌ | |
| TC-4: PATH Configuration | ✅/❌ | |
| TC-5: Configuration Wizard | ✅/❌ | |
| TC-6: PM2 Ecosystem Loading | ✅/❌ | |
| TC-7: CLI Start Command | ✅/❌ | |
| TC-8: CLI Status Command | ✅/❌ | |
| TC-9: Health Check Endpoints | ✅/❌ | |
| TC-10: CLI Logs Command | ✅/❌ | |
| TC-11: CLI Restart Command | ✅/❌ | |
| TC-12: CLI Stop Command | ✅/❌ | |
| TC-13: Resource Usage | ✅/❌ | |
| TC-14: Startup Time | ✅/❌ | |
| TC-15: Uninstaller | ✅/❌ | |

## Performance Metrics

- Startup Time: [X] seconds
- Memory Usage (Total): [X] MB
- Memory per MCP: [X] MB average
- CPU Usage (Idle): [X]%

## Issues Found

1. [Issue description]
2. [Issue description]

## Recommendations

1. [Recommendation]
2. [Recommendation]
```

---

## 🚨 Known Limitations (Pre-Testing)

1. **MCP server implementations not included** - Ecosystem config references `lib/` directories that don't exist yet
2. **Health check endpoints** - Actual MCP servers needed to test HTTP responses
3. **Database connectivity** - Requires actual Redis/PostgreSQL setup
4. **API integrations** - Need real API keys to test full functionality

---

## 🎯 Success Criteria

**Phase 4C Native Installation Package is COMPLETE when:**

- ✅ Installer runs without errors on clean Windows system
- ✅ Directory structure created correctly
- ✅ PM2 ecosystem configuration loads without syntax errors
- ✅ CLI commands execute (start, stop, status, logs)
- ✅ Uninstaller removes all components cleanly
- ✅ Documentation accurate and complete

**Note:** Full functional testing requires MCP server implementations (Phase 5 or later).

---

**Test Plan Version:** 1.0
**Created:** 2025-10-01
**Status:** Ready for execution
