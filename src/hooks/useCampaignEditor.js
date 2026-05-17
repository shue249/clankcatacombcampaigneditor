import { useCampaignStore } from '../store/campaignStore'
import { buildNewChapter } from '../services/campaignService'

export function useCampaignEditor(id) {
  const campaign = useCampaignStore((state) => state.campaigns.find((c) => c.id === id))
  const updateCampaign = useCampaignStore((state) => state.updateCampaign)

  function updateSettings(fields) {
    updateCampaign(id, fields)
  }

  function addChapter() {
    const chapters = campaign?.chapters ?? []
    const nextNumber = chapters.length + 1
    updateCampaign(id, { chapters: [...chapters, buildNewChapter(nextNumber)] })
  }

  return { campaign, updateSettings, addChapter }
}
