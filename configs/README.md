# Client Configuration Files
## Crypto MCP Suite - MCP Client Setup

This directory contains client configuration templates for connecting Claude Desktop and Claude Code CLI to the 41 crypto MCPs.

---

## Available Configuration Files

### Claude Desktop Configurations

1. **claude_desktop_config_windows.json** - Windows 10/11 configuration
   - Path format: `C:\Users\User\...`
   - uv binary: `C:\Users\User\.local\bin\uv.exe`
   - Python: `python` or `python3`

2. **claude_desktop_config_linux.json** - Linux (Ubuntu/Debian) configuration
   - Path format: `/home/deploy/workcraft-mcp/...`
   - uv binary: `uv` (in PATH)
   - Python: `python3`

3. **claude_desktop_config_macos.json** - macOS configuration
   - Path format: `/Users/username/crypto-mcp-suite/...`
   - uv binary: `uv` (in PATH)
   - Python: `python3`

### Claude Code CLI Configurations

4. **.mcp.json** - Claude Code CLI configuration (all platforms)
   - Same format as Claude Desktop
   - Platform-specific paths required

---

## Installation Instructions

### 1. Choose Your Platform Configuration

Select the appropriate configuration file for your operating system:
- **Windows**: Use `claude_desktop_config_windows.json`
- **Linux**: Use `claude_desktop_config_linux.json`
- **macOS**: Use `claude_desktop_config_macos.json`

### 2. Customize Paths

**IMPORTANT**: Replace placeholder paths with your actual installation directory.

#### Windows Example:
```json
"C:\\Users\\User\\mcp-servers\\Crypto MCPs\\Crypto-MCP-Suite\\native\\lib\\ccxt-mcp\\build\\index.js"
```
Replace `C:\\Users\\User\\mcp-servers\\Crypto MCPs` with your actual path.

#### Linux Example:
```json
"/home/deploy/workcraft-mcp/native/lib/ccxt-mcp/build/index.js"
```
Replace `/home/deploy/workcraft-mcp` with your actual path.

#### macOS Example:
```json
"/Users/username/crypto-mcp-suite/native/lib/ccxt-mcp/build/index.js"
```
Replace `/Users/username/crypto-mcp-suite` with your actual path.

### 3. Configure API Keys

Replace `${VAR_NAME}` placeholders with actual values or set environment variables:

**Option A: Direct Values (Quick Test)**
```json
{
  "env": {
    "TOKENMETRICS_API_KEY": "your_actual_api_key_here"
  }
}
```

**Option B: Environment Variables (Recommended)**
```json
{
  "env": {
    "TOKENMETRICS_API_KEY": "${TOKENMETRICS_API_KEY}"
  }
}
```
Then set in your shell:
```bash
# Windows (PowerShell)
$env:TOKENMETRICS_API_KEY = "your_actual_api_key"

# Linux/macOS (Bash)
export TOKENMETRICS_API_KEY="your_actual_api_key"
```

### 4. Install Configuration

#### Claude Desktop

**Windows:**
```powershell
# Copy configuration to Claude Desktop directory
copy configs\claude_desktop_config_windows.json "$env:APPDATA\Claude\claude_desktop_config.json"
```

**Linux:**
```bash
# Create Claude Desktop config directory
mkdir -p ~/.config/Claude

# Copy configuration
cp configs/claude_desktop_config_linux.json ~/.config/Claude/claude_desktop_config.json
```

**macOS:**
```bash
# Create Claude Desktop config directory
mkdir -p ~/Library/Application\ Support/Claude

# Copy configuration
cp configs/claude_desktop_config_macos.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### Claude Code CLI

**All Platforms:**
```bash
# Copy to project root
cp configs/.mcp.json .mcp.json

# Or copy to user scope
# Windows: C:\Users\<username>\.mcp.json
# Linux/macOS: ~/.mcp.json
```

### 5. Restart Client

- **Claude Desktop**: Completely quit and restart the application
- **Claude Code CLI**: No restart needed (auto-detected on next session)

---

## Configuration Tiers

You can configure a subset of MCPs based on your needs:

### FREE Tier (25 MCPs, 0 API keys)
Include only MCPs that don't require API keys:
- bridge-rates-mcp
- chainlist-mcp
- memecoin-radar-mcp
- dex-metrics-mcp
- honeypot-detector-mcp
- ... (see MCP_TRANSPORT_TYPES.md for full list)

### FREEMIUM Tier (35 MCPs, free API keys)
Add MCPs with free API tiers:
- tokenmetrics-mcp (FREE tier)
- lunarcrush-mcp (FREE tier)
- ethereum-validator-queue-mcp (Beaconcha.in FREE)

### FULL Tier (41 MCPs, all features)
Use all MCPs with required API keys configured.

---

## Verification

### Test Single MCP Connection

**Node.js MCP:**
```bash
# Windows
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | node "C:\path\to\mcp\index.js"

# Linux/macOS
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | node /path/to/mcp/index.js
```

**Python MCP (uv):**
```bash
# Windows
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | C:\Users\User\.local\bin\uv.exe --directory "C:\path\to\mcp" run main.py

# Linux/macOS
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | uv --directory /path/to/mcp run main.py
```

### Run Full Connection Test

```bash
# Use the automated test script
node scripts/test-client-connections.js --config configs/claude_desktop_config_windows.json
```

---

## Troubleshooting

### Issue: MCPs not appearing in client

**Solution:**
1. Verify configuration file location is correct
2. Check JSON syntax (use `jq` or online validator)
3. Ensure all paths are absolute (not relative)
4. Restart client application completely

### Issue: "Command not found" errors

**Solution:**
1. Verify `node` is in PATH: `node --version`
2. Verify `uv` is installed: `uv --version`
3. For Windows, use full path to uv.exe: `C:\Users\User\.local\bin\uv.exe`
4. For Python, verify: `python --version` or `python3 --version`

### Issue: API key errors

**Solution:**
1. Verify API keys are set in environment variables
2. Check that `${VAR_NAME}` syntax is supported by your client
3. Try direct values for testing (not recommended for production)
4. Check API key validity with provider dashboard

### Issue: Module not found errors

**Solution:**
1. Verify MCP dependencies are installed:
   - Node.js: `npm install` in MCP directory
   - Python: `uv sync` in MCP directory
2. For TypeScript MCPs, verify compilation:
   - ccxt-mcp: `npm run build` → `build/index.js` exists
   - tokenmetrics-mcp: `npm run build` → `build/src/cli.js` exists

---

## Additional Resources

- **Transport Types**: See [MCP_TRANSPORT_TYPES.md](../docs/MCP_TRANSPORT_TYPES.md)
- **Setup Guide**: See [CLIENT_SETUP_GUIDE.md](../docs/CLIENT_SETUP_GUIDE.md)
- **API Keys**: See [API_KEY_SETUP_GUIDE.md](../API_KEY_SETUP_GUIDE.md)
- **Capability Matrix**: See [MCP_CAPABILITY_MATRIX.md](../docs/MCP_CAPABILITY_MATRIX.md)

---

## Notes

### Environment Variable Expansion

- **Claude Desktop**: Supports `${VAR_NAME}` syntax for environment variables
- **Claude Code CLI**: Check documentation for current support status

### Path Separators

- **Windows**: Use double backslashes `\\` in JSON strings
- **Linux/macOS**: Use forward slashes `/`

### Python Command

- **Windows**: Use `python` or `python3` (check with `python --version`)
- **Linux/macOS**: Usually `python3` (Python 2 is deprecated)

### uv Binary Location

- **Windows**: `C:\Users\<username>\.local\bin\uv.exe` (after installation)
- **Linux/macOS**: Typically in `~/.local/bin/uv` or `/usr/local/bin/uv`

To find uv location:
```bash
# Windows (PowerShell)
Get-Command uv

# Linux/macOS
which uv
```
