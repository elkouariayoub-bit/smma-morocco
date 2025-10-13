'use client'

import { useCallback } from 'react'
import { create } from 'zustand'

import type { Campaign } from '@/types'
import {
  type CampaignFormInput,
  type CampaignReorderInput,
  type CampaignUpdateInput,
  parseCampaignReorder,
  trackCampaignEvent,
} from '@/lib/campaigns'

type CampaignStore = {
  campaigns: Campaign[]
  selectedId: string | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fetchCampaigns: (params?: { clientId?: string }) => Promise<void>
  createCampaign: (values: CampaignFormInput) => Promise<Campaign | null>
  updateCampaign: (id: string, updates: CampaignUpdateInput) => Promise<Campaign | null>
  deleteCampaign: (id: string) => Promise<boolean>
  reorderCampaigns: (order: CampaignReorderInput['order']) => Promise<void>
  upsertCampaign: (campaign: Campaign) => void
  removeCampaignFromState: (id: string) => void
  setSelected: (id: string | null) => void
  setError: (message: string | null) => void
}

function sortCampaigns(campaigns: Campaign[]) {
  return [...campaigns].sort((a, b) => a.position - b.position)
}

async function parseError(response: Response) {
  try {
    const payload = await response.json()
    if (typeof payload?.error === 'string') {
      return payload.error
    }
  } catch (error) {
    // ignore JSON parse errors
  }
  return response.statusText || 'Unexpected error'
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: [],
  selectedId: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  async fetchCampaigns(params) {
    set({ isLoading: true, error: null })

    const query = new URLSearchParams()
    if (params?.clientId) {
      query.set('clientId', params.clientId)
    }

    try {
      const response = await fetch(`/api/campaigns${query.toString() ? `?${query.toString()}` : ''}`)
      if (!response.ok) {
        throw new Error(await parseError(response))
      }
      const payload = await response.json()
      const campaigns = sortCampaigns((payload?.data ?? []) as Campaign[])

      set((state) => ({
        campaigns,
        isLoading: false,
        selectedId:
          state.selectedId && campaigns.some((campaign) => campaign.id === state.selectedId)
            ? state.selectedId
            : campaigns[0]?.id ?? null,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load campaigns'
      set({ error: message, isLoading: false })
    }
  },
  async createCampaign(values) {
    set({ isSubmitting: true, error: null })

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(await parseError(response))
      }

      const payload = await response.json()
      const campaign = payload?.campaign as Campaign | undefined
      if (!campaign) {
        throw new Error('Campaign response was malformed')
      }

      set((state) => {
        const campaigns = sortCampaigns([campaign, ...state.campaigns.filter((item) => item.id !== campaign.id)])
        return {
          campaigns,
          selectedId: campaign.id,
          isSubmitting: false,
        }
      })

      trackCampaignEvent('campaign_created', { campaign_id: campaign.id })
      return campaign
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create campaign'
      set({ error: message, isSubmitting: false })
      return null
    }
  },
  async updateCampaign(id, updates) {
    set({ isSubmitting: true, error: null })

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(await parseError(response))
      }

      const payload = await response.json()
      const campaign = payload?.campaign as Campaign | undefined
      if (!campaign) {
        throw new Error('Campaign response was malformed')
      }

      set((state) => ({
        campaigns: sortCampaigns(state.campaigns.map((item) => (item.id === campaign.id ? campaign : item))),
        isSubmitting: false,
      }))

      return campaign
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update campaign'
      set({ error: message, isSubmitting: false })
      return null
    }
  },
  async deleteCampaign(id) {
    set({ isSubmitting: true, error: null })

    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await parseError(response))
      }

      set((state) => {
        const campaigns = state.campaigns.filter((campaign) => campaign.id !== id)
        let selectedId = state.selectedId
        if (selectedId === id) {
          selectedId = campaigns[0]?.id ?? null
        }
        return { campaigns, selectedId, isSubmitting: false }
      })

      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete campaign'
      set({ error: message, isSubmitting: false })
      return false
    }
  },
  async reorderCampaigns(order) {
    const current = get().campaigns
    const idSet = new Set(order)
    const orderedPart = order
      .map((id: string) => current.find((campaign) => campaign.id === id))
      .filter(Boolean) as Campaign[]
    const remainder = current.filter((campaign) => !idSet.has(campaign.id))
    const optimistic = sortCampaigns([...orderedPart, ...remainder]).map((campaign, index) => ({
      ...campaign,
      position: index + 1,
    }))

    set({ campaigns: optimistic })

    try {
      const payload: CampaignReorderInput = parseCampaignReorder({ order })
      const response = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(await parseError(response))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reorder campaigns'
      set({ campaigns: current, error: message })
      throw error
    }
  },
  upsertCampaign(campaign) {
    set((state) => {
      const exists = state.campaigns.some((item) => item.id === campaign.id)
      const campaigns = exists
        ? state.campaigns.map((item) => (item.id === campaign.id ? campaign : item))
        : [...state.campaigns, campaign]

      const sorted = sortCampaigns(campaigns)
      const selectedId = state.selectedId ?? campaign.id

      return {
        campaigns: sorted,
        selectedId,
      }
    })
  },
  removeCampaignFromState(id) {
    set((state) => {
      const campaigns = state.campaigns.filter((campaign) => campaign.id !== id)
      let selectedId = state.selectedId
      if (selectedId === id) {
        selectedId = campaigns[0]?.id ?? null
      }
      return { campaigns, selectedId }
    })
  },
  setSelected(id) {
    set({ selectedId: id })
  },
  setError(message) {
    set({ error: message })
  },
}))

export function useCampaignById(id: string | null) {
  return useCampaignStore(
    useCallback((state) => state.campaigns.find((campaign) => campaign.id === id) ?? null, [id]),
  )
}
