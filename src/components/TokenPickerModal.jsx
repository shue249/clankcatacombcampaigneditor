import { useState } from 'react'
import { TOKENS, TOKEN_TYPES } from '../data/tokens'

export function TokenPickerModal({ title = 'Select Tokens', selectedTokens, onDone, onCancel }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selected, setSelected] = useState(() => new Set(selectedTokens))

  const filtered = TOKENS.filter((token) => {
    const displayName = token.total > 1 ? `${token.name} #${token.copy}` : token.name
    const matchesSearch = !search || displayName.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || token.type === typeFilter
    return matchesSearch && matchesType
  })

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
          <h2 className="text-white font-semibold mb-3">{title}</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
          />
          <div className="flex gap-1 flex-wrap">
            {TOKEN_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filtered.map((token) => {
            const displayName = token.total > 1 ? `${token.name} #${token.copy}` : token.name
            return (
              <label
                key={token.id}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  aria-label={displayName}
                  checked={selected.has(token.id)}
                  onChange={() => toggle(token.id)}
                  className="accent-indigo-500 w-4 h-4 shrink-0"
                />
                <span className="text-sm text-white flex-1">{displayName}</span>
                <span className="text-xs text-gray-500">{token.type}</span>
              </label>
            )
          })}
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
