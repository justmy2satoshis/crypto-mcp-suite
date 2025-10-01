# Crypto MCP Suite - Quick Start Script
# Wrapper for crypto-mcp start

param(
    [string]$Profile = "essential"
)

$scriptPath = Join-Path $PSScriptRoot "crypto-mcp.ps1"

if (Test-Path $scriptPath) {
    & $scriptPath start $Profile
} else {
    Write-Host "Error: crypto-mcp.ps1 not found" -ForegroundColor Red
    exit 1
}
