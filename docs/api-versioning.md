# API Versioning

Phala Cloud uses API versioning to release new features and improvements while maintaining backward compatibility for existing integrations.

## Current Version

The current API version is **`2025-10-28`**.

## How Versioning Works

When you make API requests, the version determines the API behavior and response format you'll receive. You can specify which version to use, or rely on your API token's default version.

### Version Behavior by Client Type

| Client Type | Version Behavior |
|------------|------------------|
| **Web Dashboard** | Always uses the latest version |
| **New API Tokens** | Default to the latest version at creation time |
| **Existing API Tokens** | Keep their original version for stability |
| **Direct API Calls** | Use token's default or specify via header |

## Specifying a Version

### Using HTTP Headers

Include the `X-Phala-Version` header in your requests:

```bash
curl https://cloud-api.phala.network/api/v1/cvms \
  -H "X-API-Key: your-api-key" \
  -H "X-Phala-Version: 2025-10-28"
```

### Using the JavaScript SDK

```javascript
import { createClient } from '@phala/cloud'

const client = createClient({
  apiKey: 'your-api-key',
  version: '2025-10-28'  // Optional, defaults to your token's version
})
```

### Using the CLI

```bash
phala config set api-version 2025-10-28
```

## Version History

### `2025-10-28` (Latest)
The current version with all available features and improvements.

### `2025-05-31` (Baseline)
The baseline version for backward compatibility. Existing API tokens created before versioning was introduced default to this version.

## Managing Your API Version

### Checking Your Current Version

Your API token has a default version that's used when you don't specify one explicitly:

```bash
# View your token's default version
curl https://cloud-api.phala.network/api/v1/account/tokens \
  -H "X-API-Key: your-api-key"
```

### Testing Different Versions

You can test how your integration works with different versions without changing your token's default:

```javascript
// Test with a specific version
const testClient = createClient({
  apiKey: 'your-api-key',
  version: '2025-05-31'  // Test with older version
})

// Your production client continues using default
const prodClient = createClient({
  apiKey: 'your-api-key'
  // Uses your token's default version
})
```

## Best Practices

### For New Integrations

- Start with the latest version to access all features
- Always specify the version explicitly in production code
- Test your integration when new versions are released

### For Existing Integrations

- Your integration continues working with your current version
- Test new versions in development before upgrading
- Upgrade when you're ready to use new features

### Version Pinning

We recommend explicitly specifying your API version in production:

```javascript
// ✅ Good: Explicit version for predictability
const client = createClient({
  apiKey: process.env.PHALA_API_KEY,
  version: '2025-10-28'
})

// ❌ Avoid: Implicit version may change
const client = createClient({
  apiKey: process.env.PHALA_API_KEY
  // Version not specified
})
```

## Upgrading Your Version

### Step 1: Review Changes

Check what's new in the version you're upgrading to. Look for:
- New response fields
- Changed behaviors
- Deprecated features

### Step 2: Test in Development

```javascript
// Test with the new version
const client = createClient({
  apiKey: 'your-dev-api-key',
  version: '2025-10-28'  // New version
})

// Run your test suite
await runIntegrationTests(client)
```

### Step 3: Update Production

Once testing is complete, update your production configuration:

```javascript
// Update your production code
const client = createClient({
  apiKey: process.env.PHALA_API_KEY,
  version: '2025-10-28'  // Updated version
})
```

## Backward Compatibility

We maintain backward compatibility by:

- **Never removing required fields** from API responses
- **Only adding optional fields** in new versions
- **Keeping old versions available** for at least 12 months
- **Providing migration guides** for breaking changes

## Version Deprecation

When a version is deprecated:

1. **Advance Notice**: We announce deprecation at least 3 months in advance
2. **Migration Period**: The version remains functional for at least 12 months
3. **Migration Support**: We provide guides and support for upgrading
4. **No New Features**: Deprecated versions don't receive new features

## FAQ

### What version does my API token use?

New API tokens use the latest version by default. Existing tokens keep their original version unless you specify otherwise using the `X-Phala-Version` header.

### Can I use different versions for different endpoints?

Yes, you can specify different versions per request using the `X-Phala-Version` header, regardless of your token's default version.

### Will my integration break when new versions are released?

No. Your integration continues using its current version. New versions don't affect existing integrations unless you explicitly upgrade.

### How do I know if I should upgrade?

Review the changelog for new features you want to use. Upgrade when:
- You need new functionality
- You want improved performance
- Your current version is approaching deprecation

## Getting Help

- **Documentation**: Check the [API Reference](https://docs.phala.network/api) for version-specific details
- **Support**: Contact support@phala.network for migration assistance
- **Updates**: Subscribe to our [API Changelog](https://phala.network/changelog) for version announcements