/**
 * Crypto MCP Suite - PM2 Ecosystem Configuration
 * Version: 0.2.0-alpha
 * Platform: Windows 10/11 (Windows-First Release)
 *
 * This file configures all 34 MCPs for PM2 process management.
 * Tier-based startup controlled by INSTALLATION_TIER environment variable.
 *
 * UPDATE: Added Tier 5 with CCXT + Kukapay suite (9 new crypto MCPs)
 */

require('dotenv').config();

const path = require('path');
const os = require('os');

// Installation paths
const installPath = process.env.CRYPTO_MCP_INSTALL_PATH || path.join(os.homedir(), 'AppData', 'Local', 'crypto-mcp');
const logPath = path.join(installPath, 'logs');
const dataPath = path.join(installPath, 'data');

// Determine active tier
const installationTier = (process.env.INSTALLATION_TIER || 'essential').toLowerCase();

// Tier mappings
const TIERS = {
  essential: ['tier1'],
  enhanced: ['tier1', 'tier2'],
  advanced: ['tier1', 'tier2', 'tier3'],
  premium: ['tier1', 'tier2', 'tier3', 'tier4'],
  full: ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'],
  'crypto-plus': ['tier1', 'tier5'] // Essential utilities + new crypto MCPs only
};

const activeTiers = TIERS[installationTier] || TIERS.essential;

// Common PM2 options
const commonOptions = {
  instances: 1,
  autorestart: process.env.PM2_AUTO_RESTART !== 'false',
  watch: false,
  max_memory_restart: process.env.PM2_MAX_MEMORY_RESTART || '500M',
  restart_delay: parseInt(process.env.PM2_RESTART_DELAY) || 1000,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
    POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
    POSTGRES_DB: process.env.POSTGRES_DB || 'crypto_mcp_suite',
    POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || ''
  }
};

// MCP Configurations
const mcps = [
  // ==========================================================================
  // TIER 1 - ESSENTIAL (Always Active)
  // ==========================================================================
  {
    name: 'memory-federation',
    script: path.join(installPath, 'lib', 'memory-federation', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.MEMORY_FEDERATION_PORT || 3001,
      STORAGE_PATH: process.env.MEMORY_FEDERATION_STORAGE_PATH || path.join(dataPath, 'memory')
    },
    error_file: path.join(logPath, 'memory-federation-error.log'),
    out_file: path.join(logPath, 'memory-federation-out.log')
  },
  {
    name: 'filesystem-federation',
    script: path.join(installPath, 'lib', 'filesystem-federation', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.FILESYSTEM_FEDERATION_PORT || 3002,
      ALLOWED_PATHS: process.env.FILESYSTEM_FEDERATION_ALLOWED_PATHS || 'C:\\Users'
    },
    error_file: path.join(logPath, 'filesystem-federation-error.log'),
    out_file: path.join(logPath, 'filesystem-federation-out.log')
  },
  {
    name: 'github-federation',
    script: path.join(installPath, 'lib', 'github-federation', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.GITHUB_FEDERATION_PORT || 3003,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || ''
    },
    error_file: path.join(logPath, 'github-federation-error.log'),
    out_file: path.join(logPath, 'github-federation-out.log')
  },
  {
    name: 'expert-role-prompt',
    script: path.join(installPath, 'lib', 'expert-role-prompt', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.EXPERT_ROLE_PROMPT_PORT || 3004
    },
    error_file: path.join(logPath, 'expert-role-prompt-error.log'),
    out_file: path.join(logPath, 'expert-role-prompt-out.log')
  },
  {
    name: 'sequential-thinking',
    script: path.join(installPath, 'lib', 'sequential-thinking', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.SEQUENTIAL_THINKING_PORT || 3005
    },
    error_file: path.join(logPath, 'sequential-thinking-error.log'),
    out_file: path.join(logPath, 'sequential-thinking-out.log')
  },
  {
    name: 'desktop-commander',
    script: path.join(installPath, 'lib', 'desktop-commander', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.DESKTOP_COMMANDER_PORT || 3006
    },
    error_file: path.join(logPath, 'desktop-commander-error.log'),
    out_file: path.join(logPath, 'desktop-commander-out.log')
  },
  {
    name: 'web-search',
    script: path.join(installPath, 'lib', 'web-search', 'server.js'),
    tier: 'tier1',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.WEB_SEARCH_PORT || 3007,
      BRAVE_API_KEY: process.env.BRAVE_API_KEY || ''
    },
    error_file: path.join(logPath, 'web-search-error.log'),
    out_file: path.join(logPath, 'web-search-out.log')
  },

  // ==========================================================================
  // TIER 2 - ENHANCED (Enhanced Tier and Above)
  // ==========================================================================
  {
    name: 'context7',
    script: path.join(installPath, 'lib', 'context7', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CONTEXT7_PORT || 3011
    },
    error_file: path.join(logPath, 'context7-error.log'),
    out_file: path.join(logPath, 'context7-out.log')
  },
  {
    name: 'perplexity',
    script: path.join(installPath, 'lib', 'perplexity', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.PERPLEXITY_PORT || 3012,
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || ''
    },
    error_file: path.join(logPath, 'perplexity-error.log'),
    out_file: path.join(logPath, 'perplexity-out.log')
  },
  {
    name: 'playwright',
    script: path.join(installPath, 'lib', 'playwright', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.PLAYWRIGHT_PORT || 3013
    },
    error_file: path.join(logPath, 'playwright-error.log'),
    out_file: path.join(logPath, 'playwright-out.log')
  },
  {
    name: 'notion',
    script: path.join(installPath, 'lib', 'notion', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.NOTION_PORT || 3014,
      NOTION_TOKEN: process.env.NOTION_TOKEN || ''
    },
    error_file: path.join(logPath, 'notion-error.log'),
    out_file: path.join(logPath, 'notion-out.log')
  },
  {
    name: 'git-ops',
    script: path.join(installPath, 'lib', 'git-ops', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.GIT_OPS_PORT || 3015
    },
    error_file: path.join(logPath, 'git-ops-error.log'),
    out_file: path.join(logPath, 'git-ops-out.log')
  },
  {
    name: 'converse-enhanced',
    script: path.join(installPath, 'lib', 'converse-enhanced', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CONVERSE_ENHANCED_PORT || 3016,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || ''
    },
    error_file: path.join(logPath, 'converse-enhanced-error.log'),
    out_file: path.join(logPath, 'converse-enhanced-out.log')
  },
  {
    name: 'github-manager',
    script: path.join(installPath, 'lib', 'github-manager', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.GITHUB_MANAGER_PORT || 3017,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || ''
    },
    error_file: path.join(logPath, 'github-manager-error.log'),
    out_file: path.join(logPath, 'github-manager-out.log')
  },
  {
    name: 'brave-web-search',
    script: path.join(installPath, 'lib', 'brave-web-search', 'server.js'),
    tier: 'tier2',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.BRAVE_WEB_SEARCH_PORT || 3018,
      BRAVE_API_KEY: process.env.BRAVE_API_KEY || ''
    },
    error_file: path.join(logPath, 'brave-web-search-error.log'),
    out_file: path.join(logPath, 'brave-web-search-out.log')
  },

  // ==========================================================================
  // TIER 3 - ADVANCED (Advanced Tier and Above)
  // ==========================================================================
  {
    name: 'duckdb-mcp',
    script: path.join(installPath, 'lib', 'duckdb-mcp', 'server.js'),
    tier: 'tier3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.DUCKDB_PORT || 3021,
      DUCKDB_DATABASE_PATH: process.env.DUCKDB_DATABASE_PATH || path.join(dataPath, 'duckdb', 'analytics.db')
    },
    error_file: path.join(logPath, 'duckdb-mcp-error.log'),
    out_file: path.join(logPath, 'duckdb-mcp-out.log')
  },
  {
    name: 'postgres-mcp-pro',
    script: path.join(installPath, 'lib', 'postgres-mcp-pro', 'server.js'),
    tier: 'tier3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.POSTGRES_MCP_PRO_PORT || 3022
    },
    error_file: path.join(logPath, 'postgres-mcp-pro-error.log'),
    out_file: path.join(logPath, 'postgres-mcp-pro-out.log')
  },
  {
    name: 'kafka-mcp',
    script: path.join(installPath, 'lib', 'kafka-mcp', 'server.js'),
    tier: 'tier3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.KAFKA_PORT || 3023,
      KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'localhost:9092'
    },
    error_file: path.join(logPath, 'kafka-mcp-error.log'),
    out_file: path.join(logPath, 'kafka-mcp-out.log')
  },
  {
    name: 'mongodb-mcp',
    script: path.join(installPath, 'lib', 'mongodb-mcp', 'server.js'),
    tier: 'tier3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.MONGODB_PORT || 3024,
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017'
    },
    error_file: path.join(logPath, 'mongodb-mcp-error.log'),
    out_file: path.join(logPath, 'mongodb-mcp-out.log')
  },
  {
    name: 'redis-mcp',
    script: path.join(installPath, 'lib', 'redis-mcp', 'server.js'),
    tier: 'tier3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.REDIS_MCP_PORT || 3025
    },
    error_file: path.join(logPath, 'redis-mcp-error.log'),
    out_file: path.join(logPath, 'redis-mcp-out.log')
  },
  {
    name: 'sqlite',
    script: path.join(installPath, 'lib', 'sqlite', 'server.js'),
    tier: 'tier3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.SQLITE_PORT || 3026,
      SQLITE_DATABASE_PATH: process.env.SQLITE_DATABASE_PATH || path.join(dataPath, 'sqlite', 'app.db')
    },
    error_file: path.join(logPath, 'sqlite-error.log'),
    out_file: path.join(logPath, 'sqlite-out.log')
  },

  // ==========================================================================
  // TIER 4 - PREMIUM (Premium/Full Tier Only)
  // ==========================================================================
  {
    name: 'kimi-code-context',
    script: path.join(installPath, 'lib', 'kimi-code-context', 'server.js'),
    tier: 'tier4',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.KIMI_CODE_CONTEXT_PORT || 3031
    },
    error_file: path.join(logPath, 'kimi-code-context-error.log'),
    out_file: path.join(logPath, 'kimi-code-context-out.log')
  },
  {
    name: 'kimi-resilient',
    script: path.join(installPath, 'lib', 'kimi-resilient', 'server.js'),
    tier: 'tier4',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.KIMI_RESILIENT_PORT || 3032
    },
    error_file: path.join(logPath, 'kimi-resilient-error.log'),
    out_file: path.join(logPath, 'kimi-resilient-out.log')
  },
  {
    name: 'rag-context',
    script: path.join(installPath, 'lib', 'rag-context', 'server.js'),
    tier: 'tier4',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.RAG_CONTEXT_PORT || 3033
    },
    error_file: path.join(logPath, 'rag-context-error.log'),
    out_file: path.join(logPath, 'rag-context-out.log')
  },
  {
    name: 'crypto-analytics',
    script: path.join(installPath, 'lib', 'crypto-analytics', 'server.js'),
    tier: 'tier4',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_ANALYTICS_PORT || 3034
    },
    error_file: path.join(logPath, 'crypto-analytics-error.log'),
    out_file: path.join(logPath, 'crypto-analytics-out.log')
  },

  // ==================== TIER 5: NEW CRYPTO ADDITIONS (9 MCPs) ====================
  // CCXT + Kukapay Suite - Verified free-tier crypto MCPs
  // Ports: 3041-3049

  // ========== PRODUCTION READY: 4/6 MCPs Verified Working ==========

  {
    name: 'ccxt-mcp',
    script: path.join(installPath, 'lib', 'ccxt-mcp', 'build', 'index.js'), // CORRECTED: build/index.js
    tier: 'tier5',
    interpreter: 'node',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CCXT_PORT || 3041,
      EXCHANGE_API_KEYS: process.env.EXCHANGE_API_KEYS || '{}' // Optional, for private trading
    },
    error_file: path.join(logPath, 'ccxt-mcp-error.log'),
    out_file: path.join(logPath, 'ccxt-mcp-out.log')
  },
  {
    name: 'crypto-indicators-mcp',
    script: path.join(installPath, 'lib', 'crypto-indicators-mcp', 'index.js'), // CORRECTED: index.js (Node.js, not Python!)
    tier: 'tier5',
    interpreter: 'node',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_INDICATORS_PORT || 3042,
      CACHE_ENABLED: process.env.INDICATORS_CACHE_ENABLED || 'true'
    },
    error_file: path.join(logPath, 'crypto-indicators-error.log'),
    out_file: path.join(logPath, 'crypto-indicators-out.log')
  },
  {
    name: 'crypto-feargreed-mcp',
    script: 'uv', // CORRECTED: uv command with args, not python
    args: [
      '--directory',
      path.join(installPath, 'lib', 'crypto-feargreed-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_FEARGREED_PORT || 3043
    },
    error_file: path.join(logPath, 'crypto-feargreed-error.log'),
    out_file: path.join(logPath, 'crypto-feargreed-out.log')
  },
  {
    name: 'crypto-portfolio-mcp',
    script: path.join(installPath, 'lib', 'crypto-portfolio-mcp', 'main.py'), // CORRECTED: main.py not server.py
    tier: 'tier5',
    interpreter: 'python',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_PORTFOLIO_PORT || 3044,
      PORTFOLIO_DATA_PATH: process.env.PORTFOLIO_DATA_PATH || path.join(dataPath, 'portfolio.json')
    },
    error_file: path.join(logPath, 'crypto-portfolio-error.log'),
    out_file: path.join(logPath, 'crypto-portfolio-out.log')
  },
  // ========== BLOCKED: Paid API Required ==========
  // HYPERLIQUID: Requires CoinGlass API ($29/month minimum - NO FREE TIER)
  // Disabled by default - investigating free alternatives
  /*
  {
    name: 'hyperliquid-whalealert-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'hyperliquid-whalealert-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.HYPERLIQUID_WHALE_PORT || 3045,
      COINGLASS_API_KEY: process.env.COINGLASS_API_KEY, // REQUIRED: $29/month
      MIN_POSITION_SIZE: process.env.HYPERLIQUID_MIN_POSITION || '100000'
    },
    error_file: path.join(logPath, 'hyperliquid-whalealert-error.log'),
    out_file: path.join(logPath, 'hyperliquid-whalealert-out.log')
  },
  */

  // ========== TESTING: FastMCP stdout Issue ==========
  // ORDERBOOK: Uses FastMCP framework, may have Windows pipe handling issues
  // Testing in actual MCP client environment
  {
    name: 'crypto-orderbook-mcp',
    script: 'uv', // CORRECTED: uv command with args
    args: [
      '--directory',
      path.join(installPath, 'lib', 'crypto-orderbook-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_ORDERBOOK_PORT || 3046,
      EXCHANGE_API_KEYS: process.env.EXCHANGE_API_KEYS || '{}' // Same as CCXT
    },
    error_file: path.join(logPath, 'crypto-orderbook-error.log'),
    out_file: path.join(logPath, 'crypto-orderbook-out.log')
  },
  {
    name: 'cryptopanic-mcp',
    script: path.join(installPath, 'lib', 'cryptopanic-mcp', 'server.py'),
    tier: 'tier5',
    interpreter: 'python3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTOPANIC_PORT || 3047,
      CRYPTOPANIC_API_KEY: process.env.CRYPTOPANIC_API_KEY // Needs API tier verification
    },
    error_file: path.join(logPath, 'cryptopanic-error.log'),
    out_file: path.join(logPath, 'cryptopanic-out.log')
  },
  {
    name: 'whale-tracker-mcp',
    script: path.join(installPath, 'lib', 'whale-tracker-mcp', 'server.py'),
    tier: 'tier5',
    interpreter: 'python3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.WHALE_TRACKER_PORT || 3048,
      WHALE_ALERT_API_KEY: process.env.WHALE_ALERT_API_KEY, // Needs API tier verification
      MIN_TRANSACTION_USD: process.env.MIN_WHALE_TRANSACTION || '1000000'
    },
    error_file: path.join(logPath, 'whale-tracker-error.log'),
    out_file: path.join(logPath, 'whale-tracker-out.log')
  },
  {
    name: 'crypto-sentiment-mcp',
    script: path.join(installPath, 'lib', 'crypto-sentiment-mcp', 'server.py'),
    tier: 'tier5',
    interpreter: 'python3',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_SENTIMENT_PORT || 3049,
      SENTIMENT_API_KEY: process.env.SENTIMENT_API_KEY // Needs API tier verification
    },
    error_file: path.join(logPath, 'crypto-sentiment-error.log'),
    out_file: path.join(logPath, 'crypto-sentiment-out.log')
  },

  // ========== PHASE 5A: NEW WORKING MCPs (2/7) ==========
  // Tested October 1, 2025 - Both working out-of-the-box (no API keys required)
  {
    name: 'bridge-rates-mcp',
    script: path.join(installPath, 'lib', 'bridge-rates-mcp', 'index.js'),
    tier: 'tier5',
    interpreter: 'node',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.BRIDGE_RATES_PORT || 3051
    },
    error_file: path.join(logPath, 'bridge-rates-mcp-error.log'),
    out_file: path.join(logPath, 'bridge-rates-mcp-out.log')
  },
  {
    name: 'memecoin-radar-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'memecoin-radar-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.MEMECOIN_RADAR_PORT || 3052
    },
    error_file: path.join(logPath, 'memecoin-radar-mcp-error.log'),
    out_file: path.join(logPath, 'memecoin-radar-mcp-out.log')
  },

  // ========== PHASE 5B BATCH 1: FREE TIER (3/7) ==========
  // Tested October 1, 2025 - Working without API keys
  {
    name: 'dex-metrics-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'dex-metrics-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.DEX_METRICS_PORT || 3053
    },
    error_file: path.join(logPath, 'dex-metrics-mcp-error.log'),
    out_file: path.join(logPath, 'dex-metrics-mcp-out.log')
  },
  {
    name: 'honeypot-detector-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'honeypot-detector-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.HONEYPOT_DETECTOR_PORT || 3054
    },
    error_file: path.join(logPath, 'honeypot-detector-mcp-error.log'),
    out_file: path.join(logPath, 'honeypot-detector-mcp-out.log')
  },
  {
    name: 'chainlist-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'chainlist-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CHAINLIST_PORT || 3055
    },
    error_file: path.join(logPath, 'chainlist-mcp-error.log'),
    out_file: path.join(logPath, 'chainlist-mcp-out.log')
  },

  // ========== PHASE 5B BATCH 2: DeFi & Analytics (5/7) ==========
  // Tested October 1, 2025 - Working without API keys
  {
    name: 'crypto-liquidations-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'crypto-liquidations-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_LIQUIDATIONS_PORT || 3056
    },
    error_file: path.join(logPath, 'crypto-liquidations-mcp-error.log'),
    out_file: path.join(logPath, 'crypto-liquidations-mcp-out.log')
  },
  {
    name: 'dao-proposals-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'dao-proposals-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.DAO_PROPOSALS_PORT || 3057
    },
    error_file: path.join(logPath, 'dao-proposals-mcp-error.log'),
    out_file: path.join(logPath, 'dao-proposals-mcp-out.log')
  },
  {
    name: 'polymarket-predictions-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'polymarket-predictions-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.POLYMARKET_PORT || 3058
    },
    error_file: path.join(logPath, 'polymarket-predictions-mcp-error.log'),
    out_file: path.join(logPath, 'polymarket-predictions-mcp-out.log')
  },
  {
    name: 'crypto-projects-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'crypto-projects-mcp'),
      'run',
      'main.py'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.CRYPTO_PROJECTS_PORT || 3059
    },
    error_file: path.join(logPath, 'crypto-projects-mcp-error.log'),
    out_file: path.join(logPath, 'crypto-projects-mcp-out.log')
  },
  {
    name: 'etf-flow-mcp',
    script: 'uv',
    args: [
      '--directory',
      path.join(installPath, 'lib', 'etf-flow-mcp'),
      'run',
      'etf-flow-mcp'
    ],
    tier: 'tier5',
    ...commonOptions,
    env: {
      ...commonOptions.env,
      PORT: process.env.ETF_FLOW_PORT || 3060
    },
    error_file: path.join(logPath, 'etf-flow-mcp-error.log'),
    out_file: path.join(logPath, 'etf-flow-mcp-out.log')
  }
];

// Filter MCPs based on installation tier
const activeMcps = mcps.filter(mcp => activeTiers.includes(mcp.tier));

// Export PM2 ecosystem configuration
module.exports = {
  apps: activeMcps.map(mcp => {
    const { tier, ...appConfig } = mcp;
    return appConfig;
  })
};

// Export tier information for scripts
module.exports.tierInfo = {
  activeTier: installationTier,
  activeTiers: activeTiers,
  totalMcps: mcps.length,
  activeMcps: activeMcps.length,
  mcpsByTier: {
    tier1: mcps.filter(m => m.tier === 'tier1').length,
    tier2: mcps.filter(m => m.tier === 'tier2').length,
    tier3: mcps.filter(m => m.tier === 'tier3').length,
    tier4: mcps.filter(m => m.tier === 'tier4').length,
    tier5: mcps.filter(m => m.tier === 'tier5').length
  }
};
