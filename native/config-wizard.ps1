# Crypto MCP Suite - Configuration Wizard
# Interactive setup for first-time configuration

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Header { param($Message) Write-Host "`n═══ $Message ═══`n" -ForegroundColor Magenta }

# Banner
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║      CRYPTO MCP SUITE - CONFIGURATION WIZARD             ║
║                                                           ║
║      Let's set up your MCP environment                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Determine installation path
$installPath = "$env:LOCALAPPDATA\crypto-mcp"
if (-not (Test-Path $installPath)) {
    $installPath = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
}

$envFile = "$installPath\config\.env"
$envTemplate = "$installPath\config\.env.template"

Write-Info "Configuration file: $envFile"

# Step 1: Installation Tier
Write-Header "Step 1: Installation Tier Selection"

Write-Host @"
Choose your installation tier:

  1. ESSENTIAL (7 MCPs) - Core functionality only
     Memory, Filesystem, GitHub, Expert Role, Sequential Thinking, Desktop Commander, Web Search

  2. ENHANCED (15 MCPs) - Essential + Enhanced tools
     Adds: Context7, Perplexity, Playwright, Notion, Git Ops, Converse, GitHub Manager, Brave Search

  3. ADVANCED (21 MCPs) - Enhanced + Database MCPs
     Adds: DuckDB, PostgreSQL Pro, Kafka, MongoDB, Redis, SQLite

  4. PREMIUM/FULL (25 MCPs) - All MCPs including premium features
     Adds: Kimi K2 Code Context, Kimi K2 Resilient, RAG Context, Crypto Analytics

"@ -ForegroundColor White

$tierChoice = Read-Host "Select tier (1-4) [default: 1]"
if ([string]::IsNullOrWhiteSpace($tierChoice)) { $tierChoice = "1" }

$tier = switch ($tierChoice) {
    "1" { "essential" }
    "2" { "enhanced" }
    "3" { "advanced" }
    "4" { "full" }
    default { "essential" }
}

Write-Success "Selected tier: $tier"

# Step 2: Database Configuration
Write-Header "Step 2: Database Configuration"

Write-Info "Testing database connectivity..."

# Test Redis
$redisHost = "localhost"
$redisPort = 6379
$redisAvailable = $false

$redisPath = "C:\Program Files\Redis\redis-cli.exe"
if (Test-Path $redisPath) {
    try {
        $redisPing = & $redisPath ping 2>&1
        if ($redisPing -eq "PONG") {
            $redisAvailable = $true
            Write-Success "Redis: Connected (localhost:6379)"
        }
    } catch {
        Write-Warning "Redis: Found but not responding"
    }
} else {
    Write-Warning "Redis: Not found at standard location"
}

if (-not $redisAvailable) {
    Write-Host "Redis configuration:"
    $customRedis = Read-Host "Use custom Redis host? (y/N)"
    if ($customRedis -eq "y") {
        $redisHost = Read-Host "Redis host [localhost]"
        if ([string]::IsNullOrWhiteSpace($redisHost)) { $redisHost = "localhost" }
        $redisPort = Read-Host "Redis port [6379]"
        if ([string]::IsNullOrWhiteSpace($redisPort)) { $redisPort = 6379 }
    }
}

# Test PostgreSQL
$pgHost = "localhost"
$pgPort = 5432
$pgUser = "postgres"
$pgDb = "crypto_mcp_suite"
$pgAvailable = $false

$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
if (Test-Path $psqlPath) {
    $pgAvailable = $true
    Write-Success "PostgreSQL: Found (C:\Program Files\PostgreSQL\17\)"
} else {
    Write-Warning "PostgreSQL: Not found at standard location"
}

if ($pgAvailable) {
    Write-Host "PostgreSQL configuration:"
    $pgUser = Read-Host "PostgreSQL user [postgres]"
    if ([string]::IsNullOrWhiteSpace($pgUser)) { $pgUser = "postgres" }

    $pgDb = Read-Host "Database name [crypto_mcp_suite]"
    if ([string]::IsNullOrWhiteSpace($pgDb)) { $pgDb = "crypto_mcp_suite" }

    $pgPassword = Read-Host "PostgreSQL password (leave empty if none)" -AsSecureString
    $pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
    )
}

# Step 3: API Keys (Optional)
Write-Header "Step 3: API Keys (Optional)"

Write-Info "You can add API keys now or later by editing $envFile"
Write-Host ""

$apiKeys = @{}

if ($tier -ne "essential") {
    Write-Host "GitHub Token (for GitHub Federation MCP):" -ForegroundColor Yellow
    $githubToken = Read-Host "Enter GitHub token (or press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($githubToken)) {
        $apiKeys["GITHUB_TOKEN"] = $githubToken
    }

    Write-Host "`nBrave API Key (for Web Search MCP):" -ForegroundColor Yellow
    $braveKey = Read-Host "Enter Brave API key (or press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($braveKey)) {
        $apiKeys["BRAVE_API_KEY"] = $braveKey
    }
}

if ($tier -in @("enhanced", "advanced", "full")) {
    Write-Host "`nAnthropic API Key (for Converse Enhanced MCP):" -ForegroundColor Yellow
    $anthropicKey = Read-Host "Enter Anthropic API key (or press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($anthropicKey)) {
        $apiKeys["ANTHROPIC_API_KEY"] = $anthropicKey
    }

    Write-Host "`nPerplexity API Key (for Perplexity MCP):" -ForegroundColor Yellow
    $perplexityKey = Read-Host "Enter Perplexity API key (or press Enter to skip)"
    if (-not [string]::IsNullOrWhiteSpace($perplexityKey)) {
        $apiKeys["PERPLEXITY_API_KEY"] = $perplexityKey
    }
}

# Step 4: Generate Configuration
Write-Header "Step 4: Generating Configuration"

Write-Info "Reading template..."
if (-not (Test-Path $envTemplate)) {
    Write-Warning "Template not found: $envTemplate"
    Write-Warning "Creating minimal configuration..."
    $envContent = @"
# Crypto MCP Suite - Generated Configuration
# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

INSTALLATION_TIER=$tier
LOG_LEVEL=info

# Redis
REDIS_HOST=$redisHost
REDIS_PORT=$redisPort

# PostgreSQL
POSTGRES_HOST=$pgHost
POSTGRES_PORT=$pgPort
POSTGRES_DB=$pgDb
POSTGRES_USER=$pgUser
POSTGRES_PASSWORD=$pgPasswordPlain

NODE_ENV=production
"@
} else {
    $envContent = Get-Content $envTemplate -Raw

    # Replace tier
    $envContent = $envContent -replace 'INSTALLATION_TIER=\w+', "INSTALLATION_TIER=$tier"

    # Replace database settings
    $envContent = $envContent -replace 'REDIS_HOST=\w+', "REDIS_HOST=$redisHost"
    $envContent = $envContent -replace 'REDIS_PORT=\d+', "REDIS_PORT=$redisPort"
    $envContent = $envContent -replace 'POSTGRES_HOST=\w+', "POSTGRES_HOST=$pgHost"
    $envContent = $envContent -replace 'POSTGRES_PORT=\d+', "POSTGRES_PORT=$pgPort"
    $envContent = $envContent -replace 'POSTGRES_DB=\w+', "POSTGRES_DB=$pgDb"
    $envContent = $envContent -replace 'POSTGRES_USER=\w+', "POSTGRES_USER=$pgUser"
    $envContent = $envContent -replace 'POSTGRES_PASSWORD=', "POSTGRES_PASSWORD=$pgPasswordPlain"

    # Add API keys
    foreach ($key in $apiKeys.Keys) {
        $value = $apiKeys[$key]
        $envContent = $envContent -replace "$key=", "$key=$value"
    }
}

# Write configuration
$envContent | Out-File $envFile -Encoding UTF8
Write-Success "Configuration written to: $envFile"

# Step 5: Summary
Write-Header "Configuration Summary"

Write-Host "Installation Tier: $tier" -ForegroundColor White
Write-Host "Redis: $redisHost:$redisPort" -ForegroundColor White
Write-Host "PostgreSQL: $pgHost:$pgPort/$pgDb" -ForegroundColor White
Write-Host "API Keys Configured: $($apiKeys.Count)" -ForegroundColor White
Write-Host ""

Write-Success "Configuration complete!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "  1. Review configuration: $envFile" -ForegroundColor Yellow
Write-Host "  2. Start MCPs: crypto-mcp start" -ForegroundColor Yellow
Write-Host "  3. Check status: crypto-mcp status" -ForegroundColor Yellow
