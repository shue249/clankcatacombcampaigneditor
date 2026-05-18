import { generateId } from './idService'

export function buildNewChapter(chapterNumber) {
  return {
    chapter_number: chapterNumber,
    title: '',
    intro_text: '',
    starting_map: '',
    starting_artifacts: [],
    starting_tokens: [],
    tile_deck: [],
    player_clank: 3,
    rival_clank: 3,
    dragon_clank: 0,
    ghost_clank: 0,
    player_clank_hard: 3,
    rival_clank_hard: 3,
    dragon_clank_hard: 4,
    ghost_clank_hard: 0,
    player_clank_brutal: 3,
    rival_clank_brutal: 3,
    dragon_clank_brutal: 6,
    ghost_clank_brutal: 1,
    rage_track: 3,
    set_aside_cards: [],
    set_aside_tokens: [],
    instructions: '',
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
