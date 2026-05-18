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
})
