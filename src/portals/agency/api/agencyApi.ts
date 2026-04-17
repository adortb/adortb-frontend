import client from '../../../api/client'
import type { ApiResponse } from '../../../types/entities'

const BASE = (agencyId: number) => `/v1/agencies/${agencyId}`

export const agencyApi = {
  getAgency: (id: number) =>
    client.get<ApiResponse<unknown>>(`/v1/agencies/${id}`).then((r) => r.data),

  listAdvertisers: (agencyId: number) =>
    client.get<ApiResponse<any[]>>(`${BASE(agencyId)}/advertisers`).then((r) => r.data),

  addAdvertiser: (agencyId: number, advertiserId: number, role: string) =>
    client.post<ApiResponse<unknown>>(`${BASE(agencyId)}/advertisers`, { advertiser_id: advertiserId, role }).then((r) => r.data),

  listUsers: (agencyId: number) =>
    client.get<ApiResponse<any[]>>(`${BASE(agencyId)}/users`).then((r) => r.data),

  createUser: (agencyId: number, data: { email: string; name: string; role: string; password: string }) =>
    client.post<ApiResponse<unknown>>(`${BASE(agencyId)}/users`, data).then((r) => r.data),

  getAggregatedReport: (agencyId: number, from: string, to: string) =>
    client.get<ApiResponse<any[]>>(`${BASE(agencyId)}/reports/aggregated`, { params: { from, to } }).then((r) => r.data),

  getCommissions: (agencyId: number) =>
    client.get<ApiResponse<any>>(`${BASE(agencyId)}/commissions`).then((r) => r.data),

  settleCommission: (agencyId: number, totalSpend: number) =>
    client.post<ApiResponse<unknown>>(`${BASE(agencyId)}/commissions/settle`, { total_spend: totalSpend }).then((r) => r.data),

  batchPause: (agencyId: number, campaignIds: number[]) =>
    client.post<ApiResponse<any[]>>(`${BASE(agencyId)}/batch/pause-campaigns`, { campaign_ids: campaignIds }).then((r) => r.data),

  batchBudgetUpdate: (agencyId: number, campaignIds: number[], newBudget: number) =>
    client.post<ApiResponse<any[]>>(`${BASE(agencyId)}/batch/budget-update`, { campaign_ids: campaignIds, new_budget: newBudget }).then((r) => r.data),

  getWhiteLabel: (agencyId: number) =>
    client.get<ApiResponse<any>>(`${BASE(agencyId)}/white-label-config`).then((r) => r.data),

  updateWhiteLabel: (agencyId: number, data: { domain: string; logo_url: string; primary_color: string }) =>
    client.put<ApiResponse<unknown>>(`${BASE(agencyId)}/white-label-config`, data).then((r) => r.data),

  grantPermission: (agencyId: number, advId: number, agencyUserId: number, permission: string) =>
    client.post<ApiResponse<unknown>>(`${BASE(agencyId)}/advertisers/${advId}/permissions`, { agency_user_id: agencyUserId, permission }).then((r) => r.data),

  switchAdvertiser: (advertiserId: number) =>
    client.post<ApiResponse<unknown>>('/v1/auth/switch-advertiser', { advertiser_id: advertiserId }).then((r) => r.data),

  login: (agencyId: number, email: string, password: string) =>
    client.post<ApiResponse<any>>('/v1/auth/login', { agency_id: agencyId, email, password }).then((r) => r.data),
}
