#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VALID_CATEGORIES = ['COMBAT', 'HAZARD', 'TILE_EVENT', 'STORY', 'OBJECTIVE', 'REWARD', 'MAP_STATE']

const eventsPath = path.join(__dirname, '..', 'data', 'clank-catacombs-events.json')

if (!fs.existsSync(eventsPath)) {
  console.error('ERROR: data/clank-catacombs-events.json not found')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(eventsPath, 'utf8'))
const errors = []
const seenIds = new Set()
const events = data.events || []

events.forEach((evt, i) => {
  const ref = `Event[${i}] id=${evt.id || '(missing)'}`
  if (!evt.id) errors.push(`${ref}: missing "id"`)
  if (!evt.category) errors.push(`${ref}: missing "category"`)
  if (!evt.subcategory) errors.push(`${ref}: missing "subcategory"`)
  if (!evt.description) errors.push(`${ref}: missing "description"`)
  if (evt.category && !VALID_CATEGORIES.includes(evt.category))
    errors.push(`${ref}: unknown category "${evt.category}"`)
  if (evt.id) {
    if (seenIds.has(evt.id)) errors.push(`${ref}: duplicate id "${evt.id}"`)
    seenIds.add(evt.id)
  }
})

if (errors.length > 0) {
  console.error('events JSON validation FAILED:')
  errors.forEach(e => console.error(' ', e))
  process.exit(1)
}

console.log(`events JSON validated: ${events.length} events OK`)
