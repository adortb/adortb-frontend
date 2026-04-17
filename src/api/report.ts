import client from './client'
import type { ApiResponse, PublisherReport, AdvertiserReport } from '../types/entities'

export interface ReportQuery {
  startDate: string
  endDate: string
  publisherId?: number
  advertiserId?: number
}

export const getPublisherReport = (params: ReportQuery) =>
  client
    .get<ApiResponse<PublisherReport[]>>('/v1/reports/publisher', { params })
    .then((r) => r.data)

export const getAdvertiserReport = (params: ReportQuery) =>
  client
    .get<ApiResponse<AdvertiserReport[]>>('/v1/reports/advertiser', { params })
    .then((r) => r.data)
