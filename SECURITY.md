# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in Crypto MCP Suite, please report it responsibly:

- **Email:** [Create a security contact: security@your-domain.com]
- **GitHub Security Advisories:** Use the "Security" tab to report privately
- **Response Time:** We aim to respond within 48 hours

**Please do NOT:**
- Create a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before we've had a chance to fix it
- Test the vulnerability on production systems

## Security Best Practices

### API Key Management

1. **Never commit API keys or private keys to git**
   - All `.env` files are gitignored by this repository
   - Use `.env.local` for local development (not tracked)
   - Use `.env.example` as a template (tracked, contains placeholders only)
   - Individual MCPs also require their own `.env` files in their directories

2. **Use test wallets only for development**
   - Never put production wallets in `.env` files
   - Test wallets should have minimal funds (< $10 USD)
   - Use dedicated addresses for testing, never reuse production addresses
   - Rotate test wallets periodically (every 3-6 months)

3. **Rotate API keys regularly**
   - Free-tier keys: Rotate annually at minimum
   - Paid-tier keys: Rotate every 6 months
   - Monitor API usage dashboards for unauthorized access
   - Revoke unused keys immediately

4. **Use environment-specific keys**
   - Development: Use free-tier or test API keys
   - Staging: Use separate paid-tier keys
   - Production: Use dedicated production keys with monitoring

### Production Deployment Security

**Critical Steps Before Production:**

1. **Replace test wallets** with dedicated production wallets
   - Fund production wallets appropriately for your use case
   - Use hardware wallets or secure key management solutions
   - Never store production private keys in plain text

2. **Upgrade to paid API tiers**
   - Better rate limits reduce denial-of-service risk
   - SLA guarantees for critical infrastructure
   - Enhanced security features (IP whitelisting, etc.)

3. **Use dedicated RPC endpoints**
   - Replace public endpoints (Infura free tier, Solana public RPC)
   - Consider: Alchemy, QuickNode, or self-hosted nodes
   - Configure rate limiting and monitoring

4. **Implement monitoring and alerting**
   - API usage anomaly detection
   - Wallet activity monitoring
   - Failed authentication attempts
   - Rate limit violations

5. **Enable 2FA on all accounts**
   - API provider accounts (Infura, TheGraph, etc.)
   - GitHub account
   - Any cloud infrastructure accounts

### Secrets Management

**For Production Deployments:**

Do NOT use `.env` files in production. Use a proper secrets manager:

- **AWS Secrets Manager** (recommended for AWS deployments)
- **HashiCorp Vault** (recommended for multi-cloud)
- **Azure Key Vault** (for Azure deployments)
- **Google Secret Manager** (for GCP deployments)
- **Kubernetes Secrets** (for Kubernetes deployments)

**Example: AWS Secrets Manager Integration**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}
```

### Local Development Environment

**Expected Git State:**

After configuring API keys in Phase 6, you may see 4 submodules marked as "modified" in `git status`:
- `native/lib/hyperliquid-whalealert-mcp`
- `native/lib/jupiter-mcp`
- `native/lib/rug-check-mcp`
- `native/lib/uniswap-trader-mcp`

**This is expected behavior.** These submodules contain local `.env` files with your API keys. These files are:
- Gitignored by the parent repository (will NOT be committed)
- Required by the MCPs for configuration
- Safe for local development use

**To verify your .env files are protected:**
```bash
git status --porcelain | grep "\.env"
# Should return nothing (all .env files ignored)
```

### Dependency Security

1. **Upstream Dependencies**
   - MCPs rely on external npm and pip packages
   - Run `npm audit` regularly in Node.js MCPs
   - Run `pip check` regularly in Python MCPs
   - Update dependencies when security patches are released

2. **Submodule Security**
   - All 27 MCPs are git submodules pointing to external repositories
   - Review upstream changes before updating submodules
   - Monitor security advisories for MCP dependencies

3. **Supply Chain Security**
   - Verify package signatures when possible
   - Use lock files (package-lock.json, uv.lock) to ensure reproducible builds
   - Consider using npm audit fix or pip-audit for automated patching

## Supported Versions

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 0.1.0-alpha | ✅ Active development | Current |
| Older | ❌ Not supported | N/A |

## Known Security Considerations

### 1. Test Wallets in Documentation
- Example configurations reference test wallets with minimal balances
- These are safe for development (< $1 balance typically)
- **Replace with production wallets before live deployment**
- Never expose production wallet private keys

### 2. RPC Endpoint Exposure
- Public RPC endpoints (Solana, Infura free tier) have rate limits
- Rate limit exhaustion can cause service disruption
- Consider paid endpoints for production reliability
- **Never expose RPC URLs with embedded API keys in client-side code**

### 3. Modified Submodules
- 4 submodules show as "dirty" due to local `.env` files
- This is expected and these files are gitignored
- Do NOT commit submodule changes unless intentional
- Use `git submodule update` to reset to clean state if needed

### 4. API Rate Limiting
- Free-tier APIs have strict rate limits
- Exceeding limits can cause temporary service disruption
- Implement request caching where appropriate
- Monitor usage to avoid hitting limits

### 5. Upstream MCP Security
- MCPs are maintained by third parties (kukapay organization)
- Security vulnerabilities in upstream MCPs require maintainer fixes
- We cannot fix upstream code issues locally
- Monitor MCP repositories for security advisories

## Security Audit History

| Date | Auditor | Scope | Findings | Status |
|------|---------|-------|----------|--------|
| Oct 2, 2025 | Claude Code (Sonnet 4.5) | Git history scan | No sensitive data in commits | ✅ Passed |
| Oct 2, 2025 | Claude Code (Sonnet 4.5) | Repository structure | Proper .gitignore configuration | ✅ Passed |
| Oct 2, 2025 | Claude Code (Sonnet 4.5) | API key management | All keys properly gitignored | ✅ Passed |

## Security Update Process

When security issues are discovered:

1. **Assessment** - Evaluate severity and impact
2. **Fix Development** - Create patch in private branch
3. **Testing** - Verify fix doesn't break functionality
4. **Disclosure** - Coordinate disclosure with affected parties
5. **Release** - Push fix to main branch with security advisory
6. **Communication** - Update this file and notify users

## Security Updates Log

We will document security updates in:
1. This SECURITY.md file (this section)
2. GitHub Security Advisories (for critical issues)
3. CHANGELOG.md (for version-specific updates)
4. Git commit messages (with "security:" prefix)

### Recent Updates
- **Oct 2, 2025**: Initial security policy created
- **Oct 2, 2025**: Added *.backup to .gitignore (prevent accidental commit of backup files)

## Vulnerability Disclosure Timeline

We follow a **90-day disclosure timeline**:

1. **Day 0**: Vulnerability reported
2. **Day 2**: Initial response and acknowledgment
3. **Day 7**: Assessment and severity classification
4. **Day 30**: Patch development begins
5. **Day 60**: Testing and verification
6. **Day 90**: Public disclosure and patch release

Critical vulnerabilities may have accelerated timelines.

## Contact

For security concerns, please use:
- **GitHub Security Advisories**: Preferred method
- **Email**: [To be configured]
- **Public Issues**: Only for non-security bugs

## Acknowledgments

We appreciate security researchers who report vulnerabilities responsibly. Contributors who report valid security issues will be:
- Acknowledged in this file (with permission)
- Credited in release notes
- Listed in CONTRIBUTORS.md

## License

This security policy is part of the Crypto MCP Suite project and is licensed under the MIT License.

---

**Last Updated:** October 2, 2025
**Policy Version:** 1.0
**Next Review:** January 2, 2026
