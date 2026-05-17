import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ListPage } from '../../src/pages/ListPage'
import { useCampaignStore } from '../../src/store/campaignStore'
import * as campaignService from '../../src/services/campaignService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  useCampaignStore.setState({ campaigns: [] })
  mockNavigate.mockClear()
  vi.restoreAllMocks()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ListPage />
    </MemoryRouter>
  )
}

describe('ListPage', () => {
  it('shows empty state when no campaigns exist', () => {
    renderPage()
    expect(screen.getByText(/no campaigns yet/i)).toBeInTheDocument()
  })

  it('shows a campaign card when a campaign exists', () => {
    useCampaignStore.setState({
      campaigns: [{ id: 'c1', name: 'My Campaign', description: '', author: 'Alice', chapters: [] }],
    })
    renderPage()
    expect(screen.getByText('My Campaign')).toBeInTheDocument()
  })

  it('opens the create modal when New Campaign is clicked', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /new campaign/i }))
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })

  it('creates a campaign after filling in the modal and clicking Create', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /new campaign/i }))
    await userEvent.type(screen.getByLabelText(/name/i), 'My Quest')
    await userEvent.click(screen.getByRole('button', { name: /^create$/i }))
    expect(useCampaignStore.getState().campaigns).toHaveLength(1)
    expect(useCampaignStore.getState().campaigns[0].name).toBe('My Quest')
  })

  it('navigates to /creator/:id after creating a campaign', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /new campaign/i }))
    await userEvent.type(screen.getByLabelText(/name/i), 'Navigation Test')
    await userEvent.click(screen.getByRole('button', { name: /^create$/i }))
    const id = useCampaignStore.getState().campaigns[0].id
    expect(mockNavigate).toHaveBeenCalledWith(`/creator/${id}`)
  })

  it('closes the modal without creating when Cancel is clicked', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /new campaign/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    expect(useCampaignStore.getState().campaigns).toHaveLength(0)
  })

  it('deletes a campaign when Delete is clicked on its card', async () => {
    useCampaignStore.setState({
      campaigns: [{ id: 'c1', name: 'Gone', description: '', author: '', chapters: [] }],
    })
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(useCampaignStore.getState().campaigns).toHaveLength(0)
  })

  it('exports a campaign when Export is clicked on its card', async () => {
    const spy = vi.spyOn(campaignService, 'exportCampaign').mockImplementation(() => {})
    useCampaignStore.setState({
      campaigns: [{ id: 'c1', name: 'Exportable', description: '', author: '', chapters: [] }],
    })
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(spy).toHaveBeenCalled()
  })

  it('imports a valid campaign file', async () => {
    const validData = {
      name: 'Imported',
      chapters: [{
        chapter_number: 1, title: 'Ch1',
        outro_text_escaped: '', outro_text_knocked_out_saved: '', outro_text_knocked_out_depths: '',
        events: [
          { event_id: 'E1', category: 'MAIN-QUEST', name: 'Go', count: 1, event_completion_text: ['Done'], required_event_ids: [] },
          { event_id: 'E2', category: 'ESCAPE', name: 'Escape', count: 1, event_completion_text: ['Escaped'], required_event_ids: [] },
        ],
      }],
    }
    renderPage()
    const file = new File([JSON.stringify(validData)], 'c.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]')
    await userEvent.upload(input, file)
    await waitFor(() => {
      expect(useCampaignStore.getState().campaigns).toHaveLength(1)
    })
    expect(screen.getByText('Imported')).toBeInTheDocument()
  })

  it('shows error toast when importing invalid JSON', async () => {
    renderPage()
    const file = new File(['not json'], 'bad.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]')
    await userEvent.upload(input, file)
    await waitFor(() => {
      expect(screen.getByText(/not valid json/i)).toBeInTheDocument()
    })
  })
})
