import { describe, it, expect } from 'vitest'
import { validateImport } from '../../src/services/validateImport'

const validEvent = (overrides = {}) => ({
  event_id: 'EVT-001',
  category: 'MAIN-QUEST',
  name: 'Defeat Skeleton',
  count: 1,
  event_completion_text: ['The skeleton falls.'],
  required_event_ids: [],
  ...overrides,
})

const escapeEvent = () => ({
  event_id: 'EVT-ESC',
  category: 'ESCAPE',
  name: 'Escape',
  count: 1,
  event_completion_text: ['You escaped!'],
  required_event_ids: ['EVT-001'],
})

const validChapter = (overrides = {}) => ({
  chapter_number: 1,
  title: 'The Beginning',
  events: [validEvent(), escapeEvent()],
  outro_text_escaped: 'You escaped.',
  outro_text_knocked_out_saved: 'You were saved.',
  outro_text_knocked_out_depths: 'Lost in the depths.',
  ...overrides,
})

const validCampaign = (overrides = {}) => ({
  name: 'Test Campaign',
  description: 'A test',
  author: 'Tester',
  chapters: [validChapter()],
  ...overrides,
})

describe('validateImport', () => {
  it('returns no errors for a valid campaign', () => {
    expect(validateImport(validCampaign())).toEqual([])
  })

  it('errors when name is missing', () => {
    const errors = validateImport(validCampaign({ name: '' }))
    expect(errors).toContain('Campaign name is missing')
  })

  it('errors when chapters is empty', () => {
    const errors = validateImport(validCampaign({ chapters: [] }))
    expect(errors).toContain('Campaign has no chapters')
  })

  it('errors when a chapter is missing required fields', () => {
    const chapter = validChapter()
    delete chapter.title
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('Chapter 1') && e.includes('title'))).toBe(true)
  })

  it('errors when a chapter is missing outro fields', () => {
    const chapter = validChapter()
    delete chapter.outro_text_escaped
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('outro_text_escaped'))).toBe(true)
  })

  it('errors when an event has unknown category', () => {
    const chapter = validChapter({ events: [validEvent({ category: 'UNKNOWN' }), escapeEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('unknown category'))).toBe(true)
  })

  it('errors when an event has count less than 1', () => {
    const chapter = validChapter({ events: [validEvent({ count: 0 }), escapeEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('count'))).toBe(true)
  })

  it('errors when event_completion_text is empty', () => {
    const chapter = validChapter({ events: [validEvent({ event_completion_text: [] }), escapeEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('event_completion_text'))).toBe(true)
  })

  it('errors when chapter has no ESCAPE event', () => {
    const chapter = validChapter({ events: [validEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('exactly one ESCAPE'))).toBe(true)
  })

  it('errors when chapter has more than one ESCAPE event', () => {
    const chapter = validChapter({ events: [validEvent(), escapeEvent(), escapeEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('exactly one ESCAPE'))).toBe(true)
  })

  it('errors when required_event_ids references unknown event', () => {
    const evt = validEvent({ required_event_ids: ['EVT-999'] })
    const chapter = validChapter({ events: [evt, escapeEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('EVT-999'))).toBe(true)
  })

  it('errors on circular dependency in required_event_ids', () => {
    const evtA = validEvent({ event_id: 'EVT-A', required_event_ids: ['EVT-B'] })
    const evtB = validEvent({ event_id: 'EVT-B', required_event_ids: ['EVT-A'] })
    const chapter = validChapter({ events: [evtA, evtB, escapeEvent()] })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('circular'))).toBe(true)
  })

  it('errors when grade ranges overlap', () => {
    const grades = [
      { label: 'A', min: 100, max: 200 },
      { label: 'B', min: 150, max: 250 },
    ]
    const chapter = validChapter({ grades })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('overlap'))).toBe(true)
  })

  it('errors when grade min exceeds max', () => {
    const grades = [{ label: 'A', min: 200, max: 100 }]
    const chapter = validChapter({ grades })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('invalid range'))).toBe(true)
  })

  it('errors when grade values are outside 0-999', () => {
    const grades = [{ label: 'A', min: -1, max: 1000 }]
    const chapter = validChapter({ grades })
    const errors = validateImport(validCampaign({ chapters: [chapter] }))
    expect(errors.some(e => e.includes('invalid range'))).toBe(true)
  })
})
