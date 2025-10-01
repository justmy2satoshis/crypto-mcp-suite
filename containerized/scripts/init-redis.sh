#!/bin/bash
# Crypto MCP Suite - Redis Initialization Script
# Purpose: Configure Redis for optimal caching performance

set -e

echo "================================================================="
echo "Crypto MCP Suite - Redis Initialization"
echo "================================================================="

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Error: Redis is not running"
    echo "Please start Redis and try again:"
    echo "  macOS: brew services start redis"
    echo "  Linux: sudo systemctl start redis-server"
    exit 1
fi

echo "✅ Redis is running"

# Configure Redis for caching
echo "Configuring Redis..."

# Set maximum memory (512MB default)
CACHE_MAX_SIZE_MB=${CACHE_MAX_SIZE_MB:-512}
redis-cli CONFIG SET maxmemory "${CACHE_MAX_SIZE_MB}mb"
echo "  ✓ Max memory: ${CACHE_MAX_SIZE_MB}MB"

# Set eviction policy (remove least recently used keys when memory full)
CACHE_EVICTION_POLICY=${CACHE_EVICTION_POLICY:-allkeys-lru}
redis-cli CONFIG SET maxmemory-policy "$CACHE_EVICTION_POLICY"
echo "  ✓ Eviction policy: $CACHE_EVICTION_POLICY"

# Enable keyspace notifications for cache monitoring
redis-cli CONFIG SET notify-keyspace-events Ex
echo "  ✓ Keyspace notifications: Enabled (expiration events)"

# Set default TTL via configuration
CACHE_TTL_SECONDS=${CACHE_TTL_SECONDS:-300}
echo "  ✓ Default TTL: ${CACHE_TTL_SECONDS} seconds (5 minutes)"

# Create key prefixes for organization
echo "Creating key namespaces..."

# Create hash for MCP metadata
redis-cli HSET crypto:config version "0.1.0-alpha"
redis-cli HSET crypto:config installation_mode "${INSTALLATION_MODE:-standard}"
redis-cli HSET crypto:config cache_ttl "${CACHE_TTL_SECONDS}"
redis-cli HSET crypto:config max_memory_mb "${CACHE_MAX_SIZE_MB}"
echo "  ✓ Config namespace: crypto:config"

# Initialize MCP registry cache (25 MCPs)
echo "Initializing MCP registry cache..."

# Tier S MCPs
redis-cli HSET crypto:mcps:coingecko tier "S" port "3001" status "active" score "92"
redis-cli HSET crypto:mcps:cryptocompare tier "S" port "3002" status "active" score "88"
redis-cli HSET crypto:mcps:glassnode tier "S" port "3003" status "active" score "89"
redis-cli HSET crypto:mcps:dune tier "S" port "3004" status "active" score "85"
redis-cli HSET crypto:mcps:nansen tier "S" port "3005" status "active" score "90"
redis-cli HSET crypto:mcps:messari tier "S" port "3006" status "active" score "86"
redis-cli HSET crypto:mcps:theblock tier "S" port "3007" status "active" score "84"
redis-cli HSET crypto:mcps:defillama tier "S" port "3008" status "active" score "87"
redis-cli HSET crypto:mcps:santiment tier "S" port "3009" status "active" score "83"
redis-cli HSET crypto:mcps:chainanalysis tier "S" port "3010" status "active" score "91"

# Tier A MCPs
redis-cli HSET crypto:mcps:kaiko tier "A" port "3011" status "active" score "82"
redis-cli HSET crypto:mcps:footprint tier "A" port "3012" status "active" score "79"
redis-cli HSET crypto:mcps:intotheblock tier "A" port "3013" status "active" score "80"
redis-cli HSET crypto:mcps:coinmetrics tier "A" port "3014" status "active" score "78"
redis-cli HSET crypto:mcps:parsec tier "A" port "3015" status "active" score "77"
redis-cli HSET crypto:mcps:lunarcrush tier "A" port "3016" status "active" score "76"
redis-cli HSET crypto:mcps:coinmarketcap tier "A" port "3017" status "active" score "81"
redis-cli HSET crypto:mcps:cryptoquant tier "A" port "3018" status "active" score "75"
redis-cli HSET crypto:mcps:arkham tier "A" port "3019" status "active" score "74"
redis-cli HSET crypto:mcps:debank tier "A" port "3020" status "active" score "73"

# Tier B MCPs
redis-cli HSET crypto:mcps:amberdata tier "B" port "3021" status "active" score "72"
redis-cli HSET crypto:mcps:tokenmetrics tier "B" port "3022" status "active" score "71"
redis-cli HSET crypto:mcps:santiment-pro tier "B" port "3023" status "active" score "70"
redis-cli HSET crypto:mcps:messari-pro tier "B" port "3024" status "active" score "73"
redis-cli HSET crypto:mcps:glassnode-pro tier "B" port "3025" status "active" score "74"

echo "  ✓ 25 MCPs registered in cache"

# Initialize cache statistics
echo "Initializing cache statistics..."
redis-cli HSET crypto:stats total_requests 0
redis-cli HSET crypto:stats cache_hits 0
redis-cli HSET crypto:stats cache_misses 0
redis-cli HSET crypto:stats cache_hit_rate 0.00
redis-cli HSET crypto:stats cost_savings_usd 0.00
echo "  ✓ Cache statistics initialized"

# Create sample price data cache (for testing)
echo "Creating sample cache entries..."
redis-cli SETEX "crypto:price:BTC:usd" "$CACHE_TTL_SECONDS" "50000.00"
redis-cli SETEX "crypto:price:ETH:usd" "$CACHE_TTL_SECONDS" "3000.00"
redis-cli SETEX "crypto:price:SOL:usd" "$CACHE_TTL_SECONDS" "120.00"
echo "  ✓ Sample price cache created (BTC, ETH, SOL)"

# Test cache operations
echo "Testing cache operations..."
test_value=$(redis-cli GET "crypto:price:BTC:usd")
if [ "$test_value" = "50000.00" ]; then
    echo "  ✓ Cache read/write: OK"
else
    echo "  ❌ Cache read/write: FAILED"
    exit 1
fi

# Display Redis info
echo ""
echo "================================================================="
echo "Redis Configuration Summary"
echo "================================================================="
redis-cli INFO server | grep -E "redis_version|redis_mode|os|arch_bits"
echo ""
redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human|maxmemory_policy"
echo ""
redis-cli INFO stats | grep -E "total_connections_received|total_commands_processed|keyspace_hits|keyspace_misses"
echo ""
redis-cli INFO keyspace
echo "================================================================="

# Verify MCP count
mcp_count=$(redis-cli KEYS "crypto:mcps:*" | wc -l)
echo ""
echo "✅ Redis initialization complete"
echo "   MCPs registered: $mcp_count"
echo "   Max memory: ${CACHE_MAX_SIZE_MB}MB"
echo "   Eviction policy: $CACHE_EVICTION_POLICY"
echo "   Default TTL: ${CACHE_TTL_SECONDS}s"
echo ""
echo "================================================================="

exit 0
