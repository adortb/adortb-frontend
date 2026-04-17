import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Spin, Alert, Typography } from 'antd'
import { TeamOutlined, DollarOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useAgencyStore } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title } = Typography

interface Summary {
  totalAdvertisers: number
  totalSpend: number
  estimatedCommission: number
}

export default function AgencyDashboard() {
  const { agencyId, setAdvertisers } = useAgencyStore()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!agencyId) return
    setLoading(true)
    Promise.all([
      agencyApi.listAdvertisers(agencyId),
      agencyApi.getCommissions(agencyId),
    ])
      .then(([advResp, commResp]) => {
        const advs = advResp.data ?? []
        setAdvertisers(advs)
        const est = commResp.data?.current_estimate
        setSummary({
          totalAdvertisers: advs.length,
          totalSpend: est?.total_advertiser_spend ?? 0,
          estimatedCommission: est?.commission_earned ?? 0,
        })
      })
      .catch(() => setError('加载数据失败'))
      .finally(() => setLoading(false))
  }, [agencyId, setAdvertisers])

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
  if (error) return <Alert type="error" message={error} />

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>多客户概览</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="管理客户数"
              value={summary?.totalAdvertisers ?? 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="本月投放总额 ($)"
              value={summary?.totalSpend ?? 0}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="预估返佣 ($)"
              value={summary?.estimatedCommission ?? 0}
              precision={2}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
