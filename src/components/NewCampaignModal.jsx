import { useState } from 'react'

export function NewCampaignModal({ onConfirm, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [nameError, setNameError] = useState('')

  function handleCreate() {
    if (!name.trim()) {
      setNameError('Name is required')
      return
    }
    onConfirm({ name: name.trim(), description: description.trim(), author: author.trim() })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onKeyDown={handleKeyDown}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-5">New Campaign</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="campaign-name" className="block text-sm text-gray-300 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="campaign-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError('') }}
              className="w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="campaign-description" className="block text-sm text-gray-300 mb-1">
              Description
            </label>
            <input
              id="campaign-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="campaign-author" className="block text-sm text-gray-300 mb-1">
              Author
            </label>
            <input
              id="campaign-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
