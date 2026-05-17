import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewCampaignModal } from '../../src/components/NewCampaignModal'

describe('NewCampaignModal', () => {
  it('renders name, description and author fields', () => {
    render(<NewCampaignModal onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<NewCampaignModal onConfirm={() => {}} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not call onConfirm when Name is empty', async () => {
    const onConfirm = vi.fn()
    render(<NewCampaignModal onConfirm={onConfirm} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('shows validation error when Name is empty and Create is clicked', async () => {
    render(<NewCampaignModal onConfirm={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  it('calls onConfirm with name, description and author when form is valid', async () => {
    const onConfirm = vi.fn()
    render(<NewCampaignModal onConfirm={onConfirm} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/name/i), 'My Campaign')
    await userEvent.type(screen.getByLabelText(/description/i), 'A fun one')
    await userEvent.type(screen.getByLabelText(/author/i), 'Bob')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onConfirm).toHaveBeenCalledWith({ name: 'My Campaign', description: 'A fun one', author: 'Bob' })
  })

  it('calls onConfirm with only name when optional fields are blank', async () => {
    const onConfirm = vi.fn()
    render(<NewCampaignModal onConfirm={onConfirm} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/name/i), 'Solo Run')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onConfirm).toHaveBeenCalledWith({ name: 'Solo Run', description: '', author: '' })
  })
})
