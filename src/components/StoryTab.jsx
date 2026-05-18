import { useState } from 'react'

const inputClass = "w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"

export function StoryTab({ chapter, onUpdate }) {
  const [title, setTitle] = useState(chapter.title ?? '')
  const [introText, setIntroText] = useState(chapter.intro_text ?? '')

  function handleTitleBlur() {
    if (title === chapter.title) return
    onUpdate({ title })
  }

  function handleIntroTextBlur() {
    if (introText === (chapter.intro_text ?? '')) return
    onUpdate({ intro_text: introText })
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <label htmlFor="chapter-title" className="block text-sm text-gray-300 mb-1">
          Title
        </label>
        <input
          id="chapter-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="e.g. Saving the boss"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="chapter-intro-text" className="block text-sm text-gray-300 mb-1">
          Story
        </label>
        <textarea
          id="chapter-intro-text"
          value={introText}
          rows={12}
          onChange={(e) => setIntroText(e.target.value)}
          onBlur={handleIntroTextBlur}
          placeholder="Story text shown to the player at the start of the chapter..."
          className={inputClass + ' resize-none'}
        />
      </div>
    </div>
  )
}
