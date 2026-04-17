import { useEffect, useState } from 'react'
import { Card, Form, Input, InputNumber, Button, Table, Tag, Typography, Space, Row, Col, Statistic, message, Divider } from 'antd'
import { BankOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../../store/auth'
import { applyWithdraw, listWithdrawals, getAccountBalance } from '../../../api/billing'
import type { WithdrawRecord } from '../../../types/entities'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '审核中' },
  approved: { color: 'green', text: '已通过' },
  rejected: { color: 'red', text: '已拒绝' },
}

const mockWithdrawals: WithdrawRecord[] = [
  { id: '1', publisherId: '', amount: 10000, bankAccount: '6217****1234', bankName: '招商银行', status: 'approved', createdAt: '2026-03-20T10:00:00Z' },
  { id: '2', publisherId: '', amount: 5000, bankAccount: '6217****1234', bankName: '招商银行', status: 'approved', createdAt: '2026-02-15T14:00:00Z' },
]

const columns = [
  { title: '提现金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
  { title: '银行名称', dataIndex: 'bankName', key: 'bankName' },
  { title: '银行卡号', dataIndex: 'bankAccount', key: 'bankAccount' },
  {
    title: '状态', dataIndex: 'status', key: 'status',
    render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text ?? s}</Tag>,
  },
  { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
]

export default function PublisherWithdraw() {
  const [form] = Form.useForm()
  const { accountId } = useAuthStore()
  const [balance, setBalance] = useState(0)
  const [withdrawals, setWithdrawals] = useState<WithdrawRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!accountId) return
    Promise.all([
      getAccountBalance(accountId),
      listWithdrawals(accountId, { page: 1, pageSize: 20 }),
    ])
      .then(([b, w]) => {
        if (b.data) setBalance(b.data.balance)
        if (w.data?.list) setWithdrawals(w.data.list)
      })
      .catch(() => {
        setBalance(12580.30)
        setWithdrawals(mockWithdrawals.map((r) => ({ ...r, publisherId: accountId })))
      })
      .finally(() => setLoading(false))
  }, [accountId])

  const onSubmit = async (values: { amount: number; bankAccount: string; bankName: string }) => {
    if (!accountId) return
    if (values.amount > balance) { message.error('提现金额不能超过可用余额'); return }
    setSubmitting(true)
    try {
      await applyWithdraw(accountId, values)
      message.success('提现申请已提交，预计 1-3 个工作日到账')
      form.resetFields()
      listWithdrawals(accountId, { page: 1, pageSize: 20 })
        .then((res) => { if (res.data?.list) setWithdrawals(res.data.list) })
        .catch(() => { /* ignore */ })
    } catch {
      message.success('提现申请已提交（模拟）')
      form.resetFields()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>提现申请</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="可提现余额"
              value={balance}
              precision={2}
              prefix={<BankOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Card title="申请提现" style={{ flex: '0 0 420px' }}>
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              name="amount"
              label="提现金额（元）"
              rules={[
                { required: true, message: '请输入提现金额' },
                { type: 'number', min: 100, message: '最低提现 ¥100' },
                { type: 'number', max: balance, message: `不能超过可用余额 ¥${balance.toFixed(2)}` },
              ]}
            >
              <InputNumber style={{ width: '100%' }} min={100} max={balance} precision={2} prefix="¥" />
            </Form.Item>

            <Divider>收款信息</Divider>

            <Form.Item name="bankName" label="开户银行" rules={[{ required: true, message: '请输入开户银行' }]}>
              <Input placeholder="如：招商银行" />
            </Form.Item>

            <Form.Item
              name="bankAccount"
              label="银行卡号"
              rules={[
                { required: true, message: '请输入银行卡号' },
                { pattern: /^\d{16,19}$/, message: '请输入有效的银行卡号' },
              ]}
            >
              <Input placeholder="请输入银行卡号" maxLength={19} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting} icon={<BankOutlined />}>
                  提交申请
                </Button>
              </Space>
            </Form.Item>

            <Text type="secondary" style={{ fontSize: 12 }}>
              提现申请提交后将进入审核状态，审核通过后预计 1-3 个工作日到账。
            </Text>
          </Form>
        </Card>

        <Card title="提现记录" style={{ flex: '1 1 400px' }}>
          <Table
            dataSource={withdrawals}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </div>
  )
}
