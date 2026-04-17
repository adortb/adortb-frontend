import { Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PublisherList from './pages/PublisherList'
import AdvertiserList from './pages/AdvertiserList'
import CampaignList from './pages/CampaignList'
import CreativeList from './pages/CreativeList'
import AdSlotList from './pages/AdSlotList'
import Reports from './pages/Reports'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

const routes = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'publishers', element: <PublisherList /> },
      { path: 'advertisers', element: <AdvertiserList /> },
      { path: 'campaigns', element: <CampaignList /> },
      { path: 'creatives', element: <CreativeList /> },
      { path: 'adslots', element: <AdSlotList /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

export default routes
