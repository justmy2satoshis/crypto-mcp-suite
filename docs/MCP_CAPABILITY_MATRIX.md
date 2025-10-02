# MCP Capability Matrix
## Crypto MCP Suite - Complete 41 MCP Capability Reference

**Version:** Phase 8D Production-Ready
**Last Updated:** October 2, 2025
**Total MCPs:** 41 (11 Node.js + 30 Python)
**Tier Distribution:** tier5 (36 MCPs) + tier6 (5 MCPs Premium AI)

---

## Table of Contents

1. [Complete MCP Matrix](#complete-mcp-matrix)
2. [Dependency Summary](#dependency-summary)
3. [API Key Cross-Reference](#api-key-cross-reference)
4. [Tier Classification](#tier-classification)
5. [Quick Troubleshooting Index](#quick-troubleshooting-index)

---

## Complete MCP Matrix

### Legend
- **Tier:** FREE (no API keys) | FREEMIUM (free tier available) | PAID (API key required, may have free tier)
- **Runtime:** Node.js | Python (uv)
- **Transport:** stdio (Standard Input/Output) - All MCPs use stdio transport
- **Client Support:** Desktop (Claude Desktop) | Code (Claude Code CLI) | Both
- **Dependencies:** Count of required packages (excluding dev dependencies)
- **Status:** ✅ Production Ready | ⚠️ Requires Config | ❌ Known Issues

---

### Tier 5 MCPs (36 Total)

| # | MCP Name | Tier | Runtime | Transport | Client Support | Dependencies | API Keys Required | Primary Function | Status | Known Issues |
|---|----------|------|---------|-----------|----------------|--------------|-------------------|------------------|--------|--------------|
| 1 | **bridge-rates-mcp** | FREE | Node.js | stdio | Both | 2 (@lifi/sdk, mcp) | None | Cross-chain bridge rate aggregation | ✅ | None |
| 2 | **ccxt-mcp** | FREE | Node.js (TS) | stdio | Both | 6 + 2 dev (ccxt, dotenv, lru-cache, p-queue, rxjs, zod) | None | Multi-exchange trading data via CCXT | ✅ | Requires `npm run build` |
| 3 | **crypto-indicators-mcp** | FREE | Node.js | stdio | Both | 3 (indicatorts, trading-indicator, undici) | None | Technical analysis indicators (RSI, MACD, etc.) | ✅ | None |
| 4 | **binance-alpha-mcp** | FREEMIUM | Node.js | stdio | Both | 4 (mcp, dotenv, ethers, zod) | BINANCE_API_KEY (optional) | Binance Alpha project launches | ✅ | Optional API key for higher limits |
| 5 | **uniswap-trader-mcp** | PAID | Node.js | stdio | Both | 6 (@uniswap/smart-order-router, @uniswap/v3-sdk, dotenv, ethers, tslib, zod) | INFURA_API_KEY + WALLET_PRIVATE_KEY | Uniswap V3 token swaps | ⚠️ | Requires test wallet |
| 6 | **jupiter-mcp** | PAID | Node.js | stdio | Both | 6 (@solana/spl-token, @solana/web3.js, bigint-buffer, dotenv, undici, zod) | PRIVATE_KEY (Solana) | Solana Jupiter DEX swaps | ⚠️ | Requires test wallet |
| 7 | **uniswap-price-mcp** | FREEMIUM | Node.js | stdio | Both | 6 (@thanpolas/univ3prices, dotenv, ethers, https-proxy-agent, zod) | INFURA_API_KEY (free 100k req/day) | Uniswap V3 real-time pricing | ✅ | None |
| 8 | **sui-trader-mcp** | FREE | Node.js | stdio | Both | 4 (@cetusprotocol/aggregator-sdk, bn.js, dotenv, zod) | None | Sui blockchain token swaps | ✅ | None |
| 9 | **raydium-launchlab-mcp** | FREE | Node.js | stdio | Both | 6 (@raydium-io/raydium-sdk-v2, @solana/spl-token, @solana/web3.js, dotenv, https-proxy-agent, pinata) | None | Raydium LaunchLab analytics | ✅ | None |
| 10 | **aave-mcp** | FREEMIUM | Python | stdio | Both | 1 (mcp) | THEGRAPH_API_KEY (free tier) | Aave protocol analytics via TheGraph | ✅ | None |
| 11 | **chainlist-mcp** | FREE | Python | stdio | Both | 2 (mcp, tabulate) | None | EVM chain directory & RPC endpoints | ✅ | None |
| 12 | **crypto-feargreed-mcp** | FREE | Python | stdio | Both | 2 (httpx, mcp) | None | Crypto Fear & Greed Index (real-time + historical) | ✅ | None |
| 13 | **crypto-liquidations-mcp** | FREE | Python | stdio | Both | 2 (mcp, websockets) | None | Real-time liquidation events (Binance) | ✅ | None |
| 14 | **crypto-orderbook-mcp** | FREE | Python | stdio | Both | 4 (ccxt, mcp, pandas, tabulate) | None | Multi-exchange orderbook depth analysis | ✅ | None |
| 15 | **cryptopanic-mcp-server** | FREEMIUM | Python | stdio | Both | 3 (dotenv, mcp, requests) | CRYPTOPANIC_API_KEY (free tier) | Crypto news aggregation | ✅ | None |
| 16 | **crypto-portfolio-mcp** | FREE | Python | stdio | Both | 3 (ccxt, matplotlib, mcp) | None | Portfolio allocation tracking & analysis | ✅ | None |
| 17 | **crypto-projects-mcp** | FREE | Python | stdio | Both | 1 (mcp) | None | Cryptocurrency project data directory | ✅ | None |
| 18 | **crypto-sentiment-mcp** | FREEMIUM | Python | stdio | Both | 2 (mcp, sanpy) | SANTIMENT_API_KEY (free tier) | Social sentiment analysis via Santiment | ✅ | None |
| 19 | **dao-proposals-mcp** | FREE | Python | stdio | Both | 1 (mcp) | None | DAO governance proposal tracking | ✅ | None |
| 20 | **dex-metrics-mcp** | FREE | Python | stdio | Both | 3 (mcp, pandas, tabulate) | None | DEX trading metrics & analytics | ✅ | None |
| 21 | **etf-flow-mcp** | FREE | Python | stdio | Both | 3 (dotenv, mcp, pandas) | None | Crypto ETF flow data tracking | ✅ | None |
| 22 | **funding-rates-mcp** | FREE | Python | stdio | Both | 6 (cachetools, ccxt, dotenv, mcp, pandas, tabulate) | None | Perpetual futures funding rates (arbitrage) | ✅ | None |
| 23 | **honeypot-detector-mcp** | FREE | Python | stdio | Both | 1 (mcp) | None | Token honeypot scam detection | ✅ | None |
| 24 | **hyperliquid-whalealert-mcp** | FREEMIUM | Python | stdio | Both | 2 (mcp, python-dotenv) | COINGLASS_API_KEY (optional) | Hyperliquid large position alerts | ✅ | API key optional |
| 25 | **memecoin-radar-mcp** | FREE | Python | stdio | Both | 2 (mcp, tabulate) | None | Memecoin trending & analytics | ✅ | None |
| 26 | **polymarket-predictions-mcp** | FREE | Python | stdio | Both | 2 (mcp, tabulate) | None | Polymarket prediction market data | ✅ | None |
| 27 | **rug-check-mcp** | FREEMIUM | Python | stdio | Both | 3 (dotenv, mcp, requests) | SOLSNIFFER_API_KEY (free tier) | Solana token rug pull detection | ✅ | None |
| 28 | **uniswap-pools-mcp** | FREEMIUM | Python | stdio | Both | 3 (mcp, pandas, tabulate) | THEGRAPH_API_KEY (free tier) | Uniswap pool analytics via TheGraph | ✅ | None |
| 29 | **wallet-inspector-mcp** | FREEMIUM | Python | stdio | Both | 3 (mcp, python-dotenv, tabulate) | DUNE_API_KEY (free tier) | Wallet analytics via Dune | ✅ | None |
| 30 | **whale-tracker-mcp** | FREEMIUM | Python | stdio | Both | 2 (httpx, mcp) | WHALE_ALERT_API_KEY (free tier) | Large transaction tracking | ✅ | None |
| 31 | **defi-yields-mcp** | FREE | Python | stdio | Both | 1 (mcp) | None | DeFi yield aggregation (DefiLlama) | ✅ | None |
| 32 | **nft-analytics-mcp** | FREEMIUM | Python | stdio | Both | 3 (mcp, pandas, tabulate) | RESERVOIR_API_KEY (optional, 20k req/month free) | NFT market analytics | ✅ | None |
| 33 | **bitcoin-utxo-mcp** | FREE | Python | stdio | Both | 1 (mcp) | None | Bitcoin UTXO analytics (blockchain.info) | ✅ | None |
| 34 | **hyperliquid-info-mcp** | FREE | Python | stdio | Both | 4 (hyperliquid-python-sdk, iso8601, mcp, pillow) | None | Hyperliquid market data | ✅ | None |
| 35 | **ens-mcp** | FREE | Python | stdio | Both | 2 (gql[all], mcp) | None | ENS name resolution (TheGraph public) | ✅ | None |
| 36 | **pumpfun-wallets-mcp** | FREE | Python | stdio | Both | 2 (mcp, tabulate) | None | Pump.fun wallet tracking | ✅ | None |

### Tier 6 MCPs - Premium AI Analytics (5 Total)

| # | MCP Name | Tier | Runtime | Transport | Client Support | Dependencies | API Keys Required | Primary Function | Status | Known Issues |
|---|----------|------|---------|-----------|----------------|--------------|-------------------|------------------|--------|--------------|
| 37 | **tokenmetrics-mcp** | FREEMIUM | Node.js (TS) | stdio | Both | 6 + 10 dev (axios, cors, express, zod) | TOKENMETRICS_API_KEY (FREE tier) | AI-powered token analytics & signals | ✅ | Requires `npm run build`, FREE tier available |
| 38 | **lunarcrush-mcp** | FREEMIUM | Node.js | stdio | Both | 2 (mcp, zod) | LUNARCRUSH_API_KEY (FREE 50 req/day) | Social intelligence & sentiment tracking | ✅ | FREE tier limited to 50 requests/day |
| 39 | **ethereum-validator-queue-mcp** | FREEMIUM | Python | stdio | Both | 1 (mcp) | BEACONCHAIN_API_KEY (optional, 100 req/day free) | ETH validator queue analytics | ✅ | None |
| 40 | **crypto-rss-mcp** | FREE | Python | stdio | Both | 4 (feedparser, html2text, mcp, opml) | None | Customizable RSS feed aggregation | ✅ | None |
| 41 | **crypto-whitepapers-mcp** | FREE | Python | stdio | Both | 8 (agno, duckduckgo-search, fastembed, lancedb, mcp, numpy, pandas, pypdf) | None | Whitepaper research & knowledge base | ✅ | None |

---

## Dependency Summary

### Node.js MCPs (11 Total)

| MCP Name | Total Dependencies | Key Packages | TypeScript | Installation Command |
|----------|-------------------|--------------|------------|---------------------|
| bridge-rates-mcp | 2 | @lifi/sdk, mcp | No | `npm install` |
| ccxt-mcp | 6 prod + 2 dev | ccxt, dotenv, lru-cache, p-queue, rxjs, zod | Yes | `npm install && npm run build` |
| crypto-indicators-mcp | 3 | indicatorts, trading-indicator, undici | No | `npm install` |
| binance-alpha-mcp | 4 | mcp, dotenv, ethers, zod | No | `npm install` |
| uniswap-trader-mcp | 6 | @uniswap/smart-order-router, @uniswap/v3-sdk, ethers | No | `npm install` |
| jupiter-mcp | 6 | @solana/spl-token, @solana/web3.js, dotenv | No | `npm install` |
| uniswap-price-mcp | 6 | @thanpolas/univ3prices, ethers, https-proxy-agent | No | `npm install` |
| sui-trader-mcp | 4 | @cetusprotocol/aggregator-sdk, bn.js, dotenv | No | `npm install` |
| raydium-launchlab-mcp | 6 | @raydium-io/raydium-sdk-v2, @solana/spl-token, @solana/web3.js | No | `npm install` |
| tokenmetrics-mcp | 6 prod + 10 dev | axios, cors, express, zod | Yes | `npm install && npm run build` |
| lunarcrush-mcp | 2 | mcp, zod | No | `npm install` |

**Node.js Total Package Count:**
- bridge-rates-mcp: 167 packages (installed)
- ccxt-mcp: 103 packages (installed)
- crypto-indicators-mcp: 123 packages (installed)
- Others: ~50-100 packages each

### Python MCPs (30 Total)

| MCP Name | Dependencies | Key Packages | Installation Command |
|----------|--------------|--------------|---------------------|
| aave-mcp | 1 | mcp | `uv sync` |
| chainlist-mcp | 2 | mcp, tabulate | `uv sync` |
| crypto-feargreed-mcp | 2 | httpx, mcp | `uv sync` |
| crypto-liquidations-mcp | 2 | mcp, websockets | `uv sync` |
| crypto-orderbook-mcp | 4 | ccxt, mcp, pandas, tabulate | `uv sync` |
| cryptopanic-mcp-server | 3 | dotenv, mcp, requests | `uv sync` |
| crypto-portfolio-mcp | 3 | ccxt, matplotlib, mcp | `uv sync` |
| crypto-projects-mcp | 1 | mcp | `uv sync` |
| crypto-sentiment-mcp | 2 | mcp, sanpy | `uv sync` |
| dao-proposals-mcp | 1 | mcp | `uv sync` |
| dex-metrics-mcp | 3 | mcp, pandas, tabulate | `uv sync` |
| etf-flow-mcp | 3 | dotenv, mcp, pandas | `uv sync` |
| funding-rates-mcp | 6 | cachetools, ccxt, dotenv, mcp, pandas, tabulate | `uv sync` |
| honeypot-detector-mcp | 1 | mcp | `uv sync` |
| hyperliquid-whalealert-mcp | 2 | mcp, python-dotenv | `uv sync` |
| memecoin-radar-mcp | 2 | mcp, tabulate | `uv sync` |
| polymarket-predictions-mcp | 2 | mcp, tabulate | `uv sync` |
| rug-check-mcp | 3 | dotenv, mcp, requests | `uv sync` |
| uniswap-pools-mcp | 3 | mcp, pandas, tabulate | `uv sync` |
| wallet-inspector-mcp | 3 | mcp, python-dotenv, tabulate | `uv sync` |
| whale-tracker-mcp | 2 | httpx, mcp | `uv sync` |
| defi-yields-mcp | 1 | mcp | `uv sync` |
| nft-analytics-mcp | 3 | mcp, pandas, tabulate | `uv sync` |
| bitcoin-utxo-mcp | 1 | mcp | `uv sync` |
| hyperliquid-info-mcp | 4 | hyperliquid-python-sdk, iso8601, mcp, pillow | `uv sync` |
| ens-mcp | 2 | gql[all], mcp | `uv sync` |
| pumpfun-wallets-mcp | 2 | mcp, tabulate | `uv sync` |
| ethereum-validator-queue-mcp | 1 | mcp | `uv sync` |
| crypto-rss-mcp | 4 | feedparser, html2text, mcp, opml | `uv sync` |
| crypto-whitepapers-mcp | 8 | agno, duckduckgo-search, fastembed, lancedb, mcp, numpy, pandas, pypdf | `uv sync` |

---

## API Key Cross-Reference

### Critical API Keys (10 MCPs - Required for Operation)

| API Key | MCPs Using It | Free Tier? | Get Key From | Notes |
|---------|---------------|------------|--------------|-------|
| **TOKENMETRICS_API_KEY** | tokenmetrics-mcp | ✅ Yes | https://tokenmetrics.com/api | FREE tier: basic signals, limited requests |
| **LUNARCRUSH_API_KEY** | lunarcrush-mcp | ✅ Yes (50 req/day) | https://lunarcrush.com/developers | FREE tier: 50 requests/day |
| **INFURA_API_KEY** | uniswap-price-mcp, uniswap-trader-mcp, ens-mcp | ✅ Yes (100k req/day) | https://infura.io/register | FREE tier: 100,000 requests/day |
| **THEGRAPH_API_KEY** | aave-mcp, uniswap-pools-mcp | ✅ Yes | https://thegraph.com/studio/ | FREE tier available |
| **DUNE_API_KEY** | wallet-inspector-mcp | ✅ Yes | https://dune.com/settings/api | FREE tier available |
| **SANTIMENT_API_KEY** | crypto-sentiment-mcp | ✅ Yes | https://app.santiment.net/account | FREE tier available |
| **CRYPTOPANIC_API_KEY** | cryptopanic-mcp-server | ✅ Yes | https://cryptopanic.com/developers/api/ | FREE tier available |
| **SOLSNIFFER_API_KEY** | rug-check-mcp | ✅ Yes | https://solsniffer.com/ | FREE tier available |
| **WALLET_PRIVATE_KEY** | uniswap-trader-mcp | N/A | Your test wallet | ⚠️ Test wallets only (< $10) |
| **PRIVATE_KEY** (Solana) | jupiter-mcp | N/A | Your test wallet | ⚠️ Test wallets only (< $10) |

### Optional API Keys (6 MCPs - FREE Tiers Available)

| API Key | MCPs Using It | Free Tier? | Get Key From | Notes |
|---------|---------------|------------|--------------|-------|
| **BEACONCHAIN_API_KEY** | ethereum-validator-queue-mcp | ✅ Yes (100 req/day) | https://beaconcha.in/api/v1/docs | Optional - improves rate limits |
| **RESERVOIR_API_KEY** | nft-analytics-mcp | ✅ Yes (20k req/month) | https://reservoir.tools/ | Optional - 20k requests/month free |
| **BINANCE_API_KEY** | binance-alpha-mcp | ✅ Yes | https://www.binance.com/en/my/settings/api-management | Optional - higher rate limits |
| **COINGLASS_API_KEY** | hyperliquid-whalealert-mcp | ❌ No (commented out) | https://www.coinglass.com/api | Currently not implemented |
| **WHALE_ALERT_API_KEY** | whale-tracker-mcp | ✅ Yes | https://whale-alert.io/ | FREE tier available |
| **SOLANA_RPC_URL** | jupiter-mcp | Public default | Custom RPC provider | Default: https://api.mainnet-beta.solana.com |

### No API Keys Required (25 MCPs - 100% FREE)

bridge-rates-mcp, ccxt-mcp, crypto-indicators-mcp, sui-trader-mcp, raydium-launchlab-mcp, chainlist-mcp, crypto-feargreed-mcp, crypto-liquidations-mcp, crypto-orderbook-mcp, crypto-portfolio-mcp, crypto-projects-mcp, dao-proposals-mcp, dex-metrics-mcp, etf-flow-mcp, funding-rates-mcp, honeypot-detector-mcp, memecoin-radar-mcp, polymarket-predictions-mcp, defi-yields-mcp, bitcoin-utxo-mcp, hyperliquid-info-mcp, ens-mcp, pumpfun-wallets-mcp, crypto-rss-mcp, crypto-whitepapers-mcp

---

## Tier Classification

### FREE Tier (25 MCPs - No API Keys Required)

**Recommended for:** Initial deployment, proof of concept, free-tier users

| Category | MCPs |
|----------|------|
| **DEX & Trading** | bridge-rates-mcp, ccxt-mcp, sui-trader-mcp, raydium-launchlab-mcp, crypto-orderbook-mcp, funding-rates-mcp |
| **Analytics** | crypto-indicators-mcp, crypto-feargreed-mcp, crypto-liquidations-mcp, dex-metrics-mcp, etf-flow-mcp |
| **Portfolio & Tracking** | crypto-portfolio-mcp, memecoin-radar-mcp, polymarket-predictions-mcp, bitcoin-utxo-mcp |
| **Infrastructure** | chainlist-mcp, crypto-projects-mcp, dao-proposals-mcp, ens-mcp, pumpfun-wallets-mcp |
| **Research & Data** | defi-yields-mcp, hyperliquid-info-mcp, crypto-rss-mcp, crypto-whitepapers-mcp, honeypot-detector-mcp |

### FREEMIUM Tier (10 MCPs - FREE Tiers Available, Paid Upgrades Optional)

**Recommended for:** Production deployment, API rate limits acceptable with free tiers

| MCP | Free Tier Limits | Paid Tier Benefits |
|-----|------------------|-------------------|
| tokenmetrics-mcp | Basic signals, limited requests | Advanced AI signals, higher limits ($25-$100/month) |
| lunarcrush-mcp | 50 requests/day | Higher limits ($29-$999/month) |
| uniswap-price-mcp | 100k requests/day (Infura) | Enterprise limits |
| aave-mcp | TheGraph free tier | Enterprise queries |
| cryptopanic-mcp-server | Free tier available | Higher limits |
| crypto-sentiment-mcp | Santiment free tier | Advanced metrics |
| uniswap-pools-mcp | TheGraph free tier | Enterprise queries |
| wallet-inspector-mcp | Dune free tier | Complex queries |
| rug-check-mcp | SolSniffer free tier | Advanced scans |
| whale-tracker-mcp | Whale Alert free tier | Real-time alerts |

### PAID Tier (6 MCPs - Test Wallets or API Keys Required)

**Recommended for:** Advanced users, trading operations, requires careful configuration

| MCP | Requirements | Security Notes |
|-----|--------------|----------------|
| uniswap-trader-mcp | INFURA_API_KEY + WALLET_PRIVATE_KEY | ⚠️ Use test wallets only (< $10 balance) |
| jupiter-mcp | PRIVATE_KEY (Solana) | ⚠️ Use test wallets only (< $10 balance) |
| nft-analytics-mcp | RESERVOIR_API_KEY (optional) | 20k requests/month free |
| binance-alpha-mcp | BINANCE_API_KEY (optional) | Free tier available |
| ethereum-validator-queue-mcp | BEACONCHAIN_API_KEY (optional) | 100 requests/day free |
| hyperliquid-whalealert-mcp | COINGLASS_API_KEY (optional) | Currently not implemented |

---

## Quick Troubleshooting Index

### Common Issues & Solutions

| Symptom | Affected MCPs | Root Cause | Solution | Reference |
|---------|---------------|------------|----------|-----------|
| `MODULE_NOT_FOUND` | bridge-rates-mcp, ccxt-mcp, crypto-indicators-mcp | Missing node_modules/ | `cd native/lib/<mcp> && npm install` | ERROR_PATTERN_LIBRARY.md §1.1 |
| `.venv missing` | 12 Python MCPs | Missing virtualenv | `cd native/lib/<mcp> && uv sync` | ERROR_PATTERN_LIBRARY.md §4.2 |
| `Script not found: dist/index.js` | ccxt-mcp, tokenmetrics-mcp | TypeScript not compiled | `cd native/lib/<mcp> && npm run build` | ERROR_PATTERN_LIBRARY.md §2.1 |
| `Invalid API key` | 10 API-dependent MCPs | Missing/incorrect .env | Create .env file with correct API key | API_KEY_SETUP_GUIDE.md |
| `401 Unauthorized` | uniswap-price-mcp, aave-mcp, etc. | API key expired/invalid | Regenerate API key, update .env | ERROR_PATTERN_LIBRARY.md §5.1 |
| `uv: command not found` | All Python MCPs | uv not installed | `curl -LsSf https://astral.sh/uv/install.sh \| sh` | ERROR_PATTERN_LIBRARY.md §4.1 |
| PM2 restart loop | Any MCP | Misconfiguration | Check `pm2 logs <mcp-name> --err` | INSTALLATION_GUIDE.md §8 |

### MCP-Specific Known Issues

| MCP | Issue | Workaround | Fixed In |
|-----|-------|------------|----------|
| tokenmetrics-mcp | Wrong path in ecosystem.config.js | Fixed: `dist/index.js` → `build/src/cli.js` | Phase 8D (P0-4 fix) |
| ccxt-mcp | Requires compilation | Run `npm run build` after `npm install` | Phase 8D (P0-3 fix) |
| crypto-indicators-mcp | 1 low severity npm vulnerability | Documented, non-blocking | Known limitation |
| hyperliquid-whalealert-mcp | COINGLASS_API_KEY commented out | Currently not implemented | Future phase |

### Dependency Tree (Key Packages)

**Node.js Ecosystem:**
```
@modelcontextprotocol/sdk (all 11 MCPs)
├── ccxt (ccxt-mcp, crypto-orderbook-mcp, crypto-portfolio-mcp, funding-rates-mcp)
├── ethers (binance-alpha-mcp, uniswap-trader-mcp, uniswap-price-mcp)
├── @solana/web3.js (jupiter-mcp, raydium-launchlab-mcp)
├── @uniswap/* (uniswap-trader-mcp, uniswap-price-mcp)
└── zod (ccxt-mcp, binance-alpha-mcp, uniswap-trader-mcp, jupiter-mcp, uniswap-price-mcp, sui-trader-mcp, tokenmetrics-mcp, lunarcrush-mcp)
```

**Python Ecosystem:**
```
mcp[cli] (all 30 MCPs)
├── pandas (crypto-portfolio-mcp, funding-rates-mcp, etf-flow-mcp, dex-metrics-mcp, uniswap-pools-mcp, nft-analytics-mcp, crypto-orderbook-mcp, crypto-whitepapers-mcp)
├── tabulate (chainlist-mcp, dex-metrics-mcp, memecoin-radar-mcp, polymarket-predictions-mcp, uniswap-pools-mcp, wallet-inspector-mcp, funding-rates-mcp, pumpfun-wallets-mcp, crypto-orderbook-mcp, nft-analytics-mcp)
├── ccxt (crypto-orderbook-mcp, crypto-portfolio-mcp, funding-rates-mcp)
├── requests (cryptopanic-mcp-server, rug-check-mcp)
├── httpx (crypto-feargreed-mcp, whale-tracker-mcp)
└── python-dotenv (wallet-inspector-mcp, hyperliquid-whalealert-mcp)
```

---

## Production Deployment Recommendations

### Phase A: FREE Tier Only (25 MCPs)
**Deployment Time:** ~20 minutes
**API Keys Required:** 0
**Cost:** $0/month

Start with FREE tier MCPs only to validate infrastructure without API key dependencies.

```bash
# Deploy FREE tier preset
pm2 start native/config/ecosystem.config.js --only crypto-plus
```

### Phase B: FREEMIUM Tier (35 MCPs)
**Deployment Time:** ~45 minutes
**API Keys Required:** 10 (all with free tiers)
**Cost:** $0/month (can upgrade later)

Add FREEMIUM MCPs with free-tier API keys for full functionality.

```bash
# Configure API keys in .env.local
# Then deploy enhanced tier
pm2 start native/config/ecosystem.config.js --only enhanced
```

### Phase C: Full Production (41 MCPs)
**Deployment Time:** ~60 minutes
**API Keys Required:** 17+ (10 critical + 6 optional)
**Cost:** $0-$150/month (depending on paid tier usage)

Deploy all 41 MCPs including premium AI analytics.

```bash
# Full deployment with all API keys configured
pm2 start native/config/ecosystem.config.js --only premium-plus
```

---

## Next Steps

1. ✅ **Validate Dependencies** - Use `scripts/validate-mcp-dependencies.js` (Phase 5)
2. ✅ **Test API Keys** - Use `scripts/test-api-keys.sh` (Phase 5)
3. ✅ **Run Health Check** - Use `scripts/health-check.js` (Phase 5)
4. ✅ **Review Checklist** - Follow PRE_DEPLOYMENT_CHECKLIST.md (Phase 4)
5. ✅ **Monitor Logs** - Use `pm2 logs` to verify all MCPs are online

---

## References

- **Installation Guide:** [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)
- **Error Patterns:** [ERROR_PATTERN_LIBRARY.md](ERROR_PATTERN_LIBRARY.md)
- **API Key Setup:** [API_KEY_SETUP_GUIDE.md](../API_KEY_SETUP_GUIDE.md)
- **Deployment Checklist:** [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) (Phase 4)
- **MCP Status Report:** [MCP_INSTALLATION_STATUS.md](../MCP_INSTALLATION_STATUS.md)
- **Phase 8D Report:** [PHASE_8D_COMPLETION_REPORT.md](../PHASE_8D_COMPLETION_REPORT.md)

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude <noreply@anthropic.com>
