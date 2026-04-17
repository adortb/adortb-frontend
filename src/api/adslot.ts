import client from './client'
import type { ApiResponse, PageResult, AdSlot } from '../types/entities'

export interface AdSlotQuery {
  page?: number
  pageSize?: number
  name?: string
  publisherId?: number
  status?: string
}

export const listAdSlots = (params: AdSlotQuery) =>
  client.get<ApiResponse<PageResult<AdSlot>>>('/v1/adslots', { params }).then((r) => r.data)

export const getAdSlot = (id: number) =>
  client.get<ApiResponse<AdSlot>>(`/v1/adslots/${id}`).then((r) => r.data)

export const createAdSlot = (data: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt' | 'publisherName'>) =>
  client.post<ApiResponse<AdSlot>>('/v1/adslots', data).then((r) => r.data)

export const updateAdSlot = (id: number, data: Partial<AdSlot>) =>
  client.put<ApiResponse<AdSlot>>(`/v1/adslots/${id}`, data).then((r) => r.data)

export const deleteAdSlot = (id: number) =>
  client.delete<ApiResponse<null>>(`/v1/adslots/${id}`).then((r) => r.data)
