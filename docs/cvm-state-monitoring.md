# CVM State Monitoring

Monitor CVM state changes with two simple actions: get current state or wait for a target state.

## Quick Start

### Get current state (one-shot)

```typescript
import { createClient } from '@phala/cloud';

const client = createClient({ apiKey: 'your-api-key' });

const state = await client.getCvmState({ id: "cvm-123" });
console.log(state.status); // "running", "stopped", etc.
```

### Wait for state transition (streaming)

```typescript
import { createClient, watchCvmState } from '@phala/cloud';

const client = createClient({ apiKey: 'your-api-key' });

const state = await watchCvmState(client, {
  id: "cvm-123",
  target: "running"
});

console.log("CVM is now running!");
```

---

## `getCvmState` - Get Current State

Immediately returns the current state of a CVM.

### Basic Usage

```typescript
const state = await client.getCvmState({ id: "cvm-123" });

console.log(state.status);        // "running", "stopped", "starting", etc.
console.log(state.instance_id);   // Optional: instance identifier
console.log(state.uptime);        // Optional: uptime string
```

### Response

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
- Dashboard displays
- Health checks

---

## `watchCvmState` - Wait for Target State

Streams state updates via Server-Sent Events (SSE) until target status is reached.

**Key Features:**
- Real-time streaming updates
- Automatic retry on timeout (infinite by default)
- Cancellable via AbortController
- Event callbacks for progress tracking

### Basic Usage

```typescript
import { watchCvmState } from '@phala/cloud';

const state = await watchCvmState(client, {
  id: "cvm-123",
  target: "running"
});
```

**Important**: `watchCvmState` is a standalone function, not a client method.

### With Event Callbacks

```typescript
const state = await watchCvmState(
  client,
  {
    id: "cvm-123",
    target: "running"
  },
  {
    onEvent: (event) => {
      if (event.type === "state") {
        console.log("Current status:", event.data.status);
      }
    }
  }
);
```

### With Cancellation

```typescript
const controller = new AbortController();

const promise = watchCvmState(
  client,
  { id: "cvm-123", target: "running" },
  { signal: controller.signal }
);

// Cancel after 30 seconds
setTimeout(() => controller.abort(), 30000);

try {
  await promise;
} catch (error) {
  if (error instanceof WatchAbortedError) {
    console.log("Cancelled by user");
  }
}
```

### When to Use

- Wait for CVM to start
- Wait for CVM to stop
- Automation workflows
- Real-time monitoring

---

## Advanced Usage

### Custom Polling Intervals

```typescript
await watchCvmState(client, {
  id: "cvm-123",
  target: "running",
  interval: 10,     // Poll every 10 seconds (default: 5)
  timeout: 300      // 5 minutes per attempt (default: 300)
});
```

### Limited Retries

```typescript
import { MaxRetriesExceededError } from '@phala/cloud';

try {
  await watchCvmState(client, {
    id: "cvm-123",
    target: "running",
    maxRetries: 5,      // Max 5 attempts (default: Infinity)
    retryDelay: 10000   // 10s between retries (default: 5000)
  });
} catch (error) {
  if (error instanceof MaxRetriesExceededError) {
    console.log(`Failed after ${error.attempts} attempts`);
  }
}
```

### All Event Types

```typescript
import type { SSEEvent } from '@phala/cloud';

await watchCvmState(
  client,
  { id: "cvm-123", target: "running" },
  {
    onEvent: (event: SSEEvent) => {
      switch (event.type) {
        case "state":
          // Current state update
          console.log("Status:", event.data.status);
          break;
        case "complete":
          // Target reached
          console.log("Completed in", event.data.elapsed, "seconds");
          break;
        case "timeout":
          // Single attempt timed out, will retry
          console.log("Timed out, retrying...");
          break;
        case "error":
          // Error occurred, will retry
          console.error("Error:", event.data.error);
          break;
      }
    }
  }
);
```

### Safe Variant (No Exceptions)

```typescript
const result = await client.safeGetCvmState({ id: "cvm-123" });

if (result.success) {
  console.log(result.data.status);
} else {
  console.error(result.error.message);
}
```

---

## Parameters Reference

### `getCvmState` Parameters

```typescript
{
  id?: string;          // CVM ID (any format)
  uuid?: string;        // UUID format
  app_id?: string;      // App ID
  instance_id?: string; // Instance ID
}
```

### `watchCvmState` Parameters

```typescript
// Request parameters (second argument)
{
  id?: string;          // CVM ID (any format)
  uuid?: string;        // UUID format
  app_id?: string;      // App ID
  instance_id?: string; // Instance ID
  target: string;       // Target status to wait for (required)
  interval?: number;    // Polling interval: 5-30 seconds (default: 5)
  timeout?: number;     // Timeout per attempt: 10-600 seconds (default: 300)
  maxRetries?: number;  // Max retry attempts (default: Infinity)
  retryDelay?: number;  // Delay between retries in ms (default: 5000)
}

// Options (third argument)
{
  signal?: AbortSignal;                 // For cancellation
  onEvent?: (event: SSEEvent) => void;  // Event callback
}
```

### SSE Event Types

```typescript
type SSEEvent =
  | { type: "state"; data: CvmState }
  | { type: "complete"; data: { status: string; elapsed: number; target: string } }
  | { type: "timeout"; data: { error: string; elapsed: number; target: string } }
  | { type: "error"; data: { error: string; elapsed?: number; message?: string } };
```

---

## Best Practices

### 1. Always use AbortController in UI

```typescript
useEffect(() => {
  const controller = new AbortController();

  watchCvmState(
    client,
    { id: cvmId, target: "running" },
    { signal: controller.signal }
  );

  return () => controller.abort();
}, [cvmId]);
```

### 2. Set reasonable timeouts

```typescript
// Quick operations (start/stop)
{ timeout: 120, maxRetries: 3 }  // 6 minutes max

// Slow operations (restart)
{ timeout: 300, maxRetries: 5 }  // 25 minutes max
```

### 3. Respect connection limits

The backend limits **5 concurrent SSE connections per user**.

```typescript
// ❌ Bad: Opens 10 connections
await Promise.all(
  cvmIds.map(id => watchCvmState(client, { id, target: "running" }))
);

// ✅ Good: Sequential
for (const id of cvmIds) {
  await watchCvmState(client, { id, target: "running" });
}
```

---

## Error Handling

```typescript
import {
  WatchAbortedError,
  MaxRetriesExceededError,
  PhalaCloudError
} from '@phala/cloud';

try {
  await watchCvmState(client, { id: cvmId, target: "running" });
} catch (error) {
  if (error instanceof WatchAbortedError) {
    // User cancelled
  } else if (error instanceof MaxRetriesExceededError) {
    // Max retries exceeded
    console.log(`Failed after ${error.attempts} attempts`);
  } else if (error instanceof PhalaCloudError) {
    // API error
    console.error(error.message);
  } else {
    // Network or other error
    throw error;
  }
}
```

---

## Comparison

| Feature | `getCvmState` | `watchCvmState` |
|---------|---------------|-----------------|
| Mode | One-shot | Streaming (SSE) |
| Returns | Immediate | When target reached |
| Retries | Manual | Automatic |
| Events | No | Yes |
| Use Case | Status checks | Wait for transitions |

---

## React Example

```typescript
import { useState, useEffect } from 'react';
import { createClient, watchCvmState, WatchAbortedError } from '@phala/cloud';

const client = createClient({ apiKey: process.env.PHALA_API_KEY });

function CvmStatusMonitor({ cvmId, targetStatus }) {
  const [status, setStatus] = useState('unknown');
  const [error, setError] = useState(null);

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

  if (error) return <p>Error: {error}</p>;
  return <p>Status: {status}</p>;
}
```
