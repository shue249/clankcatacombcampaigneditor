import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CampaignCard } from '../../src/components/CampaignCard'

const makeCampaign = (overrides = {}) => ({
  id: 'c1',
  name: 'My Campaign',
  description: 'A great adventure',
  author: 'Alice',
  chapters: [{ chapter_number: 1 }, { chapter_number: 2 }],
  ...overrides,
})

describe('CampaignCard', () => {
  it('renders campaign name', () => {
    render(<CampaignCard campaign={makeCampaign()} onEdit={() => {}} onExport={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('My Campaign')).toBeInTheDocument()
  })

  it('renders author', () => {
    render(<CampaignCard campaign={makeCampaign()} onEdit={() => {}} onExport={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('renders chapter count', () => {
    render(<CampaignCard campaign={makeCampaign()} onEdit={() => {}} onExport={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })

  it('shows "No description" when description is empty', () => {
    render(<CampaignCard campaign={makeCampaign({ description: '' })} onEdit={() => {}} onExport={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/no description/i)).toBeInTheDocument()
  })

  it('calls onEdit when Edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<CampaignCard campaign={makeCampaign()} onEdit={onEdit} onExport={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith('c1')
  })

  it('calls onExport when Export button is clicked', async () => {
    const onExport = vi.fn()
    render(<CampaignCard campaign={makeCampaign()} onEdit={() => {}} onExport={onExport} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(onExport).toHaveBeenCalledWith(makeCampaign())
  })

  it('calls onDelete when Delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<CampaignCard campaign={makeCampaign()} onEdit={() => {}} onExport={() => {}} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })
})
