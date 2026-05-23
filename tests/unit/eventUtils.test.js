import { describe, it, expect } from 'vitest'
import {
  generateEventId,
  wouldCreateCycle,
  isValidConnection,
  eventsToNodes,
  eventsToEdges,
  flowDataToEvents,
  hasValidEscapePath,
} from '../../src/utils/eventUtils'

describe('generateEventId', () => {
  it('returns EVT-001 when no events exist', () => {
    expect(generateEventId([])).toBe('EVT-001')
  })

  it('returns next ID after existing events', () => {
    expect(generateEventId([{ event_id: 'EVT-001' }, { event_id: 'EVT-002' }])).toBe('EVT-003')
  })

  it('pads to 3 digits', () => {
    expect(generateEventId([{ event_id: 'EVT-009' }])).toBe('EVT-010')
  })

  it('uses max + 1, skipping gaps', () => {
    expect(generateEventId([{ event_id: 'EVT-001' }, { event_id: 'EVT-005' }])).toBe('EVT-006')
  })

  it('ignores non-numeric IDs like EVT-ESCAPE', () => {
    expect(generateEventId([{ event_id: 'EVT-ESCAPE' }, { event_id: 'EVT-002' }])).toBe('EVT-003')
  })
})

describe('wouldCreateCycle', () => {
  it('returns false when no cycle', () => {
    expect(wouldCreateCycle('B', 'C', [{ source: 'A', target: 'B' }])).toBe(false)
  })

  it('returns true for a direct cycle', () => {
    expect(wouldCreateCycle('B', 'A', [{ source: 'A', target: 'B' }])).toBe(true)
  })

  it('returns true for an indirect cycle', () => {
    const edges = [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }]
    expect(wouldCreateCycle('C', 'A', edges)).toBe(true)
  })

  it('returns false for empty edges', () => {
    expect(wouldCreateCycle('A', 'B', [])).toBe(false)
  })

  it('returns false for unrelated paths', () => {
    const edges = [{ source: 'A', target: 'B' }, { source: 'C', target: 'D' }]
    expect(wouldCreateCycle('A', 'D', edges)).toBe(false)
  })
})

describe('isValidConnection', () => {
  const nodes = [
    { id: 'EVT-001', data: { category: 'MAIN-QUEST' } },
    { id: 'EVT-002', data: { category: 'SIDE-QUEST' } },
    { id: 'EVT-003', data: { category: 'ROUND-END' } },
    { id: 'EVT-ESCAPE', data: { category: 'ESCAPE' } },
  ]

  it('allows MAIN-QUEST to connect to ESCAPE', () => {
    expect(isValidConnection({ source: 'EVT-001', target: 'EVT-ESCAPE' }, nodes, [])).toBe(true)
  })

  it('rejects SIDE-QUEST connecting to ESCAPE', () => {
    expect(isValidConnection({ source: 'EVT-002', target: 'EVT-ESCAPE' }, nodes, [])).toBe(false)
  })

  it('rejects ROUND-END connecting to ESCAPE', () => {
    expect(isValidConnection({ source: 'EVT-003', target: 'EVT-ESCAPE' }, nodes, [])).toBe(false)
  })

  it('rejects ESCAPE as source', () => {
    expect(isValidConnection({ source: 'EVT-ESCAPE', target: 'EVT-001' }, nodes, [])).toBe(false)
  })

  it('rejects a self-loop', () => {
    expect(isValidConnection({ source: 'EVT-001', target: 'EVT-001' }, nodes, [])).toBe(false)
  })

  it('rejects a connection that would create a cycle', () => {
    const edges = [{ source: 'EVT-001', target: 'EVT-002' }]
    expect(isValidConnection({ source: 'EVT-002', target: 'EVT-001' }, nodes, edges)).toBe(false)
  })

  it('allows a valid non-cycle connection between regular nodes', () => {
    const edges = [{ source: 'EVT-001', target: 'EVT-002' }]
    expect(isValidConnection({ source: 'EVT-002', target: 'EVT-003' }, nodes, edges)).toBe(true)
  })
})

describe('eventsToNodes', () => {
  it('maps category to correct node type', () => {
    const events = [
      { event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', position: { x: 0, y: 0 } },
      { event_id: 'EVT-002', category: 'SIDE-QUEST', name: '', position: { x: 0, y: 0 } },
      { event_id: 'EVT-003', category: 'ROUND-END', name: '', position: { x: 0, y: 0 } },
      { event_id: 'EVT-ESCAPE', category: 'ESCAPE', name: '', position: { x: 0, y: 0 } },
    ]
    const nodes = eventsToNodes(events)
    expect(nodes[0].type).toBe('mainQuest')
    expect(nodes[1].type).toBe('sideQuest')
    expect(nodes[2].type).toBe('roundEnd')
    expect(nodes[3].type).toBe('escape')
  })

  it('preserves position', () => {
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', position: { x: 150, y: 250 } }]
    expect(eventsToNodes(events)[0].position).toEqual({ x: 150, y: 250 })
  })

  it('uses default position when missing', () => {
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '' }]
    expect(eventsToNodes(events)[0].position).toEqual({ x: 100, y: 100 })
  })

  it('sets deletable: false on ESCAPE', () => {
    const events = [{ event_id: 'EVT-ESCAPE', category: 'ESCAPE', name: '', position: { x: 0, y: 0 } }]
    expect(eventsToNodes(events)[0].deletable).toBe(false)
  })

  it('sets deletable: true on non-ESCAPE nodes', () => {
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', position: { x: 0, y: 0 } }]
    expect(eventsToNodes(events)[0].deletable).toBe(true)
  })

  it('does not include count in node data', () => {
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', position: { x: 0, y: 0 } }]
    expect(eventsToNodes(events)[0].data.count).toBeUndefined()
  })

  it('maps event_completion_text string to node data', () => {
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', event_completion_text: 'Done!', position: { x: 0, y: 0 } }]
    expect(eventsToNodes(events)[0].data.event_completion_text).toBe('Done!')
  })

  it('maps choices array to node data', () => {
    const choices = [{ decision: 'Fight', outcome: 'You win' }]
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', choices, position: { x: 0, y: 0 } }]
    expect(eventsToNodes(events)[0].data.choices).toEqual(choices)
  })

  it('defaults choices to empty array when missing', () => {
    const events = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: '', position: { x: 0, y: 0 } }]
    expect(eventsToNodes(events)[0].data.choices).toEqual([])
  })
})

describe('eventsToEdges', () => {
  it('creates an edge for each required_event_id', () => {
    const events = [
      { event_id: 'EVT-001', required_event_ids: [] },
      { event_id: 'EVT-002', required_event_ids: ['EVT-001'] },
    ]
    const edges = eventsToEdges(events)
    expect(edges).toHaveLength(1)
    expect(edges[0].source).toBe('EVT-001')
    expect(edges[0].target).toBe('EVT-002')
  })

  it('creates multiple edges for multiple prerequisites', () => {
    const events = [
      { event_id: 'EVT-001', required_event_ids: [] },
      { event_id: 'EVT-002', required_event_ids: [] },
      { event_id: 'EVT-003', required_event_ids: ['EVT-001', 'EVT-002'] },
    ]
    expect(eventsToEdges(events)).toHaveLength(2)
  })

  it('returns empty array when no prerequisites', () => {
    const events = [
      { event_id: 'EVT-001', required_event_ids: [] },
      { event_id: 'EVT-002', required_event_ids: [] },
    ]
    expect(eventsToEdges(events)).toHaveLength(0)
  })
})

describe('flowDataToEvents', () => {
  it('derives required_event_ids from edges', () => {
    const nodes = [
      { id: 'EVT-001', position: { x: 0, y: 0 }, data: { category: 'MAIN-QUEST', name: 'A', remainder_text: '', event_completion_text: '', choices: [] } },
      { id: 'EVT-002', position: { x: 0, y: 100 }, data: { category: 'ESCAPE', name: 'Escape', remainder_text: '', event_completion_text: '', choices: [] } },
    ]
    const edges = [{ source: 'EVT-001', target: 'EVT-002' }]
    const events = flowDataToEvents(nodes, edges, [])
    const escapeEvent = events.find((e) => e.event_id === 'EVT-002')
    expect(escapeEvent.required_event_ids).toEqual(['EVT-001'])
  })

  it('preserves existing event data not in node.data', () => {
    const nodes = [
      { id: 'EVT-001', position: { x: 0, y: 0 }, data: { category: 'MAIN-QUEST', name: 'Updated', remainder_text: '', event_completion_text: '', choices: [] } },
    ]
    const existingEvents = [{ event_id: 'EVT-001', category: 'MAIN-QUEST', name: 'Old', some_extra_field: 'keep me' }]
    const events = flowDataToEvents(nodes, [], existingEvents)
    expect(events[0].some_extra_field).toBe('keep me')
    expect(events[0].name).toBe('Updated')
  })

  it('does not include count in persisted events', () => {
    const nodes = [
      { id: 'EVT-001', position: { x: 0, y: 0 }, data: { category: 'MAIN-QUEST', name: 'A', remainder_text: '', event_completion_text: '', choices: [] } },
    ]
    const events = flowDataToEvents(nodes, [], [])
    expect(events[0].count).toBeUndefined()
  })

  it('persists choices array', () => {
    const choices = [{ decision: 'Fight', outcome: 'You win' }, { decision: 'Flee', outcome: 'You escape' }]
    const nodes = [
      { id: 'EVT-001', position: { x: 0, y: 0 }, data: { category: 'MAIN-QUEST', name: 'A', remainder_text: '', event_completion_text: 'Done', choices } },
    ]
    const events = flowDataToEvents(nodes, [], [])
    expect(events[0].choices).toEqual(choices)
  })

  it('persists event_completion_text as string', () => {
    const nodes = [
      { id: 'EVT-001', position: { x: 0, y: 0 }, data: { category: 'MAIN-QUEST', name: 'A', remainder_text: '', event_completion_text: 'Victory!', choices: [] } },
    ]
    const events = flowDataToEvents(nodes, [], [])
    expect(events[0].event_completion_text).toBe('Victory!')
  })
})

describe('hasValidEscapePath', () => {
  it('returns false when no ESCAPE node', () => {
    const nodes = [{ id: 'EVT-001', data: { category: 'MAIN-QUEST' } }]
    expect(hasValidEscapePath(nodes, [])).toBe(false)
  })

  it('returns false when no MAIN-QUEST connects to ESCAPE', () => {
    const nodes = [
      { id: 'EVT-001', data: { category: 'MAIN-QUEST' } },
      { id: 'EVT-ESCAPE', data: { category: 'ESCAPE' } },
    ]
    expect(hasValidEscapePath(nodes, [])).toBe(false)
  })

  it('returns true when a MAIN-QUEST node connects directly to ESCAPE', () => {
    const nodes = [
      { id: 'EVT-001', data: { category: 'MAIN-QUEST' } },
      { id: 'EVT-ESCAPE', data: { category: 'ESCAPE' } },
    ]
    const edges = [{ source: 'EVT-001', target: 'EVT-ESCAPE' }]
    expect(hasValidEscapePath(nodes, edges)).toBe(true)
  })

  it('returns true when a MAIN-QUEST node connects to ESCAPE and also to another node', () => {
    const nodes = [
      { id: 'EVT-001', data: { category: 'MAIN-QUEST' } },
      { id: 'EVT-002', data: { category: 'ROUND-END' } },
      { id: 'EVT-ESCAPE', data: { category: 'ESCAPE' } },
    ]
    const edges = [
      { source: 'EVT-001', target: 'EVT-ESCAPE' },
      { source: 'EVT-001', target: 'EVT-002' },
    ]
    expect(hasValidEscapePath(nodes, edges)).toBe(true)
  })

  it('returns true when a mid-chain MAIN-QUEST node connects to ESCAPE', () => {
    const nodes = [
      { id: 'EVT-001', data: { category: 'MAIN-QUEST' } },
      { id: 'EVT-002', data: { category: 'MAIN-QUEST' } },
      { id: 'EVT-ESCAPE', data: { category: 'ESCAPE' } },
    ]
    const edges = [
      { source: 'EVT-001', target: 'EVT-002' },
      { source: 'EVT-002', target: 'EVT-ESCAPE' },
    ]
    expect(hasValidEscapePath(nodes, edges)).toBe(true)
  })
})
