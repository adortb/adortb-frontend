import client from './client'
import type { ApiResponse, PageResult, Creative } from '../types/entities'

export interface CreativeQuery {
  page?: number
  pageSize?: number
  name?: string
  campaignId?: number
  status?: string
}

export const listCreatives = (params: CreativeQuery) =>
  client.get<ApiResponse<PageResult<Creative>>>('/v1/creatives', { params }).then((r) => r.data)

export const getCreative = (id: number) =>
  client.get<ApiResponse<Creative>>(`/v1/creatives/${id}`).then((r) => r.data)

export const createCreative = (data: Omit<Creative, 'id' | 'createdAt' | 'updatedAt' | 'campaignName'>) =>
  client.post<ApiResponse<Creative>>('/v1/creatives', data).then((r) => r.data)

export const updateCreative = (id: number, data: Partial<Creative>) =>
  client.put<ApiResponse<Creative>>(`/v1/creatives/${id}`, data).then((r) => r.data)

export const deleteCreative = (id: number) =>
  client.delete<ApiResponse<null>>(`/v1/creatives/${id}`).then((r) => r.data)
