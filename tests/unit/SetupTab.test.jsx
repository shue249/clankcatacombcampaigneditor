import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupTab } from '../../src/components/SetupTab'

const chapter = {
  chapter_number: 1,
  starting_map: 'Forest path',
  starting_artifacts: ['Sword', 'Shield'],
  starting_tokens: ['Gold coin'],
  tile_deck: ['Forest', 'Cave'],
  player_clank: 3,
  rival_clank: 3,
  dragon_clank: 0,
  ghost_clank: 0,
  player_clank_hard: 3,
  rival_clank_hard: 3,
  dragon_clank_hard: 4,
  ghost_clank_hard: 0,
  player_clank_brutal: 3,
  rival_clank_brutal: 3,
  dragon_clank_brutal: 6,
  ghost_clank_brutal: 1,
  rage_track: 3,
  set_aside_cards: ['Dragon card'],
  set_aside_tokens: ['Dragon token'],
  instructions: 'Set up the board',
}

describe('SetupTab', () => {
  it('renders the Starting Map field', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/starting map/i)).toBeInTheDocument()
  })

  it('pre-fills Starting Map with chapter data', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/starting map/i)).toHaveValue('Forest path')
  })

  it('renders list fields', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/starting artifacts/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/starting tokens/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tile deck/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/set aside cards/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/set aside tokens/i)).toBeInTheDocument()
  })

  it('pre-fills list fields as one item per line', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/starting artifacts/i)).toHaveValue('Sword\nShield')
    expect(screen.getByLabelText(/starting tokens/i)).toHaveValue('Gold coin')
  })

  it('renders Normal, Hard and Brutal difficulty columns', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByText(/^normal$/i)).toBeInTheDocument()
    expect(screen.getByText(/^hard$/i)).toBeInTheDocument()
    expect(screen.getByText(/^brutal$/i)).toBeInTheDocument()
  })

  it('renders clank inputs for all three difficulty levels', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/player clank normal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/player clank hard/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/player clank brutal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dragon clank normal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dragon clank hard/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dragon clank brutal/i)).toBeInTheDocument()
  })

  it('pre-fills Normal clank values from chapter data', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/player clank normal/i)).toHaveValue(3)
    expect(screen.getByLabelText(/dragon clank normal/i)).toHaveValue(0)
    expect(screen.getByLabelText(/ghost clank normal/i)).toHaveValue(0)
  })

  it('pre-fills Hard clank values from chapter data', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/player clank hard/i)).toHaveValue(3)
    expect(screen.getByLabelText(/dragon clank hard/i)).toHaveValue(4)
    expect(screen.getByLabelText(/ghost clank hard/i)).toHaveValue(0)
  })

  it('pre-fills Brutal clank values from chapter data', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/player clank brutal/i)).toHaveValue(3)
    expect(screen.getByLabelText(/dragon clank brutal/i)).toHaveValue(6)
    expect(screen.getByLabelText(/ghost clank brutal/i)).toHaveValue(1)
  })

  it('renders the Rage Track field', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/rage track/i)).toBeInTheDocument()
  })

  it('pre-fills Rage Track with chapter data', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/rage track/i)).toHaveValue(3)
  })

  it('renders the Instructions field', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/instructions/i)).toBeInTheDocument()
  })

  it('pre-fills Instructions with chapter data', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/instructions/i)).toHaveValue('Set up the board')
  })

  it('calls onUpdate with starting_map string on blur', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, starting_map: '' }} onUpdate={onUpdate} />)
    await userEvent.type(screen.getByLabelText(/starting map/i), 'New map')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ starting_map: 'New map' })
  })

  it('calls onUpdate with starting_artifacts array on blur', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, starting_artifacts: [] }} onUpdate={onUpdate} />)
    await userEvent.type(screen.getByLabelText(/starting artifacts/i), 'Sword')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ starting_artifacts: ['Sword'] })
  })

  it('calls onUpdate with player_clank number on blur', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, player_clank: 0 }} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/player clank normal/i))
    await userEvent.type(screen.getByLabelText(/player clank normal/i), '4')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ player_clank: 4 })
  })

  it('calls onUpdate with dragon_clank_hard on blur', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, dragon_clank_hard: 0 }} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/dragon clank hard/i))
    await userEvent.type(screen.getByLabelText(/dragon clank hard/i), '5')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ dragon_clank_hard: 5 })
  })

  it('does not call onUpdate when starting_map is unchanged on blur', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={chapter} onUpdate={onUpdate} />)
    screen.getByLabelText(/starting map/i).focus()
    await userEvent.tab()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('does not call onUpdate when integer field is unchanged on blur', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={chapter} onUpdate={onUpdate} />)
    screen.getByLabelText(/player clank normal/i).focus()
    await userEvent.tab()
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
