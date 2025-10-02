#!/bin/bash
# Pre-Deployment System Requirements Validation
# Crypto MCP Suite - Phase 5 Automated Validation
# Usage: ./scripts/pre-deployment-check.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo "=========================================="
echo "Crypto MCP Suite - Pre-Deployment Check"
echo "Phase 5: System Requirements Validation"
echo "=========================================="
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

# Check 1: Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ $NODE_MAJOR -ge 18 ]; then
        print_status 0 "Node.js $NODE_VERSION installed (required: 18.0+)"
    else
        print_status 1 "Node.js $NODE_VERSION too old (required: 18.0+)"
    fi
else
    print_status 1 "Node.js not found (install from https://nodejs.org/)"
fi

# Check 2: Python version
echo "Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    if [ $PYTHON_MAJOR -ge 3 ] && [ $PYTHON_MINOR -ge 10 ]; then
        print_status 0 "Python $PYTHON_VERSION installed (required: 3.10+)"
    else
        print_status 1 "Python $PYTHON_VERSION too old (required: 3.10+)"
    fi
else
    print_status 1 "Python3 not found (install from https://python.org/)"
fi

# Check 3: uv package manager
echo "Checking uv package manager..."
if command -v uv &> /dev/null; then
    UV_VERSION=$(uv --version | cut -d' ' -f2)
    print_status 0 "uv $UV_VERSION installed"
else
    print_status 1 "uv not found (install: curl -LsSf https://astral.sh/uv/install.sh | sh)"
fi

# Check 4: Git version
echo "Checking Git version..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    GIT_MAJOR=$(echo $GIT_VERSION | cut -d'.' -f1)
    GIT_MINOR=$(echo $GIT_VERSION | cut -d'.' -f2)
    if [ $GIT_MAJOR -ge 2 ] && [ $GIT_MINOR -ge 30 ]; then
        print_status 0 "Git $GIT_VERSION installed (required: 2.30+)"
    else
        print_warning "Git $GIT_VERSION may not support submodules properly (recommended: 2.30+)"
    fi
else
    print_status 1 "Git not found (install from https://git-scm.com/)"
fi

# Check 5: PM2 process manager
echo "Checking PM2 process manager..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    print_status 0 "PM2 $PM2_VERSION installed"
else
    print_status 1 "PM2 not found (install: npm install -g pm2)"
fi

# Check 6: Disk space
echo "Checking disk space..."
if command -v df &> /dev/null; then
    DISK_AVAIL=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ $DISK_AVAIL -ge 5 ]; then
        print_status 0 "Disk space: ${DISK_AVAIL}GB available (required: 5GB+)"
    else
        print_status 1 "Disk space: ${DISK_AVAIL}GB available (required: 5GB+)"
    fi
else
    print_warning "Cannot check disk space (df command not available)"
fi

# Check 7: Git repository status
echo "Checking Git repository..."
if [ -d ".git" ]; then
    # Check if it's a clean working tree
    if git diff-index --quiet HEAD --; then
        print_status 0 "Git working tree is clean"
    else
        print_warning "Git working tree has uncommitted changes"
    fi

    # Check submodule count
    SUBMODULE_COUNT=$(git submodule status 2>/dev/null | wc -l)
    if [ $SUBMODULE_COUNT -eq 41 ]; then
        print_status 0 "All 41 submodules initialized"
    elif [ $SUBMODULE_COUNT -eq 0 ]; then
        print_status 1 "No submodules initialized (run: git submodule update --init --recursive)"
    else
        print_status 1 "Only $SUBMODULE_COUNT/41 submodules initialized (run: git submodule update --init --recursive)"
    fi
else
    print_status 1 "Not a Git repository (clone with: git clone --recurse-submodules <repo-url>)"
fi

# Check 8: Node.js MCPs directory structure
echo "Checking Node.js MCP directories..."
NODE_MCPS=(
    "bridge-rates-mcp"
    "ccxt-mcp"
    "crypto-indicators-mcp"
    "binance-alpha-mcp"
    "uniswap-trader-mcp"
    "jupiter-mcp"
    "uniswap-price-mcp"
    "tokenmetrics-mcp"
    "lunarcrush-mcp"
    "sui-trader-mcp"
    "raydium-launchlab-mcp"
)

NODE_MCP_FOUND=0
for mcp in "${NODE_MCPS[@]}"; do
    if [ -d "native/lib/$mcp" ]; then
        ((NODE_MCP_FOUND++))
    fi
done

if [ $NODE_MCP_FOUND -eq 11 ]; then
    print_status 0 "All 11 Node.js MCP directories found"
else
    print_status 1 "Only $NODE_MCP_FOUND/11 Node.js MCP directories found"
fi

# Check 9: Python MCPs with pyproject.toml
echo "Checking Python MCP directories..."
PYTHON_MCP_COUNT=$(find native/lib -name "pyproject.toml" 2>/dev/null | wc -l)
if [ $PYTHON_MCP_COUNT -eq 30 ]; then
    print_status 0 "All 30 Python MCP directories found (pyproject.toml)"
else
    print_status 1 "Only $PYTHON_MCP_COUNT/30 Python MCP directories found"
fi

# Check 10: ecosystem.config.js exists and is valid
echo "Checking ecosystem.config.js..."
if [ -f "native/config/ecosystem.config.js" ]; then
    if node -c native/config/ecosystem.config.js 2>/dev/null; then
        print_status 0 "ecosystem.config.js exists and is valid JavaScript"
    else
        print_status 1 "ecosystem.config.js has syntax errors"
    fi
else
    print_status 1 "ecosystem.config.js not found"
fi

# Check 11: .env.example exists
echo "Checking .env.example template..."
if [ -f ".env.example" ]; then
    print_status 0 ".env.example template exists"
else
    print_status 1 ".env.example template not found"
fi

# Check 12: Memory availability (Linux/macOS only)
echo "Checking system memory..."
if command -v free &> /dev/null; then
    MEM_AVAIL=$(free -g | awk '/^Mem:/{print $7}')
    if [ $MEM_AVAIL -ge 4 ]; then
        print_status 0 "Memory: ${MEM_AVAIL}GB available (required: 4GB+)"
    else
        print_status 1 "Memory: ${MEM_AVAIL}GB available (required: 4GB+, recommended: 8GB+)"
    fi
elif command -v vm_stat &> /dev/null; then
    # macOS
    print_warning "Memory check on macOS requires manual verification (Activity Monitor)"
else
    print_warning "Cannot check memory (free/vm_stat command not available)"
fi

# Summary
echo ""
echo "=========================================="
echo "Pre-Deployment Check Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED checks"
echo -e "${RED}Failed:${NC} $FAILED checks"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS checks"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC} - Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./scripts/validate-mcp-dependencies.js (verify dependencies)"
    echo "2. Run: ./scripts/test-api-keys.sh (if using API-dependent MCPs)"
    echo "3. Deploy: pm2 start native/config/ecosystem.config.js --only <tier-preset>"
    exit 0
else
    echo -e "${RED}❌ CHECKS FAILED${NC} - Please fix the issues above before deployment"
    echo ""
    echo "Common fixes:"
    echo "- Install missing software (Node.js, Python, uv, Git, PM2)"
    echo "- Update outdated versions"
    echo "- Initialize Git submodules: git submodule update --init --recursive"
    echo "- Ensure 5GB+ disk space and 4GB+ RAM available"
    exit 1
fi
