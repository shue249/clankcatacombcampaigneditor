import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CampaignSettings } from '../components/CampaignSettings'
import { ChapterPanel } from '../components/ChapterPanel'
import { useCampaignEditor } from '../hooks/useCampaignEditor'

function chapterLabel(ch) {
  return ch.title?.trim()
    ? `Chapter ${ch.chapter_number} - ${ch.title}`
    : `Chapter ${ch.chapter_number}`
}

export function CreatorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { campaign, updateSettings, addChapter, updateChapter } = useCampaignEditor(id)

  const [selected, setSelected] = useState({ type: 'chapter', chapterNumber: 1 })
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (campaign === undefined) navigate('/')
  }, [campaign, navigate])

  if (!campaign) return null

  const selectedChapter =
    selected.type === 'chapter'
      ? campaign.chapters.find((c) => c.chapter_number === selected.chapterNumber)
      : null

  function handleAddChapter() {
    addChapter()
    const nextNumber = campaign.chapters.length + 1
    setSelected({ type: 'chapter', chapterNumber: nextNumber })
  }

  function handleSave() {
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
        <button
          aria-label="Back"
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded hover:bg-gray-800"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-white truncate">{campaign.name}</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">

          {/* Settings button — fixed at top */}
          <div className="p-3 shrink-0">
            <button
              onClick={() => setSelected({ type: 'settings' })}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                selected.type === 'settings'
                  ? 'bg-indigo-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          <div className="px-3 shrink-0">
            <hr className="border-gray-700" />
          </div>

          {/* Chapters list + Add Chapter — scrollable */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-widest px-2 py-1 shrink-0">
              Chapters
            </p>
            {campaign.chapters.map((ch) => (
              <button
                key={ch.chapter_number}
                onClick={() => setSelected({ type: 'chapter', chapterNumber: ch.chapter_number })}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selected.type === 'chapter' && selected.chapterNumber === ch.chapter_number
                    ? 'bg-indigo-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {chapterLabel(ch)}
              </button>
            ))}
            <button
              onClick={handleAddChapter}
              className="w-full text-left px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              + Add Chapter
            </button>
          </div>

          {/* Save button — always visible at bottom */}
          <div className="p-3 border-t border-gray-800 shrink-0">
            <button
              onClick={handleSave}
              className={`w-full px-3 py-2 rounded text-sm font-semibold transition-colors ${
                savedFlash
                  ? 'bg-green-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {savedFlash ? 'Saved ✓' : 'Save'}
            </button>
          </div>

        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-8">
          {selected.type === 'settings' && (
            <CampaignSettings campaign={campaign} onUpdate={updateSettings} />
          )}
          {selected.type === 'chapter' && selectedChapter && (
            <ChapterPanel
              key={selectedChapter.chapter_number}
              chapter={selectedChapter}
              onUpdateChapter={(fields) => updateChapter(selectedChapter.chapter_number, fields)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default CreatorPage
