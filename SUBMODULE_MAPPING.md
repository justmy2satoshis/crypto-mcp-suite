# Git Submodule Mapping - Crypto MCP Suite

**Purpose:** This document maps all 36 MCP servers to their original GitHub repositories as git submodules.

**Created:** October 2, 2025
**Last Updated:** October 2, 2025 (Phase 8A)
**Total Submodules:** 36 (27 original + 9 Phase 8A additions)

---

## Submodule Directory Structure

All MCPs are located in: `native/lib/<mcp-name>/`

Each is a git submodule pointing to its original GitHub repository.

---

## Complete Submodule Mapping

| # | MCP Name | GitHub Repository | Directory Path |
|---|----------|-------------------|----------------|
| 1 | aave-mcp | https://github.com/kukapay/aave-mcp.git | native/lib/aave-mcp |
| 2 | bridge-rates-mcp | https://github.com/kukapay/bridge-rates-mcp | native/lib/bridge-rates-mcp |
| 3 | ccxt-mcp | https://github.com/doggybee/mcp-server-ccxt.git | native/lib/ccxt-mcp |
| 4 | chainlist-mcp | https://github.com/kukapay/chainlist-mcp.git | native/lib/chainlist-mcp |
| 5 | crypto-feargreed-mcp | https://github.com/kukapay/crypto-feargreed-mcp.git | native/lib/crypto-feargreed-mcp |
| 6 | crypto-indicators-mcp | https://github.com/kukapay/crypto-indicators-mcp.git | native/lib/crypto-indicators-mcp |
| 7 | crypto-liquidations-mcp | https://github.com/kukapay/crypto-liquidations-mcp.git | native/lib/crypto-liquidations-mcp |
| 8 | crypto-orderbook-mcp | https://github.com/kukapay/crypto-orderbook-mcp.git | native/lib/crypto-orderbook-mcp |
| 9 | cryptopanic-mcp-server | https://github.com/kukapay/cryptopanic-mcp-server | native/lib/cryptopanic-mcp-server |
| 10 | crypto-portfolio-mcp | https://github.com/kukapay/crypto-portfolio-mcp.git | native/lib/crypto-portfolio-mcp |
| 11 | crypto-projects-mcp | https://github.com/kukapay/crypto-projects-mcp.git | native/lib/crypto-projects-mcp |
| 12 | crypto-sentiment-mcp | https://github.com/kukapay/crypto-sentiment-mcp | native/lib/crypto-sentiment-mcp |
| 13 | dao-proposals-mcp | https://github.com/kukapay/dao-proposals-mcp.git | native/lib/dao-proposals-mcp |
| 14 | dex-metrics-mcp | https://github.com/kukapay/dex-metrics-mcp.git | native/lib/dex-metrics-mcp |
| 15 | etf-flow-mcp | https://github.com/kukapay/etf-flow-mcp.git | native/lib/etf-flow-mcp |
| 16 | funding-rates-mcp | https://github.com/kukapay/funding-rates-mcp.git | native/lib/funding-rates-mcp |
| 17 | honeypot-detector-mcp | https://github.com/kukapay/honeypot-detector-mcp.git | native/lib/honeypot-detector-mcp |
| 18 | hyperliquid-whalealert-mcp | https://github.com/kukapay/hyperliquid-whalealert-mcp.git | native/lib/hyperliquid-whalealert-mcp |
| 19 | jupiter-mcp | https://github.com/kukapay/jupiter-mcp | native/lib/jupiter-mcp |
| 20 | memecoin-radar-mcp | https://github.com/kukapay/memecoin-radar-mcp | native/lib/memecoin-radar-mcp |
| 21 | polymarket-predictions-mcp | https://github.com/kukapay/polymarket-predictions-mcp.git | native/lib/polymarket-predictions-mcp |
| 22 | rug-check-mcp | https://github.com/kukapay/rug-check-mcp.git | native/lib/rug-check-mcp |
| 23 | uniswap-pools-mcp | https://github.com/kukapay/uniswap-pools-mcp.git | native/lib/uniswap-pools-mcp |
| 24 | uniswap-price-mcp | https://github.com/kukapay/uniswap-price-mcp.git | native/lib/uniswap-price-mcp |
| 25 | uniswap-trader-mcp | https://github.com/kukapay/uniswap-trader-mcp | native/lib/uniswap-trader-mcp |
| 26 | wallet-inspector-mcp | https://github.com/kukapay/wallet-inspector-mcp.git | native/lib/wallet-inspector-mcp |
| 27 | whale-tracker-mcp | https://github.com/kukapay/whale-tracker-mcp | native/lib/whale-tracker-mcp |
| **28** | **binance-alpha-mcp** | **https://github.com/kukapay/binance-alpha-mcp.git** | **native/lib/binance-alpha-mcp** |
| **29** | **bitcoin-utxo-mcp** | **https://github.com/kukapay/bitcoin-utxo-mcp.git** | **native/lib/bitcoin-utxo-mcp** |
| **30** | **defi-yields-mcp** | **https://github.com/kukapay/defi-yields-mcp.git** | **native/lib/defi-yields-mcp** |
| **31** | **ens-mcp** | **https://github.com/kukapay/ens-mcp.git** | **native/lib/ens-mcp** |
| **32** | **hyperliquid-info-mcp** | **https://github.com/kukapay/hyperliquid-info-mcp.git** | **native/lib/hyperliquid-info-mcp** |
| **33** | **nft-analytics-mcp** | **https://github.com/kukapay/nft-analytics-mcp.git** | **native/lib/nft-analytics-mcp** |
| **34** | **pumpfun-wallets-mcp** | **https://github.com/kukapay/pumpfun-wallets-mcp.git** | **native/lib/pumpfun-wallets-mcp** |
| **35** | **raydium-launchlab-mcp** | **https://github.com/kukapay/raydium-launchlab-mcp.git** | **native/lib/raydium-launchlab-mcp** |
| **36** | **sui-trader-mcp** | **https://github.com/kukapay/sui-trader-mcp.git** | **native/lib/sui-trader-mcp** |

---

## Phase 8A Additions (October 2, 2025)

**New MCPs Added:** 9 (out of 10 planned)
**Total MCPs:** 36/63 (57% coverage, up from 43%)

### Successfully Installed
1. **defi-yields-mcp** - DeFi yield aggregator (Python/uv)
2. **nft-analytics-mcp** - NFT market analytics (Python/uv)
3. **bitcoin-utxo-mcp** - Bitcoin UTXO analysis (Python/uv)
4. **hyperliquid-info-mcp** - Hyperliquid market data (Python/uv)
5. **binance-alpha-mcp** - Binance Alpha alerts (Node.js)
6. **ens-mcp** - ENS domain resolver (Python/uv)
7. **pumpfun-wallets-mcp** - Pump.fun wallet tracker (Python/uv)
8. **sui-trader-mcp** - Sui DEX trader (Node.js)
9. **raydium-launchlab-mcp** - Raydium LaunchLab monitor (Node.js)

### Skipped
- **ethereum-validators-queue-mcp** - Repository not found on GitHub (404 error)

---

## Repository Attribution

**Primary Source:** [Kukapay Crypto MCP Suite](https://github.com/kukapay) (35 MCPs)
**External Dependency:** [doggybee/mcp-server-ccxt](https://github.com/doggybee/mcp-server-ccxt) (1 MCP)

---

## Clone Instructions for End Users

### Initial Clone with Submodules

```bash
git clone --recurse-submodules https://github.com/justmy2satoshis/crypto-mcp-suite.git
```

### If Already Cloned Without Submodules

```bash
cd crypto-mcp-suite
git submodule update --init --recursive
```

### Update All Submodules to Latest

```bash
git submodule update --remote --merge
```

---

## Submodule Benefits

1. **Clean Repository Structure:** Main repo doesn't bloat with MCP source code
2. **Version Tracking:** Each submodule tracks its own version independently
3. **Easy Updates:** Pull latest changes from upstream with `git submodule update`
4. **Attribution:** Clear links to original repositories
5. **Collaboration:** Contributors can work on MCPs in their original repos

---

## Technical Notes

**Submodule Configuration File:** `.gitmodules`
**Submodule Metadata:** `.git/modules/native/lib/`
**Tracking:** Submodule commits are tracked as specific SHAs in main repo

**Backup Location:** `native/lib.backup/` (original cloned directories)

---

## Phase 5C Conversion Process

1. ✅ Created backup of original directories (`native/lib.backup/`)
2. ✅ Extracted all 27 GitHub repository URLs
3. ✅ Created this mapping document
4. 🔄 Remove original directories
5. 🔄 Add each MCP as git submodule
6. 🔄 Initialize and update all submodules
7. 🔄 Test 3 working MCPs post-conversion
8. 🔄 Commit submodule configuration

---

**Compiled by:** Claude Code (Sonnet 4.5)
**Repository:** https://github.com/justmy2satoshis/crypto-mcp-suite
**License:** MIT
**Last Updated:** October 2, 2025
