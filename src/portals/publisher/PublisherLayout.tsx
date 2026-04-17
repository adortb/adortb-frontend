import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, theme, Tag } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  AccountBookOutlined,
  TransactionOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../../store/auth'
import { logout } from '../../api/auth'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/publisher/dashboard', icon: <DashboardOutlined />, label: '收益概览' },
  { key: '/publisher/adslots', icon: <AppstoreOutlined />, label: '广告位管理' },
  { key: '/publisher/reports', icon: <BarChartOutlined />, label: '收入报表' },
  { key: '/publisher/settlement', icon: <AccountBookOutlined />, label: '结算记录' },
  { key: '/publisher/withdraw', icon: <TransactionOutlined />, label: '提现申请' },
]

export default function PublisherLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const { username, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try { await logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
  }

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
    ],
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 16,
          fontWeight: 'bold',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          flexDirection: 'column',
          gap: 4,
        }}>
          {collapsed ? 'AD' : (
            <>
              <span>adortb</span>
              <Tag color="green" style={{ fontSize: 10 }}>媒体方</Tag>
            </>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 16px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ cursor: 'pointer', fontSize: 16 }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Dropdown menu={userMenu} placement="bottomRight">
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#52c41a' }} />
              <span>{username ?? '媒体方'}</span>
            </span>
          </Dropdown>
        </Header>
        <Content style={{
          margin: '16px',
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
