import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChapterPanel } from '../../src/components/ChapterPanel'

const chapter = {
  chapter_number: 1,
  title: 'Chapter 1',
  outro_text_escaped: '',
  outro_text_knocked_out_saved: '',
  outro_text_knocked_out_depths: '',
  events: [],
  grades: [],
}

describe('ChapterPanel', () => {
  it('renders the chapter title', () => {
    render(<ChapterPanel chapter={chapter} />)
    expect(screen.getByText('Chapter 1')).toBeInTheDocument()
  })

  it('shows 4 tabs: Story, Setup, Events, Completion', () => {
    render(<ChapterPanel chapter={chapter} />)
    expect(screen.getByRole('tab', { name: /story/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /setup/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /events/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /completion/i })).toBeInTheDocument()
  })

  it('Story tab is active by default', () => {
    render(<ChapterPanel chapter={chapter} />)
    expect(screen.getByRole('tab', { name: /story/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('clicking Setup tab makes it active', async () => {
    render(<ChapterPanel chapter={chapter} />)
    await userEvent.click(screen.getByRole('tab', { name: /setup/i }))
    expect(screen.getByRole('tab', { name: /setup/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /story/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('clicking Events tab makes it active', async () => {
    render(<ChapterPanel chapter={chapter} />)
    await userEvent.click(screen.getByRole('tab', { name: /events/i }))
    expect(screen.getByRole('tab', { name: /events/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('clicking Completion tab makes it active', async () => {
    render(<ChapterPanel chapter={chapter} />)
    await userEvent.click(screen.getByRole('tab', { name: /completion/i }))
    expect(screen.getByRole('tab', { name: /completion/i })).toHaveAttribute('aria-selected', 'true')
  })
})
