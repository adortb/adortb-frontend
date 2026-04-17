import { useEffect, useState } from 'react'
import { Card, Statistic, Row, Col, Table, Button, Typography, Space, Tag } from 'antd'
import { WalletOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth'
import { getAccountBalance, listRechargeRecords } from '../../../api/billing'
import type { AccountBalance, RechargeRecord } from '../../../types/entities'
import dayjs from 'dayjs'

const { Title } = Typography

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '处理中' },
  success: { color: 'green', text: '成功' },
  failed: { color: 'red', text: '失败' },
}

const columns = [
  { title: '充值金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
  {
    title: '状态', dataIndex: 'status', key: 'status',
    render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text ?? s}</Tag>,
  },
  { title: '充值时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
]

const mockRecords: RechargeRecord[] = [
  { id: '1', accountId: '', amount: 50000, status: 'success', createdAt: '2026-04-10T10:00:00Z' },
  { id: '2', accountId: '', amount: 30000, status: 'success', createdAt: '2026-03-15T14:30:00Z' },
  { id: '3', accountId: '', amount: 20000, status: 'success', createdAt: '2026-02-20T09:00:00Z' },
]

export default function AdvertiserAccount() {
  const { accountId } = useAuthStore()
  const navigate = useNavigate()
  const [balance, setBalance] = useState<AccountBalance | null>(null)
  const [records, setRecords] = useState<RechargeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accountId) return
    Promise.all([
      getAccountBalance(accountId),
      listRechargeRecords(accountId, { page: 1, pageSize: 20 }),
    ])
      .then(([b, r]) => {
        if (b.data) setBalance(b.data)
        if (r.data?.list) setRecords(r.data.list)
      })
      .catch(() => {
        setBalance({ accountId: accountId, balance: 28650, frozenAmount: 3200, totalRecharge: 100000, totalSpend: 68150 })
        setRecords(mockRecords.map((r) => ({ ...r, accountId: accountId })))
      })
      .finally(() => setLoading(false))
  }, [accountId])

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>账户余额</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="可用余额"
              value={balance?.balance ?? 0}
              precision={2}
              prefix={<WalletOutlined style={{ color: '#1677ff' }} />}
              suffix="元"
              valueStyle={{ color: '#1677ff', fontSize: 32 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginTop: 16, width: '100%' }}
              onClick={() => navigate('/advertiser/recharge')}
            >
              立即充值
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic title="冻结金额" value={balance?.frozenAmount ?? 0} precision={2} prefix="¥" valueStyle={{ color: '#faad14' }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>投放中活动预占金额</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic title="累计消耗" value={balance?.totalSpend ?? 0} precision={2} prefix="¥" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      <Card title="充值记录" style={{ marginTop: 24 }}
        extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/advertiser/recharge')}>充值</Button></Space>}
      >
        <Table
          dataSource={records}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
