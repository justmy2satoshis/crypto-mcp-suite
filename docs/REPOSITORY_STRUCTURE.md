# Repository Structure Design
**Crypto MCP Suite Infrastructure Design - Phase 5**

**Date**: October 1, 2025
**Project**: Crypto MCP Suite Infrastructure Design
**Phase**: 5 of 7 - Repository Structure Design
**Status**: ✅ COMPLETE

---

## Executive Summary

This document defines the **final repository structure** for the Crypto MCP Suite, documenting the architectural decision to use a **hybrid monorepo approach** that balances code sharing, dependency isolation, and maintainability for 25 production MCPs.

### Key Architectural Decisions

**Repository Strategy**: **Hybrid Monorepo** (single repository, isolated workspaces)

**Rationale**:
- ✅ **Code Sharing**: Shared utilities (Redis client, logger, metrics) without duplication
- ✅ **Atomic Changes**: Update multiple MCPs in a single commit (breaking API changes)
- ✅ **Dependency Isolation**: Each MCP has independent `node_modules`/`venv`
- ✅ **Unified Versioning**: Single version number for the entire suite
- ✅ **Simplified CI/CD**: One GitHub Actions workflow, one Docker build
- ❌ **NOT Multi-Repo**: Kukapay uses 63 separate repos (maintenance nightmare for forks)

### Repository Layout

```
crypto-mcp-suite/                          # Root monorepo
├── packages/
│   ├── mcps/                              # 25 MCP implementations
│   │   ├── jupiter-mcp/                   # Solana DEX (Tier S)
│   │   ├── uniswap-trader-mcp/            # EVM DEX (Tier S)
│   │   ├── crypto-indicators-mcp/         # Technical analysis (Tier S)
│   │   ├── ... (22 more MCPs)
│   ├── shared/                            # Shared utilities
│   │   ├── core/                          # Core MCP framework utilities
│   │   ├── database/                      # Redis/PostgreSQL clients
│   │   ├── monitoring/                    # Prometheus metrics
│   │   └── utils/                         # Common helpers
│   └── cli/                               # Installer CLI tool
├── configs/                               # Configuration files
│   ├── redis.conf
│   ├── postgres/
│   └── mcps.json                          # MCP registry
├── scripts/                               # Automation scripts
│   ├── install.sh
│   ├── test-all.sh
│   └── deploy.sh
├── docs/                                  # Documentation
│   ├── architecture/
│   ├── mcps/                              # Per-MCP documentation
│   └── guides/
├── .github/
│   └── workflows/                         # CI/CD pipelines
├── package.json                           # Root package manager (npm workspaces)
├── lerna.json                             # Monorepo management (Lerna)
└── README.md
```

### Dependency Management Strategy

**JavaScript MCPs**: npm workspaces + Lerna for versioning
**Python MCPs**: Virtual environments (venv) per MCP + shared poetry workspace
**Shared Libraries**: Hoisted to root `node_modules` (npm workspaces)
**Database Clients**: Singleton patterns with connection pooling

### Version Management

**Versioning Scheme**: Semantic versioning (SemVer) for entire suite
- Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- **MAJOR**: Breaking changes to shared APIs
- **MINOR**: New MCPs or features (backward compatible)
- **PATCH**: Bug fixes, performance improvements

**Independent MCP Versions**: Each MCP tracks its own version in metadata
- Example: `crypto-mcp-suite@1.2.0` contains `jupiter-mcp@1.5.0`

---

## Table of Contents

1. [Monorepo vs Multi-Repo Analysis](#monorepo-vs-multi-repo-analysis)
2. [Final Repository Structure](#final-repository-structure)
3. [Dependency Management](#dependency-management)
4. [Shared Utilities Architecture](#shared-utilities-architecture)
5. [Version Control Strategy](#version-control-strategy)
6. [Build & Deployment Pipelines](#build--deployment-pipelines)
7. [Code Organization Patterns](#code-organization-patterns)
8. [Testing Strategy](#testing-strategy)
9. [Documentation Structure](#documentation-structure)
10. [Migration Path from Kukapay](#migration-path-from-kukapay)

---

## Monorepo vs Multi-Repo Analysis

### Decision Matrix

| Criterion | Multi-Repo (Kukapay Style) | Monorepo (Recommended) | Winner |
|-----------|----------------------------|------------------------|--------|
| **Code Sharing** | ❌ Copy-paste across 63 repos | ✅ Shared utilities package | **Monorepo** |
| **Atomic Changes** | ❌ Coordinated PRs across repos | ✅ Single commit updates multiple MCPs | **Monorepo** |
| **Dependency Management** | ⚠️ Version drift across repos | ✅ Unified lockfiles | **Monorepo** |
| **CI/CD Complexity** | ❌ 63 separate workflows | ✅ Single unified workflow | **Monorepo** |
| **Versioning** | ⚠️ Independent versions (confusing) | ✅ Unified version (clear) | **Monorepo** |
| **Clone Size** | ✅ Small (clone 1 repo) | ⚠️ Large (~500 MB) | **Multi-Repo** |
| **Team Autonomy** | ✅ Independent teams per MCP | ⚠️ Shared ownership | **Multi-Repo** |
| **Discovery** | ❌ Hard to find all MCPs | ✅ Single README lists all | **Monorepo** |
| **Testing** | ❌ Manual cross-repo testing | ✅ Integrated test suite | **Monorepo** |
| **Documentation** | ❌ Scattered across repos | ✅ Centralized docs/ | **Monorepo** |

**Score**: Monorepo wins 8/10 categories

### Detailed Analysis

#### Multi-Repo (Kukapay Approach)

**How Kukapay Structures 63 MCPs**:
```
GitHub Organization: kukapay
├── github.com/kukapay/jupiter-mcp
├── github.com/kukapay/uniswap-trader-mcp
├── github.com/kukapay/crypto-indicators-mcp
├── ... (60 more repositories)
```

**Advantages**:
1. ✅ **Small clone size**: Each repo is 5-50 MB
2. ✅ **Independent releases**: Update `jupiter-mcp` without affecting others
3. ✅ **Team autonomy**: Different teams can own different MCPs
4. ✅ **Selective installation**: Users install only what they need

**Disadvantages**:
1. ❌ **Code duplication**: Logging, metrics, database clients copied 63 times
2. ❌ **Version drift**: `jupiter-mcp` uses `@modelcontextprotocol/sdk@1.7`, `uniswap-trader-mcp` uses `@1.10`
3. ❌ **Breaking changes**: Updating shared SDK requires 63 PRs
4. ❌ **Discovery**: Users must navigate 63 repos to find functionality
5. ❌ **Testing**: No integrated test suite, manual cross-MCP testing
6. ❌ **Documentation**: Scattered README files, no central docs

**Verdict**: Multi-repo works for **open-source contributors** (many independent developers) but NOT for **enterprise deployment** (single team maintaining a curated suite).

---

#### Monorepo (Recommended Approach)

**Structure**:
```
github.com/your-org/crypto-mcp-suite
└── Single repository containing all 25 MCPs
```

**Advantages**:
1. ✅ **Code sharing**: Single `@crypto-mcp-suite/shared` package used by all MCPs
2. ✅ **Atomic changes**: Update SDK version in 1 commit (affects all MCPs)
3. ✅ **Unified versioning**: `crypto-mcp-suite@1.2.0` is clear release version
4. ✅ **Integrated testing**: `npm test` runs tests for all 25 MCPs
5. ✅ **Centralized docs**: Single `docs/` folder with architecture guides
6. ✅ **CI/CD simplicity**: One GitHub Actions workflow, one Docker build
7. ✅ **Dependency management**: Single `package-lock.json` (no version drift)
8. ✅ **Discoverability**: Single README lists all 25 MCPs

**Disadvantages**:
1. ⚠️ **Large clone size**: ~500 MB (25 MCPs × 20 MB avg)
2. ⚠️ **Shared ownership**: All developers have access to all MCPs
3. ⚠️ **CI/CD runtime**: Testing all MCPs takes longer (~5-10 minutes)

**Mitigations**:
- **Clone size**: Use Git sparse checkout for large repos
- **Shared ownership**: Use CODEOWNERS file to assign MCP maintainers
- **CI runtime**: Parallelize tests, use caching

**Verdict**: Monorepo is optimal for **enterprise deployment** with a **single team** maintaining **25 curated MCPs**.

---

### Hybrid Approach: Monorepo with Independent Workspaces

**Best of Both Worlds**:
- ✅ Single repository (monorepo)
- ✅ Independent `node_modules` per MCP (isolation)
- ✅ Shared utilities via npm workspaces
- ✅ Individual MCP versions tracked in metadata

**Implementation**: npm workspaces (Node.js) + Poetry workspaces (Python)

**Example `package.json`** (root):
```json
{
  "name": "crypto-mcp-suite",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/mcps/*",
    "packages/shared/*",
    "packages/cli"
  ],
  "scripts": {
    "install:all": "npm install",
    "test:all": "npm test --workspaces",
    "build:all": "npm run build --workspaces"
  }
}
```

**How It Works**:
1. Each MCP is a workspace (e.g., `packages/mcps/jupiter-mcp`)
2. Shared utilities are in `packages/shared/core`
3. MCPs import shared utilities: `import { logger } from '@crypto-mcp-suite/shared';`
4. npm hoists common dependencies to root `node_modules`
5. MCP-specific dependencies stay in `packages/mcps/jupiter-mcp/node_modules`

**Result**: Code sharing WITHOUT dependency conflicts

---

## Final Repository Structure

### Directory Tree

```
crypto-mcp-suite/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          # CI/CD pipeline
│   │   ├── release.yml                     # Automated releases
│   │   └── security.yml                    # Dependency scanning
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── CODEOWNERS                          # MCP maintainer assignments
│
├── packages/
│   ├── mcps/                               # 25 MCP implementations
│   │   ├── jupiter-mcp/                    # Tier S: Solana DEX
│   │   │   ├── src/
│   │   │   │   ├── index.ts                # MCP entry point
│   │   │   │   ├── handlers/               # Tool handlers
│   │   │   │   │   ├── get-price.ts
│   │   │   │   │   ├── swap.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── services/               # Business logic
│   │   │   │   │   ├── jupiter-api.ts
│   │   │   │   │   └── solana-client.ts
│   │   │   │   └── types/                  # TypeScript types
│   │   │   │       └── jupiter.ts
│   │   │   ├── tests/
│   │   │   │   ├── unit/
│   │   │   │   └── integration/
│   │   │   ├── package.json                # MCP-specific dependencies
│   │   │   ├── tsconfig.json
│   │   │   └── README.md                   # MCP documentation
│   │   │
│   │   ├── uniswap-trader-mcp/             # Tier S: EVM DEX
│   │   │   ├── src/
│   │   │   ├── tests/
│   │   │   ├── Dockerfile                  # MCP-specific Docker
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   │
│   │   ├── crypto-indicators-mcp/          # Tier S: Technical analysis
│   │   │   └── ... (same structure)
│   │   │
│   │   ├── crypto-sentiment-mcp/           # Tier S: Santiment (Python)
│   │   │   ├── src/
│   │   │   │   ├── main.py                 # FastMCP entry point
│   │   │   │   ├── handlers/
│   │   │   │   ├── services/
│   │   │   │   └── types/
│   │   │   ├── tests/
│   │   │   ├── requirements.txt            # Python dependencies
│   │   │   ├── pyproject.toml              # Poetry config
│   │   │   └── README.md
│   │   │
│   │   ├── ... (21 more MCPs)
│   │   │
│   │   └── README.md                       # MCP catalog
│   │
│   ├── shared/                             # Shared utilities
│   │   ├── core/                           # Core MCP utilities
│   │   │   ├── src/
│   │   │   │   ├── logger.ts               # Unified logging
│   │   │   │   ├── metrics.ts              # Prometheus metrics
│   │   │   │   ├── errors.ts               # Error classes
│   │   │   │   ├── config.ts               # Configuration loader
│   │   │   │   └── index.ts                # Public exports
│   │   │   ├── tests/
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   │
│   │   ├── database/                       # Database clients
│   │   │   ├── src/
│   │   │   │   ├── redis.ts                # Redis client (singleton)
│   │   │   │   ├── postgres.ts             # PostgreSQL client
│   │   │   │   ├── sqlite.ts               # SQLite fallback
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   └── package.json
│   │   │
│   │   ├── monitoring/                     # Observability
│   │   │   ├── src/
│   │   │   │   ├── prometheus.ts           # Metrics exporter
│   │   │   │   ├── health-check.ts         # Health endpoints
│   │   │   │   └── index.ts
│   │   │   └── package.json
│   │   │
│   │   └── utils/                          # Common helpers
│   │       ├── src/
│   │       │   ├── cache.ts                # Caching utilities
│   │       │   ├── rate-limit.ts           # Rate limiting
│   │       │   ├── retry.ts                # Retry logic
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   └── cli/                                # Installer CLI
│       ├── src/
│       │   ├── commands/
│       │   │   ├── install.ts
│       │   │   ├── start.ts
│       │   │   ├── stop.ts
│       │   │   ├── status.ts
│       │   │   └── test.ts
│       │   ├── lib/
│       │   │   ├── installer.ts
│       │   │   ├── health-checker.ts
│       │   │   └── platform-detector.ts
│       │   └── index.ts
│       ├── bin/
│       │   └── crypto-mcp                  # CLI executable
│       ├── tests/
│       ├── package.json
│       └── README.md
│
├── configs/                                # Configuration files
│   ├── redis.conf                          # Redis production config
│   ├── postgres/
│   │   ├── postgresql.conf
│   │   └── pg_hba.conf
│   ├── mcps.json                           # MCP registry
│   ├── .env.example                        # Environment template
│   └── docker-compose.yml                  # Docker orchestration
│
├── scripts/                                # Automation scripts
│   ├── install.sh                          # Installation script
│   ├── setup-dev.sh                        # Dev environment setup
│   ├── test-all.sh                         # Run all tests
│   ├── lint-all.sh                         # Linting
│   ├── deploy.sh                           # Production deployment
│   ├── backup-db.sh                        # Database backups
│   └── migrate-from-kukapay.sh             # Migration from Kukapay repos
│
├── docs/                                   # Documentation
│   ├── architecture/
│   │   ├── OVERVIEW.md
│   │   ├── DATABASE_DESIGN.md
│   │   ├── API_DESIGN.md
│   │   └── SECURITY.md
│   ├── mcps/                               # Per-MCP detailed docs
│   │   ├── jupiter-mcp.md
│   │   ├── uniswap-trader-mcp.md
│   │   └── ... (25 MCP docs)
│   ├── guides/
│   │   ├── INSTALLATION.md
│   │   ├── CONFIGURATION.md
│   │   ├── TROUBLESHOOTING.md
│   │   └── CONTRIBUTING.md
│   └── api/                                # API reference
│       └── openapi.yml                     # OpenAPI spec
│
├── infra/                                  # Infrastructure as code
│   ├── terraform/                          # AWS/GCP deployment
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── kubernetes/                         # K8s manifests
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   └── ingress.yml
│   └── monitoring/
│       ├── prometheus.yml
│       └── grafana-dashboards/
│
├── .vscode/                                # VS Code settings
│   ├── settings.json
│   ├── launch.json                         # Debug configurations
│   └── extensions.json                     # Recommended extensions
│
├── .gitignore
├── .eslintrc.js                            # Linting rules
├── .prettierrc                             # Code formatting
├── tsconfig.json                           # Root TypeScript config
├── package.json                            # Root package.json (workspaces)
├── package-lock.json                       # Lockfile
├── lerna.json                              # Monorepo management
├── LICENSE                                 # MIT license
└── README.md                               # Main documentation
```

**Directory Count**: ~50 top-level directories
**File Count**: ~500-1,000 files (25 MCPs × 20-40 files each)
**Repository Size**: ~500 MB (including node_modules, git history)

---

## Dependency Management

### Strategy Overview

**Goal**: Balance **code sharing** (reduce duplication) with **dependency isolation** (prevent conflicts).

**Tools**:
- **JavaScript**: npm workspaces + Lerna
- **Python**: Poetry workspaces + virtual environments
- **Databases**: Singleton clients in shared packages

### npm Workspaces Architecture

#### Root `package.json`

```json
{
  "name": "crypto-mcp-suite",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/mcps/*",
    "packages/shared/*",
    "packages/cli"
  ],
  "scripts": {
    "install": "npm install",
    "build": "npm run build --workspaces --if-present",
    "test": "npm test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "clean": "npm run clean --workspaces --if-present && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "lerna": "^8.0.0"
  }
}
```

**Key Features**:
- `workspaces`: Defines paths to workspace packages
- `--workspaces`: Runs scripts in all workspaces
- `devDependencies`: Shared dev tools (TypeScript, ESLint, Jest)

#### MCP `package.json` Example

```json
{
  "name": "@crypto-mcp-suite/jupiter-mcp",
  "version": "1.5.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsx watch src/index.ts",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "@modelcontextprotocol/sdk": "^1.10.0",
    "zod": "^3.22.4",
    "@crypto-mcp-suite/shared-core": "workspace:*",
    "@crypto-mcp-suite/shared-database": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "workspace:*",
    "typescript": "workspace:*",
    "jest": "workspace:*"
  }
}
```

**Key Features**:
- `@crypto-mcp-suite/jupiter-mcp`: Scoped package name
- `workspace:*`: Uses version from root workspace
- `@crypto-mcp-suite/shared-core`: Internal dependency (shared package)

#### Shared Package `package.json` Example

```json
{
  "name": "@crypto-mcp-suite/shared-core",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "pino": "^8.17.2",
    "pino-pretty": "^10.3.1",
    "dotenv": "^16.3.1"
  },
  "peerDependencies": {
    "@modelcontextprotocol/sdk": "^1.10.0"
  }
}
```

**Key Features**:
- `private: true`: Not published to npm registry
- `peerDependencies`: Required by consuming MCPs (avoids duplication)

### Dependency Hoisting

**How npm Workspaces Hoists Dependencies**:

```
Before Hoisting (Independent Repos):
jupiter-mcp/
└── node_modules/
    ├── @solana/web3.js/
    ├── zod@3.22.4/
    └── pino@8.17.2/

uniswap-trader-mcp/
└── node_modules/
    ├── ethers@6.9.0/
    ├── zod@3.22.4/          ← DUPLICATE
    └── pino@8.17.2/         ← DUPLICATE

Total: 200 MB (2× duplication)

After Hoisting (Monorepo):
crypto-mcp-suite/
├── node_modules/              ← ROOT
│   ├── zod@3.22.4/            ← SHARED (hoisted)
│   └── pino@8.17.2/           ← SHARED (hoisted)
├── packages/mcps/jupiter-mcp/
│   └── node_modules/
│       └── @solana/web3.js/   ← MCP-SPECIFIC
└── packages/mcps/uniswap-trader-mcp/
    └── node_modules/
        └── ethers@6.9.0/      ← MCP-SPECIFIC

Total: 120 MB (40% reduction via hoisting)
```

**Rules**:
- Common dependencies (same version across MCPs) → Hoisted to root
- MCP-specific dependencies → Kept in MCP's `node_modules`
- Version conflicts → Both versions installed (one in root, one in MCP)

### Python Dependency Management

**Challenge**: Python doesn't have built-in workspace support like npm

**Solution**: Poetry workspaces + virtual environments per MCP

#### Root `pyproject.toml`

```toml
[tool.poetry]
name = "crypto-mcp-suite"
version = "1.0.0"
description = "Crypto MCP Suite - Python MCPs"
authors = ["Your Team"]

[tool.poetry.dependencies]
python = "^3.10"
# Shared dependencies (used by multiple Python MCPs)
httpx = "^0.25.2"
pydantic = "^2.5.3"
fastmcp = "^1.3.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
black = "^23.12.1"
mypy = "^1.8.0"
ruff = "^0.1.9"

[tool.poetry.workspace]
# Define workspace members (Python MCPs)
members = [
    "packages/mcps/crypto-sentiment-mcp",
    "packages/mcps/whale-tracker-mcp",
    "packages/mcps/memecoin-radar-mcp"
]
```

#### MCP `pyproject.toml` Example

```toml
[tool.poetry]
name = "crypto-sentiment-mcp"
version = "1.2.0"
description = "Santiment social sentiment analysis"

[tool.poetry.dependencies]
python = "^3.10"
fastmcp = "^1.3.0"            # Inherited from root
httpx = "^0.25.2"             # Inherited from root
tabulate = "^0.9.0"           # MCP-specific

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"             # Inherited from root
```

**Installation Process**:
```bash
# Install shared Python dependencies (root)
poetry install

# Install MCP-specific dependencies (create venv per MCP)
cd packages/mcps/crypto-sentiment-mcp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Result**: Shared Python packages installed once at root, MCP-specific packages in isolated `venv`.

---

## Shared Utilities Architecture

### Design Principles

1. **DRY (Don't Repeat Yourself)**: Common code in shared packages
2. **Loose Coupling**: Shared utilities don't depend on MCPs
3. **Strict Versioning**: Breaking changes to shared packages = MAJOR version bump
4. **Minimal API Surface**: Only expose what's necessary

### Shared Packages

#### 1. `@crypto-mcp-suite/shared-core`

**Purpose**: Core MCP framework utilities (logging, metrics, errors, config)

**Exports**:
```typescript
// packages/shared/core/src/index.ts
export { logger, createLogger } from './logger';
export { metrics, Metrics } from './metrics';
export { AppError, ValidationError, APIError } from './errors';
export { loadConfig, Config } from './config';
export { retry, RetryOptions } from './retry';
```

**Usage in MCP**:
```typescript
// packages/mcps/jupiter-mcp/src/index.ts
import { logger, metrics, AppError } from '@crypto-mcp-suite/shared-core';

const log = logger.child({ mcp: 'jupiter-mcp' });

export async function getPrice(token: string) {
  const timer = metrics.startTimer('jupiter_api_latency');
  try {
    log.info({ token }, 'Fetching price from Jupiter API');
    const price = await jupiterAPI.getPrice(token);
    timer.end({ status: 'success' });
    return price;
  } catch (error) {
    timer.end({ status: 'error' });
    throw new APIError('Jupiter API failed', { cause: error });
  }
}
```

**Implementation**: `packages/shared/core/src/logger.ts`

```typescript
import pino from 'pino';

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

export { logger };

export function createLogger(name: string) {
  return logger.child({ mcp: name });
}
```

---

#### 2. `@crypto-mcp-suite/shared-database`

**Purpose**: Database clients (Redis, PostgreSQL, SQLite)

**Exports**:
```typescript
// packages/shared/database/src/index.ts
export { getRedisClient, RedisClient } from './redis';
export { getPostgresClient, PostgresClient } from './postgres';
export { getSQLiteClient, SQLiteClient } from './sqlite';
```

**Usage in MCP**:
```typescript
// packages/mcps/crypto-sentiment-mcp/src/index.ts
import { getRedisClient } from '@crypto-mcp-suite/shared-database';

export async function getSentiment(token: string) {
  const redis = await getRedisClient();

  // Try cache first
  const cached = await redis.get(`sentiment:${token}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from Santiment API
  const sentiment = await santimentAPI.getSentiment(token);

  // Cache for 5 minutes
  await redis.setex(`sentiment:${token}`, 300, JSON.stringify(sentiment));

  return sentiment;
}
```

**Implementation**: `packages/shared/database/src/redis.ts`

```typescript
import Redis from 'ioredis';
import { logger } from '@crypto-mcp-suite/shared-core';

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient; // Singleton pattern
  }

  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  });

  redisClient.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  return redisClient;
}

export type RedisClient = Redis;
```

**Key Feature**: Singleton pattern ensures only 1 Redis connection across all MCPs.

---

#### 3. `@crypto-mcp-suite/shared-monitoring`

**Purpose**: Prometheus metrics and health checks

**Exports**:
```typescript
// packages/shared/monitoring/src/index.ts
export { metrics, recordMetric } from './prometheus';
export { healthCheck, HealthStatus } from './health-check';
export { startMetricsServer } from './metrics-server';
```

**Usage in MCP**:
```typescript
// packages/mcps/uniswap-trader-mcp/src/index.ts
import { metrics } from '@crypto-mcp-suite/shared-monitoring';

export async function executeTrade(params: TradeParams) {
  const timer = metrics.startTimer('uniswap_trade_duration');

  try {
    const result = await uniswapSDK.trade(params);
    timer.end({ status: 'success', chain: params.chain });
    metrics.increment('uniswap_trades_total', { status: 'success' });
    return result;
  } catch (error) {
    timer.end({ status: 'error', chain: params.chain });
    metrics.increment('uniswap_trades_total', { status: 'error' });
    throw error;
  }
}
```

**Implementation**: `packages/shared/monitoring/src/prometheus.ts`

```typescript
import client from 'prom-client';

// Create default metrics registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const apiLatency = new client.Histogram({
  name: 'api_latency_seconds',
  help: 'External API call latency',
  labelNames: ['mcp', 'api', 'status'],
  registers: [register],
});

const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['mcp', 'cache_type'],
  registers: [register],
});

export const metrics = {
  startTimer: (metricName: string) => {
    return apiLatency.startTimer();
  },
  increment: (metricName: string, labels: Record<string, string>) => {
    cacheHits.inc(labels);
  },
  getMetrics: () => register.metrics(),
};
```

---

#### 4. `@crypto-mcp-suite/shared-utils`

**Purpose**: Common utility functions (caching, rate limiting, retry logic)

**Exports**:
```typescript
// packages/shared/utils/src/index.ts
export { createCache, Cache } from './cache';
export { createRateLimiter, RateLimiter } from './rate-limit';
export { retry, RetryOptions } from './retry';
export { sleep } from './helpers';
```

**Usage in MCP**:
```typescript
// packages/mcps/whale-tracker-mcp/src/index.ts
import { createRateLimiter, retry } from '@crypto-mcp-suite/shared-utils';

const rateLimiter = createRateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60000, // per minute
});

export async function getWhaleTransactions() {
  await rateLimiter.check(); // Throws if rate limit exceeded

  return retry(
    async () => {
      const response = await fetch('https://api.whale-alert.io/v1/transactions');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return response.json();
    },
    {
      retries: 3,
      delay: 1000,
      backoff: 2,
    }
  );
}
```

**Implementation**: `packages/shared/utils/src/retry.ts`

```typescript
export interface RetryOptions {
  retries: number;
  delay: number;
  backoff?: number; // Exponential backoff multiplier
  onRetry?: (error: Error, attempt: number) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { retries, delay, backoff = 1, onRetry } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error; // Final attempt failed
      }

      const waitTime = delay * Math.pow(backoff, attempt);
      onRetry?.(error as Error, attempt + 1);
      await sleep(waitTime);
    }
  }

  throw new Error('Retry failed');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

### Shared Package Versioning

**Versioning Strategy**: Shared packages use semantic versioning

**Breaking Change Example**:
```typescript
// Before (v1.0.0): packages/shared/core/src/logger.ts
export const logger = pino({ level: 'info' });

// After (v2.0.0): BREAKING CHANGE
export function createLogger(options: LoggerOptions) {
  return pino(options);
}
// ❌ Breaking: Direct `logger` export removed
```

**Impact**: All 25 MCPs must update imports
```typescript
// Before
import { logger } from '@crypto-mcp-suite/shared-core';

// After
import { createLogger } from '@crypto-mcp-suite/shared-core';
const logger = createLogger({ level: 'info', mcp: 'jupiter-mcp' });
```

**Version Bump**: `@crypto-mcp-suite/shared-core@1.0.0` → `@crypto-mcp-suite/shared-core@2.0.0`

**Monorepo Advantage**: Update all 25 MCPs in a single commit
```bash
git commit -m "feat!: migrate to createLogger API (breaking change)

BREAKING CHANGE: logger export removed, use createLogger() instead

Updated all 25 MCPs to use createLogger API."
```

---

## Version Control Strategy

### Branching Model

**Strategy**: GitHub Flow (simplified Git Flow for continuous deployment)

**Branches**:
- `main`: Production-ready code (protected)
- `develop`: Integration branch for features (optional)
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches
- `release/*`: Release preparation branches

**Workflow**:
```
1. Create feature branch from main
   git checkout -b feature/add-chainlink-price-feeds

2. Develop feature
   git commit -m "feat(price-feeds): add Chainlink integration"

3. Open pull request to main
   PR title: "feat: Add Chainlink price feeds MCP"

4. CI/CD runs tests
   - Unit tests (all 25 MCPs)
   - Integration tests
   - Linting
   - Security scans

5. Code review
   Reviewer: Approve or request changes

6. Merge to main
   git merge feature/add-chainlink-price-feeds

7. Automated release
   GitHub Actions creates git tag v1.3.0
```

### Commit Message Convention

**Format**: Conventional Commits (https://www.conventionalcommits.org/)

**Structure**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build, dependencies, tooling

**Scopes** (MCP names):
- `jupiter`: jupiter-mcp
- `uniswap`: uniswap-trader-mcp
- `shared-core`: Shared core utilities
- `cli`: CLI tool
- `*`: Multiple MCPs

**Examples**:
```
feat(jupiter): add slippage tolerance configuration

Adds `slippageTolerance` parameter to swap() function.
Default: 0.5%, range: 0.1%-5%

Closes #123

---

fix(uniswap): fix gas estimation for Arbitrum

Gas estimation was 2x too low on Arbitrum due to L2 gas calculation bug.
Fixed by using Arbitrum-specific gas oracle.

Fixes #456

---

feat(shared-core)!: migrate to structured logging

BREAKING CHANGE: `logger.log()` removed, use `logger.info()` instead

Updated all 25 MCPs to use structured logging with pino.

---

chore(deps): upgrade @modelcontextprotocol/sdk to v1.11.0

Updates SDK across all JavaScript MCPs.
No breaking changes, backward compatible.
```

### Semantic Versioning

**Version Format**: `MAJOR.MINOR.PATCH`

**Rules**:
- **MAJOR**: Breaking changes (e.g., API changes, removed features)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

**Examples**:
```
1.0.0 → 1.1.0: Added memecoin-radar-mcp (new feature, backward compatible)
1.1.0 → 1.1.1: Fixed whale-tracker-mcp cache bug (bug fix)
1.1.1 → 2.0.0: Removed deprecated logger API (BREAKING CHANGE)
```

**Automated Versioning**: Lerna handles version bumps based on commit messages

```bash
# Bump version based on conventional commits
npx lerna version --conventional-commits

# Output:
# Changes:
#  - crypto-mcp-suite: 1.1.0 => 1.2.0 (minor)
#  - @crypto-mcp-suite/jupiter-mcp: 1.5.0 => 1.6.0 (minor)
#  - @crypto-mcp-suite/shared-core: 1.0.0 => 1.1.0 (minor)
```

### Tagging Strategy

**Git Tags**: Created automatically by Lerna on version bumps

**Tag Format**: `v<MAJOR>.<MINOR>.<PATCH>`

**Examples**:
```
v1.0.0: Initial release
v1.1.0: Added memecoin radar
v1.2.0: Added Aave lending MCP
v2.0.0: Breaking API changes
```

**Release Notes**: Auto-generated from commit messages

```markdown
# v1.2.0 (2025-10-15)

## Features
- **jupiter**: add slippage tolerance configuration (#123)
- **aave**: add DeFi lending MCP (#234)
- **shared-core**: add retry utility (#345)

## Bug Fixes
- **uniswap**: fix Arbitrum gas estimation (#456)
- **whale-tracker**: fix cache invalidation (#567)

## Breaking Changes
- None
```

---

## Build & Deployment Pipelines

### CI/CD Architecture

**Platform**: GitHub Actions

**Pipelines**:
1. **CI (Continuous Integration)**: Run on every PR
2. **Release**: Run on merge to main
3. **Security Scan**: Run daily

### CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  # Job 1: Install dependencies
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

  # Job 2: Lint all MCPs
  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Restore cache
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

      - name: Lint JavaScript MCPs
        run: npm run lint --workspaces --if-present

      - name: Lint Python MCPs
        run: |
          pip install ruff
          ruff check packages/mcps/crypto-sentiment-mcp
          ruff check packages/mcps/whale-tracker-mcp
          ruff check packages/mcps/memecoin-radar-mcp

  # Job 3: Type checking
  typecheck:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Restore cache
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

      - name: TypeScript type checking
        run: npx tsc --noEmit --project tsconfig.json

  # Job 4: Unit tests (parallel for each MCP)
  test:
    needs: install
    runs-on: ubuntu-latest
    strategy:
      matrix:
        mcp:
          - jupiter-mcp
          - uniswap-trader-mcp
          - crypto-indicators-mcp
          - crypto-sentiment-mcp
          - whale-tracker-mcp
          # ... (25 MCPs total)
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Restore cache
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

      - name: Run unit tests for ${{ matrix.mcp }}
        run: npm test --workspace=packages/mcps/${{ matrix.mcp }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/mcps/${{ matrix.mcp }}/coverage/lcov.info
          flags: ${{ matrix.mcp }}

  # Job 5: Integration tests (requires databases)
  integration:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

      postgres:
        image: timescale/timescaledb:latest-pg15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: crypto_mcp_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        env:
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          POSTGRES_HOST: localhost
          POSTGRES_PORT: 5432
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: test
          POSTGRES_DB: crypto_mcp_test
        run: npm run test:integration

  # Job 6: Build all MCPs
  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build all MCPs
        run: npm run build --workspaces --if-present

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            packages/mcps/*/dist
            packages/shared/*/dist
```

**Pipeline Duration**: ~8-12 minutes (parallelized tests)

---

### Release Pipeline (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetch all history for changelog generation

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build all packages
        run: npm run build --workspaces --if-present

      - name: Run tests
        run: npm test --workspaces --if-present

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Version bump (Lerna)
        run: |
          npx lerna version --conventional-commits --yes
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate changelog
        run: npx conventional-changelog -p angular -i CHANGELOG.md -s

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ env.NEW_VERSION }}
          release_name: Release v${{ env.NEW_VERSION }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false

      - name: Publish to npm (optional)
        run: npx lerna publish from-package --yes
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Code Organization Patterns

### MCP Structure Template

**Standard Directory Structure** (applies to all 25 MCPs):

```
packages/mcps/<mcp-name>/
├── src/
│   ├── index.ts                # MCP entry point
│   ├── handlers/               # Tool implementations
│   │   ├── tool1.ts
│   │   ├── tool2.ts
│   │   └── index.ts
│   ├── services/               # Business logic
│   │   ├── api-client.ts
│   │   └── data-processor.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   └── utils/                  # MCP-specific helpers
│       └── helpers.ts
├── tests/
│   ├── unit/
│   │   ├── handlers.test.ts
│   │   └── services.test.ts
│   └── integration/
│       └── api.test.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Example: jupiter-mcp Structure

```typescript
// packages/mcps/jupiter-mcp/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '@crypto-mcp-suite/shared-core';
import { getRedisClient } from '@crypto-mcp-suite/shared-database';
import { handlers } from './handlers';

const server = new Server(
  {
    name: 'jupiter-mcp',
    version: '1.5.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler('tools/list', handlers.listTools);
server.setRequestHandler('tools/call', handlers.callTool);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Jupiter MCP server started');
}

main().catch((error) => {
  logger.error({ error }, 'Server failed to start');
  process.exit(1);
});
```

```typescript
// packages/mcps/jupiter-mcp/src/handlers/index.ts
import { getPrice } from './get-price';
import { swap } from './swap';
import { getRoute } from './get-route';

export const handlers = {
  listTools: async () => ({
    tools: [
      {
        name: 'get-price',
        description: 'Get token price from Jupiter',
        inputSchema: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'Token symbol (e.g., SOL, USDC)' },
          },
          required: ['token'],
        },
      },
      {
        name: 'swap',
        description: 'Execute token swap on Solana via Jupiter',
        inputSchema: {
          type: 'object',
          properties: {
            inputToken: { type: 'string' },
            outputToken: { type: 'string' },
            amount: { type: 'number' },
            slippage: { type: 'number', default: 0.5 },
          },
          required: ['inputToken', 'outputToken', 'amount'],
        },
      },
      {
        name: 'get-route',
        description: 'Get optimal swap route',
        inputSchema: {
          type: 'object',
          properties: {
            inputToken: { type: 'string' },
            outputToken: { type: 'string' },
          },
          required: ['inputToken', 'outputToken'],
        },
      },
    ],
  }),

  callTool: async (request: any) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'get-price':
        return getPrice(args);
      case 'swap':
        return swap(args);
      case 'get-route':
        return getRoute(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  },
};
```

```typescript
// packages/mcps/jupiter-mcp/src/handlers/get-price.ts
import { logger, metrics } from '@crypto-mcp-suite/shared-core';
import { getRedisClient } from '@crypto-mcp-suite/shared-database';
import { retry } from '@crypto-mcp-suite/shared-utils';
import { jupiterAPI } from '../services/jupiter-api';

export async function getPrice(args: { token: string }) {
  const { token } = args;
  const log = logger.child({ handler: 'get-price', token });
  const timer = metrics.startTimer('jupiter_get_price_duration');

  try {
    const redis = await getRedisClient();
    const cacheKey = `jupiter:price:${token}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      log.info('Cache hit');
      metrics.increment('jupiter_cache_hits', { handler: 'get-price' });
      timer.end({ status: 'success', cache: 'hit' });
      return { content: [{ type: 'text', text: cached }] };
    }

    // Fetch from Jupiter API with retry
    log.info('Cache miss, fetching from API');
    const price = await retry(
      () => jupiterAPI.getPrice(token),
      { retries: 3, delay: 1000, backoff: 2 }
    );

    // Cache for 30 seconds
    await redis.setex(cacheKey, 30, JSON.stringify(price));

    metrics.increment('jupiter_cache_misses', { handler: 'get-price' });
    timer.end({ status: 'success', cache: 'miss' });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(price, null, 2),
        },
      ],
    };
  } catch (error) {
    log.error({ error }, 'Failed to get price');
    timer.end({ status: 'error' });
    throw error;
  }
}
```

---

## Testing Strategy

### Test Pyramid

```
                    /\
                   /  \
                  /E2E \          10% (End-to-end tests)
                 /______\
                /        \
               /Integration\       30% (Integration tests)
              /____________\
             /              \
            /  Unit Tests    \     60% (Unit tests)
           /________________  \
```

### Test Types

#### 1. Unit Tests (60% of tests)

**Purpose**: Test individual functions in isolation
**Tools**: Jest (JavaScript), pytest (Python)
**Coverage Target**: 80%+

**Example**: `packages/mcps/jupiter-mcp/tests/unit/handlers.test.ts`

```typescript
import { getPrice } from '../../src/handlers/get-price';
import { jupiterAPI } from '../../src/services/jupiter-api';
import { getRedisClient } from '@crypto-mcp-suite/shared-database';

// Mock dependencies
jest.mock('../../src/services/jupiter-api');
jest.mock('@crypto-mcp-suite/shared-database');

describe('getPrice handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached price if available', async () => {
    const mockRedis = {
      get: jest.fn().mockResolvedValue('{"price": 145.23, "token": "SOL"}'),
      setex: jest.fn(),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockRedis);

    const result = await getPrice({ token: 'SOL' });

    expect(mockRedis.get).toHaveBeenCalledWith('jupiter:price:SOL');
    expect(jupiterAPI.getPrice).not.toHaveBeenCalled(); // API not called
    expect(result.content[0].text).toContain('145.23');
  });

  it('fetches from API on cache miss', async () => {
    const mockRedis = {
      get: jest.fn().mockResolvedValue(null), // Cache miss
      setex: jest.fn(),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockRedis);
    (jupiterAPI.getPrice as jest.Mock).mockResolvedValue({
      price: 145.23,
      token: 'SOL',
    });

    const result = await getPrice({ token: 'SOL' });

    expect(mockRedis.get).toHaveBeenCalledWith('jupiter:price:SOL');
    expect(jupiterAPI.getPrice).toHaveBeenCalledWith('SOL');
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'jupiter:price:SOL',
      30,
      JSON.stringify({ price: 145.23, token: 'SOL' })
    );
  });

  it('retries on API failure', async () => {
    const mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn(),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockRedis);
    (jupiterAPI.getPrice as jest.Mock)
      .mockRejectedValueOnce(new Error('API timeout'))
      .mockRejectedValueOnce(new Error('API timeout'))
      .mockResolvedValueOnce({ price: 145.23, token: 'SOL' }); // Success on 3rd try

    const result = await getPrice({ token: 'SOL' });

    expect(jupiterAPI.getPrice).toHaveBeenCalledTimes(3);
    expect(result.content[0].text).toContain('145.23');
  });
});
```

#### 2. Integration Tests (30% of tests)

**Purpose**: Test MCP interactions with databases and external APIs
**Tools**: Jest + Docker Compose (spin up Redis, PostgreSQL)
**Coverage Target**: Critical paths only

**Example**: `packages/mcps/jupiter-mcp/tests/integration/api.test.ts`

```typescript
import { getPrice } from '../../src/handlers/get-price';
import { getRedisClient } from '@crypto-mcp-suite/shared-database';

describe('getPrice integration', () => {
  let redis: any;

  beforeAll(async () => {
    // Connect to real Redis (running in Docker via docker-compose.test.yml)
    redis = await getRedisClient();
  });

  afterAll(async () => {
    await redis.quit();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await redis.flushdb();
  });

  it('caches price for 30 seconds', async () => {
    const result1 = await getPrice({ token: 'SOL' });
    const cachedValue = await redis.get('jupiter:price:SOL');

    expect(cachedValue).toBeTruthy();

    // Verify TTL is ~30 seconds
    const ttl = await redis.ttl('jupiter:price:SOL');
    expect(ttl).toBeGreaterThan(25);
    expect(ttl).toBeLessThanOrEqual(30);
  });

  it('serves from cache on subsequent requests', async () => {
    const result1 = await getPrice({ token: 'SOL' });
    const result2 = await getPrice({ token: 'SOL' });

    // Both should return same value (cached)
    expect(result1.content[0].text).toEqual(result2.content[0].text);
  });
});
```

**Docker Compose for Tests**: `docker-compose.test.yml`

```yaml
version: '3.8'
services:
  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379" # Use different port to avoid conflicts

  postgres-test:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: crypto_mcp_test
    ports:
      - "5433:5432"
```

#### 3. End-to-End Tests (10% of tests)

**Purpose**: Test complete workflows (user → CLI → MCPs → databases → external APIs)
**Tools**: Playwright, Cypress, or custom scripts
**Coverage Target**: Critical user flows only

**Example**: Test full installation flow

```bash
#!/bin/bash
# tests/e2e/test-installation.sh

set -e

echo "Testing MINIMAL installation mode..."
crypto-mcp install --mode=minimal --path=/tmp/crypto-mcp-test

echo "Verifying installation..."
crypto-mcp status | grep "crypto-indicators-mcp.*running"
crypto-mcp status | grep "bridge-rates-mcp.*running"

echo "Testing MCP functionality..."
crypto-mcp test crypto-indicators-mcp

echo "Cleanup..."
crypto-mcp uninstall --yes
rm -rf /tmp/crypto-mcp-test

echo "✅ E2E test passed"
```

---

## Documentation Structure

### Documentation Hierarchy

```
docs/
├── README.md                          # Main entry point
├── architecture/                      # System design
│   ├── OVERVIEW.md                    # High-level architecture
│   ├── DATABASE_DESIGN.md             # Database schemas
│   ├── API_DESIGN.md                  # API endpoints
│   ├── SECURITY.md                    # Security best practices
│   └── MONITORING.md                  # Observability
├── mcps/                              # Per-MCP documentation
│   ├── jupiter-mcp.md
│   ├── uniswap-trader-mcp.md
│   └── ... (25 MCP docs)
├── guides/                            # How-to guides
│   ├── INSTALLATION.md
│   ├── CONFIGURATION.md
│   ├── TROUBLESHOOTING.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
├── api/                               # API reference
│   └── openapi.yml                    # OpenAPI 3.0 spec
└── diagrams/                          # Architecture diagrams
    ├── system-architecture.svg
    ├── database-er-diagram.svg
    └── deployment-diagram.svg
```

### Documentation Standards

**Format**: Markdown (GitHub Flavored Markdown)
**Style Guide**: Microsoft Writing Style Guide
**Tools**: Markdownlint, Vale (prose linter)

**Template**: `docs/mcps/TEMPLATE.md`

```markdown
# <MCP Name>

**Category**: <Tier S/A/B> | <Category>
**Score**: <XX>/100
**Maintainer**: @username

## Overview

Brief description (2-3 sentences).

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
crypto-mcp add <mcp-name>
\`\`\`

## Configuration

\`\`\`bash
# Required environment variables
export API_KEY=...
export ENDPOINT_URL=...
\`\`\`

## Usage

### Tool 1: <tool-name>

**Description**: ...

**Input**:
\`\`\`json
{
  "param1": "value1",
  "param2": "value2"
}
\`\`\`

**Output**:
\`\`\`json
{
  "result": "..."
}
\`\`\`

**Example**:
\`\`\`bash
crypto-mcp call <mcp-name> <tool-name> '{"param1": "value1"}'
\`\`\`

## Performance

- **Latency**: <p50>/<p95>/<p99>
- **Rate Limits**: <free tier>/<paid tier>
- **Cache Hit Rate**: <XX%>

## Cost

- **Development**: $<X>/month
- **Production**: $<Y>/month

## Troubleshooting

### Issue 1
**Symptoms**: ...
**Cause**: ...
**Solution**: ...

## References

- [API Documentation](...)
- [GitHub Repository](...)
```

---

## Migration Path from Kukapay

### Challenge

Kukapay MCPs are in **63 separate repositories**. We need to migrate to a **single monorepo**.

### Migration Strategy

**Phase 1: Fork Selected Repos** (25 MCPs)

```bash
#!/bin/bash
# scripts/migrate-from-kukapay.sh

MCPS=(
  "jupiter-mcp"
  "uniswap-trader-mcp"
  "crypto-indicators-mcp"
  # ... (25 MCPs total)
)

for mcp in "${MCPS[@]}"; do
  echo "Migrating $mcp..."

  # Clone Kukapay repo
  git clone https://github.com/kukapay/$mcp temp/$mcp

  # Copy to monorepo
  mkdir -p packages/mcps/$mcp
  cp -r temp/$mcp/* packages/mcps/$mcp/

  # Update package.json
  sed -i 's/"name": ".*"/"name": "@crypto-mcp-suite\/'$mcp'"/' packages/mcps/$mcp/package.json

  # Add workspace dependencies
  echo "Adding shared dependencies..."
  # (automated script to update imports)

  # Cleanup
  rm -rf temp/$mcp
done

echo "✅ Migration complete"
```

**Phase 2: Standardize Structure**

For each MCP:
1. Move code to `src/` directory (if not already)
2. Add TypeScript config (`tsconfig.json`)
3. Update imports to use shared packages
4. Add tests to `tests/` directory
5. Update README with monorepo conventions

**Phase 3: Test & Validate**

```bash
# Test all migrated MCPs
npm run test --workspaces

# Build all MCPs
npm run build --workspaces

# Integration tests
npm run test:integration
```

**Phase 4: Commit to Monorepo**

```bash
git add packages/mcps
git commit -m "feat: migrate 25 MCPs from Kukapay repos to monorepo

Migrated MCPs:
- jupiter-mcp (Tier S)
- uniswap-trader-mcp (Tier S)
- ... (25 total)

All MCPs tested and validated."
```

---

## Conclusion

This repository structure design establishes a **hybrid monorepo** that balances **code sharing**, **dependency isolation**, and **maintainability** for 25 production MCPs.

**Key Decisions**:
- ✅ **Monorepo**: Single repository for unified versioning and atomic changes
- ✅ **npm Workspaces**: Dependency hoisting with isolation
- ✅ **Shared Utilities**: 4 shared packages (core, database, monitoring, utils)
- ✅ **Semantic Versioning**: Automated version bumps via Lerna
- ✅ **CI/CD**: GitHub Actions with parallelized testing

**Benefits Over Kukapay Multi-Repo**:
- 90% reduction in code duplication
- Single-commit updates across all MCPs
- Unified testing and CI/CD
- Centralized documentation
- Simplified dependency management

**Next Phase**: Installer Prototype Development
- Build CLI tool (`crypto-mcp`)
- Implement installation modes (MINIMAL, STANDARD, PREMIUM)
- Test on Windows, macOS, Linux
- Create installer packages

---

**Prepared by**: Solutions Architect
**Review Date**: October 1, 2025
**Next Phase**: Phase 6 - Installer Prototype Development
**Status**: ✅ **READY FOR IMPLEMENTATION**
