import { useState } from 'react'
import { ARTIFACTS } from '../data/artifacts'

export function ArtifactPickerModal({ selectedArtifacts, onDone, onCancel }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(() => new Set(selectedArtifacts))

  const filtered = ARTIFACTS.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[80vh]">

        <div className="p-5 border-b border-gray-700 shrink-0">
          <h2 className="text-white font-semibold mb-3">Starting Artifacts</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts..."
            className="w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filtered.map((artifact) => (
            <label
              key={artifact.id}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                aria-label={artifact.name}
                checked={selected.has(artifact.id)}
                onChange={() => toggle(artifact.id)}
                className="accent-indigo-500 w-4 h-4 shrink-0"
              />
              <span className="text-sm text-white flex-1">{artifact.name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-700 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDone([...selected])}
            className="px-4 py-2 rounded text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
