import { useEffect, useState } from 'react'
import { Table, Tag, Typography, Card, Statistic, Row, Col } from 'antd'
import { useAuthStore } from '../../../store/auth'
import { listSettlements } from '../../../api/billing'
import type { SettlementRecord } from '../../../types/entities'
import dayjs from 'dayjs'

const { Title } = Typography

const mockSettlements: SettlementRecord[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  publisherId: '',
  date: dayjs().subtract(i + 1, 'day').format('YYYY-MM-DD'),
  amount: Math.round(Math.random() * 5000 + 1000) / 100 * 100,
  status: i < 7 ? 'paid' : 'pending',
  createdAt: dayjs().subtract(i + 1, 'day').toISOString(),
}))

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待打款' },
  paid: { color: 'green', text: '已打款' },
}

const columns = [
  { title: '结算日期', dataIndex: 'date', key: 'date' },
  { title: '结算金额(元)', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
  {
    title: '状态', dataIndex: 'status', key: 'status',
    render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text ?? s}</Tag>,
  },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
]

export default function PublisherSettlement() {
  const { accountId } = useAuthStore()
  const [records, setRecords] = useState<SettlementRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accountId) return
    listSettlements(accountId, { page: 1, pageSize: 30 })
      .then((res) => { if (res.data?.list) setRecords(res.data.list) })
      .catch(() => { setRecords(mockSettlements.map((r) => ({ ...r, publisherId: accountId }))) })
      .finally(() => setLoading(false))
  }, [accountId])

  const paidTotal = records.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0)
  const pendingTotal = records.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0)

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>结算记录</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic title="待打款合计" value={pendingTotal} precision={2} prefix="¥" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic title="已打款合计" value={paidTotal} precision={2} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={records}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
      />
    </div>
  )
}
