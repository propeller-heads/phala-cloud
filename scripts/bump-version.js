#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function bumpVersion(version, releaseType) {
  const parts = version.split('.').map(Number);

  switch (releaseType) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
    default:
      throw new Error(`Invalid release type: ${releaseType}`);
  }

  return parts.join('.');
}

function main() {
  const [, , packageName, releaseType] = process.argv;

  if (!packageName || !releaseType) {
    console.error('Usage: node bump-version.js <package> <release-type>');
    process.exit(1);
  }

  const allowedPackages = ['cli', 'js'];
  const allowedReleaseTypes = ['patch', 'minor', 'major'];

  if (!allowedPackages.includes(packageName)) {
    console.error(`Invalid package: ${packageName}. Must be one of: ${allowedPackages.join(', ')}`);
    process.exit(1);
  }

  if (!allowedReleaseTypes.includes(releaseType)) {
    console.error(`Invalid release type: ${releaseType}. Must be one of: ${allowedReleaseTypes.join(', ')}`);
    process.exit(1);
  }

  const packageJsonPath = path.join(process.cwd(), packageName, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at: ${packageJsonPath}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;
  const newVersion = bumpVersion(oldVersion, releaseType);

  packageJson.version = newVersion;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf8');

  console.log(`Bumped ${packageName} from ${oldVersion} to ${newVersion}`);

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${newVersion}\n`);
  }
}

main();
