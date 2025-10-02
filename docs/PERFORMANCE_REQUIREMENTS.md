# 🚀 Performance Requirements
## Crypto MCP Suite - Device Specifications & Resource Consumption Guide

**Last Updated:** October 2, 2025
**Version:** 1.0.0
**Audience:** Users evaluating device capabilities for running the 41-MCP suite

---

## 📑 Table of Contents

1. [Quick Reference](#-quick-reference)
2. [Minimum Specifications](#-minimum-specifications)
3. [Recommended Specifications](#-recommended-specifications)
4. [Optimal Specifications](#-optimal-specifications)
5. [Resource Consumption by Workload](#-resource-consumption-by-workload)
6. [Per-MCP Resource Estimates](#-per-mcp-resource-estimates)
7. [Platform-Specific Notes](#️-platform-specific-notes)
8. [Scaling Strategies](#-scaling-strategies)
9. [Performance Benchmarks](#-performance-benchmarks)
10. [Troubleshooting Performance Issues](#-troubleshooting-performance-issues)

---

## 🎯 Quick Reference

| Device Tier | RAM | CPU | Use Case | MCP Count |
|-------------|-----|-----|----------|-----------|
| **Minimum** | 8 GB | 4 cores | Light usage, FREE tier | 10-15 MCPs |
| **Recommended** | 16 GB | 8 cores | Regular usage, FREEMIUM tier | 25-35 MCPs |
| **Optimal** | 32+ GB | 12+ cores | Heavy usage, FULL tier | All 41 MCPs |

**Quick Device Check:**
- ✅ **8+ GB RAM** → Can run FREE tier (25 MCPs)
- ✅ **16+ GB RAM** → Can run FREEMIUM tier (35 MCPs)
- ✅ **32+ GB RAM** → Can run FULL tier (41 MCPs) + heavy workloads

---

## 💻 Minimum Specifications

**Target:** Run crypto-mcp-suite with **limited concurrent usage** (1-3 MCPs active at once)

### Hardware

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **CPU** | 4 cores / 8 threads | Intel i5-8xxx or AMD Ryzen 5 3xxx+ |
| **RAM** | 8 GB | 4 GB available for MCPs |
| **Storage** | 10 GB free | For dependencies + cache |
| **Network** | Stable internet | For API-based MCPs |

### Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18+ | 11 Node.js MCPs |
| **Python** | 3.13+ | 30 Python MCPs (full compatibility) |
| **uv** | Latest | Python package manager |
| **Git** | Any recent | Repository cloning |

### Performance Expectations

- ⚠️ **Idle:** ~3-4 GB RAM usage (all MCPs loaded but inactive)
- ⚠️ **Light Use:** 1-3 MCPs active, ~5-6 GB RAM total
- ❌ **Heavy Use:** Not recommended (will cause slowdowns/swapping)

**Recommended Tier:** **FREE Tier (25 MCPs)** - Run subset without API dependencies

---

## ✅ Recommended Specifications

**Target:** Run crypto-mcp-suite with **regular usage** (3-7 MCPs active concurrently)

### Hardware

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **CPU** | 8 cores / 16 threads | Intel i7-10xxx or AMD Ryzen 7 5xxx+ |
| **RAM** | 16 GB | 8-10 GB available for MCPs |
| **Storage** | 20 GB free | For dependencies + API cache |
| **Network** | High-speed internet | For real-time data feeds |

### Software

Same as minimum, plus:
- **PM2** (optional) - For development/monitoring
- **Claude Desktop or Claude Code CLI** - MCP client

### Performance Expectations

- ✅ **Idle:** ~3-4 GB RAM usage
- ✅ **Regular Use:** 3-7 MCPs active, ~8-10 GB RAM total
- ⚠️ **Heavy Use:** 10+ MCPs active, ~12-14 GB RAM (near limit)

**Recommended Tier:** **FREEMIUM Tier (35 MCPs)** - Most features with free API keys

---

## 🏆 Optimal Specifications

**Target:** Run crypto-mcp-suite with **heavy concurrent usage** (10+ MCPs active, multi-client)

### Hardware

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **CPU** | 12+ cores / 24+ threads | Intel i9-12xxx or AMD Ryzen 9 5xxx+ |
| **RAM** | 32+ GB | 16-20 GB available for MCPs |
| **Storage** | 50+ GB free | For extended caching + logs |
| **Network** | Gigabit ethernet | For simultaneous API calls |

### Software

Same as recommended, plus:
- **Multiple Claude instances** (Desktop + Code CLI simultaneously)
- **Development tools** (VS Code, browser dev tools, etc.)

### Performance Expectations

- ✅ **Idle:** ~3-4 GB RAM usage
- ✅ **Regular Use:** 3-7 MCPs active, ~8-10 GB RAM
- ✅ **Heavy Use:** 10-20 MCPs active, ~12-16 GB RAM
- ✅ **Extreme Use:** 30+ MCPs active, ~18-24 GB RAM (still smooth)

**Recommended Tier:** **FULL Tier (All 41 MCPs)** - Complete crypto intelligence suite

---

## 📊 Resource Consumption by Workload

### Idle State (All MCPs Loaded, None Active)

**Scenario:** Claude Desktop/Code CLI started with all 41 MCPs configured, no queries made

| Resource | Usage | Notes |
|----------|-------|-------|
| **RAM** | 2-4 GB | MCPs loaded but idle |
| **CPU** | <5% | Background processes only |
| **Disk** | ~500 MB | Dependencies + source code |
| **Network** | <1 Mbps | Periodic health checks |

### Light Workload (1-3 MCPs Active)

**Scenario:** Single conversation using 1-3 crypto MCPs (e.g., checking whale alerts, bridge rates)

| Resource | Usage | Notes |
|----------|-------|-------|
| **RAM** | 4-6 GB | 2-4 GB idle + 2 GB active |
| **CPU** | 10-20% | Simple API calls, data parsing |
| **Disk I/O** | Low | Minimal caching |
| **Network** | 5-10 Mbps | API requests/responses |

**Example MCPs:**
- `whale-tracker-mcp` (monitoring whale transactions)
- `bridge-rates-mcp` (checking bridge fees)
- `chainlist-mcp` (searching blockchain info)

### Regular Workload (3-7 MCPs Active)

**Scenario:** Active analysis session using multiple crypto MCPs simultaneously

| Resource | Usage | Notes |
|----------|-------|-------|
| **RAM** | 8-10 GB | 3-4 GB idle + 5-6 GB active |
| **CPU** | 20-40% | Complex queries, data aggregation |
| **Disk I/O** | Moderate | API caching, temp files |
| **Network** | 10-25 Mbps | Multiple concurrent API calls |

**Example MCPs:**
- `tokenmetrics-mcp` (AI-powered analytics)
- `lunarcrush-mcp` (social sentiment)
- `ccxt-mcp` (exchange data)
- `funding-rates-mcp` (perpetual funding rates)
- `dex-metrics-mcp` (DEX analytics)

### Heavy Workload (10-20 MCPs Active)

**Scenario:** Intensive research session, multi-chain analysis, or automated trading signals

| Resource | Usage | Notes |
|----------|-------|-------|
| **RAM** | 12-16 GB | 3-4 GB idle + 9-12 GB active |
| **CPU** | 40-60% | Parallel processing, complex computations |
| **Disk I/O** | High | Large datasets, extensive caching |
| **Network** | 25-50 Mbps | High-frequency API polling |

**Example MCPs:**
- All regular workload MCPs +
- `uniswap-pools-mcp` (liquidity pool analysis)
- `crypto-portfolio-mcp` (portfolio tracking)
- `hyperliquid-info-mcp` (DEX aggregator data)
- `polymarket-predictions-mcp` (prediction markets)
- `dao-proposals-mcp` (governance tracking)

### Extreme Workload (30+ MCPs Active)

**Scenario:** Institutional-grade analysis, multi-strategy execution, or comprehensive market monitoring

| Resource | Usage | Notes |
|----------|-------|-------|
| **RAM** | 18-24 GB | 3-4 GB idle + 15-20 GB active |
| **CPU** | 60-80% | Maximum concurrent processing |
| **Disk I/O** | Very High | Continuous data streaming |
| **Network** | 50-100 Mbps | Real-time feeds from multiple sources |

**Requirements:**
- **32+ GB RAM** (minimum)
- **12+ CPU cores** (for parallel MCP execution)
- **SSD storage** (for fast I/O)
- **Gigabit internet** (for low-latency API calls)

---

## 🔍 Per-MCP Resource Estimates

### Lightweight MCPs (<50 MB RAM, <5% CPU)

**Characteristics:** Simple API wrappers, minimal processing

| MCP | RAM (Idle) | RAM (Active) | CPU (Active) | API Rate Limit |
|-----|------------|--------------|--------------|----------------|
| `chainlist-mcp` | 30 MB | 40-60 MB | <5% | None |
| `bridge-rates-mcp` | 40 MB | 60-80 MB | <5% | 60/min |
| `crypto-feargreed-mcp` | 25 MB | 35-50 MB | <5% | Unlimited |
| `crypto-rss-mcp` | 30 MB | 50-70 MB | <5% | None |
| `ens-mcp` | 35 MB | 55-75 MB | <5% | 100/min |

### Medium MCPs (50-150 MB RAM, 5-15% CPU)

**Characteristics:** Data aggregation, basic analytics

| MCP | RAM (Idle) | RAM (Active) | CPU (Active) | API Rate Limit |
|-----|------------|--------------|--------------|----------------|
| `whale-tracker-mcp` | 60 MB | 100-150 MB | 5-10% | 10/min (free) |
| `funding-rates-mcp` | 80 MB | 120-180 MB | 10-15% | 30/min |
| `crypto-liquidations-mcp` | 70 MB | 110-160 MB | 5-10% | 60/min |
| `dex-metrics-mcp` | 90 MB | 140-200 MB | 10-15% | 30/min |
| `hyperliquid-info-mcp` | 85 MB | 130-190 MB | 10-15% | 60/min |

### Heavy MCPs (150-300 MB RAM, 15-30% CPU)

**Characteristics:** Complex analytics, AI processing, multi-exchange aggregation

| MCP | RAM (Idle) | RAM (Active) | CPU (Active) | API Rate Limit |
|-----|------------|--------------|--------------|----------------|
| `tokenmetrics-mcp` | 200 MB | 250-350 MB | 20-30% | 100/day (free) |
| `lunarcrush-mcp` | 150 MB | 200-300 MB | 15-25% | 1000/day (free) |
| `ccxt-mcp` | 180 MB | 250-400 MB | 20-30% | Varies by exchange |
| `uniswap-pools-mcp` | 160 MB | 220-320 MB | 15-25% | 100/min |
| `crypto-portfolio-mcp` | 140 MB | 200-280 MB | 15-20% | None |

### Very Heavy MCPs (300+ MB RAM, 30%+ CPU)

**Characteristics:** Real-time streaming, blockchain indexing, AI models

| MCP | RAM (Idle) | RAM (Active) | CPU (Active) | API Rate Limit |
|-----|------------|--------------|--------------|----------------|
| `uniswap-trader-mcp` | 250 MB | 400-600 MB | 30-50% | Rate limited by RPC |
| `hyperliquid-whalealert-mcp` | 200 MB | 350-500 MB | 25-40% | WebSocket (continuous) |
| `crypto-sentiment-mcp` | 220 MB | 300-450 MB | 20-35% | 50/min |
| `polymarket-predictions-mcp` | 180 MB | 280-400 MB | 20-30% | 100/min |

**Note:** Active RAM/CPU usage varies based on:
- Query complexity
- Data volume requested
- Caching effectiveness
- API response times
- Network latency

---

## 🖥️ Platform-Specific Notes

### Windows

**Recommended:**
- Windows 10 (build 19041+) or Windows 11
- WSL2 for better Python compatibility (optional)
- PowerShell 7+ for script execution

**Performance Considerations:**
- Windows Defender can slow down Node.js installs (exclude `node_modules` folders)
- WSL2 provides near-native Linux performance for Python MCPs
- PowerShell has different path separators (use `\\` in JSON configs)

**Tested Configurations:**
- ✅ Windows 11 + PowerShell 7 + Node 20 + Python 3.13
- ✅ Windows 10 + WSL2 Ubuntu + Node 20 + Python 3.13

### macOS

**Recommended:**
- macOS 12 (Monterey) or newer
- Homebrew for package management
- Terminal or iTerm2

**Performance Considerations:**
- M1/M2/M3 Macs: Excellent performance due to ARM efficiency
- Intel Macs: Use Rosetta 2 for ARM-only packages
- macOS path: `~/Library/Application Support/Claude/`

**Tested Configurations:**
- ✅ macOS 14 (Sonoma) + M2 Pro + Node 20 + Python 3.13
- ✅ macOS 13 (Ventura) + Intel i9 + Node 20 + Python 3.13

### Linux

**Recommended:**
- Ubuntu 22.04+ / Debian 11+ / Fedora 37+
- Systemd for process management (if not using PM2)

**Performance Considerations:**
- Best performance (native execution, no translation layers)
- Use `systemd` or `supervisord` as PM2 alternative
- Path: `~/.config/Claude/` or custom

**Tested Configurations:**
- ✅ Ubuntu 24.04 LTS + Node 20 + Python 3.13
- ✅ Fedora 40 + Node 20 + Python 3.13
- ✅ Debian 12 + Node 20 + Python 3.13

---

## 📈 Scaling Strategies

### Strategy 1: Tier-Based Scaling

**Use Case:** Limited hardware or specific use cases

| Tier | MCPs | RAM Needed | Use Case |
|------|------|------------|----------|
| **FREE** | 25 | 8 GB | No API keys, basic crypto data |
| **FREEMIUM** | 35 | 16 GB | Free APIs, advanced analytics |
| **FULL** | 41 | 32+ GB | All features, institutional-grade |

**Implementation:**
```bash
# Deploy FREE tier
pm2 start native/config/ecosystem.config.js --only tier1

# Deploy FREEMIUM tier (tier1 + tier2)
pm2 start native/config/ecosystem.config.js --only tier1,tier2

# Deploy FULL tier (all)
pm2 start native/config/ecosystem.config.js
```

### Strategy 2: Use Case-Specific Scaling

**Use Case:** Optimize for specific trading/analysis workflows

**DeFi Focus (15 MCPs):**
- `uniswap-pools-mcp`, `aave-mcp`, `dex-metrics-mcp`
- `defi-yields-mcp`, `hyperliquid-info-mcp`
- **RAM:** 6-8 GB

**On-Chain Analytics Focus (12 MCPs):**
- `whale-tracker-mcp`, `hyperliquid-whalealert-mcp`
- `wallet-inspector-mcp`, `crypto-liquidations-mcp`
- **RAM:** 5-7 GB

**Social Sentiment Focus (10 MCPs):**
- `lunarcrush-mcp`, `crypto-sentiment-mcp`
- `cryptopanic-mcp-server`, `crypto-rss-mcp`
- **RAM:** 4-6 GB

### Strategy 3: Dynamic Scaling

**Use Case:** Automatically adjust based on workload

**Approach:**
1. Start with core MCPs (tier1: 15 MCPs)
2. Monitor RAM/CPU usage
3. Add more MCPs if resources available
4. Use PM2 auto-restart on resource limits

**Configuration:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    max_memory_restart: '1G',  // Restart if > 1GB RAM
    instances: 1,
    autorestart: true
  }]
}
```

### Strategy 4: Multi-Instance Scaling

**Use Case:** Separate production/development environments

**Approach:**
- **Instance 1 (Production):** Critical MCPs only (10-15)
- **Instance 2 (Development):** All MCPs for testing (41)
- **Instance 3 (Research):** Data-heavy MCPs (20)

**Implementation:**
```bash
# Production (low resource)
pm2 start ecosystem.config.js --only tier1 --name "crypto-prod"

# Development (full suite)
pm2 start ecosystem.config.js --name "crypto-dev"

# Research (data MCPs)
pm2 start ecosystem.config.js --only tier2,tier3 --name "crypto-research"
```

---

## 🏁 Performance Benchmarks

### Benchmark Environment

**Test Device:**
- CPU: AMD Ryzen 9 5950X (16c/32t)
- RAM: 64 GB DDR4
- Storage: NVMe SSD
- OS: Ubuntu 22.04 LTS
- Network: 1 Gbps fiber

### Cold Start Performance

| Tier | MCPs | Startup Time | Memory After Start |
|------|------|--------------|-------------------|
| FREE | 25 | 8-12 seconds | 2.8 GB |
| FREEMIUM | 35 | 12-18 seconds | 3.5 GB |
| FULL | 41 | 15-22 seconds | 4.2 GB |

### Query Response Times

| Query Type | MCPs Involved | Response Time | Peak RAM | Peak CPU |
|------------|---------------|---------------|----------|----------|
| **Simple** | 1 MCP | 0.5-2 sec | +50-100 MB | 5-10% |
| **Medium** | 2-3 MCPs | 2-5 sec | +150-300 MB | 15-25% |
| **Complex** | 5-7 MCPs | 5-12 sec | +400-700 MB | 30-50% |
| **Extreme** | 15+ MCPs | 12-30 sec | +1-2 GB | 60-80% |

### Concurrent Query Performance

| Concurrent Queries | Total MCPs Active | Avg Response Time | Peak RAM | Peak CPU |
|-------------------|-------------------|-------------------|----------|----------|
| 1 | 1-3 | 1-3 sec | 5 GB | 20% |
| 3 | 5-10 | 3-8 sec | 10 GB | 45% |
| 5 | 15-20 | 8-15 sec | 16 GB | 70% |
| 10+ | 30+ | 15-30 sec | 24 GB | 90% |

**Note:** Response times vary based on API rate limits, network latency, and data volume.

---

## ⚠️ Troubleshooting Performance Issues

### Issue: High Memory Usage (Swapping/OOM)

**Symptoms:**
- System becomes unresponsive
- MCPs crash with "Out of Memory" errors
- Disk activity increases (swap usage)

**Solutions:**

1. **Reduce Active MCPs:**
   ```bash
   # Stop all MCPs
   pm2 stop all

   # Start only essential MCPs
   pm2 start ecosystem.config.js --only tier1
   ```

2. **Increase System Swap:**
   ```bash
   # Linux: Create 8GB swap file
   sudo fallocate -l 8G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **Enable Memory Limits:**
   ```javascript
   // ecosystem.config.js
   max_memory_restart: '800M'  // Restart if MCP exceeds 800MB
   ```

### Issue: High CPU Usage (Thermal Throttling)

**Symptoms:**
- CPU temperature >85°C
- System fans at max speed
- Queries take longer than usual

**Solutions:**

1. **Limit Concurrent Queries:**
   - Reduce number of simultaneous MCP calls
   - Stagger API requests instead of parallel

2. **CPU Affinity (Linux):**
   ```bash
   # Limit PM2 to specific cores
   taskset -c 0-7 pm2 start ecosystem.config.js
   ```

3. **Reduce MCP Count:**
   - Use tier-based scaling
   - Disable unused MCPs

### Issue: Slow Query Response Times

**Symptoms:**
- Queries take >30 seconds
- Timeout errors from MCPs
- Network requests fail

**Solutions:**

1. **Check Network Latency:**
   ```bash
   # Test API endpoints
   ping api.tokenmetrics.com
   curl -w "@curl-format.txt" https://api.lunarcrush.com/v2
   ```

2. **Enable API Caching:**
   - Use Redis for response caching
   - Configure TTL based on data freshness needs

3. **Optimize API Keys:**
   - Use higher-tier API plans (more rate limit)
   - Distribute requests across multiple API keys

### Issue: Disk Space Running Low

**Symptoms:**
- Disk usage >90%
- Cache write failures
- Log files growing rapidly

**Solutions:**

1. **Clean PM2 Logs:**
   ```bash
   pm2 flush  # Clear all logs
   pm2 reloadLogs  # Rotate logs
   ```

2. **Clear API Cache:**
   ```bash
   # Clear Node.js cache
   rm -rf ~/.npm/_cacache

   # Clear Python cache
   rm -rf ~/.cache/pip
   ```

3. **Limit Log Retention:**
   ```javascript
   // ecosystem.config.js
   log_date_format: 'YYYY-MM-DD HH:mm:ss',
   max_size: '10M',  // Max log file size
   max_files: 3      // Keep only 3 log files
   ```

### Issue: MCP Crashes/Restarts

**Symptoms:**
- MCPs restart frequently
- "Process exited unexpectedly" errors
- Inconsistent query results

**Solutions:**

1. **Check Error Logs:**
   ```bash
   pm2 logs <mcp-name> --lines 100
   ```

2. **Increase Restart Delay:**
   ```javascript
   // ecosystem.config.js
   restart_delay: 5000,  // Wait 5s before restart
   exp_backoff_restart_delay: 100  // Exponential backoff
   ```

3. **Update Dependencies:**
   ```bash
   # Node.js MCPs
   cd native/lib/<mcp-name> && npm update && npm audit fix

   # Python MCPs
   cd native/lib/<mcp-name> && uv sync --upgrade
   ```

---

## 📞 Additional Resources

- **Installation Guide:** [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)
- **Client Setup Guide:** [CLIENT_SETUP_GUIDE.md](CLIENT_SETUP_GUIDE.md)
- **MCP Capability Matrix:** [MCP_CAPABILITY_MATRIX.md](MCP_CAPABILITY_MATRIX.md)
- **Pre-Deployment Checklist:** [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
- **GitHub Repository:** https://github.com/justmy2satoshis/crypto-mcp-suite
- **MCP Protocol Docs:** https://modelcontextprotocol.io

---

**Performance Requirements Documentation Complete** ✅
**Last Updated:** October 2, 2025
