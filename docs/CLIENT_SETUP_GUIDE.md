# Client Setup Guide
## Crypto MCP Suite - Claude Desktop & Claude Code CLI Configuration

**Last Updated**: October 2, 2025
**Version**: 1.0.0
**Audience**: Users setting up MCP clients to access the 41 crypto MCPs

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Claude Desktop Setup](#3-claude-desktop-setup)
4. [Claude Code CLI Setup](#4-claude-code-cli-setup)
5. [Connection Testing](#5-connection-testing)
6. [Troubleshooting](#6-troubleshooting)
7. [Architecture Diagrams](#7-architecture-diagrams)

---

## 1. Overview

### MCP Client-Server Architecture

The Model Context Protocol (MCP) uses a **client-server architecture** where:

- **MCP Servers**: Tools/data sources that expose capabilities (our 41 crypto MCPs)
- **MCP Clients**: Applications that consume MCP tools (Claude Desktop, Claude Code CLI)
- **Transport**: Communication method between client and server (stdio for all 41 MCPs)

### Key Concepts

**stdio Transport** (Standard Input/Output):
- Client spawns MCP server as a child process
- Communication via stdin/stdout pipes
- Most common for local MCPs
- All 41 crypto MCPs use stdio ✅

**Process Management**:
- **PM2 (Server-Side)**: Manages MCPs for development/monitoring
- **Client-Side**: Each client spawns independent MCP instances
- **Isolation**: Clients don't connect to PM2 servers - they spawn their own processes

**Configuration Files**:
- **Claude Desktop**: `claude_desktop_config.json` in app data directory
- **Claude Code CLI**: `.mcp.json` in project/user/local scope

---

## 2. Prerequisites

### Required Software

1. **Node.js 18+** (for 11 Node.js MCPs)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **Python 3.10+** (for 30 Python MCPs)
   ```bash
   python --version  # or python3 --version
   ```

3. **uv Package Manager** (for Python MCPs)
   ```bash
   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

   # Linux/macOS
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Verify
   uv --version
   ```

4. **Git** (for cloning repository)
   ```bash
   git --version
   ```

### MCP Installation

Ensure all 41 MCPs are installed with dependencies:

```bash
# Clone repository with submodules
git clone --recurse-submodules https://github.com/justmy2satoshis/crypto-mcp-suite.git
cd crypto-mcp-suite

# Install Node.js dependencies (11 MCPs)
cd native/lib/ccxt-mcp && npm install && cd ../../..
cd native/lib/crypto-indicators-mcp && npm install && cd ../../..
# ... repeat for all Node.js MCPs

# Install Python dependencies (30 MCPs)
cd native/lib/chainlist-mcp && uv sync && cd ../../..
# ... repeat for all Python MCPs

# Compile TypeScript MCPs (2 MCPs)
cd native/lib/ccxt-mcp && npm run build && cd ../../..
cd native/lib/tokenmetrics-mcp && npm run build && cd ../../..
```

### API Keys (Optional - Tier-Specific)

- **FREE Tier (25 MCPs)**: No API keys required
- **FREEMIUM Tier (35 MCPs)**: Free API keys (TokenMetrics, LunarCrush, etc.)
- **FULL Tier (41 MCPs)**: All API keys configured

See [API_KEY_SETUP_GUIDE.md](../API_KEY_SETUP_GUIDE.md) for API key acquisition.

---

## 3. Claude Desktop Setup

### 3.1 Installation

If not already installed:

- **macOS**: Download from https://claude.ai/download
- **Windows**: Download from https://claude.ai/download
- **Linux**: Not officially supported (use Claude Code CLI instead)

### 3.2 Configuration File Location

Identify your OS-specific config directory:

| OS | Configuration File Path |
|----|------------------------|
| **Windows** | `C:\Users\<username>\AppData\Roaming\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` (if available) |

### 3.3 Copy Template Configuration

**Step 1**: Choose OS-specific template from `configs/` directory:
- Windows: `claude_desktop_config_windows.json`
- macOS: `claude_desktop_config_macos.json`
- Linux: `claude_desktop_config_linux.json`

**Step 2**: Copy template to Claude Desktop config location:

**Windows (PowerShell)**:
```powershell
# Create config directory (if not exists)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# Copy configuration
Copy-Item "configs\claude_desktop_config_windows.json" "$env:APPDATA\Claude\claude_desktop_config.json"
```

**macOS**:
```bash
# Create config directory (if not exists)
mkdir -p ~/Library/Application\ Support/Claude

# Copy configuration
cp configs/claude_desktop_config_macos.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux**:
```bash
# Create config directory (if not exists)
mkdir -p ~/.config/Claude

# Copy configuration
cp configs/claude_desktop_config_linux.json ~/.config/Claude/claude_desktop_config.json
```

### 3.4 Customize Paths and Environment Variables

**Edit Configuration File**:

**Windows**:
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

**macOS/Linux**:
```bash
# Use your preferred editor
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
# or
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Update Paths** (REQUIRED):

Replace placeholder paths with your actual installation directory:

**Windows Example**:
```json
{
  "ccxt-mcp": {
    "command": "node",
    "args": [
      "C:\\Users\\User\\mcp-servers\\Crypto MCPs\\Crypto-MCP-Suite\\native\\lib\\ccxt-mcp\\build\\index.js"
    ]
  }
}
```
Change `C:\\Users\\User\\mcp-servers\\Crypto MCPs` to your actual path.

**macOS/Linux Example**:
```json
{
  "ccxt-mcp": {
    "command": "node",
    "args": [
      "/Users/yourusername/crypto-mcp-suite/native/lib/ccxt-mcp/build/index.js"
    ]
  }
}
```

**Configure API Keys** (if using FREEMIUM/FULL tier):

**Option A: Direct Values** (Quick Test):
```json
{
  "tokenmetrics-mcp": {
    "env": {
      "TOKENMETRICS_API_KEY": "your_actual_api_key_here"
    }
  }
}
```

**Option B: Environment Variables** (Recommended):
```json
{
  "tokenmetrics-mcp": {
    "env": {
      "TOKENMETRICS_API_KEY": "${TOKENMETRICS_API_KEY}"
    }
  }
}
```
Then set in your shell before starting Claude Desktop.

### 3.5 Restart Claude Desktop

1. **Quit Claude Desktop completely** (not just close window)
   - Windows: Right-click system tray icon → Quit
   - macOS: Cmd+Q or Claude → Quit Claude

2. **Restart Claude Desktop**

3. **Verify MCPs are loaded**:
   - Open a new conversation
   - Type `/` to see available tools
   - Look for crypto MCP tools (e.g., `getBridgeRates`, `getChainById`)

### 3.6 Verify Connection

Test a simple MCP tool:

```
User: Use bridge-rates-mcp to get supported chains
```

Expected: Claude should show a table of supported blockchain chains.

---

## 4. Claude Code CLI Setup

### 4.1 Installation

If not already installed:

**Windows**:
```powershell
# Download from official source
# Follow installation instructions at https://docs.claude.com/en/docs/claude-code
```

**macOS/Linux**:
```bash
# Download from official source
# Follow installation instructions at https://docs.claude.com/en/docs/claude-code
```

### 4.2 Configuration Method

Claude Code CLI supports three configuration scopes:

1. **Project Scope** (`.mcp.json` in project root)
   - Specific to one project
   - Committed to version control (optional)

2. **User Scope** (`~/.mcp.json` in home directory)
   - Available to all projects for the user
   - Not committed to version control

3. **Local Scope** (Custom location via CLI flag)
   - Specified at runtime

### 4.3 Local Development Setup (CCC-LD)

**Step 1**: Copy template to project root:

```bash
# From crypto-mcp-suite directory
cp configs/.mcp.json .mcp.json
```

**Step 2**: Customize paths in `.mcp.json`:

```bash
# Edit with your preferred editor
code .mcp.json
# or
nano .mcp.json
```

**Update all paths** from `/absolute/path/to/crypto-mcp-suite/...` to your actual paths.

**Windows Example**:
```json
{
  "ccxt-mcp": {
    "command": "node",
    "args": [
      "C:\\Users\\User\\mcp-servers\\Crypto MCPs\\Crypto-MCP-Suite\\native\\lib\\ccxt-mcp\\build\\index.js"
    ]
  }
}
```

**Linux/macOS Example**:
```json
{
  "ccxt-mcp": {
    "command": "node",
    "args": [
      "/home/username/crypto-mcp-suite/native/lib/ccxt-mcp/build/index.js"
    ]
  }
}
```

**Step 3**: Start Claude Code CLI:

```bash
# From project directory with .mcp.json
claude-code
```

### 4.4 Production Server Setup (CCC-VS)

For Vultr production deployment:

**Step 1**: Create server-specific configuration:

```bash
# On Vultr server
cp configs/claude_desktop_config_linux.json ~/.mcp.json
```

**Step 2**: Update paths for server environment:

```bash
# Edit configuration
nano ~/.mcp.json
```

Update all paths to server-specific locations (e.g., `/home/deploy/workcraft-mcp/...`).

**Step 3**: Set environment variables:

```bash
# Add to ~/.bashrc or ~/.profile
export TOKENMETRICS_API_KEY="your_api_key"
export LUNARCRUSH_API_KEY="your_api_key"
# ... other API keys

# Reload
source ~/.bashrc
```

**Step 4**: Start Claude Code CLI:

```bash
claude-code
```

### 4.5 Testing MCP Connections

Test a simple MCP tool via Claude Code CLI:

```bash
# Start Claude Code CLI
claude-code

# In conversation, test MCP
User: Use chainlist-mcp to search for ethereum chains
```

Expected: Claude should return Ethereum chain details from Chainlist MCP.

---

## 5. Connection Testing

### 5.1 Manual Testing

**Test Single Node.js MCP**:

```bash
# Windows
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node "C:\path\to\mcp\index.js"

# Linux/macOS
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node /path/to/mcp/index.js
```

Expected output: JSON response with MCP initialization details.

**Test Single Python MCP (uv)**:

```bash
# Windows
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | C:\Users\User\.local\bin\uv.exe --directory "C:\path\to\mcp" run main.py

# Linux/macOS
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | uv --directory /path/to/mcp run main.py
```

Expected output: JSON response with MCP initialization details.

### 5.2 Automated Testing

Use the test script:

```bash
# Test Windows configuration
node scripts/test-client-connections.js --config "$env:APPDATA\Claude\claude_desktop_config.json"

# Test Linux/macOS configuration
node scripts/test-client-connections.js --config ~/.config/Claude/claude_desktop_config.json

# Test Claude Code configuration
node scripts/test-client-connections.js --config .mcp.json
```

Expected output:
```
Testing 41 MCP connections...
✅ ccxt-mcp - Reachable (stdio)
✅ crypto-indicators-mcp - Reachable (stdio)
✅ chainlist-mcp - Reachable (stdio)
...
41/41 MCPs reachable ✅
```

### 5.3 Client-Side Verification

**Claude Desktop**:
1. Open Claude Desktop
2. Start new conversation
3. Type `/` and look for MCP tools
4. Try: "Use bridge-rates-mcp to get supported chains"

**Claude Code CLI**:
1. Start `claude-code`
2. In conversation: "List available MCP tools"
3. Try: "Use chainlist-mcp to search for ethereum"

---

## 6. Troubleshooting

### 6.1 Connection Refused Errors

**Symptom**: "Connection refused" or "Cannot connect to MCP server"

**Causes**:
- MCP server not running
- Incorrect command/args in configuration
- Missing dependencies

**Solutions**:
```bash
# Verify MCP can start manually
node /path/to/mcp/index.js  # For Node.js
uv --directory /path/to/mcp run main.py  # For Python

# Check for errors in output
# Fix dependency/compilation issues before configuring client
```

### 6.2 Path Not Found Errors

**Symptom**: "ENOENT: no such file or directory" or "File not found"

**Causes**:
- Incorrect file path
- Relative path instead of absolute
- Wrong path separator for OS

**Solutions**:
- Use **absolute paths** (not relative)
- Windows: Use double backslashes `\\` in JSON
- Linux/macOS: Use forward slashes `/`
- Verify file exists: `ls /path/to/mcp/index.js` (Unix) or `dir C:\path\to\mcp\index.js` (Windows)

### 6.3 API Key Errors

**Symptom**: "401 Unauthorized" or "403 Forbidden" or "Invalid API key"

**Causes**:
- API key not set or incorrect
- Environment variable not expanded
- API key expired/revoked

**Solutions**:
```bash
# Verify API key is set (if using env vars)
# Windows
echo $env:TOKENMETRICS_API_KEY

# Linux/macOS
echo $TOKENMETRICS_API_KEY

# Test API key validity
curl -H "Authorization: Bearer $TOKENMETRICS_API_KEY" https://api.tokenmetrics.com/v2/tokens

# If failed, regenerate API key and update configuration
```

### 6.4 Transport Type Mismatches

**Symptom**: "Unsupported transport type" or "Cannot establish transport"

**Cause**: All 41 crypto MCPs use stdio - this error should not occur

**Solution**: Verify you're not trying to connect via SSE/HTTP. All MCPs must be spawned as stdio processes.

### 6.5 Permission Issues

**Symptom**: "Permission denied" or "EACCES"

**Causes**:
- Executable permissions missing (Unix)
- File not readable

**Solutions**:
```bash
# Linux/macOS: Set executable permissions
chmod +x /path/to/mcp/index.js

# Verify file permissions
ls -l /path/to/mcp/index.js
```

### 6.6 Module Not Found Errors

**Symptom**: "Cannot find module" or "ModuleNotFoundError"

**Causes**:
- Dependencies not installed
- TypeScript not compiled
- Wrong entry point path

**Solutions**:
```bash
# Node.js: Install dependencies
cd /path/to/mcp && npm install

# Python: Install dependencies
cd /path/to/mcp && uv sync

# TypeScript: Compile to JavaScript
cd /path/to/mcp && npm run build

# Verify compiled files exist
# ccxt-mcp: build/index.js
# tokenmetrics-mcp: build/src/cli.js
```

---

## 7. Architecture Diagrams

### 7.1 Client-Server Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Clients                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌────────────────────┐   │
│  │  Claude Desktop  │         │  Claude Code CLI   │   │
│  │                  │         │                    │   │
│  │  Config:         │         │  Config:           │   │
│  │  claude_desktop  │         │  .mcp.json         │   │
│  │  _config.json    │         │                    │   │
│  └──────────────────┘         └────────────────────┘   │
│           │                             │               │
│           │ stdio spawn                 │ stdio spawn   │
│           ▼                             ▼               │
└───────────┼─────────────────────────────┼───────────────┘
            │                             │
            │                             │
┌───────────┴─────────────────────────────┴───────────────┐
│                   MCP Servers                            │
│                 (41 Crypto MCPs)                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Node.js (11):              Python (30):                │
│  ┌─────────────┐            ┌──────────────┐           │
│  │ ccxt-mcp    │            │ chainlist    │           │
│  │ indicators  │            │ feargreed    │           │
│  │ bridge      │            │ whale-track  │           │
│  │ ...         │            │ ...          │           │
│  └─────────────┘            └──────────────┘           │
│                                                          │
│  Transport: stdio (100% coverage)                       │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Process Isolation

```
Client Instance 1           Client Instance 2
(Claude Desktop)           (Claude Code CLI)
       │                          │
       │ spawns                   │ spawns
       ▼                          ▼
┌──────────────┐           ┌──────────────┐
│ ccxt-mcp     │           │ ccxt-mcp     │
│ (independent)│           │ (independent)│
└──────────────┘           └──────────────┘

Each client spawns independent MCP processes
No shared state between client instances
API keys and env vars configured per client
```

### 7.3 stdio Transport Flow

```
Client Process              MCP Server Process
┌──────────────┐           ┌──────────────────┐
│              │           │                  │
│  1. Spawn    │──────────>│  Process starts  │
│     MCP      │           │                  │
│              │           │                  │
│  2. Send     │           │  3. Read from    │
│     JSON via │───stdin──>│     stdin        │
│     stdin    │           │                  │
│              │           │  4. Execute      │
│              │           │     tool         │
│              │           │                  │
│  6. Parse    │<──stdout──│  5. Write JSON   │
│     response │           │     to stdout    │
│              │           │                  │
└──────────────┘           └──────────────────┘
```

---

## Next Steps

1. **Configure API Keys**: See [API_KEY_SETUP_GUIDE.md](../API_KEY_SETUP_GUIDE.md)
2. **Review Capabilities**: See [MCP_CAPABILITY_MATRIX.md](MCP_CAPABILITY_MATRIX.md)
3. **Understand Transports**: See [MCP_TRANSPORT_TYPES.md](MCP_TRANSPORT_TYPES.md)
4. **Production Deployment**: See [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)

---

## Support

- **Documentation**: [README.md](../README.md)
- **Issues**: https://github.com/justmy2satoshis/crypto-mcp-suite/issues
- **Repository**: https://github.com/justmy2satoshis/crypto-mcp-suite
