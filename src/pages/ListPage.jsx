import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CampaignCard } from '../components/CampaignCard'
import { useCampaigns } from '../hooks/useCampaigns'

export function ListPage() {
  const navigate = useNavigate()
  const { campaigns, createCampaign, removeCampaign, importCampaign, exportCampaign } = useCampaigns()
  const fileInputRef = useRef(null)
  const [importErrors, setImportErrors] = useState([])

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const errors = await importCampaign(file)
    setImportErrors(errors)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-wide">Clank! Catacombs Campaign Editor</h1>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold"
            onClick={() => createCampaign({ name: 'New Campaign' })}
          >
            + New Campaign
          </button>
        </div>
      </header>

      {importErrors.length > 0 && (
        <div className="mb-4 p-3 rounded bg-red-900 border border-red-700 text-sm text-red-200">
          <p className="font-semibold mb-1">Import failed:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {importErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
          <button
            className="mt-2 text-xs underline text-red-300 hover:text-white"
            onClick={() => setImportErrors([])}
          >
            Dismiss
          </button>
        </div>
      )}

      <main>
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">No campaigns yet. Create your first one.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onEdit={(id) => navigate(`/creator/${id}`)}
                onExport={exportCampaign}
                onDelete={removeCampaign}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ListPage
