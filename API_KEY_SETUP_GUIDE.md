# API Key Setup Guide
## Crypto MCP Suite - Complete API Configuration

**Version:** Phase 8D (41/66 MCPs - 62% Coverage)
**Last Updated:** October 2, 2025
**Total API Services:** 17+ (10 CRITICAL + 6 OPTIONAL + PUBLIC APIs)

---

## Table of Contents

1. [API Key Priority Levels](#api-key-priority-levels)
2. [FREE Tier Emphasis](#free-tier-emphasis)
3. [Phase 8D Premium MCPs (FREE Tiers)](#phase-8d-premium-mcps-free-tiers)
4. [Critical API Keys (Phase 3)](#critical-api-keys-phase-3)
5. [Optional API Keys (Phase 8A)](#optional-api-keys-phase-8a)
6. [Public/Free APIs](#publicfree-apis)
7. [Cost Summary](#cost-summary)
8. [Testing & Validation](#testing--validation)
9. [Troubleshooting](#troubleshooting)

---

## API Key Priority Levels

| Priority | Count | MCPs Affected | Monthly Cost | Action |
|----------|-------|---------------|--------------|--------|
| **🔴 CRITICAL** | 10 | Core functionality | $100-500 | **Must configure** |
| **🟡 HIGH** | 2 | Premium AI (FREE tiers) | $0-100 | **Highly recommended** |
| **🟢 MEDIUM** | 4 | Enhanced features | $0-50 | Optional, free tiers |
| **⚪ LOW** | 1 | Advanced tracking | $150 | Optional, paid only |

**Total Potential Cost:** $0-$700/month (95%+ savings vs Bloomberg Terminal's $2,000/month)

**Recommended Minimum:** $0/month (use FREE tiers only) ✅

---

## FREE Tier Emphasis

**⭐ USER CORRECTION APPLIED:** TokenMetrics and LunarCrush **DO have FREE tiers**

### Premium MCPs with FREE Options (Phase 8D)

1. **TokenMetrics** ✅ FREE tier available
   - Basic AI signals and token grades
   - Limited to 50 requests/day
   - No credit card required for signup

2. **LunarCrush** ✅ FREE tier available
   - Basic social sentiment data
   - 50 requests/day limit
   - No credit card required for signup

3. **Beaconcha.in** ✅ FREE tier available
   - Ethereum validator queue monitoring
   - 100 requests/day
   - No credit card required

**Bottom Line:** You can run ALL 41 MCPs with $0/month if you use free tiers exclusively.

---

## Phase 8D Premium MCPs (FREE Tiers)

### 1. TokenMetrics API (tokenmetrics-mcp)

**MCP:** `tokenmetrics-mcp` (port 3078)
**Tools:** 18+ AI-powered analytics
**Free Tier:** ✅ Basic signals, 50 req/day

#### Signup Instructions

1. **Visit:** https://tokenmetrics.com/api
2. **Create Account:**
   - Click "Sign Up" → Enter email & password
   - Verify email address
3. **Get FREE API Key:**
   - Navigate to Dashboard → API Keys
   - Click "Create New API Key" → Select "FREE Tier"
   - Copy API key (starts with `tm_`)
4. **Configure MCP:**
   ```bash
   echo "TOKENMETRICS_API_KEY=tm_your_key_here" > native/lib/tokenmetrics-mcp/.env
   ```

#### Pricing Tiers

| Tier | Price/Month | Features | API Limits |
|------|-------------|----------|-----------|
| **FREE** | **$0** | Basic signals, token grades | **50 req/day** |
| Basic | $25 | Advanced signals, scenario analysis | 500 req/day |
| Pro | $100 | Full AI analytics, backtesting | Unlimited |

#### Testing

```bash
# Start MCP
pm2 start native/config/ecosystem.config.js --only tokenmetrics-mcp

# Check logs
pm2 logs tokenmetrics-mcp

# Verify in Claude Desktop (should show 18+ tools)
```

---

### 2. LunarCrush API (lunarcrush-mcp)

**MCP:** `lunarcrush-mcp` (port 3079)
**Tools:** 11+ social intelligence
**Free Tier:** ✅ Basic social data, 50 req/day

#### Signup Instructions

1. **Visit:** https://lunarcrush.com/developers
2. **Create Account:**
   - Click "Get Started" → Sign up with email
   - Verify email address
3. **Get FREE API Key:**
   - Go to Dashboard → API Keys
   - Click "Generate API Key" → Select "Free Plan"
   - Copy API key (32-character hex string)
4. **Configure MCP:**
   ```bash
   echo "LUNARCRUSH_API_KEY=your_32char_key_here" > native/lib/lunarcrush-mcp/.env
   ```

#### Pricing Tiers

| Tier | Price/Month | Features | API Limits |
|------|-------------|----------|-----------|
| **FREE** | **$0** | Basic social sentiment, Galaxy Score | **50 req/day** |
| Starter | $29 | Advanced metrics, influencer data | 1,000 req/day |
| Pro | $99 | Full analytics, historical data | 10,000 req/day |
| Enterprise | $999 | Custom integration, priority support | Unlimited |

#### Testing

```bash
# Start MCP
pm2 start native/config/ecosystem.config.js --only lunarcrush-mcp

# Check logs
pm2 logs lunarcrush-mcp

# Verify in Claude Desktop (should show 11+ tools)
```

---

### 3. Beaconcha.in API (ethereum-validator-queue-mcp)

**MCP:** `ethereum-validator-queue-mcp` (port 3080)
**Tools:** ETH validator queue monitoring
**Free Tier:** ✅ 100 req/day

#### Signup Instructions

1. **Visit:** https://beaconcha.in/api/v1/docs
2. **Create Account:**
   - Click "Sign Up" → Enter email
   - Verify email address
3. **Get FREE API Key (Optional):**
   - Navigate to Settings → API
   - Click "Generate Key" → Copy key
   - **Note:** API works without key for basic queries
4. **Configure MCP (Optional):**
   ```bash
   echo "BEACONCHAIN_API_KEY=your_key_here" > native/lib/ethereum-validator-queue-mcp/.env
   ```

#### Pricing

- **FREE:** 100 requests/day, basic validator data
- **No paid tier:** Fully free service

---

## Critical API Keys (Phase 3)

### 4. Infura API (Ethereum RPC)

**MCPs:** `uniswap-price-mcp`, `uniswap-trader-mcp`
**Free Tier:** ✅ 100,000 req/day

#### Signup Instructions

1. **Visit:** https://infura.io/register
2. **Sign Up:** Email + password → Verify email
3. **Create Project:**
   - Dashboard → "Create New Project"
   - Name: "Crypto MCP Suite"
   - Copy Project ID (API Key)
4. **Configure MCPs:**
   ```bash
   echo "INFURA_API_KEY=your_project_id_here" > native/lib/uniswap-price-mcp/.env
   echo "INFURA_API_KEY=your_project_id_here" > native/lib/uniswap-trader-mcp/.env
   ```

**Cost:** FREE (100k req/day) | Paid: $50-200/month for higher limits

---

### 5. TheGraph API (Blockchain Indexing)

**MCPs:** `aave-mcp`, `uniswap-pools-mcp`
**Free Tier:** ✅ 100,000 queries/month

#### Signup Instructions

1. **Visit:** https://thegraph.com/studio/
2. **Sign Up:** Connect wallet (MetaMask) OR email signup
3. **Create API Key:**
   - Studio Dashboard → "Create API Key"
   - Copy API key
4. **Configure MCPs:**
   ```bash
   echo "THEGRAPH_API_KEY=your_key_here" > native/lib/aave-mcp/.env
   echo "THEGRAPH_API_KEY=your_key_here" > native/lib/uniswap-pools-mcp/.env
   ```

**Cost:** FREE (100k queries/month) | Paid: Custom pricing for enterprise

---

### 6. Dune Analytics API (Analytics Queries)

**MCP:** `wallet-inspector-mcp`
**Free Tier:** ⚠️ Limited (25 queries/month)

#### Signup Instructions

1. **Visit:** https://dune.com/settings/api
2. **Sign Up:** Email + password → Verify email
3. **Get API Key:**
   - Settings → API → "Create API Key"
   - Copy API key
4. **Configure MCP:**
   ```bash
   echo "DUNE_API_KEY=your_key_here" > native/lib/wallet-inspector-mcp/.env
   ```

**Cost:** FREE (25 queries/month) | Plus: $99/month (500 queries) | Premium: $390/month (unlimited)

---

### 7. Santiment API (Social Sentiment)

**MCP:** `crypto-sentiment-mcp`
**Free Tier:** ⚠️ Limited (free tier deprecated, trial available)

#### Signup Instructions

1. **Visit:** https://app.santiment.net/account
2. **Sign Up:** Email signup → Verify
3. **Get API Key:**
   - Account Settings → API Keys → "Generate"
   - 14-day free trial available
4. **Configure MCP:**
   ```bash
   echo "SANTIMENT_API_KEY=your_key_here" > native/lib/crypto-sentiment-mcp/.env
   ```

**Cost:** Trial: FREE (14 days) | Pro: $135/month | Premium: $299/month

---

### 8. CryptoPanic API (News Aggregation)

**MCP:** `cryptopanic-mcp-server`
**Free Tier:** ✅ 200 req/hour

#### Signup Instructions

1. **Visit:** https://cryptopanic.com/developers/api/
2. **Sign Up:** Email signup → Verify
3. **Get API Key:**
   - Dashboard → API Keys → Copy key
4. **Configure MCP:**
   ```bash
   echo "CRYPTOPANIC_API_KEY=your_key_here" > native/lib/cryptopanic-mcp-server/.env
   ```

**Cost:** FREE (200 req/hour) | Pro: $9.99/month (unlimited)

---

### 9. CoinGlass API (Derivatives Data)

**MCP:** `hyperliquid-whalealert-mcp`
**Free Tier:** ⚠️ Limited

#### Signup Instructions

1. **Visit:** https://www.coinglass.com/api
2. **Sign Up:** Email signup
3. **Get API Key:**
   - Dashboard → API → "Generate Key"
4. **Configure MCP:**
   ```bash
   echo "COINGLASS_API_KEY=your_key_here" > native/lib/hyperliquid-whalealert-mcp/.env
   ```

**Cost:** FREE (limited) | Basic: $49/month | Pro: $199/month

---

### 10. SolSniffer API (Rug Detection)

**MCP:** `rug-check-mcp`
**Free Tier:** ⚠️ Limited

#### Signup Instructions

1. **Visit:** https://solsniffer.com/
2. **Sign Up:** Email signup
3. **Get API Key:**
   - Dashboard → API Access → Copy key
4. **Configure MCP:**
   ```bash
   echo "SOLSNIFFER_API_KEY=your_key_here" > native/lib/rug-check-mcp/.env
   ```

**Cost:** FREE (limited) | Pro: Custom pricing

---

## Optional API Keys (Phase 8A)

### 11. Reservoir API (NFT Analytics)

**MCP:** `nft-analytics-mcp`
**Free Tier:** ✅ 20,000 req/month

#### Signup

1. Visit https://reservoir.tools/
2. Sign up → Get API key (FREE tier: 20k req/month)
3. Configure: `echo "RESERVOIR_API_KEY=your_key_here" > native/lib/nft-analytics-mcp/.env`

**Cost:** FREE (20k req/month) | Pro: $99/month (unlimited)

---

### 12. Binance API (Alpha Launches)

**MCP:** `binance-alpha-mcp`
**Free Tier:** ✅ Available

#### Signup

1. Visit https://www.binance.com/en/my/settings/api-management
2. Create API key + secret
3. Configure:
   ```bash
   echo "BINANCE_API_KEY=your_key_here" > native/lib/binance-alpha-mcp/.env
   echo "BINANCE_API_SECRET=your_secret_here" >> native/lib/binance-alpha-mcp/.env
   ```

**Cost:** FREE (trading fees apply)

---

## Public/Free APIs

**25 MCPs use public APIs (no keys required):**

- DefiLlama API (defi-yields-mcp)
- Blockchain.info API (bitcoin-utxo-mcp)
- Hyperliquid API (hyperliquid-info-mcp)
- ENS Graph API (ens-mcp)
- Pump.fun API (pumpfun-wallets-mcp)
- Raydium API (raydium-launchlab-mcp)
- Sui RPC (sui-trader-mcp)
- Custom RSS Feeds (crypto-rss-mcp)
- Whitepaper Database (crypto-whitepapers-mcp)
- ... and 16 others

**Cost:** $0/month ✅

---

## Cost Summary

### Minimum Cost (FREE Tiers Only): $0/month

**FREE APIs (10 MCPs):**
- TokenMetrics FREE tier (50 req/day)
- LunarCrush FREE tier (50 req/day)
- Beaconcha.in (100 req/day)
- Infura (100k req/day)
- TheGraph (100k queries/month)
- CryptoPanic (200 req/hour)
- + 25 public APIs

**Limited FREE APIs (3 MCPs):**
- Dune Analytics (25 queries/month)
- CoinGlass (limited)
- SolSniffer (limited)

### Recommended Budget: $25-100/month

**Upgrade These for Production:**
- TokenMetrics Basic: $25/month (500 req/day)
- LunarCrush Starter: $29/month (1k req/day)
- Dune Plus: $99/month (500 queries)

**Total:** $153/month (still 92% cheaper than Bloomberg)

### Full Enterprise Budget: $700/month

**Premium Tiers:**
- TokenMetrics Pro: $100/month
- LunarCrush Pro: $99/month
- Santiment Pro: $135/month
- Dune Premium: $390/month
- Others: ~$76/month

**Total:** ~$700/month (65% cheaper than Bloomberg)

---

## Testing & Validation

### Step 1: Verify API Keys

```bash
# Create test script
cat > test-api-keys.sh << 'EOF'
#!/bin/bash

# Test TokenMetrics
curl -H "Authorization: Bearer $TOKENMETRICS_API_KEY" \
  https://api.tokenmetrics.com/v1/health

# Test LunarCrush
curl "https://lunarcrush.com/api4/public/coins/list?api_key=$LUNARCRUSH_API_KEY"

# Test Infura
curl https://mainnet.infura.io/v3/$INFURA_API_KEY \
  -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Test TheGraph
curl -H "Authorization: Bearer $THEGRAPH_API_KEY" \
  https://api.thegraph.com/subgraphs/name/aave/protocol-v3

echo "✅ API key validation complete"
EOF

chmod +x test-api-keys.sh
./test-api-keys.sh
```

### Step 2: Verify MCP Startup

```bash
# Start specific tier
pm2 start native/config/ecosystem.config.js --only premium-plus

# Check all MCPs are online
pm2 status | grep "online" | wc -l
# Should output: 41 (if all started successfully)
```

### Step 3: Test Individual MCPs

```bash
# Test tokenmetrics-mcp
pm2 logs tokenmetrics-mcp --lines 20

# Should see: "MCP server started successfully"
# Should NOT see: "Invalid API key" or "Authentication failed"
```

---

## Troubleshooting

### Issue 1: "Invalid API Key" Error

**Symptoms:**
- MCP logs show "401 Unauthorized" or "Invalid API key"
- MCP repeatedly restarts in PM2

**Solutions:**
1. **Verify API key format:**
   - TokenMetrics: Should start with `tm_`
   - LunarCrush: 32-character hex string
   - Infura: UUID format (8-4-4-4-12 hex)

2. **Check .env file location:**
   ```bash
   # Verify .env exists in MCP directory
   ls -la native/lib/tokenmetrics-mcp/.env
   cat native/lib/tokenmetrics-mcp/.env
   ```

3. **Restart PM2:**
   ```bash
   pm2 restart tokenmetrics-mcp
   pm2 logs tokenmetrics-mcp
   ```

### Issue 2: Rate Limit Exceeded

**Symptoms:**
- MCP logs show "429 Too Many Requests"
- Free tier limits exceeded

**Solutions:**
1. **Check current usage:**
   - TokenMetrics: Dashboard → Usage
   - LunarCrush: API Settings → Usage Stats

2. **Upgrade tier OR reduce request frequency:**
   - Implement caching in your application
   - Reduce MCP polling frequency

3. **Use multiple free accounts (NOT recommended):**
   - Rotate API keys (against TOS for most services)

### Issue 3: MCP Won't Start

**Symptoms:**
- PM2 shows MCP in "errored" or "stopped" state
- Logs show module errors

**Solutions:**
1. **Check dependencies:**
   ```bash
   cd native/lib/tokenmetrics-mcp
   npm install  # or uv sync for Python MCPs
   ```

2. **Verify API key is set:**
   ```bash
   pm2 logs tokenmetrics-mcp --err
   # Look for "TOKENMETRICS_API_KEY not found"
   ```

3. **Test manually:**
   ```bash
   # Node.js MCP
   cd native/lib/tokenmetrics-mcp
   TOKENMETRICS_API_KEY=your_key node build/src/cli.js

   # Python MCP
   cd native/lib/ethereum-validator-queue-mcp
   BEACONCHAIN_API_KEY=your_key uv run main.py
   ```

---

## Security Best Practices

### 1. Never Commit API Keys

```bash
# Ensure .env files are gitignored
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "native/lib/*/.env" >> .gitignore

# Verify no keys in git
git status --porcelain | grep "\.env"
# Should return nothing
```

### 2. Use Environment Variables

```bash
# Load from .env.local for PM2
export $(cat .env.local | xargs)
pm2 start native/config/ecosystem.config.js
```

### 3. Rotate Keys Periodically

- **Quarterly rotation:** Every 3 months
- **After security incidents:** Immediately
- **When leaving team:** Revoke access

### 4. Monitor API Usage

- Check dashboards weekly
- Set up alerts for unusual activity
- Review API logs monthly

---

## Next Steps

After configuring API keys:

1. ✅ **Test All MCPs** - Verify each MCP starts successfully
2. ✅ **Monitor Logs** - Check for API errors or rate limits
3. ✅ **Configure Claude Desktop** - Add MCPs to Claude config
4. ✅ **Set Up Monitoring** - PM2 dashboard + API usage alerts
5. ✅ **Backup Keys** - Store encrypted backup of .env files

---

## Support

- **Installation Guide:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **MCP Status:** [MCP_INSTALLATION_STATUS.md](MCP_INSTALLATION_STATUS.md)
- **Repository:** https://github.com/justmy2satoshis/crypto-mcp-suite

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude <noreply@anthropic.com>
