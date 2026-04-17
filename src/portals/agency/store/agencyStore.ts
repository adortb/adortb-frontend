import { create } from 'zustand'

export interface AgencyAdvertiser {
  id: number
  agencyId: number
  advertiserId: number
  role: string
  addedAt: string
}

interface AgencyState {
  agencyId: number | null
  currentAdvertiserId: number | null
  advertisers: AgencyAdvertiser[]
  setAgencyId: (id: number) => void
  setCurrentAdvertiser: (id: number | null) => void
  setAdvertisers: (list: AgencyAdvertiser[]) => void
}

export const useAgencyStore = create<AgencyState>((set) => ({
  agencyId: Number(localStorage.getItem('agency_id')) || null,
  currentAdvertiserId: null,
  advertisers: [],
  setAgencyId: (id) => {
    localStorage.setItem('agency_id', String(id))
    set({ agencyId: id })
  },
  setCurrentAdvertiser: (id) => set({ currentAdvertiserId: id }),
  setAdvertisers: (list) => set({ advertisers: list }),
}))
