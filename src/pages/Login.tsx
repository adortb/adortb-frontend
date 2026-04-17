import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth'
import type { UserRole } from '../store/auth'

interface LoginForm {
  username: string
  password: string
}

const roleHomePath: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  advertiser: '/advertiser/dashboard',
  publisher: '/publisher/dashboard',
  agency_admin: '/agency/dashboard',
  media_buyer: '/agency/dashboard',
  analyst: '/agency/dashboard',
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const res = await login(values)
      if (res.data) {
        const { token, username, role, account_id } = res.data
        const userRole: UserRole = (role as UserRole) ?? 'admin'
        setAuth(token, username, userRole, account_id ?? '')
        message.success('登录成功')
        navigate(roleHomePath[userRole] ?? '/admin/dashboard')
      }
    } catch {
      // 错误已由 axios 拦截器处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>adortb 广告平台</h2>
          <p style={{ color: '#999' }}>广告主 · 媒体方 · 运营管理</p>
        </div>
        <Form name="login" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
