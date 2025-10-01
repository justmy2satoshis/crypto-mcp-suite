# MCPs Ready to Add to Crypto-MCP-Suite

**Date:** 2025-10-01
**Status:** Verified and ready for implementation
**Source:** FREE_TIER_VERIFICATION.md + Advanced MCP Research

---

## 🎯 Priority 1: CCXT MCP (USER HIGHEST PRIORITY)

### CCXT MCP
**GitHub:** https://github.com/doggybee/mcp-server-ccxt
**License:** MIT (completely free)
**Implementation:** Node.js/TypeScript
**Free Tier:** Yes (open source, no API key for public data)

**Features:**
- Unified API for 150+ cryptocurrency exchanges
- Real-time market data (OHLCV, ticker, orderbook)
- Trading operations (with exchange API keys)
- WebSocket support for live data
- No API key required for public market data
- Exchange-specific API keys only for private trading

**Configuration:**
```javascript
// ecosystem.config.js
{
  name: 'ccxt-mcp',
  script: 'lib/ccxt-mcp/server.js',
  env: {
    PORT: '3041',
    EXCHANGE_API_KEYS: process.env.EXCHANGE_API_KEYS || '{}' // Optional
  }
}
```

**Priority:** **HIGHEST** - User explicitly requested

---

## 🔥 Priority 2: Kukapay Suite (6 MCPs)

### 1. Crypto Indicators MCP
**GitHub:** https://github.com/kukapay/crypto-indicators-mcp
**Implementation:** Python
**Free Tier:** Yes (local calculation, no API key)

**Features:**
- 50+ technical indicators (RSI, MACD, Bollinger Bands, Stochastic, etc.)
- Trading strategy signals
- Pattern recognition
- Real-time analysis
- No external API required

**Configuration:**
```javascript
{
  name: 'crypto-indicators-mcp',
  script: 'lib/crypto-indicators-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3042',
    CACHE_ENABLED: 'true'
  }
}
```

---

### 2. Crypto Fear & Greed Index MCP
**GitHub:** https://github.com/kukapay/crypto-feargreed-mcp
**Implementation:** Python
**Free Tier:** Yes (no API key required)

**Features:**
- Real-time Fear & Greed Index (0-100 scale)
- Historical index data
- Market sentiment indicator
- Uses alternative.me API (free, no key)

**Configuration:**
```javascript
{
  name: 'crypto-feargreed-mcp',
  script: 'lib/crypto-feargreed-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3043'
  }
}
```

**Priority:** HIGH - No API key required

---

### 3. Crypto Portfolio MCP
**GitHub:** https://github.com/kukapay/crypto-portfolio-mcp
**Implementation:** Python
**Free Tier:** Yes (local portfolio tracking)

**Features:**
- Portfolio allocation tracking
- Real-time portfolio queries
- Portfolio optimization strategies
- Multi-asset support
- No external API required for basic tracking

**Configuration:**
```javascript
{
  name: 'crypto-portfolio-mcp',
  script: 'lib/crypto-portfolio-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3044',
    PORTFOLIO_DATA_PATH: process.env.PORTFOLIO_DATA_PATH || './data/portfolio.json'
  }
}
```

---

### 4. Hyperliquid Whale Alert MCP
**GitHub:** https://github.com/kukapay/hyperliquid-whalealert-mcp
**Implementation:** Python
**Free Tier:** Yes (Hyperliquid API is free)

**Features:**
- Real-time whale alerts on Hyperliquid DEX
- Large position monitoring
- Hyperliquid-specific tracking
- Free Hyperliquid API access

**Configuration:**
```javascript
{
  name: 'hyperliquid-whalealert-mcp',
  script: 'lib/hyperliquid-whalealert-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3045',
    MIN_POSITION_SIZE: process.env.HYPERLIQUID_MIN_POSITION || '100000'
  }
}
```

---

### 5. Crypto Orderbook MCP
**GitHub:** https://github.com/kukapay/crypto-orderbook-mcp
**Implementation:** Python
**Free Tier:** Yes (uses CCXT for exchange data)

**Features:**
- Order book depth analysis
- Order book imbalance detection
- Major crypto exchanges support
- Market microstructure analysis
- Works with CCXT library

**Configuration:**
```javascript
{
  name: 'crypto-orderbook-mcp',
  script: 'lib/crypto-orderbook-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3046',
    EXCHANGE_API_KEYS: process.env.EXCHANGE_API_KEYS || '{}' // Same as CCXT
  }
}
```

---

### 6. CryptoPanic MCP (Needs API Tier Verification)
**Repository:** kukapay/cryptopanic-mcp
**Implementation:** Python
**Free Tier:** ⚠️ Requires CryptoPanic API key (tier TBD)

**Features:**
- Real-time crypto news aggregation
- Social sentiment analysis
- Video content integration
- Configurable pagination (up to 10 pages)

**Configuration:**
```javascript
{
  name: 'cryptopanic-mcp',
  script: 'lib/cryptopanic-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3047',
    CRYPTOPANIC_API_KEY: process.env.CRYPTOPANIC_API_KEY
  }
}
```

**Status:** VERIFIED - Pending CryptoPanic API tier verification

---

### 7. Whale Tracker MCP (Needs API Tier Verification)
**GitHub:** https://github.com/kukapay/whale-tracker-mcp
**Implementation:** Python
**Free Tier:** ⚠️ Requires Whale Alert API key (tier TBD)

**Features:**
- Real-time whale transaction monitoring
- Cross-blockchain tracking
- Configurable transaction size filters
- Detailed transaction analysis

**Configuration:**
```javascript
{
  name: 'whale-tracker-mcp',
  script: 'lib/whale-tracker-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3048',
    WHALE_ALERT_API_KEY: process.env.WHALE_ALERT_API_KEY,
    MIN_TRANSACTION_USD: process.env.MIN_WHALE_TRANSACTION || '1000000'
  }
}
```

**Status:** VERIFIED - Pending Whale Alert API tier verification

---

### 8. Crypto Sentiment MCP (Needs API Tier Verification)
**GitHub:** https://github.com/kukapay/crypto-sentiment-mcp
**Implementation:** Python
**Free Tier:** ⚠️ Needs API tier verification

**Features:**
- Cryptocurrency sentiment analysis
- Real-time sentiment data
- Market mood tracking

**Configuration:**
```javascript
{
  name: 'crypto-sentiment-mcp',
  script: 'lib/crypto-sentiment-mcp/server.py',
  interpreter: 'python3',
  env: {
    PORT: '3049',
    SENTIMENT_API_KEY: process.env.SENTIMENT_API_KEY // TBD
  }
}
```

**Status:** VERIFIED - Pending sentiment API tier verification

---

## 📊 Summary

### Ready to Add Immediately (No API Key or Free API)
1. ✅ **CCXT MCP** (Port 3041) - HIGHEST PRIORITY
2. ✅ **Crypto Indicators MCP** (Port 3042)
3. ✅ **Crypto Fear & Greed Index MCP** (Port 3043)
4. ✅ **Crypto Portfolio MCP** (Port 3044)
5. ✅ **Hyperliquid Whale Alert MCP** (Port 3045)
6. ✅ **Crypto Orderbook MCP** (Port 3046)

**Total:** 6 MCPs ready for immediate addition

### Pending API Tier Verification
7. ⚠️ **CryptoPanic MCP** (Port 3047) - Needs CryptoPanic API tier check
8. ⚠️ **Whale Tracker MCP** (Port 3048) - Needs Whale Alert API tier check
9. ⚠️ **Crypto Sentiment MCP** (Port 3049) - Needs sentiment API check

**Total:** 3 MCPs pending verification

---

## 🔧 Implementation Requirements

### Node.js MCPs (1)
- CCXT MCP: Requires Node.js 18+ and npm packages

### Python MCPs (8)
- All kukapay MCPs: Require Python 3.8+ and pip packages
- Each has requirements.txt in GitHub repo

### Port Allocation
- Ports 3041-3049 assigned (Tier 5 - New Additions)
- No conflicts with existing ports 3001-3034

### Dependencies
- **CCXT MCP:** npm install ccxt
- **Kukapay MCPs:** pip install -r requirements.txt (per repo)
- **Database:** Optional (some MCPs can cache data)

---

## 📋 Next Actions

1. **Clone Repositories:**
   ```bash
   cd native/lib
   git clone https://github.com/doggybee/mcp-server-ccxt ccxt-mcp
   git clone https://github.com/kukapay/crypto-indicators-mcp
   git clone https://github.com/kukapay/crypto-feargreed-mcp
   git clone https://github.com/kukapay/crypto-portfolio-mcp
   git clone https://github.com/kukapay/hyperliquid-whalealert-mcp
   git clone https://github.com/kukapay/crypto-orderbook-mcp
   git clone https://github.com/kukapay/cryptopanic-mcp
   git clone https://github.com/kukapay/whale-tracker-mcp
   git clone https://github.com/kukapay/crypto-sentiment-mcp
   ```

2. **Install Dependencies:**
   ```bash
   # CCXT MCP
   cd ccxt-mcp && npm install && cd ..

   # Kukapay MCPs (each)
   for dir in crypto-indicators-mcp crypto-feargreed-mcp crypto-portfolio-mcp hyperliquid-whalealert-mcp crypto-orderbook-mcp cryptopanic-mcp whale-tracker-mcp crypto-sentiment-mcp; do
     cd $dir && pip install -r requirements.txt && cd ..
   done
   ```

3. **Update Configuration:**
   - Add to `native/config/ecosystem.config.js`
   - Add to `containerized/.env.example` (API keys)
   - Update README.md with new MCP count (25 → 33+)

4. **Test Installations:**
   - Verify each MCP server starts successfully
   - Test health check endpoints
   - Verify API integrations work

---

**Document Status:** Ready for implementation
**MCPs Verified:** 9/9 (100%)
**Free Tier MCPs:** 6/9 (67% confirmed free, 3 pending verification)
**Implementation Type:** 1 Node.js + 8 Python MCPs
