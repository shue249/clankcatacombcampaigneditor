import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChapterPanel } from '../../src/components/ChapterPanel'

const chapter = {
  chapter_number: 1,
  title: '',
  outro_text_escaped: '',
  outro_text_knocked_out_saved: '',
  outro_text_knocked_out_depths: '',
  events: [],
  grades: [],
}

describe('ChapterPanel', () => {
  it('renders the chapter number heading', () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    expect(screen.getByRole('heading', { name: /chapter 1/i })).toBeInTheDocument()
  })

  it('shows 4 tabs: Story, Setup, Events, Completion', () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    expect(screen.getByRole('tab', { name: /story/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /setup/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /events/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /completion/i })).toBeInTheDocument()
  })

  it('Story tab is active by default', () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    expect(screen.getByRole('tab', { name: /story/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('Story tab renders the Title field', () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    expect(screen.getByLabelText(/^title$/i)).toBeInTheDocument()
  })

  it('Story tab calls onUpdateChapter when title is blurred with a new value', async () => {
    const onUpdateChapter = vi.fn()
    render(<ChapterPanel chapter={chapter} onUpdateChapter={onUpdateChapter} />)
    await userEvent.type(screen.getByLabelText(/^title$/i), 'Saving the boss')
    await userEvent.tab()
    expect(onUpdateChapter).toHaveBeenCalledWith({ title: 'Saving the boss' })
  })

  it('clicking Setup tab makes it active', async () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: /setup/i }))
    expect(screen.getByRole('tab', { name: /setup/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /story/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('clicking Events tab makes it active', async () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: /events/i }))
    expect(screen.getByRole('tab', { name: /events/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('clicking Completion tab makes it active', async () => {
    render(<ChapterPanel chapter={chapter} onUpdateChapter={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: /completion/i }))
    expect(screen.getByRole('tab', { name: /completion/i })).toHaveAttribute('aria-selected', 'true')
  })
})
