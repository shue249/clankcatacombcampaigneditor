import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportCampaign, buildNewCampaign, buildNewChapter } from '../../src/services/campaignService'

describe('buildNewChapter', () => {
  it('returns a chapter with the given chapter_number and an empty title', () => {
    const ch = buildNewChapter(1)
    expect(ch.chapter_number).toBe(1)
    expect(ch.title).toBe('')
  })

  it('includes intro_text as empty string', () => {
    expect(buildNewChapter(1).intro_text).toBe('')
  })

  it('includes required outro_text fields as empty strings', () => {
    const ch = buildNewChapter(1)
    expect(ch.outro_text_escaped).toBe('')
    expect(ch.outro_text_knocked_out_saved).toBe('')
    expect(ch.outro_text_knocked_out_depths).toBe('')
  })

  it('includes empty events and grades arrays', () => {
    const ch = buildNewChapter(1)
    expect(ch.events).toEqual([])
    expect(ch.grades).toEqual([])
  })

  it('includes starting_map and instructions as empty strings', () => {
    const ch = buildNewChapter(1)
    expect(ch.starting_map).toBe('')
    expect(ch.instructions).toBe('')
  })

  it('includes list setup fields as empty arrays', () => {
    const ch = buildNewChapter(1)
    expect(ch.starting_artifacts).toEqual([])
    expect(ch.starting_tokens).toEqual([])
    expect(ch.tile_deck).toEqual([])
    expect(ch.set_aside_cards).toEqual([])
    expect(ch.set_aside_tokens).toEqual([])
  })

  it('includes Normal clank defaults', () => {
    const ch = buildNewChapter(1)
    expect(ch.player_clank).toBe(3)
    expect(ch.rival_clank).toBe(3)
    expect(ch.dragon_clank).toBe(0)
    expect(ch.ghost_clank).toBe(0)
  })

  it('includes Hard clank defaults', () => {
    const ch = buildNewChapter(1)
    expect(ch.player_clank_hard).toBe(3)
    expect(ch.rival_clank_hard).toBe(3)
    expect(ch.dragon_clank_hard).toBe(4)
    expect(ch.ghost_clank_hard).toBe(0)
  })

  it('includes Brutal clank defaults', () => {
    const ch = buildNewChapter(1)
    expect(ch.player_clank_brutal).toBe(3)
    expect(ch.rival_clank_brutal).toBe(3)
    expect(ch.dragon_clank_brutal).toBe(6)
    expect(ch.ghost_clank_brutal).toBe(1)
  })

  it('includes rage track defaulting to 3', () => {
    expect(buildNewChapter(1).rage_track).toBe(3)
  })

  it('chapter_number reflects the argument passed in', () => {
    expect(buildNewChapter(3).chapter_number).toBe(3)
  })
})

describe('buildNewCampaign', () => {
  it('returns a campaign with 1 default chapter and a generated id', () => {
    const campaign = buildNewCampaign({ name: 'My Campaign', author: 'Me' })
    expect(campaign.name).toBe('My Campaign')
    expect(campaign.author).toBe('Me')
    expect(campaign.chapters).toHaveLength(1)
    expect(campaign.chapters[0].chapter_number).toBe(1)
    expect(typeof campaign.id).toBe('string')
    expect(campaign.id.length).toBeGreaterThan(0)
  })

  it('uses provided chapters when supplied (import flow)', () => {
    const chapters = [{ chapter_number: 1, title: 'Ch1', events: [] }]
    const campaign = buildNewCampaign({ name: 'Imported', chapters })
    expect(campaign.chapters).toBe(chapters)
  })

  it('two new campaigns have different ids', () => {
    const a = buildNewCampaign({ name: 'A' })
    const b = buildNewCampaign({ name: 'B' })
    expect(a.id).not.toBe(b.id)
  })
})

describe('exportCampaign', () => {
  beforeEach(() => {
    // mock URL and document APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    const clickMock = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({ click: clickMock, href: '', download: '' })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
  })

  it('triggers a file download', () => {
    const campaign = { id: '1', name: 'Test', chapters: [] }
    exportCampaign(campaign)
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('excludes the internal id from the exported file', () => {
    const campaign = { id: 'internal-id', name: 'Test', chapters: [] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const parsed = JSON.parse(text)
      expect(parsed.id).toBeUndefined()
    })
  })

  it('preserves top-level campaign fields in the export', () => {
    const campaign = { id: 'x', name: 'Epic Run', description: 'A journey', author: 'Bob', chapters: [] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const parsed = JSON.parse(text)
      expect(parsed.name).toBe('Epic Run')
      expect(parsed.description).toBe('A journey')
      expect(parsed.author).toBe('Bob')
    })
  })

  it('preserves all chapter story fields in the export', () => {
    const chapter = buildNewChapter(1)
    chapter.title = 'Into the Dark'
    chapter.intro_text = 'The adventure begins.'
    chapter.starting_map = 'map_a'
    chapter.instructions = 'Place tokens here.'
    chapter.outro_text_escaped = 'You escaped!'
    chapter.outro_text_knocked_out_saved = 'Barely made it.'
    chapter.outro_text_knocked_out_depths = 'Left behind.'
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const ch = JSON.parse(text).chapters[0]
      expect(ch.title).toBe('Into the Dark')
      expect(ch.intro_text).toBe('The adventure begins.')
      expect(ch.starting_map).toBe('map_a')
      expect(ch.instructions).toBe('Place tokens here.')
      expect(ch.outro_text_escaped).toBe('You escaped!')
      expect(ch.outro_text_knocked_out_saved).toBe('Barely made it.')
      expect(ch.outro_text_knocked_out_depths).toBe('Left behind.')
    })
  })

  it('preserves all chapter setup fields in the export', () => {
    const chapter = buildNewChapter(1)
    chapter.starting_artifacts = ['artifact_5']
    chapter.starting_tokens = ['lockpick_1']
    chapter.set_aside_cards = ['card_1']
    chapter.set_aside_tokens = ['monkey_idol_1']
    chapter.player_clank = 5
    chapter.rival_clank = 4
    chapter.dragon_clank = 2
    chapter.ghost_clank = 1
    chapter.rage_track = 4
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const ch = JSON.parse(text).chapters[0]
      expect(ch.starting_artifacts).toEqual(['artifact_5'])
      expect(ch.starting_tokens).toEqual(['lockpick_1'])
      expect(ch.set_aside_cards).toEqual(['card_1'])
      expect(ch.set_aside_tokens).toEqual(['monkey_idol_1'])
      expect(ch.player_clank).toBe(5)
      expect(ch.rival_clank).toBe(4)
      expect(ch.dragon_clank).toBe(2)
      expect(ch.ghost_clank).toBe(1)
      expect(ch.rage_track).toBe(4)
    })
  })

  it('preserves events array in the export', () => {
    const chapter = buildNewChapter(1)
    chapter.events = [
      { event_id: 'EVT-001', category: 'MAIN-QUEST', name: 'Find Key', required_event_ids: [], event_completion_text: 'Done', remainder_text: '', choices: [] },
      { event_id: 'EVT-ESCAPE', category: 'ESCAPE', name: 'Escape', required_event_ids: ['EVT-001'], event_completion_text: '', remainder_text: '', choices: [] },
    ]
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const ch = JSON.parse(text).chapters[0]
      expect(ch.events).toHaveLength(2)
      expect(ch.events[0].event_id).toBe('EVT-001')
      expect(ch.events[1].required_event_ids).toEqual(['EVT-001'])
    })
  })

  it('exports event_completion_text as a string', () => {
    const chapter = buildNewChapter(1)
    chapter.events = [
      { event_id: 'EVT-001', category: 'MAIN-QUEST', name: 'Find Key', required_event_ids: [], event_completion_text: 'Victory!', remainder_text: '', choices: [] },
    ]
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const evt = JSON.parse(text).chapters[0].events[0]
      expect(typeof evt.event_completion_text).toBe('string')
      expect(evt.event_completion_text).toBe('Victory!')
    })
  })

  it('does not export count on events', () => {
    const chapter = buildNewChapter(1)
    chapter.events = [
      { event_id: 'EVT-001', category: 'MAIN-QUEST', name: 'Find Key', required_event_ids: [], event_completion_text: '', remainder_text: '', choices: [] },
    ]
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const evt = JSON.parse(text).chapters[0].events[0]
      expect(evt.count).toBeUndefined()
    })
  })

  it('preserves choices array on events in the export', () => {
    const choices = [
      { decision: 'Give the Idol', outcome: 'Lose the Monkey Idol, gain a Librarian card' },
      { decision: 'Keep the Idol', outcome: 'Keep the Monkey Idol (5 VP)' },
    ]
    const chapter = buildNewChapter(1)
    chapter.events = [
      { event_id: 'EVT-001', category: 'MAIN-QUEST', name: 'Make a Choice', required_event_ids: [], event_completion_text: '', remainder_text: '', choices },
    ]
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const evt = JSON.parse(text).chapters[0].events[0]
      expect(evt.choices).toEqual(choices)
    })
  })

  it('preserves grades array in the export', () => {
    const chapter = buildNewChapter(1)
    chapter.grades = [{ label: 'S', min: 80, max: 100 }, { label: 'A', min: 60, max: 79 }]
    const campaign = { id: 'x', name: 'C', chapters: [chapter] }
    exportCampaign(campaign)
    const blob = global.URL.createObjectURL.mock.calls[0][0]
    return blob.text().then(text => {
      const ch = JSON.parse(text).chapters[0]
      expect(ch.grades).toEqual([{ label: 'S', min: 80, max: 100 }, { label: 'A', min: 60, max: 79 }])
    })
  })

  it('uses the campaign name as the download filename', () => {
    const anchor = { click: vi.fn(), href: '', download: '' }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    const campaign = { id: 'x', name: 'My Epic Campaign', chapters: [] }
    exportCampaign(campaign)
    expect(anchor.download).toBe('my-epic-campaign.json')
  })

  it('falls back to "campaign.json" when name is empty', () => {
    const anchor = { click: vi.fn(), href: '', download: '' }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    const campaign = { id: 'x', name: '', chapters: [] }
    exportCampaign(campaign)
    expect(anchor.download).toBe('campaign.json')
  })
})
