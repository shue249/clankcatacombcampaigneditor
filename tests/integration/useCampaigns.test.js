import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCampaigns } from '../../src/hooks/useCampaigns'
import { useCampaignStore } from '../../src/store/campaignStore'
import * as campaignService from '../../src/services/campaignService'

beforeEach(() => {
  useCampaignStore.setState({ campaigns: [] })
  vi.restoreAllMocks()
})

describe('useCampaigns', () => {
  it('returns empty campaigns initially', () => {
    const { result } = renderHook(() => useCampaigns())
    expect(result.current.campaigns).toEqual([])
  })

  it('createCampaign adds a campaign to the store', () => {
    const { result } = renderHook(() => useCampaigns())
    act(() => result.current.createCampaign({ name: 'New Campaign', author: 'Me' }))
    expect(result.current.campaigns).toHaveLength(1)
    expect(result.current.campaigns[0].name).toBe('New Campaign')
  })

  it('createCampaign returns the new campaign with an id', () => {
    const { result } = renderHook(() => useCampaigns())
    let campaign
    act(() => { campaign = result.current.createCampaign({ name: 'Returned' }) })
    expect(campaign).toBeDefined()
    expect(campaign.id).toBeTruthy()
    expect(campaign.name).toBe('Returned')
  })

  it('removeCampaign deletes a campaign from the store', () => {
    const { result } = renderHook(() => useCampaigns())
    act(() => result.current.createCampaign({ name: 'To Delete' }))
    const id = result.current.campaigns[0].id
    act(() => result.current.removeCampaign(id))
    expect(result.current.campaigns).toHaveLength(0)
  })

  it('importCampaign adds valid campaign to store', async () => {
    const validData = {
      name: 'Imported',
      chapters: [{
        chapter_number: 1, title: 'Ch1',
        outro_text_escaped: '', outro_text_knocked_out_saved: '', outro_text_knocked_out_depths: '',
        events: [
          { event_id: 'E1', category: 'MAIN-QUEST', name: 'Go', count: 1, event_completion_text: ['Done'], required_event_ids: [] },
          { event_id: 'E2', category: 'ESCAPE', name: 'Escape', count: 1, event_completion_text: ['Escaped'], required_event_ids: ['E1'] },
        ],
      }],
    }
    const file = new File([JSON.stringify(validData)], 'campaign.json', { type: 'application/json' })
    const { result } = renderHook(() => useCampaigns())
    let errors
    await act(async () => { errors = await result.current.importCampaign(file) })
    expect(errors).toEqual([])
    expect(result.current.campaigns).toHaveLength(1)
    expect(result.current.campaigns[0].name).toBe('Imported')
  })

  it('importCampaign returns errors and does not add invalid campaign', async () => {
    const invalid = { name: '', chapters: [] }
    const file = new File([JSON.stringify(invalid)], 'bad.json', { type: 'application/json' })
    const { result } = renderHook(() => useCampaigns())
    let errors
    await act(async () => { errors = await result.current.importCampaign(file) })
    expect(errors.length).toBeGreaterThan(0)
    expect(result.current.campaigns).toHaveLength(0)
  })

  it('importCampaign returns error for invalid JSON file', async () => {
    const file = new File(['not json at all'], 'bad.json', { type: 'application/json' })
    const { result } = renderHook(() => useCampaigns())
    let errors
    await act(async () => { errors = await result.current.importCampaign(file) })
    expect(errors).toContain('File is not valid JSON')
  })

  it('exportCampaign delegates to campaignService', () => {
    const spy = vi.spyOn(campaignService, 'exportCampaign').mockImplementation(() => {})
    const { result } = renderHook(() => useCampaigns())
    const campaign = { id: '1', name: 'Test', chapters: [] }
    act(() => result.current.exportCampaign(campaign))
    expect(spy).toHaveBeenCalledWith(campaign)
  })
})
