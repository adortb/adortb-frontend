import client from './client'
import type { ApiResponse, PageResult, Advertiser } from '../types/entities'

export interface AdvertiserQuery {
  page?: number
  pageSize?: number
  name?: string
  status?: string
}

export const listAdvertisers = (params: AdvertiserQuery) =>
  client.get<ApiResponse<PageResult<Advertiser>>>('/v1/advertisers', { params }).then((r) => r.data)

export const getAdvertiser = (id: number) =>
  client.get<ApiResponse<Advertiser>>(`/v1/advertisers/${id}`).then((r) => r.data)

export const createAdvertiser = (data: Omit<Advertiser, 'id' | 'createdAt' | 'updatedAt'>) =>
  client.post<ApiResponse<Advertiser>>('/v1/advertisers', data).then((r) => r.data)

export const updateAdvertiser = (id: number, data: Partial<Advertiser>) =>
  client.put<ApiResponse<Advertiser>>(`/v1/advertisers/${id}`, data).then((r) => r.data)

export const deleteAdvertiser = (id: number) =>
  client.delete<ApiResponse<null>>(`/v1/advertisers/${id}`).then((r) => r.data)
