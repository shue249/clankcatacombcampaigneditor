import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArtifactPickerModal } from '../../src/components/ArtifactPickerModal'

describe('ArtifactPickerModal', () => {
  it('renders all artifact names', () => {
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('5 point Artifact')).toBeInTheDocument()
    expect(screen.getByText('7 point Artifact')).toBeInTheDocument()
    expect(screen.getByText('20 point Artifact')).toBeInTheDocument()
  })

  it('renders a search input', () => {
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByPlaceholderText(/search artifacts/i)).toBeInTheDocument()
  })

  it('renders Done and Cancel buttons', () => {
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('filters artifacts by name search', async () => {
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText(/search artifacts/i), '10')
    expect(screen.getByText('10 point Artifact')).toBeInTheDocument()
    expect(screen.queryByText('5 point Artifact')).not.toBeInTheDocument()
  })

  it('pre-checks artifacts that are already selected', () => {
    render(<ArtifactPickerModal selectedArtifacts={['artifact_5']} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('checkbox', { name: /^5 point artifact$/i })).toBeChecked()
  })

  it('unchecked artifacts are not checked', () => {
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('checkbox', { name: /^5 point artifact$/i })).not.toBeChecked()
  })

  it('clicking an unchecked artifact checks it', async () => {
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^5 point artifact$/i }))
    expect(screen.getByRole('checkbox', { name: /^5 point artifact$/i })).toBeChecked()
  })

  it('clicking a checked artifact unchecks it', async () => {
    render(<ArtifactPickerModal selectedArtifacts={['artifact_5']} onDone={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^5 point artifact$/i }))
    expect(screen.getByRole('checkbox', { name: /^5 point artifact$/i })).not.toBeChecked()
  })

  it('calls onDone with selected artifact ids when Done is clicked', async () => {
    const onDone = vi.fn()
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^5 point artifact$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onDone).toHaveBeenCalledWith(['artifact_5'])
  })

  it('calls onDone with pre-selected artifact ids when nothing is changed', async () => {
    const onDone = vi.fn()
    render(<ArtifactPickerModal selectedArtifacts={['artifact_10']} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /^done$/i }))
    expect(onDone).toHaveBeenCalledWith(['artifact_10'])
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={() => {}} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not call onDone when Cancel is clicked', async () => {
    const onDone = vi.fn()
    render(<ArtifactPickerModal selectedArtifacts={[]} onDone={onDone} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /^5 point artifact$/i }))
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onDone).not.toHaveBeenCalled()
  })
})
