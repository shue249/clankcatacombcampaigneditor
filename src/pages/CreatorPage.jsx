import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CampaignSettings } from '../components/CampaignSettings'
import { ChapterPanel } from '../components/ChapterPanel'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useCampaignEditor } from '../hooks/useCampaignEditor'
import { exportCampaign } from '../services/campaignService'

function chapterLabel(ch) {
  return ch.title?.trim()
    ? `Chapter ${ch.chapter_number} - ${ch.title}`
    : `Chapter ${ch.chapter_number}`
}

export function CreatorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { campaign, updateSettings, addChapter, updateChapter, deleteChapter } = useCampaignEditor(id)

  const [selected, setSelected] = useState({ type: 'chapter', chapterNumber: 1 })
  const [savedFlash, setSavedFlash] = useState(false)
  const [deleteConfirmChapter, setDeleteConfirmChapter] = useState(null)
  const [chapterTabs, setChapterTabs] = useState({})

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

  function handleDeleteChapter(chapterNumber) {
    const remaining = campaign.chapters.filter((c) => c.chapter_number !== chapterNumber)
    deleteChapter(chapterNumber)
    if (selected.type === 'chapter' && selected.chapterNumber === chapterNumber) {
      const nearest = remaining[remaining.length - 1]
      setSelected({ type: 'chapter', chapterNumber: nearest.chapter_number })
    }
    setDeleteConfirmChapter(null)
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
              <div key={ch.chapter_number} className="flex items-center gap-1 group">
                <button
                  onClick={() => setSelected({ type: 'chapter', chapterNumber: ch.chapter_number })}
                  className={`flex-1 text-left px-3 py-2 rounded text-sm transition-colors ${
                    selected.type === 'chapter' && selected.chapterNumber === ch.chapter_number
                      ? 'bg-indigo-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {chapterLabel(ch)}
                </button>
                <button
                  aria-label={`Delete chapter ${ch.chapter_number}`}
                  disabled={campaign.chapters.length <= 1}
                  onClick={() => setDeleteConfirmChapter(ch.chapter_number)}
                  className="shrink-0 px-1.5 py-1 rounded text-gray-500 hover:text-red-400 hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={handleAddChapter}
              className="w-full text-left px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              + Add Chapter
            </button>
          </div>

          {/* Save + Export buttons — always visible at bottom */}
          <div className="p-3 border-t border-gray-800 shrink-0 flex flex-col gap-2">
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
            <button
              onClick={() => exportCampaign(campaign)}
              className="w-full px-3 py-2 rounded text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Export
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
              initialTab={chapterTabs[selectedChapter.chapter_number] ?? 'Story'}
              onTabChange={(tab) => setChapterTabs((prev) => ({ ...prev, [selectedChapter.chapter_number]: tab }))}
            />
          )}
        </main>
      </div>

      {deleteConfirmChapter !== null && (
        <ConfirmDialog
          message={`Delete ${chapterLabel(campaign.chapters.find((c) => c.chapter_number === deleteConfirmChapter))}? This cannot be undone.`}
          onConfirm={() => handleDeleteChapter(deleteConfirmChapter)}
          onCancel={() => setDeleteConfirmChapter(null)}
        />
      )}
    </div>
  )
}

export default CreatorPage
