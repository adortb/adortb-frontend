export type Status = 'active' | 'inactive' | 'pending'

export interface Publisher {
  id: number
  name: string
  email: string
  status: Status
  createdAt: string
  updatedAt: string
}

export interface Advertiser {
  id: number
  name: string
  email: string
  budget: number
  status: Status
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: number
  advertiserId: number
  advertiserName?: string
  name: string
  budget: number
  dailyBudget: number
  startDate: string
  endDate: string
  status: Status
  createdAt: string
  updatedAt: string
}

export interface Creative {
  id: number
  campaignId: number
  campaignName?: string
  name: string
  type: 'banner' | 'video' | 'native'
  url: string
  width: number
  height: number
  status: Status
  createdAt: string
  updatedAt: string
}

export interface AdSlot {
  id: number
  publisherId: number
  publisherName?: string
  name: string
  type: 'banner' | 'interstitial' | 'native'
  width: number
  height: number
  floorPrice: number
  status: Status
  createdAt: string
  updatedAt: string
}

export interface PublisherReport {
  date: string
  publisherId: number
  publisherName: string
  impressions: number
  clicks: number
  revenue: number
  ecpm: number
}

export interface AdvertiserReport {
  date: string
  advertiserId: number
  advertiserName: string
  impressions: number
  clicks: number
  spend: number
  ctr: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  role: 'admin' | 'advertiser' | 'publisher'
  account_id: string
}

// 计费相关
export interface AccountBalance {
  accountId: string
  balance: number
  frozenAmount: number
  totalRecharge: number
  totalSpend: number
}

export interface RechargeRecord {
  id: string
  accountId: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

export interface SettlementRecord {
  id: string
  publisherId: string
  date: string
  amount: number
  status: 'pending' | 'paid'
  createdAt: string
}

export interface WithdrawRecord {
  id: string
  publisherId: string
  amount: number
  bankAccount: string
  bankName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// 审核相关
export type ReviewStatus = 'pending_review' | 'approved' | 'rejected'

export interface CreativeReview {
  id: string
  creativeId: number
  status: ReviewStatus
  reason?: string
  reviewedAt?: string
}
