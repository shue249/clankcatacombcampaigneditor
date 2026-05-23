import { useState } from 'react'

const CATEGORY_LABEL_COLOR = {
  'MAIN-QUEST': 'text-blue-400',
  'SIDE-QUEST': 'text-green-400',
  'ROUND-END': 'text-orange-400',
}

const inputClass = 'w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const labelClass = 'block text-sm text-gray-300 mb-1'

const MAX_CHOICES = 20

export function EventDetailPopup({ category, initialData, onSave, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [remainderText, setRemainderText] = useState(initialData?.remainder_text ?? '')
  const [completionText, setCompletionText] = useState(initialData?.event_completion_text ?? '')
  const [choices, setChoices] = useState(initialData?.choices ?? [])

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      remainder_text: remainderText,
      event_completion_text: completionText,
      choices,
    })
  }

  function addChoice() {
    if (choices.length >= MAX_CHOICES) return
    setChoices((prev) => [...prev, { decision: '', outcome: '' }])
  }

  function removeChoice(index) {
    setChoices((prev) => prev.filter((_, i) => i !== index))
  }

  function updateChoice(index, field, value) {
    setChoices((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">

        <div className="p-5 border-b border-gray-700 shrink-0">
          <span className={`text-xs font-bold uppercase tracking-widest ${CATEGORY_LABEL_COLOR[category] ?? 'text-gray-400'}`}>
            {category}
          </span>
          <h2 className="text-white font-semibold mt-1">
            {initialData ? 'Edit Event' : 'New Event'}
          </h2>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          <div>
            <label htmlFor="event-name" className={labelClass}>
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Defeat Skeleton"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="event-remainder" className={labelClass}>Reminder Text</label>
            <textarea
              id="event-remainder"
              rows={3}
              value={remainderText}
              onChange={(e) => setRemainderText(e.target.value)}
              placeholder="Shown on screen while event is active..."
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <label htmlFor="event-completion" className={labelClass}>Completion Text</label>
            <textarea
              id="event-completion"
              rows={3}
              value={completionText}
              onChange={(e) => setCompletionText(e.target.value)}
              placeholder="Shown when event is completed..."
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={labelClass + ' mb-0'}>Choices ({choices.length}/{MAX_CHOICES})</span>
              <button
                onClick={addChoice}
                disabled={choices.length >= MAX_CHOICES}
                className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                + Add Choice
              </button>
            </div>
            {choices.length > 0 && (
              <div className="flex flex-col gap-3">
                {choices.map((choice, i) => (
                  <div key={i} className="rounded border border-gray-700 bg-gray-800 p-3 flex flex-col gap-2 relative">
                    <button
                      onClick={() => removeChoice(i)}
                      aria-label={`Remove choice ${i + 1}`}
                      className="nodrag nopan absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors text-base leading-none"
                    >
                      ×
                    </button>
                    <div>
                      <label htmlFor={`choice-decision-${i}`} className={labelClass}>
                        Decision {i + 1}
                      </label>
                      <input
                        id={`choice-decision-${i}`}
                        type="text"
                        value={choice.decision}
                        onChange={(e) => updateChoice(i, 'decision', e.target.value)}
                        placeholder="e.g. Give the Monkey Idol"
                        aria-label={`Decision ${i + 1}`}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`choice-outcome-${i}`} className={labelClass}>
                        Outcome {i + 1}
                      </label>
                      <textarea
                        id={`choice-outcome-${i}`}
                        rows={2}
                        value={choice.outcome}
                        onChange={(e) => updateChoice(i, 'outcome', e.target.value)}
                        placeholder="e.g. Lose the Monkey Idol, gain a Librarian card"
                        aria-label={`Outcome ${i + 1}`}
                        className={inputClass + ' resize-none'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-700 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 rounded text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
