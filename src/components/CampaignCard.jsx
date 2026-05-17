export function CampaignCard({ campaign, onEdit, onExport, onDelete }) {
  const { id, name, description, author, chapters = [] } = campaign

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-white">{name}</h2>
      <p className="text-sm text-gray-400">
        {description && description.trim() ? description : 'No description'}
      </p>
      <div className="text-xs text-gray-500 flex gap-4">
        {author && <span>By {author}</span>}
        <span>{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onEdit(id)}
          className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Edit
        </button>
        <button
          onClick={() => onExport(campaign)}
          className="px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-500 text-white"
        >
          Export
        </button>
        <button
          onClick={() => onDelete(id)}
          className="px-3 py-1 text-sm rounded bg-red-700 hover:bg-red-600 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
