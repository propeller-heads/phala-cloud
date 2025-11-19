# CVM Compose Configuration Updates

## Overview

Phala Cloud provides three PATCH APIs to update different parts of your CVM's compose configuration:

- **PATCH /cvms/{cvm_id}/envs** - Update environment variables
- **PATCH /cvms/{cvm_id}/docker-compose** - Update Docker Compose file
- **PATCH /cvms/{cvm_id}/pre-launch-script** - Update pre-launch script

All three APIs support two authentication flows:

1. **Legacy/Offchain KMS**: Direct update without compose hash verification
2. **Contract-owned KMS (Ethereum/Base)**: Two-phase flow with on-chain compose hash registration

## Base URL
```
https://cloud-api.phala.network/v1
```

## Authentication

All requests require an API key:
```bash
-H "X-API-Key: <your-api-key>"
```

---

## API Endpoints

### 1. Update Environment Variables

**Endpoint:** `PATCH /cvms/{cvm_id}/envs`

Update encrypted environment variables and optionally modify the list of allowed environment keys.

#### Request Body (JSON)
```json
{
  "encrypted_env": "0x1234567890abcdef...",
  "env_keys": ["API_KEY", "DATABASE_URL"],
  "compose_hash": "abcdef...",
  "transaction_hash": "0x..."
}
```

**Fields:**
- `encrypted_env` (required): Hex-encoded encrypted environment data
- `env_keys` (optional): List of allowed environment variable keys
- `compose_hash` (optional): Compose hash for Phase 2 verification
- `transaction_hash` (optional): On-chain transaction hash for Phase 2

**Important:** Environment variables are encrypted. You must provide ALL environment variables in each update (full replacement, not merge).

---

### 2. Update Docker Compose File

**Endpoint:** `PATCH /cvms/{cvm_id}/docker-compose`

Update the Docker Compose YAML configuration for your CVM.

#### Content Types Supported

**Option 1: JSON Body**
```json
{
  "docker_compose_file": "version: '3'\nservices:\n  web:\n    image: nginx:latest",
  "compose_hash": "abcdef...",
  "transaction_hash": "0x..."
}
```

**Option 2: YAML/Plain Text Body with Headers**
```bash
-H "Content-Type: text/yaml"
-H "X-Compose-Hash: abcdef..."
-H "X-Transaction-Hash: 0x..."
--data-binary @docker-compose.yml
```

**Option 3: File Upload (Multipart)**
```bash
-F "file=@docker-compose.yml"
-H "X-Compose-Hash: abcdef..."
-H "X-Transaction-Hash: 0x..."
```

**Fields:**
- `docker_compose_file` (JSON): Docker Compose YAML content as string
- `compose_hash`: Compose hash for Phase 2 verification (JSON body or header)
- `transaction_hash`: Transaction hash for Phase 2 (JSON body or header)

---

### 3. Update Pre-Launch Script

**Endpoint:** `PATCH /cvms/{cvm_id}/pre-launch-script`

Update the shell script that runs before your main containers start.

#### Content Types Supported

**Option 1: JSON Body**
```json
{
  "pre_launch_script": "#!/bin/bash\necho 'Starting...'\n",
  "compose_hash": "abcdef...",
  "transaction_hash": "0x..."
}
```

**Option 2: Plain Text Body with Headers**
```bash
-H "Content-Type: text/plain"
-H "X-Compose-Hash: abcdef..."
-H "X-Transaction-Hash: 0x..."
--data-binary @pre-launch.sh
```

**Option 3: File Upload (Multipart)**
```bash
-F "file=@pre-launch.sh"
-H "X-Compose-Hash: abcdef..."
-H "X-Transaction-Hash: 0x..."
```

**Fields:**
- `pre_launch_script` (JSON): Shell script content as string
- `compose_hash`: Compose hash for Phase 2 verification (JSON body or header)
- `transaction_hash`: Transaction hash for Phase 2 (JSON body or header)

---

## Two-Phase Update Flow (Contract-Owned KMS)

For CVMs using contract-owned KMS (Ethereum/Base chains), updates that modify the compose configuration require on-chain registration.

### Phase 1: Request Update (HTTP 465)

When you submit an update without `compose_hash` and `transaction_hash`:

**Response (HTTP 465):**
```json
{
  "error_code": "ERR-02-465",
  "message": "Compose hash registration required on-chain",
  "details": [
    {
      "field": "compose_hash",
      "value": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    },
    {
      "field": "app_id",
      "value": "0x1234567890abcdef1234567890abcdef12345678"
    },
    {
      "field": "device_id",
      "value": "device-uuid"
    },
    {
      "field": "kms_info",
      "value": {
        "chain_id": 8453,
        "kms_contract_address": "0xKMS_ADDRESS",
        "...": "..."
      }
    }
  ],
  "suggestions": [
    "Register the compose hash on-chain using the KMS contract",
    "Call addComposeHash() with the provided compose_hash",
    "Retry the request with both X-Compose-Hash and X-Transaction-Hash headers"
  ]
}
```

### Phase 2: Register On-Chain

Use the `compose_hash` from the 465 response to register on-chain:

**SDK (TypeScript):**
```typescript
import { addComposeHash } from '@phala/cloud'
import { base } from 'viem/chains'

const result = await addComposeHash({
  chain: base,
  kmsContractAddress: kms_info.kms_contract_address,
  appId: app_id,
  privateKey: process.env.PRIVATE_KEY,
  composeHash: compose_hash,
})

const txHash = result.transactionHash
```

**Smart Contract Call:**
```solidity
// Call this function on the App Auth contract
function addComposeHash(bytes32 composeHash) external
```

### Phase 3: Retry Update

Retry the original update request with the compose hash and transaction hash:

**cURL:**
```bash
curl -X PATCH "https://cloud-api.phala.network/v1/cvms/{cvm_id}/docker-compose" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: text/yaml" \
  -H "X-Compose-Hash: abcdef..." \
  -H "X-Transaction-Hash: 0x..." \
  --data-binary @docker-compose.yml
```

**Response (HTTP 202 Accepted):**
```json
{
  "message": "Docker Compose update initiated",
  "correlation_id": "uuid-correlation-id",
  "status": "in_progress"
}
```

---

## SDK Usage (TypeScript/JavaScript)

### Installation

```bash
npm install @phala/cloud
# or
yarn add @phala/cloud
```

### Example 1: Update Environment Variables

```typescript
import { createClient, addComposeHash } from '@phala/cloud'
import { base } from 'viem/chains'

const client = createClient({ apiKey: process.env.PHALA_API_KEY })

// Phase 1: Initial update
const result = await client.updateCvmEnvs({
  id: 'cvm-id-or-uuid',
  encrypted_env: '0x...',
  env_keys: ['API_KEY', 'DATABASE_URL']
})

if (result.status === 'precondition_required') {
  // Contract-owned KMS requires on-chain registration
  console.log('Registering compose hash on-chain...')

  const txResult = await addComposeHash({
    chain: base,
    kmsContractAddress: result.kms_info.kms_contract_address,
    appId: result.app_id,
    privateKey: process.env.PRIVATE_KEY,
    composeHash: result.compose_hash,
  })

  // Phase 2: Retry with transaction hash
  const finalResult = await client.updateCvmEnvs({
    id: 'cvm-id-or-uuid',
    encrypted_env: '0x...',
    env_keys: ['API_KEY', 'DATABASE_URL'],
    compose_hash: result.compose_hash,
    transaction_hash: txResult.transactionHash,
  })

  console.log('Update initiated:', finalResult.correlation_id)
} else {
  // Legacy KMS: direct update
  console.log('Update initiated:', result.correlation_id)
}
```

### Example 2: Update Docker Compose

```typescript
import { createClient } from '@phala/cloud'
import * as fs from 'fs'

const client = createClient({ apiKey: process.env.PHALA_API_KEY })
const composeYaml = fs.readFileSync('docker-compose.yml', 'utf-8')

const result = await client.updateDockerCompose({
  id: 'cvm-id-or-uuid',
  docker_compose_file: composeYaml
})

// Handle precondition_required same as above if needed
```

### Example 3: Update Pre-Launch Script

```typescript
import { createClient } from '@phala/cloud'
import * as fs from 'fs'

const client = createClient({ apiKey: process.env.PHALA_API_KEY })
const script = fs.readFileSync('pre-launch.sh', 'utf-8')

const result = await client.updatePreLaunchScript({
  id: 'cvm-id-or-uuid',
  pre_launch_script: script
})

// Handle precondition_required same as above if needed
```

### Safe API (Error Handling)

All update actions have a "safe" variant that returns `{ success: boolean }` instead of throwing:

```typescript
import { createClient } from '@phala/cloud'

const client = createClient({ apiKey: process.env.PHALA_API_KEY })

const result = await client.safeUpdateDockerCompose({
  id: 'cvm-id-or-uuid',
  docker_compose_file: composeYaml
})

if (result.success) {
  if (result.data.status === 'precondition_required') {
    // Handle on-chain registration
    console.log('Compose hash:', result.data.compose_hash)
  } else {
    console.log('Update started:', result.data.correlation_id)
  }
} else {
  console.error('Error:', result.error.message)
}
```

---

## CLI Usage (cURL)

### Update Environment Variables

**Request:**
```bash
curl -X PATCH "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/envs" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted_env": "0x1234567890abcdef...",
    "env_keys": ["API_KEY", "DATABASE_URL"]
  }'
```

**Response (Success - Legacy KMS):**
```json
{
  "message": "Environment update initiated",
  "correlation_id": "uuid",
  "status": "in_progress",
  "allowed_envs_changed": true
}
```

**Response (Requires On-Chain - Contract KMS):**
```json
{
  "error_code": "ERR-02-465",
  "message": "Compose hash registration required on-chain",
  "details": [
    {
      "field": "compose_hash",
      "value": "abcdef..."
    }
  ]
}
```

### Update Docker Compose (File Upload)

**Request:**
```bash
curl -X PATCH "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/docker-compose" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: text/yaml" \
  --data-binary @docker-compose.yml
```

**Request (With On-Chain Verification):**
```bash
curl -X PATCH "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/docker-compose" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: text/yaml" \
  -H "X-Compose-Hash: abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" \
  -H "X-Transaction-Hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12" \
  --data-binary @docker-compose.yml
```

**Response (Success):**
```json
{
  "message": "Docker Compose update initiated",
  "correlation_id": "uuid",
  "status": "in_progress"
}
```

### Update Pre-Launch Script (File Upload)

**Request:**
```bash
curl -X PATCH "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/pre-launch-script" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: text/plain" \
  --data-binary @pre-launch.sh
```

**Request (With On-Chain Verification):**
```bash
curl -X PATCH "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/pre-launch-script" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: text/plain" \
  -H "X-Compose-Hash: abcdef..." \
  -H "X-Transaction-Hash: 0x..." \
  --data-binary @pre-launch.sh
```

### Get Current Configuration

Before updating, you can retrieve the current configuration:

**Get Docker Compose:**
```bash
curl -X GET "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/docker-compose.yml" \
  -H "X-API-Key: YOUR_API_KEY"
```

**Get Pre-Launch Script:**
```bash
curl -X GET "https://cloud-api.phala.network/v1/cvms/YOUR_CVM_ID/pre-launch-script" \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## Error Codes

### Compose Hash Verification Errors (465-468)

| Code | Status | Description |
|------|--------|-------------|
| ERR-02-465 | 465 | Compose hash registration required. Register the hash on-chain and retry. |
| ERR-02-466 | 466 | Compose hash invalid or expired (7-day TTL). Restart the update process. |
| ERR-02-467 | 467 | Transaction verification failed. Check transaction hash and event logs. |
| ERR-02-468 | 468 | Compose hash not allowed by contract. Verify contract state. |

### General Errors

| Code | Status | Description |
|------|--------|-------------|
| ERR-01-100 | 400 | Invalid request parameters |
| ERR-01-101 | 400 | Invalid Docker Compose file syntax |
| - | 409 | Another operation already in progress |

---

## Important Notes

### Environment Variables

- **Full Replacement**: When updating `encrypted_env`, you must include ALL environment variables. The system does not merge - it replaces entirely.
- **Encryption**: Environment variables must be encrypted using the app's encryption public key.
- **Key List**: The `env_keys` field controls which environment variable keys are allowed. Changes to this field trigger compose hash verification.

### Docker Compose & Pre-Launch Script

- **Compose Hash Calculation**: Both `docker_compose_file` and `pre_launch_script` are included in the compose hash calculation.
- **File Formats**:
  - Docker Compose: YAML format (Docker Compose specification)
  - Pre-Launch Script: Shell script (runs with `/bin/sh`)

### Update Process

1. **Graceful Shutdown**: The CVM will be shut down gracefully before applying updates
2. **Configuration Update**: The new configuration is applied
3. **Restart**: The CVM starts with the new configuration
4. **Tracking**: Use `correlation_id` to monitor the operation status

### KMS Types

- **Legacy/Offchain KMS**: Updates are applied immediately without on-chain verification
- **Contract-Owned KMS** (Ethereum/Base): Requires two-phase flow with on-chain compose hash registration

---

## Complete Example: Update Workflow

```typescript
import { createClient, addComposeHash } from '@phala/cloud'
import { base } from 'viem/chains'
import * as fs from 'fs'

async function updateCvmCompose(cvmId: string) {
  const client = createClient({ apiKey: process.env.PHALA_API_KEY })

  // Step 1: Get current Docker Compose (optional, for reference)
  const current = await client.getCvmDockerCompose({ id: cvmId })
  console.log('Current compose:', current)

  // Step 2: Load new Docker Compose
  const newCompose = fs.readFileSync('docker-compose.yml', 'utf-8')

  // Step 3: Attempt update
  const result = await client.updateDockerCompose({
    id: cvmId,
    docker_compose_file: newCompose
  })

  // Step 4: Handle result
  if (result.status === 'precondition_required') {
    console.log('Contract-owned KMS detected. Registering on-chain...')

    // Step 4a: Register compose hash on-chain
    const txResult = await addComposeHash({
      chain: base,
      kmsContractAddress: result.kms_info.kms_contract_address,
      appId: result.app_id,
      privateKey: process.env.PRIVATE_KEY,
      composeHash: result.compose_hash,
    })

    console.log('Transaction hash:', txResult.transactionHash)

    // Step 4b: Retry with transaction hash
    const finalResult = await client.updateDockerCompose({
      id: cvmId,
      docker_compose_file: newCompose,
      compose_hash: result.compose_hash,
      transaction_hash: txResult.transactionHash,
    })

    console.log('Update initiated:', finalResult.correlation_id)
  } else {
    console.log('Update initiated (legacy KMS):', result.correlation_id)
  }
}

updateCvmCompose('your-cvm-id')
```

---

## See Also

- [API Deployment Guide](./api-deployment-guide.md)
- [Error Codes Reference](./error-codes.md)
- [CVM State Monitoring](./cvm-state-monitoring.md)
