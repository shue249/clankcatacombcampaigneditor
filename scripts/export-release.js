#!/usr/bin/env node
/**
 * Packages the dist/ build output and version metadata into a zip file
 * under release/ for attachment to the GitHub Release.
 *
 * Output: release/clank-campaign-editor-v{version}.zip
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const releaseDir = path.join(__dirname, '..', 'release');
const distDir = path.join(__dirname, '..', 'dist');
const zipName = `clank-campaign-editor-v${version}.zip`;
const zipPath = path.join(releaseDir, zipName);

if (!fs.existsSync(distDir)) {
  console.error('ERROR: dist/ not found — run npm run build first');
  process.exit(1);
}

fs.mkdirSync(releaseDir, { recursive: true });

// Write a version metadata file into dist before zipping
fs.writeFileSync(
  path.join(distDir, 'version.json'),
  JSON.stringify({ version, builtAt: new Date().toISOString() }, null, 2)
);

execSync(`cd dist && zip -r "${zipPath}" .`);

console.log(`Release artifact created: release/${zipName}`);
