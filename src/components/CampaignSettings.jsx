import { useState } from 'react'

function Field({ id, label, value, onBlur, onChange, required, error, multiline }) {
  const [local, setLocal] = useState(value)

  const inputClass = "w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"

  function handleChange(val) {
    setLocal(val)
    onChange?.(val)
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={local}
          rows={3}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => onBlur(local)}
          className={inputClass + ' resize-none'}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => onBlur(local)}
          className={inputClass}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function CampaignSettings({ campaign, onUpdate }) {
  const [nameError, setNameError] = useState('')

  function handleNameBlur(value) {
    if (!value.trim()) {
      setNameError('Name cannot be empty')
      return
    }
    setNameError('')
    onUpdate({ name: value.trim() })
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-white">Settings</h2>
      <Field
        id="settings-name"
        label="Name"
        value={campaign.name}
        required
        error={nameError}
        onChange={() => setNameError('')}
        onBlur={handleNameBlur}
      />
      <Field
        id="settings-description"
        label="Description"
        value={campaign.description ?? ''}
        multiline
        onBlur={(value) => onUpdate({ description: value })}
      />
      <Field
        id="settings-author"
        label="Author"
        value={campaign.author ?? ''}
        onBlur={(value) => onUpdate({ author: value })}
      />
    </div>
  )
}
