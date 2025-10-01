# Crypto MCP Suite - Native Installation Script (Windows)
# Version: 0.1.0-alpha
# Platform: Windows 10/11 with PowerShell 5.1+
# Prerequisites: Node.js 20+, Redis, PostgreSQL

param(
    [switch]$SkipChecks,
    [switch]$Force,
    [string]$InstallPath = "$env:LOCALAPPDATA\crypto-mcp"
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Header { param($Message) Write-Host "`n═══ $Message ═══`n" -ForegroundColor Magenta }

# Banner
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         CRYPTO MCP SUITE - NATIVE INSTALLATION           ║
║                                                           ║
║         Version: 0.1.0-alpha (Windows-First)             ║
║         Installation Type: User-Level (No Admin)         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Info "Installation path: $InstallPath"
Write-Info "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Phase 1: Prerequisite Verification
Write-Header "Phase 1: Prerequisite Verification"

# Check Node.js
Write-Info "Checking Node.js installation..."
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Node.js not found in PATH" }

    # Parse version (format: v20.18.1)
    $versionMatch = $nodeVersion -match 'v(\d+)\.(\d+)\.(\d+)'
    if (-not $versionMatch) { throw "Unable to parse Node.js version: $nodeVersion" }

    $majorVersion = [int]$matches[1]
    $minorVersion = [int]$matches[2]
    $patchVersion = [int]$matches[3]

    Write-Success "Node.js detected: $nodeVersion"

    if ($majorVersion -lt 20) {
        Write-Failure "Node.js version $nodeVersion is below minimum required (20.0.0)"
        Write-Warning "Please install Node.js 20+ from: https://nodejs.org/"
        exit 1
    }

    Write-Success "Node.js version meets requirements (>= 20.0.0)"
} catch {
    Write-Failure "Node.js check failed: $_"
    Write-Warning "Please install Node.js 20+ from: https://nodejs.org/"
    exit 1
}

# Check npm
Write-Info "Checking npm installation..."
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "npm not found" }
    Write-Success "npm detected: v$npmVersion"
} catch {
    Write-Failure "npm check failed: $_"
    exit 1
}

# Check PM2
Write-Info "Checking PM2 installation..."
$pm2Installed = $false
try {
    $pm2Version = pm2 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pm2Installed = $true
        Write-Success "PM2 detected: v$pm2Version"
    }
} catch {
    # PM2 not installed yet
}

if (-not $pm2Installed) {
    Write-Warning "PM2 not installed - installing globally..."
    Write-Info "Running: npm install -g pm2"

    try {
        npm install -g pm2
        if ($LASTEXITCODE -ne 0) { throw "PM2 installation failed" }

        # Verify installation
        $pm2Version = pm2 --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "PM2 verification failed" }

        Write-Success "PM2 installed successfully: v$pm2Version"
    } catch {
        Write-Failure "PM2 installation failed: $_"
        Write-Warning "Try manually: npm install -g pm2"
        exit 1
    }
}

# Check Redis (optional but recommended)
Write-Info "Checking Redis installation..."
$redisPath = "C:\Program Files\Redis\redis-cli.exe"
if (Test-Path $redisPath) {
    try {
        $redisPing = & $redisPath ping 2>&1
        if ($redisPing -eq "PONG") {
            Write-Success "Redis is installed and running"
        } else {
            Write-Warning "Redis is installed but may not be running"
        }
    } catch {
        Write-Warning "Redis found but connectivity test failed"
    }
} else {
    Write-Warning "Redis not detected at standard location"
    Write-Info "MCPs will work with reduced caching. Install Redis for best performance."
}

# Check PostgreSQL (optional but recommended)
Write-Info "Checking PostgreSQL installation..."
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
if (Test-Path $psqlPath) {
    Write-Success "PostgreSQL is installed (C:\Program Files\PostgreSQL\17\)"
} else {
    # Try to find any PostgreSQL version
    $pgFound = Get-ChildItem "C:\Program Files\PostgreSQL" -ErrorAction SilentlyContinue
    if ($pgFound) {
        Write-Success "PostgreSQL is installed (version detected)"
    } else {
        Write-Warning "PostgreSQL not detected at standard location"
        Write-Info "Some MCPs require PostgreSQL. Install for full functionality."
    }
}

# Phase 2: Directory Structure Creation
Write-Header "Phase 2: Directory Structure Creation"

if (Test-Path $InstallPath) {
    if ($Force) {
        Write-Warning "Installation directory exists. Force flag set - removing..."
        Remove-Item -Path $InstallPath -Recurse -Force
        Write-Success "Existing installation removed"
    } else {
        Write-Failure "Installation directory already exists: $InstallPath"
        Write-Info "Use -Force to overwrite existing installation"
        exit 1
    }
}

Write-Info "Creating directory structure at: $InstallPath"

$directories = @(
    "$InstallPath\bin",
    "$InstallPath\lib",
    "$InstallPath\config",
    "$InstallPath\logs",
    "$InstallPath\data",
    "$InstallPath\tmp"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Success "Created: $($dir.Replace($InstallPath, '.'))"
}

# Phase 3: File Installation
Write-Header "Phase 3: File Installation"

$sourceDir = Split-Path -Parent $PSCommandPath
Write-Info "Source directory: $sourceDir"

# Copy bin scripts
Write-Info "Installing management scripts..."
$binFiles = Get-ChildItem "$sourceDir\bin\*.ps1" -ErrorAction SilentlyContinue
if ($binFiles) {
    foreach ($file in $binFiles) {
        Copy-Item $file.FullName -Destination "$InstallPath\bin\" -Force
        Write-Success "Installed: bin\$($file.Name)"
    }
} else {
    Write-Warning "No bin scripts found - will create basic scripts"
}

# Copy config templates
Write-Info "Installing configuration templates..."
if (Test-Path "$sourceDir\config\.env.template") {
    Copy-Item "$sourceDir\config\.env.template" -Destination "$InstallPath\config\" -Force
    Write-Success "Installed: config\.env.template"
}

if (Test-Path "$sourceDir\config\ecosystem.config.js") {
    Copy-Item "$sourceDir\config\ecosystem.config.js" -Destination "$InstallPath\config\" -Force
    Write-Success "Installed: config\ecosystem.config.js"
}

# Create default .env if template exists
if (Test-Path "$InstallPath\config\.env.template") {
    if (-not (Test-Path "$InstallPath\config\.env")) {
        Copy-Item "$InstallPath\config\.env.template" -Destination "$InstallPath\config\.env" -Force
        Write-Success "Created default .env from template"
    }
}

# Phase 4: Environment Configuration
Write-Header "Phase 4: Environment Configuration"

Write-Info "Adding Crypto MCP Suite to PATH..."

# Get current user PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Check if already in PATH
if ($currentPath -notlike "*$InstallPath\bin*") {
    $newPath = "$currentPath;$InstallPath\bin"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Success "Added to user PATH: $InstallPath\bin"
    Write-Warning "Restart your terminal for PATH changes to take effect"
} else {
    Write-Info "Already in PATH"
}

# Create installation metadata
$metadata = @{
    version = "0.1.0-alpha"
    installed_at = Get-Date -Format 'o'
    install_path = $InstallPath
    node_version = $nodeVersion
    npm_version = $npmVersion
    pm2_version = $pm2Version
    platform = "Windows"
    os_version = [System.Environment]::OSVersion.VersionString
} | ConvertTo-Json -Depth 10

$metadata | Out-File "$InstallPath\config\installation.json" -Encoding UTF8
Write-Success "Created installation metadata"

# Phase 5: PM2 Setup
Write-Header "Phase 5: PM2 Setup"

Write-Info "Initializing PM2 process manager..."

# Save PM2 configuration
if (Test-Path "$InstallPath\config\ecosystem.config.js") {
    Write-Info "PM2 ecosystem configuration detected"

    # Set PM2_HOME to installation directory
    [Environment]::SetEnvironmentVariable("PM2_HOME", "$InstallPath\data\.pm2", "User")
    Write-Success "Set PM2_HOME: $InstallPath\data\.pm2"
} else {
    Write-Warning "No ecosystem.config.js found - will need to run configuration wizard"
}

# Installation Complete
Write-Header "Installation Complete"

Write-Success "Crypto MCP Suite installed successfully!"
Write-Host ""
Write-Info "Installation Summary:"
Write-Host "  📁 Location: $InstallPath" -ForegroundColor White
Write-Host "  🔧 Node.js: $nodeVersion" -ForegroundColor White
Write-Host "  📦 npm: v$npmVersion" -ForegroundColor White
Write-Host "  🚀 PM2: v$pm2Version" -ForegroundColor White
Write-Host ""

Write-Info "Next Steps:"
Write-Host "  1. Restart your terminal to refresh PATH" -ForegroundColor Yellow
Write-Host "  2. Run configuration wizard: .\config-wizard.ps1" -ForegroundColor Yellow
Write-Host "  3. Start MCPs: crypto-mcp start" -ForegroundColor Yellow
Write-Host "  4. Check status: crypto-mcp status" -ForegroundColor Yellow
Write-Host ""

Write-Info "Documentation:"
Write-Host "  📖 Installation Guide: README.md" -ForegroundColor White
Write-Host "  📖 CLI Reference: crypto-mcp --help" -ForegroundColor White
Write-Host "  📖 Configuration: $InstallPath\config\.env" -ForegroundColor White
Write-Host ""

Write-Success "Installation completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
