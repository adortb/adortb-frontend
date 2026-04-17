import client from './client'
import type { ApiResponse, PageResult, Publisher } from '../types/entities'

export interface PublisherQuery {
  page?: number
  pageSize?: number
  name?: string
  status?: string
}

export const listPublishers = (params: PublisherQuery) =>
  client.get<ApiResponse<PageResult<Publisher>>>('/v1/publishers', { params }).then((r) => r.data)

export const getPublisher = (id: number) =>
  client.get<ApiResponse<Publisher>>(`/v1/publishers/${id}`).then((r) => r.data)

export const createPublisher = (data: Omit<Publisher, 'id' | 'createdAt' | 'updatedAt'>) =>
  client.post<ApiResponse<Publisher>>('/v1/publishers', data).then((r) => r.data)

export const updatePublisher = (id: number, data: Partial<Publisher>) =>
  client.put<ApiResponse<Publisher>>(`/v1/publishers/${id}`, data).then((r) => r.data)

export const deletePublisher = (id: number) =>
  client.delete<ApiResponse<null>>(`/v1/publishers/${id}`).then((r) => r.data)
