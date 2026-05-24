import { useState } from 'react'

const inputClass = 'w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const numInputClass = 'w-24 rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function validateGrades(grades) {
  const errors = []
  for (let i = 0; i < grades.length; i++) {
    const { min, max } = grades[i]
    const minN = Number(min)
    const maxN = Number(max)
    if (isNaN(minN) || isNaN(maxN) || minN < 0 || maxN > 999) {
      errors.push(`Grade ${i + 1}: values must be 0–999 (invalid range)`)
    } else if (minN > maxN) {
      errors.push(`Grade ${i + 1}: min cannot exceed max (invalid range)`)
    }
  }
  for (let i = 0; i < grades.length; i++) {
    for (let j = i + 1; j < grades.length; j++) {
      const a = grades[i]
      const b = grades[j]
      if (Number(a.min) <= Number(b.max) && Number(b.min) <= Number(a.max)) {
        errors.push(`Grade ${i + 1} and Grade ${j + 1} ranges overlap`)
      }
    }
  }
  return errors
}

function OutroField({ id, label, value, onChange }) {
  const [local, setLocal] = useState(value)

  function handleBlur() {
    if (local !== value) onChange(local)
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-300 mb-1">{label}</label>
      <textarea
        id={id}
        aria-label={label}
        value={local}
        rows={4}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        className={inputClass + ' resize-none'}
      />
    </div>
  )
}

export function CompletionTab({ chapter, onUpdate }) {
  const [grades, setGrades] = useState(chapter.grades ?? [])
  const [outroEscaped, setOutroEscaped] = useState(chapter.outro_text_escaped ?? '')
  const [outroSaved, setOutroSaved] = useState(chapter.outro_text_knocked_out_saved ?? '')
  const [outroDepths, setOutroDepths] = useState(chapter.outro_text_knocked_out_depths ?? '')

  const gradeErrors = validateGrades(grades)

  function updateGrades(next) {
    setGrades(next)
    onUpdate({ grades: next })
  }

  function addGrade() {
    updateGrades([...grades, { label: '', min: 0, max: 0 }])
  }

  function removeGrade(index) {
    updateGrades(grades.filter((_, i) => i !== index))
  }

  function updateGradeField(index, field, value) {
    const next = grades.map((g, i) => i === index ? { ...g, [field]: value } : g)
    updateGrades(next)
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      {/* Outro texts */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Outro Text</h3>
        <OutroField
          id="outro-escaped"
          label="Escaped Outro"
          value={outroEscaped}
          onChange={(val) => { setOutroEscaped(val); onUpdate({ outro_text_escaped: val }) }}
        />
        <OutroField
          id="outro-saved"
          label="Knocked Out — Saved"
          value={outroSaved}
          onChange={(val) => { setOutroSaved(val); onUpdate({ outro_text_knocked_out_saved: val }) }}
        />
        <OutroField
          id="outro-depths"
          label="Knocked Out — Depths"
          value={outroDepths}
          onChange={(val) => { setOutroDepths(val); onUpdate({ outro_text_knocked_out_depths: val }) }}
        />
      </section>

      {/* Grades */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Scoring Grades</h3>
          <button
            type="button"
            onClick={addGrade}
            className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Add Grade
          </button>
        </div>

        {gradeErrors.length > 0 && (
          <ul className="text-sm text-red-400 flex flex-col gap-1">
            {gradeErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        )}

        {grades.map((grade, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded bg-gray-800 border border-gray-700">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor={`grade-${i + 1}-label`} className="text-xs text-gray-400">
                Grade {i + 1} Label
              </label>
              <input
                id={`grade-${i + 1}-label`}
                aria-label={`Grade ${i + 1} Label`}
                type="text"
                value={grade.label}
                onChange={(e) => updateGradeField(i, 'label', e.target.value)}
                onBlur={() => onUpdate({ grades })}
                className={inputClass}
                placeholder="e.g. S"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`grade-${i + 1}-min`} className="text-xs text-gray-400">
                Grade {i + 1} Min
              </label>
              <input
                id={`grade-${i + 1}-min`}
                aria-label={`Grade ${i + 1} Min`}
                type="number"
                min={0}
                max={999}
                value={grade.min}
                onChange={(e) => updateGradeField(i, 'min', Number(e.target.value))}
                onBlur={() => onUpdate({ grades })}
                className={numInputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`grade-${i + 1}-max`} className="text-xs text-gray-400">
                Grade {i + 1} Max
              </label>
              <input
                id={`grade-${i + 1}-max`}
                aria-label={`Grade ${i + 1} Max`}
                type="number"
                min={0}
                max={999}
                value={grade.max}
                onChange={(e) => updateGradeField(i, 'max', Number(e.target.value))}
                onBlur={() => onUpdate({ grades })}
                className={numInputClass}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove grade ${i + 1}`}
              onClick={() => removeGrade(i)}
              className="mt-4 px-2 py-1 text-sm rounded bg-red-700 hover:bg-red-600 text-white transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
