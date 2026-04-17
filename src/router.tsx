import { Navigate } from 'react-router-dom'
import type { UserRole } from './store/auth'
import { useAuthStore } from './store/auth'

// Admin pages
import AdminLayout from './portals/admin/AdminLayout'
import Dashboard from './pages/Dashboard'
import PublisherList from './pages/PublisherList'
import AdvertiserList from './pages/AdvertiserList'
import CampaignList from './pages/CampaignList'
import CreativeList from './pages/CreativeList'
import AdSlotList from './pages/AdSlotList'
import Reports from './pages/Reports'

// Advertiser portal pages
import AdvertiserLayout from './portals/advertiser/AdvertiserLayout'
import AdvertiserDashboard from './portals/advertiser/pages/AdvertiserDashboard'
import AdvertiserAccount from './portals/advertiser/pages/AdvertiserAccount'
import AdvertiserRecharge from './portals/advertiser/pages/AdvertiserRecharge'
import AdvertiserCampaigns from './portals/advertiser/pages/AdvertiserCampaigns'
import CampaignEditor from './portals/advertiser/pages/CampaignEditor'
import AdvertiserCreatives from './portals/advertiser/pages/AdvertiserCreatives'
import AdvertiserReports from './portals/advertiser/pages/AdvertiserReports'

// Publisher portal pages
import PublisherLayout from './portals/publisher/PublisherLayout'
import PublisherDashboard from './portals/publisher/pages/PublisherDashboard'
import PublisherAdSlots from './portals/publisher/pages/PublisherAdSlots'
import AdSlotEditor from './portals/publisher/pages/AdSlotEditor'
import PublisherReports from './portals/publisher/pages/PublisherReports'
import PublisherSettlement from './portals/publisher/pages/PublisherSettlement'
import PublisherWithdraw from './portals/publisher/pages/PublisherWithdraw'

// Agency portal pages
import AgencyLayout from './portals/agency/AgencyLayout'
import AgencyDashboard from './portals/agency/AgencyDashboard'
import ClientManagement from './portals/agency/ClientManagement'
import ConsolidatedReports from './portals/agency/ConsolidatedReports'
import BatchOps from './portals/agency/BatchOps'
import SubAccountManagement from './portals/agency/SubAccountManagement'
import Commissions from './portals/agency/Commissions'
import WhiteLabel from './portals/agency/WhiteLabel'

// Login page
import Login from './pages/Login'

const AGENCY_ROLES: UserRole[] = ['agency_admin', 'media_buyer', 'analyst']

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { token, role: userRole } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (userRole !== role) return <Navigate to="/403" replace />
  return <>{children}</>
}

function RequireAgencyRole({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!role || !AGENCY_ROLES.includes(role)) return <Navigate to="/403" replace />
  return <>{children}</>
}

function Forbidden403() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#f5222d' }}>403</h1>
      <p style={{ color: '#666' }}>您没有访问该页面的权限</p>
      <a href="/login" style={{ color: '#1677ff' }}>返回登录</a>
    </div>
  )
}

const routes = [
  { path: '/login', element: <Login /> },
  { path: '/403', element: <Forbidden403 /> },

  // Admin portal
  {
    path: '/admin',
    element: (
      <RequireRole role="admin">
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'publishers', element: <PublisherList /> },
      { path: 'advertisers', element: <AdvertiserList /> },
      { path: 'campaigns', element: <CampaignList /> },
      { path: 'creatives', element: <CreativeList /> },
      { path: 'adslots', element: <AdSlotList /> },
      { path: 'reports', element: <Reports /> },
    ],
  },

  // Advertiser portal
  {
    path: '/advertiser',
    element: (
      <RequireRole role="advertiser">
        <AdvertiserLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/advertiser/dashboard" replace /> },
      { path: 'dashboard', element: <AdvertiserDashboard /> },
      { path: 'account', element: <AdvertiserAccount /> },
      { path: 'recharge', element: <AdvertiserRecharge /> },
      { path: 'campaigns', element: <AdvertiserCampaigns /> },
      { path: 'campaigns/new', element: <CampaignEditor /> },
      { path: 'campaigns/:id/edit', element: <CampaignEditor /> },
      { path: 'creatives', element: <AdvertiserCreatives /> },
      { path: 'reports', element: <AdvertiserReports /> },
    ],
  },

  // Publisher portal
  {
    path: '/publisher',
    element: (
      <RequireRole role="publisher">
        <PublisherLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/publisher/dashboard" replace /> },
      { path: 'dashboard', element: <PublisherDashboard /> },
      { path: 'adslots', element: <PublisherAdSlots /> },
      { path: 'adslots/new', element: <AdSlotEditor /> },
      { path: 'adslots/:id/edit', element: <AdSlotEditor /> },
      { path: 'reports', element: <PublisherReports /> },
      { path: 'settlement', element: <PublisherSettlement /> },
      { path: 'withdraw', element: <PublisherWithdraw /> },
    ],
  },

  // Agency portal
  {
    path: '/agency',
    element: (
      <RequireAgencyRole>
        <AgencyLayout />
      </RequireAgencyRole>
    ),
    children: [
      { index: true, element: <Navigate to="/agency/dashboard" replace /> },
      { path: 'dashboard', element: <AgencyDashboard /> },
      { path: 'clients', element: <ClientManagement /> },
      { path: 'reports', element: <ConsolidatedReports /> },
      { path: 'batch', element: <BatchOps /> },
      { path: 'subaccounts', element: <SubAccountManagement /> },
      { path: 'commissions', element: <Commissions /> },
      { path: 'white-label', element: <WhiteLabel /> },
    ],
  },

  // Legacy redirect: 旧路由兼容
  {
    path: '/',
    element: (
      <RequireAuth>
        <RoleRedirect />
      </RequireAuth>
    ),
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]

function RoleRedirect() {
  const role = useAuthStore((s) => s.role)
  if (role === 'advertiser') return <Navigate to="/advertiser/dashboard" replace />
  if (role === 'publisher') return <Navigate to="/publisher/dashboard" replace />
  if (role && AGENCY_ROLES.includes(role)) return <Navigate to="/agency/dashboard" replace />
  return <Navigate to="/admin/dashboard" replace />
}

export default routes
