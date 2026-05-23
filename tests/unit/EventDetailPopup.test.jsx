import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventDetailPopup } from '../../src/components/EventDetailPopup'

describe('EventDetailPopup', () => {
  it('renders the category label', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('MAIN-QUEST')).toBeInTheDocument()
  })

  it('shows "New Event" heading when no initialData', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('heading', { name: /new event/i })).toBeInTheDocument()
  })

  it('shows "Edit Event" heading when initialData is provided', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={{ name: 'Defeat Skeleton', remainder_text: '', event_completion_text: '', choices: [] }} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('heading', { name: /edit event/i })).toBeInTheDocument()
  })

  it('renders name, reminder text, and completion text fields', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/reminder text/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^completion text$/i)).toBeInTheDocument()
  })

  it('does not render a count field', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.queryByLabelText(/^count$/i)).not.toBeInTheDocument()
  })

  it('renders Save and Cancel buttons', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('Save button is disabled when name is empty', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('Save button is enabled when name is filled', async () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Defeat Skeleton')
    expect(screen.getByRole('button', { name: /^save$/i })).toBeEnabled()
  })

  it('pre-fills fields from initialData', () => {
    const initialData = { name: 'Defeat Skeleton', remainder_text: 'Reminder here', event_completion_text: 'Done!', choices: [] }
    render(<EventDetailPopup category="MAIN-QUEST" initialData={initialData} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Defeat Skeleton')
    expect(screen.getByLabelText(/reminder text/i)).toHaveValue('Reminder here')
    expect(screen.getByLabelText(/^completion text$/i)).toHaveValue('Done!')
  })

  it('calls onSave with entered data when Save is clicked', async () => {
    const onSave = vi.fn()
    render(<EventDetailPopup category="SIDE-QUEST" initialData={null} onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Find the Relic')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith({
      name: 'Find the Relic',
      remainder_text: '',
      event_completion_text: '',
      choices: [],
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not call onSave when Cancel is clicked', async () => {
    const onSave = vi.fn()
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Some Event')
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onSave).not.toHaveBeenCalled()
  })

  // ── Choices ───────────────────────────────────────────────────────────────

  it('renders an Add Choice button', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /add choice/i })).toBeInTheDocument()
  })

  it('adds a choice row when Add Choice is clicked', async () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add choice/i }))
    expect(screen.getByLabelText(/^decision 1$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^outcome 1$/i)).toBeInTheDocument()
  })

  it('can remove a choice row', async () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add choice/i }))
    expect(screen.getByLabelText(/^decision 1$/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /remove choice 1/i }))
    expect(screen.queryByLabelText(/^decision 1$/i)).not.toBeInTheDocument()
  })

  it('Add Choice button is disabled when 20 choices exist', async () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    for (let i = 0; i < 20; i++) {
      await userEvent.click(screen.getByRole('button', { name: /add choice/i }))
    }
    expect(screen.getByRole('button', { name: /add choice/i })).toBeDisabled()
  })

  it('calls onSave with choices when saved', async () => {
    const onSave = vi.fn()
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Event')
    await userEvent.click(screen.getByRole('button', { name: /add choice/i }))
    await userEvent.type(screen.getByLabelText(/^decision 1$/i), 'Fight')
    await userEvent.type(screen.getByLabelText(/^outcome 1$/i), 'You win')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      choices: [{ decision: 'Fight', outcome: 'You win' }],
    }))
  })

  it('pre-fills choices from initialData', () => {
    const initialData = {
      name: 'Event',
      remainder_text: '',
      event_completion_text: '',
      choices: [{ decision: 'Fight', outcome: 'You win' }],
    }
    render(<EventDetailPopup category="MAIN-QUEST" initialData={initialData} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/^decision 1$/i)).toHaveValue('Fight')
    expect(screen.getByLabelText(/^outcome 1$/i)).toHaveValue('You win')
  })
})
