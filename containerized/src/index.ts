import express from 'express';
import Redis from 'ioredis';
import { Pool } from 'pg';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const MCP_NAME = process.env.MCP_NAME || 'unknown';

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// PostgreSQL pool
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'crypto_mcp_suite',
  user: process.env.POSTGRES_USER || 'crypto_user',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

app.use(express.json());

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Check Redis
    const redisPing = await redis.ping();

    // Check PostgreSQL
    const pgResult = await pgPool.query('SELECT NOW()');

    const health = {
      status: 'healthy',
      mcp: MCP_NAME,
      version: '0.1.0-alpha',
      timestamp: new Date().toISOString(),
      redis: redisPing === 'PONG' ? 'connected' : 'disconnected',
      postgres: pgResult.rows.length > 0 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    res.json(health);
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(503).json({
      status: 'unhealthy',
      mcp: MCP_NAME,
      error: (error as Error).message,
    });
  }
});

// MCP info endpoint
app.get('/info', async (_req, res) => {
  try {
    const info = {
      name: MCP_NAME,
      version: '0.1.0-alpha',
      description: `${MCP_NAME} MCP Server`,
      endpoints: [
        { path: '/health', method: 'GET', description: 'Health check' },
        { path: '/info', method: 'GET', description: 'MCP information' },
        { path: '/api/price/:symbol', method: 'GET', description: 'Get price data' },
        { path: '/api/metrics/:symbol', method: 'GET', description: 'Get on-chain metrics' },
      ],
      cache: {
        enabled: true,
        ttl: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
      },
      rateLimit: {
        rpm: parseInt(process.env.RATE_LIMIT_RPM || '60', 10),
      },
    };

    res.json(info);
  } catch (error) {
    logger.error({ error }, 'Info endpoint failed');
    res.status(500).json({
      error: (error as Error).message,
    });
  }
});

// Example: Get price data (cached)
app.get('/api/price/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const cacheKey = `crypto:price:${symbol.toUpperCase()}:usd`;

  try {
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info({ symbol, source: 'cache' }, 'Price data retrieved from cache');
      res.json({
        symbol: symbol.toUpperCase(),
        price: parseFloat(cached),
        source: 'cache',
        mcp: MCP_NAME,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Cache miss - would normally call external API here
    // For template, return mock data
    const mockPrice = Math.random() * 50000;

    // Cache the result
    const ttl = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);
    await redis.setex(cacheKey, ttl, mockPrice.toString());

    // Log to PostgreSQL
    await pgPool.query(
      `INSERT INTO api_requests_log (mcp_id, endpoint, method, status_code, response_time_ms, response_status, cache_hit)
       SELECT id, $1, $2, $3, $4, $5, $6 FROM mcp_registry WHERE name = $7`,
      [
        `/api/price/${symbol}`,
        'GET',
        200,
        Math.floor(Math.random() * 100),
        'success',
        false,
        MCP_NAME,
      ]
    );

    logger.info({ symbol, price: mockPrice, source: 'api' }, 'Price data fetched from API');

    res.json({
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      source: 'api',
      mcp: MCP_NAME,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error, symbol }, 'Price fetch failed');
    res.status(500).json({
      error: (error as Error).message,
    });
  }
});

// Example: Get on-chain metrics
app.get('/api/metrics/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    // Mock metrics data
    const metrics = {
      symbol: symbol.toUpperCase(),
      activeAddresses: Math.floor(Math.random() * 1000000),
      transactionCount: Math.floor(Math.random() * 500000),
      hashRate: Math.random() * 100,
      mcp: MCP_NAME,
      timestamp: new Date().toISOString(),
    };

    res.json(metrics);
  } catch (error) {
    logger.error({ error, symbol }, 'Metrics fetch failed');
    res.status(500).json({
      error: (error as Error).message,
    });
  }
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, path: req.path }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    mcp: MCP_NAME,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  redis.disconnect();
  await pgPool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(
    {
      mcp: MCP_NAME,
      port: PORT,
      env: process.env.NODE_ENV || 'development',
    },
    'MCP server started'
  );
});
