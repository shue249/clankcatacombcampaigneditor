import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardPickerModal } from '../../src/components/CardPickerModal'

describe('CardPickerModal', () => {
  it('renders card names from the card list', () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    // Empurror has qty 1 — shows without copy number
    expect(screen.getByText('Empurror')).toBeInTheDocument()
    // Skeleton has qty 3 — shows with copy number
    expect(screen.getByText('Skeleton #1')).toBeInTheDocument()
  })

  it('renders a search input', () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByPlaceholderText(/search cards/i)).toBeInTheDocument()
  })

  it('renders type filter buttons', () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^others$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^companion$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^device$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^gem$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^monster$/i })).toBeInTheDocument()
  })

  it('renders Done and Cancel buttons', () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('filters cards by name search', async () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText(/search cards/i), 'Skeleton')
    expect(screen.getByText('Skeleton #1')).toBeInTheDocument()
    expect(screen.getByText('Skeleton Priest #1')).toBeInTheDocument()
    expect(screen.queryByText('Empurror')).not.toBeInTheDocument()
  })

  it('filtering by Monster type shows only monsters', async () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^monster$/i }))
    expect(screen.getByText('Skeleton #1')).toBeInTheDocument()
    expect(screen.getByText('Archoverlord #1')).toBeInTheDocument()
    expect(screen.queryByText('Empurror')).not.toBeInTheDocument()
    expect(screen.queryByText('Smoky Quartz')).not.toBeInTheDocument()
  })

  it('filtering by Companion type shows only companions', async () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^companion$/i }))
    expect(screen.getByText('Empurror')).toBeInTheDocument()
    expect(screen.queryByText('Skeleton #1')).not.toBeInTheDocument()
  })

  it('filtering by Others type shows only cards with no type', async () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^others$/i }))
    expect(screen.getByText('Elven Sword')).toBeInTheDocument()
    expect(screen.queryByText('Skeleton #1')).not.toBeInTheDocument()
    expect(screen.queryByText('Empurror')).not.toBeInTheDocument()
  })

  it('pre-checks cards that are already selected', () => {
    render(<CardPickerModal selectedCards={['skeleton_1']} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('checkbox', { name: /^skeleton #1$/i })).toBeChecked()
  })

  it('unchecked cards are not checked', () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('checkbox', { name: /^skeleton #1$/i })).not.toBeChecked()
  })

  it('clicking an unchecked card checks it', async () => {
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^skeleton #1$/i }))
    expect(screen.getByRole('checkbox', { name: /^skeleton #1$/i })).toBeChecked()
  })

  it('clicking a checked card unchecks it', async () => {
    render(<CardPickerModal selectedCards={['skeleton_1']} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^skeleton #1$/i }))
    expect(screen.getByRole('checkbox', { name: /^skeleton #1$/i })).not.toBeChecked()
  })

  it('calls onDone with selected card ids when Done is clicked', async () => {
    const onDone = vi.fn()
    render(<CardPickerModal selectedCards={[]} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^skeleton #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onDone).toHaveBeenCalledWith(['skeleton_1'])
  })

  it('calls onDone with pre-selected card ids when nothing is changed', async () => {
    const onDone = vi.fn()
    render(<CardPickerModal selectedCards={['empurror_1']} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onDone).toHaveBeenCalledWith(['empurror_1'])
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<CardPickerModal selectedCards={[]} onDone={() => {}} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not call onDone when Cancel is clicked', async () => {
    const onDone = vi.fn()
    render(<CardPickerModal selectedCards={[]} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^skeleton #1$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onDone).not.toHaveBeenCalled()
  })
})
