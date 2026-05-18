import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CreatorPage } from '../../src/pages/CreatorPage'
import { useCampaignStore } from '../../src/store/campaignStore'
import { buildNewChapter } from '../../src/services/campaignService'

const BASE = {
  id: 'c1',
  name: 'My Campaign',
  description: 'Desc',
  author: 'Alice',
  chapters: [buildNewChapter(1)],
}

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  useCampaignStore.setState({ campaigns: [BASE] })
  mockNavigate.mockClear()
})

function renderCreatorPage(id = 'c1') {
  return render(
    <MemoryRouter initialEntries={[`/creator/${id}`]}>
      <Routes>
        <Route path="/creator/:id" element={<CreatorPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CreatorPage', () => {
  it('shows the campaign name in the header', () => {
    renderCreatorPage()
    expect(screen.getByText('My Campaign')).toBeInTheDocument()
  })

  it('shows Settings item in the sidebar', () => {
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /^settings$/i })).toBeInTheDocument()
  })

  it('shows Chapter 1 in the sidebar (no title, shows number only)', () => {
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /^chapter 1$/i })).toBeInTheDocument()
  })

  it('shows Chapter N - Title format when chapter has a title', () => {
    useCampaignStore.setState({
      campaigns: [{ ...BASE, chapters: [{ ...buildNewChapter(1), title: 'Saving the boss' }] }],
    })
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /chapter 1 - saving the boss/i })).toBeInTheDocument()
  })

  it('shows Add Chapter button in the sidebar', () => {
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /add chapter/i })).toBeInTheDocument()
  })

  it('shows chapter panel with 4 tabs by default', () => {
    renderCreatorPage()
    expect(screen.getByRole('tab', { name: /story/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /setup/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /events/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /completion/i })).toBeInTheDocument()
  })

  it('clicking Settings shows the settings form in the main area', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /^settings$/i }))
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument()
  })

  it('settings fields are pre-filled with campaign data', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /^settings$/i }))
    expect(screen.getByLabelText(/name/i)).toHaveValue('My Campaign')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Desc')
    expect(screen.getByLabelText(/author/i)).toHaveValue('Alice')
  })

  it('clicking a chapter in sidebar shows that chapter panel', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /^chapter 1$/i }))
    expect(screen.getByRole('tab', { name: /story/i })).toBeInTheDocument()
  })

  it('Add Chapter button adds a new chapter to the sidebar', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /add chapter/i }))
    expect(screen.getByRole('button', { name: /^chapter 2$/i })).toBeInTheDocument()
    expect(useCampaignStore.getState().campaigns[0].chapters).toHaveLength(2)
  })

  it('navigates to / when campaign id is not found', () => {
    renderCreatorPage('unknown-id')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('back button navigates to /', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows a Save button at the bottom of the sidebar', () => {
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
  })

  it('Save button shows Saved confirmation when clicked', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument()
  })

  it('updating chapter title in Story tab updates the sidebar label', async () => {
    renderCreatorPage()
    await userEvent.type(screen.getByLabelText(/^title$/i), 'Saving the boss')
    await userEvent.tab()
    expect(useCampaignStore.getState().campaigns[0].chapters[0].title).toBe('Saving the boss')
    expect(screen.getByRole('button', { name: /chapter 1 - saving the boss/i })).toBeInTheDocument()
  })

  it('shows a delete button for each chapter', () => {
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /delete chapter 1/i })).toBeInTheDocument()
  })

  it('delete button is disabled when only one chapter exists', () => {
    renderCreatorPage()
    expect(screen.getByRole('button', { name: /delete chapter 1/i })).toBeDisabled()
  })

  it('delete button is enabled when multiple chapters exist', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /add chapter/i }))
    expect(screen.getByRole('button', { name: /delete chapter 1/i })).not.toBeDisabled()
  })

  it('clicking delete trash icon opens a confirmation dialog', async () => {
    useCampaignStore.setState({
      campaigns: [{ ...BASE, chapters: [buildNewChapter(1), buildNewChapter(2)] }],
    })
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /delete chapter 2/i }))
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('clicking Cancel in confirmation dialog does not delete the chapter', async () => {
    useCampaignStore.setState({
      campaigns: [{ ...BASE, chapters: [buildNewChapter(1), buildNewChapter(2)] }],
    })
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /delete chapter 2/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.getByRole('button', { name: /^chapter 2$/i })).toBeInTheDocument()
    expect(useCampaignStore.getState().campaigns[0].chapters).toHaveLength(2)
  })

  it('clicking delete removes the chapter from the sidebar after confirmation', async () => {
    useCampaignStore.setState({
      campaigns: [{ ...BASE, chapters: [buildNewChapter(1), buildNewChapter(2)] }],
    })
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /delete chapter 2/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.queryByRole('button', { name: /^chapter 2$/i })).not.toBeInTheDocument()
    expect(useCampaignStore.getState().campaigns[0].chapters).toHaveLength(1)
  })

  it('deleting the selected chapter auto-selects the nearest chapter', async () => {
    useCampaignStore.setState({
      campaigns: [{ ...BASE, chapters: [buildNewChapter(1), buildNewChapter(2)] }],
    })
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /^chapter 2$/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete chapter 2/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.getByRole('tab', { name: /story/i })).toBeInTheDocument()
  })

  it('shows correct title field when switching between chapters', async () => {
    useCampaignStore.setState({
      campaigns: [{
        ...BASE,
        chapters: [
          { ...buildNewChapter(1), title: 'First Chapter', intro_text: '' },
          { ...buildNewChapter(2), title: 'Second Chapter', intro_text: '' },
        ],
      }],
    })
    renderCreatorPage()
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('First Chapter')
    await userEvent.click(screen.getByRole('button', { name: /^chapter 2/i }))
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('Second Chapter')
  })

  it('retains the active tab when switching between chapters', async () => {
    useCampaignStore.setState({
      campaigns: [{ ...BASE, chapters: [buildNewChapter(1), buildNewChapter(2)] }],
    })
    renderCreatorPage()
    await userEvent.click(screen.getByRole('tab', { name: /setup/i }))
    expect(screen.getByRole('tab', { name: /setup/i })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('button', { name: /^chapter 2$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^chapter 1$/i }))
    expect(screen.getByRole('tab', { name: /setup/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('new chapters default to Story tab even if another chapter is on a different tab', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('tab', { name: /setup/i }))
    await userEvent.click(screen.getByRole('button', { name: /add chapter/i }))
    expect(screen.getByRole('tab', { name: /story/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('updates campaign name in store when settings field is blurred', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /^settings$/i }))
    const input = screen.getByLabelText(/name/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Renamed')
    await userEvent.tab()
    expect(useCampaignStore.getState().campaigns[0].name).toBe('Renamed')
  })
})
