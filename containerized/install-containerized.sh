#!/bin/bash
# Crypto MCP Suite - Containerized Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/crypto-mcp-suite/main/containerized/install-containerized.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/YOUR_USERNAME/crypto-mcp-suite.git"
INSTALL_DIR="$HOME/crypto-mcp-suite"
LOG_FILE="$HOME/crypto-mcp-suite-install.log"

# Functions
print_header() {
    echo -e "${BLUE}=================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# Main installation
main() {
    clear
    print_header "Crypto MCP Suite - Containerized Installation"
    echo ""
    echo "This installer will set up the Crypto MCP Suite with:"
    echo "  • 25 curated crypto data MCPs"
    echo "  • Redis caching (60-80% API cost reduction)"
    echo "  • PostgreSQL with TimescaleDB (time-series analytics)"
    echo "  • Podman containerization"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."

    # Start logging
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
    echo ""
    print_info "Installation log: $LOG_FILE"
    echo ""

    # Step 1: Check prerequisites
    print_header "Step 1/7: Checking Prerequisites"

    prerequisites_ok=true

    # Check Podman
    if check_command podman; then
        podman_version=$(podman --version | awk '{print $3}')
        print_info "Podman version: $podman_version"
    else
        prerequisites_ok=false
        print_error "Podman is required but not installed"
        print_info "Install from: https://podman-desktop.io/downloads"
    fi

    # Check Podman Compose
    if check_command podman-compose; then
        print_info "Podman Compose is available"
    else
        print_warning "podman-compose not found, will try docker-compose with Podman"
        if ! check_command docker-compose; then
            prerequisites_ok=false
            print_error "Neither podman-compose nor docker-compose found"
        fi
    fi

    # Check Redis
    if check_command redis-cli; then
        if redis-cli ping > /dev/null 2>&1; then
            print_success "Redis is running"
            redis_version=$(redis-cli --version | awk '{print $2}')
            print_info "Redis version: $redis_version"
        else
            prerequisites_ok=false
            print_error "Redis is installed but not running"
            print_info "Start Redis:"
            print_info "  macOS: brew services start redis"
            print_info "  Linux: sudo systemctl start redis-server"
        fi
    else
        prerequisites_ok=false
        print_error "Redis is not installed"
        print_info "Install from: https://redis.io/docs/getting-started/installation/"
    fi

    # Check PostgreSQL
    if check_command psql; then
        print_success "PostgreSQL is installed"
        pg_version=$(psql --version | awk '{print $3}')
        print_info "PostgreSQL version: $pg_version"

        # Check if PostgreSQL is running
        if pg_isready -q; then
            print_success "PostgreSQL is running"
        else
            prerequisites_ok=false
            print_error "PostgreSQL is installed but not running"
            print_info "Start PostgreSQL:"
            print_info "  macOS: brew services start postgresql@16"
            print_info "  Linux: sudo systemctl start postgresql"
        fi
    else
        prerequisites_ok=false
        print_error "PostgreSQL is not installed"
        print_info "Install from: https://www.postgresql.org/download/"
    fi

    echo ""
    if [ "$prerequisites_ok" = false ]; then
        print_error "Prerequisites check failed. Please install missing components and try again."
        print_info "See containerized/README.md for detailed installation instructions."
        exit 1
    fi

    print_success "All prerequisites met!"
    echo ""

    # Step 2: Clone or update repository
    print_header "Step 2/7: Setting Up Repository"

    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Installation directory already exists: $INSTALL_DIR"
        read -p "Update existing installation? (y/N): " update_choice
        if [[ $update_choice =~ ^[Yy]$ ]]; then
            cd "$INSTALL_DIR"
            git pull origin main
            print_success "Repository updated"
        else
            print_info "Using existing installation"
        fi
    else
        print_info "Cloning repository to $INSTALL_DIR..."
        git clone "$REPO_URL" "$INSTALL_DIR"
        print_success "Repository cloned"
    fi

    cd "$INSTALL_DIR/containerized"
    echo ""

    # Step 3: Configure environment
    print_header "Step 3/7: Configuring Environment"

    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"

        print_warning "IMPORTANT: You need to configure API keys in the .env file"
        print_info "The installer will open the .env file for editing..."
        echo ""
        read -p "Press Enter to open .env file in your default editor..."

        ${EDITOR:-nano} .env

        print_success "Environment configured"
    else
        print_info ".env file already exists"
        read -p "Edit API keys? (y/N): " edit_env
        if [[ $edit_env =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    fi
    echo ""

    # Step 4: Initialize databases
    print_header "Step 4/7: Initializing Databases"

    # Source environment variables
    set -a
    source .env
    set +a

    # Initialize Redis
    print_info "Initializing Redis..."
    chmod +x scripts/init-redis.sh
    if ./scripts/init-redis.sh; then
        print_success "Redis initialized"
    else
        print_error "Redis initialization failed"
        exit 1
    fi
    echo ""

    # Initialize PostgreSQL
    print_info "Initializing PostgreSQL..."

    # Create database if not exists
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
        print_info "Database '$POSTGRES_DB' already exists"
    else
        print_info "Creating database '$POSTGRES_DB'..."
        psql -U postgres -c "CREATE DATABASE $POSTGRES_DB;"
        psql -U postgres -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"
        psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;"
        print_success "Database created"
    fi

    # Run initialization script
    print_info "Running PostgreSQL schema initialization..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f scripts/init-postgres.sql
    print_success "PostgreSQL initialized"
    echo ""

    # Step 5: Build containers
    print_header "Step 5/7: Building Podman Containers"

    print_info "This may take 5-10 minutes on first run..."

    # Determine compose command
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    else
        COMPOSE_CMD="docker-compose"
        export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/podman/podman.sock"
    fi

    # Build containers
    $COMPOSE_CMD build --no-cache
    print_success "Containers built successfully"
    echo ""

    # Step 6: Start containers
    print_header "Step 6/7: Starting MCP Containers"

    # Determine installation mode
    INSTALLATION_MODE=${INSTALLATION_MODE:-standard}
    print_info "Installation mode: $INSTALLATION_MODE"

    case "$INSTALLATION_MODE" in
        minimal)
            print_info "Starting Tier S MCPs only (10 MCPs)..."
            $COMPOSE_CMD up -d
            ;;
        standard)
            print_info "Starting Tier S + A MCPs (20 MCPs)..."
            $COMPOSE_CMD --profile tier-a up -d
            ;;
        premium|full)
            print_info "Starting all MCPs (25 MCPs)..."
            $COMPOSE_CMD --profile full up -d
            ;;
        *)
            print_warning "Unknown installation mode, using standard..."
            $COMPOSE_CMD --profile tier-a up -d
            ;;
    esac

    # Wait for containers to start
    print_info "Waiting for containers to start (30 seconds)..."
    sleep 30

    print_success "Containers started"
    echo ""

    # Step 7: Verify installation
    print_header "Step 7/7: Verifying Installation"

    # Check running containers
    running_containers=$(podman ps --format "{{.Names}}" | grep crypto-suite | wc -l)
    print_info "Running containers: $running_containers"

    # Test MCP connectivity
    print_info "Testing MCP connectivity..."

    test_failures=0
    for port in 3001 3002 3003; do
        if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            print_success "Port $port: OK"
        else
            print_warning "Port $port: Not responding (may still be starting)"
            test_failures=$((test_failures + 1))
        fi
    done

    # Test Redis cache
    if redis-cli GET crypto:config:version > /dev/null 2>&1; then
        print_success "Redis cache: OK"
    else
        print_warning "Redis cache: Not responding"
        test_failures=$((test_failures + 1))
    fi

    # Test PostgreSQL
    if psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM mcp_registry;" > /dev/null 2>&1; then
        mcp_count=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM mcp_registry;" | xargs)
        print_success "PostgreSQL: OK (${mcp_count} MCPs registered)"
    else
        print_warning "PostgreSQL: Not responding"
        test_failures=$((test_failures + 1))
    fi

    echo ""

    # Final status
    if [ $test_failures -eq 0 ]; then
        print_header "✅ Installation Complete!"
        echo ""
        print_success "Crypto MCP Suite is now running!"
        echo ""
        print_info "Quick Start:"
        echo "  • View containers: podman ps"
        echo "  • View logs: podman-compose logs -f"
        echo "  • Stop suite: podman-compose down"
        echo "  • Test MCP: curl http://localhost:3001/health"
        echo ""
        print_info "Documentation:"
        echo "  • README: $INSTALL_DIR/containerized/README.md"
        echo "  • API Docs: $INSTALL_DIR/docs/"
        echo ""
        print_info "Next Steps:"
        echo "  1. Configure API keys in .env file"
        echo "  2. Restart containers: cd $INSTALL_DIR/containerized && podman-compose restart"
        echo "  3. Run tests: cd $INSTALL_DIR && npm test"
        echo ""
    else
        print_warning "Installation completed with $test_failures warnings"
        echo ""
        print_info "Some services may still be starting. Check status in 1-2 minutes:"
        echo "  podman ps"
        echo "  podman-compose logs -f"
        echo ""
        print_info "Troubleshooting: $INSTALL_DIR/containerized/README.md#troubleshooting"
    fi

    print_info "Installation log saved to: $LOG_FILE"
    echo ""
}

# Run main function
main "$@"
