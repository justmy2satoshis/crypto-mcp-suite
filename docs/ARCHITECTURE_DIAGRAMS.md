# Crypto MCP Suite - Visual Architecture Diagrams

**Version**: 1.0.0
**Date**: January 15, 2025
**Status**: Complete Design Phase

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Database Entity-Relationship Diagram](#database-entity-relationship-diagram)
3. [Deployment Architecture](#deployment-architecture)
4. [Installation Flow Diagram](#installation-flow-diagram)
5. [MCP Communication Flow](#mcp-communication-flow)
6. [Monorepo Structure](#monorepo-structure)

---

## System Architecture Overview

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web UI     │  │  Mobile App  │  │ Trading Bots │  │  Analytics   │      │
│  │  Dashboard   │  │              │  │              │  │    Tools     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                 │              │
└─────────┼─────────────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  nginx Load Balancer                                                     │ │
│  │  • Rate Limiting (1000 req/s per IP)                                     │ │
│  │  • Authentication (JWT tokens)                                           │ │
│  │  • SSL/TLS Termination                                                   │ │
│  │  • Request Routing                                                       │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   TIER S MCPs     │    │   TIER A MCPs     │    │   TIER B MCPs     │
│   (10 MCPs)       │    │   (10 MCPs)       │    │   (5 MCPs)        │
├───────────────────┤    ├───────────────────┤    ├───────────────────┤
│ jupiter-mcp       │    │ memecoin-radar    │    │ lending-rates     │
│ uniswap-trader    │    │ coingecko         │    │ governance        │
│ crypto-indicators │    │ token-metrics     │    │ exchange-listings │
│ crypto-sentiment  │    │ gas-tracker       │    │ crypto-calendar   │
│ whale-tracker     │    │ defi-tvl          │    │ audit-tracker     │
│ bridge-rates      │    │ nft-floor         │    │                   │
│ hyperliquid-info  │    │ cex-orderbook     │    │                   │
│ chainlist         │    │ token-unlocks     │    │                   │
│ dex-metrics       │    │ airdrop-tracker   │    │                   │
│ crypto-feargreed  │    │ staking-yields    │    │                   │
└─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   │   SHARED UTILITIES LAYER      │
                   ├───────────────────────────────┤
                   │ @crypto-mcp-suite/core        │
                   │   • Logger (Winston)          │
                   │   • Metrics (Prometheus)      │
                   │   • Error Handling            │
                   ├───────────────────────────────┤
                   │ @crypto-mcp-suite/database    │
                   │   • Redis Client              │
                   │   • PostgreSQL Client         │
                   │   • SQLite Client             │
                   ├───────────────────────────────┤
                   │ @crypto-mcp-suite/monitoring  │
                   │   • Health Checks             │
                   │   • Performance Metrics       │
                   ├───────────────────────────────┤
                   │ @crypto-mcp-suite/utils       │
                   │   • Cache Manager             │
                   │   • Rate Limiter              │
                   │   • Retry Logic               │
                   └───────────────┬───────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│   REDIS CACHE     │  │   POSTGRESQL      │  │   SQLITE          │
├───────────────────┤  ├───────────────────┤  ├───────────────────┤
│ Port: 6379        │  │ Port: 5432        │  │ File-based        │
│ Memory: 2GB       │  │ Storage: 50GB     │  │ Dev only          │
│ Eviction: LRU     │  │ Extension:        │  │                   │
│                   │  │   TimescaleDB     │  │                   │
│ Cache Types:      │  │                   │  │                   │
│ • Prices (30s)    │  │ Schemas:          │  │                   │
│ • Quotes (30s)    │  │ • whale_tracker   │  │                   │
│ • Sentiment (5m)  │  │ • sentiment       │  │                   │
│ • Bridge (5m)     │  │ • memecoin        │  │                   │
│ • Whale TX (1m)   │  │                   │  │                   │
│ • Dune (30m)      │  │ Time-series:      │  │                   │
│ • Static (24h)    │  │ • Hypertables     │  │                   │
│                   │  │ • Continuous      │  │                   │
│                   │  │   Aggregates      │  │                   │
└───────────────────┘  └───────────────────┘  └───────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL DATA SOURCES                                    │
├────────────────────────────────────────────────────────────────────────────────┤
│ Blockchain RPCs        │ DEX APIs              │ Analytics APIs               │
│ • Alchemy (ETH + L2s)  │ • Jupiter Ultra       │ • Santiment                  │
│ • Helius (Solana)      │ • Uniswap Protocol    │ • Whale Alert                │
│ • Infura (fallback)    │ • Hyperliquid         │ • Dune Analytics             │
│ • QuickNode (fallback) │ • LiFi SDK            │ • CoinGecko                  │
│                        │                       │ • Token Metrics              │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│                       MONITORING & OBSERVABILITY                               │
├────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│ │  Prometheus     │  │    Grafana      │  │      PM2        │               │
│ │  (Metrics)      │  │  (Dashboards)   │  │  (Process Mgmt) │               │
│ │                 │  │                 │  │                 │               │
│ │ • Request rate  │  │ • Performance   │  │ • 25 MCPs       │               │
│ │ • Error rate    │  │ • Errors        │  │ • Auto-restart  │               │
│ │ • Latency (p95) │  │ • Cache hits    │  │ • Log rotation  │               │
│ │ • Cache hits    │  │ • API costs     │  │ • Clustering    │               │
│ │ • DB queries    │  │ • Alerts        │  │                 │               │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘               │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Entity-Relationship Diagram

### PostgreSQL Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        crypto_mcp DATABASE                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      whale_tracker SCHEMA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐                                              │
│  │ chains               │                                              │
│  ├──────────────────────┤                                              │
│  │ chain_id (PK)        │──┐                                           │
│  │ chain_name           │  │                                           │
│  │ native_token         │  │                                           │
│  │ created_at           │  │                                           │
│  └──────────────────────┘  │                                           │
│                            │                                           │
│                            │  ┌──────────────────────┐                 │
│                            └─→│ tokens               │                 │
│                               ├──────────────────────┤                 │
│                               │ token_id (PK)        │──┐              │
│                               │ chain_id (FK)        │  │              │
│                               │ contract_address     │  │              │
│                               │ symbol               │  │              │
│                               │ name                 │  │              │
│                               │ decimals             │  │              │
│                               │ created_at           │  │              │
│                               └──────────────────────┘  │              │
│                                                         │              │
│                                                         │              │
│                               ┌──────────────────────┐  │              │
│                               │ transactions         │←─┘              │
│                               ├──────────────────────┤                 │
│                               │ tx_id (PK)           │                 │
│                               │ chain_id (FK)        │                 │
│                               │ token_id (FK)        │                 │
│                               │ amount               │                 │
│                               │ amount_usd           │                 │
│                               │ from_address         │                 │
│                               │ to_address           │                 │
│                               │ tx_hash (UNIQUE)     │                 │
│                               │ timestamp            │ ← TimescaleDB   │
│                               │ created_at           │   Hypertable    │
│                               └──────────────────────┘                 │
│                                                                         │
│  Indexes:                                                               │
│  • idx_whale_tx_timestamp (timestamp DESC)                             │
│  • idx_whale_tx_amount_usd (amount_usd DESC)                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        sentiment SCHEMA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ scores                                                   │          │
│  ├──────────────────────────────────────────────────────────┤          │
│  │ score_id (PK)                                            │          │
│  │ asset_symbol                                             │          │
│  │ sentiment_score        (-100 to +100)                    │          │
│  │ social_volume          (mentions count)                  │          │
│  │ social_dominance       (% of crypto mentions)            │          │
│  │ timestamp              ← TimescaleDB Hypertable          │          │
│  │ created_at                                               │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  Indexes:                                                               │
│  • idx_sentiment_timestamp (timestamp DESC)                            │
│  • idx_sentiment_asset (asset_symbol, timestamp DESC)                  │
│                                                                         │
│  Sample Data:                                                           │
│  ┌────────────┬───────────────┬──────────────┬──────────────┐          │
│  │ Symbol     │ Sentiment     │ Social Vol   │ Dominance    │          │
│  ├────────────┼───────────────┼──────────────┼──────────────┤          │
│  │ BTC        │ +45.2         │ 12,847       │ 23.4%        │          │
│  │ ETH        │ +38.7         │ 8,234        │ 15.1%        │          │
│  │ SOL        │ +52.1         │ 5,621        │ 10.3%        │          │
│  └────────────┴───────────────┴──────────────┴──────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         memecoin SCHEMA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐                                              │
│  │ coins                │                                              │
│  ├──────────────────────┤                                              │
│  │ coin_id (PK)         │──┐                                           │
│  │ contract_address     │  │                                           │
│  │ symbol               │  │                                           │
│  │ name                 │  │                                           │
│  │ chain                │  │                                           │
│  │ created_at           │  │                                           │
│  └──────────────────────┘  │                                           │
│                            │                                           │
│                            │  ┌──────────────────────┐                 │
│                            └─→│ metrics              │                 │
│                               ├──────────────────────┤                 │
│                               │ metric_id (PK)       │                 │
│                               │ coin_id (FK)         │                 │
│                               │ market_cap           │                 │
│                               │ volume_24h           │                 │
│                               │ holders_count        │                 │
│                               │ price_usd            │                 │
│                               │ timestamp            │ ← TimescaleDB   │
│                               │ created_at           │   Hypertable    │
│                               └──────────────────────┘                 │
│                                                                         │
│  Indexes:                                                               │
│  • idx_memecoin_timestamp (timestamp DESC)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Redis Cache Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          REDIS CACHE KEYS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Price Cache (TTL: 30 seconds)                                          │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   price:{chain}:{symbol}                   │            │
│  │ Example:       price:solana:SOL                         │            │
│  │ Value Type:    String (JSON)                            │            │
│  │ Value Example: {"price": 102.45, "timestamp": 1705329845}│           │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  DEX Quote Cache (TTL: 30 seconds)                                      │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   quote:{dex}:{from}:{to}:{amount}         │            │
│  │ Example:       quote:jupiter:SOL:USDC:10                │            │
│  │ Value Type:    String (JSON)                            │            │
│  │ Value Example: {"price": 1024.5, "slippage": 0.3}      │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  Sentiment Cache (TTL: 5 minutes)                                       │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   sentiment:{symbol}                       │            │
│  │ Example:       sentiment:BTC                            │            │
│  │ Value Type:    String (JSON)                            │            │
│  │ Value Example: {"score": 45.2, "volume": 12847}        │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  Whale Transaction Cache (TTL: 1 minute)                                │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   whale:tx:{tx_hash}                       │            │
│  │ Example:       whale:tx:0x1234abcd...                   │            │
│  │ Value Type:    String (JSON)                            │            │
│  │ Value Example: {"amount": 1000000, "usd": 45200000}    │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  Bridge Rates Cache (TTL: 5 minutes)                                    │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   bridge:{from_chain}:{to_chain}:{token}   │            │
│  │ Example:       bridge:ethereum:arbitrum:USDC            │            │
│  │ Value Type:    String (JSON)                            │            │
│  │ Value Example: {"rate": 0.998, "fee": 2.50}            │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  Dune Query Cache (TTL: 30 minutes)                                     │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   dune:query:{query_id}:{params_hash}      │            │
│  │ Example:       dune:query:12345:abc123                  │            │
│  │ Value Type:    String (JSON)                            │            │
│  │ Value Example: {"rows": [...], "execution_id": "xyz"}  │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  Rate Limit Tracking                                                    │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ Key Pattern:   ratelimit:{mcp}:{user}                   │            │
│  │ Example:       ratelimit:santiment:user123              │            │
│  │ Value Type:    String (counter)                         │            │
│  │ Value Example: "45"  (45 requests in current minute)    │            │
│  │ TTL:           60 seconds (sliding window)              │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Three-Tier Deployment (Production)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                     │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Cloudflare CDN      │
                    │  (DDoS Protection)   │
                    │  (SSL Termination)   │
                    └──────────┬───────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       LOAD BALANCER TIER                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  nginx Load Balancer (2 instances for HA)                        │   │
│  │  • Round-robin distribution                                      │   │
│  │  • Health checks every 10 seconds                                │   │
│  │  • Automatic failover                                            │   │
│  │  • Rate limiting: 1000 req/s per IP                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  App Server 1    │  │  App Server 2    │  │  App Server 3    │
│  (4 CPU, 8GB)    │  │  (4 CPU, 8GB)    │  │  (4 CPU, 8GB)    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PM2 Cluster      │  │ PM2 Cluster      │  │ PM2 Cluster      │
│ • 25 MCPs        │  │ • 25 MCPs        │  │ • 25 MCPs        │
│ • Auto-restart   │  │ • Auto-restart   │  │ • Auto-restart   │
│ • 4 workers each │  │ • 4 workers each │  │ • 4 workers each │
└─────────┬────────┘  └─────────┬────────┘  └─────────┬────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE TIER                                   │
│  ┌────────────────────┐     ┌────────────────────┐                      │
│  │  Redis Cluster     │     │  PostgreSQL        │                      │
│  │  (Managed)         │     │  (Managed)         │                      │
│  ├────────────────────┤     ├────────────────────┤                      │
│  │ • 3 nodes          │     │ • Primary (R/W)    │                      │
│  │ • 4GB memory       │     │ • Replica (R/O)    │                      │
│  │ • Replication      │     │ • Auto-failover    │                      │
│  │ • Persistence      │     │ • TimescaleDB      │                      │
│  │ • Auto-backup      │     │ • 50GB storage     │                      │
│  └────────────────────┘     │ • Daily backups    │                      │
│                             └────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     MONITORING TIER                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │  Prometheus    │  │    Grafana     │  │   PagerDuty    │            │
│  │  (Metrics)     │  │  (Dashboards)  │  │   (Alerts)     │            │
│  │                │  │                │  │                │            │
│  │ • App metrics  │  │ • 10 dashboards│  │ • 24/7 alerts  │            │
│  │ • DB metrics   │  │ • Real-time    │  │ • Escalation   │            │
│  │ • System       │  │ • Historical   │  │ • SMS/Call     │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Geographic Distribution (Future)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    GLOBAL CDN (Cloudflare)                           │
└──────────────────────────────────────────────────────────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   US-EAST       │    │    EU-WEST      │    │   ASIA-PAC      │
│   (Primary)     │    │   (Secondary)   │    │   (Tertiary)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • 3 app servers │    │ • 2 app servers │    │ • 2 app servers │
│ • Redis master  │    │ • Redis replica │    │ • Redis replica │
│ • PostgreSQL    │    │ • PostgreSQL    │    │ • PostgreSQL    │
│   primary       │    │   replica       │    │   replica       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Installation Flow Diagram

### PREMIUM Mode Installation Flow

```
                         ┌───────────────────┐
                         │  User executes:   │
                         │  cms install      │
                         │     premium       │
                         └─────────┬─────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Detect Platform         │
                    │  • macOS / Linux / Win   │
                    │  • Architecture (x64/arm)│
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  Check Dependencies      │
                    │  ✓ Node.js >=18          │
                    │  ✓ Python >=3.10         │
                    │  ✓ npm >=8               │
                    │  ⚠ git (recommended)     │
                    └──────────┬───────────────┘
                               │
                        ┌──────┴──────┐
                        │ Missing deps?│
                        └──────┬──────┘
                           Yes │ No
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌───────────────┐    ┌───────────────────┐
            │ Show install  │    │ Continue          │
            │ commands      │    │                   │
            │ • brew install│    │                   │
            │ • apt install │    │                   │
            │ Exit (1)      │    │                   │
            └───────────────┘    └─────────┬─────────┘
                                           │
                                           ▼
                            ┌──────────────────────────┐
                            │ Interactive Mode Select  │
                            │ ❯ MINIMAL                │
                            │   STANDARD               │
                            │   PREMIUM                │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                            ┌──────────────────────────┐
                            │ Confirm Installation     │
                            │ Mode: PREMIUM            │
                            │ MCPs: 7                  │
                            │ Databases: Redis + PG    │
                            │ Cost: $0-$1,223/month    │
                            └──────────┬───────────────┘
                                       │
                                       ▼
                            ┌──────────────────────────┐
                            │ Create Directories       │
                            │ ~/crypto-mcp-suite/      │
                            │   ├── mcps/              │
                            │   ├── configs/           │
                            │   ├── logs/              │
                            │   ├── data/              │
                            │   └── scripts/           │
                            └──────────┬───────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
        ┌───────────────────┐              ┌───────────────────┐
        │ Setup Redis       │              │ Setup PostgreSQL  │
        │ • Check running   │              │ • Check running   │
        │ • Create config   │              │ • Create DB       │
        │ • Test connection │              │ • Create schemas  │
        └─────────┬─────────┘              │ • Test connection │
                  │                        └─────────┬─────────┘
                  │                                  │
                  └──────────────┬───────────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │ Install 7 MCPs       │
                      │ Tier S:              │
                      │ ✓ crypto-indicators  │
                      │ ✓ bridge-rates       │
                      │ ✓ crypto-sentiment   │
                      │ ✓ whale-tracker      │
                      │ ✓ memecoin-radar     │
                      │ ✓ jupiter            │
                      │ ✓ uniswap-trader     │
                      └──────────┬───────────┘
                                 │
                      ┌──────────┴───────────┐
                      │                      │
                      ▼                      ▼
          ┌───────────────────┐  ┌───────────────────┐
          │ JavaScript MCPs   │  │ Python MCPs       │
          │ • npm install     │  │ • pip install     │
          │ • Link deps       │  │ • Create venv     │
          └─────────┬─────────┘  └─────────┬─────────┘
                    │                      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Create .env Config   │
                    │ • Database URLs      │
                    │ • API keys (empty)   │
                    │ • Log settings       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ✅ Installation      │
                    │    Complete!         │
                    │                      │
                    │ Next steps:          │
                    │ 1. Configure API keys│
                    │ 2. Start Redis       │
                    │ 3. cms start         │
                    └──────────────────────┘
```

---

## MCP Communication Flow

### Request/Response Flow (Example: Price Query)

```
┌─────────┐                                                      ┌──────────────┐
│ Client  │                                                      │ External API │
│ (Web UI)│                                                      │ (Jupiter)    │
└────┬────┘                                                      └──────┬───────┘
     │                                                                  │
     │ GET /api/price?chain=solana&token=SOL                           │
     ▼                                                                  │
┌─────────────────┐                                                    │
│  nginx          │                                                    │
│  Load Balancer  │                                                    │
└────┬────────────┘                                                    │
     │                                                                  │
     │ Forward to app server (round-robin)                             │
     ▼                                                                  │
┌─────────────────────────────────────────────────────┐               │
│  App Server (PM2 Worker)                            │               │
│  ┌────────────────────────────────────────────────┐ │               │
│  │ 1. Rate Limit Check                            │ │               │
│  │    • Check: ratelimit:jupiter:user123          │ │               │
│  │    • Current: 45 requests/minute               │ │               │
│  │    • Limit: 60 requests/minute                 │ │               │
│  │    • Status: ✓ Allowed                         │ │               │
│  └────────────┬───────────────────────────────────┘ │               │
│               ▼                                      │               │
│  ┌────────────────────────────────────────────────┐ │               │
│  │ 2. Cache Check (Redis)                         │ │               │
│  │    • Key: price:solana:SOL                     │ │               │
│  │    • TTL: 30 seconds                           │ │               │
│  └────────────┬───────────────────────────────────┘ │               │
│               │                                      │               │
│        ┌──────┴──────┐                               │               │
│        │ Cache hit?  │                               │               │
│        └──────┬──────┘                               │               │
│           Yes │ No                                    │               │
│   ┌───────────┴───────────┐                          │               │
│   │                       │                          │               │
│   ▼                       ▼                          │               │
│  ┌──────────────┐   ┌─────────────────────────────┐ │               │
│  │ Return cache │   │ 3. Call jupiter-mcp         │ │               │
│  │ {"price":    │   │    ┌─────────────────────┐  │ │               │
│  │  102.45,     │   │    │ Jupiter MCP         │  │ │               │
│  │  "cached":   │   │    │ (@modelcontextpro-  │  │ │  HTTP Request │
│  │  true}       │   │    │  tocol/sdk)         │  │ │ ─────────────▶│
│  └──────────────┘   │    └──────────┬──────────┘  │ │               │
│                     │               │              │ │               │
│                     │               │ GET /v6/quote│ │               │
│                     │               │ ?inputMint=  │ │               │
│                     │               │  So11111...  │ │               │
│                     │               │ &amount=1    │ │               │
│                     │               │              │ │               │
│                     │               ▼              │ │  HTTP Response│
│                     │    ┌─────────────────────┐  │ │ ◀─────────────│
│                     │    │ Response Processing │  │ │               │
│                     │    │ • Parse JSON        │  │ │   {"price":   │
│                     │    │ • Transform data    │  │ │    102.45,    │
│                     │    │ • Add metadata      │  │ │    "slippage":│
│                     │    └──────────┬──────────┘  │ │    0.3}       │
│                     │               │              │ │               │
│                     │               ▼              │ │               │
│                     │    ┌─────────────────────┐  │ │               │
│                     │    │ 4. Cache Result     │  │ │               │
│                     │    │    (Redis)          │  │ │               │
│                     │    │ SET price:solana:SOL│  │ │               │
│                     │    │ {"price": 102.45}   │  │ │               │
│                     │    │ EX 30               │  │ │               │
│                     │    └──────────┬──────────┘  │ │               │
│                     │               │              │ │               │
│                     └───────────────┼──────────────┘ │               │
│                                     │                │               │
│                     ┌───────────────┴──────────────┐ │               │
│                     │ 5. Return Response           │ │               │
│                     │    {"price": 102.45,         │ │               │
│                     │     "chain": "solana",       │ │               │
│                     │     "cached": false,         │ │               │
│                     │     "timestamp": 1705329845} │ │               │
│                     └───────────────┬──────────────┘ │               │
└─────────────────────────────────────┼────────────────┘               │
                                      │                                │
                                      ▼                                │
                           ┌──────────────────┐                        │
                           │ 6. Log Metrics   │                        │
                           │ • Request count  │                        │
                           │ • Latency: 245ms │                        │
                           │ • Cache miss     │                        │
                           │ • Prometheus     │                        │
                           └──────────────────┘                        │
                                      │                                │
                                      ▼                                │
┌─────────┐                                                            │
│ Client  │◀───────── HTTP 200 OK ─────────────────────────────────────┘
│         │           {"price": 102.45, "chain": "solana"}
└─────────┘

Performance Metrics:
• Total Latency: 245ms (cache miss) or 15ms (cache hit)
• Redis Latency: <5ms
• Jupiter API Latency: 200-800ms (p95)
• Cache Hit Rate: 70-80%
• Cost Savings: 70-80% fewer API calls
```

---

## Monorepo Structure

### Visual Directory Tree

```
crypto-mcp-suite/
│
├── 📦 packages/
│   │
│   ├── 🔥 mcps/                              # 25 MCP implementations
│   │   │
│   │   ├── tier-s/                           # 10 Tier S MCPs (Must-have)
│   │   │   ├── jupiter-mcp/
│   │   │   │   ├── src/
│   │   │   │   │   ├── index.ts              # Main MCP server
│   │   │   │   │   ├── handlers.ts           # Request handlers
│   │   │   │   │   └── types.ts              # TypeScript types
│   │   │   │   ├── tests/
│   │   │   │   │   ├── unit/
│   │   │   │   │   └── integration/
│   │   │   │   ├── package.json              # Dependencies
│   │   │   │   ├── tsconfig.json             # TypeScript config
│   │   │   │   └── README.md
│   │   │   │
│   │   │   ├── uniswap-trader-mcp/           # Similar structure
│   │   │   ├── crypto-indicators-mcp/
│   │   │   ├── crypto-sentiment-mcp/
│   │   │   ├── whale-tracker-mcp/
│   │   │   ├── bridge-rates-mcp/
│   │   │   ├── hyperliquid-info-mcp/
│   │   │   ├── chainlist-mcp/
│   │   │   ├── dex-metrics-mcp/
│   │   │   └── crypto-feargreed-mcp/
│   │   │
│   │   ├── tier-a/                           # 10 Tier A MCPs (Recommended)
│   │   │   ├── memecoin-radar-mcp/
│   │   │   ├── coingecko-mcp/
│   │   │   ├── token-metrics-mcp/
│   │   │   ├── gas-tracker-mcp/
│   │   │   ├── defi-tvl-mcp/
│   │   │   ├── nft-floor-mcp/
│   │   │   ├── cex-orderbook-mcp/
│   │   │   ├── token-unlocks-mcp/
│   │   │   ├── airdrop-tracker-mcp/
│   │   │   └── staking-yields-mcp/
│   │   │
│   │   └── tier-b/                           # 5 Tier B MCPs (Optional)
│   │       ├── lending-rates-mcp/
│   │       ├── governance-tracker-mcp/
│   │       ├── exchange-listings-mcp/
│   │       ├── crypto-calendar-mcp/
│   │       └── audit-tracker-mcp/
│   │
│   ├── 🛠️ shared/                            # Shared utilities (4 packages)
│   │   │
│   │   ├── core/                             # Core utilities
│   │   │   ├── src/
│   │   │   │   ├── logger.ts                 # Winston logger
│   │   │   │   ├── metrics.ts                # Prometheus metrics
│   │   │   │   ├── errors.ts                 # Custom error classes
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── database/                         # Database clients
│   │   │   ├── src/
│   │   │   │   ├── redis.ts                  # Redis singleton
│   │   │   │   ├── postgres.ts               # PostgreSQL pool
│   │   │   │   ├── sqlite.ts                 # SQLite client
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   └── package.json
│   │   │
│   │   ├── monitoring/                       # Monitoring utilities
│   │   │   ├── src/
│   │   │   │   ├── prometheus.ts             # Metrics exporter
│   │   │   │   ├── health.ts                 # Health checks
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   └── package.json
│   │   │
│   │   └── utils/                            # General utilities
│   │       ├── src/
│   │       │   ├── cache.ts                  # Cache manager
│   │       │   ├── rate-limiter.ts           # Token bucket
│   │       │   ├── retry.ts                  # Exponential backoff
│   │       │   └── index.ts
│   │       ├── tests/
│   │       └── package.json
│   │
│   └── 💻 cli/                               # Installer CLI tool
│       ├── bin/
│       │   └── crypto-mcp-suite.js           # Main executable
│       ├── src/
│       │   ├── commands/                     # 12 commands
│       │   │   ├── install.js
│       │   │   ├── start.js
│       │   │   ├── stop.js
│       │   │   ├── status.js
│       │   │   ├── logs.js
│       │   │   ├── test.js
│       │   │   ├── config.js
│       │   │   ├── update.js
│       │   │   ├── uninstall.js
│       │   │   ├── add.js
│       │   │   ├── remove.js
│       │   │   └── doctor.js
│       │   └── utils/
│       │       ├── platform.js                # Platform detection
│       │       └── database.js                # DB setup utilities
│       ├── tests/
│       ├── package.json
│       └── README.md
│
├── ⚙️ configs/                               # Configuration files
│   ├── redis.conf                            # Redis config
│   ├── postgresql.conf                       # PostgreSQL config
│   ├── docker-compose.yml                    # Docker services
│   ├── prometheus.yml                        # Prometheus config
│   └── grafana-dashboards/                   # Grafana JSON
│       ├── performance.json
│       ├── errors.json
│       └── costs.json
│
├── 🔧 scripts/                               # Automation scripts
│   ├── setup.sh                              # Initial setup
│   ├── backup.sh                             # Database backup
│   ├── migrate.sh                            # Schema migrations
│   ├── test-all.sh                           # Run all tests
│   └── deploy.sh                             # Production deploy
│
├── 📚 docs/                                  # Documentation
│   ├── installation.md
│   ├── configuration.md
│   ├── api-reference.md
│   ├── architecture.md
│   ├── contributing.md
│   └── troubleshooting.md
│
├── 🚀 .github/
│   └── workflows/                            # CI/CD pipelines
│       ├── test.yml                          # Test suite
│       ├── build.yml                         # Build artifacts
│       ├── release.yml                       # Automated releases
│       └── security.yml                      # Security scans
│
├── 📄 package.json                           # Root workspace config
├── 📄 lerna.json                             # Lerna configuration
├── 📄 tsconfig.json                          # TypeScript config
├── 📄 .gitignore                             # Git ignore rules
├── 📄 .npmrc                                 # npm configuration
├── 📄 README.md                              # Project README
└── 📄 LICENSE                                # MIT License

Total Structure:
├── 25 MCP packages (tier-s: 10, tier-a: 10, tier-b: 5)
├── 4 Shared utility packages
├── 1 CLI package
├── 5 Config files
├── 5 Automation scripts
├── 6 Documentation files
├── 4 GitHub workflows
└── 8 Root configuration files

Total Files: ~500 files
Total Directories: ~50 directories
```

---

**Document Version**: 1.0.0
**Last Updated**: January 15, 2025
**Author**: CCC-VS (Solutions Architect)
**Status**: ✅ COMPLETE
