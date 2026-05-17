import { useState } from 'react'
import { StoryTab } from './StoryTab'

const TABS = ['Story', 'Setup', 'Events', 'Completion']

export function ChapterPanel({ chapter, onUpdateChapter }) {
  const [activeTab, setActiveTab] = useState('Story')

  const heading = chapter.title?.trim()
    ? `Chapter ${chapter.chapter_number} - ${chapter.title}`
    : `Chapter ${chapter.chapter_number}`

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-white mb-4">{heading}</h2>

      <div role="tablist" className="flex border-b border-gray-700 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'Story' && (
          <StoryTab chapter={chapter} onUpdate={onUpdateChapter} />
        )}
        {activeTab === 'Setup' && <p className="text-gray-500 text-sm">Setup coming soon.</p>}
        {activeTab === 'Events' && <p className="text-gray-500 text-sm">Events coming soon.</p>}
        {activeTab === 'Completion' && <p className="text-gray-500 text-sm">Completion coming soon.</p>}
      </div>
    </div>
  )
}
