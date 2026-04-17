import client from './client'
import type { ApiResponse, ReviewStatus } from '../types/entities'

export interface CreativeWithReview {
  id: number
  name: string
  type: string
  url: string
  reviewStatus: ReviewStatus
  rejectReason?: string
  campaignId: number
  campaignName?: string
  createdAt: string
}

export const listCreativesWithReview = (advertiserId: string, params?: { page?: number; pageSize?: number }) =>
  client.get<ApiResponse<{ list: CreativeWithReview[]; total: number }>>(`/v1/advertiser/${advertiserId}/creatives`, { params }).then((r) => r.data)

export const uploadCreative = (advertiserId: string, formData: FormData) =>
  client.post<ApiResponse<CreativeWithReview>>(`/v1/advertiser/${advertiserId}/creatives/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const getReviewStatus = (creativeId: number) =>
  client.get<ApiResponse<{ status: ReviewStatus; reason?: string }>>(`/v1/creatives/${creativeId}/review`).then((r) => r.data)
