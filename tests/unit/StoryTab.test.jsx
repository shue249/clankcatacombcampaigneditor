import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryTab } from '../../src/components/StoryTab'

const chapter = { chapter_number: 1, title: 'Into the Dark', intro_text: 'You enter the dungeon.', events: [] }

describe('StoryTab', () => {
  it('renders a Title field', () => {
    render(<StoryTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/^title$/i)).toBeInTheDocument()
  })

  it('pre-fills the title field with the chapter title', () => {
    render(<StoryTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('Into the Dark')
  })

  it('renders a Story field', () => {
    render(<StoryTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/^story$/i)).toBeInTheDocument()
  })

  it('pre-fills the story field with intro_text', () => {
    render(<StoryTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/^story$/i)).toHaveValue('You enter the dungeon.')
  })

  it('shows an empty title field when chapter title is empty', () => {
    render(<StoryTab chapter={{ ...chapter, title: '' }} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('')
  })

  it('calls onUpdate with new title when title field is blurred', async () => {
    const onUpdate = vi.fn()
    render(<StoryTab chapter={{ ...chapter, title: '' }} onUpdate={onUpdate} />)
    await userEvent.type(screen.getByLabelText(/^title$/i), 'Saving the boss')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ title: 'Saving the boss' })
  })

  it('calls onUpdate with new intro_text when story field is blurred', async () => {
    const onUpdate = vi.fn()
    render(<StoryTab chapter={{ ...chapter, intro_text: '' }} onUpdate={onUpdate} />)
    await userEvent.type(screen.getByLabelText(/^story$/i), 'A dark cave awaits.')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ intro_text: 'A dark cave awaits.' })
  })

  it('does not call onUpdate when title is unchanged on blur', async () => {
    const onUpdate = vi.fn()
    render(<StoryTab chapter={chapter} onUpdate={onUpdate} />)
    screen.getByLabelText(/^title$/i).focus()
    await userEvent.tab()
    expect(onUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ title: expect.anything() }))
  })

  it('does not call onUpdate when intro_text is unchanged on blur', async () => {
    const onUpdate = vi.fn()
    render(<StoryTab chapter={chapter} onUpdate={onUpdate} />)
    screen.getByLabelText(/^story$/i).focus()
    await userEvent.tab()
    expect(onUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ intro_text: expect.anything() }))
  })
})
