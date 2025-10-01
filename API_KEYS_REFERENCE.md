# API Keys & Wallets Reference Guide

**Last Updated:** October 2, 2025
**Total Configured:** 19 (16 API keys + 2 test wallets + 1 CoinGlass)
**Security Status:** ✅ All keys/wallets in git-ignored .env files

---

## 📋 Quick Reference

### API Keys by MCP

| MCP Name | Environment Variable | API Service | Tier | Used In Phase |
|----------|---------------------|-------------|------|---------------|
| cryptopanic-mcp-server | CRYPTOPANIC_API_KEY | CryptoPanic | Free | Phase 3 |
| uniswap-price-mcp | INFURA_PROJECT_ID | Infura | Free (100k req/day) | Phase 3 |
| aave-mcp | THEGRAPH_API_KEY | TheGraph | Free | Phase 3 |
| uniswap-pools-mcp | THEGRAPH_API_KEY | TheGraph | Free | Phase 3 |
| crypto-sentiment-mcp | SANTIMENT_API_KEY | Santiment | Free | Phase 3 |
| wallet-inspector-mcp | DUNE_SIM_API_KEY | Dune Analytics | Free | Phase 3 |
| rug-check-mcp | SOLSNIFFER_API_KEY | SolSniffer | Free | Phase 4 |
| hyperliquid-whalealert-mcp | COINGLASS_API_KEY | CoinGlass | Free | Phase 6 |
| uniswap-trader-mcp | WALLET_PRIVATE_KEY | Ethereum Wallet | Test Wallet | Phase 6 |
| jupiter-mcp | PRIVATE_KEY | Solana Wallet | Test Wallet | Phase 6 |

---

## 🔑 Complete API Key List

### Phase 3 API Keys (6 Configured)

#### 1. CryptoPanic API
- **Variable:** `CRYPTOPANIC_API_KEY`
- **Used By:** cryptopanic-mcp-server
- **Purpose:** Crypto news aggregation
- **Tier:** Free (200 requests/day)
- **Documentation:** https://cryptopanic.com/developers/api/

#### 2. Infura API
- **Variables:** `INFURA_API_KEY`, `INFURA_PROJECT_ID`, `INFURA_KEY`, `INFURA_ENDPOINT`
- **Used By:** uniswap-price-mcp, uniswap-trader-mcp
- **Purpose:** Ethereum RPC access
- **Tier:** Free (100,000 requests/day)
- **Documentation:** https://docs.infura.io/

#### 3. TheGraph API
- **Variable:** `THEGRAPH_API_KEY`
- **Used By:** aave-mcp, uniswap-pools-mcp
- **Purpose:** Blockchain data indexing
- **Tier:** Free
- **Documentation:** https://thegraph.com/docs/

#### 4. Dune Analytics API
- **Variable:** `DUNE_API_KEY`, `DUNE_SIM_API_KEY`
- **Used By:** wallet-inspector-mcp
- **Purpose:** Blockchain analytics queries
- **Tier:** Free
- **Documentation:** https://dune.com/docs/api/

#### 5. Santiment API
- **Variable:** `SANTIMENT_API_KEY`
- **Used By:** crypto-sentiment-mcp
- **Purpose:** Social sentiment & on-chain metrics
- **Tier:** Free
- **Documentation:** https://academy.santiment.net/santiment-api/

#### 6. Solana RPC
- **Variable:** `SOLANA_RPC_URL`
- **Used By:** jupiter-mcp
- **Purpose:** Solana blockchain access
- **Tier:** Free (public endpoint)
- **Endpoint:** https://api.mainnet-beta.solana.com

### Phase 4 API Keys (1 Configured)

#### 7. SolSniffer API
- **Variable:** `SOLSNIFFER_API_KEY`
- **Used By:** rug-check-mcp
- **Purpose:** Solana token analysis & rug detection
- **Tier:** Free
- **Documentation:** https://docs.solsniffer.com/

### Phase 6 API Keys & Wallets (3 Configured)

#### 8. CoinGlass API
- **Variable:** `COINGLASS_API_KEY`
- **Used By:** hyperliquid-whalealert-mcp
- **Purpose:** Derivatives data & whale alerts
- **Tier:** Free
- **Documentation:** https://www.coinglass.com/api

#### 9. Ethereum Test Wallet
- **Variable:** `WALLET_PRIVATE_KEY`
- **Used By:** uniswap-trader-mcp
- **Purpose:** DEX trading on 8 EVM chains
- **Security:** User-confirmed test wallet
- **Supported Chains:** Ethereum, Optimism, Polygon, Arbitrum, Celo, BNB Chain, Avalanche, Base

#### 10. Solana Test Wallet
- **Variable:** `PRIVATE_KEY`
- **Used By:** jupiter-mcp
- **Purpose:** DEX aggregation on Solana
- **Security:** User-confirmed test wallet

### Pre-Existing API Keys (Not Yet Used - 9 Keys)

#### 11. TokenMetrics API
- **Variable:** `TOKENMETRICS_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Price predictions, market analysis

#### 12. GitHub Token
- **Variable:** `GITHUB_TOKEN`
- **Status:** Not currently used by any MCP
- **Potential Use:** GitHub-related MCPs

#### 13. LunarCrush API
- **Variable:** `LUNARCRUSH_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Social metrics

#### 14. Messari API
- **Variable:** `MESSARI_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Research data

#### 15. CoinMarketCal API
- **Variable:** `COINMARKETCAL_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Event calendar

#### 16. CoinGecko API
- **Variable:** `COINGECKO_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Market data

#### 17. CoinMarketCap API
- **Variable:** `COINMARKETCAP_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Market data

#### 18. CryptoCompare API
- **Variable:** `CRYPTOCOMPARE_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Price data

#### 19. Nansen API
- **Variable:** `NANSEN_API_KEY`
- **Status:** Not currently used by any MCP
- **Potential Use:** Blockchain analytics

---

## 🗂️ Environment Variable Name Variations

Some API services use different variable names across MCPs. Here's the mapping:

| Standard Name | Alternate Names | Used By |
|---------------|-----------------|---------|
| INFURA_API_KEY | INFURA_KEY, INFURA_PROJECT_ID | uniswap-trader, uniswap-price |
| DUNE_API_KEY | DUNE_SIM_API_KEY | wallet-inspector |
| THEGRAPH_API_KEY | - | aave, uniswap-pools |
| PRIVATE_KEY | WALLET_PRIVATE_KEY | jupiter (SOL), uniswap-trader (ETH) |

---

## 📍 Configuration File Locations

### Root Configuration
- **File:** `Crypto-MCP-Suite/.env.local`
- **Purpose:** Central storage for all API keys & wallets
- **Security:** Git-ignored via .gitignore
- **Usage:** Loaded by ecosystem.config.js for PM2

### Individual MCP .env Files

Each MCP expects its own .env file in its directory:

```
native/lib/
├── cryptopanic-mcp-server/.env         # CRYPTOPANIC_API_KEY
├── uniswap-price-mcp/.env              # INFURA_PROJECT_ID
├── aave-mcp/.env                       # THEGRAPH_API_KEY
├── uniswap-pools-mcp/.env              # THEGRAPH_API_KEY
├── crypto-sentiment-mcp/.env           # SANTIMENT_API_KEY
├── wallet-inspector-mcp/.env           # DUNE_SIM_API_KEY
├── rug-check-mcp/.env                  # SOLSNIFFER_API_KEY
├── hyperliquid-whalealert-mcp/.env     # COINGLASS_API_KEY
├── uniswap-trader-mcp/.env             # INFURA_KEY, WALLET_PRIVATE_KEY
└── jupiter-mcp/.env                    # SOLANA_RPC_URL, PRIVATE_KEY
```

---

## 🔒 Security Best Practices

### What We Do
- ✅ All keys/wallets in .env.local (git-ignored)
- ✅ Individual .env files in MCP directories (git-ignored)
- ✅ .gitignore configured to exclude .env*, *.backup
- ✅ ecosystem.config.js uses env var references only
- ✅ Test wallets only (user-confirmed safe for development)

### What You Should Do

#### For Development
1. **Never commit .env files** - Always verify git status before commits
2. **Use test wallets only** - Never put production wallets in .env
3. **Rotate keys periodically** - Even test API keys should be rotated
4. **Monitor usage** - Track API usage to detect unauthorized access

#### For Production
1. **Replace test wallets** - Use dedicated production wallets
2. **Use secrets manager** - AWS Secrets Manager, HashiCorp Vault, etc.
3. **Upgrade RPC endpoints** - Consider paid Alchemy, QuickNode for reliability
4. **Implement monitoring** - Alert on suspicious API/wallet activity

---

## 🧪 Testing API Keys

### Verify API Key Configuration

```bash
# Test hyperliquid-whalealert-mcp
cd native/lib/hyperliquid-whalealert-mcp
uv run main.py
# Expected: Successfully installed packages, waiting for stdio

# Test uniswap-trader-mcp
cd native/lib/uniswap-trader-mcp
node index.js
# Expected: No errors, waiting for stdio

# Test jupiter-mcp
cd native/lib/jupiter-mcp
node index.js
# Expected: No errors, waiting for stdio
```

### Common Issues & Solutions

#### Issue: "API_KEY not found in .env file"
**Solution:** Create/update .env file in MCP directory with correct key name

#### Issue: "Cannot find module 'dotenv'"
**Solution:** Run `npm install` in Node.js MCP directory

#### Issue: "WALLET_PRIVATE_KEY environment variable is required"
**Solution:** Add WALLET_PRIVATE_KEY to .env file

#### Issue: "Expected String" (jupiter-mcp)
**Solution:** Ensure PRIVATE_KEY is set (was empty in Phase 5)

---

## 💰 API Cost Tracking

### Free Tier Limits

| API Service | Free Tier Limit | Upgrade Cost | Notes |
|-------------|-----------------|--------------|-------|
| Infura | 100,000 req/day | $50/month | Core plan for unlimited requests |
| TheGraph | Unlimited queries | $0 | Self-serve queries free |
| Dune Analytics | Free queries | $0-$399/month | Premium for private queries |
| Santiment | Limited data | $0-$135/month | Pro for full access |
| CryptoPanic | 200 req/day | $0 | No paid tier |
| SolSniffer | Standard rate limits | Unknown | Free tier sufficient |
| CoinGlass | Standard rate limits | Unknown | Free tier sufficient |
| Solana RPC | Public endpoint | $0-$50/month | Helius/QuickNode for better performance |

### Current Monthly Cost: $0
- All APIs using free tiers
- Test wallets (no funding costs)
- Public RPC endpoints

### Potential Upgrades (Optional)
- **Whale Alert API:** $49/month (for whale-tracker-mcp)
- **Premium RPC:** $50-$200/month (Alchemy, QuickNode)
- **Santiment Pro:** $135/month (enhanced sentiment data)

---

## 🔗 API Documentation Links

### Configured APIs
- **Infura:** https://docs.infura.io/
- **TheGraph:** https://thegraph.com/docs/
- **Dune Analytics:** https://dune.com/docs/api/
- **Santiment:** https://academy.santiment.net/santiment-api/
- **CryptoPanic:** https://cryptopanic.com/developers/api/
- **SolSniffer:** https://docs.solsniffer.com/
- **CoinGlass:** https://www.coinglass.com/api
- **Solana RPC:** https://docs.solana.com/cluster/rpc-endpoints

### Available But Unused
- **TokenMetrics:** https://docs.tokenmetrics.com/
- **LunarCrush:** https://lunarcrush.com/developers/api
- **Messari:** https://messari.io/api/docs
- **CoinGecko:** https://docs.coingecko.com/
- **CoinMarketCap:** https://coinmarketcap.com/api/documentation/
- **CryptoCompare:** https://min-api.cryptocompare.com/documentation
- **Nansen:** https://docs.nansen.ai/

---

## 🚨 Troubleshooting

### API Key Validation

```bash
# Verify .env.local exists and contains keys
ls -lh Crypto-MCP-Suite/.env.local

# Check if .env is git-ignored
git status | grep ".env"
# Should return nothing if properly ignored

# Verify individual MCP .env files
find native/lib -name ".env" -type f
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "API_KEY not found" | Missing .env file | Create .env in MCP directory |
| "Cannot find module" | Missing dependencies | Run `npm install` or `uv sync` |
| "WALLET_PRIVATE_KEY required" | Missing wallet key | Add WALLET_PRIVATE_KEY to .env |
| "Expected String" | Empty PRIVATE_KEY | Set PRIVATE_KEY value in .env |
| "401 Unauthorized" | Invalid API key | Verify key value is correct |
| "429 Too Many Requests" | Rate limit exceeded | Wait or upgrade to paid tier |

---

## 📝 Adding New API Keys

### Step-by-Step Guide

1. **Obtain API Key**
   - Register for API service
   - Copy API key securely

2. **Add to .env.local**
   ```bash
   echo "YOUR_SERVICE_API_KEY=your_actual_key" >> .env.local
   ```

3. **Create MCP .env File**
   ```bash
   echo "YOUR_SERVICE_API_KEY=your_actual_key" > native/lib/your-mcp/.env
   ```

4. **Update ecosystem.config.js** (if using PM2)
   ```javascript
   env: {
     ...commonOptions.env,
     YOUR_SERVICE_API_KEY: process.env.YOUR_SERVICE_API_KEY
   }
   ```

5. **Test the MCP**
   ```bash
   cd native/lib/your-mcp
   # For Node.js:
   node index.js
   # For Python:
   uv run main.py
   ```

6. **Verify Security**
   ```bash
   git status | grep ".env"
   # Should show nothing
   ```

---

## ✅ Success Checklist

- [x] All API keys in .env.local
- [x] Individual .env files created for each MCP
- [x] .gitignore configured to exclude .env files
- [x] No .env files committed to git
- [x] ecosystem.config.js uses env var references
- [x] Test wallets documented and labeled
- [x] All MCPs tested successfully

---

**Compiled by:** Claude Code (Sonnet 4.5)
**Repository:** https://github.com/justmy2satoshis/crypto-mcp-suite
**License:** MIT
**Last Updated:** October 2, 2025
