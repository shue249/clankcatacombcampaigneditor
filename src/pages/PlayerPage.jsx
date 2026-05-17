import { useNavigate } from 'react-router-dom'

export default function PlayerPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Chapter — Player Mode</span>
        <button
          className="text-gray-400 hover:text-white text-sm"
          onClick={() => navigate('/')}
        >
          ← Exit
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Player mode coming soon.</p>
      </main>
    </div>
  )
}
