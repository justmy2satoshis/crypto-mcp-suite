# Crypto MCP Suite - Uninstaller
# Complete removal of native installation

param(
    [switch]$Force,
    [switch]$KeepData
)

$ErrorActionPreference = "Stop"

function Write-Success { param($Msg) Write-Host "✓ $Msg" -ForegroundColor Green }
function Write-Info { param($Msg) Write-Host "ℹ $Msg" -ForegroundColor Cyan }
function Write-Warning { param($Msg) Write-Host "⚠ $Msg" -ForegroundColor Yellow }
function Write-Failure { param($Msg) Write-Host "✗ $Msg" -ForegroundColor Red }

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         CRYPTO MCP SUITE - UNINSTALLER                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Red

$installPath = "$env:LOCALAPPDATA\crypto-mcp"

if (-not (Test-Path $installPath)) {
    Write-Info "Crypto MCP Suite not installed at: $installPath"
    exit 0
}

# Confirm uninstall
if (-not $Force) {
    Write-Warning "This will remove Crypto MCP Suite and all configuration."
    if ($KeepData) {
        Write-Info "User data will be preserved (--KeepData flag set)"
    } else {
        Write-Warning "All data will be deleted!"
    }

    $confirm = Read-Host "`nAre you sure you want to uninstall? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Info "Uninstall cancelled"
        exit 0
    }
}

# Step 1: Stop all PM2 processes
Write-Info "Stopping all MCPs..."
try {
    pm2 stop all 2>&1 | Out-Null
    Write-Success "All MCPs stopped"
} catch {
    Write-Warning "No MCPs running or PM2 not found"
}

# Step 2: Delete PM2 processes
Write-Info "Removing MCPs from PM2..."
try {
    pm2 delete all 2>&1 | Out-Null
    Write-Success "MCPs removed from PM2"
} catch {
    Write-Warning "Could not remove from PM2"
}

# Step 3: Clean PM2 process list
Write-Info "Cleaning PM2 process list..."
try {
    pm2 save --force 2>&1 | Out-Null
    Write-Success "PM2 process list cleaned"
} catch {
    Write-Warning "Could not save PM2 state"
}

# Step 4: Remove from PATH
Write-Info "Removing from PATH..."
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -like "*$installPath\bin*") {
    $newPath = ($currentPath -split ';' | Where-Object { $_ -notlike "*$installPath\bin*" }) -join ';'
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Success "Removed from user PATH"
} else {
    Write-Info "Not in PATH"
}

# Step 5: Backup data if requested
if ($KeepData) {
    $backupPath = "$env:LOCALAPPDATA\crypto-mcp-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Info "Backing up data to: $backupPath"

    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

    if (Test-Path "$installPath\data") {
        Copy-Item "$installPath\data" -Destination "$backupPath\data" -Recurse -Force
        Write-Success "Data backed up"
    }

    if (Test-Path "$installPath\config\.env") {
        Copy-Item "$installPath\config\.env" -Destination "$backupPath\.env" -Force
        Write-Success "Configuration backed up"
    }
}

# Step 6: Remove installation directory
Write-Info "Removing installation directory..."
try {
    Remove-Item -Path $installPath -Recurse -Force
    Write-Success "Installation directory removed"
} catch {
    Write-Failure "Failed to remove directory: $_"
    Write-Warning "You may need to remove manually: $installPath"
    exit 1
}

# Uninstall complete
Write-Host ""
Write-Success "Crypto MCP Suite uninstalled successfully!"
Write-Host ""

if ($KeepData) {
    Write-Info "Your data has been backed up to: $backupPath"
}

Write-Info "To reinstall, run: .\install-native.ps1"
Write-Host ""
