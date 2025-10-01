# Phase 8: Installation Roadmap
**Project**: Crypto MCP Suite Infrastructure
**Date**: October 2, 2025
**Phase**: 8 - Installation Roadmap & Implementation Guide
**Status**: ✅ COMPLETE

---

## Executive Summary

This installation roadmap provides a **phased approach** to expanding the Crypto MCP Suite from **43% coverage (27/63 MCPs)** to potential **100% coverage**, organized into three implementation phases with clear priorities, time estimates, and API requirements.

### Roadmap Overview

| Phase | Focus | MCPs | Timeline | Effort | Cost | Coverage |
|-------|-------|------|----------|--------|------|----------|
| **8A: Critical Gaps** | Fill missing capabilities | 10 | 2-3 weeks | 25-35 hours | $0/month | 27 → 37 (59%) |
| **8B: Enhanced Coverage** | Redundancy + breadth | 15 | 3-4 weeks | 30-40 hours | $0-$50/month | 37 → 52 (83%) |
| **8C: Complete Suite** | Specialized features | 11 | 2 weeks | 15-20 hours | $0-$100/month | 52 → 63 (100%) |
| **TOTAL** | All phases | **36** | **7-9 weeks** | **70-95 hours** | **$0-$150/month** | **100%** |

---

## Phase 8A: Critical Gaps (Next 10 MCPs)

**Objective**: Fill the most critical capability gaps to achieve 90% functional completeness.

**Timeline**: 2-3 weeks (parallel installation possible)
**Estimated Effort**: 25-35 hours
**Monthly Cost**: $0 (all use free APIs)
**Coverage Target**: 27 → 37 MCPs (59%)

---

### Installation Order with Rationale

#### Week 1: Foundation MCPs (5 MCPs, 12-15 hours)

**A1. defi-yields-mcp** ⭐ HIGHEST PRIORITY
**Repository**: https://github.com/kukapay/defi-yields-mcp
**Installation Time**: 2-3 hours

**Why First**:
- ✅ **CRITICAL GAP**: Currently only have aave-mcp (single protocol)
- ✅ Aggregates 1,000+ DeFi pools across 20+ chains
- ✅ Essential for institutional DeFi portfolio management
- ✅ Free API (DeFiLlama - no rate limits)
- ✅ Easy installation (Python/uv, no complex dependencies)

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/defi-yields-mcp.git
cd defi-yields-mcp
uv sync  # Install dependencies
uv run main.py  # Test server
```

**Configuration** (ecosystem.config.js):
```javascript
{
  name: 'defi-yields-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/defi-yields-mcp',
  env: {
    PORT: '3067',
    DEFILLAMA_API_URL: 'https://yields.llama.fi/pools'  // Free API
  }
}
```

**API Requirements**:
- DeFiLlama API: FREE (no key required, no rate limits)
- Documentation: https://defillama.com/docs/api

**Expected Outcome**: Comprehensive DeFi yield tracking (1,000+ pools)

---

**A2. nft-analytics-mcp** ⭐ HIGHEST PRIORITY
**Repository**: https://github.com/kukapay/nft-analytics-mcp
**Installation Time**: 2-3 hours

**Why Second**:
- ✅ **CRITICAL GAP**: Currently NO NFT collection analytics
- ✅ Essential for institutional crypto portfolios (NFTs are $20B+ market)
- ✅ Free APIs (OpenSea, Blur)
- ✅ Easy installation (Python/uv)

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/nft-analytics-mcp.git
cd nft-analytics-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'nft-analytics-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/nft-analytics-mcp',
  env: {
    PORT: '3068',
    OPENSEA_API_KEY: process.env.OPENSEA_API_KEY || 'none',  // Optional (free tier)
    BLUR_API_URL: 'https://api.blur.io/v1'  // Free API
  }
}
```

**API Requirements**:
- OpenSea API: FREE tier available (no key needed for basic queries)
- Blur API: FREE (public data)
- Reservoir API: FREE (NFT data aggregator)

**Expected Outcome**: NFT floor prices, volume, rarity analysis

---

**A3. bitcoin-utxo-mcp** ⭐ HIGHEST PRIORITY
**Repository**: https://github.com/kukapay/bitcoin-utxo-mcp
**Installation Time**: 4-6 hours (medium complexity)

**Why Third**:
- ✅ **CRITICAL GAP**: Bitcoin is 50% of crypto market cap, no Bitcoin-specific on-chain analysis
- ✅ Institutional demand: Bitcoin UTXO metrics are essential for serious investors
- ✅ Free API (Bitcoin RPC or blockchain.info)
- ⚠️ Medium complexity: Requires Bitcoin RPC endpoint or external API setup

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/bitcoin-utxo-mcp.git
cd bitcoin-utxo-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'bitcoin-utxo-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/bitcoin-utxo-mcp',
  env: {
    PORT: '3069',
    BITCOIN_RPC_URL: process.env.BITCOIN_RPC_URL || 'https://blockstream.info/api',  // Free public API
    NETWORK: 'mainnet'
  }
}
```

**API Requirements**:
- **Option 1 (Easy)**: Blockstream.info API (FREE, no key, rate limits apply)
- **Option 2 (Better)**: Self-hosted Bitcoin node (FREE but requires setup)
- **Option 3 (Best)**: QuickNode Bitcoin RPC ($9/month)

**Expected Outcome**: Bitcoin UTXO analysis, coin days destroyed, HODL waves

---

**A4. hyperliquid-info-mcp**
**Repository**: https://github.com/kukapay/hyperliquid-info-mcp
**Installation Time**: 2-3 hours

**Why Fourth**:
- ✅ Official Hyperliquid API (better than hyperliquid-whalealert-mcp's CoinGlass API)
- ✅ Hyperliquid is #1 on-chain perpetual DEX ($2B+ daily volume)
- ✅ Free API (official Hyperliquid)
- ✅ Easy installation

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/hyperliquid-info-mcp.git
cd hyperliquid-info-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'hyperliquid-info-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/hyperliquid-info-mcp',
  env: {
    PORT: '3070',
    HYPERLIQUID_API_URL: 'https://api.hyperliquid.xyz/info'  // Free official API
  }
}
```

**API Requirements**:
- Hyperliquid official API: FREE (no key, no rate limits)

**Expected Outcome**: Hyperliquid perpetual market data, funding rates, liquidations

**Note**: Consider removing or keeping hyperliquid-whalealert-mcp depending on need for CoinGlass derivatives data.

---

**A5. binance-alpha-mcp**
**Repository**: https://github.com/kukapay/binance-alpha-mcp
**Installation Time**: 2-3 hours

**Why Fifth**:
- ✅ Early-stage CEX token launches (10-100x potential)
- ✅ First-mover advantage for speculative trades
- ✅ Free API (Binance public)
- ⚠️ High risk: 99% of launches fail within 30 days

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/binance-alpha-mcp.git
cd binance-alpha-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'binance-alpha-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/binance-alpha-mcp',
  env: {
    PORT: '3071',
    BINANCE_API_URL: 'https://api.binance.com/api/v3'  // Free public API
  }
}
```

**API Requirements**:
- Binance API: FREE (public data, no key for market data)

**Expected Outcome**: Binance Alpha launch alerts, initial price discovery

---

#### Week 2-3: Advanced On-Chain (5 MCPs, 13-20 hours)

**A6. ens-mcp**
**Repository**: https://github.com/kukapay/ens-mcp
**Installation Time**: 2-3 hours

**Why Install**:
- ✅ ENS domain resolution (name ↔ address)
- ✅ Growing use case: ENS is digital identity for crypto
- ✅ Free API (Ethereum RPC)

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/ens-mcp.git
cd ens-mcp
npm install  # Node.js MCP
npm start  # Test server
```

**Configuration**:
```javascript
{
  name: 'ens-mcp',
  script: 'src/index.js',
  cwd: 'native/lib/ens-mcp',
  env: {
    PORT: '3072',
    ETHEREUM_RPC_URL: process.env.INFURA_ENDPOINT || 'https://cloudflare-eth.com'  // Free public RPC
  }
}
```

**API Requirements**:
- Ethereum RPC: FREE (use existing Infura key or public RPCs)

**Expected Outcome**: ENS domain resolution, metadata, sales history

---

**A7. ethereum-validators-queue-mcp**
**Repository**: https://github.com/kukapay/ethereum-validators-queue-mcp
**Installation Time**: 2-3 hours

**Why Install**:
- ✅ Ethereum staking queue status
- ✅ Institutional demand: Many institutions run validators
- ✅ Free API (Beacon Chain)

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/ethereum-validators-queue-mcp.git
cd ethereum-validators-queue-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'ethereum-validators-queue-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/ethereum-validators-queue-mcp',
  env: {
    PORT: '3073',
    BEACON_CHAIN_API_URL: 'https://beaconcha.in/api/v1'  // Free API
  }
}
```

**API Requirements**:
- Beaconcha.in API: FREE (no key, rate limits apply)
- Alternative: Ethereum Beacon Chain node (self-hosted, free)

**Expected Outcome**: Validator queue metrics, staking rewards

---

**A8. pumpfun-wallets-mcp**
**Repository**: https://github.com/kukapay/pumpfun-wallets-mcp
**Installation Time**: 2-3 hours

**Why Install**:
- ✅ Pump.fun wallet behavior analysis
- ✅ Complements memecoin-radar-mcp (launch detection)
- ✅ Free API (Solana RPC)

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/pumpfun-wallets-mcp.git
cd pumpfun-wallets-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'pumpfun-wallets-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/pumpfun-wallets-mcp',
  env: {
    PORT: '3074',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',  // Free public RPC
    PUMPFUN_PROGRAM_ID: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'  // Pump.fun program
  }
}
```

**API Requirements**:
- Solana RPC: FREE (public endpoint) or $99/month (Helius Pro)

**Expected Outcome**: Pump.fun trader insights, wallet profitability

---

**A9. sui-trader-mcp**
**Repository**: https://github.com/kukapay/sui-trader-mcp
**Installation Time**: 4-6 hours (medium complexity)

**Why Install**:
- ✅ Sui blockchain DEX trading (Cetus, Turbos)
- ⚠️ Sui TVL: $1.5B (smaller than Ethereum/Solana but growing)
- ⚠️ Medium complexity: Sui SDK setup

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/sui-trader-mcp.git
cd sui-trader-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'sui-trader-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/sui-trader-mcp',
  env: {
    PORT: '3075',
    SUI_RPC_URL: 'https://fullnode.mainnet.sui.io:443',  // Free public RPC
    WALLET_PRIVATE_KEY: process.env.SUI_WALLET_PRIVATE_KEY  // Optional (for trading)
  }
}
```

**API Requirements**:
- Sui RPC: FREE (public endpoint)
- Optional: Sui wallet private key (for trading)

**Expected Outcome**: Sui DEX trading (Cetus, Turbos Finance)

---

**A10. raydium-launchlab-mcp**
**Repository**: https://github.com/kukapay/raydium-launchlab-mcp
**Installation Time**: 2-3 hours

**Why Install**:
- ✅ Raydium LaunchLab token launch tracking
- ✅ Complements jupiter-mcp (Solana trading)
- ✅ Free API (Solana RPC + Raydium)

**Installation Steps**:
```bash
cd native/lib
git submodule add https://github.com/kukapay/raydium-launchlab-mcp.git
cd raydium-launchlab-mcp
uv sync
uv run main.py
```

**Configuration**:
```javascript
{
  name: 'raydium-launchlab-mcp',
  script: 'uv',
  args: 'run main.py',
  cwd: 'native/lib/raydium-launchlab-mcp',
  env: {
    PORT: '3076',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    RAYDIUM_API_URL: 'https://api.raydium.io/v2'  // Free API
  }
}
```

**API Requirements**:
- Solana RPC: FREE
- Raydium API: FREE

**Expected Outcome**: Raydium LaunchLab launch alerts

---

### Phase 8A Summary

**Installations Completed**: 10 MCPs
**Coverage**: 27 → 37 MCPs (59%)
**Critical Gaps Filled**:
- ✅ DeFi yield aggregation (1,000+ pools)
- ✅ NFT collection analytics
- ✅ Bitcoin on-chain analysis
- ✅ Hyperliquid official API
- ✅ Binance Alpha launches
- ✅ ENS domain resolution
- ✅ ETH validator tracking
- ✅ Pump.fun wallet insights
- ✅ Sui blockchain trading
- ✅ Raydium LaunchLab

**Total Effort**: 25-35 hours (parallelizable across 2-3 weeks)
**Total Cost**: $0/month (all use free APIs)

---

## Phase 8B: Enhanced Coverage (Next 15 MCPs)

**Objective**: Add redundancy and breadth for reliability and comprehensive market coverage.

**Timeline**: 3-4 weeks
**Estimated Effort**: 30-40 hours
**Monthly Cost**: $0-$50/month
**Coverage Target**: 37 → 52 MCPs (83%)

---

### Installation Categories

#### Category 1: DEX Expansion (5 MCPs, 10-15 hours)

**B1. uniswap-poolspy-mcp**
**Why**: Real-time new Uniswap pool alerts
**Time**: 2 hours
**Cost**: $0

**B2. pancakeswap-poolspy-mcp**
**Why**: PancakeSwap (BSC) pool monitoring
**Time**: 2 hours
**Cost**: $0

**B3. aster-info-mcp**
**Why**: Aster DEX analytics (niche)
**Time**: 2 hours
**Cost**: $0

**B4. pumpswap-mcp**
**Why**: PumpSwap memecoin DEX
**Time**: 2 hours
**Cost**: $0

**B5. freqtrade-mcp**
**Why**: Freqtrade bot integration
**Time**: 8-12 hours (complex)
**Cost**: $0 (self-hosted bot required)

**Installation Order**: B1 → B2 → B3 → B4 → B5 (freqtrade last due to complexity)

---

#### Category 2: Bridge Analytics (2 MCPs, 4 hours)

**B6. bridge-metrics-mcp**
**Why**: Bridge volume analytics (complements bridge-rates-mcp)
**Time**: 2 hours
**Cost**: $0

**B7. wormhole-metrics-mcp**
**Why**: Wormhole-specific deep metrics
**Time**: 2 hours
**Cost**: $0

**Note**: Partially redundant with bridge-rates-mcp, but adds historical analytics.

---

#### Category 3: News Expansion (3 MCPs, 6 hours)

**B8. cointelegraph-mcp**
**Why**: Cointelegraph news feed
**Time**: 2 hours
**Cost**: $0
**Redundancy**: 95% redundant with cryptopanic-mcp

**B9. blockbeats-mcp**
**Why**: Chinese crypto news (BlockBeats)
**Time**: 2 hours
**Cost**: $0
**Unique**: Chinese market coverage

**B10. crypto-rss-mcp**
**Why**: Generic RSS aggregation
**Time**: 2 hours
**Cost**: $0
**Redundancy**: 90% redundant with cryptopanic-mcp

**Recommendation**: Only install blockbeats-mcp if Chinese market coverage is needed. Skip cointelegraph-mcp and crypto-rss-mcp (redundant).

---

#### Category 4: Market Data (2 MCPs, 4 hours)

**B11. crypto-stocks-mcp**
**Why**: Crypto-related stocks (COIN, MSTR, HOOD)
**Time**: 2 hours
**Cost**: $0
**Note**: Out of scope (equities, not crypto assets), but useful for correlation analysis

**B12. crypto-funds-mcp**
**Why**: Crypto fund tracking (GBTC, ETHE)
**Time**: 2 hours
**Cost**: $0
**Redundancy**: Partial overlap with etf-flow-mcp

---

#### Category 5: Utilities (3 MCPs, 6 hours)

**B13. crypto-news-mcp**
**Why**: Generic news aggregation
**Time**: 2 hours
**Cost**: $0
**Redundancy**: 90% redundant with cryptopanic-mcp

**B14. crypto-whitepapers-mcp**
**Why**: Whitepaper database and search
**Time**: 2 hours
**Cost**: $0
**Value**: Low (manual alternatives exist)

**B15. bsc-multisend-mcp**
**Why**: BSC bulk token transfers
**Time**: 2 hours
**Cost**: $0
**Use Case**: Niche (administrative tool)

---

### Phase 8B Summary

**Installations**: 15 MCPs
**Coverage**: 37 → 52 MCPs (83%)
**Focus**: Redundancy, breadth, niche markets
**Total Effort**: 30-40 hours
**Total Cost**: $0-$50/month

**Recommendation**: Prioritize non-redundant MCPs (blockbeats-mcp, crypto-stocks-mcp, freqtrade-mcp). Skip redundant news MCPs unless specific use case requires them.

---

## Phase 8C: Complete Suite (Final 11 MCPs)

**Objective**: Achieve 100% coverage with specialized and low-priority MCPs.

**Timeline**: 2 weeks
**Estimated Effort**: 15-20 hours
**Monthly Cost**: $0-$100/month
**Coverage Target**: 52 → 63 MCPs (100%)

---

### Installation List

#### Specialized Utilities (3 MCPs)

**C1. token-minter-mcp**
**Why**: Token contract deployment (ERC-20, SPL)
**Time**: 4 hours (medium complexity)
**Cost**: $0 (gas only)
**Use Case**: Development/testing

**C2. token-revoke-mcp**
**Why**: Token approval revocation (security)
**Time**: 2 hours
**Cost**: $0
**Use Case**: Security management

**C3. bsc-multisend-mcp** (if not installed in Phase 8B)
**Why**: Bulk transfers
**Time**: 2 hours
**Cost**: $0

---

#### Redundant MCPs (5 MCPs)

**C4-C8**: Redundant MCPs only if specific use cases require:
- crypto-news-mcp (redundant with cryptopanic-mcp)
- cointelegraph-mcp (redundant)
- crypto-rss-mcp (redundant)
- bridge-metrics-mcp (partially redundant)
- wormhole-metrics-mcp (partially redundant)

**Recommendation**: Skip these unless specific requirements arise.

---

#### Out-of-Scope / Do Not Install (8+ MCPs)

**DO NOT INSTALL**:
- modbus-mcp (Industrial IoT, not crypto)
- opcua-mcp (Industrial IoT, not crypto)
- nearby-search-mcp (Location services, not crypto)
- hf-trending-mcp (Hugging Face models, not crypto)
- whattimeisit-mcp (Time utility, trivial)
- whereami-mcp (IP geolocation, not crypto)
- whoami-mcp (Identity utility, trivial)
- twitter-username-changes-mcp (Twitter tracking, not crypto)
- **tornado-cash-mcp** ❌ REGULATORY CONCERNS (OFAC sanctions)

---

### Phase 8C Summary

**Installations**: 3-11 MCPs (depending on redundancy tolerance)
**Coverage**: 52 → 60-63 MCPs (95-100%)
**Focus**: Specialized utilities, optional redundancy
**Total Effort**: 15-20 hours
**Total Cost**: $0-$100/month

**Final Note**: 62/63 coverage is acceptable (excluding tornado-cash-mcp due to regulatory concerns).

---

## Complete Roadmap Timeline

### Gantt Chart (Text Format)

```
Week 1-2:   [Phase 8A: Critical Gaps - 5 MCPs]
            defi-yields, nft-analytics, bitcoin-utxo, hyperliquid-info, binance-alpha

Week 2-3:   [Phase 8A: Advanced On-Chain - 5 MCPs]
            ens, ethereum-validators, pumpfun-wallets, sui-trader, raydium-launchlab

Week 4-5:   [Phase 8B: DEX Expansion - 5 MCPs]
            uniswap-poolspy, pancakeswap-poolspy, aster-info, pumpswap, freqtrade

Week 5-6:   [Phase 8B: Analytics & News - 7 MCPs]
            bridge-metrics, wormhole-metrics, blockbeats, crypto-stocks, crypto-funds

Week 6-7:   [Phase 8B: Utilities - 3 MCPs]
            crypto-whitepapers, bsc-multisend, token utilities

Week 7-9:   [Phase 8C: Specialized - 3-11 MCPs]
            token-minter, token-revoke, optional redundant MCPs

Total Duration: 7-9 weeks (parallel work reduces to 5-6 weeks)
```

---

## API Key Management

### API Keys Required (Phase 8A-C)

| Service | MCPs Using | Free Tier | Paid Tier | Required Phase |
|---------|------------|-----------|-----------|----------------|
| DeFiLlama | defi-yields-mcp | ✅ Unlimited | N/A | 8A |
| OpenSea | nft-analytics-mcp | ✅ Basic queries | $0-$50/mo | 8A |
| Blockstream.info | bitcoin-utxo-mcp | ✅ Rate limited | N/A | 8A |
| QuickNode (BTC) | bitcoin-utxo-mcp | ❌ None | $9/mo | 8A (optional) |
| Hyperliquid | hyperliquid-info-mcp | ✅ Unlimited | N/A | 8A |
| Binance | binance-alpha-mcp | ✅ Public data | N/A | 8A |
| Beaconcha.in | ethereum-validators-mcp | ✅ Rate limited | N/A | 8A |
| Raydium | raydium-launchlab-mcp | ✅ Unlimited | N/A | 8A |
| Yahoo Finance | crypto-stocks-mcp | ✅ Unlimited | N/A | 8B |
| All Phase 8B/8C | Various | ✅ Mostly free | $0-$50/mo | 8B-8C |

**Total Cost**:
- **Phase 8A**: $0/month (all free)
- **Phase 8B**: $0-$50/month (optional paid tiers for better performance)
- **Phase 8C**: $0-$100/month (specialized use cases)

---

## Testing & Validation

### Integration Testing Checklist

After each phase, run comprehensive integration tests:

**Phase 8A Validation**:
```bash
# Test all 10 new MCPs
cd native/lib

# Test defi-yields-mcp
curl http://localhost:3067/health
curl http://localhost:3067/api/pools | jq '.[:5]'  # Top 5 pools

# Test nft-analytics-mcp
curl http://localhost:3068/health
curl http://localhost:3068/api/collection/boredapeyachtclub | jq

# Test bitcoin-utxo-mcp
curl http://localhost:3069/health
curl http://localhost:3069/api/utxo/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh | jq

# ... repeat for all 10 MCPs
```

**PM2 Health Check**:
```bash
pm2 status  # Verify all 37 MCPs running
pm2 logs --lines 50  # Check for errors
```

---

## Rollback Plan

If installation fails:

1. **Remove submodule**:
```bash
cd native/lib
git submodule deinit -f <mcp-name>
git rm -f <mcp-name>
rm -rf .git/modules/native/lib/<mcp-name>
```

2. **Remove from PM2 config**:
```bash
# Edit ecosystem.config.js, remove MCP entry
pm2 delete <mcp-name>
pm2 save
```

3. **Rollback to previous commit**:
```bash
git reset --hard HEAD~1
git submodule update --init --recursive
```

---

## Success Criteria

### Phase 8A Success Metrics
- ✅ All 10 MCPs installed and running
- ✅ Health checks passing (200 OK)
- ✅ API endpoints responding correctly
- ✅ No errors in PM2 logs
- ✅ Coverage: 59% (27 → 37 MCPs)
- ✅ Cost: $0/month maintained

### Phase 8B Success Metrics
- ✅ 15 MCPs installed (total 52)
- ✅ Coverage: 83%
- ✅ Redundancy: Multi-source data validation working
- ✅ Cost: < $50/month

### Phase 8C Success Metrics
- ✅ 11 MCPs installed (total 63)
- ✅ Coverage: 100% (or 98% if excluding tornado-cash-mcp + out-of-scope)
- ✅ All functional categories covered
- ✅ Cost: < $150/month

---

## Maintenance Plan

### Weekly Tasks
- Monitor PM2 status (`pm2 status`)
- Check error logs (`pm2 logs --err --lines 100`)
- Review API usage (avoid rate limits)

### Monthly Tasks
- Update git submodules (`git submodule update --remote --merge`)
- Run integration tests
- Review API costs and optimize

### Quarterly Tasks
- Evaluate new MCPs from Kukapay
- Remove unused/redundant MCPs
- Update API keys (rotate)

---

## Conclusion

This installation roadmap provides a **phased approach** to expanding the Crypto MCP Suite from **43% to 100% coverage** over **7-9 weeks**:

- **Phase 8A (2-3 weeks)**: 10 critical MCPs filling major gaps
- **Phase 8B (3-4 weeks)**: 15 MCPs adding redundancy and breadth
- **Phase 8C (2 weeks)**: 11 specialized MCPs for complete coverage

**Total Effort**: 70-95 hours (parallelizable)
**Total Cost**: $0-$150/month (free tier → selective paid tiers)

**Recommended Approach**: Execute **Phase 8A immediately** (critical gaps, $0/month cost), then evaluate **Phase 8B/8C** based on specific institutional requirements.

---

**Compiled by**: Claude Code (Sonnet 4.5) - Blockchain Developer + Data Architect + Systems Integration Engineer
**Repository**: https://github.com/justmy2satoshis/crypto-mcp-suite
**License**: MIT
**Phase 8 Status**: ✅ Installation Roadmap Complete
**Last Updated**: October 2, 2025
