#!/usr/bin/env node
/**
 * Generates a changelog entry from git commits since the last tag.
 * Writes docs/changelog/LATEST.md (used by the release workflow as the release body)
 * and appends a dated entry to docs/changelog/CHANGELOG.md.
 *
 * Commit prefixes mapped to sections:
 *   feat:     → Features
 *   fix:      → Bug Fixes
 *   breaking: → Breaking Changes
 *   chore:    → Internal (excluded from release notes)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const date = new Date().toISOString().split('T')[0];

let lastTag;
try {
  lastTag = execSync('git describe --tags --abbrev=0 HEAD~1').toString().trim();
} catch {
  lastTag = '';
}

const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
const commits = execSync(`git log ${range} --pretty=%s`).toString().trim().split('\n').filter(Boolean);

const sections = { 'Breaking Changes': [], 'Features': [], 'Bug Fixes': [] };

commits.forEach(msg => {
  if (msg.startsWith('breaking:')) sections['Breaking Changes'].push(msg.replace('breaking:', '').trim());
  else if (msg.startsWith('feat:')) sections['Features'].push(msg.replace('feat:', '').trim());
  else if (msg.startsWith('fix:')) sections['Bug Fixes'].push(msg.replace('fix:', '').trim());
});

const lines = [`# v${version} — ${date}`, ''];
for (const [heading, items] of Object.entries(sections)) {
  if (items.length === 0) continue;
  lines.push(`## ${heading}`);
  items.forEach(item => lines.push(`- ${item}`));
  lines.push('');
}

const content = lines.join('\n');
const changelogDir = path.join(__dirname, '..', 'docs', 'changelog');
fs.mkdirSync(changelogDir, { recursive: true });

fs.writeFileSync(path.join(changelogDir, 'LATEST.md'), content);

const fullLog = path.join(changelogDir, 'CHANGELOG.md');
const existing = fs.existsSync(fullLog) ? fs.readFileSync(fullLog, 'utf8') : '';
fs.writeFileSync(fullLog, content + '\n---\n\n' + existing);

console.log(`Changelog written for v${version}`);
