# phala.toml Configuration Guide

`phala.toml` is the project configuration file for Phala Cloud CLI. It allows you to define default settings for your CVM deployments and operations.

## File Location

The CLI looks for `phala.toml` in the current working directory.

## Configuration Fields

### CVM Identifier (Recommended)

**We recommend using the `name` field** to identify your CVM. It's human-readable and follows standard hostname conventions.

```toml
# Recommended: Use a descriptive name
name = "my-production-api"
```

**Name Requirements:**
- Must be 5-63 characters long
- Must start with a letter
- Can only contain lowercase letters, numbers, and hyphens
- Must follow RFC 1123 hostname format

**Good examples:**
```toml
name = "payment-service"
name = "api-gateway-prod"
name = "worker-01"
```

**Bad examples:**
```toml
name = "api"              # Too short (< 5 chars)
name = "My-Service"       # Contains uppercase
name = "-worker"          # Starts with hyphen
name = "service_name"     # Contains underscore
```

---

### Legacy CVM Identifier Fields

For backward compatibility, the following fields are also supported. **You should only use these if you're working with existing deployments or integrations.**

#### `id` - Generic ID (any format)

```toml
# Accepts any string format
id = "my-custom-id"
id = "app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1"
id = "550e8400-e29b-41d4-a716-446655440000"
```

Use this when you need to specify a CVM ID in a non-standard format.

#### `uuid` - UUID Format

```toml
# UUID v4 format (with or without dashes)
uuid = "550e8400-e29b-41d4-a716-446655440000"
uuid = "550e8400e29b41d4a716446655440000"
```

The CLI will automatically normalize UUIDs by removing dashes.

#### `app_id` - Application ID

```toml
# 40-character hexadecimal string (with or without app_ prefix)
app_id = "50b0e827cc6c53f4010b57e588a18c5ef9388cc1"
app_id = "app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1"
```

The CLI will automatically add the `app_` prefix if missing.

#### `instance_id` - Instance ID

```toml
# Instance identifier
instance_id = "instance_abc123xyz"
```

---

### Field Priority

If multiple CVM identifier fields are specified, the CLI uses this priority order:

```
id > uuid > app_id > instance_id > name
```

**Example:**
```toml
id = "custom-id"        # This will be used
name = "my-service"     # This will be ignored
```

**Best Practice:** Only specify one CVM identifier field to avoid confusion.

---

### Gateway Configuration

Configure gateway settings for CVM access:

```toml
# Gateway domain for accessing your CVM
gateway_domain = "gateway.phala.network"

# Gateway port (must be a positive integer)
gateway_port = 8080
```

These settings are optional and typically used for custom gateway configurations.

---

### API Version

Specify the Phala Cloud API version (optional):

```toml
api_version = "v1"
```

This is rarely needed as the CLI uses the latest supported version by default.

---

## Complete Configuration Examples

### Recommended: Minimal Configuration

```toml
# Simple and readable - this is what you should use
name = "my-awesome-app"
```

### With Gateway Configuration

```toml
name = "payment-api"
gateway_domain = "gateway.example.com"
gateway_port = 8080
```

### Gateway-Only Configuration

```toml
# No CVM identifier - useful for pure gateway configuration
gateway_domain = "gateway.phala.network"
gateway_port = 8080
```

### Legacy Configuration (For Reference)

```toml
# Old style - supported for backward compatibility
uuid = "550e8400-e29b-41d4-a716-446655440000"
gateway_domain = "gateway.phala.network"
gateway_port = 8080
api_version = "v1"
```

---

## How the CLI Uses phala.toml

### Priority Chain

When you run CLI commands like `phala deploy` or `phala ssh`, the CVM ID is resolved in this order:

1. **Interactive selection** (if `-i` or `--interactive` flag is used)
2. **Command-line flag** (`--cvm-id` or `--uuid`)
3. **phala.toml configuration** (if present in current directory)

### Example Workflow

```bash
# Without phala.toml
phala ssh --cvm-id my-service

# With phala.toml
echo 'name = "my-service"' > phala.toml
phala ssh  # Automatically uses "my-service"

# Interactive mode (highest priority)
phala ssh -i  # Prompts you to select from available CVMs
```

---

## Creating phala.toml

### Using phala init (Recommended)

```bash
# Initialize a new project
phala init
```

This command will guide you through creating a `phala.toml` file.

### Manual Creation

Create a file named `phala.toml` in your project root:

```bash
cat > phala.toml << 'EOF'
name = "my-app"
EOF
```

---

## Validation

The CLI validates `phala.toml` when loading. Common validation errors:

### Invalid Name Format

```toml
name = "api"  # Error: Must be 5-63 characters
```

**Fix:** Use a longer, descriptive name
```toml
name = "my-api"
```

### Invalid UUID Format

```toml
uuid = "invalid-uuid"  # Error: Invalid UUID format
```

**Fix:** Use a valid UUID v4 or switch to `name`
```toml
name = "my-service"  # Recommended
```

### Invalid Port

```toml
gateway_port = -1  # Error: Must be a positive integer
```

**Fix:** Use a valid port number
```toml
gateway_port = 8080
```

---

## Migration Guide

### Migrating from UUID to Name

If you have existing deployments using UUIDs, you can migrate to using names:

**Before:**
```toml
uuid = "550e8400-e29b-41d4-a716-446655440000"
```

**After:**
```toml
# Use the CVM's name instead (check via: phala cvms list)
name = "my-production-api"
```

**Note:** Make sure the name matches your CVM's actual name in Phala Cloud.

### Backward Compatibility

All existing `phala.toml` files will continue to work. The CLI maintains full backward compatibility with legacy identifier fields.

---

## Troubleshooting

### CVM Not Found

**Error:** `CVM with ID "my-service" not found`

**Solutions:**
1. Check your CVM name: `phala cvms list`
2. Ensure you're using the correct workspace
3. Try interactive mode: `phala ssh -i`

### File Not Found

**Error:** `Project configuration file not found: phala.toml`

**Solutions:**
1. Run `phala init` to create the file
2. Ensure you're in the correct directory
3. Use command-line flags instead: `phala deploy --cvm-id my-service`

### Permission Issues

**Error:** `Failed to read phala.toml`

**Solution:**
```bash
# Check file permissions
ls -l phala.toml

# Fix permissions if needed
chmod 644 phala.toml
```

---

## Best Practices

### ✅ Do

- **Use `name` field** for new projects
- **Use descriptive names** like `payment-api-prod` instead of `api1`
- **Keep one phala.toml per project**
- **Commit phala.toml to version control** (it contains no secrets)
- **Document your naming convention** in team guidelines

### ❌ Don't

- Don't use multiple CVM identifier fields simultaneously
- Don't use uppercase letters or special characters in names
- Don't store secrets in phala.toml (use environment files instead)
- Don't manually edit UUID values (let the platform generate them)

---

## Related Commands

- `phala init` - Create a new phala.toml file
- `phala deploy` - Deploy using phala.toml configuration
- `phala ssh` - SSH into CVM using phala.toml
- `phala cvms list` - List available CVMs and their names

---

## Schema Reference

For developers integrating with the CLI, here's the complete schema:

```typescript
{
  // CVM Identifiers (optional, choose one)
  id?: string;                    // Generic ID (any format)
  uuid?: string;                  // UUID v4 format
  app_id?: string;                // 40-char hex
  instance_id?: string;           // Instance ID
  name?: string;                  // RFC 1123 hostname (recommended)

  // Gateway Configuration (optional)
  gateway_domain?: string;        // Gateway domain
  gateway_port?: number;          // Positive integer

  // API Version (optional)
  api_version?: "v1" | ...;       // Supported API versions
}
```

All fields are optional, and you can have a valid `phala.toml` with only gateway configuration or only a CVM identifier.
