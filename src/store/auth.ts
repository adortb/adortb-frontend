import { create } from 'zustand'

export type UserRole = 'admin' | 'advertiser' | 'publisher' | 'agency_admin' | 'media_buyer' | 'analyst'

interface AuthState {
  token: string | null
  username: string | null
  role: UserRole | null
  accountId: string | null
  setAuth: (token: string, username: string, role: UserRole, accountId: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  role: localStorage.getItem('role') as UserRole | null,
  accountId: localStorage.getItem('account_id'),
  setAuth: (token, username, role, accountId) => {
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
    localStorage.setItem('role', role)
    localStorage.setItem('account_id', accountId)
    set({ token, username, role, accountId })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('account_id')
    set({ token: null, username: null, role: null, accountId: null })
  },
}))
