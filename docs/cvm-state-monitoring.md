## CVM State Monitoring Actions

This document describes the two CVM state monitoring actions available in the SDK.

### Overview

Two complementary actions for monitoring CVM state:

1. **`getCvmState`** - One-shot, immediate state retrieval
2. **`watchCvmState`** - SSE-based streaming with automatic retry

---

## `getCvmState` - One-Shot State Query

Immediately retrieves the current state of a CVM without waiting or streaming.

### Usage

```typescript
import { createClient } from '@phala/cloud';
// OR for tree-shaking:
import { createBaseClient, getCvmState, safeGetCvmState } from '@phala/cloud';

const client = createClient({ apiKey: 'your-api-key' });

// Using client method (recommended)
const state = await client.getCvmState({ id: "cvm-123" });
console.log(state.status); // "running", "stopped", etc.

// Using standalone function
const state2 = await getCvmState(client, { id: "cvm-123" });

// Safe variant (no exceptions)
const result = await client.safeGetCvmState({ id: "cvm-123" });
if (result.success) {
  console.log(result.data.status);
} else {
  console.error(result.error);
}
```

### Response Schema

```typescript
interface CvmState {
  status: string;              // Current status
  derived_status?: string;     // Computed status
  vm_uuid?: string;
  instance_id?: string;
  uptime?: string;
}
```

### When to Use

- Quick status checks
- Polling implementation (client-controlled)
- Dashboard displays
- Health checks

---

## `watchCvmState` - SSE Stream with Auto-Retry

Streams real-time state updates until a target status is reached, with automatic retry on timeout/error.

### Key Features

- **Real-time streaming** via Server-Sent Events (SSE)
- **Automatic retry** - Backend timeout is 600s, but SDK retries indefinitely by default
- **AbortController support** for cancellation
- **Event callbacks** for real-time progress updates
- **Type-safe events** with discriminated unions

### Basic Usage

**Note**: `watchCvmState` is a **standalone function** and cannot be called as a client method due to its unique signature (it accepts `options` as a third parameter instead of the standard `parameters`).

```typescript
import { createClient, watchCvmState } from '@phala/cloud';

const client = createClient({ apiKey: 'your-api-key' });

// watchCvmState must be called as a standalone function
const state = await watchCvmState(client, {
  id: "cvm-123",
  target: "running"
});

console.log("CVM is now running!");

// ❌ This will NOT work:
// await client.watchCvmState({ id: "cvm-123", target: "running" })
```

### Advanced Usage

```typescript
import { watchCvmState, type SSEEvent } from '@phala/cloud';

// With abort controller and event callbacks
const controller = new AbortController();

try {
  const state = await watchCvmState(
    client,
    {
      id: "cvm-123",
      target: "running",
      interval: 10,          // Poll every 10 seconds
      timeout: 300,          // 5 minutes per attempt
      maxRetries: 10,        // Max 10 retries (default: Infinity)
      retryDelay: 5000,      // 5 seconds between retries
    },
    {
      signal: controller.signal,
      onEvent: (event: SSEEvent) => {
        switch (event.type) {
          case "state":
            console.log("Current status:", event.data.status);
            break;
          case "complete":
            console.log("Target reached!", event.data);
            break;
          case "timeout":
            console.log("Attempt timed out, retrying...");
            break;
          case "error":
            console.error("Error:", event.data.error);
            break;
        }
      }
    }
  );

  console.log("Final state:", state);
} catch (error) {
  if (error instanceof WatchAbortedError) {
    console.log("Watch cancelled by user");
  } else if (error instanceof MaxRetriesExceededError) {
    console.log("Max retries exceeded");
  } else {
    console.error("Unexpected error:", error);
  }
}

// Cancel after 30 seconds
setTimeout(() => controller.abort(), 30000);
```

### Parameters

```typescript
interface WatchCvmStateRequest {
  id?: string;                // CVM ID (any format)
  uuid?: string;              // UUID format
  app_id?: string;            // App ID
  instance_id?: string;       // Instance ID
  target: string;             // Target status to wait for
  interval?: number;          // Polling interval (5-30s, default: 5)
  timeout?: number;           // Timeout per attempt (10-600s, default: 300)
  maxRetries?: number;        // Max retry attempts (default: Infinity)
  retryDelay?: number;        // Delay between retries (ms, default: 5000)
}

interface WatchCvmStateOptions {
  signal?: AbortSignal;       // For cancellation
  onEvent?: (event: SSEEvent) => void;  // Event callback
}
```

### SSE Events

The `onEvent` callback receives strongly-typed events:

```typescript
type SSEEvent =
  | { type: "state"; data: CvmState }
  | { type: "complete"; data: { status: string; elapsed: number; target: string } }
  | { type: "timeout"; data: { error: string; elapsed: number; target: string } }
  | { type: "error"; data: { error: string; elapsed?: number; message?: string } };
```

### Error Handling

```typescript
import { WatchAbortedError, MaxRetriesExceededError } from '@phala/cloud';

try {
  const state = await watchCvmState(client, { id: cvmId, target: "running" });
} catch (error) {
  if (error instanceof WatchAbortedError) {
    // User cancelled via AbortController
  } else if (error instanceof MaxRetriesExceededError) {
    // Max retries exceeded
    console.log(`Failed after ${error.attempts} attempts`);
  } else {
    // Other errors (network, etc.)
  }
}
```

### Retry Behavior

The backend has a maximum timeout of 600 seconds per attempt. The SDK provides automatic retry:

```typescript
// Unlimited retries (default)
await watchCvmState(client, {
  id: "cvm-123",
  target: "running"
  // maxRetries defaults to Infinity
});

// Limited retries
await watchCvmState(client, {
  id: "cvm-123",
  target: "running",
  maxRetries: 5,        // Retry up to 5 times
  retryDelay: 10000,    // 10 seconds between retries
});
```

**Total wait time** = `(timeout * maxRetries) + (retryDelay * (maxRetries - 1))`

Example: `timeout=300, maxRetries=5, retryDelay=10000` = ~25 minutes max

### When to Use

- **Starting CVMs**: Wait for "running" status after start
- **Stopping CVMs**: Wait for "stopped" status after shutdown
- **Restarting**: Wait for status transition
- **Deployment automation**: Chain operations with state verification

---

## Comparison

| Feature | `getCvmState` | `watchCvmState` |
|---------|---------------|-----------------|
| **Mode** | One-shot | Streaming (SSE) |
| **Returns** | Immediate | When target reached |
| **Retries** | Manual | Automatic |
| **Cancellation** | N/A | AbortController |
| **Events** | No | Yes (callbacks) |
| **Use Case** | Status checks | Wait for transitions |
| **Network** | Single request | Long-lived connection |
| **Client Method** | ✅ `client.getCvmState()` | ❌ Standalone only |
| **Tree-Shaking** | ✅ Import individually | ✅ Import individually |

---

## React Example

```typescript
import { useState, useEffect } from 'react';
import { watchCvmState } from '@phala/cloud';

function CvmStatusMonitor({ cvmId, targetStatus }) {
  const [status, setStatus] = useState<string>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    watchCvmState(
      client,
      { id: cvmId, target: targetStatus },
      {
        signal: controller.signal,
        onEvent: (event) => {
          if (event.type === 'state') {
            setStatus(event.data.status);
          } else if (event.type === 'error') {
            setError(event.data.error);
          }
        }
      }
    ).catch((err) => {
      if (!(err instanceof WatchAbortedError)) {
        setError(err.message);
      }
    });

    return () => controller.abort();
  }, [cvmId, targetStatus]);

  return (
    <div>
      <p>Current Status: {status}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## Best Practices

### 1. Choose the Right Action

- Use `getCvmState` for:
  - Quick status checks
  - Dashboard updates with client-side polling
  - Health checks

- Use `watchCvmState` for:
  - Waiting for specific state transitions
  - Automation workflows
  - Real-time monitoring

### 2. Always Use AbortController

```typescript
const controller = new AbortController();

// Start watch
const promise = watchCvmState(client, { id: cvmId, target: "running" }, {
  signal: controller.signal
});

// Cleanup on unmount/cancel
return () => controller.abort();
```

### 3. Handle All Event Types

```typescript
onEvent: (event) => {
  switch (event.type) {
    case "state":
      // Update UI with current state
      break;
    case "complete":
      // Success! Target reached
      break;
    case "timeout":
      // Inform user of retry
      break;
    case "error":
      // Show error message
      break;
  }
}
```

### 4. Set Reasonable Timeouts

```typescript
// For quick operations (start/stop)
{ timeout: 120, maxRetries: 3 }  // 6 minutes max

// For slow operations (restart)
{ timeout: 300, maxRetries: 5 }  // 25 minutes max

// For unlimited waiting
{ timeout: 600, maxRetries: Infinity }  // Will retry forever
```

### 5. Connection Limits

The backend limits **5 concurrent SSE connections per user**. If you need to monitor multiple CVMs:

```typescript
// ❌ Bad: Opens 10 connections
const promises = cvmIds.map(id =>
  watchCvmState(client, { id, target: "running" })
);

// ✅ Good: Sequential or batched
for (const id of cvmIds) {
  await watchCvmState(client, { id, target: "running" });
}
```

---

## Testing

Both actions have comprehensive test coverage. See:
- `get_cvm_state.test.ts`
- `watch_cvm_state.test.ts`

Run tests:
```bash
npm test -- get_cvm_state
npm test -- watch_cvm_state
```
