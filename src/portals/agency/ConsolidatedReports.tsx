import { useState } from 'react'
import { Table, DatePicker, Button, Space, Typography, Tag, Spin, Alert } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useAgencyStore } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title } = Typography
const { RangePicker } = DatePicker

interface ReportRow {
  advertiser_id: number
  date: string
  impressions: number
  clicks: number
  spend: number
  ctr: number
}

export default function ConsolidatedReports() {
  const { agencyId } = useAgencyStore()
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(30, 'day'), dayjs()])
  const [data, setData] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = async () => {
    if (!agencyId) return
    setLoading(true)
    setError(null)
    try {
      const resp = await agencyApi.getAggregatedReport(
        agencyId,
        range[0].format('YYYY-MM-DD'),
        range[1].format('YYYY-MM-DD'),
      )
      setData(resp.data ?? [])
    } catch {
      setError('加载报表失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '广告主 ID', dataIndex: 'advertiser_id', key: 'advertiser_id' },
    { title: '日期', dataIndex: 'date', key: 'date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { title: '曝光量', dataIndex: 'impressions', key: 'impressions', render: (v: number) => (v ?? 0).toLocaleString() },
    { title: '点击量', dataIndex: 'clicks', key: 'clicks', render: (v: number) => (v ?? 0).toLocaleString() },
    {
      title: '消耗 ($)',
      dataIndex: 'spend',
      key: 'spend',
      render: (v: number) => <Tag color="blue">${(v ?? 0).toFixed(2)}</Tag>,
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (v: number) => `${((v ?? 0) * 100).toFixed(2)}%`,
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>跨客户聚合报表</Title>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={range}
          onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={fetchReport} loading={loading}>
          查询
        </Button>
      </Space>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
      ) : (
        <Table<ReportRow>
          rowKey={(r) => `${r.advertiser_id}-${r.date}`}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50 }}
          summary={(pageData) => {
            const totalSpend = pageData.reduce((s, r) => s + (r.spend ?? 0), 0)
            const totalImpressions = pageData.reduce((s, r) => s + (r.impressions ?? 0), 0)
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>合计</Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Tag color="purple">${totalSpend.toFixed(2)}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>{totalImpressions.toLocaleString()} 次曝光</Table.Summary.Cell>
              </Table.Summary.Row>
            )
          }}
        />
      )}
    </div>
  )
}
