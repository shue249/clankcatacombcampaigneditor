import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TokenPickerModal } from '../../src/components/TokenPickerModal'

describe('TokenPickerModal', () => {
  it('renders token names from the token list', () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    // Discount Coupon has total 1 — shows without copy number
    expect(screen.getByText('Discount Coupon')).toBeInTheDocument()
    // Lockpick has total 3 — shows with copy number
    expect(screen.getByText('Lockpick #1')).toBeInTheDocument()
  })

  it('renders a search input', () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByPlaceholderText(/search tokens/i)).toBeInTheDocument()
  })

  it('renders type filter buttons', () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^major secret$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^market$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^minor secret$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^monkey idol$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^prisoner$/i })).toBeInTheDocument()
  })

  it('renders Done and Cancel buttons', () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('filters tokens by name search', async () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText(/search tokens/i), 'Potion')
    expect(screen.getByText('Potion of Healing #1')).toBeInTheDocument()
    expect(screen.queryByText('Lockpick #1')).not.toBeInTheDocument()
  })

  it('filtering by Prisoner type shows only prisoners', async () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^prisoner$/i }))
    expect(screen.getByText('Adventurer #1')).toBeInTheDocument()
    expect(screen.getByText('Discount Coupon')).toBeInTheDocument()
    expect(screen.queryByText('Lockpick #1')).not.toBeInTheDocument()
    expect(screen.queryByText('Monkey Idol #1')).not.toBeInTheDocument()
  })

  it('filtering by Market type shows only market items', async () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^market$/i }))
    expect(screen.getByText('Backpack #1')).toBeInTheDocument()
    expect(screen.getByText('Crown 10')).toBeInTheDocument()
    expect(screen.queryByText('Lockpick #1')).not.toBeInTheDocument()
  })

  it('pre-checks tokens that are already selected', () => {
    render(<TokenPickerModal selectedTokens={['lockpick_1']} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('checkbox', { name: /^lockpick #1$/i })).toBeChecked()
  })

  it('unchecked tokens are not checked', () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('checkbox', { name: /^lockpick #1$/i })).not.toBeChecked()
  })

  it('clicking an unchecked token checks it', async () => {
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^lockpick #1$/i }))
    expect(screen.getByRole('checkbox', { name: /^lockpick #1$/i })).toBeChecked()
  })

  it('clicking a checked token unchecks it', async () => {
    render(<TokenPickerModal selectedTokens={['lockpick_1']} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^lockpick #1$/i }))
    expect(screen.getByRole('checkbox', { name: /^lockpick #1$/i })).not.toBeChecked()
  })

  it('calls onDone with selected token ids when Done is clicked', async () => {
    const onDone = vi.fn()
    render(<TokenPickerModal selectedTokens={[]} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^lockpick #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onDone).toHaveBeenCalledWith(['lockpick_1'])
  })

  it('calls onDone with pre-selected token ids when nothing is changed', async () => {
    const onDone = vi.fn()
    render(<TokenPickerModal selectedTokens={['discount_coupon_1']} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onDone).toHaveBeenCalledWith(['discount_coupon_1'])
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<TokenPickerModal selectedTokens={[]} onDone={() => {}} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not call onDone when Cancel is clicked', async () => {
    const onDone = vi.fn()
    render(<TokenPickerModal selectedTokens={[]} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^lockpick #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onDone).not.toHaveBeenCalled()
  })
})
