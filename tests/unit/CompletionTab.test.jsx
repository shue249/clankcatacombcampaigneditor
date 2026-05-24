import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompletionTab } from '../../src/components/CompletionTab'

const defaultChapter = (overrides = {}) => ({
  outro_text_escaped: '',
  outro_text_knocked_out_saved: '',
  outro_text_knocked_out_depths: '',
  grades: [],
  ...overrides,
})

describe('CompletionTab — outro text fields', () => {
  it('renders the three outro text areas', () => {
    render(<CompletionTab chapter={defaultChapter()} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/escaped outro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/knocked out.*saved/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/knocked out.*depths/i)).toBeInTheDocument()
  })

  it('pre-fills outro text from chapter data', () => {
    const chapter = defaultChapter({
      outro_text_escaped: 'You escaped!',
      outro_text_knocked_out_saved: 'Barely made it.',
      outro_text_knocked_out_depths: 'Lost in the dark.',
    })
    render(<CompletionTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/escaped outro/i)).toHaveValue('You escaped!')
    expect(screen.getByLabelText(/knocked out.*saved/i)).toHaveValue('Barely made it.')
    expect(screen.getByLabelText(/knocked out.*depths/i)).toHaveValue('Lost in the dark.')
  })

  it('calls onUpdate with outro_text_escaped when that field is changed', async () => {
    const onUpdate = vi.fn()
    render(<CompletionTab chapter={defaultChapter()} onUpdate={onUpdate} />)
    const field = screen.getByLabelText(/escaped outro/i)
    await userEvent.type(field, 'Escaped!')
    field.blur()
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ outro_text_escaped: 'Escaped!' }))
  })

  it('calls onUpdate with outro_text_knocked_out_saved when that field is changed', async () => {
    const onUpdate = vi.fn()
    render(<CompletionTab chapter={defaultChapter()} onUpdate={onUpdate} />)
    const field = screen.getByLabelText(/knocked out.*saved/i)
    await userEvent.type(field, 'Saved!')
    field.blur()
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ outro_text_knocked_out_saved: 'Saved!' }))
  })

  it('calls onUpdate with outro_text_knocked_out_depths when that field is changed', async () => {
    const onUpdate = vi.fn()
    render(<CompletionTab chapter={defaultChapter()} onUpdate={onUpdate} />)
    const field = screen.getByLabelText(/knocked out.*depths/i)
    await userEvent.type(field, 'Lost!')
    field.blur()
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ outro_text_knocked_out_depths: 'Lost!' }))
  })

  it('does not call onUpdate when the value has not changed on blur', async () => {
    const onUpdate = vi.fn()
    const chapter = defaultChapter({ outro_text_escaped: 'Unchanged' })
    render(<CompletionTab chapter={chapter} onUpdate={onUpdate} />)
    const field = screen.getByLabelText(/escaped outro/i)
    field.focus()
    field.blur()
    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('CompletionTab — grades', () => {
  it('renders an Add Grade button', () => {
    render(<CompletionTab chapter={defaultChapter()} onUpdate={() => {}} />)
    expect(screen.getByRole('button', { name: /add grade/i })).toBeInTheDocument()
  })

  it('adds a grade row when Add Grade is clicked', async () => {
    render(<CompletionTab chapter={defaultChapter()} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add grade/i }))
    expect(screen.getByLabelText(/^grade 1 label$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^grade 1 min$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^grade 1 max$/i)).toBeInTheDocument()
  })

  it('pre-fills grade rows from chapter data', () => {
    const chapter = defaultChapter({ grades: [{ label: 'S', min: 80, max: 100 }] })
    render(<CompletionTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByLabelText(/^grade 1 label$/i)).toHaveValue('S')
    expect(screen.getByLabelText(/^grade 1 min$/i)).toHaveValue(80)
    expect(screen.getByLabelText(/^grade 1 max$/i)).toHaveValue(100)
  })

  it('can remove a grade row', async () => {
    render(<CompletionTab chapter={defaultChapter()} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add grade/i }))
    expect(screen.getByLabelText(/^grade 1 label$/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /remove grade 1/i }))
    expect(screen.queryByLabelText(/^grade 1 label$/i)).not.toBeInTheDocument()
  })

  it('calls onUpdate with updated grades when a grade field is changed', async () => {
    const onUpdate = vi.fn()
    render(<CompletionTab chapter={defaultChapter()} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /add grade/i }))
    const labelInput = screen.getByLabelText(/^grade 1 label$/i)
    await userEvent.type(labelInput, 'A')
    labelInput.blur()
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      grades: expect.arrayContaining([expect.objectContaining({ label: 'A' })]),
    }))
  })

  it('calls onUpdate when a grade is removed', async () => {
    const onUpdate = vi.fn()
    const chapter = defaultChapter({ grades: [{ label: 'S', min: 80, max: 100 }] })
    render(<CompletionTab chapter={chapter} onUpdate={onUpdate} />)
    await userEvent.click(screen.getByRole('button', { name: /remove grade 1/i }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ grades: [] }))
  })

  it('shows an error when grade min exceeds max', async () => {
    render(<CompletionTab chapter={defaultChapter()} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add grade/i }))
    const minInput = screen.getByLabelText(/^grade 1 min$/i)
    const maxInput = screen.getByLabelText(/^grade 1 max$/i)
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '200')
    await userEvent.clear(maxInput)
    await userEvent.type(maxInput, '100')
    minInput.blur()
    expect(screen.getByText(/min.*cannot exceed.*max|invalid range/i)).toBeInTheDocument()
  })

  it('shows an error when grade ranges overlap', async () => {
    const chapter = defaultChapter({
      grades: [
        { label: 'A', min: 100, max: 200 },
        { label: 'B', min: 150, max: 250 },
      ],
    })
    render(<CompletionTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.getByText(/overlap/i)).toBeInTheDocument()
  })

  it('shows an error when grade value is outside 0-999', async () => {
    render(<CompletionTab chapter={defaultChapter()} onUpdate={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add grade/i }))
    const minInput = screen.getByLabelText(/^grade 1 min$/i)
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '-1')
    minInput.blur()
    expect(screen.getByText(/0.*999|out of range|invalid range/i)).toBeInTheDocument()
  })

  it('does not show errors when grades are valid', () => {
    const chapter = defaultChapter({
      grades: [
        { label: 'A', min: 50, max: 100 },
        { label: 'B', min: 0, max: 49 },
      ],
    })
    render(<CompletionTab chapter={chapter} onUpdate={() => {}} />)
    expect(screen.queryByText(/overlap|invalid range/i)).not.toBeInTheDocument()
  })
})
