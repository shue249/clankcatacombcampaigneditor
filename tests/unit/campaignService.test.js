import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportCampaign, buildNewCampaign } from '../../src/services/campaignService'

describe('buildNewCampaign', () => {
  it('returns a campaign with empty chapters and generated id', () => {
    const campaign = buildNewCampaign({ name: 'My Campaign', author: 'Me' })
    expect(campaign.name).toBe('My Campaign')
    expect(campaign.author).toBe('Me')
    expect(campaign.chapters).toEqual([])
    expect(typeof campaign.id).toBe('string')
    expect(campaign.id.length).toBeGreaterThan(0)
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
