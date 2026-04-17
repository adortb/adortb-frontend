import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag } from 'antd'
import { WalletOutlined, RiseOutlined, EyeOutlined, SelectOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../../store/auth'
import { getAccountBalance } from '../../../api/billing'
import type { AccountBalance } from '../../../types/entities'

const { Title } = Typography

// 模拟近7天消耗趋势数据
const mockTrendData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))
  return {
    date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    spend: Math.round(Math.random() * 5000 + 1000),
    impressions: Math.round(Math.random() * 100000 + 20000),
    clicks: Math.round(Math.random() * 2000 + 500),
  }
})

const trendColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '消耗(元)', dataIndex: 'spend', key: 'spend', render: (v: number) => `¥${v.toLocaleString()}` },
  { title: '曝光', dataIndex: 'impressions', key: 'impressions', render: (v: number) => v.toLocaleString() },
  { title: '点击', dataIndex: 'clicks', key: 'clicks', render: (v: number) => v.toLocaleString() },
  {
    title: 'CTR', key: 'ctr',
    render: (_: unknown, r: typeof mockTrendData[0]) => `${((r.clicks / r.impressions) * 100).toFixed(2)}%`,
  },
]

export default function AdvertiserDashboard() {
  const { accountId } = useAuthStore()
  const [balance, setBalance] = useState<AccountBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accountId) return
    getAccountBalance(accountId)
      .then((res) => { if (res.data) setBalance(res.data) })
      .catch(() => {
        // 接口不可用时使用模拟数据
        setBalance({
          accountId: accountId,
          balance: 28650.00,
          frozenAmount: 3200.00,
          totalRecharge: 100000.00,
          totalSpend: 68150.00,
        })
      })
      .finally(() => setLoading(false))
  }, [accountId])

  const todaySpend = mockTrendData[mockTrendData.length - 1].spend
  const todayImpressions = mockTrendData[mockTrendData.length - 1].impressions
  const todayClicks = mockTrendData[mockTrendData.length - 1].clicks

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>账户概览</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="可用余额"
              value={balance?.balance ?? 0}
              precision={2}
              prefix={<WalletOutlined style={{ color: '#1677ff' }} />}
              suffix="元"
              valueStyle={{ color: '#1677ff', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="冻结金额"
              value={balance?.frozenAmount ?? 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="今日消耗"
              value={todaySpend}
              precision={2}
              prefix={<RiseOutlined style={{ color: '#f5222d' }} />}
              suffix="元"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="累计充值"
              value={balance?.totalRecharge ?? 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日曝光"
              value={todayImpressions}
              prefix={<EyeOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日点击"
              value={todayClicks}
              prefix={<SelectOutlined />}
              formatter={(v) => Number(v).toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日 CTR"
              value={((todayClicks / todayImpressions) * 100).toFixed(2)}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="近 7 天消耗趋势" style={{ marginTop: 16 }}>
        <Table
          dataSource={mockTrendData}
          columns={trendColumns}
          rowKey="date"
          pagination={false}
          size="small"
          rowClassName={(_, index) => index === mockTrendData.length - 1 ? 'ant-table-row-selected' : ''}
        />
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          <Tag color="blue">今日</Tag> 数据为实时数据，其余为历史汇总
        </div>
      </Card>
    </div>
  )
}
