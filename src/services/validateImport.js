const VALID_CATEGORIES = ['MAIN-QUEST', 'SIDE-QUEST', 'ROUND-END', 'ESCAPE']

function hasCircularDep(eventId, required, allEventsMap, visiting = new Set()) {
  if (visiting.has(eventId)) return true
  visiting.add(eventId)
  for (const depId of (allEventsMap[eventId]?.required_event_ids ?? [])) {
    if (hasCircularDep(depId, required, allEventsMap, new Set(visiting))) return true
  }
  return false
}

export function validateImport(campaign) {
  const errors = []

  if (!campaign.name || campaign.name.trim() === '') {
    errors.push('Campaign name is missing')
  }

  if (!Array.isArray(campaign.chapters) || campaign.chapters.length === 0) {
    errors.push('Campaign has no chapters')
    return errors
  }

  for (const chapter of campaign.chapters) {
    const n = chapter.chapter_number ?? '?'
    const prefix = `Chapter ${n}`

    for (const field of ['chapter_number', 'title', 'events']) {
      if (chapter[field] === undefined || chapter[field] === null) {
        errors.push(`${prefix}: missing required field "${field}"`)
      }
    }
    for (const field of ['outro_text_escaped', 'outro_text_knocked_out_saved', 'outro_text_knocked_out_depths']) {
      if (chapter[field] === undefined || chapter[field] === null) {
        errors.push(`${prefix}: missing required field "${field}"`)
      }
    }

    if (!Array.isArray(chapter.events)) continue

    const eventIds = new Set(chapter.events.map(e => e.event_id))
    const eventsMap = Object.fromEntries(chapter.events.map(e => [e.event_id, e]))
    const escapeCount = chapter.events.filter(e => e.category === 'ESCAPE').length

    if (escapeCount !== 1) {
      errors.push(`${prefix}: must have exactly one ESCAPE event (found ${escapeCount})`)
    }

    for (const evt of chapter.events) {
      const eRef = `${prefix}, Event ${evt.event_id}`

      if (!evt.category) {
        errors.push(`${eRef}: missing "category"`)
      } else if (!VALID_CATEGORIES.includes(evt.category)) {
        errors.push(`${eRef}: unknown category "${evt.category}"`)
      }

      if (!evt.name) errors.push(`${eRef}: missing "name"`)

      if (!evt.count || evt.count < 1) {
        errors.push(`${eRef}: "count" must be >= 1`)
      }

      if (!Array.isArray(evt.event_completion_text) || evt.event_completion_text.length === 0) {
        errors.push(`${eRef}: "event_completion_text" must have at least 1 entry`)
      }

      for (const refId of (evt.required_event_ids ?? [])) {
        if (!eventIds.has(refId)) {
          errors.push(`${eRef}: references unknown event "${refId}"`)
        }
      }
    }

    // circular dependency check
    for (const evt of chapter.events) {
      if (hasCircularDep(evt.event_id, evt.required_event_ids, eventsMap)) {
        errors.push(`${prefix}: circular dependency detected involving event "${evt.event_id}"`)
        break
      }
    }

    // grade range validation
    if (Array.isArray(chapter.grades)) {
      for (const grade of chapter.grades) {
        if (grade.min > grade.max || grade.min < 0 || grade.max > 999) {
          errors.push(`${prefix}, Grade ${grade.label}: invalid range ${grade.min}–${grade.max} (must be 0–999, min ≤ max)`)
        }
      }

      const sorted = [...chapter.grades].sort((a, b) => a.min - b.min)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].min <= sorted[i - 1].max) {
          errors.push(`${prefix}: grade ranges overlap between "${sorted[i - 1].label}" and "${sorted[i].label}"`)
        }
      }
    }
  }

  return errors
}
