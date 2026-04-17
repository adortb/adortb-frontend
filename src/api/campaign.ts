import client from './client'
import type { ApiResponse, PageResult, Campaign } from '../types/entities'

export interface CampaignQuery {
  page?: number
  pageSize?: number
  name?: string
  advertiserId?: number
  status?: string
}

export const listCampaigns = (params: CampaignQuery) =>
  client.get<ApiResponse<PageResult<Campaign>>>('/v1/campaigns', { params }).then((r) => r.data)

export const getCampaign = (id: number) =>
  client.get<ApiResponse<Campaign>>(`/v1/campaigns/${id}`).then((r) => r.data)

export const createCampaign = (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'advertiserName'>) =>
  client.post<ApiResponse<Campaign>>('/v1/campaigns', data).then((r) => r.data)

export const updateCampaign = (id: number, data: Partial<Campaign>) =>
  client.put<ApiResponse<Campaign>>(`/v1/campaigns/${id}`, data).then((r) => r.data)

export const deleteCampaign = (id: number) =>
  client.delete<ApiResponse<null>>(`/v1/campaigns/${id}`).then((r) => r.data)
