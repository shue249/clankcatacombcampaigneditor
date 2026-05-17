import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CampaignSettings } from '../components/CampaignSettings'
import { useCampaignEditor } from '../hooks/useCampaignEditor'

export function CreatorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { campaign, updateSettings } = useCampaignEditor(id)

  useEffect(() => {
    if (campaign === undefined) navigate('/')
  }, [campaign, navigate])

  if (!campaign) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <button
          aria-label="Back"
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded hover:bg-gray-800"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-white truncate">{campaign.name}</h1>
      </header>

      <div className="flex flex-1">
        <aside className="w-72 border-r border-gray-800 bg-gray-900 p-6 overflow-y-auto">
          <CampaignSettings campaign={campaign} onUpdate={updateSettings} />
        </aside>

        <main className="flex-1 p-8">
          <p className="text-gray-500 text-sm">Chapters coming soon.</p>
        </main>
      </div>
    </div>
  )
}

export default CreatorPage
