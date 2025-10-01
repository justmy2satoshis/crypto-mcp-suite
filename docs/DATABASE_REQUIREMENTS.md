# Database Requirements Analysis
**Crypto MCP Suite Infrastructure Design - Phase 2**

**Date**: October 1, 2025
**Project**: Crypto MCP Suite Infrastructure Design
**Phase**: 2 of 7 - Database Requirements Analysis
**Status**: ✅ COMPLETE

---

## Executive Summary

This document analyzes database requirements for the **Crypto MCP Suite**, evaluating which MCPs require persistent storage versus stateless operation. The analysis covers **7 representative MCPs** across three database technologies:

- **Redis**: In-memory caching for API responses and rate limiting
- **PostgreSQL**: Relational storage for historical data and analytics
- **SQLite**: Lightweight fallback for minimal deployments

### Key Findings

| Database | Required By | Use Cases | Storage Estimate |
|----------|-------------|-----------|------------------|
| **Redis** | 5 of 7 MCPs | API caching, rate limiting, session management | 100MB - 2GB |
| **PostgreSQL** | 3 of 7 MCPs | Historical data, analytics, user tracking | 5GB - 100GB |
| **SQLite** | Fallback | Minimal deployments, development | 50MB - 500MB |

**Recommendation**: **Redis is ESSENTIAL** (5 MCPs depend on it), **PostgreSQL is RECOMMENDED** (enables analytics features), **SQLite is OPTIONAL** (minimal deployment fallback).

---

## Database Architecture Overview

### Three-Tier Storage Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│              (7 Crypto MCPs + API Gateway)                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┬─────────────────┐
        │                       │                 │
        ▼                       ▼                 ▼
┌───────────────┐      ┌─────────────────┐   ┌──────────┐
│     Redis     │      │   PostgreSQL    │   │  SQLite  │
│   (Caching)   │      │   (Analytics)   │   │(Fallback)│
├───────────────┤      ├─────────────────┤   ├──────────┤
│ • API cache   │      │ • Price history │   │ • Config │
│ • Rate limits │      │ • Trade logs    │   │ • Local  │
│ • Sessions    │      │ • Whale txs     │   │  cache   │
│ • Hot data    │      │ • Sentiment     │   │ • Dev    │
│               │      │ • Analytics     │   │  mode    │
└───────────────┘      └─────────────────┘   └──────────┘
   REQUIRED              RECOMMENDED           OPTIONAL
  (5/7 MCPs)             (3/7 MCPs)          (Fallback)
```

### Decision Matrix: Which Database When?

| Requirement | Redis | PostgreSQL | SQLite |
|-------------|-------|------------|--------|
| **API response caching** | ✅ Primary | ❌ Too slow | ⚠️ Dev only |
| **Rate limit tracking** | ✅ Primary | ❌ No TTL | ❌ Not suitable |
| **Historical price data** | ❌ Memory limit | ✅ Primary | ⚠️ < 1M rows |
| **Transaction logs** | ❌ Not persistent | ✅ Primary | ⚠️ Small scale |
| **Session management** | ✅ Primary | ⚠️ Overkill | ❌ No concurrency |
| **Analytics queries** | ❌ No SQL | ✅ Primary | ⚠️ Read-only |
| **Development mode** | ⚠️ Optional | ⚠️ Optional | ✅ Primary |

---

## MCP-by-MCP Database Analysis

### 1. jupiter-mcp (Solana DEX Trading)

**Description**: Solana DEX aggregator for token swaps via Jupiter
**API Provider**: Jupiter Aggregator API v6
**Performance**: 500-800ms p95 latency

#### Database Requirements

**Redis** - ✅ **HIGHLY RECOMMENDED**

```yaml
Use Cases:
  - Token price caching (SOL, USDC, popular SPL tokens)
  - Route quote caching (swap paths)
  - Rate limit tracking (API quotas)
  - Slippage tolerance data

Data Structures:
  - Strings: Token prices ("token:SOL:price" → "145.23")
  - Hashes: Route metadata ("route:SOL-USDC" → {route_info})
  - Sorted Sets: Top trading pairs by volume
  - Counters: API request tracking

TTL Strategies:
  - Token prices: 30 seconds (high volatility)
  - Route quotes: 60 seconds (route discovery is expensive)
  - API rate limits: 60 seconds (sliding window)
  - Popular tokens list: 300 seconds (5 minutes)

Storage Estimate:
  - 1,000 tokens × 200 bytes = 200KB (token prices)
  - 500 routes × 1KB = 500KB (route cache)
  - Rate limit counters: 10KB
  - **Total: ~1MB base, 50MB under load**

Performance Impact:
  - Without cache: 500-800ms API latency
  - With cache (80% hit rate): 120-200ms average latency
  - **Latency reduction: 60-75%**
```

**PostgreSQL** - ⚠️ **OPTIONAL** (enables analytics)

```yaml
Use Cases:
  - User swap transaction history
  - Token performance tracking (7-day, 30-day returns)
  - Liquidity pool analytics
  - Trading volume aggregation

Tables:
  swap_transactions:
    - id (BIGSERIAL PRIMARY KEY)
    - user_wallet (VARCHAR(44))
    - input_token (VARCHAR(44))
    - output_token (VARCHAR(44))
    - input_amount (NUMERIC(20,8))
    - output_amount (NUMERIC(20,8))
    - price_impact (NUMERIC(5,4))
    - timestamp (TIMESTAMPTZ)
    - signature (VARCHAR(88))

  token_performance:
    - token_address (VARCHAR(44) PRIMARY KEY)
    - price_24h_ago (NUMERIC(20,8))
    - price_7d_ago (NUMERIC(20,8))
    - price_30d_ago (NUMERIC(20,8))
    - volume_24h (NUMERIC(20,2))
    - updated_at (TIMESTAMPTZ)

Storage Estimate:
  - 100 swaps/day × 365 days = 36,500 rows/year
  - Avg row size: 200 bytes
  - **Total: ~7MB/year (negligible)**

Indexes:
  - CREATE INDEX idx_swaps_wallet ON swap_transactions(user_wallet);
  - CREATE INDEX idx_swaps_timestamp ON swap_transactions(timestamp DESC);
  - CREATE INDEX idx_token_perf_updated ON token_performance(updated_at);
```

**SQLite Fallback** - ✅ **YES** (development only)

```yaml
Use Case: Local development without Redis/PostgreSQL
Schema: Same as PostgreSQL (limited to 10,000 swaps)
Performance: Acceptable for <100 requests/day
```

**Verdict**: **Redis RECOMMENDED** (60-75% latency improvement), **PostgreSQL OPTIONAL** (analytics), **SQLite YES** (dev mode)

---

### 2. uniswap-trader-mcp (Ethereum DEX Trading)

**Description**: Multi-chain DEX trading (Ethereum, Polygon, Arbitrum, Optimism, Base)
**API Provider**: Ethereum RPC + Uniswap V2/V3 smart contracts
**Performance**: 300-600ms p95 latency

#### Database Requirements

**Redis** - ✅ **ESSENTIAL**

```yaml
Use Cases:
  - Pool reserves caching (Uniswap V2/V3 pool state)
  - Token prices across 5 chains
  - Gas price caching (EIP-1559 base fee + priority fee)
  - RPC rate limit tracking (Infura/Alchemy quotas)

Data Structures:
  - Hashes: Pool state ("pool:ETH:0xabc123" → {reserve0, reserve1, fee})
  - Strings: Gas prices ("gas:ethereum:base" → "25")
  - Lists: Recent block numbers (chain tip tracking)
  - Sorted Sets: Token rankings by TVL

TTL Strategies:
  - Pool reserves: 30 seconds (Ethereum block time ~12s)
  - Gas prices: 15 seconds (fluctuates rapidly)
  - RPC rate limits: 60 seconds
  - Token metadata: 3600 seconds (1 hour, rarely changes)

Storage Estimate:
  - 5 chains × 1,000 pools × 500 bytes = 2.5MB (pool state)
  - 5 chains × 50 tokens × 200 bytes = 50KB (token prices)
  - Gas data: 5KB per chain = 25KB
  - **Total: ~3MB base, 100MB under high load**

Performance Impact:
  - Without cache: 300-600ms RPC latency per pool query
  - With cache (85% hit rate): 50-100ms average
  - **Latency reduction: 70-80%**

Rate Limit Protection:
  - Infura free tier: 100,000 req/day (69 req/min sustained)
  - Cache prevents 80% of RPC calls
  - **Effective capacity: 345 req/min with caching**
```

**PostgreSQL** - ⚠️ **RECOMMENDED** (user tracking)

```yaml
Use Cases:
  - Multi-chain transaction history
  - Wallet portfolio tracking
  - Impermanent loss calculations
  - Cross-chain analytics

Tables:
  dex_trades:
    - id (BIGSERIAL PRIMARY KEY)
    - chain (VARCHAR(20))
    - user_address (VARCHAR(42))
    - pool_address (VARCHAR(42))
    - token_in (VARCHAR(42))
    - token_out (VARCHAR(42))
    - amount_in (NUMERIC(30,18))
    - amount_out (NUMERIC(30,18))
    - gas_used (BIGINT)
    - gas_price (BIGINT)
    - block_number (BIGINT)
    - tx_hash (VARCHAR(66))
    - timestamp (TIMESTAMPTZ)

  wallet_portfolios:
    - wallet_address (VARCHAR(42))
    - chain (VARCHAR(20))
    - token_address (VARCHAR(42))
    - balance (NUMERIC(30,18))
    - value_usd (NUMERIC(20,2))
    - last_updated (TIMESTAMPTZ)
    - PRIMARY KEY (wallet_address, chain, token_address)

Storage Estimate:
  - 1,000 trades/day × 365 days = 365,000 rows/year
  - Avg row size: 250 bytes
  - **Total: ~90MB/year**

Indexes:
  - CREATE INDEX idx_trades_wallet ON dex_trades(user_address);
  - CREATE INDEX idx_trades_chain_time ON dex_trades(chain, timestamp DESC);
  - CREATE INDEX idx_portfolio_wallet ON wallet_portfolios(wallet_address);
```

**SQLite Fallback** - ✅ **YES** (single-user dev mode)

```yaml
Use Case: Local development, single wallet tracking
Limitations: No concurrent writes, <10,000 trades
Schema: Simplified version of PostgreSQL schema
```

**Verdict**: **Redis ESSENTIAL** (70-80% latency improvement + rate limit protection), **PostgreSQL RECOMMENDED** (portfolio tracking), **SQLite YES** (dev mode)

---

### 3. crypto-indicators-mcp (Technical Analysis)

**Description**: Local computation of RSI, MACD, Bollinger Bands, Moving Averages
**API Provider**: None (pure computation)
**Performance**: 50-150ms p95 latency

#### Database Requirements

**Redis** - ❌ **NOT REQUIRED**

```yaml
Reasoning:
  - Pure stateless computation
  - No external API calls to cache
  - Input data (price arrays) provided by caller
  - Computation is fast (50-150ms)

Potential Use Case (if needed):
  - Caching pre-computed indicators for popular assets
  - TTL: 60 seconds
  - Storage: 10KB per asset × 100 assets = 1MB
  - **Benefit: Minimal (computation already fast)**
```

**PostgreSQL** - ❌ **NOT REQUIRED**

```yaml
Reasoning:
  - No historical data storage needed
  - Indicators computed on-demand
  - Caller manages price history

Potential Use Case (if needed):
  - Storing pre-computed indicator values for backtesting
  - Only useful if building a backtesting platform
```

**SQLite Fallback** - ❌ **NOT APPLICABLE**

```yaml
Reasoning: No database needed for stateless computation
```

**Verdict**: **NO DATABASE REQUIRED** (stateless computation MCP)

---

### 4. crypto-sentiment-mcp (Santiment API)

**Description**: Social sentiment, on-chain metrics, development activity
**API Provider**: Santiment GraphQL API
**Performance**: 800-1500ms p95 latency

#### Database Requirements

**Redis** - ✅ **ESSENTIAL**

```yaml
Use Cases:
  - GraphQL query response caching (Santiment is SLOW)
  - Rate limit tracking (60 req/min free, 600 req/min paid)
  - Popular query templates
  - Token sentiment scores

Data Structures:
  - Strings: Sentiment scores ("sentiment:BTC:social_volume" → "1234567")
  - Hashes: Query results ("query:abc123" → {full_response})
  - Sorted Sets: Trending tokens by social volume
  - Counters: API quota tracking

TTL Strategies:
  - Sentiment scores: 300 seconds (5 minutes, updates slowly)
  - Social volume: 600 seconds (10 minutes)
  - Development activity: 3600 seconds (1 hour, GitHub updates daily)
  - Trending queries: 300 seconds (5 minutes)

Storage Estimate:
  - 500 tokens × 10 metrics × 100 bytes = 500KB (sentiment data)
  - 100 cached queries × 50KB = 5MB (query cache)
  - Rate limit counters: 5KB
  - **Total: ~6MB base, 50MB under load**

Performance Impact:
  - Without cache: 800-1500ms API latency
  - With cache (70% hit rate): 240-450ms average
  - **Latency reduction: 60-70%**

Rate Limit Protection:
  - Free tier: 60 req/min (1 req/sec)
  - With 70% cache hit rate: Effective 3.3 req/sec capacity
  - **Cache increases capacity by 230%**
```

**PostgreSQL** - ✅ **RECOMMENDED** (historical sentiment analysis)

```yaml
Use Cases:
  - Historical sentiment tracking (sentiment over time)
  - Correlation analysis (sentiment vs price)
  - Anomaly detection (unusual social volume spikes)
  - Trending token discovery

Tables:
  sentiment_history:
    - id (BIGSERIAL PRIMARY KEY)
    - token_slug (VARCHAR(50))
    - metric_name (VARCHAR(100))
    - metric_value (NUMERIC(20,4))
    - timestamp (TIMESTAMPTZ)
    - source (VARCHAR(50)) -- 'santiment', 'lunarcrush', etc.

  social_trends:
    - token_slug (VARCHAR(50))
    - social_volume_24h (BIGINT)
    - social_volume_change_pct (NUMERIC(10,2))
    - sentiment_score (NUMERIC(5,2)) -- -1 to 1
    - trending_rank (INTEGER)
    - updated_at (TIMESTAMPTZ)
    - PRIMARY KEY (token_slug)

Storage Estimate:
  - 500 tokens × 10 metrics × 1 sample/hour × 24 hours = 120,000 rows/day
  - Avg row size: 100 bytes
  - **Total: 12MB/day, 4.4GB/year**
  - With retention policy (90 days): ~400MB

Indexes:
  - CREATE INDEX idx_sentiment_token_time ON sentiment_history(token_slug, timestamp DESC);
  - CREATE INDEX idx_sentiment_metric ON sentiment_history(metric_name, timestamp DESC);
  - CREATE INDEX idx_trends_rank ON social_trends(trending_rank);
```

**SQLite Fallback** - ⚠️ **LIMITED**

```yaml
Use Case: Development mode, 7-day sentiment history only
Limitations: <100,000 rows (7 days of data)
Schema: Same as PostgreSQL with retention policy
```

**Verdict**: **Redis ESSENTIAL** (60-70% latency improvement + 230% capacity increase), **PostgreSQL RECOMMENDED** (time-series analysis), **SQLite LIMITED** (7 days only)

---

### 5. whale-tracker-mcp (Whale Alert API)

**Description**: Large cryptocurrency transactions (>$100k value)
**API Provider**: Whale Alert REST API
**Performance**: 400-800ms p95 latency

#### Database Requirements

**Redis** - ✅ **ESSENTIAL**

```yaml
Use Cases:
  - Recent whale transactions caching
  - Rate limit tracking (10 req/min free, 300 req/min gold)
  - Duplicate transaction filtering
  - Alert subscription management

Data Structures:
  - Lists: Recent transactions ("whales:recent" → [tx1, tx2, ...])
  - Hashes: Transaction details ("whale:tx:abc123" → {full_data})
  - Sets: Tracked wallet addresses ("whales:tracked:BTC" → [addr1, addr2])
  - Sorted Sets: Largest transactions by value

TTL Strategies:
  - Recent transactions: 60 seconds (Whale Alert updates every minute)
  - Transaction details: 300 seconds (5 minutes, immutable)
  - Tracked wallets: No TTL (user-configured)
  - Largest transactions: 3600 seconds (1 hour leaderboard)

Storage Estimate:
  - 100 recent transactions × 2KB = 200KB
  - 1,000 tracked wallets × 500 bytes = 500KB
  - Cached transaction details: 5MB
  - **Total: ~6MB base, 50MB under heavy tracking**

Performance Impact:
  - Without cache: 400-800ms API latency
  - With cache (60% hit rate): 160-320ms average
  - **Latency reduction: 50-60%**

Rate Limit Protection:
  - Free tier: 10 req/min (critical bottleneck)
  - With 60% cache hit rate: Effective 25 req/min capacity
  - **Cache increases capacity by 150%**
```

**PostgreSQL** - ✅ **HIGHLY RECOMMENDED** (whale transaction history)

```yaml
Use Cases:
  - Persistent whale transaction history
  - Wallet tracking alerts
  - Large holder analysis (top 100 wallets per token)
  - Exchange flow monitoring (inflows/outflows)

Tables:
  whale_transactions:
    - id (BIGSERIAL PRIMARY KEY)
    - blockchain (VARCHAR(20))
    - symbol (VARCHAR(10))
    - transaction_type (VARCHAR(20)) -- 'transfer', 'exchange_deposit', etc.
    - amount (NUMERIC(30,8))
    - amount_usd (NUMERIC(20,2))
    - from_address (VARCHAR(100))
    - from_owner (VARCHAR(100)) -- 'Binance', 'Unknown', etc.
    - to_address (VARCHAR(100))
    - to_owner (VARCHAR(100))
    - tx_hash (VARCHAR(100) UNIQUE)
    - timestamp (TIMESTAMPTZ)
    - created_at (TIMESTAMPTZ DEFAULT NOW())

  whale_wallets:
    - wallet_address (VARCHAR(100))
    - blockchain (VARCHAR(20))
    - owner_label (VARCHAR(100)) -- 'Binance Cold Wallet', 'Unknown', etc.
    - is_exchange (BOOLEAN)
    - is_tracked (BOOLEAN)
    - balance (NUMERIC(30,8))
    - balance_usd (NUMERIC(20,2))
    - last_activity (TIMESTAMPTZ)
    - PRIMARY KEY (wallet_address, blockchain)

Storage Estimate:
  - 1,000 whale transactions/day × 365 days = 365,000 rows/year
  - Avg row size: 350 bytes
  - **Total: 128MB/year**
  - With 2-year retention: ~250MB

Indexes:
  - CREATE INDEX idx_whale_tx_symbol ON whale_transactions(symbol, timestamp DESC);
  - CREATE INDEX idx_whale_tx_from ON whale_transactions(from_address);
  - CREATE INDEX idx_whale_tx_to ON whale_transactions(to_address);
  - CREATE INDEX idx_whale_tx_value ON whale_transactions(amount_usd DESC);
  - CREATE INDEX idx_wallets_tracked ON whale_wallets(is_tracked) WHERE is_tracked = TRUE;
```

**SQLite Fallback** - ⚠️ **LIMITED**

```yaml
Use Case: Development mode, 30-day transaction history
Limitations: <50,000 rows, single-user tracking
Schema: Simplified whale_transactions table only
```

**Verdict**: **Redis ESSENTIAL** (50-60% latency + 150% capacity), **PostgreSQL HIGHLY RECOMMENDED** (persistent history), **SQLite LIMITED** (30 days)

---

### 6. bridge-rates-mcp (LiFi Cross-Chain Bridge)

**Description**: Cross-chain bridge rates and route aggregation
**API Provider**: LiFi API + SDK
**Performance**: 1000-2000ms p95 latency

#### Database Requirements

**Redis** - ✅ **RECOMMENDED**

```yaml
Use Cases:
  - Bridge route caching (route discovery is EXPENSIVE)
  - Cross-chain token prices
  - Bridge fee estimates
  - Available liquidity per bridge

Data Structures:
  - Hashes: Route data ("route:ETH-MATIC:USDC" → {route_details})
  - Strings: Bridge fees ("bridge:hop:ETH-MATIC" → "0.005")
  - Sorted Sets: Cheapest routes by fee
  - Lists: Supported chains and bridges

TTL Strategies:
  - Bridge routes: 300 seconds (5 minutes, liquidity changes slowly)
  - Token prices: 60 seconds (cross-chain arbitrage exists)
  - Bridge fees: 600 seconds (10 minutes, relatively stable)
  - Supported bridges list: 3600 seconds (1 hour)

Storage Estimate:
  - 20 chains × 20 chains × 10 tokens = 4,000 routes × 2KB = 8MB
  - Price data: 500KB
  - Bridge metadata: 1MB
  - **Total: ~10MB base, 50MB under load**

Performance Impact:
  - Without cache: 1000-2000ms route discovery latency
  - With cache (50% hit rate): 500-1000ms average
  - **Latency reduction: 37-50%**

Note: Cache hit rate lower (50%) because routes depend on:
  - Source/destination chains
  - Token type
  - Amount (affects liquidity)
  - User preferences (speed vs cost)
```

**PostgreSQL** - ⚠️ **OPTIONAL** (historical rates)

```yaml
Use Cases:
  - Historical bridge fee tracking
  - Bridge performance comparison (speed, cost, reliability)
  - Optimal bridge recommendation engine

Tables:
  bridge_history:
    - id (BIGSERIAL PRIMARY KEY)
    - bridge_name (VARCHAR(50))
    - source_chain (VARCHAR(20))
    - dest_chain (VARCHAR(20))
    - token (VARCHAR(10))
    - amount (NUMERIC(20,8))
    - fee_usd (NUMERIC(10,2))
    - estimated_time_minutes (INTEGER)
    - timestamp (TIMESTAMPTZ)

Storage Estimate:
  - 100 bridge queries/day × 365 days = 36,500 rows/year
  - Avg row size: 150 bytes
  - **Total: 5.5MB/year (negligible)**

Indexes:
  - CREATE INDEX idx_bridge_route ON bridge_history(source_chain, dest_chain, token);
  - CREATE INDEX idx_bridge_time ON bridge_history(timestamp DESC);
```

**SQLite Fallback** - ✅ **YES**

```yaml
Use Case: Development mode, route caching only
Schema: Simplified bridge_history (30 days)
Performance: Acceptable for low-volume testing
```

**Verdict**: **Redis RECOMMENDED** (37-50% latency improvement), **PostgreSQL OPTIONAL** (historical analysis), **SQLite YES** (dev mode)

---

### 7. memecoin-radar-mcp (Dune Analytics)

**Description**: Memecoin discovery via Dune Analytics queries
**API Provider**: Dune Analytics API
**Performance**: 2000-5000ms p95 latency (VERY SLOW)

#### Database Requirements

**Redis** - ✅ **CRITICAL**

```yaml
Use Cases:
  - Dune query result caching (queries are EXTREMELY SLOW)
  - Query execution tracking (1000 exec/month free limit)
  - Trending memecoin lists
  - Query result snapshots

Data Structures:
  - Hashes: Query results ("dune:query:123456" → {result_data})
  - Sorted Sets: Trending memecoins by volume
  - Counters: Query execution quota tracking
  - Strings: Last refresh timestamps

TTL Strategies:
  - Query results: 1800 seconds (30 minutes, Dune data updates hourly)
  - Trending lists: 600 seconds (10 minutes)
  - Query quotas: 86400 seconds (24 hours, monthly reset)
  - Execution timestamps: No TTL (audit trail)

Storage Estimate:
  - 50 query types × 500KB avg result = 25MB
  - Trending lists: 2MB
  - Metadata: 1MB
  - **Total: ~28MB base, 100MB with full cache**

Performance Impact:
  - Without cache: 2000-5000ms query execution time
  - With cache (80% hit rate): 400-1000ms average
  - **Latency reduction: 60-80%**

Quota Protection:
  - Free tier: 1000 executions/month (~33/day, 1.4/hour)
  - Paid tier: 10,000 executions/month (~333/day, 14/hour)
  - With 80% cache hit rate: Effective 166/day capacity on free tier
  - **Cache increases capacity by 400%**

Critical Note: Without Redis, free tier quota exhausted in 2 days!
```

**PostgreSQL** - ✅ **RECOMMENDED** (memecoin discovery database)

```yaml
Use Cases:
  - Memecoin metadata (name, symbol, contract, launch date)
  - Price history (7-day, 30-day charts)
  - Volume tracking (DEX volume, holder count growth)
  - Rug pull detection (liquidity removal alerts)

Tables:
  memecoins:
    - contract_address (VARCHAR(42) PRIMARY KEY)
    - chain (VARCHAR(20))
    - name (VARCHAR(100))
    - symbol (VARCHAR(20))
    - launch_date (DATE)
    - initial_liquidity_usd (NUMERIC(20,2))
    - current_liquidity_usd (NUMERIC(20,2))
    - holder_count (INTEGER)
    - is_renounced (BOOLEAN)
    - is_locked (BOOLEAN)
    - risk_score (INTEGER) -- 0-100
    - created_at (TIMESTAMPTZ DEFAULT NOW())
    - updated_at (TIMESTAMPTZ DEFAULT NOW())

  memecoin_metrics:
    - id (BIGSERIAL PRIMARY KEY)
    - contract_address (VARCHAR(42) REFERENCES memecoins(contract_address))
    - price_usd (NUMERIC(20,12))
    - volume_24h_usd (NUMERIC(20,2))
    - market_cap_usd (NUMERIC(20,2))
    - holder_count (INTEGER)
    - liquidity_usd (NUMERIC(20,2))
    - timestamp (TIMESTAMPTZ)

  dune_query_cache:
    - query_id (VARCHAR(50) PRIMARY KEY)
    - query_name (VARCHAR(200))
    - result_data (JSONB)
    - execution_time_ms (INTEGER)
    - row_count (INTEGER)
    - credits_used (INTEGER)
    - executed_at (TIMESTAMPTZ)
    - expires_at (TIMESTAMPTZ)

Storage Estimate:
  - 10,000 memecoins × 500 bytes = 5MB
  - Metrics: 10,000 coins × 24 samples/day × 100 bytes = 24MB/day
  - With 30-day retention: 720MB
  - Query cache: 50 queries × 500KB = 25MB
  - **Total: ~750MB for 30-day rolling window**

Indexes:
  - CREATE INDEX idx_memecoins_chain ON memecoins(chain);
  - CREATE INDEX idx_memecoins_launch ON memecoins(launch_date DESC);
  - CREATE INDEX idx_memecoins_risk ON memecoins(risk_score);
  - CREATE INDEX idx_metrics_contract_time ON memecoin_metrics(contract_address, timestamp DESC);
  - CREATE INDEX idx_metrics_volume ON memecoin_metrics(volume_24h_usd DESC);
  - CREATE INDEX idx_dune_expires ON dune_query_cache(expires_at);
```

**SQLite Fallback** - ❌ **NOT RECOMMENDED**

```yaml
Reasoning:
  - JSONB queries not supported in SQLite
  - 750MB dataset too large for embedded database
  - Concurrent writes needed (metrics updated every hour)

Possible Workaround:
  - Limit to 100 memecoins
  - 7-day retention only
  - Single-user development mode
  - Storage: ~25MB
```

**Verdict**: **Redis CRITICAL** (60-80% latency + 400% quota increase), **PostgreSQL RECOMMENDED** (memecoin database), **SQLite NOT RECOMMENDED** (too complex)

---

## Redis Requirements: Detailed Specification

### 1. Redis Use Case Summary

| MCP | Redis Required? | Primary Use Cases | Storage | Cache Hit Rate | Latency Impact |
|-----|-----------------|-------------------|---------|----------------|----------------|
| jupiter-mcp | ✅ Recommended | Token prices, route caching | 1-50MB | 80% | -60-75% |
| uniswap-trader-mcp | ✅ Essential | Pool state, gas prices, RPC limits | 3-100MB | 85% | -70-80% |
| crypto-indicators-mcp | ❌ Not required | N/A (stateless) | 0MB | N/A | N/A |
| crypto-sentiment-mcp | ✅ Essential | Query cache, rate limits | 6-50MB | 70% | -60-70% |
| whale-tracker-mcp | ✅ Essential | Transaction cache, rate limits | 6-50MB | 60% | -50-60% |
| bridge-rates-mcp | ✅ Recommended | Route caching | 10-50MB | 50% | -37-50% |
| memecoin-radar-mcp | ✅ Critical | Dune query cache, quota tracking | 28-100MB | 80% | -60-80% |

**Total Redis Storage Requirement**: 100MB - 2GB (under heavy load)

### 2. Redis Data Structures Inventory

#### Strings (Simple Key-Value)

```redis
# Token prices
SET token:SOL:price "145.23" EX 30
SET token:ETH:price "2876.45" EX 30

# Gas prices
SET gas:ethereum:base "25" EX 15
SET gas:polygon:base "150" EX 15

# API rate limit counters
INCR ratelimit:santiment:hourly EX 3600
INCR ratelimit:whalealert:minute EX 60

# Cached sentiment scores
SET sentiment:BTC:social_volume "1234567" EX 300
```

#### Hashes (Structured Data)

```redis
# Pool state (Uniswap)
HSET pool:ETH:0xabc123 reserve0 1000000 reserve1 2000000 fee 3000
EXPIRE pool:ETH:0xabc123 30

# Route data (Jupiter)
HSET route:SOL-USDC path "SOL->ORCA->USDC" impact "0.05" fee "0.0025"
EXPIRE route:SOL-USDC 60

# Whale transaction details
HSET whale:tx:abc123 blockchain "ETH" amount "1000" value_usd "2876450" from "Binance"
EXPIRE whale:tx:abc123 300

# Dune query results
HSET dune:query:123456 result_data "{...json...}" execution_time_ms "4500" row_count "1000"
EXPIRE dune:query:123456 1800
```

#### Lists (Ordered Collections)

```redis
# Recent whale transactions
LPUSH whales:recent "tx:abc123" "tx:def456" "tx:ghi789"
LTRIM whales:recent 0 99  # Keep last 100
EXPIRE whales:recent 60

# Recent block numbers (chain tip tracking)
LPUSH blocks:ethereum 19000000 19000001 19000002
LTRIM blocks:ethereum 0 9
EXPIRE blocks:ethereum 120
```

#### Sorted Sets (Ranked Data)

```redis
# Top trading pairs by volume
ZADD trading:volume:24h 1000000 "SOL-USDC" 800000 "ETH-USDC" 500000 "BTC-USDC"
EXPIRE trading:volume:24h 300

# Trending memecoins by social volume
ZADD trending:memecoins 50000 "PEPE" 30000 "WIF" 20000 "BONK"
EXPIRE trending:memecoins 600

# Largest whale transactions by USD value
ZADD whales:largest:24h 10000000 "tx:abc123" 5000000 "tx:def456"
EXPIRE whales:largest:24h 3600

# Cheapest bridge routes by fee
ZADD routes:cheapest:ETH-MATIC 0.005 "Hop" 0.008 "Stargate" 0.012 "Synapse"
EXPIRE routes:cheapest:ETH-MATIC 600
```

#### Sets (Unique Collections)

```redis
# Tracked whale wallets
SADD whales:tracked:BTC "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" "3Cbq7aT1tY8kMxWLbitaG7yT6bPbKChq64"
# No expiration (user-configured)

# Available bridges for a route
SADD bridges:ETH-POLYGON "Hop" "Stargate" "Connext" "Across"
EXPIRE bridges:ETH-POLYGON 3600
```

### 3. Redis TTL Strategy Matrix

| Data Type | TTL | Reasoning | Refresh Strategy |
|-----------|-----|-----------|------------------|
| **Token Prices** | 30s | High volatility, real-time trading | Background refresh every 25s |
| **Pool Reserves** | 30s | Ethereum block time ~12s, 2-3 blocks buffer | Refresh on cache miss |
| **Gas Prices** | 15s | Fluctuates rapidly, critical for tx timing | Background refresh every 12s |
| **Route Quotes** | 60s | Route discovery expensive, liquidity stable | Lazy refresh on cache miss |
| **Sentiment Scores** | 300s (5min) | Social metrics update slowly | Scheduled refresh every 4min |
| **Social Volume** | 600s (10min) | Aggregated data, hourly updates sufficient | Scheduled refresh every 9min |
| **Whale Transactions** | 60s | Recent transactions, immutable once confirmed | One-time cache, no refresh |
| **Whale Details** | 300s (5min) | Transaction metadata, rarely accessed twice | Lazy load only |
| **Bridge Routes** | 300s (5min) | Liquidity pools stable, fees change slowly | Refresh on user request |
| **Bridge Fees** | 600s (10min) | Fee structure updates infrequently | Scheduled refresh |
| **Dune Queries** | 1800s (30min) | Extremely expensive, data updates hourly | Aggressive caching |
| **Trending Lists** | 600s (10min) | Leaderboard-style data, 10min freshness OK | Scheduled background job |
| **API Rate Limits** | Variable | 60s (minute-based), 3600s (hourly), 86400s (daily) | Rolling window counters |
| **Token Metadata** | 3600s (1hr) | Name, symbol, decimals - rarely changes | Lazy refresh |
| **Supported Chains** | 3600s (1hr) | Infrastructure rarely adds chains | Manual refresh on deploy |

### 4. Redis Configuration Recommendations

#### Production Configuration (`redis.conf`)

```conf
# Memory Management
maxmemory 2GB
maxmemory-policy allkeys-lru  # Evict least recently used keys when full
maxmemory-samples 5

# Persistence (AOF for durability)
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Performance
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Snapshotting (backup)
save 900 1      # Save if 1 key changed in 15 minutes
save 300 10     # Save if 10 keys changed in 5 minutes
save 60 10000   # Save if 10,000 keys changed in 1 minute

# Slow Log (performance monitoring)
slowlog-log-slower-than 10000  # 10ms threshold
slowlog-max-len 128

# Security
requirepass <strong_password>
bind 127.0.0.1
protected-mode yes
```

#### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: crypto-mcp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    resources:
      limits:
        memory: 2GB
        cpus: '1.0'
      reservations:
        memory: 512MB
        cpus: '0.5'

volumes:
  redis_data:
    driver: local
```

### 5. Redis Client Libraries

#### Node.js (ioredis)

```javascript
// redis-client.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

// Connection event handlers
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

module.exports = redis;
```

#### Python (redis-py)

```python
# redis_client.py
import redis
import os
from redis.retry import Retry
from redis.backoff import ExponentialBackoff

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', '127.0.0.1'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD'),
    db=0,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
    retry=Retry(ExponentialBackoff(), 3),
    health_check_interval=30,
)

# Test connection
try:
    redis_client.ping()
    print("Redis connected successfully")
except redis.ConnectionError as e:
    print(f"Redis connection failed: {e}")
```

### 6. Redis Storage Estimation

#### Per-MCP Storage Breakdown

```
jupiter-mcp:
  Base (idle):           1 MB  (1,000 tokens × 1KB)
  Normal load:          10 MB  (10,000 routes cached)
  Peak load:            50 MB  (50,000 active quotes)

uniswap-trader-mcp:
  Base (idle):           3 MB  (5,000 pools × 500 bytes)
  Normal load:          20 MB  (Pool state + gas data)
  Peak load:           100 MB  (Multi-chain high frequency)

crypto-sentiment-mcp:
  Base (idle):           6 MB  (500 tokens × 10 metrics)
  Normal load:          15 MB  (Cached GraphQL queries)
  Peak load:            50 MB  (100 queries × 500KB)

whale-tracker-mcp:
  Base (idle):           6 MB  (1,000 wallets tracked)
  Normal load:          15 MB  (Recent transactions)
  Peak load:            50 MB  (High transaction volume)

bridge-rates-mcp:
  Base (idle):          10 MB  (4,000 routes)
  Normal load:          20 MB  (Route cache)
  Peak load:            50 MB  (Multi-token bridging)

memecoin-radar-mcp:
  Base (idle):          28 MB  (50 Dune queries cached)
  Normal load:          50 MB  (Trending lists + metadata)
  Peak load:           100 MB  (Full query cache)

TOTAL:
  Base (5 MCPs idle):   54 MB
  Normal (5 MCPs):     130 MB
  Peak (5 MCPs):       400 MB
  Enterprise (all 7):  500 MB - 2 GB
```

#### Redis Memory Overhead

```
Actual Memory = Data Size × 1.5 (Redis overhead)

Examples:
- 100 MB data → 150 MB Redis memory
- 500 MB data → 750 MB Redis memory
- 1 GB data → 1.5 GB Redis memory

Recommended Redis Configuration:
- Development: 256 MB (handles base + overhead)
- Production Starter: 512 MB (handles normal load)
- Production Enterprise: 2 GB (handles peak + headroom)
```

### 7. Redis Monitoring Metrics

#### Key Performance Indicators

```bash
# Redis CLI monitoring commands

# Memory usage
INFO memory
# Output: used_memory_human, used_memory_peak_human, mem_fragmentation_ratio

# Hit rate
INFO stats
# Output: keyspace_hits, keyspace_misses
# Hit Rate = hits / (hits + misses)

# Slow queries
SLOWLOG GET 10
# Shows queries >10ms

# Connected clients
CLIENT LIST
# Shows all connected MCP instances

# Evicted keys (memory pressure)
INFO stats
# Output: evicted_keys (should be 0 in healthy system)
```

#### Prometheus Metrics (redis_exporter)

```yaml
# Alerts
- name: redis_alerts
  rules:
    - alert: RedisHighMemoryUsage
      expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
      for: 5m
      annotations:
        summary: "Redis memory usage above 90%"

    - alert: RedisLowCacheHitRate
      expr: rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) < 0.5
      for: 10m
      annotations:
        summary: "Redis cache hit rate below 50%"

    - alert: RedisHighEvictionRate
      expr: rate(redis_evicted_keys_total[5m]) > 100
      for: 5m
      annotations:
        summary: "Redis evicting keys (memory pressure)"
```

---

## PostgreSQL Requirements: Detailed Specification

### 1. PostgreSQL Use Case Summary

| MCP | PostgreSQL Required? | Primary Use Cases | Storage Estimate |
|-----|---------------------|-------------------|------------------|
| jupiter-mcp | ⚠️ Optional | Swap history, token performance | 7 MB/year |
| uniswap-trader-mcp | ✅ Recommended | Multi-chain trade logs, portfolios | 90 MB/year |
| crypto-indicators-mcp | ❌ Not required | N/A (stateless) | 0 MB |
| crypto-sentiment-mcp | ✅ Recommended | Sentiment time-series, correlations | 400 MB (90-day) |
| whale-tracker-mcp | ✅ Highly Recommended | Whale transaction history | 250 MB (2-year) |
| bridge-rates-mcp | ⚠️ Optional | Historical bridge fees | 6 MB/year |
| memecoin-radar-mcp | ✅ Recommended | Memecoin database, metrics | 750 MB (30-day) |

**Total PostgreSQL Storage Requirement**: 5 GB - 100 GB (depending on retention policies)

### 2. Unified Schema Design

#### Core Tables (Shared Across MCPs)

```sql
-- chains: Supported blockchain networks
CREATE TABLE chains (
    chain_id SERIAL PRIMARY KEY,
    chain_name VARCHAR(50) UNIQUE NOT NULL,  -- 'ethereum', 'polygon', 'solana', etc.
    chain_type VARCHAR(20),  -- 'evm', 'solana', 'cosmos'
    rpc_url VARCHAR(500),
    explorer_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tokens: Token metadata (multi-chain)
CREATE TABLE tokens (
    token_id SERIAL PRIMARY KEY,
    chain_id INTEGER REFERENCES chains(chain_id),
    contract_address VARCHAR(100),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    decimals INTEGER,
    is_stablecoin BOOLEAN DEFAULT FALSE,
    coingecko_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (chain_id, contract_address)
);

-- price_history: Centralized price data (TimescaleDB hypertable)
CREATE TABLE price_history (
    token_id INTEGER REFERENCES tokens(token_id),
    price_usd NUMERIC(20,8) NOT NULL,
    volume_24h NUMERIC(20,2),
    market_cap NUMERIC(20,2),
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(50),  -- 'jupiter', 'uniswap', 'coingecko'
    PRIMARY KEY (token_id, timestamp)
);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('price_history', 'timestamp', if_not_exists => TRUE);

-- users: Application users (for multi-user deployments)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(100) UNIQUE,
    email VARCHAR(255),
    api_key VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);
```

#### MCP-Specific Tables

```sql
-- jupiter_swaps: Solana swap transactions
CREATE TABLE jupiter_swaps (
    swap_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    user_wallet VARCHAR(44) NOT NULL,
    input_token_id INTEGER REFERENCES tokens(token_id),
    output_token_id INTEGER REFERENCES tokens(token_id),
    input_amount NUMERIC(30,8) NOT NULL,
    output_amount NUMERIC(30,8) NOT NULL,
    price_impact NUMERIC(5,4),
    route_plan JSONB,  -- Full Jupiter route details
    signature VARCHAR(88) UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jupiter_swaps_user ON jupiter_swaps(user_id, timestamp DESC);
CREATE INDEX idx_jupiter_swaps_tokens ON jupiter_swaps(input_token_id, output_token_id);

-- uniswap_trades: Multi-chain DEX trades
CREATE TABLE uniswap_trades (
    trade_id BIGSERIAL PRIMARY KEY,
    chain_id INTEGER REFERENCES chains(chain_id),
    user_address VARCHAR(42) NOT NULL,
    pool_address VARCHAR(42),
    token_in_id INTEGER REFERENCES tokens(token_id),
    token_out_id INTEGER REFERENCES tokens(token_id),
    amount_in NUMERIC(30,18) NOT NULL,
    amount_out NUMERIC(30,18) NOT NULL,
    gas_used BIGINT,
    gas_price BIGINT,
    block_number BIGINT,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_uniswap_trades_user ON uniswap_trades(user_address, timestamp DESC);
CREATE INDEX idx_uniswap_trades_chain ON uniswap_trades(chain_id, timestamp DESC);

-- sentiment_metrics: Social sentiment time-series
CREATE TABLE sentiment_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(token_id),
    metric_name VARCHAR(100) NOT NULL,  -- 'social_volume', 'sentiment_positive', etc.
    metric_value NUMERIC(20,4) NOT NULL,
    source VARCHAR(50) DEFAULT 'santiment',
    timestamp TIMESTAMPTZ NOT NULL,
    UNIQUE (token_id, metric_name, timestamp)
);

SELECT create_hypertable('sentiment_metrics', 'timestamp', if_not_exists => TRUE);
CREATE INDEX idx_sentiment_token ON sentiment_metrics(token_id, timestamp DESC);

-- whale_transactions: Large transactions
CREATE TABLE whale_transactions (
    tx_id BIGSERIAL PRIMARY KEY,
    chain_id INTEGER REFERENCES chains(chain_id),
    token_id INTEGER REFERENCES tokens(token_id),
    transaction_type VARCHAR(50),  -- 'transfer', 'exchange_deposit', 'exchange_withdrawal'
    amount NUMERIC(30,8) NOT NULL,
    amount_usd NUMERIC(20,2) NOT NULL,
    from_address VARCHAR(100),
    from_owner VARCHAR(100),  -- 'Binance', 'Unknown', etc.
    to_address VARCHAR(100),
    to_owner VARCHAR(100),
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whale_tx_chain ON whale_transactions(chain_id, timestamp DESC);
CREATE INDEX idx_whale_tx_token ON whale_transactions(token_id, timestamp DESC);
CREATE INDEX idx_whale_tx_value ON whale_transactions(amount_usd DESC);

-- memecoins: Memecoin discovery database
CREATE TABLE memecoins (
    memecoin_id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(token_id) UNIQUE,
    launch_date DATE,
    initial_liquidity_usd NUMERIC(20,2),
    current_liquidity_usd NUMERIC(20,2),
    holder_count INTEGER,
    is_renounced BOOLEAN,
    is_locked BOOLEAN,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    dune_query_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memecoin_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    memecoin_id INTEGER REFERENCES memecoins(memecoin_id),
    price_usd NUMERIC(20,12),
    volume_24h_usd NUMERIC(20,2),
    market_cap_usd NUMERIC(20,2),
    holder_count INTEGER,
    liquidity_usd NUMERIC(20,2),
    timestamp TIMESTAMPTZ NOT NULL,
    UNIQUE (memecoin_id, timestamp)
);

SELECT create_hypertable('memecoin_metrics', 'timestamp', if_not_exists => TRUE);
CREATE INDEX idx_memecoin_metrics_id ON memecoin_metrics(memecoin_id, timestamp DESC);

-- bridge_operations: Cross-chain bridge history
CREATE TABLE bridge_operations (
    operation_id BIGSERIAL PRIMARY KEY,
    bridge_name VARCHAR(50) NOT NULL,
    source_chain_id INTEGER REFERENCES chains(chain_id),
    dest_chain_id INTEGER REFERENCES chains(chain_id),
    token_id INTEGER REFERENCES tokens(token_id),
    amount NUMERIC(30,8) NOT NULL,
    fee_usd NUMERIC(10,2),
    estimated_time_minutes INTEGER,
    actual_time_minutes INTEGER,
    status VARCHAR(20),  -- 'pending', 'completed', 'failed'
    source_tx_hash VARCHAR(100),
    dest_tx_hash VARCHAR(100),
    timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_bridge_route ON bridge_operations(source_chain_id, dest_chain_id, token_id);
CREATE INDEX idx_bridge_time ON bridge_operations(timestamp DESC);
```

### 3. PostgreSQL Configuration Recommendations

#### Production Configuration (`postgresql.conf`)

```conf
# Memory Configuration
shared_buffers = 1GB                  # 25% of system RAM
effective_cache_size = 3GB            # 75% of system RAM
maintenance_work_mem = 256MB
work_mem = 16MB

# Checkpoint Configuration
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Query Planner
random_page_cost = 1.1               # For SSD storage
effective_io_concurrency = 200

# Write-Ahead Log (WAL)
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB

# Connections
max_connections = 100
```

#### TimescaleDB Extension (Time-Series Optimization)

```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertables for time-series data
SELECT create_hypertable('price_history', 'timestamp');
SELECT create_hypertable('sentiment_metrics', 'timestamp');
SELECT create_hypertable('memecoin_metrics', 'timestamp');

-- Compression policy (compress data older than 7 days)
SELECT add_compression_policy('price_history', INTERVAL '7 days');
SELECT add_compression_policy('sentiment_metrics', INTERVAL '7 days');
SELECT add_compression_policy('memecoin_metrics', INTERVAL '7 days');

-- Retention policy (drop data older than 90 days)
SELECT add_retention_policy('sentiment_metrics', INTERVAL '90 days');
SELECT add_retention_policy('memecoin_metrics', INTERVAL '30 days');
```

#### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    container_name: crypto-mcp-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: crypto_mcp
      POSTGRES_USER: crypto_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crypto_user -d crypto_mcp"]
      interval: 10s
      timeout: 3s
      retries: 3
    resources:
      limits:
        memory: 4GB
        cpus: '2.0'
      reservations:
        memory: 1GB
        cpus: '1.0'

volumes:
  postgres_data:
    driver: local
```

### 4. Storage Estimation & Retention Policies

#### Storage Growth Projections

```
Scenario 1: Light Usage (100 active users)
─────────────────────────────────────────
jupiter_swaps:         50 swaps/day × 365 = 18,250 rows/year × 300 bytes = 5.5 MB
uniswap_trades:        100 trades/day × 365 = 36,500 rows/year × 350 bytes = 12.8 MB
sentiment_metrics:     500 tokens × 10 metrics × 24/day × 365 = 43.8M rows/year × 100 bytes = 4.4 GB
whale_transactions:    500 tx/day × 365 = 182,500 rows/year × 400 bytes = 73 MB
memecoin_metrics:      1,000 coins × 24/day × 30 days = 720K rows × 150 bytes = 108 MB
bridge_operations:     20/day × 365 = 7,300 rows/year × 250 bytes = 1.8 MB

Total Year 1:          4.6 GB
With TimescaleDB compression (3x): 1.5 GB

Scenario 2: Production Usage (10,000 active users)
──────────────────────────────────────────────────
jupiter_swaps:         5,000 swaps/day × 365 = 1.8M rows/year × 300 bytes = 540 MB
uniswap_trades:        10,000 trades/day × 365 = 3.65M rows/year × 350 bytes = 1.3 GB
sentiment_metrics:     500 tokens × 10 metrics × 24/day × 365 = 43.8M rows/year × 100 bytes = 4.4 GB
whale_transactions:    1,000 tx/day × 365 = 365K rows/year × 400 bytes = 146 MB
memecoin_metrics:      5,000 coins × 24/day × 30 days = 3.6M rows × 150 bytes = 540 MB
bridge_operations:     500/day × 365 = 182,500 rows/year × 250 bytes = 46 MB

Total Year 1:          7 GB
With TimescaleDB compression (3x): 2.3 GB

Scenario 3: Enterprise Usage (100,000 users)
────────────────────────────────────────────
jupiter_swaps:         50,000 swaps/day × 365 = 18.25M rows/year × 300 bytes = 5.5 GB
uniswap_trades:        100,000 trades/day × 365 = 36.5M rows/year × 350 bytes = 12.8 GB
sentiment_metrics:     500 tokens × 10 metrics × 24/day × 365 = 43.8M rows/year × 100 bytes = 4.4 GB
whale_transactions:    2,000 tx/day × 365 = 730K rows/year × 400 bytes = 292 MB
memecoin_metrics:      10,000 coins × 24/day × 30 days = 7.2M rows × 150 bytes = 1.1 GB
bridge_operations:     5,000/day × 365 = 1.8M rows/year × 250 bytes = 450 MB

Total Year 1:          24.5 GB
With TimescaleDB compression (3x): 8.2 GB
```

#### Recommended Retention Policies

```sql
-- High-frequency time-series data (compress + retain)
ALTER TABLE sentiment_metrics SET (
  timescaledb.compress = true,
  timescaledb.compress_segmentby = 'token_id, metric_name'
);
SELECT add_compression_policy('sentiment_metrics', INTERVAL '7 days');
SELECT add_retention_policy('sentiment_metrics', INTERVAL '90 days');

ALTER TABLE memecoin_metrics SET (
  timescaledb.compress = true,
  timescaledb.compress_segmentby = 'memecoin_id'
);
SELECT add_compression_policy('memecoin_metrics', INTERVAL '7 days');
SELECT add_retention_policy('memecoin_metrics', INTERVAL '30 days');

-- Transaction logs (retain longer, compress aggressively)
ALTER TABLE price_history SET (
  timescaledb.compress = true,
  timescaledb.compress_segmentby = 'token_id, source'
);
SELECT add_compression_policy('price_history', INTERVAL '7 days');
-- No retention policy (keep forever for backtesting)

-- Trade history (user-facing, retain 2 years)
CREATE OR REPLACE FUNCTION delete_old_trades() RETURNS void AS $$
BEGIN
  DELETE FROM jupiter_swaps WHERE timestamp < NOW() - INTERVAL '2 years';
  DELETE FROM uniswap_trades WHERE timestamp < NOW() - INTERVAL '2 years';
  DELETE FROM bridge_operations WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly cleanup
SELECT cron.schedule('cleanup-old-trades', '0 0 1 * *', 'SELECT delete_old_trades()');
```

### 5. Database Backup Strategy

```bash
#!/bin/bash
# backup-postgres.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="crypto_mcp"

# Full backup (daily at 2 AM)
pg_dump -U crypto_user -Fc -f "${BACKUP_DIR}/full_${DATE}.dump" ${DB_NAME}

# Compress older than 7 days
find ${BACKUP_DIR} -name "full_*.dump" -mtime +7 -exec gzip {} \;

# Delete older than 30 days
find ${BACKUP_DIR} -name "full_*.dump.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp "${BACKUP_DIR}/full_${DATE}.dump" s3://crypto-mcp-backups/postgres/
```

---

## SQLite Fallback Strategy

### 1. When to Use SQLite

✅ **Use SQLite for:**
- **Local development** (no Docker dependency)
- **Single-user deployments** (personal portfolio tracker)
- **Minimal installation mode** (no Redis/PostgreSQL)
- **CLI tools** (offline data analysis)
- **Testing** (faster test setup)

❌ **Do NOT use SQLite for:**
- **Production multi-user deployments** (no concurrent writes)
- **High-frequency trading** (write lock contention)
- **Large datasets** (>1 GB, performance degrades)
- **Complex analytics** (no TimescaleDB, limited window functions)

### 2. SQLite Schema (Simplified)

```sql
-- sqlite-schema.sql
-- Minimal schema for development mode

CREATE TABLE tokens (
    token_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain VARCHAR(50) NOT NULL,
    contract_address VARCHAR(100),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    decimals INTEGER,
    UNIQUE (chain, contract_address)
);

CREATE TABLE price_cache (
    token_id INTEGER REFERENCES tokens(token_id),
    price_usd REAL NOT NULL,
    volume_24h REAL,
    timestamp INTEGER NOT NULL,  -- Unix timestamp
    PRIMARY KEY (token_id, timestamp)
);

CREATE INDEX idx_price_timestamp ON price_cache(timestamp DESC);

CREATE TABLE swap_history (
    swap_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_wallet VARCHAR(100),
    input_token_id INTEGER REFERENCES tokens(token_id),
    output_token_id INTEGER REFERENCES tokens(token_id),
    input_amount REAL,
    output_amount REAL,
    timestamp INTEGER NOT NULL
);

CREATE INDEX idx_swap_user ON swap_history(user_wallet, timestamp DESC);

CREATE TABLE api_cache (
    cache_key TEXT PRIMARY KEY,
    cache_value TEXT NOT NULL,  -- JSON string
    expires_at INTEGER NOT NULL  -- Unix timestamp
);

CREATE INDEX idx_cache_expires ON api_cache(expires_at);

-- Simple cleanup trigger (delete expired cache entries)
CREATE TRIGGER cleanup_expired_cache
AFTER INSERT ON api_cache
BEGIN
    DELETE FROM api_cache WHERE expires_at < strftime('%s', 'now');
END;
```

### 3. SQLite Configuration

```python
# sqlite_config.py
import sqlite3
import os

def get_sqlite_connection(db_path='crypto_mcp.db'):
    """Initialize SQLite with optimal settings for crypto MCP suite."""
    conn = sqlite3.connect(
        db_path,
        check_same_thread=False,  # Allow multi-threaded access (read-only)
        timeout=10.0,  # 10 second lock timeout
    )

    # Performance optimizations
    conn.execute('PRAGMA journal_mode=WAL')  # Write-Ahead Logging
    conn.execute('PRAGMA synchronous=NORMAL')  # Faster writes
    conn.execute('PRAGMA cache_size=10000')  # 10,000 pages (~40MB cache)
    conn.execute('PRAGMA temp_store=MEMORY')  # Temp tables in RAM
    conn.execute('PRAGMA mmap_size=268435456')  # 256MB memory-mapped I/O

    # Enable foreign keys
    conn.execute('PRAGMA foreign_keys=ON')

    return conn
```

### 4. SQLite Limitations & Workarounds

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **No concurrent writes** | Only 1 writer at a time | Use WAL mode, batch writes, read-heavy queries |
| **No JSONB type** | Can't index JSON fields | Store as TEXT, parse in application |
| **Limited date functions** | No TimescaleDB features | Use Unix timestamps (INTEGER) |
| **3.5GB max cache** | Large datasets slow down | Aggressive retention (7 days max) |
| **No network access** | Single machine only | Use for CLI tools, not multi-instance |
| **Single file** | Entire DB locks | Split into multiple DBs if needed |

### 5. Migration Path: SQLite → PostgreSQL

```python
# migrate_sqlite_to_postgres.py
import sqlite3
import psycopg2
from datetime import datetime

def migrate_to_postgres(sqlite_path, postgres_dsn):
    """Migrate SQLite data to PostgreSQL."""

    # Connect to both databases
    sqlite_conn = sqlite3.connect(sqlite_path)
    pg_conn = psycopg2.connect(postgres_dsn)
    pg_cursor = pg_conn.cursor()

    # Migrate tokens
    print("Migrating tokens...")
    tokens = sqlite_conn.execute("SELECT * FROM tokens").fetchall()
    for token in tokens:
        pg_cursor.execute("""
            INSERT INTO tokens (chain_id, contract_address, symbol, name, decimals)
            VALUES (
                (SELECT chain_id FROM chains WHERE chain_name = %s),
                %s, %s, %s, %s
            )
            ON CONFLICT (chain_id, contract_address) DO NOTHING
        """, (token[1], token[2], token[3], token[4], token[5]))

    # Migrate price cache
    print("Migrating price cache...")
    prices = sqlite_conn.execute("SELECT * FROM price_cache LIMIT 10000").fetchall()
    for price in prices:
        pg_cursor.execute("""
            INSERT INTO price_history (token_id, price_usd, volume_24h, timestamp, source)
            VALUES (%s, %s, %s, to_timestamp(%s), 'sqlite_migration')
        """, (price[0], price[1], price[2], price[3]))

    # Migrate swap history
    print("Migrating swap history...")
    swaps = sqlite_conn.execute("SELECT * FROM swap_history").fetchall()
    for swap in swaps:
        pg_cursor.execute("""
            INSERT INTO jupiter_swaps (user_wallet, input_token_id, output_token_id, input_amount, output_amount, timestamp)
            VALUES (%s, %s, %s, %s, %s, to_timestamp(%s))
        """, (swap[1], swap[2], swap[3], swap[4], swap[5], swap[6]))

    pg_conn.commit()
    print(f"Migration complete! Migrated {len(tokens)} tokens, {len(prices)} prices, {len(swaps)} swaps")
```

---

## Database Setup Automation

### 1. Docker Compose (Full Stack)

```yaml
# docker-compose-databases.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: crypto-mcp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  postgres:
    image: timescale/timescaledb:latest-pg15
    container_name: crypto-mcp-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: crypto_mcp
      POSTGRES_USER: crypto_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-postgres.sql:/docker-entrypoint-initdb.d/01-schema.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crypto_user"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis_data:
  postgres_data:
```

### 2. One-Command Setup Script

```bash
#!/bin/bash
# setup-databases.sh

set -e  # Exit on error

echo "🚀 Crypto MCP Database Setup"
echo "=============================="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose not installed"; exit 1; }

# Create directories
mkdir -p data/redis data/postgres logs

# Generate random PostgreSQL password
if [ ! -f .env ]; then
    echo "📝 Generating database credentials..."
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    cat > .env <<EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
REDIS_HOST=localhost
REDIS_PORT=6379
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=crypto_mcp
POSTGRES_USER=crypto_user
EOF
    echo "✅ Credentials saved to .env"
fi

# Start databases
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose-databases.yml up -d

# Wait for databases to be ready
echo "⏳ Waiting for Redis..."
until docker exec crypto-mcp-redis redis-cli ping &>/dev/null; do sleep 1; done
echo "✅ Redis ready"

echo "⏳ Waiting for PostgreSQL..."
until docker exec crypto-mcp-postgres pg_isready -U crypto_user &>/dev/null; do sleep 1; done
echo "✅ PostgreSQL ready"

# Initialize schema
echo "📊 Initializing database schema..."
docker exec crypto-mcp-postgres psql -U crypto_user -d crypto_mcp -f /docker-entrypoint-initdb.d/01-schema.sql

# Test connections
echo "🧪 Testing connections..."
redis-cli -h localhost ping >/dev/null && echo "✅ Redis connection OK" || echo "❌ Redis connection failed"
psql -h localhost -U crypto_user -d crypto_mcp -c "SELECT 1" >/dev/null && echo "✅ PostgreSQL connection OK" || echo "❌ PostgreSQL connection failed"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Connection Details:"
echo "  Redis:      redis://localhost:6379"
echo "  PostgreSQL: postgresql://crypto_user:<password>@localhost:5432/crypto_mcp"
echo ""
echo "🔑 Credentials stored in .env"
echo "🐳 Manage containers: docker-compose -f docker-compose-databases.yml [start|stop|restart]"
```

### 3. Health Check Script

```bash
#!/bin/bash
# check-databases.sh

echo "🏥 Database Health Check"
echo "========================"

# Redis check
if redis-cli -h localhost ping &>/dev/null; then
    REDIS_MEMORY=$(redis-cli -h localhost INFO memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    REDIS_KEYS=$(redis-cli -h localhost DBSIZE | cut -d: -f2)
    echo "✅ Redis: UP (Memory: ${REDIS_MEMORY}, Keys: ${REDIS_KEYS})"
else
    echo "❌ Redis: DOWN"
fi

# PostgreSQL check
if psql -h localhost -U crypto_user -d crypto_mcp -c "SELECT 1" &>/dev/null; then
    PG_SIZE=$(psql -h localhost -U crypto_user -d crypto_mcp -t -c "SELECT pg_size_pretty(pg_database_size('crypto_mcp'))" | xargs)
    PG_CONNECTIONS=$(psql -h localhost -U crypto_user -d crypto_mcp -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='crypto_mcp'" | xargs)
    echo "✅ PostgreSQL: UP (Size: ${PG_SIZE}, Connections: ${PG_CONNECTIONS})"
else
    echo "❌ PostgreSQL: DOWN"
fi
```

---

## Database-Optional Architecture

### 1. Graceful Degradation Strategy

```
Feature Priority Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Level 1: Core Features (No Database Required)       │
├─────────────────────────────────────────────────────┤
│ ✅ Real-time price quotes (direct API)              │
│ ✅ Technical indicators (stateless computation)     │
│ ✅ Token swaps (blockchain direct)                  │
│ ✅ Bridge rate quotes (SDK calls)                   │
├─────────────────────────────────────────────────────┤
│ Level 2: Enhanced Features (Redis Only)             │
├─────────────────────────────────────────────────────┤
│ ⚡ Cached API responses (60-80% faster)            │
│ ⚡ Rate limit protection (3-4x capacity)           │
│ ⚡ Recent whale alerts (last 100 transactions)     │
│ ⚡ Trending memecoins (top 20 list)                │
├─────────────────────────────────────────────────────┤
│ Level 3: Analytics Features (PostgreSQL)            │
├─────────────────────────────────────────────────────┤
│ 📊 Historical price charts (90-day history)        │
│ 📊 Portfolio tracking (all-time performance)       │
│ 📊 Sentiment trends (correlations over time)       │
│ 📊 Whale transaction history (2-year lookback)     │
│ 📊 Memecoin discovery database                     │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Feature Detection Pattern

```javascript
// database-manager.js
class DatabaseManager {
  constructor() {
    this.redis = null;
    this.postgres = null;
    this.features = {
      caching: false,
      analytics: false,
      history: false,
    };
  }

  async initialize() {
    // Try Redis
    try {
      this.redis = await connectRedis();
      await this.redis.ping();
      this.features.caching = true;
      console.log('✅ Redis available: Caching enabled');
    } catch (err) {
      console.warn('⚠️  Redis unavailable: Caching disabled (direct API calls)');
    }

    // Try PostgreSQL
    try {
      this.postgres = await connectPostgres();
      await this.postgres.query('SELECT 1');
      this.features.analytics = true;
      this.features.history = true;
      console.log('✅ PostgreSQL available: Analytics enabled');
    } catch (err) {
      console.warn('⚠️  PostgreSQL unavailable: Analytics disabled');
    }

    return this.features;
  }

  async getPrice(token) {
    // Try cache first (if Redis available)
    if (this.features.caching) {
      const cached = await this.redis.get(`price:${token}`);
      if (cached) return JSON.parse(cached);
    }

    // Fallback to direct API
    const price = await fetchPriceFromAPI(token);

    // Cache for next time (if Redis available)
    if (this.features.caching) {
      await this.redis.setex(`price:${token}`, 30, JSON.stringify(price));
    }

    return price;
  }

  async getPriceHistory(token, days) {
    // Requires PostgreSQL
    if (!this.features.history) {
      throw new Error('Price history requires PostgreSQL. Install with: docker-compose up postgres');
    }

    return this.postgres.query(
      'SELECT * FROM price_history WHERE token_id = $1 AND timestamp > NOW() - INTERVAL $2 days',
      [token, days]
    );
  }
}

module.exports = new DatabaseManager();
```

### 3. Installation Modes

```yaml
# Minimal Mode (No Databases)
crypto-mcp-suite install --mode=minimal
# Features: Core API access, no caching, no history
# Disk: 50 MB
# RAM: 100 MB
# Setup Time: 1 minute

# Standard Mode (Redis Only)
crypto-mcp-suite install --mode=standard
# Features: Core + caching + rate limiting
# Disk: 200 MB
# RAM: 512 MB (Redis: 256 MB + MCPs: 256 MB)
# Setup Time: 3 minutes

# Premium Mode (Redis + PostgreSQL)
crypto-mcp-suite install --mode=premium
# Features: Core + caching + analytics + history
# Disk: 5 GB
# RAM: 2 GB (Redis: 512 MB + PostgreSQL: 1 GB + MCPs: 512 MB)
# Setup Time: 5 minutes
```

---

## Cost Analysis

### Development (Free Tier)

```yaml
Databases:
  Redis: $0 (Docker local)
  PostgreSQL: $0 (Docker local)
  SQLite: $0 (built-in)

Infrastructure:
  Docker Desktop: $0
  Disk space: 10 GB

Total Monthly Cost: $0
```

### Production Starter

```yaml
Databases:
  Redis: $25/month (AWS ElastiCache t4g.small, 1.5 GB)
  PostgreSQL: $50/month (AWS RDS db.t4g.small, 20 GB storage)
  Backups: $5/month (S3 storage)

Infrastructure:
  Application servers: $40/month (2× t4g.small)
  Load balancer: $18/month

Total Monthly Cost: $138
```

### Production Enterprise

```yaml
Databases:
  Redis: $150/month (AWS ElastiCache r6g.large, 13 GB)
  PostgreSQL: $300/month (AWS RDS db.r6g.large, 100 GB storage)
  TimescaleDB compression: Included
  Backups: $20/month (S3 + incremental)

Infrastructure:
  Application servers: $150/month (4× c6g.large)
  Load balancer: $25/month (ALB)
  Monitoring: $30/month (CloudWatch + Grafana Cloud)

Total Monthly Cost: $675
```

---

## Recommendations

### 1. Redis: ESSENTIAL for 5 of 7 MCPs

**Why?**
- 60-80% latency reduction for API-heavy MCPs
- 150-400% effective capacity increase through caching
- Rate limit protection (prevents quota exhaustion)
- Dune Analytics unusable without caching (2-5 second queries)

**Minimum Viable Configuration**:
- Development: 256 MB (Docker local)
- Production: 512 MB - 2 GB (AWS ElastiCache)

### 2. PostgreSQL: RECOMMENDED for 3 of 7 MCPs

**Why?**
- Enables time-series analytics (sentiment trends, price correlations)
- Persistent whale transaction history (institutional research)
- Memecoin discovery database (emerging opportunities)
- Portfolio tracking (user-facing features)

**Minimum Viable Configuration**:
- Development: Docker local (10 GB disk)
- Production: 20 GB storage, scale to 100 GB as needed

### 3. SQLite: OPTIONAL Fallback

**Why?**
- Zero-dependency development mode
- CLI tools and offline analysis
- Single-user personal deployments

**Limitations**:
- NOT suitable for production multi-user deployments
- NOT suitable for high-frequency trading
- Maximum 7-day data retention recommended

### 4. Deployment Decision Matrix

| Use Case | Redis | PostgreSQL | SQLite | Estimated Cost |
|----------|-------|------------|--------|----------------|
| **Local Development** | Optional | Optional | Recommended | $0 |
| **Personal Portfolio Tracker** | Recommended | Optional | Fallback | $0 |
| **MVP (100 users)** | Essential | Recommended | No | $75/month |
| **Production (10k users)** | Essential | Essential | No | $200/month |
| **Enterprise (100k users)** | Essential | Essential | No | $675/month |

---

## Next Steps

**Phase 2 Complete** ✅

This document analyzed database requirements for 7 representative MCPs and provides comprehensive setup automation.

**Proceed to Phase 3**: Non-Containerized Installer Design (20-25 pages)
- Design three installation modes (MINIMAL, STANDARD, PREMIUM)
- Design CLI installer tool with database detection
- Document dependency isolation strategy
- Design one-command setup UX

**Files Created**:
- `DATABASE_REQUIREMENTS.md` (this document)

**Estimated Completion**: Phase 2 complete (2 hours actual vs 1.5 hours planned)

---

**Prepared by**: Blockchain Infrastructure Architect
**Review Date**: October 1, 2025
**Next Phase**: Phase 3 - Non-Containerized Installer Design
**Status**: ✅ **READY FOR IMPLEMENTATION**
