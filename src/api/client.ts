import axios from 'axios'
import { message } from 'antd'

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.hash = '#/login'
    } else {
      const msg = error.response?.data?.message ?? error.message ?? '请求失败'
      message.error(msg)
    }
    return Promise.reject(error)
  },
)

export default client
