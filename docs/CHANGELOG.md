# SDK Changelog

All notable changes to the Phala Cloud SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

#### API Version 2025-10-28

- **`getAvailableNodes` / `/teepods/available` endpoint**: No longer returns v0.3.x nodes
  - The `v03x_only` parameter is completely ignored when using exactly API version 2025-10-28
  - All v0.3.x nodes are automatically filtered out from the response
  - This change only applies when explicitly using version `2025-10-28`
  - This affects node availability for new CVM deployments
  - Existing CVMs running on v0.3.x nodes continue to operate normally
  - **Migration Guide**:
    - If your application depends on v0.3.x nodes, use API version `2025-05-31`
    - The baseline version (`2025-05-31`) continues to fully support the `v03x_only` parameter
    - Update your code to handle newer node versions (v0.4.0+) for future compatibility
    - Consider migrating existing workloads to newer nodes

### Backward Compatibility

- **New API tokens**: Automatically use the latest version (`2025-10-28`) by default, which filters out v0.3.x nodes
- **Existing API tokens**: Tokens created before 2025-10-28 remain on version `2025-05-31` and continue to support the `v03x_only` parameter
- To use the baseline version (if you need v0.3.x nodes), explicitly set the version:
  ```typescript
  const client = createClient({
    apiKey: 'your-api-key',
    version: '2025-05-31'  // Use baseline version to access v0.3.x nodes
  })
  ```

## API Version History

### 2025-10-28
- **Breaking**: Removes v0.3.x nodes from `/teepods/available` endpoint
- Ignores `v03x_only` parameter completely
- Default version for new API tokens created after this date
- Only affects endpoints when this exact version is specified

### 2025-05-31 (Baseline)
- Baseline version for backward compatibility
- Fully supports `v03x_only` parameter to control v0.3.x node filtering:
  - `v03x_only=true`: Returns only v0.3.x nodes
  - `v03x_only=false` or not specified: Returns all available nodes
- Default for existing API tokens created before versioning system
- Continues to be the default for legacy endpoints