#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = pkg.version
const date = new Date().toISOString().split('T')[0]

let lastTag
try {
  lastTag = execSync('git describe --tags --abbrev=0 HEAD~1').toString().trim()
} catch {
  lastTag = ''
}

const range = lastTag ? `${lastTag}..HEAD` : 'HEAD'
const commits = execSync(`git log ${range} --pretty=%s`).toString().trim().split('\n').filter(Boolean)

const sections = { 'Breaking Changes': [], 'Features': [], 'Bug Fixes': [] }

commits.forEach(msg => {
  if (msg.startsWith('breaking:')) sections['Breaking Changes'].push(msg.replace('breaking:', '').trim())
  else if (msg.startsWith('feat:')) sections['Features'].push(msg.replace('feat:', '').trim())
  else if (msg.startsWith('fix:')) sections['Bug Fixes'].push(msg.replace('fix:', '').trim())
})

const lines = [`# v${version} — ${date}`, '']
for (const [heading, items] of Object.entries(sections)) {
  if (items.length === 0) continue
  lines.push(`## ${heading}`)
  items.forEach(item => lines.push(`- ${item}`))
  lines.push('')
}

const content = lines.join('\n')
const changelogDir = path.join(__dirname, '..', 'docs', 'changelog')
fs.mkdirSync(changelogDir, { recursive: true })

fs.writeFileSync(path.join(changelogDir, 'LATEST.md'), content)

const fullLog = path.join(changelogDir, 'CHANGELOG.md')
const existing = fs.existsSync(fullLog) ? fs.readFileSync(fullLog, 'utf8') : ''
fs.writeFileSync(fullLog, content + '\n---\n\n' + existing)

console.log(`Changelog written for v${version}`)
