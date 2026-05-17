import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCampaignStore = create(
  persist(
    (set) => ({
      campaigns: [],

      addCampaign: (campaign) =>
        set((state) => ({ campaigns: [...state.campaigns, campaign] })),

      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),
    }),
    { name: 'clank-campaigns' }
  )
)
