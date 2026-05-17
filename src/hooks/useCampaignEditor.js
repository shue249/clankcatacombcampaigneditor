import { useCampaignStore } from '../store/campaignStore'

export function useCampaignEditor(id) {
  const campaign = useCampaignStore((state) => state.campaigns.find((c) => c.id === id))
  const updateCampaign = useCampaignStore((state) => state.updateCampaign)

  function updateSettings(fields) {
    updateCampaign(id, fields)
  }

  return { campaign, updateSettings }
}
