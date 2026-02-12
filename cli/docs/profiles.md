# phala profiles

List all authentication profiles.

## Usage

```bash
phala profiles
```

The active profile is marked with an asterisk (*).

## Examples

### List all profiles

```bash
$ phala profiles
* default
  work
  personal
```

### Check if profiles exist in scripts

```bash
$ phala profiles | grep -q "work"
$ if [ $? -eq 0 ]; then
    echo "Work profile exists"
  fi
```

## Profile Management

### Create a new profile

Use `phala login --profile <name>`:

```bash
$ phala login --profile work
Opening browser for authentication...
✓ Saved credentials to profile: work
```

### Switch between profiles

Use `phala switch <name>`:

```bash
$ phala switch work
✓ Switched to profile: work
```

### Delete a profile

Manually remove the profile file:

```bash
$ rm ~/.phala-cloud/profiles/work.json
```

## Profile Storage

Profiles are stored in `~/.phala-cloud/profiles/<name>.json`

Each profile contains:
- API key
- Workspace information
- User metadata

