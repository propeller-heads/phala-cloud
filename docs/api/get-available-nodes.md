# getAvailableNodes

Get available teepods (nodes) and their capacity information for deploying CVMs.

## Overview

The `getAvailableNodes` function retrieves a list of available teepods with their current capacity, resource availability, and KMS (Key Management Service) information. This endpoint is essential for determining where you can deploy new CVMs based on available resources and node capabilities.

## Usage

```typescript
import { createClient, getAvailableNodes } from '@phala/cloud'

const client = createClient({ apiKey: 'your-api-key' })
const result = await getAvailableNodes(client)

console.log(`Tier: ${result.tier}`)
console.log(`Available nodes: ${result.nodes.length}`)
```

## Returns

### Success Response

```typescript
{
  tier: string,           // Team tier (e.g., 'LEVEL_1', 'PRO', 'ENTERPRISE')
  capacity: {             // Resource limits based on tier
    max_instances?: number | null,
    max_vcpu?: number | null,
    max_memory?: number | null,
    max_disk?: number | null
  },
  nodes: [                // Available teepods
    {
      teepod_id: number,
      name: string,
      listed: boolean,    // Whether node is publicly available
      resource_score: number,
      remaining_vcpu: number,
      remaining_memory: number,
      remaining_cvm_slots: number,
      images: [           // Supported OS images
        {
          name: string,
          is_dev: boolean,
          version: [number, number, number] | [number, number, number, number],
          os_image_hash?: string | null
        }
      ],
      support_onchain_kms?: boolean,
      fmspc?: string | null,
      device_id?: string | null,
      region_identifier?: string | null,
      default_kms?: string | null,
      kms_list: string[]  // Available KMS slugs for this node
    }
  ],
  kms_list: [             // Global KMS information
    {
      id: number,
      url: string,
      version: string,
      chain_id: number,
      kms_contract_address?: string,
      gateway_app_id?: string,
      slug?: string,
      supported_os_images?: string[]
    }
  ]
}
```

## Parameters

### parameters (optional)

Control schema validation behavior:

```typescript
// Use default schema validation
const result = await getAvailableNodes(client)

// Skip validation and return raw data
const raw = await getAvailableNodes(client, { schema: false })

// Use custom schema
import { z } from 'zod'
const customSchema = z.object({ tier: z.string() })
const custom = await getAvailableNodes(client, { schema: customSchema })
```

## API Version Behavior

**Important**: The behavior of this endpoint varies based on your API version.

### Version 2026-01-21 (Latest)
- Same node filtering as `2025-10-28` (no v0.3.x nodes)
- Response structure unchanged for this endpoint

### Version 2025-10-28
- **Never returns v0.3.x nodes**
- All nodes with version v0.3.x are automatically filtered out
- The `v03x_only` parameter is completely ignored when using this exact version
- This is a breaking change for applications that depend on v0.3.x nodes

### Version 2025-05-31 (Baseline)
- **Default behavior for backward compatibility**
- Fully respects the `v03x_only` parameter:
  - When `v03x_only=true`: Only returns v0.3.x nodes
  - When `v03x_only=false` or not specified: Returns all available nodes
- This is the default version for API tokens created before the versioning system was introduced

### Setting API Version

```typescript
// Use the latest version (default for new tokens)
const client = createClient({
  apiKey: 'your-api-key',
  version: '2026-01-21'  // Latest version, filters out v0.3.x nodes
})

// Use baseline version to see v0.3.x nodes
const client = createClient({
  apiKey: 'your-api-key',
  version: '2025-05-31'
})
```

## Examples

### Basic Usage

```typescript
import { createClient, getAvailableNodes } from '@phala/cloud'

async function checkAvailableResources() {
  const client = createClient({ apiKey: 'your-api-key' })
  const availability = await getAvailableNodes(client)

  // Check tier limits
  console.log(`Your tier: ${availability.tier}`)
  if (availability.capacity.max_instances) {
    console.log(`Max instances allowed: ${availability.capacity.max_instances}`)
  }

  // Find nodes with sufficient resources
  const suitableNodes = availability.nodes.filter(node =>
    node.remaining_vcpu >= 4 &&
    node.remaining_memory >= 8192 &&
    node.remaining_cvm_slots > 0
  )

  console.log(`Found ${suitableNodes.length} nodes with at least 4 vCPU and 8GB RAM`)
}
```

### Finding Nodes with Specific Image Support

```typescript
async function findNodesWithImage(imageName: string) {
  const client = createClient({ apiKey: 'your-api-key' })
  const availability = await getAvailableNodes(client)

  const compatibleNodes = availability.nodes.filter(node =>
    node.images.some(img => img.name === imageName)
  )

  if (compatibleNodes.length === 0) {
    console.log(`No nodes support image: ${imageName}`)
    return
  }

  // Sort by resource score (best nodes first)
  compatibleNodes.sort((a, b) => b.resource_score - a.resource_score)

  console.log(`Found ${compatibleNodes.length} nodes supporting ${imageName}:`)
  compatibleNodes.forEach(node => {
    console.log(`- ${node.name}: ${node.remaining_vcpu} vCPU, ${node.remaining_memory}MB RAM`)
  })
}
```

### Checking KMS Availability

```typescript
async function checkKmsSupport() {
  const client = createClient({ apiKey: 'your-api-key' })
  const availability = await getAvailableNodes(client)

  // Find nodes with onchain KMS support
  const onchainKmsNodes = availability.nodes.filter(node =>
    node.support_onchain_kms
  )

  console.log(`Onchain KMS nodes: ${onchainKmsNodes.length}`)

  // Check available KMS services
  console.log(`Available KMS services: ${availability.kms_list.length}`)
  availability.kms_list.forEach(kms => {
    console.log(`- ${kms.url} (Chain ID: ${kms.chain_id})`)
    if (kms.supported_os_images?.length) {
      console.log(`  Supports images: ${kms.supported_os_images.join(', ')}`)
    }
  })
}
```

### Error Handling

```typescript
import { safeGetAvailableNodes } from '@phala/cloud'

async function safeCheckAvailability() {
  const client = createClient({ apiKey: 'your-api-key' })
  const result = await safeGetAvailableNodes(client)

  if (result.success) {
    console.log(`Available nodes: ${result.data.nodes.length}`)
  } else {
    if ("isRequestError" in result.error) {
      console.error(`HTTP ${result.error.status}: ${result.error.message}`)
    } else {
      console.error(`Validation error:`, result.error.issues)
    }
  }
}
```

## Node Selection Strategy

When selecting a node for deployment, consider:

1. **Resource Availability**: Check `remaining_vcpu`, `remaining_memory`, and `remaining_cvm_slots`
2. **Resource Score**: Higher scores indicate better resource availability
3. **Image Support**: Ensure the node supports your required OS image
4. **KMS Requirements**: For secure workloads, check `support_onchain_kms` and `kms_list`
5. **Listed Status**: Non-admin users can only deploy to `listed: true` nodes

## Migration Guide for v0.3.x Users

If your application depends on v0.3.x nodes:

1. **Check your current node version**:
   ```typescript
   const availability = await getAvailableNodes(client)
   const v03xNodes = availability.nodes.filter(node =>
     node.images.some(img => img.name.includes('0.3'))
   )
   ```

2. **Pin to baseline API version** if you need v0.3.x nodes:
   ```typescript
   const client = createClient({
     apiKey: 'your-api-key',
     version: '2025-05-31'  // Keep using baseline version
   })
   ```

3. **Plan migration** to newer node versions (v0.4.0+) for long-term support

## See Also

- [API Versioning Guide](/api-versioning)
- [createCvm](/api/create-cvm) - Deploy a CVM on available nodes
- [getCvm](/api/get-cvm) - Get CVM details including node information