import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography } from 'antd'
import { DollarOutlined, CheckCircleOutlined, BankOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../../store/auth'
import { getAccountBalance } from '../../../api/billing'
import type { AccountBalance } from '../../../types/entities'

const { Title } = Typography

const mockSlotData = [
  { slotId: 'slot-001', name: '首页横幅', impressions: 152300, clicks: 3820, revenue: 4280.50, ecpm: 28.10 },
  { slotId: 'slot-002', name: '文章底部', impressions: 98600, clicks: 1970, revenue: 1892.40, ecpm: 19.20 },
  { slotId: 'slot-003', name: '侧边栏', impressions: 67400, clicks: 1010, revenue: 980.20, ecpm: 14.50 },
]

const slotColumns = [
  { title: '广告位', dataIndex: 'name', key: 'name' },
  { title: '今日曝光', dataIndex: 'impressions', key: 'impressions', render: (v: number) => v.toLocaleString() },
  { title: '今日点击', dataIndex: 'clicks', key: 'clicks', render: (v: number) => v.toLocaleString() },
  { title: '今日收入(元)', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `¥${v.toFixed(2)}` },
  { title: 'eCPM', dataIndex: 'ecpm', key: 'ecpm', render: (v: number) => `¥${v.toFixed(2)}` },
  { title: '状态', key: 'status', render: () => <Tag color="green">投放中</Tag> },
]

export default function PublisherDashboard() {
  const { accountId } = useAuthStore()
  const [balance, setBalance] = useState<AccountBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accountId) return
    getAccountBalance(accountId)
      .then((res) => { if (res.data) setBalance(res.data) })
      .catch(() => {
        setBalance({ accountId: accountId, balance: 12580.30, frozenAmount: 0, totalRecharge: 0, totalSpend: 0 })
      })
      .finally(() => setLoading(false))
  }, [accountId])

  const todayRevenue = mockSlotData.reduce((s, r) => s + r.revenue, 0)
  const yesterdaySettlement = 6952.80

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>收益概览</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="待结算金额"
              value={balance?.balance ?? 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="元"
              valueStyle={{ color: '#faad14', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日预估收入"
              value={todayRevenue}
              precision={2}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="昨日已结算"
              value={yesterdaySettlement}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="累计提现"
              value={45000}
              precision={2}
              prefix={<BankOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Card title="今日各广告位表现" style={{ marginTop: 16 }}>
        <Table
          dataSource={mockSlotData}
          columns={slotColumns}
          rowKey="slotId"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
