import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, theme, Tag, Select } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../../store/auth'
import { logout } from '../../api/auth'
import { useAgencyStore } from './store/agencyStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/agency/dashboard', icon: <DashboardOutlined />, label: '多客户概览' },
  { key: '/agency/clients', icon: <TeamOutlined />, label: '客户管理' },
  { key: '/agency/reports', icon: <BarChartOutlined />, label: '聚合报表' },
  { key: '/agency/batch', icon: <ThunderboltOutlined />, label: '批量操作' },
  { key: '/agency/subaccounts', icon: <UserOutlined />, label: '子账号管理' },
  { key: '/agency/commissions', icon: <DollarOutlined />, label: '返佣管理' },
  { key: '/agency/white-label', icon: <SettingOutlined />, label: '白标设置' },
]

export default function AgencyLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const { username, clearAuth } = useAuthStore()
  const { currentAdvertiserId, setCurrentAdvertiser, advertisers } = useAgencyStore()

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

  const advertiserOptions = advertisers.map((a) => ({
    label: `广告主 #${a.advertiserId}`,
    value: a.advertiserId,
  }))

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
          {collapsed ? 'AG' : (
            <>
              <span>adortb</span>
              <Tag color="purple" style={{ fontSize: 10 }}>代理商</Tag>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ cursor: 'pointer', fontSize: 16 }} onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            {advertiserOptions.length > 0 && (
              <Select
                placeholder="切换客户视图"
                style={{ width: 180 }}
                value={currentAdvertiserId ?? undefined}
                onChange={(v) => setCurrentAdvertiser(v)}
                options={advertiserOptions}
                allowClear
                size="small"
              />
            )}
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#722ed1' }} />
              <span>{username ?? '代理商'}</span>
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
