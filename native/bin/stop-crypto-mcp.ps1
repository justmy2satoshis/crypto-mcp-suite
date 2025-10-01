# Crypto MCP Suite - Quick Stop Script
# Wrapper for crypto-mcp stop

$scriptPath = Join-Path $PSScriptRoot "crypto-mcp.ps1"

if (Test-Path $scriptPath) {
    & $scriptPath stop
} else {
    Write-Host "Error: crypto-mcp.ps1 not found" -ForegroundColor Red
    exit 1
}
