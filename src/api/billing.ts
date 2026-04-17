import axios from 'axios'
import { message } from 'antd'
import type { ApiResponse, AccountBalance, RechargeRecord, SettlementRecord, WithdrawRecord } from '../types/entities'

const billingClient = axios.create({
  baseURL: '/billing',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

billingClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

billingClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message ?? error.message ?? '请求失败'
    message.error(msg)
    return Promise.reject(error)
  },
)

export const getAccountBalance = (accountId: string) =>
  billingClient.get<ApiResponse<AccountBalance>>(`/v1/accounts/${accountId}/balance`).then((r) => r.data)

export const recharge = (accountId: string, amount: number) =>
  billingClient.post<ApiResponse<RechargeRecord>>(`/v1/advertiser/${accountId}/recharge`, { amount }).then((r) => r.data)

export const listRechargeRecords = (accountId: string, params?: { page?: number; pageSize?: number }) =>
  billingClient.get<ApiResponse<{ list: RechargeRecord[]; total: number }>>(`/v1/advertiser/${accountId}/recharge/records`, { params }).then((r) => r.data)

export const listSettlements = (publisherId: string, params?: { page?: number; pageSize?: number }) =>
  billingClient.get<ApiResponse<{ list: SettlementRecord[]; total: number }>>(`/v1/publisher/${publisherId}/settlements`, { params }).then((r) => r.data)

export const applyWithdraw = (publisherId: string, data: { amount: number; bankAccount: string; bankName: string }) =>
  billingClient.post<ApiResponse<WithdrawRecord>>(`/v1/publisher/${publisherId}/withdraw`, data).then((r) => r.data)

export const listWithdrawals = (publisherId: string, params?: { page?: number; pageSize?: number }) =>
  billingClient.get<ApiResponse<{ list: WithdrawRecord[]; total: number }>>(`/v1/publisher/${publisherId}/withdrawals`, { params }).then((r) => r.data)
