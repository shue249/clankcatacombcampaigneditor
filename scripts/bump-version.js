#!/usr/bin/env node
/**
 * Reads the last git commit message to determine bump type (patch/minor/major),
 * increments package.json version accordingly, and creates a git tag.
 *
 * Commit message conventions:
 *   fix: ...        → PATCH bump
 *   feat: ...       → MINOR bump
 *   breaking: ...   → MAJOR bump
 */

const fs = require('fs');
const { execSync } = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

const lastCommit = execSync('git log -1 --pretty=%B').toString().trim().toLowerCase();

let newVersion;
if (lastCommit.startsWith('breaking:')) {
  newVersion = `${major + 1}.0.0`;
} else if (lastCommit.startsWith('feat:')) {
  newVersion = `${major}.${minor + 1}.0`;
} else {
  newVersion = `${major}.${minor}.${patch + 1}`;
}

pkg.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

execSync(`git add package.json`);
execSync(`git commit -m "chore: bump version to ${newVersion}"`);
execSync(`git tag v${newVersion}`);

process.env.RELEASE_VERSION = `v${newVersion}`;
fs.appendFileSync(process.env.GITHUB_ENV || '/dev/null', `RELEASE_VERSION=v${newVersion}\n`);

console.log(`Version bumped to ${newVersion}`);
