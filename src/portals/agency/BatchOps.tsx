import { useState } from 'react'
import { Form, InputNumber, Button, Space, Table, Tag, Tabs, Typography, message, Alert } from 'antd'
import { ThunderboltOutlined, PauseCircleOutlined, DollarOutlined } from '@ant-design/icons'
import { useAgencyStore } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title } = Typography

interface BatchResult {
  campaign_id: number
  success: boolean
  error?: string
}

function CampaignIDInput({ onChange }: { value?: number[]; onChange?: (v: number[]) => void }) {
  const [input, setInput] = useState('')
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ids = e.target.value
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0)
    onChange?.(ids)
  }
  return (
    <textarea
      value={input}
      onChange={handleChange}
      placeholder="输入 Campaign ID，用逗号或换行分隔，例如: 101, 102, 103"
      rows={4}
      style={{ width: '100%', borderRadius: 6, border: '1px solid #d9d9d9', padding: '8px 12px', resize: 'vertical' }}
    />
  )
}

const resultColumns = [
  { title: 'Campaign ID', dataIndex: 'campaign_id', key: 'campaign_id' },
  {
    title: '结果',
    dataIndex: 'success',
    key: 'success',
    render: (v: boolean) => <Tag color={v ? 'success' : 'error'}>{v ? '成功' : '失败'}</Tag>,
  },
  { title: '错误信息', dataIndex: 'error', key: 'error', render: (v?: string) => v ?? '-' },
]

export default function BatchOps() {
  const { agencyId } = useAgencyStore()
  const [pauseForm] = Form.useForm()
  const [budgetForm] = Form.useForm()
  const [results, setResults] = useState<BatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePause = async (values: { campaign_ids: number[] }) => {
    if (!agencyId || !values.campaign_ids?.length) {
      message.warning('请输入 Campaign ID')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await agencyApi.batchPause(agencyId, values.campaign_ids)
      setResults(resp.data ?? [])
      message.success('批量暂停完成')
    } catch {
      setError('批量操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetUpdate = async (values: { campaign_ids: number[]; new_budget: number }) => {
    if (!agencyId || !values.campaign_ids?.length) {
      message.warning('请输入 Campaign ID')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await agencyApi.batchBudgetUpdate(agencyId, values.campaign_ids, values.new_budget)
      setResults(resp.data ?? [])
      message.success('批量更新预算完成')
    } catch {
      setError('批量操作失败')
    } finally {
      setLoading(false)
    }
  }

  const items = [
    {
      key: 'pause',
      label: <><PauseCircleOutlined /> 批量暂停</>,
      children: (
        <Form form={pauseForm} layout="vertical" onFinish={handlePause}>
          <Form.Item name="campaign_ids" label="Campaign IDs" rules={[{ required: true }]}>
            <CampaignIDInput />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<ThunderboltOutlined />} loading={loading} danger>
            批量暂停
          </Button>
        </Form>
      ),
    },
    {
      key: 'budget',
      label: <><DollarOutlined /> 批量改预算</>,
      children: (
        <Form form={budgetForm} layout="vertical" onFinish={handleBudgetUpdate}>
          <Form.Item name="campaign_ids" label="Campaign IDs" rules={[{ required: true }]}>
            <CampaignIDInput />
          </Form.Item>
          <Form.Item name="new_budget" label="新预算 ($)" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<DollarOutlined />} loading={loading}>
            批量更新预算
          </Button>
        </Form>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>批量操作</Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Space direction="vertical" style={{ width: '100%' }} size={24}>
        <Tabs items={items} />
        {results.length > 0 && (
          <div>
            <Title level={5}>操作结果</Title>
            <Table<BatchResult>
              rowKey="campaign_id"
              columns={resultColumns}
              dataSource={results}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Space>
    </div>
  )
}
