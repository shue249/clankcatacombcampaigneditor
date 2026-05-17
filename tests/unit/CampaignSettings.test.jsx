import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CampaignSettings } from '../../src/components/CampaignSettings'

const campaign = { id: 'c1', name: 'My Campaign', description: 'A desc', author: 'Alice', chapters: [] }

describe('CampaignSettings', () => {
  it('renders pre-filled name, description and author fields', () => {
    render(<CampaignSettings campaign={campaign} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/name/i)).toHaveValue('My Campaign')
    expect(screen.getByLabelText(/description/i)).toHaveValue('A desc')
    expect(screen.getByLabelText(/author/i)).toHaveValue('Alice')
  })

  it('calls onUpdate with new name when field is blurred', async () => {
    const onUpdate = vi.fn()
    render(<CampaignSettings campaign={campaign} onUpdate={onUpdate} />)
    const input = screen.getByLabelText(/name/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Renamed')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ name: 'Renamed' })
  })

  it('calls onUpdate with new description when field is blurred', async () => {
    const onUpdate = vi.fn()
    render(<CampaignSettings campaign={campaign} onUpdate={onUpdate} />)
    const input = screen.getByLabelText(/description/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'New desc')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ description: 'New desc' })
  })

  it('calls onUpdate with new author when field is blurred', async () => {
    const onUpdate = vi.fn()
    render(<CampaignSettings campaign={campaign} onUpdate={onUpdate} />)
    const input = screen.getByLabelText(/author/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Bob')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ author: 'Bob' })
  })

  it('shows error and does not call onUpdate when name is cleared and blurred', async () => {
    const onUpdate = vi.fn()
    render(<CampaignSettings campaign={campaign} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.tab()
    expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalledWith({ name: '' })
  })

  it('clears name error when user types a valid name', async () => {
    render(<CampaignSettings campaign={campaign} onUpdate={() => {}} />)
    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.tab()
    expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/name/i), 'Fixed')
    expect(screen.queryByText(/name cannot be empty/i)).not.toBeInTheDocument()
  })
})
