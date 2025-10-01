-- Crypto MCP Suite - PostgreSQL Database Initialization
-- Database: crypto_mcp_suite
-- Purpose: Time-series storage and historical analytics

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable TimescaleDB for time-series optimization
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSON functions
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE mcp_tier AS ENUM ('S', 'A', 'B');
CREATE TYPE mcp_status AS ENUM ('active', 'inactive', 'error', 'maintenance');
CREATE TYPE api_response_status AS ENUM ('success', 'error', 'timeout', 'rate_limited');

-- ============================================================================
-- MCP REGISTRY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mcp_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    tier mcp_tier NOT NULL,
    status mcp_status DEFAULT 'active',
    api_endpoint VARCHAR(255),
    port INTEGER,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    cost_per_month DECIMAL(10,2),
    rate_limit_rpm INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 25 MCPs
INSERT INTO mcp_registry (name, tier, port, score, cost_per_month, api_endpoint) VALUES
-- Tier S (10 MCPs)
('coingecko', 'S', 3001, 92, 0, 'http://localhost:3001'),
('cryptocompare', 'S', 3002, 88, 0, 'http://localhost:3002'),
('glassnode', 'S', 3003, 89, 0, 'http://localhost:3003'),
('dune', 'S', 3004, 85, 0, 'http://localhost:3004'),
('nansen', 'S', 3005, 90, 150, 'http://localhost:3005'),
('messari', 'S', 3006, 86, 0, 'http://localhost:3006'),
('theblock', 'S', 3007, 84, 0, 'http://localhost:3007'),
('defillama', 'S', 3008, 87, 0, 'http://localhost:3008'),
('santiment', 'S', 3009, 83, 0, 'http://localhost:3009'),
('chainanalysis', 'S', 3010, 91, 0, 'http://localhost:3010'),

-- Tier A (10 MCPs)
('kaiko', 'A', 3011, 82, 0, 'http://localhost:3011'),
('footprint', 'A', 3012, 79, 0, 'http://localhost:3012'),
('intotheblock', 'A', 3013, 80, 0, 'http://localhost:3013'),
('coinmetrics', 'A', 3014, 78, 0, 'http://localhost:3014'),
('parsec', 'A', 3015, 77, 0, 'http://localhost:3015'),
('lunarcrush', 'A', 3016, 76, 0, 'http://localhost:3016'),
('coinmarketcap', 'A', 3017, 81, 0, 'http://localhost:3017'),
('cryptoquant', 'A', 3018, 75, 0, 'http://localhost:3018'),
('arkham', 'A', 3019, 74, 0, 'http://localhost:3019'),
('debank', 'A', 3020, 73, 0, 'http://localhost:3020'),

-- Tier B (5 MCPs)
('amberdata', 'B', 3021, 72, 0, 'http://localhost:3021'),
('tokenmetrics', 'B', 3022, 71, 99, 'http://localhost:3022'),
('santiment-pro', 'B', 3023, 70, 99, 'http://localhost:3023'),
('messari-pro', 'B', 3024, 73, 399, 'http://localhost:3024'),
('glassnode-pro', 'B', 3025, 74, 399, 'http://localhost:3025')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- MCP HEALTH CHECKS TABLE (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mcp_health_checks (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    status mcp_status NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    cpu_usage DECIMAL(5,2),
    memory_usage_mb INTEGER,
    request_count_1h INTEGER DEFAULT 0,
    error_count_1h INTEGER DEFAULT 0
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('mcp_health_checks', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_mcp_id ON mcp_health_checks (mcp_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_health_status ON mcp_health_checks (status, time DESC);

-- Retention policy: Keep 90 days of health check data
SELECT add_retention_policy('mcp_health_checks', INTERVAL '90 days', if_not_exists => TRUE);

-- ============================================================================
-- API REQUESTS LOG TABLE (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_requests_log (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    response_status api_response_status NOT NULL,
    cache_hit BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    ip_address INET,
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('api_requests_log', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_requests_mcp_id ON api_requests_log (mcp_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_requests_endpoint ON api_requests_log (endpoint, time DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status ON api_requests_log (response_status, time DESC);
CREATE INDEX IF NOT EXISTS idx_requests_cache ON api_requests_log (cache_hit, time DESC);

-- Retention policy: Keep 30 days of request logs
SELECT add_retention_policy('api_requests_log', INTERVAL '30 days', if_not_exists => TRUE);

-- ============================================================================
-- PRICE DATA TABLE (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS price_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    source_mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    price_usd DECIMAL(20,8) NOT NULL,
    price_btc DECIMAL(20,8),
    volume_24h DECIMAL(20,2),
    market_cap DECIMAL(20,2),
    price_change_24h DECIMAL(10,4),
    price_change_7d DECIMAL(10,4),
    metadata JSONB
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('price_data', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_price_symbol ON price_data (symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_price_source ON price_data (source_mcp_id, time DESC);

-- Create continuous aggregate for 1-hour average prices
CREATE MATERIALIZED VIEW IF NOT EXISTS price_1h_avg
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    symbol,
    source_mcp_id,
    AVG(price_usd) AS avg_price_usd,
    MAX(price_usd) AS max_price_usd,
    MIN(price_usd) AS min_price_usd,
    AVG(volume_24h) AS avg_volume_24h,
    COUNT(*) AS sample_count
FROM price_data
GROUP BY bucket, symbol, source_mcp_id;

-- Refresh policy: Update every hour
SELECT add_continuous_aggregate_policy('price_1h_avg',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Retention policy: Keep 180 days of raw price data
SELECT add_retention_policy('price_data', INTERVAL '180 days', if_not_exists => TRUE);

-- ============================================================================
-- ON-CHAIN METRICS TABLE (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS onchain_metrics (
    time TIMESTAMPTZ NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    source_mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    active_addresses INTEGER,
    transaction_count INTEGER,
    avg_transaction_value DECIMAL(20,8),
    hash_rate DECIMAL(30,2),
    difficulty DECIMAL(30,2),
    block_time_seconds INTEGER,
    mempool_size_mb INTEGER,
    fees_usd DECIMAL(20,2),
    metadata JSONB
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('onchain_metrics', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onchain_blockchain ON onchain_metrics (blockchain, time DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_source ON onchain_metrics (source_mcp_id, time DESC);

-- Retention policy: Keep 365 days of on-chain metrics
SELECT add_retention_policy('onchain_metrics', INTERVAL '365 days', if_not_exists => TRUE);

-- ============================================================================
-- DEFI METRICS TABLE (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS defi_metrics (
    time TIMESTAMPTZ NOT NULL,
    protocol VARCHAR(100) NOT NULL,
    source_mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    tvl_usd DECIMAL(20,2),
    volume_24h DECIMAL(20,2),
    fees_24h DECIMAL(20,2),
    revenue_24h DECIMAL(20,2),
    users_24h INTEGER,
    apy DECIMAL(10,4),
    metadata JSONB
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('defi_metrics', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_defi_protocol ON defi_metrics (protocol, time DESC);
CREATE INDEX IF NOT EXISTS idx_defi_source ON defi_metrics (source_mcp_id, time DESC);

-- Retention policy: Keep 180 days of DeFi metrics
SELECT add_retention_policy('defi_metrics', INTERVAL '180 days', if_not_exists => TRUE);

-- ============================================================================
-- CACHE STATISTICS TABLE (TimescaleDB Hypertable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cache_statistics (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    total_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    cache_hit_rate DECIMAL(5,2),
    avg_response_time_cached_ms INTEGER,
    avg_response_time_uncached_ms INTEGER,
    cost_savings_usd DECIMAL(10,2),
    bandwidth_saved_mb DECIMAL(10,2)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('cache_statistics', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cache_stats_mcp ON cache_statistics (mcp_id, time DESC);

-- Retention policy: Keep 90 days of cache statistics
SELECT add_retention_policy('cache_statistics', INTERVAL '90 days', if_not_exists => TRUE);

-- ============================================================================
-- RATE LIMIT TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mcp_id UUID NOT NULL REFERENCES mcp_registry(id) ON DELETE CASCADE,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    requests_count INTEGER DEFAULT 0,
    limit_exceeded_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_rate_limit_mcp_window ON rate_limit_tracking (mcp_id, window_start DESC);

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mcp_id UUID REFERENCES mcp_registry(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alerts_mcp ON alerts (mcp_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts (acknowledged, created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for mcp_registry
CREATE TRIGGER update_mcp_registry_updated_at
    BEFORE UPDATE ON mcp_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate cache hit rate
CREATE OR REPLACE FUNCTION calculate_cache_hit_rate(p_cache_hits INTEGER, p_cache_misses INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF (p_cache_hits + p_cache_misses) = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND((p_cache_hits::DECIMAL / (p_cache_hits + p_cache_misses)) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: MCP Health Summary
CREATE OR REPLACE VIEW mcp_health_summary AS
SELECT
    m.name,
    m.tier,
    m.status,
    h.time AS last_check,
    h.response_time_ms,
    h.request_count_1h,
    h.error_count_1h,
    CASE
        WHEN h.error_count_1h = 0 THEN 100.00
        ELSE ROUND(((h.request_count_1h - h.error_count_1h)::DECIMAL / h.request_count_1h) * 100, 2)
    END AS success_rate_1h
FROM mcp_registry m
LEFT JOIN LATERAL (
    SELECT * FROM mcp_health_checks
    WHERE mcp_id = m.id
    ORDER BY time DESC
    LIMIT 1
) h ON TRUE
ORDER BY m.tier, m.name;

-- View: Cache Performance Summary
CREATE OR REPLACE VIEW cache_performance_summary AS
SELECT
    m.name,
    m.tier,
    c.time AS last_update,
    c.total_requests,
    c.cache_hits,
    c.cache_misses,
    c.cache_hit_rate,
    c.cost_savings_usd,
    c.bandwidth_saved_mb
FROM mcp_registry m
LEFT JOIN LATERAL (
    SELECT * FROM cache_statistics
    WHERE mcp_id = m.id
    ORDER BY time DESC
    LIMIT 1
) c ON TRUE
ORDER BY m.tier, m.name;

-- View: Price Comparison Across MCPs
CREATE OR REPLACE VIEW price_comparison AS
SELECT
    p.time,
    p.symbol,
    m.name AS source_mcp,
    p.price_usd,
    p.volume_24h,
    p.market_cap
FROM price_data p
JOIN mcp_registry m ON p.source_mcp_id = m.id
WHERE p.time > NOW() - INTERVAL '1 hour'
ORDER BY p.symbol, p.time DESC;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant permissions to crypto_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crypto_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crypto_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO crypto_user;

-- ============================================================================
-- INITIAL DATA VALIDATION
-- ============================================================================

-- Verify 25 MCPs inserted
DO $$
DECLARE
    mcp_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mcp_count FROM mcp_registry;
    IF mcp_count != 25 THEN
        RAISE WARNING 'Expected 25 MCPs, found %', mcp_count;
    ELSE
        RAISE NOTICE 'Successfully initialized 25 MCPs';
    END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Crypto MCP Suite Database Initialization Complete';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Database: crypto_mcp_suite';
    RAISE NOTICE 'Tables Created: 9';
    RAISE NOTICE 'TimescaleDB Hypertables: 6';
    RAISE NOTICE 'Views: 3';
    RAISE NOTICE 'MCPs Registered: 25';
    RAISE NOTICE '=================================================================';
END $$;
