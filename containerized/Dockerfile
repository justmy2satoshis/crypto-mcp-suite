# Multi-stage Dockerfile for Crypto MCP Suite
# Optimized for small image size and fast builds

# Stage 1: Base dependencies
FROM node:20-alpine AS base

# Install required system dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Set working directory
WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 3: Build stage (for TypeScript MCPs)
FROM base AS build

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --ignore-scripts

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript (if applicable)
RUN if [ -f "tsconfig.json" ]; then npm run build; fi

# Stage 4: Production image
FROM base AS production

# Accept MCP_NAME as build argument
ARG MCP_NAME
ENV MCP_NAME=${MCP_NAME}

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S cryptouser && \
    adduser -S cryptouser -u 1001 -G cryptouser

# Create directories
RUN mkdir -p /app/logs && \
    chown -R cryptouser:cryptouser /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=cryptouser:cryptouser /app/node_modules ./node_modules

# Copy built code (or source if no build step)
COPY --from=build --chown=cryptouser:cryptouser /app/dist ./dist 2>/dev/null || \
    COPY --chown=cryptouser:cryptouser src/ ./src/

# Copy package.json
COPY --chown=cryptouser:cryptouser package*.json ./

# Switch to non-root user
USER cryptouser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the MCP server
CMD ["node", "dist/index.js"]
