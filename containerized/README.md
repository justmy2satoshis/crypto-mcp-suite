# Crypto MCP Suite - Containerized Installation

**For technical users who prefer reproducible container-based environments**

This containerized installation uses **Podman** (not Docker) to deploy the Crypto MCP Suite with manual database setup for full control.

## Table of Contents

- [Why Containerized Installation?](#why-containerized-installation)
- [Prerequisites (Install These First)](#prerequisites-install-these-first)
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [Starting the Suite](#starting-the-suite)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

---

## Why Containerized Installation?

✅ **Reproducible environments** - Same setup across all platforms
✅ **Full control** - Manual database configuration for custom setups
✅ **Isolation** - MCPs run in isolated containers
✅ **DevOps-friendly** - Perfect for CI/CD and infrastructure-as-code

**Best for:** Technical users, DevOps professionals, development environments

---

## Prerequisites (Install These First)

You **must manually install** the following before running the containerized installer:

### 1. Podman Desktop

Podman is a container engine (Docker alternative) that runs containers without root privileges.

#### macOS Installation
**Download:** https://podman-desktop.io/downloads/macOS

```bash
# Alternative: Install via Homebrew
brew install podman podman-compose
podman machine init
podman machine start
```

**Verify:**
```bash
podman --version
# Should output: podman version 4.x.x or higher
```

#### Linux Installation (Ubuntu/Debian)
**Download:** https://podman-desktop.io/downloads/linux

```bash
# Ubuntu 22.04+
sudo apt update
sudo apt install -y podman podman-compose

# For other distributions:
# Fedora: sudo dnf install podman podman-compose
# Arch: sudo pacman -S podman podman-compose
```

**Verify:**
```bash
podman --version
podman-compose --version
```

#### Windows Installation
**Download:** https://podman-desktop.io/downloads/windows

**Requirements:**
- Windows 10/11 with WSL 2 enabled
- WSL 2 backend configured

**Installation steps:**
1. Download Podman Desktop installer (.exe)
2. Run installer (requires admin privileges)
3. Follow setup wizard
4. Restart computer

**Verify (in PowerShell):**
```powershell
podman --version
```

---

### 2. Redis

Redis is used for caching API responses (60-80% cost reduction).

#### macOS Installation
**Official guide:** https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/

```bash
# Install via Homebrew
brew install redis

# Start Redis service
brew services start redis

# Test connection
redis-cli ping
# Should output: PONG
```

**Alternative: Download standalone binary**
https://github.com/redis/redis/releases (compile from source)

#### Linux Installation (Ubuntu/Debian)
**Official guide:** https://redis.io/docs/getting-started/installation/install-redis-on-linux/

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
# Should output: PONG
```

**Alternative: Install from source**
```bash
wget https://download.redis.io/redis-stable.tar.gz
tar -xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install
```

#### Windows Installation
**Official guide:** https://redis.io/docs/getting-started/installation/install-redis-on-windows/

**Method 1: Redis via WSL 2 (Recommended)**
1. Enable WSL 2
2. Install Ubuntu from Microsoft Store
3. Follow Linux installation steps above in WSL terminal

**Method 2: Windows native (Memurai)**
- Download: https://www.memurai.com/get-memurai
- Redis-compatible Windows build

**Verify:**
```bash
redis-cli ping
# Should output: PONG
```

---

### 3. PostgreSQL 15+

PostgreSQL stores historical analytics and time-series data.

#### macOS Installation
**Official guide:** https://www.postgresql.org/download/macosx/

```bash
# Install via Homebrew (Recommended)
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create default database
createdb crypto_mcp_suite

# Test connection
psql -U $USER -d postgres -c "SELECT version();"
```

**Alternative: Download Postgres.app**
https://postgresapp.com/ (GUI application with PostgreSQL)

#### Linux Installation (Ubuntu/Debian)
**Official guide:** https://www.postgresql.org/download/linux/ubuntu/

```bash
# Ubuntu 22.04+
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE crypto_mcp_suite;
CREATE USER crypto_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE crypto_mcp_suite TO crypto_user;
EOF

# Test connection
psql -U postgres -c "SELECT version();"
```

**Alternative: PostgreSQL Official Repository**
```bash
# Add PostgreSQL APT repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-16
```

#### Windows Installation
**Official download:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

**Installation steps:**
1. Download PostgreSQL 16 installer (.exe)
2. Run installer (requires admin privileges)
3. Follow setup wizard:
   - Set superuser password (remember this!)
   - Port: 5432 (default)
   - Locale: Default
4. Install Stack Builder for additional tools (optional)

**Verify (in Command Prompt):**
```cmd
psql --version
# Should output: psql (PostgreSQL) 16.x
```

**Create database:**
```cmd
psql -U postgres
# Enter password when prompted
CREATE DATABASE crypto_mcp_suite;
CREATE USER crypto_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE crypto_mcp_suite TO crypto_user;
\q
```

---

### 4. TimescaleDB Extension (Optional but Recommended)

TimescaleDB adds time-series optimization to PostgreSQL (10x faster queries for historical data).

#### macOS Installation
**Official guide:** https://docs.timescale.com/install/latest/self-hosted/installation-macos/

```bash
# Add TimescaleDB tap
brew tap timescale/tap
brew install timescaledb

# Configure TimescaleDB
sudo timescaledb-tune --quiet --yes

# Restart PostgreSQL
brew services restart postgresql@16

# Enable extension in database
psql -U $USER -d crypto_mcp_suite -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

#### Linux Installation
**Official guide:** https://docs.timescale.com/install/latest/self-hosted/installation-linux/

```bash
# Ubuntu 22.04+
sudo sh -c "echo 'deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -cs) main' > /etc/apt/sources.list.d/timescaledb.list"
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -
sudo apt update
sudo apt install timescaledb-2-postgresql-16

# Configure TimescaleDB
sudo timescaledb-tune --quiet --yes

# Restart PostgreSQL
sudo systemctl restart postgresql

# Enable extension in database
sudo -u postgres psql -d crypto_mcp_suite -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

#### Windows Installation
**Official guide:** https://docs.timescale.com/install/latest/self-hosted/installation-windows/

TimescaleDB is included in Windows PostgreSQL installers from EDB.

**Enable in database:**
```cmd
psql -U postgres -d crypto_mcp_suite
CREATE EXTENSION IF NOT EXISTS timescaledb;
\q
```

---

## Installation Steps

Once all prerequisites are installed, run the one-line installer:

### Step 1: Download and Run Installer

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/crypto-mcp-suite/main/containerized/install-containerized.sh | bash
```

**What this does:**
1. Clones the repository
2. Copies `.env.example` to `.env`
3. Prompts you to configure API keys
4. Builds Podman containers
5. Initializes databases
6. Starts all MCPs

### Step 2: Verify Prerequisites

The installer will automatically verify:
- ✅ Podman installed and running
- ✅ Redis accessible (localhost:6379)
- ✅ PostgreSQL accessible (localhost:5432)
- ✅ TimescaleDB extension enabled

If any checks fail, you'll see error messages with installation links.

---

## Configuration

### Edit `.env` File

After installation, configure your API keys:

```bash
cd crypto-mcp-suite/containerized
nano .env
```

**Required API Keys (25 MCPs):**

```bash
# Tier S MCPs (10 - Must-have)
COINGECKO_API_KEY=your_coingecko_api_key_here
CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key_here
GLASSNODE_API_KEY=your_glassnode_api_key_here
DUNE_API_KEY=your_dune_api_key_here
NANSEN_API_KEY=your_nansen_api_key_here
MESSARI_API_KEY=your_messari_api_key_here
THEBLOCK_API_KEY=your_theblock_api_key_here
DEFILLAMA_API_KEY=your_defillama_api_key_here
SANTIMENT_API_KEY=your_santiment_api_key_here
CHAINANALYSIS_API_KEY=your_chainanalysis_api_key_here

# Tier A MCPs (10 - Recommended)
KAIKO_API_KEY=your_kaiko_api_key_here
FOOTPRINT_API_KEY=your_footprint_api_key_here
INTOTHEBLOCK_API_KEY=your_intotheblock_api_key_here
COINMETRICS_API_KEY=your_coinmetrics_api_key_here
PARSEC_API_KEY=your_parsec_api_key_here
LUNARCRUSH_API_KEY=your_lunarcrush_api_key_here
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
CRYPTOQUANT_API_KEY=your_cryptoquant_api_key_here
ARKHAM_API_KEY=your_arkham_api_key_here
DEBANK_API_KEY=your_debank_api_key_here

# Tier B MCPs (5 - Optional)
AMBERDATA_API_KEY=your_amberdata_api_key_here
TOKENMETRICS_API_KEY=your_tokenmetrics_api_key_here
SANTIMENT_PRO_API_KEY=your_santiment_pro_api_key_here
MESSARI_PRO_API_KEY=your_messari_pro_api_key_here
GLASSNODE_PRO_API_KEY=your_glassnode_pro_api_key_here

# Database Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=crypto_mcp_suite
POSTGRES_USER=crypto_user
POSTGRES_PASSWORD=your_secure_password_here

# Cache Settings
CACHE_TTL_SECONDS=300
CACHE_MAX_SIZE_MB=512
```

**Where to get API keys:**
- CoinGecko: https://www.coingecko.com/en/api/pricing
- CryptoCompare: https://www.cryptocompare.com/api
- Glassnode: https://studio.glassnode.com/settings/api
- Dune Analytics: https://dune.com/settings/api
- Nansen: https://www.nansen.ai/
- (See `docs/API_KEY_GUIDE.md` for all 25 providers)

---

## Starting the Suite

### Start All Containers

```bash
cd crypto-mcp-suite/containerized
podman-compose up -d
```

**This starts:**
- 25 MCP containers (one per data source)
- Redis container (if not using host Redis)
- PostgreSQL container (if not using host PostgreSQL)

### View Running Containers

```bash
podman ps
```

**Expected output:**
```
CONTAINER ID  IMAGE                          STATUS      PORTS
abc123def456  crypto-mcp-suite-coingecko    Up 2 min    0.0.0.0:3001->3000/tcp
def456abc789  crypto-mcp-suite-glassnode    Up 2 min    0.0.0.0:3002->3000/tcp
...
```

### View Logs

```bash
# All containers
podman-compose logs -f

# Specific MCP
podman-compose logs -f coingecko-mcp
```

---

## Verification

### Test MCP Connectivity

```bash
# Test CoinGecko MCP
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","mcp":"coingecko","version":"0.1.0"}
```

### Test Redis Cache

```bash
redis-cli
> PING
PONG
> GET coingecko:btc:price
> EXIT
```

### Test PostgreSQL

```bash
psql -U crypto_user -d crypto_mcp_suite -c "SELECT * FROM mcp_health_checks LIMIT 10;"
```

### Run Test Suite

```bash
cd crypto-mcp-suite
npm run test:containerized
```

**Expected output:**
```
✅ All 25 MCPs responding
✅ Redis cache operational (80% hit rate)
✅ PostgreSQL time-series queries under 50ms
✅ API rate limiting working
```

---

## Troubleshooting

### Podman Issues

**Problem:** `podman: command not found`
**Solution:** Reinstall Podman Desktop from https://podman-desktop.io/downloads

**Problem:** `podman machine is not running`
**Solution:**
```bash
podman machine start
```

**Problem:** `permission denied while trying to connect to the Podman socket`
**Solution:**
```bash
# Linux only
sudo usermod -aG podman $USER
newgrp podman
```

### Redis Issues

**Problem:** `Could not connect to Redis at 127.0.0.1:6379`
**Solution:**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Check if Redis is running
redis-cli ping
```

**Problem:** `Redis is running but MCPs can't connect`
**Solution:** Check firewall settings, ensure port 6379 is open:
```bash
# Linux
sudo ufw allow 6379
```

### PostgreSQL Issues

**Problem:** `psql: could not connect to server`
**Solution:**
```bash
# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql

# Verify PostgreSQL is listening
sudo netstat -plnt | grep 5432
```

**Problem:** `database "crypto_mcp_suite" does not exist`
**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE crypto_mcp_suite;"
```

**Problem:** `TimescaleDB extension not found`
**Solution:**
```bash
# Install TimescaleDB (see Prerequisites section)
# Then enable in database:
psql -U postgres -d crypto_mcp_suite -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

### MCP Container Issues

**Problem:** Container fails to start
**Solution:**
```bash
# View container logs
podman-compose logs coingecko-mcp

# Rebuild container
podman-compose build --no-cache coingecko-mcp
podman-compose up -d coingecko-mcp
```

**Problem:** API key errors in logs
**Solution:** Check `.env` file, ensure all required keys are set:
```bash
grep "API_KEY" .env | grep -v "^#"
```

### Performance Issues

**Problem:** Slow API responses
**Solution:**
1. Check Redis cache hit rate: `redis-cli INFO stats | grep hit_rate`
2. Increase cache TTL in `.env`: `CACHE_TTL_SECONDS=600`
3. Allocate more memory to Redis: `CACHE_MAX_SIZE_MB=1024`

**Problem:** High memory usage
**Solution:**
```bash
# Check container resource usage
podman stats

# Limit container memory in docker-compose.yml:
services:
  coingecko-mcp:
    mem_limit: 256m
```

---

## Uninstallation

### Stop All Containers

```bash
cd crypto-mcp-suite/containerized
podman-compose down
```

### Remove Containers and Images

```bash
# Remove containers
podman-compose down -v

# Remove images
podman rmi $(podman images | grep crypto-mcp-suite | awk '{print $3}')

# Remove volumes (WARNING: Deletes all data!)
podman volume prune -f
```

### Optional: Remove Databases

**Remove PostgreSQL database:**
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS crypto_mcp_suite;"
```

**Clear Redis cache:**
```bash
redis-cli FLUSHALL
```

### Optional: Uninstall Prerequisites

**Remove Podman:**
```bash
# macOS
brew uninstall podman podman-compose

# Linux
sudo apt remove podman podman-compose
```

**Remove Redis:**
```bash
# macOS
brew uninstall redis

# Linux
sudo apt remove redis-server
```

**Remove PostgreSQL:**
```bash
# macOS
brew uninstall postgresql@16

# Linux
sudo apt remove postgresql-16
```

---

## Additional Resources

- **Main Documentation:** `../docs/README.md`
- **API Key Guide:** `../docs/API_KEY_GUIDE.md`
- **Architecture Overview:** `../docs/ARCHITECTURE_DIAGRAMS.md`
- **Performance Benchmarks:** `../docs/PERFORMANCE_BENCHMARK_PLAN.md`
- **Database Schemas:** `../docs/DATABASE_REQUIREMENTS.md`

---

## Support

- **GitHub Issues:** https://github.com/YOUR_USERNAME/crypto-mcp-suite/issues
- **Documentation:** https://github.com/YOUR_USERNAME/crypto-mcp-suite/tree/main/docs
- **Discord Community:** https://discord.gg/YOUR_DISCORD_INVITE

---

## License

MIT License - See `../LICENSE` for details.
