import { useState } from 'react'

const CATEGORY_LABEL_COLOR = {
  'MAIN-QUEST': 'text-blue-400',
  'SIDE-QUEST': 'text-green-400',
  'ROUND-END': 'text-orange-400',
}

const inputClass = 'w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const labelClass = 'block text-sm text-gray-300 mb-1'

export function EventDetailPopup({ category, initialData, onSave, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [remainderText, setRemainderText] = useState(initialData?.remainder_text ?? '')
  const [count, setCount] = useState(initialData?.count ?? 1)
  const [completionTexts, setCompletionTexts] = useState(
    initialData?.event_completion_text?.length > 0 ? initialData.event_completion_text : ['']
  )

  function handleSave() {
    if (!name.trim()) return
    const parsedCount = Math.max(1, parseInt(count, 10) || 1)
    onSave({
      name: name.trim(),
      remainder_text: remainderText,
      count: parsedCount,
      event_completion_text: completionTexts,
    })
  }

  function updateCompletionText(index, value) {
    setCompletionTexts((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  function addCompletionText() {
    setCompletionTexts((prev) => [...prev, ''])
  }

  function removeCompletionText(index) {
    if (completionTexts.length <= 1) return
    setCompletionTexts((prev) => prev.filter((_, i) => i !== index))
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

          <div className="max-w-xs">
            <label htmlFor="event-count" className={labelClass}>Count</label>
            <input
              id="event-count"
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Completion Text</label>
            <div className="flex flex-col gap-2">
              {completionTexts.map((text, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <textarea
                    rows={2}
                    value={text}
                    onChange={(e) => updateCompletionText(i, e.target.value)}
                    placeholder={`Completion ${i + 1}`}
                    aria-label={`Completion text ${i + 1}`}
                    className={inputClass + ' flex-1 resize-none'}
                  />
                  <button
                    onClick={() => removeCompletionText(i)}
                    disabled={completionTexts.length <= 1}
                    aria-label={`Remove completion text ${i + 1}`}
                    className="mt-1 text-gray-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addCompletionText}
                className="text-xs text-indigo-400 hover:text-indigo-300 self-start transition-colors"
              >
                + Add completion text
              </button>
            </div>
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
