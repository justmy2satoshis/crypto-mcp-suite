#!/bin/bash
# API Key Validation Script
# Crypto MCP Suite - Phase 5 Automated Validation
#
# Tests API keys for all configured MCPs
# Usage: ./scripts/test-api-keys.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
SKIPPED=0

echo "=========================================="
echo "Crypto MCP Suite - API Key Validation"
echo "Phase 5: API Key Testing"
echo "=========================================="
echo ""

# Load .env.local if exists
if [ -f ".env.local" ]; then
    echo -e "${CYAN}ℹ️  INFO${NC}: Loading API keys from .env.local"
    export $(cat .env.local | grep -v '^#' | xargs)
    echo ""
else
    echo -e "${YELLOW}⚠️  WARN${NC}: .env.local not found - skipping API key tests"
    echo ""
    echo "If you plan to use API-dependent MCPs, create .env.local:"
    echo "  cp .env.example .env.local"
    echo "  # Edit .env.local with your API keys"
    exit 0
fi

# Helper function
test_api_key() {
    local name=$1
    local key_var=$2
    local test_url=$3
    local test_method=${4:-GET}
    local expected_status=${5:-200}

    echo "Testing $name..."

    # Check if API key is set
    local key_value="${!key_var}"
    if [ -z "$key_value" ] || [ "$key_value" == "your_"*"_key_here" ]; then
        echo -e "${YELLOW}⏭️  SKIP${NC}: $name - API key not configured ($key_var)"
        ((SKIPPED++))
        return
    fi

    # Test API endpoint
    if [ "$test_method" == "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $key_value" "$test_url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$test_method" -H "Authorization: Bearer $key_value" "$test_url" 2>/dev/null || echo "000")
    fi

    if [ "$response" == "$expected_status" ] || [ "$response" == "200" ] || [ "$response" == "201" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: $name - API key invalid or unauthorized (HTTP $response)"
        ((FAILED++))
    elif [ "$response" == "000" ]; then
        echo -e "${RED}❌ FAIL${NC}: $name - Network error or URL unreachable"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: $name - Unexpected response (HTTP $response) - may be rate limited"
        ((SKIPPED++))
    fi
}

echo "Testing critical API keys (FREEMIUM/FULL tier)..."
echo ""

# Test 1: TokenMetrics API (tier6)
test_api_key "TokenMetrics API" "TOKENMETRICS_API_KEY" "https://api.tokenmetrics.com/v2/tokens" "GET" "200"

# Test 2: LunarCrush API (tier6)
test_api_key "LunarCrush API" "LUNARCRUSH_API_KEY" "https://lunarcrush.com/api4/public/coins/list" "GET" "200"

# Test 3: Infura API (tier5)
# Note: Infura requires API key in URL, not header
if [ -n "$INFURA_API_KEY" ] && [ "$INFURA_API_KEY" != "your_infura_key_here" ]; then
    echo "Testing Infura API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://mainnet.infura.io/v3/$INFURA_API_KEY" -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Infura API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: Infura API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Infura API - Unexpected response (HTTP $response)"
        ((SKIPPED++))
    fi
else
    echo -e "${YELLOW}⏭️  SKIP${NC}: Infura API - API key not configured"
    ((SKIPPED++))
fi

# Test 4: TheGraph API (tier5)
if [ -n "$THEGRAPH_API_KEY" ] && [ "$THEGRAPH_API_KEY" != "your_thegraph_key_here" ]; then
    echo "Testing TheGraph API..."
    # TheGraph uses API key in URL path
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://gateway.thegraph.com/api/$THEGRAPH_API_KEY/subgraphs/id/ELUcwgpm14LKPLrBRuVvPvNKHQ9HvwmtKgKSH6123cr7" \
        -X POST -H "Content-Type: application/json" \
        -d '{"query":"{ _meta { block { number } } }"}' 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: TheGraph API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: TheGraph API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: TheGraph API - Unexpected response (HTTP $response)"
        ((SKIPPED++))
    fi
else
    echo -e "${YELLOW}⏭️  SKIP${NC}: TheGraph API - API key not configured"
    ((SKIPPED++))
fi

# Test 5: Dune Analytics API (tier5)
test_api_key "Dune Analytics API" "DUNE_API_KEY" "https://api.dune.com/api/v1/query/3435975" "GET" "200"

# Test 6: Santiment API (tier5)
if [ -n "$SANTIMENT_API_KEY" ] && [ "$SANTIMENT_API_KEY" != "your_santiment_key_here" ]; then
    echo "Testing Santiment API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://api.santiment.net/graphql" \
        -H "Authorization: Apikey $SANTIMENT_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"query":"{ getMetric(metric: \"active_addresses_24h\") { metadata { metric } } }"}' 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Santiment API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: Santiment API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Santiment API - Unexpected response (HTTP $response)"
        ((SKIPPED++))
    fi
else
    echo -e "${YELLOW}⏭️  SKIP${NC}: Santiment API - API key not configured"
    ((SKIPPED++))
fi

# Test 7: CryptoPanic API (tier5)
if [ -n "$CRYPTOPANIC_API_KEY" ] && [ "$CRYPTOPANIC_API_KEY" != "your_cryptopanic_key_here" ]; then
    echo "Testing CryptoPanic API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://cryptopanic.com/api/v1/posts/?auth_token=$CRYPTOPANIC_API_KEY&public=true" 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: CryptoPanic API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: CryptoPanic API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: CryptoPanic API - Unexpected response (HTTP $response)"
        ((SKIPPED++))
    fi
else
    echo -e "${YELLOW}⏭️  SKIP${NC}: CryptoPanic API - API key not configured"
    ((SKIPPED++))
fi

# Test 8: SolSniffer API (tier5)
test_api_key "SolSniffer API" "SOLSNIFFER_API_KEY" "https://solsniffer.com/api/v1/token/info" "GET" "200"

# Test 9: Whale Alert API (tier5)
if [ -n "$WHALE_ALERT_API_KEY" ] && [ "$WHALE_ALERT_API_KEY" != "your_whale_alert_key_here" ]; then
    echo "Testing Whale Alert API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://api.whale-alert.io/v1/status?api_key=$WHALE_ALERT_API_KEY" 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Whale Alert API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: Whale Alert API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Whale Alert API - Unexpected response (HTTP $response)"
        ((SKIPPED++))
    fi
else
    echo -e "${YELLOW}⏭️  SKIP${NC}: Whale Alert API - API key not configured"
    ((SKIPPED++))
fi

echo ""
echo "Testing optional API keys (tier6)..."
echo ""

# Test 10: Beaconchain API (tier6 - optional)
if [ -n "$BEACONCHAIN_API_KEY" ] && [ "$BEACONCHAIN_API_KEY" != "your_beaconchain_key_here" ]; then
    echo "Testing Beaconchain API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://beaconcha.in/api/v1/validator/1?apikey=$BEACONCHAIN_API_KEY" 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Beaconchain API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: Beaconchain API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Beaconchain API - Unexpected response (HTTP $response)"
        ((SKIPPED++))
    fi
else
    echo -e "${CYAN}ℹ️  INFO${NC}: Beaconchain API - Not configured (optional)"
    ((SKIPPED++))
fi

# Test 11: Reservoir API (tier5 - optional)
test_api_key "Reservoir API" "RESERVOIR_API_KEY" "https://api.reservoir.tools/tokens/v5?limit=1" "GET" "200"

# Test 12: Binance API (tier5 - optional)
if [ -n "$BINANCE_API_KEY" ] && [ "$BINANCE_API_KEY" != "your_binance_key_here" ]; then
    echo "Testing Binance API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "X-MBX-APIKEY: $BINANCE_API_KEY" \
        "https://api.binance.com/api/v3/account" 2>/dev/null || echo "000")

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Binance API - API key valid (HTTP $response)"
        ((PASSED++))
    elif [ "$response" == "401" ] || [ "$response" == "403" ]; then
        echo -e "${RED}❌ FAIL${NC}: Binance API - API key invalid (HTTP $response)"
        ((FAILED++))
    else
        echo -e "${CYAN}ℹ️  INFO${NC}: Binance API - Not configured or needs signature (optional)"
        ((SKIPPED++))
    fi
else
    echo -e "${CYAN}ℹ️  INFO${NC}: Binance API - Not configured (optional)"
    ((SKIPPED++))
fi

# Summary
echo ""
echo "=========================================="
echo "API Key Validation Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED API keys"
echo -e "${RED}Failed:${NC} $FAILED API keys"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED API keys (not configured or optional)"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ API KEY VALIDATION PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy: pm2 start native/config/ecosystem.config.js --only <tier-preset>"
    echo "2. Validate: node scripts/health-check.js (after deployment)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ API KEY VALIDATION FAILED${NC} - Fix invalid API keys"
    echo ""
    echo "Common fixes:"
    echo "- Regenerate expired or invalid API keys"
    echo "- Verify API key format (check for extra spaces, quotes)"
    echo "- Update .env.local with correct API keys"
    echo "- Check API provider dashboard for key status"
    echo ""
    exit 1
fi
