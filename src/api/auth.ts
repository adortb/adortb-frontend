import client from './client'
import type { ApiResponse, LoginRequest, LoginResponse } from '../types/entities'

export const login = (data: LoginRequest) =>
  client.post<ApiResponse<LoginResponse>>('/v1/auth/login', data).then((r) => r.data)

export const logout = () =>
  client.post<ApiResponse<null>>('/v1/auth/logout').then((r) => r.data)
