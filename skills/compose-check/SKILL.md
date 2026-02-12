---
name: compose-check
description: |
  Pre-deploy validation for docker-compose.yml and Docker build targeting Phala Cloud CVMs.
  Checks architecture, file size, secrets leakage, volume mounts, and single-file constraints.
  Use when: user shares a docker-compose.yml or Dockerfile for review before deploying to Phala Cloud,
  or when a CVM deploy fails due to compose/image issues.
---

# Compose Pre-Deploy Check

Validate docker-compose.yml and Docker build configuration before deploying to a Phala Cloud CVM.

## When to Run

| User says | Action |
|-----------|--------|
| "review my compose", "check before deploy" | Run **Full Checklist** |
| "deploy failed", "container won't start" | Run **Full Checklist** + check serial logs (`phala logs --serial`) |
| "need TEE features", "dstack", "attestation in app" | Run **TEE Volume Check** |
| "image pull error", "unauthorized" | Jump to **Image Accessibility** |
| "compose too large", "payload size" | Jump to **File Size** |

---

## Full Checklist

Run every check in order. Stop and report the first failure. Mark each as PASS/FAIL in output.

### 1. Single-File Constraint

Phala Cloud accepts **one docker-compose.yml** — no external file references.

**FAIL if any of these appear:**

| Field | Example | Why it fails |
|-------|---------|-------------|
| `build` with path context | `build: ./app` | Build context directory not available on CVM |
| `build.dockerfile` | `dockerfile: Dockerfile.prod` | External Dockerfile not uploaded |
| `extends` | `extends: file: base.yml` | External compose file not available |
| `env_file` | `env_file: .env` | External file not available — use `phala deploy -e .env` instead |
| `configs` / `secrets` (file-based) | `file: ./my_config` | External files not uploaded |
| `volumes` with host bind (source files) | `./src:/app/src` | Host files don't exist on CVM |

**PASS if:**
- `build` with inline Dockerfile (multi-line `dockerfile_inline`) — allowed but check Step 2
- `image` references only — preferred pattern
- Named volumes — fine (`data:/var/lib/db`)

**Inline build is allowed** but discouraged for large builds. The entire inline content counts toward the 200KB size limit.

### 2. File Size

Combined size of `docker_compose_file` + `pre_launch_script` must be **≤ 200KB** (200 × 1024 = 204,800 bytes).

Measure in UTF-8 bytes, not characters (CJK characters = 3 bytes each).

**If close to limit:** Inline Dockerfiles and long scripts are the usual culprits. Move the Dockerfile out — pre-build and push the image to a registry, then reference by `image:` tag.

### 3. Architecture — amd64 Only

Phala Cloud CVMs run on **Intel TDX hardware (x86_64/amd64)**. ARM images will not work.

**Check Dockerfile / build config:**

| Pattern | Verdict |
|---------|---------|
| `FROM --platform=linux/amd64 ...` | PASS — explicit |
| `FROM node:20` (no platform specified) | WARN — works if built on amd64 host, fails if built on Apple Silicon / ARM |
| `FROM --platform=linux/arm64 ...` | FAIL |
| `GOARCH=arm64` or `TARGETARCH=arm64` | FAIL |

**Recommendation:** Always build with explicit platform:

```bash
docker buildx build --platform linux/amd64 -t myimage:latest .
```

Or in docker-compose.yml inline build:

```yaml
services:
  app:
    build:
      dockerfile_inline: |
        FROM --platform=linux/amd64 node:20-slim
        ...
```

**If user builds on Apple Silicon (M1/M2/M3):** They MUST use `--platform linux/amd64` or `docker buildx`. Default build produces arm64 images that crash on CVM boot with no obvious error message — serial logs may show exec format errors.

### 4. Image Accessibility

Every `image:` in the compose file must be pullable from the CVM at boot time.

| Image type | What to check |
|------------|---------------|
| Public (Docker Hub, ghcr.io) | Verify tag exists: `docker manifest inspect <image>` |
| Private registry | User must set `DSTACK_DOCKER_USERNAME` + `DSTACK_DOCKER_PASSWORD` in env file |
| AWS ECR | User must set `DSTACK_AWS_ACCESS_KEY_ID` + `DSTACK_AWS_SECRET_ACCESS_KEY` + `DSTACK_AWS_REGION` + `DSTACK_AWS_ECR_REGISTRY` in env file |
| `localhost` / `127.0.0.1` image | FAIL — no local Docker daemon on CVM |

Registry credentials go in the **env file** (`phala deploy -e .env`), NOT in docker-compose.yml. They are encrypted client-side before transmission.

### 5. Secrets Leakage

Scan docker-compose.yml for hardcoded secrets. **FAIL if any found.**

| Pattern | Examples |
|---------|----------|
| Private keys | `PRIVATE_KEY=0x...`, `-----BEGIN RSA PRIVATE KEY-----` |
| API keys / tokens | `API_KEY=sk-...`, `TOKEN=ghp_...`, `AWS_SECRET_ACCESS_KEY=...` |
| Passwords | `PASSWORD=...`, `DB_PASSWORD=...`, `REDIS_PASSWORD=...` |
| Connection strings with credentials | `postgres://user:pass@...`, `mongodb://user:pass@...` |
| JWT secrets | `JWT_SECRET=...`, `SECRET_KEY=...` |

**Fix:** Move all secrets to the env file and deploy with `phala deploy -e .env`. Environment variables are encrypted client-side before reaching the API. The docker-compose.yml itself is stored as plaintext in the backend.

Acceptable in compose: variable references like `${DB_PASSWORD}` (resolved from env file at runtime).

### 6. TEE Volume Mount

If the application needs TEE capabilities (key derivation, attestation quotes, TDX info), it must mount the dstack socket.

**Check:** Does any service have this volume?

```yaml
volumes:
  - /var/run/dstack.sock:/var/run/dstack.sock
```

| Scenario | Verdict |
|----------|---------|
| App uses dstack SDK / calls TEE API | FAIL if volume missing — app can't reach TEE |
| App is a plain web service, no TEE features | PASS without volume — not needed |
| Volume uses legacy path `/var/run/tappd.sock` | WARN — still works but recommend migrating to `dstack.sock` |

**Both sockets are available** on the CVM. The dstack SDK tries `dstack.sock` first, falls back to `tappd.sock`. But the volume must be mounted for the container to access either.

### 7. Port and Network Sanity

Quick checks:

- `ports:` with host binding (e.g., `"8080:80"`) — fine, CVM maps these
- `network_mode: host` — works but unusual for CVM
- Multiple services exposing same host port — FAIL, port conflict at runtime

---

## Output Format

After running all checks, report:

```
## Compose Pre-Deploy Check

| # | Check | Result | Detail |
|---|-------|--------|--------|
| 1 | Single-file constraint | PASS | No external file references |
| 2 | File size | PASS | 12KB (limit: 200KB) |
| 3 | Architecture | WARN | No --platform specified, verify build host is amd64 |
| 4 | Image accessibility | PASS | All images are public Docker Hub |
| 5 | Secrets leakage | FAIL | Line 15: hardcoded `PRIVATE_KEY=0x...` |
| 6 | TEE volume mount | PASS | dstack.sock mounted on service "app" |
| 7 | Port/network | PASS | No conflicts |

### Actions Required
- **[FAIL] Secrets leakage:** Move `PRIVATE_KEY` to env file, use `${PRIVATE_KEY}` reference in compose
```

Only list Actions Required for FAIL and WARN items. Skip if all PASS.

---

## Gotchas

| Issue | Detail |
|-------|--------|
| Apple Silicon default builds arm64 | `docker build` on M1/M2/M3 without `--platform linux/amd64` produces unusable images. Serial logs show `exec format error`. |
| `env_file:` in compose ≠ `phala deploy -e` | Compose `env_file:` references a file that doesn't exist on CVM. Use `phala deploy -e .env` which encrypts and transmits vars separately. |
| Inline Dockerfile eats size budget | A 50-line Dockerfile inlined via `dockerfile_inline` can push compose over 200KB when combined with pre-launch script. Pre-build and push to registry instead. |
| `docker-compose.yml` is stored as plaintext | The compose content is visible in the backend. Only env vars (via `-e`) are encrypted. Never put secrets in the compose file. |
| Volume `.:/app` doesn't work | Host bind mounts with relative paths reference the CVM filesystem, not the developer's machine. Only named volumes and specific system paths (like dstack.sock) are meaningful. |
| `depends_on` with `condition: service_healthy` | Health checks work normally but add boot latency. Keep health check intervals short for CVM startup. |
| `restart: unless-stopped` recommended | Without restart policy, a crashed container stays down. CVM won't auto-heal. |
