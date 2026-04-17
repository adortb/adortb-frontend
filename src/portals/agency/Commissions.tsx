import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Button, Tag, Typography, Spin, Alert, Modal, InputNumber, Form, message } from 'antd'
import { DollarOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAgencyStore } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title } = Typography

interface CommissionRecord {
  id: number
  agencyId: number
  periodMonth: string
  totalAdvertiserSpend: number
  commissionEarned: number
  status: string
}

const statusColors: Record<string, string> = {
  pending: 'orange',
  invoiced: 'blue',
  paid: 'success',
}

const statusLabels: Record<string, string> = {
  pending: '待结算',
  invoiced: '已开票',
  paid: '已支付',
}

export default function Commissions() {
  const { agencyId } = useAgencyStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<CommissionRecord | null>(null)
  const [history, setHistory] = useState<CommissionRecord[]>([])
  const [settleOpen, setSettleOpen] = useState(false)
  const [form] = Form.useForm()
  const [settling, setSettling] = useState(false)

  const fetchData = async () => {
    if (!agencyId) return
    setLoading(true)
    try {
      const resp = await agencyApi.getCommissions(agencyId)
      setEstimate(resp.data?.current_estimate ?? null)
      setHistory(resp.data?.history ?? [])
    } catch {
      setError('加载返佣数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [agencyId])

  const handleSettle = async (values: { total_spend: number }) => {
    if (!agencyId) return
    setSettling(true)
    try {
      await agencyApi.settleCommission(agencyId, values.total_spend)
      message.success('结算完成')
      setSettleOpen(false)
      form.resetFields()
      fetchData()
    } catch {
      message.error('结算失败')
    } finally {
      setSettling(false)
    }
  }

  const columns = [
    {
      title: '结算月份',
      dataIndex: 'periodMonth',
      key: 'periodMonth',
      render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) : '-',
    },
    {
      title: '广告主总消耗 ($)',
      dataIndex: 'totalAdvertiserSpend',
      key: 'totalAdvertiserSpend',
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
    {
      title: '返佣金额 ($)',
      dataIndex: 'commissionEarned',
      key: 'commissionEarned',
      render: (v: number) => <Tag color="green">${(v ?? 0).toFixed(2)}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={statusColors[v] ?? 'default'}>{statusLabels[v] ?? v}</Tag>,
    },
  ]

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
  if (error) return <Alert type="error" message={error} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>返佣管理</Title>
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setSettleOpen(true)}>
          触发月度结算
        </Button>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="本月预估返佣 ($)"
              value={estimate?.commissionEarned ?? 0}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="本月广告主消耗 ($)"
              value={estimate?.totalAdvertiserSpend ?? 0}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>
      <Title level={5}>历史返佣记录</Title>
      <Table<CommissionRecord>
        rowKey="id"
        columns={columns}
        dataSource={history}
        pagination={{ pageSize: 12 }}
      />
      <Modal
        title="触发月度结算"
        open={settleOpen}
        onCancel={() => setSettleOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={settling}
      >
        <Form form={form} layout="vertical" onFinish={handleSettle}>
          <Form.Item name="total_spend" label="当月广告主总消耗 ($)" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
