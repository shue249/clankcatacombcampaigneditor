import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCampaignEditor } from '../../src/hooks/useCampaignEditor'
import { useCampaignStore } from '../../src/store/campaignStore'

const BASE = { id: 'c1', name: 'My Campaign', description: 'Desc', author: 'Alice', chapters: [] }

beforeEach(() => {
  useCampaignStore.setState({ campaigns: [BASE] })
})

describe('useCampaignEditor', () => {
  it('returns the campaign for a valid id', () => {
    const { result } = renderHook(() => useCampaignEditor('c1'))
    expect(result.current.campaign).toMatchObject({ id: 'c1', name: 'My Campaign' })
  })

  it('returns undefined for an unknown id', () => {
    const { result } = renderHook(() => useCampaignEditor('unknown'))
    expect(result.current.campaign).toBeUndefined()
  })

  it('updateSettings updates name in the store', () => {
    const { result } = renderHook(() => useCampaignEditor('c1'))
    act(() => result.current.updateSettings({ name: 'Renamed' }))
    expect(useCampaignStore.getState().campaigns[0].name).toBe('Renamed')
  })

  it('updateSettings updates description in the store', () => {
    const { result } = renderHook(() => useCampaignEditor('c1'))
    act(() => result.current.updateSettings({ description: 'New desc' }))
    expect(useCampaignStore.getState().campaigns[0].description).toBe('New desc')
  })

  it('updateSettings updates author in the store', () => {
    const { result } = renderHook(() => useCampaignEditor('c1'))
    act(() => result.current.updateSettings({ author: 'Bob' }))
    expect(useCampaignStore.getState().campaigns[0].author).toBe('Bob')
  })

  it('campaign reflects store changes reactively', () => {
    const { result } = renderHook(() => useCampaignEditor('c1'))
    act(() => result.current.updateSettings({ name: 'Updated' }))
    expect(result.current.campaign.name).toBe('Updated')
  })
})
