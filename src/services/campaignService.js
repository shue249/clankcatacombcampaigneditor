import { generateId } from './idService'

export function buildNewChapter(chapterNumber) {
  return {
    chapter_number: chapterNumber,
    title: '',
    intro_text: '',
    outro_text_escaped: '',
    outro_text_knocked_out_saved: '',
    outro_text_knocked_out_depths: '',
    events: [],
    grades: [],
  }
}

export function buildNewCampaign({ name = '', description = '', author = '', chapters } = {}) {
  return {
    id: generateId(),
    name,
    description,
    author,
    chapters: chapters ?? [buildNewChapter(1)],
  }
}

export function exportCampaign(campaign) {
  const { id: _id, ...data } = campaign
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${campaign.name.replace(/\s+/g, '-').toLowerCase() || 'campaign'}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
