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
    await userEvent.click(screen.getByRole('button', { name: /chapter 1/i }))
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
