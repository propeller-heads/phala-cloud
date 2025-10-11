#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseVersion(version) {
  // Parse version string like "1.0.37-beta.0"
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.(\d+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    prereleaseNum: match[5] ? parseInt(match[5]) : null
  };
}

function formatVersion(parsed) {
  let version = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
  if (parsed.prerelease !== null) {
    version += `-${parsed.prerelease}.${parsed.prereleaseNum}`;
  }
  return version;
}

function bumpVersion(version, releaseType, distTag = null) {
  const parsed = parseVersion(version);
  const effectiveDistTag = distTag || 'latest';

  // Case 1: Current version is prerelease, same dist-tag -> increment prerelease counter only
  if (parsed.prerelease && parsed.prerelease === effectiveDistTag) {
    parsed.prereleaseNum++;
    return formatVersion(parsed);
  }

  // Case 2: Current version is prerelease, releasing to latest -> remove prerelease
  if (parsed.prerelease && effectiveDistTag === 'latest') {
    // Keep the base version, remove prerelease
    return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
  }

  // Case 3: Bump base version
  switch (releaseType) {
    case 'major':
      parsed.major++;
      parsed.minor = 0;
      parsed.patch = 0;
      break;
    case 'minor':
      parsed.minor++;
      parsed.patch = 0;
      break;
    case 'patch':
      parsed.patch++;
      break;
    default:
      throw new Error(`Invalid release type: ${releaseType}`);
  }

  // Case 4: Add prerelease tag if needed
  if (effectiveDistTag !== 'latest') {
    parsed.prerelease = effectiveDistTag;
    parsed.prereleaseNum = 0;
    return formatVersion(parsed);
  }

  // Case 5: Regular release
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

function main() {
  const [, , packageName, releaseType, distTag] = process.argv;

  if (!packageName || !releaseType) {
    console.error('Usage: node bump-version.js <package> <release-type> [dist-tag]');
    process.exit(1);
  }

  const allowedPackages = ['cli', 'js'];
  const allowedReleaseTypes = ['patch', 'minor', 'major'];
  const allowedDistTags = ['latest', 'beta', 'alpha', 'rc'];

  if (!allowedPackages.includes(packageName)) {
    console.error(`Invalid package: ${packageName}. Must be one of: ${allowedPackages.join(', ')}`);
    process.exit(1);
  }

  if (!allowedReleaseTypes.includes(releaseType)) {
    console.error(`Invalid release type: ${releaseType}. Must be one of: ${allowedReleaseTypes.join(', ')}`);
    process.exit(1);
  }

  if (distTag && !allowedDistTags.includes(distTag)) {
    console.error(`Invalid dist-tag: ${distTag}. Must be one of: ${allowedDistTags.join(', ')}`);
    process.exit(1);
  }

  const packageJsonPath = path.join(process.cwd(), packageName, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at: ${packageJsonPath}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;
  const effectiveDistTag = distTag || 'latest';
  const newVersion = bumpVersion(oldVersion, releaseType, effectiveDistTag);

  packageJson.version = newVersion;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf8');

  const isPrerelease = newVersion.includes('-');
  console.log(`Bumped ${packageName} from ${oldVersion} to ${newVersion} (dist-tag: ${effectiveDistTag})`);

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${newVersion}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `is_prerelease=${isPrerelease}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `dist_tag=${effectiveDistTag}\n`);
  }
}

main();
