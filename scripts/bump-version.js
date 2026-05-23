#!/usr/bin/env node
import fs from 'fs'
import { execSync } from 'child_process'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = pkg.version

execSync(`git tag v${version}`)

fs.appendFileSync(process.env.GITHUB_ENV || '/dev/null', `RELEASE_VERSION=v${version}\n`)

console.log(`Tagging release v${version}`)
