# Error Handling

The SDK provides structured error classes and flexible error handling options.

## Error Types

All errors extend from `PhalaCloudError` with these subtypes:

- `ValidationError` (422) - Invalid input with field details
- `AuthError` (401/403) - Authentication/permission errors
- `BusinessError` (400) - Business logic errors
- `ServerError` (500+) - Server-side errors
- `UnknownError` - Network or unknown errors

Each error includes:
- `status` - HTTP status code
- `message` - Error description
- `detail` - Raw API error details

## Basic Usage

### Try-Catch Pattern

```typescript
import { createClient, type PhalaCloudError } from "@phala/cloud";

const client = createClient({ apiKey: "your-api-key" });

try {
  await client.post("/cvms", { name: "my-cvm" });
} catch (error) {
  const err = error as PhalaCloudError;

  if (err.isValidationError) {
    // TypeScript knows validationErrors exists
    err.validationErrors.forEach(e => {
      console.log(`${e.field}: ${e.message}`);
    });
  } else if (err.isAuthError) {
    // Redirect to login
    router.push("/login");
  } else if (err.isBusinessError) {
    // Show error message
    toast.error(err.message);
  }
}
```

### Event Listener Pattern

For centralized error handling:

```typescript
const client = createClient({ apiKey: "your-api-key" });

client.on("error", (error) => {
  console.error("API Error:", error.message);

  if (error.isAuthError) {
    router.push("/login");
  }
});
```

## Type Checking

Use discriminator properties to check error types:

```typescript
if (error.isValidationError) {
  // TypeScript automatically knows about validationErrors
  console.log(error.validationErrors);
}
```

Available discriminators: `isValidationError`, `isAuthError`, `isBusinessError`, `isServerError`, `isUnknownError`

## Common Scenarios

### Handle Validation Errors

```typescript
try {
  await client.post("/cvms", data);
} catch (error) {
  const err = error as PhalaCloudError;

  if (err.isValidationError) {
    const fieldErrors = {};
    err.validationErrors.forEach(e => {
      fieldErrors[e.field] = e.message;
    });
    setFormErrors(fieldErrors);
  }
}
```

### React Error Hook

```typescript
import { useEffect } from "react";
import { client } from "./client";

export function useApiErrors() {
  useEffect(() => {
    const handler = (error) => {
      if (error.isAuthError) {
        toast.error("Please login to continue");
      } else if (error.isValidationError) {
        toast.error("Please check your input");
      } else {
        toast.error(error.message);
      }
    };

    client.on("error", handler);
    return () => client.off("error", handler);
  }, []);
}
```

### Vue Error Composable

```typescript
import { onMounted, onUnmounted } from "vue";
import { client } from "./client";

export function useApiErrors() {
  const handler = (error) => {
    if (error.isAuthError) {
      router.push("/login");
    }
  };

  onMounted(() => client.on("error", handler));
  onUnmounted(() => client.off("error", handler));
}
```

### Multiple Event Listeners

```typescript
// Analytics
client.on("error", (error) => {
  analytics.track("api_error", {
    type: error.constructor.name,
    status: error.status
  });
});

// User notifications
client.on("error", (error) => {
  if (!error.isAuthError) {
    toast.error(error.message);
  }
});
```

## Event Methods

- `client.on(type, handler)` - Add event listener
- `client.off(type, handler)` - Remove event listener
- `client.once(type, handler)` - Listen once

Use wildcard for all events:
```typescript
client.on("*", (type, data) => {
  console.log(`Event: ${type}`, data);
});
```

## Notes

- Event handlers don't suppress errors - errors are still thrown
- Always clean up listeners when components unmount
- Multiple listeners can be registered for the same event
