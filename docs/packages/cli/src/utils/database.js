/**
 * Database setup and management utilities
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const Redis = require('ioredis');
const { Client } = require('pg');
const chalk = require('chalk');
const ora = require('ora');

/**
 * Test Redis connection
 */
async function testRedisConnection(host = 'localhost', port = 6379) {
  const spinner = ora('Testing Redis connection...').start();

  try {
    const redis = new Redis({
      host,
      port,
      maxRetriesPerRequest: 3,
      retryStrategy: () => null
    });

    await redis.ping();
    await redis.quit();

    spinner.succeed('Redis connection successful');
    return { success: true, host, port };
  } catch (error) {
    spinner.fail('Redis connection failed');
    return { success: false, error: error.message };
  }
}

/**
 * Test PostgreSQL connection
 */
async function testPostgresConnection(config = {}) {
  const spinner = ora('Testing PostgreSQL connection...').start();

  const client = new Client({
    host: config.host || 'localhost',
    port: config.port || 5432,
    user: config.user || 'postgres',
    password: config.password || 'postgres',
    database: config.database || 'postgres'
  });

  try {
    await client.connect();
    const result = await client.query('SELECT version()');
    await client.end();

    spinner.succeed('PostgreSQL connection successful');
    return { success: true, version: result.rows[0].version };
  } catch (error) {
    spinner.fail('PostgreSQL connection failed');
    return { success: false, error: error.message };
  }
}

/**
 * Initialize Redis with configuration
 */
async function setupRedis(installDir) {
  const spinner = ora('Setting up Redis configuration...').start();

  try {
    const configDir = path.join(installDir, 'configs');
    await fs.ensureDir(configDir);

    const redisConfig = `# Crypto MCP Suite Redis Configuration
# Performance tuning
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000

# Security
requirepass ${generatePassword()}
protected-mode yes
bind 127.0.0.1

# Networking
port 6379
tcp-backlog 511
timeout 300

# Memory optimization
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64

# Logging
loglevel notice
logfile ""
`;

    const configPath = path.join(configDir, 'redis.conf');
    await fs.writeFile(configPath, redisConfig);

    spinner.succeed(`Redis configuration created: ${configPath}`);
    return { success: true, configPath };
  } catch (error) {
    spinner.fail('Redis setup failed');
    return { success: false, error: error.message };
  }
}

/**
 * Initialize PostgreSQL with databases and schemas
 */
async function setupPostgreSQL(installDir, config = {}) {
  const spinner = ora('Setting up PostgreSQL databases...').start();

  try {
    const client = new Client({
      host: config.host || 'localhost',
      port: config.port || 5432,
      user: config.user || 'postgres',
      password: config.password || 'postgres',
      database: 'postgres'
    });

    await client.connect();

    // Create crypto_mcp database
    try {
      await client.query('CREATE DATABASE crypto_mcp;');
      spinner.text = 'Created database: crypto_mcp';
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    await client.end();

    // Connect to crypto_mcp database
    const mcpClient = new Client({
      ...config,
      database: 'crypto_mcp'
    });

    await mcpClient.connect();

    // Enable TimescaleDB extension
    try {
      await mcpClient.query('CREATE EXTENSION IF NOT EXISTS timescaledb;');
      spinner.text = 'Enabled TimescaleDB extension';
    } catch (error) {
      spinner.warn('TimescaleDB extension not available (optional)');
    }

    // Create schemas
    await mcpClient.query(`
      CREATE SCHEMA IF NOT EXISTS whale_tracker;
      CREATE SCHEMA IF NOT EXISTS sentiment;
      CREATE SCHEMA IF NOT EXISTS memecoin;
    `);

    // Create whale_tracker tables
    await mcpClient.query(`
      CREATE TABLE IF NOT EXISTS whale_tracker.chains (
        chain_id SERIAL PRIMARY KEY,
        chain_name VARCHAR(50) UNIQUE NOT NULL,
        native_token VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS whale_tracker.tokens (
        token_id SERIAL PRIMARY KEY,
        chain_id INTEGER REFERENCES whale_tracker.chains(chain_id),
        contract_address VARCHAR(100),
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(100),
        decimals INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(chain_id, contract_address)
      );

      CREATE TABLE IF NOT EXISTS whale_tracker.transactions (
        tx_id BIGSERIAL PRIMARY KEY,
        chain_id INTEGER REFERENCES whale_tracker.chains(chain_id),
        token_id INTEGER REFERENCES whale_tracker.tokens(token_id),
        amount NUMERIC(30,8) NOT NULL,
        amount_usd NUMERIC(20,2) NOT NULL,
        from_address VARCHAR(100),
        to_address VARCHAR(100),
        tx_hash VARCHAR(100) UNIQUE NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_whale_tx_timestamp ON whale_tracker.transactions(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_whale_tx_amount_usd ON whale_tracker.transactions(amount_usd DESC);
    `);

    // Create sentiment tables
    await mcpClient.query(`
      CREATE TABLE IF NOT EXISTS sentiment.scores (
        score_id BIGSERIAL PRIMARY KEY,
        asset_symbol VARCHAR(20) NOT NULL,
        sentiment_score NUMERIC(5,2),
        social_volume INTEGER,
        social_dominance NUMERIC(5,2),
        timestamp TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sentiment_timestamp ON sentiment.scores(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_sentiment_asset ON sentiment.scores(asset_symbol, timestamp DESC);
    `);

    // Create memecoin tables
    await mcpClient.query(`
      CREATE TABLE IF NOT EXISTS memecoin.coins (
        coin_id SERIAL PRIMARY KEY,
        contract_address VARCHAR(100) UNIQUE NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(100),
        chain VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS memecoin.metrics (
        metric_id BIGSERIAL PRIMARY KEY,
        coin_id INTEGER REFERENCES memecoin.coins(coin_id),
        market_cap NUMERIC(20,2),
        volume_24h NUMERIC(20,2),
        holders_count INTEGER,
        price_usd NUMERIC(20,8),
        timestamp TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_memecoin_timestamp ON memecoin.metrics(timestamp DESC);
    `);

    await mcpClient.end();

    spinner.succeed('PostgreSQL setup complete');
    return { success: true };
  } catch (error) {
    spinner.fail('PostgreSQL setup failed');
    return { success: false, error: error.message };
  }
}

/**
 * Generate a random password
 */
function generatePassword(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Check database service status
 */
async function checkDatabaseStatus() {
  const results = {
    redis: { running: false, version: null },
    postgresql: { running: false, version: null }
  };

  // Check Redis
  try {
    const redis = new Redis({ maxRetriesPerRequest: 1, retryStrategy: () => null });
    const info = await redis.info();
    redis.quit();

    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    results.redis.running = true;
    results.redis.version = versionMatch ? versionMatch[1] : 'unknown';
  } catch {
    results.redis.running = false;
  }

  // Check PostgreSQL
  try {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'postgres',
      connectionTimeoutMillis: 2000
    });

    await client.connect();
    const result = await client.query('SELECT version()');
    await client.end();

    const versionMatch = result.rows[0].version.match(/PostgreSQL ([\d.]+)/);
    results.postgresql.running = true;
    results.postgresql.version = versionMatch ? versionMatch[1] : 'unknown';
  } catch {
    results.postgresql.running = false;
  }

  return results;
}

module.exports = {
  testRedisConnection,
  testPostgresConnection,
  setupRedis,
  setupPostgreSQL,
  checkDatabaseStatus,
  generatePassword
};
