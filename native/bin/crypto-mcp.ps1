# Crypto MCP Suite - Main CLI Management Tool
# Version: 0.1.0-alpha

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'config', 'help')]
    [string]$Command = 'help',

    [Parameter(Position=1)]
    [string]$Target,

    [switch]$Follow,
    [switch]$Force,
    [int]$Lines = 50
)

$ErrorActionPreference = "Stop"

# Color output
function Write-Success { param($Msg) Write-Host "✓ $Msg" -ForegroundColor Green }
function Write-Info { param($Msg) Write-Host "ℹ $Msg" -ForegroundColor Cyan }
function Write-Warning { param($Msg) Write-Host "⚠ $Msg" -ForegroundColor Yellow }
function Write-Failure { param($Msg) Write-Host "✗ $Msg" -ForegroundColor Red }

# Installation paths
$installPath = "$env:LOCALAPPDATA\crypto-mcp"
$configPath = "$installPath\config"
$envFile = "$configPath\.env"
$ecosystemConfig = "$configPath\ecosystem.config.js"

# Validate installation
if (-not (Test-Path $installPath)) {
    Write-Failure "Crypto MCP Suite not found at: $installPath"
    Write-Info "Run install-native.ps1 first"
    exit 1
}

# Load environment if exists
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Commands
switch ($Command.ToLower()) {
    'start' {
        Write-Info "Starting Crypto MCP Suite..."

        # Determine profile
        $profile = if ($Target) { $Target } else { $env:INSTALLATION_TIER }
        if (-not $profile) { $profile = "essential" }

        Write-Info "Profile: $profile"

        # Set environment variable for PM2
        $env:INSTALLATION_TIER = $profile
        $env:CRYPTO_MCP_INSTALL_PATH = $installPath

        # Start with PM2
        try {
            Set-Location $configPath
            pm2 start ecosystem.config.js --env production

            Write-Success "MCPs started successfully"
            Write-Info "Check status: crypto-mcp status"
        } catch {
            Write-Failure "Failed to start MCPs: $_"
            exit 1
        }
    }

    'stop' {
        Write-Info "Stopping Crypto MCP Suite..."

        if ($Target) {
            # Stop specific MCP
            try {
                pm2 stop $Target
                Write-Success "Stopped: $Target"
            } catch {
                Write-Failure "Failed to stop $Target: $_"
                exit 1
            }
        } else {
            # Stop all MCPs
            try {
                pm2 stop all
                Write-Success "All MCPs stopped"
            } catch {
                Write-Failure "Failed to stop MCPs: $_"
                exit 1
            }
        }
    }

    'restart' {
        Write-Info "Restarting Crypto MCP Suite..."

        if ($Target) {
            # Restart specific MCP
            try {
                pm2 restart $Target
                Write-Success "Restarted: $Target"
            } catch {
                Write-Failure "Failed to restart $Target: $_"
                exit 1
            }
        } else {
            # Restart all MCPs
            try {
                pm2 restart all
                Write-Success "All MCPs restarted"
            } catch {
                Write-Failure "Failed to restart MCPs: $_"
                exit 1
            }
        }
    }

    'status' {
        Write-Info "Crypto MCP Suite Status:`n"

        try {
            pm2 list
        } catch {
            Write-Failure "Failed to get status: $_"
            Write-Info "Are any MCPs running? Try: crypto-mcp start"
            exit 1
        }
    }

    'logs' {
        if ($Target) {
            # Show specific MCP logs
            if ($Follow) {
                pm2 logs $Target --lines $Lines
            } else {
                pm2 logs $Target --lines $Lines --nostream
            }
        } else {
            # Show all logs
            if ($Follow) {
                pm2 logs --lines $Lines
            } else {
                pm2 logs --lines $Lines --nostream
            }
        }
    }

    'config' {
        Write-Info "Running configuration wizard..."

        if (Test-Path "$installPath\config-wizard.ps1") {
            & "$installPath\config-wizard.ps1"
        } else {
            Write-Warning "Config wizard not found. Editing .env manually:"
            Write-Info "File: $envFile"

            if ($env:EDITOR) {
                & $env:EDITOR $envFile
            } else {
                notepad $envFile
            }
        }
    }

    'help' {
        Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         CRYPTO MCP SUITE - CLI REFERENCE                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

USAGE:
    crypto-mcp <command> [options]

COMMANDS:
    start [profile]         Start MCPs (profiles: essential, enhanced, advanced, full)
    stop [mcp-name]         Stop all MCPs or specific MCP
    restart [mcp-name]      Restart all MCPs or specific MCP
    status                  Show running MCPs with health and uptime
    logs [mcp-name] [-f]    View logs (use -f to follow live)
    config                  Run configuration wizard
    help                    Show this help message

EXAMPLES:
    # Start all MCPs in essential tier
    crypto-mcp start

    # Start MCPs in enhanced tier
    crypto-mcp start enhanced

    # Stop all MCPs
    crypto-mcp stop

    # Stop specific MCP
    crypto-mcp stop memory-federation

    # Restart all MCPs
    crypto-mcp restart

    # Show status of all MCPs
    crypto-mcp status

    # View all logs (last 50 lines)
    crypto-mcp logs

    # Follow logs in real-time
    crypto-mcp logs -Follow

    # View specific MCP logs
    crypto-mcp logs memory-federation -Lines 100

    # Run configuration wizard
    crypto-mcp config

INSTALLATION TIERS:
    essential (7 MCPs)      Core functionality only
    enhanced (15 MCPs)      Essential + advanced tools
    advanced (21 MCPs)      Enhanced + database MCPs
    full (25 MCPs)          All MCPs including premium features

PM2 COMMANDS (Advanced):
    pm2 list                Detailed process list
    pm2 monit               Real-time monitoring dashboard
    pm2 logs                All logs with formatting
    pm2 describe <name>     Detailed MCP information
    pm2 delete all          Remove all MCPs from PM2

FILES:
    Config: $envFile
    PM2:    $ecosystemConfig
    Logs:   $installPath\logs\

DOCUMENTATION:
    README: $installPath\README.md
    Online: https://github.com/your-repo/crypto-mcp-suite

"@ -ForegroundColor White
    }

    default {
        Write-Failure "Unknown command: $Command"
        Write-Info "Run 'crypto-mcp help' for usage"
        exit 1
    }
}
