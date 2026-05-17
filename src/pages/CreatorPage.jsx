import { useNavigate } from 'react-router-dom'

export default function CreatorPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Campaign</h2>
        <button className="text-left px-3 py-2 rounded hover:bg-gray-800 text-sm">Settings</button>
        <button className="text-left px-3 py-2 rounded hover:bg-gray-800 text-sm">+ Add Chapter</button>
        <div className="mt-auto">
          <button
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold"
            onClick={() => alert('Save coming soon')}
          >
            Save
          </button>
          <button
            className="w-full mt-2 px-3 py-2 text-gray-400 hover:text-white text-sm"
            onClick={() => navigate('/')}
          >
            ← Back to List
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-8">
        <p className="text-gray-400 text-sm">Select or add a chapter to begin editing.</p>
      </main>
    </div>
  )
}
