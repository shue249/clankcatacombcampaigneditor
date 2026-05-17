import { generateId } from './idService'

export function buildNewCampaign({ name = '', description = '', author = '' } = {}) {
  return { id: generateId(), name, description, author, chapters: [] }
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
