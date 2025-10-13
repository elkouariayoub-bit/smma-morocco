'use client'

import { create } from 'zustand'

import type { DashboardFilterPreset, DashboardMetricsResponse } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface DashboardMetricsState {
  filter: DashboardFilterPreset
  data: DashboardMetricsResponse | null
  status: Status
  error: string | null
  setFilter: (filter: DashboardFilterPreset) => void
  setData: (data: DashboardMetricsResponse) => void
  setLoading: () => void
  setError: (message: string) => void
  hydrate: (payload: { filter: DashboardFilterPreset; data: DashboardMetricsResponse }) => void
}

export const useDashboardMetricsStore = create<DashboardMetricsState>((set) => ({
  filter: 'last_7_days',
  data: null,
  status: 'idle',
  error: null,
  setFilter: (filter) => set({ filter }),
  setData: (data) => set({ data, status: 'success', error: null }),
  setLoading: () => set({ status: 'loading', error: null }),
  setError: (message) => set({ status: 'error', error: message }),
  hydrate: ({ filter, data }) =>
    set({ filter, data, status: 'success', error: null }),
}))
