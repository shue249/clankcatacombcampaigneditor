import { useCampaignStore } from '../store/campaignStore'
import { buildNewCampaign, exportCampaign as exportCampaignService } from '../services/campaignService'
import { validateImport } from '../services/validateImport'

export function useCampaigns() {
  const { campaigns, addCampaign, deleteCampaign } = useCampaignStore()

  function createCampaign(opts) {
    addCampaign(buildNewCampaign(opts))
  }

  function removeCampaign(id) {
    deleteCampaign(id)
  }

  async function importCampaign(file) {
    let data
    try {
      const text = await file.text()
      data = JSON.parse(text)
    } catch {
      return ['File is not valid JSON']
    }

    const errors = validateImport(data)
    if (errors.length > 0) return errors

    addCampaign(buildNewCampaign(data))
    return []
  }

  function exportCampaign(campaign) {
    exportCampaignService(campaign)
  }

  return { campaigns, createCampaign, removeCampaign, importCampaign, exportCampaign }
}
