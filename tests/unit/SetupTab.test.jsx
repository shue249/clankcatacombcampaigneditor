import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupTab } from '../../src/components/SetupTab'

const chapter = {
  chapter_number: 1,
  starting_map: 'Forest path',
  starting_artifacts: ['artifact_5'],
  starting_tokens: ['lockpick_1'],
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
  set_aside_cards: ['skeleton_1'],
  set_aside_tokens: ['monkey_idol_1'],
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
    expect(screen.getByLabelText(/tile deck/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add artifacts/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add cards/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /add tokens/i })).toHaveLength(2)
  })

  it('pre-filled set_aside_cards appear as removable chips using card name', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByText('Skeleton')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove skeleton/i })).toBeInTheDocument()
  })

  it('clicking the remove button on a chip calls onUpdate with card removed', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={chapter} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /remove skeleton/i }))
    expect(onUpdate).toHaveBeenCalledWith({ set_aside_cards: [] })
  })

  it('groups chips by name — selecting all 3 Skeleton copies shows Skeleton ×3', () => {
    render(<SetupTab chapter={{ ...chapter, set_aside_cards: ['skeleton_1', 'skeleton_2', 'skeleton_3'] }} onUpdate={() => {}} />)
    expect(screen.getByText('Skeleton ×3')).toBeInTheDocument()
  })

  it('opening the modal pre-checks cards already in Set Aside Cards', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add cards/i }))
    expect(screen.getByRole('checkbox', { name: /^skeleton #1$/i })).toBeChecked()
  })

  it('opening the modal does not pre-check cards not in Set Aside Cards', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add cards/i }))
    expect(screen.getByRole('checkbox', { name: /^skeleton #2$/i })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /^skeleton #3$/i })).not.toBeChecked()
  })

  it('clicking Add Cards opens the card picker modal', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add cards/i }))
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('calls onUpdate with selected card ids when modal Done is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, set_aside_cards: [] }} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /add cards/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^skeleton #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onUpdate).toHaveBeenCalledWith({ set_aside_cards: ['skeleton_1'] })
  })

  it('modal closes without calling onUpdate when Cancel is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, set_aside_cards: [] }} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /add cards/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^skeleton #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /^done$/i })).not.toBeInTheDocument()
  })

  it('pre-filled starting_artifacts appear as removable chips using artifact name', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByText('5 point Artifact')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^remove 5 point artifact$/i })).toBeInTheDocument()
  })

  it('clicking the remove button on a starting artifact chip calls onUpdate with artifact removed', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={chapter} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /^remove 5 point artifact$/i }))
    expect(onUpdate).toHaveBeenCalledWith({ starting_artifacts: [] })
  })

  it('clicking Add Artifacts opens the artifact picker modal', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add artifacts/i }))
    expect(screen.getByRole('heading', { name: /^starting artifacts$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
  })

  it('artifact modal pre-checks artifacts already in starting_artifacts', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add artifacts/i }))
    expect(screen.getByRole('checkbox', { name: /^5 point artifact$/i })).toBeChecked()
  })

  it('artifact modal does not pre-check artifacts not in starting_artifacts', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add artifacts/i }))
    expect(screen.getByRole('checkbox', { name: /^7 point artifact$/i })).not.toBeChecked()
  })

  it('calls onUpdate with selected artifact ids when artifact modal Done is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, starting_artifacts: [] }} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /add artifacts/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^5 point artifact$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onUpdate).toHaveBeenCalledWith({ starting_artifacts: ['artifact_5'] })
  })

  it('artifact modal closes without calling onUpdate when Cancel is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, starting_artifacts: [] }} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /add artifacts/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^5 point artifact$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /^done$/i })).not.toBeInTheDocument()
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

  // Numeric field limits
  it('rage track input has min=1 and max=7', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const input = screen.getByLabelText(/rage track/i)
    expect(input).toHaveAttribute('min', '1')
    expect(input).toHaveAttribute('max', '7')
  })

  it('player clank inputs have min=0 and max=30', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/player clank normal/i)).toHaveAttribute('min', '0')
    expect(screen.getByLabelText(/player clank normal/i)).toHaveAttribute('max', '30')
    expect(screen.getByLabelText(/player clank hard/i)).toHaveAttribute('max', '30')
    expect(screen.getByLabelText(/player clank brutal/i)).toHaveAttribute('max', '30')
  })

  it('rival clank inputs have min=0 and max=30', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/rival clank normal/i)).toHaveAttribute('max', '30')
    expect(screen.getByLabelText(/rival clank hard/i)).toHaveAttribute('max', '30')
    expect(screen.getByLabelText(/rival clank brutal/i)).toHaveAttribute('max', '30')
  })

  it('dragon clank inputs have min=0 and max=24', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/dragon clank normal/i)).toHaveAttribute('max', '24')
    expect(screen.getByLabelText(/dragon clank hard/i)).toHaveAttribute('max', '24')
    expect(screen.getByLabelText(/dragon clank brutal/i)).toHaveAttribute('max', '24')
  })

  it('ghost clank inputs have min=0 and max=5', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/ghost clank normal/i)).toHaveAttribute('max', '5')
    expect(screen.getByLabelText(/ghost clank hard/i)).toHaveAttribute('max', '5')
    expect(screen.getByLabelText(/ghost clank brutal/i)).toHaveAttribute('max', '5')
  })

  it('clamps player clank above max to 30 on blur and updates display', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, player_clank: 0 }} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/player clank normal/i))
    await userEvent.type(screen.getByLabelText(/player clank normal/i), '99')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ player_clank: 30 })
    expect(screen.getByLabelText(/player clank normal/i)).toHaveValue(30)
  })

  it('clamps ghost clank above max to 5 on blur and updates display', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, ghost_clank: 0 }} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/ghost clank normal/i))
    await userEvent.type(screen.getByLabelText(/ghost clank normal/i), '10')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ ghost_clank: 5 })
    expect(screen.getByLabelText(/ghost clank normal/i)).toHaveValue(5)
  })

  it('clamps rage track above max to 7 on blur and updates display', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, rage_track: 3 }} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/rage track/i))
    await userEvent.type(screen.getByLabelText(/rage track/i), '10')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ rage_track: 7 })
    expect(screen.getByLabelText(/rage track/i)).toHaveValue(7)
  })

  it('clamps rage track below min to 1 on blur and updates display', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, rage_track: 3 }} onUpdate={onUpdate} />)
    await userEvent.clear(screen.getByLabelText(/rage track/i))
    await userEvent.type(screen.getByLabelText(/rage track/i), '0')
    await userEvent.tab()
    expect(onUpdate).toHaveBeenCalledWith({ rage_track: 1 })
    expect(screen.getByLabelText(/rage track/i)).toHaveValue(1)
  })

  // Starting Tokens
  it('pre-filled starting_tokens appear as removable chips using token name', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByText('Lockpick')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove lockpick/i })).toBeInTheDocument()
  })

  it('clicking the remove button on a starting token chip calls onUpdate with token removed', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={chapter} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /remove lockpick/i }))
    expect(onUpdate).toHaveBeenCalledWith({ starting_tokens: [] })
  })

  it('clicking Add Tokens (first) opens the starting token picker modal', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const [firstAddTokens] = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(firstAddTokens)
    expect(screen.getByRole('heading', { name: /^starting tokens$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
  })

  it('starting token modal pre-checks tokens already in starting_tokens', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const [firstAddTokens] = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(firstAddTokens)
    expect(screen.getByRole('checkbox', { name: /^lockpick #1$/i })).toBeChecked()
  })

  it('starting token modal does not pre-check tokens not in starting_tokens', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const [firstAddTokens] = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(firstAddTokens)
    expect(screen.getByRole('checkbox', { name: /^lockpick #2$/i })).not.toBeChecked()
  })

  it('calls onUpdate with selected token ids when starting token modal Done is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, starting_tokens: [] }} onUpdate={onUpdate} />)
    const [firstAddTokens] = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(firstAddTokens)
    await userEvent.click(screen.getByRole('checkbox', { name: /^lockpick #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onUpdate).toHaveBeenCalledWith({ starting_tokens: ['lockpick_1'] })
  })

  it('starting token modal closes without calling onUpdate when Cancel is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, starting_tokens: [] }} onUpdate={onUpdate} />)
    const [firstAddTokens] = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(firstAddTokens)
    await userEvent.click(screen.getByRole('checkbox', { name: /^lockpick #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /^done$/i })).not.toBeInTheDocument()
  })

  // Set Aside Tokens
  it('pre-filled set_aside_tokens appear as removable chips using token name', () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByText('Monkey Idol')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove monkey idol/i })).toBeInTheDocument()
  })

  it('clicking the remove button on a set aside token chip calls onUpdate with token removed', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={chapter} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /remove monkey idol/i }))
    expect(onUpdate).toHaveBeenCalledWith({ set_aside_tokens: [] })
  })

  it('clicking Add Tokens (second) opens the set aside token picker modal', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const addTokenButtons = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(addTokenButtons[1])
    expect(screen.getByRole('heading', { name: /^set aside tokens$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
  })

  it('set aside token modal pre-checks tokens already in set_aside_tokens', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const addTokenButtons = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(addTokenButtons[1])
    expect(screen.getByRole('checkbox', { name: /^monkey idol #1$/i })).toBeChecked()
  })

  it('set aside token modal does not pre-check tokens not in set_aside_tokens', async () => {
    render(<SetupTab chapter={chapter} onUpdate={() => {}} />)
    const addTokenButtons = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(addTokenButtons[1])
    expect(screen.getByRole('checkbox', { name: /^monkey idol #2$/i })).not.toBeChecked()
  })

  it('calls onUpdate with selected token ids when set aside token modal Done is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, set_aside_tokens: [] }} onUpdate={onUpdate} />)
    const addTokenButtons = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(addTokenButtons[1])
    await userEvent.click(screen.getByRole('checkbox', { name: /^monkey idol #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onUpdate).toHaveBeenCalledWith({ set_aside_tokens: ['monkey_idol_1'] })
  })

  it('set aside token modal closes without calling onUpdate when Cancel is clicked', async () => {
    const onUpdate = vi.fn()
    render(<SetupTab chapter={{ ...chapter, set_aside_tokens: [] }} onUpdate={onUpdate} />)
    const addTokenButtons = screen.getAllByRole('button', { name: /add tokens/i })
    await userEvent.click(addTokenButtons[1])
    await userEvent.click(screen.getByRole('checkbox', { name: /^monkey idol #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /^done$/i })).not.toBeInTheDocument()
  })
})
