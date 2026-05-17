import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCampaignStore } from '../../src/store/campaignStore'

const makeCampaign = (overrides = {}) => ({
  id: 'test-id-1',
  name: 'Test Campaign',
  description: '',
  author: '',
  chapters: [],
  ...overrides,
})

beforeEach(() => {
  useCampaignStore.setState({ campaigns: [] })
})

describe('campaignStore', () => {
  it('starts with empty campaigns', () => {
    const { result } = renderHook(() => useCampaignStore())
    expect(result.current.campaigns).toEqual([])
  })

  it('addCampaign adds a campaign', () => {
    const { result } = renderHook(() => useCampaignStore())
    act(() => result.current.addCampaign(makeCampaign()))
    expect(result.current.campaigns).toHaveLength(1)
    expect(result.current.campaigns[0].name).toBe('Test Campaign')
  })

  it('addCampaign does not mutate state directly', () => {
    const { result } = renderHook(() => useCampaignStore())
    const before = result.current.campaigns
    act(() => result.current.addCampaign(makeCampaign()))
    expect(result.current.campaigns).not.toBe(before)
  })

  it('updateCampaign updates matching campaign', () => {
    const { result } = renderHook(() => useCampaignStore())
    act(() => result.current.addCampaign(makeCampaign()))
    act(() => result.current.updateCampaign('test-id-1', { name: 'Updated' }))
    expect(result.current.campaigns[0].name).toBe('Updated')
  })

  it('updateCampaign ignores non-matching id', () => {
    const { result } = renderHook(() => useCampaignStore())
    act(() => result.current.addCampaign(makeCampaign()))
    act(() => result.current.updateCampaign('wrong-id', { name: 'Updated' }))
    expect(result.current.campaigns[0].name).toBe('Test Campaign')
  })

  it('deleteCampaign removes matching campaign', () => {
    const { result } = renderHook(() => useCampaignStore())
    act(() => result.current.addCampaign(makeCampaign()))
    act(() => result.current.deleteCampaign('test-id-1'))
    expect(result.current.campaigns).toHaveLength(0)
  })

  it('deleteCampaign leaves other campaigns intact', () => {
    const { result } = renderHook(() => useCampaignStore())
    act(() => result.current.addCampaign(makeCampaign({ id: 'a' })))
    act(() => result.current.addCampaign(makeCampaign({ id: 'b', name: 'Keep Me' })))
    act(() => result.current.deleteCampaign('a'))
    expect(result.current.campaigns).toHaveLength(1)
    expect(result.current.campaigns[0].name).toBe('Keep Me')
  })
})
