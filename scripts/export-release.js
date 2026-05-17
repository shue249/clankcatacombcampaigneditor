#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = pkg.version
const releaseDir = path.join(__dirname, '..', 'release')
const distDir = path.join(__dirname, '..', 'dist')
const zipName = `clank-campaign-editor-v${version}.zip`
const zipPath = path.join(releaseDir, zipName)

if (!fs.existsSync(distDir)) {
  console.error('ERROR: dist/ not found — run npm run build first')
  process.exit(1)
}

fs.mkdirSync(releaseDir, { recursive: true })

fs.writeFileSync(
  path.join(distDir, 'version.json'),
  JSON.stringify({ version, builtAt: new Date().toISOString() }, null, 2)
)

execSync(`cd dist && zip -r "${zipPath}" .`)

console.log(`Release artifact created: release/${zipName}`)
