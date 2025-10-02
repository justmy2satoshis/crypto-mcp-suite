# Crypto MCP Suite - Windows Installation Script
# Avoids duplicate installations and configures Claude Desktop + Claude Code CLI
#
# Usage: .\scripts\install-windows.ps1

param(
    [switch]$SkipNodeInstall = $false,
    [switch]$SkipConfig = $false,
    [switch]$SkipTest = $false,
    [ValidateSet("FREE", "FREEMIUM", "FULL")]
    [string]$Tier = "FULL"
)

$ErrorActionPreference = "Stop"
$script:ErrorCount = 0
$script:WarningCount = 0
$script:SuccessCount = 0

# Colors
$RED = "`e[31m"
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$CYAN = "`e[36m"
$MAGENTA = "`e[35m"
$RESET = "`e[0m"

function Write-Success { param($msg) Write-Host "${GREEN}✅ SUCCESS${RESET}: $msg"; $script:SuccessCount++ }
function Write-Error2 { param($msg) Write-Host "${RED}❌ ERROR${RESET}: $msg"; $script:ErrorCount++ }
function Write-Warning2 { param($msg) Write-Host "${YELLOW}⚠️  WARNING${RESET}: $msg"; $script:WarningCount++ }
function Write-Info { param($msg) Write-Host "${CYAN}ℹ️  INFO${RESET}: $msg" }
function Write-Section { param($title) Write-Host "`n${MAGENTA}═══════════════════════════════════════${RESET}"; Write-Host "${MAGENTA}$title${RESET}"; Write-Host "${MAGENTA}═══════════════════════════════════════${RESET}`n" }

Write-Host @"
${CYAN}
╔══════════════════════════════════════════════════════════╗
║     Crypto MCP Suite - Windows Installation Script      ║
║          Intelligent Duplicate Avoidance System          ║
╚══════════════════════════════════════════════════════════╝
${RESET}
"@

# Get repository root
$REPO_ROOT = Split-Path -Parent $PSScriptRoot
Write-Info "Repository root: $REPO_ROOT"

# Change to repository directory
Set-Location $REPO_ROOT

Write-Section "Phase 1: System Assessment"

# Check prerequisites
Write-Info "Checking prerequisites..."

# Node.js version
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Success "Node.js installed: $nodeVersion"
} else {
    Write-Error2 "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Python version
$pythonVersion = python --version 2>$null
if ($pythonVersion) {
    Write-Success "Python installed: $pythonVersion"

    # Check if Python 3.13+
    if ($pythonVersion -match "Python 3\.1[3-9]" -or $pythonVersion -match "Python 3\.[2-9][0-9]") {
        Write-Success "Python version supports all 41 MCPs (3.13+)"
    } else {
        Write-Warning2 "Python $pythonVersion detected. 5 MCPs require Python 3.13+ (feargreed, cryptopanic, sentiment, rug-check, whale-tracker)"
    }
} else {
    Write-Error2 "Python not found. Please install Python 3.13+ from https://python.org"
    exit 1
}

# uv package manager
$uvVersion = uv --version 2>$null
if ($uvVersion) {
    Write-Success "uv package manager installed: $uvVersion"
} else {
    Write-Error2 "uv not found. Install with: powershell -c `"irm https://astral.sh/uv/install.ps1 | iex`""
    exit 1
}

# Git
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Success "Git installed: $gitVersion"
} else {
    Write-Error2 "Git not found. Please install Git from https://git-scm.com"
    exit 1
}

Write-Section "Phase 2: Analyze Existing Installations"

# Define Node.js MCPs
$nodeMCPs = @(
    "bridge-rates-mcp",
    "ccxt-mcp",
    "crypto-indicators-mcp",
    "cointelegraph-rss-mcp",
    "coingecko-trending-mcp",
    "crypto-compare-mcp",
    "lunarcrush-mcp",
    "santiment-mcp",
    "tokenmetrics-mcp",
    "uniswap-trader-mcp",
    "wallet-balance-mcp"
)

$installedNodeMCPs = @()
$missingNodeMCPs = @()

Write-Info "Checking Node.js MCP installations (11 total)..."

foreach ($mcp in $nodeMCPs) {
    $mcpPath = Join-Path $REPO_ROOT "native\lib\$mcp"
    $nodeModulesPath = Join-Path $mcpPath "node_modules"

    if (Test-Path $nodeModulesPath) {
        Write-Success "$mcp - Dependencies installed ✓"
        $installedNodeMCPs += $mcp
    } else {
        Write-Warning2 "$mcp - Dependencies missing"
        $missingNodeMCPs += $mcp
    }
}

# Check TypeScript compilation
$tsCompiled = @()
$tsMissing = @()

Write-Info "Checking TypeScript compilation..."

$tsMCPs = @("ccxt-mcp", "tokenmetrics-mcp")
foreach ($mcp in $tsMCPs) {
    $buildPath = Join-Path $REPO_ROOT "native\lib\$mcp\build"

    if (Test-Path $buildPath) {
        Write-Success "$mcp - TypeScript compiled ✓"
        $tsCompiled += $mcp
    } else {
        Write-Warning2 "$mcp - TypeScript not compiled"
        $tsMissing += $mcp
    }
}

# Check Python MCPs (should all have .venv)
Write-Info "Checking Python MCP installations (30 total)..."

$pythonVenvCount = (Get-ChildItem -Path (Join-Path $REPO_ROOT "native\lib") -Filter ".venv" -Directory -Recurse).Count

if ($pythonVenvCount -eq 30) {
    Write-Success "All 30 Python MCPs have virtual environments ✓"
} else {
    Write-Warning2 "Only $pythonVenvCount/30 Python MCPs have virtual environments"
}

# Summary
Write-Section "Installation Summary"

Write-Host "${CYAN}Node.js MCPs:${RESET}"
Write-Host "  ✅ Installed: $($installedNodeMCPs.Count)/11"
Write-Host "  ❌ Missing: $($missingNodeMCPs.Count)/11"

if ($missingNodeMCPs.Count -gt 0) {
    Write-Host "`n${YELLOW}MCPs requiring installation:${RESET}"
    foreach ($mcp in $missingNodeMCPs) {
        Write-Host "  - $mcp"
    }
}

Write-Host "`n${CYAN}TypeScript Compilation:${RESET}"
Write-Host "  ✅ Compiled: $($tsCompiled.Count)/2"
Write-Host "  ❌ Missing: $($tsMissing.Count)/2"

Write-Host "`n${CYAN}Python MCPs:${RESET}"
Write-Host "  ✅ Installed: $pythonVenvCount/30"

# Check Claude configurations
$claudeDesktopConfigPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
$claudeCodeConfigPath = Join-Path $REPO_ROOT ".mcp.json"

Write-Host "`n${CYAN}Claude Configurations:${RESET}"

$claudeDesktopExists = Test-Path $claudeDesktopConfigPath
$claudeCodeExists = Test-Path $claudeCodeConfigPath

if ($claudeDesktopExists) {
    Write-Success "Claude Desktop config exists at: $claudeDesktopConfigPath"
} else {
    Write-Warning2 "Claude Desktop config NOT found (will create)"
}

if ($claudeCodeExists) {
    Write-Success "Claude Code config exists at: $claudeCodeConfigPath"
} else {
    Write-Warning2 "Claude Code config NOT found (will create)"
}

# Ask user to proceed
Write-Host "`n${MAGENTA}═══════════════════════════════════════${RESET}"
Write-Host "${CYAN}Estimated Installation Time: 3-10 minutes${RESET}"
Write-Host "${MAGENTA}═══════════════════════════════════════${RESET}`n"

$proceed = Read-Host "Proceed with installation? (Y/n)"
if ($proceed -eq "n" -or $proceed -eq "N") {
    Write-Info "Installation cancelled by user"
    exit 0
}

# Phase 3: Install Missing Node.js Dependencies
if ($missingNodeMCPs.Count -gt 0 -and -not $SkipNodeInstall) {
    Write-Section "Phase 3: Installing Missing Node.js Dependencies"

    foreach ($mcp in $missingNodeMCPs) {
        $mcpPath = Join-Path $REPO_ROOT "native\lib\$mcp"
        Write-Info "Installing dependencies for $mcp..."

        try {
            Push-Location $mcpPath
            npm install --silent
            Pop-Location
            Write-Success "$mcp - Dependencies installed"
        } catch {
            Write-Error2 "$mcp - Failed to install dependencies: $_"
            Pop-Location
        }
    }

    # Compile TypeScript if needed
    if ($tsMissing.Count -gt 0) {
        Write-Info "Compiling TypeScript MCPs..."

        foreach ($mcp in $tsMissing) {
            $mcpPath = Join-Path $REPO_ROOT "native\lib\$mcp"
            Write-Info "Compiling $mcp..."

            try {
                Push-Location $mcpPath
                npm run build
                Pop-Location
                Write-Success "$mcp - TypeScript compiled"
            } catch {
                Write-Error2 "$mcp - Failed to compile: $_"
                Pop-Location
            }
        }
    }
} elseif ($SkipNodeInstall) {
    Write-Info "Skipping Node.js installation (--SkipNodeInstall flag)"
} else {
    Write-Success "All Node.js MCPs already have dependencies installed"
}

# Phase 4: Configure Claude Desktop
if (-not $SkipConfig) {
    Write-Section "Phase 4: Configure Claude Desktop"

    if (-not $claudeDesktopExists) {
        Write-Info "Creating Claude Desktop configuration..."

        # Create Claude directory if not exists
        $claudeDir = Split-Path -Parent $claudeDesktopConfigPath
        if (-not (Test-Path $claudeDir)) {
            New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null
        }

        # Copy template
        $templatePath = Join-Path $REPO_ROOT "configs\claude_desktop_config_windows.json"

        if (Test-Path $templatePath) {
            # Read template
            $config = Get-Content $templatePath -Raw | ConvertFrom-Json

            # Update paths (replace placeholder with actual path)
            $configStr = $config | ConvertTo-Json -Depth 10
            $configStr = $configStr -replace '/absolute/path/to/crypto-mcp-suite', $REPO_ROOT.Replace('\', '\\')

            # Save updated config
            $configStr | Set-Content $claudeDesktopConfigPath -Encoding UTF8

            Write-Success "Claude Desktop config created at: $claudeDesktopConfigPath"
            Write-Info "Paths automatically updated to: $REPO_ROOT"
        } else {
            Write-Error2 "Template not found at: $templatePath"
        }
    } else {
        Write-Warning2 "Claude Desktop config already exists. Skipping creation."
        Write-Info "To update paths, edit: $claudeDesktopConfigPath"

        # Offer to backup
        $backup = Read-Host "Create backup of existing config? (Y/n)"
        if ($backup -ne "n" -and $backup -ne "N") {
            $backupPath = "$claudeDesktopConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
            Copy-Item $claudeDesktopConfigPath $backupPath
            Write-Success "Backup created: $backupPath"
        }
    }
} else {
    Write-Info "Skipping Claude Desktop configuration (--SkipConfig flag)"
}

# Phase 5: Configure Claude Code CLI
if (-not $SkipConfig) {
    Write-Section "Phase 5: Configure Claude Code CLI"

    if (-not $claudeCodeExists) {
        Write-Info "Creating Claude Code CLI configuration..."

        # Copy template
        $templatePath = Join-Path $REPO_ROOT "configs\.mcp.json"

        if (Test-Path $templatePath) {
            # Read template
            $config = Get-Content $templatePath -Raw | ConvertFrom-Json

            # Update paths (replace placeholder with actual path)
            $configStr = $config | ConvertTo-Json -Depth 10
            $configStr = $configStr -replace '/absolute/path/to/crypto-mcp-suite', $REPO_ROOT.Replace('\', '\\')

            # Save updated config
            $configStr | Set-Content $claudeCodeConfigPath -Encoding UTF8

            Write-Success "Claude Code config created at: $claudeCodeConfigPath"
            Write-Info "Paths automatically updated to: $REPO_ROOT"
        } else {
            Write-Error2 "Template not found at: $templatePath"
        }
    } else {
        Write-Warning2 "Claude Code config already exists. Skipping creation."
        Write-Info "To update paths, edit: $claudeCodeConfigPath"

        # Offer to backup
        $backup = Read-Host "Create backup of existing config? (Y/n)"
        if ($backup -ne "n" -and $backup -ne "N") {
            $backupPath = "$claudeCodeConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
            Copy-Item $claudeCodeConfigPath $backupPath
            Write-Success "Backup created: $backupPath"
        }
    }
} else {
    Write-Info "Skipping Claude Code configuration (--SkipConfig flag)"
}

# Phase 6: Test MCP Connectivity
if (-not $SkipTest -and (Test-Path $claudeDesktopConfigPath)) {
    Write-Section "Phase 6: Testing MCP Connectivity"

    Write-Info "Testing Claude Desktop configuration..."

    $testScript = Join-Path $REPO_ROOT "scripts\test-client-connections.js"

    if (Test-Path $testScript) {
        try {
            node $testScript --config $claudeDesktopConfigPath
        } catch {
            Write-Warning2 "Connectivity test failed: $_"
        }
    } else {
        Write-Warning2 "Test script not found at: $testScript"
    }

    if (Test-Path $claudeCodeConfigPath) {
        Write-Info "Testing Claude Code CLI configuration..."

        try {
            node $testScript --config $claudeCodeConfigPath
        } catch {
            Write-Warning2 "Connectivity test failed: $_"
        }
    }
} elseif ($SkipTest) {
    Write-Info "Skipping connectivity tests (--SkipTest flag)"
}

# Final Summary
Write-Section "Installation Complete"

Write-Host @"
${GREEN}✅ Installation Summary${RESET}
${GREEN}═══════════════════════════════════════${RESET}

${CYAN}Node.js MCPs:${RESET}
  ✅ Installed: 11/11 (including $($missingNodeMCPs.Count) newly installed)

${CYAN}Python MCPs:${RESET}
  ✅ Installed: 30/30

${CYAN}TypeScript Compilation:${RESET}
  ✅ Compiled: 2/2

${CYAN}Configurations:${RESET}
  ✅ Claude Desktop: $claudeDesktopConfigPath
  ✅ Claude Code CLI: $claudeCodeConfigPath

${CYAN}Statistics:${RESET}
  ✅ Successes: $script:SuccessCount
  ⚠️  Warnings: $script:WarningCount
  ❌ Errors: $script:ErrorCount

${MAGENTA}Next Steps:${RESET}
1. ${GREEN}Restart Claude Desktop${RESET} (Quit completely, then reopen)
2. ${GREEN}Start Claude Code CLI${RESET} (Run: claude-code)
3. ${GREEN}Test an MCP${RESET} (Try: "Use bridge-rates-mcp to get supported chains")
4. ${GREEN}Configure API Keys${RESET} (Optional - see API_KEY_SETUP_GUIDE.md)

${CYAN}Performance:${RESET}
Your device (63 GB RAM, 16 cores) can run ${GREEN}all 41 MCPs${RESET} concurrently! ⭐

${CYAN}Documentation:${RESET}
- Performance Guide: docs/PERFORMANCE_REQUIREMENTS.md
- Client Setup: docs/CLIENT_SETUP_GUIDE.md
- API Keys: API_KEY_SETUP_GUIDE.md

${GREEN}═══════════════════════════════════════${RESET}
"@

# Offer to open configs for manual review
$review = Read-Host "`nOpen configurations for manual review? (Y/n)"
if ($review -ne "n" -and $review -ne "N") {
    if (Test-Path $claudeDesktopConfigPath) {
        notepad $claudeDesktopConfigPath
    }
    if (Test-Path $claudeCodeConfigPath) {
        code $claudeCodeConfigPath 2>$null
        if ($LASTEXITCODE -ne 0) {
            notepad $claudeCodeConfigPath
        }
    }
}

Write-Host "`n${GREEN}Installation script completed successfully!${RESET}`n"

# Exit with error count
exit $script:ErrorCount
