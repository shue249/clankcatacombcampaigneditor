import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CreatorPage } from '../../src/pages/CreatorPage'
import { useCampaignStore } from '../../src/store/campaignStore'

const BASE = { id: 'c1', name: 'My Campaign', description: 'Desc', author: 'Alice', chapters: [] }

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

  it('renders the settings section', () => {
    renderCreatorPage()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument()
  })

  it('settings fields are pre-filled with campaign data', () => {
    renderCreatorPage()
    expect(screen.getByLabelText(/name/i)).toHaveValue('My Campaign')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Desc')
    expect(screen.getByLabelText(/author/i)).toHaveValue('Alice')
  })

  it('navigates to / when campaign id is not found', () => {
    renderCreatorPage('unknown-id')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('updates campaign name in store when field is blurred', async () => {
    renderCreatorPage()
    const input = screen.getByLabelText(/name/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Renamed')
    await userEvent.tab()
    expect(useCampaignStore.getState().campaigns[0].name).toBe('Renamed')
  })

  it('back button navigates to /', async () => {
    renderCreatorPage()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
