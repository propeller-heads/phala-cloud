---
name: phala-cli
description: |
  Phala Cloud CLI reference and usage guide. Covers all phala commands
  for deploying, managing, and debugging TEE applications (CVMs).
  Use when: users ask about phala CLI commands, deployment workflows,
  CVM management, log viewing, SSH access, or troubleshooting deploy errors.
---

# Phala Cloud CLI

Command-line tool for deploying and managing TEE applications on Phala Cloud.

Package: `phala` (npm). Binary names: `phala`, `pha`.

## Quick Start

```bash
npm install -g phala

phala login                     # authenticate (device flow)
phala deploy                    # deploy from docker-compose.yml
phala link                      # bind directory → CVM (creates phala.toml)
phala logs -f                   # stream container logs
phala ssh                       # SSH into the CVM
```

## Command Overview

### Authentication

| Command | Description |
|---------|-------------|
| `phala login [api-key]` | Authenticate (device flow if no key) |
| `phala logout` | Remove stored API key |
| `phala status` | Check auth status (`--json` for scripting) |
| `phala whoami` | Print current user |
| `phala profiles` | List auth profiles |
| `phala switch <profile>` | Switch active profile |

### Deployment

| Command | Description |
|---------|-------------|
| `phala deploy` | Deploy new CVM or update existing |
| `phala instance-types [family]` | List instance types (cpu, gpu) |

### App Management

| Command | Description |
|---------|-------------|
| `phala apps` | List deployed CVMs (with filters) |
| `phala cvms list` | List CVMs (alias for apps) |
| `phala cvms get [id]` | Get CVM details |
| `phala cvms start [id]` | Start a stopped CVM |
| `phala cvms stop [id]` | Stop a running CVM |
| `phala cvms restart [id]` | Restart a CVM |
| `phala cvms delete [id]` | Delete a CVM (`-f` to skip prompt) |
| `phala cvms resize [id]` | Resize CVM resources |
| `phala cvms replicate [id]` | Create a CVM replica |
| `phala cvms attestation [id]` | Get CVM attestation report |
| `phala link [id]` | Link directory to CVM (creates phala.toml) |
| `phala nodes list` | List TEE worker nodes |

### CVM Operations

| Command | Description |
|---------|-------------|
| `phala logs [container]` | Container logs (default mode) |
| `phala logs --serial` | CVM serial console (boot/kernel) |
| `phala logs --cvm-stdout` | CVM stdout channel |
| `phala logs --cvm-stderr` | CVM stderr channel |
| `phala ps [id]` | List containers in a CVM |
| `phala ssh [id]` | SSH into CVM (`--` passes args to ssh) |
| `phala cp <src> <dst>` | SCP files to/from CVM |

### Advanced

| Command | Description |
|---------|-------------|
| `phala api <endpoint>` | Authenticated HTTP request to API |
| `phala self update` | Update the CLI |
| `phala config get/set/list` | Manage CLI configuration |
| `phala completion` | Generate shell completions (bash/zsh/fish) |
| `phala docker login/build/push` | Docker image helpers |
| `phala simulator start/stop` | Local TEE simulator |

## Best Practices

### Use phala.toml for every project

After first deploy, run `phala link` to create `phala.toml`. This file is safe to commit — it contains no secrets, only the CVM identifier and deploy preferences. With it, all commands (`deploy`, `logs`, `ssh`, `cp`, `ps`) work without specifying a CVM ID.

```bash
phala deploy -n my-app -e .env  # first deploy
phala link                      # creates phala.toml
git add phala.toml              # safe to commit

# from now on, everyone on the team can just run:
phala deploy                    # updates the linked CVM
phala logs -f                   # no --cvm-id needed
phala ssh
```

### Debugging with log sources

Container not working? Follow this order:

1. **`phala logs`** — container stdout. If the container is running, app-level errors show here.
2. **`phala logs --serial`** — serial console. If the container didn't start, docker-compose errors and image pull failures show here. Also shows kernel and boot messages.
3. **`phala logs --cvm-stderr`** — CVM stderr. If the CVM itself has issues at the process level.

```bash
# Container is running but app errors
phala logs -f
phala logs my-container         # specific container

# Container didn't start — check serial for docker-compose / pull errors
phala logs --serial

# Still unclear — check CVM-level stderr
phala logs --cvm-stderr

# Narrow down by time
phala logs --since 30m
phala logs --serial --tail 200
```

Use `phala ps` to see which containers are running before checking logs for a specific one.

### Deploy + wait in CI/CD

```bash
export PHALA_CLOUD_API_KEY="phak_..."
phala deploy --name my-app --wait
phala logs --tail 20
```

### Multiple workspaces

```bash
phala login --profile work
phala login --profile personal
phala switch work
phala profiles                  # list all profiles
```

## Common Workflows

### SSH and file transfer

```bash
phala ssh                       # interactive shell
phala ssh -- -L 8080:localhost:80   # port forwarding
phala ssh -- ls /app            # remote command
phala cp ./config.yml :~/       # upload to linked CVM
phala cp my-app:~/logs/ ./logs/ -r  # download directory
```

### Attestation verification

```bash
phala cvms attestation app_abc123
phala cvms attestation --json | jq '.quote'
```

### On-chain KMS deployment

```bash
phala deploy --kms ethereum --private-key 0x... --rpc-url https://...
phala deploy --kms base --private-key 0x... --rpc-url https://...
```

### API access

```bash
phala api /api/v1/cvms                         # GET
phala api /api/v1/cvms -q '.[].name'           # with jq filter
phala api /api/v1/cvms -X POST -f name=test    # POST with fields
```

## Key Concepts

### CVM identification

Commands accept CVM identifiers in multiple formats:
- App ID: `app_abc123def456`
- Instance ID: `instance_abc123`
- UUID: `91b62ea0-6c64-4985-aa6c-fc3c88a02e64`
- Name: `my-app` (matched against workspace CVMs)

### phala.toml

Project config file that binds a directory to a CVM:

```toml
app_id = "app_abc123"
compose_file = "docker-compose.yml"
env_file = ".env"
public_logs = true
listed = false
```

Commands like `deploy`, `logs`, `ssh`, `cp` use this automatically.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `PHALA_CLOUD_API_KEY` | Override stored API key |
| `PHALA_CLOUD_API_PREFIX` | Override API base URL |
| `PHALA_CLOUD_DIR` | Override credentials dir (~/.phala-cloud) |
| `PHALA_UPDATE_CHANNEL` | Release channel for self update |

See [references/commands.md](references/commands.md) for full command details.
See [references/configuration.md](references/configuration.md) for config details.
See [references/troubleshooting.md](references/troubleshooting.md) for error codes and common issues.
