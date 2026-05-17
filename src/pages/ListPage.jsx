import { useNavigate } from 'react-router-dom'

export default function ListPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-wide">Clank! Catacombs Campaign Editor</h1>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            onClick={() => alert('Import coming soon')}
          >
            Import
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold"
            onClick={() => navigate('/creator')}
          >
            + New Campaign
          </button>
        </div>
      </header>

      <main>
        <p className="text-gray-400 text-sm">No campaigns yet. Create your first one.</p>
      </main>
    </div>
  )
}
