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
    render(<EventDetailPopup category="MAIN-QUEST" initialData={{ name: 'Defeat Skeleton', remainder_text: '', count: 1, event_completion_text: [''] }} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('heading', { name: /edit event/i })).toBeInTheDocument()
  })

  it('renders name, reminder text, count, and completion text fields', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/reminder text/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^count/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^completion text 1$/i)).toBeInTheDocument()
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
    const initialData = { name: 'Defeat Skeleton', remainder_text: 'Reminder here', count: 3, event_completion_text: ['Done!'] }
    render(<EventDetailPopup category="MAIN-QUEST" initialData={initialData} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Defeat Skeleton')
    expect(screen.getByLabelText(/reminder text/i)).toHaveValue('Reminder here')
    expect(screen.getByLabelText(/^count/i)).toHaveValue(3)
    expect(screen.getByLabelText(/^completion text 1$/i)).toHaveValue('Done!')
  })

  it('calls onSave with entered data when Save is clicked', async () => {
    const onSave = vi.fn()
    render(<EventDetailPopup category="SIDE-QUEST" initialData={null} onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Find the Relic')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith({
      name: 'Find the Relic',
      remainder_text: '',
      count: 1,
      event_completion_text: [''],
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

  it('can add a second completion text entry', async () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add completion text/i }))
    expect(screen.getByLabelText(/^completion text 2$/i)).toBeInTheDocument()
  })

  it('remove button is disabled when only one completion text entry exists', () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /remove completion text 1/i })).toBeDisabled()
  })

  it('can remove a completion text entry when more than one exists', async () => {
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add completion text/i }))
    expect(screen.getByLabelText(/^completion text 2$/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /remove completion text 2/i }))
    expect(screen.queryByLabelText(/^completion text 2$/i)).not.toBeInTheDocument()
  })

  it('calls onSave with count clamped to min 1', async () => {
    const onSave = vi.fn()
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Event')
    await userEvent.clear(screen.getByLabelText(/^count/i))
    await userEvent.type(screen.getByLabelText(/^count/i), '0')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }))
  })

  it('calls onSave with multiple completion texts', async () => {
    const onSave = vi.fn()
    render(<EventDetailPopup category="MAIN-QUEST" initialData={null} onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/^name/i), 'Event')
    await userEvent.type(screen.getByLabelText(/^completion text 1$/i), 'First')
    await userEvent.click(screen.getByRole('button', { name: /add completion text/i }))
    await userEvent.type(screen.getByLabelText(/^completion text 2$/i), 'Second')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      event_completion_text: ['First', 'Second'],
    }))
  })
})
