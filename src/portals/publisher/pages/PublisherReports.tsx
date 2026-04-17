import { useState } from 'react'
import { Card, DatePicker, Select, Table, Space, Typography, Button, Row, Col, Statistic } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

type GroupBy = 'slot' | 'date'

interface ReportRow {
  key: string
  name: string
  impressions: number
  clicks: number
  revenue: number
  ecpm: string
}

const slotNames = ['首页横幅', '文章底部', '侧边栏']

const generateMockData = (groupBy: GroupBy): ReportRow[] => {
  if (groupBy === 'slot') {
    return slotNames.map((name, i) => {
      const imp = Math.round(Math.random() * 200000 + 50000)
      const clicks = Math.round(Math.random() * 3000 + 500)
      const rev = Math.round(Math.random() * 5000 + 1000)
      return { key: String(i), name, impressions: imp, clicks, revenue: rev, ecpm: ((rev / imp) * 1000).toFixed(2) }
    })
  }
  return Array.from({ length: 7 }, (_, i) => {
    const d = dayjs().subtract(6 - i, 'day')
    const imp = Math.round(Math.random() * 150000 + 30000)
    const clicks = Math.round(Math.random() * 2000 + 300)
    const rev = Math.round(Math.random() * 4000 + 800)
    return { key: String(i), name: d.format('MM-DD'), impressions: imp, clicks, revenue: rev, ecpm: ((rev / imp) * 1000).toFixed(2) }
  })
}

export default function PublisherReports() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(7, 'day'), dayjs()])
  const [groupBy, setGroupBy] = useState<GroupBy>('slot')
  const [data, setData] = useState<ReportRow[]>(generateMockData('slot'))
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setData(generateMockData(groupBy))
    setLoading(false)
  }

  const totals = data.reduce((a, r) => ({
    impressions: a.impressions + r.impressions,
    clicks: a.clicks + r.clicks,
    revenue: a.revenue + r.revenue,
  }), { impressions: 0, clicks: 0, revenue: 0 })

  const columns = [
    { title: groupBy === 'slot' ? '广告位' : '日期', dataIndex: 'name', key: 'name' },
    { title: '曝光', dataIndex: 'impressions', key: 'impressions', render: (v: number) => v.toLocaleString() },
    { title: '点击', dataIndex: 'clicks', key: 'clicks', render: (v: number) => v.toLocaleString() },
    { title: '收入(元)', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: 'eCPM', dataIndex: 'ecpm', key: 'ecpm', render: (v: string) => `¥${v}` },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>收入报表</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(v) => { if (v?.[0] && v?.[1]) setDateRange([v[0], v[1]]) }}
            disabledDate={(d) => d.isAfter(dayjs(), 'day')}
          />
          <Select
            value={groupBy}
            onChange={(v) => setGroupBy(v)}
            style={{ width: 120 }}
            options={[
              { value: 'slot', label: '按广告位' },
              { value: 'date', label: '按日期' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="总曝光" value={totals.impressions} formatter={(v) => Number(v).toLocaleString()} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="总收入" value={totals.revenue} precision={2} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="综合 eCPM" value={((totals.revenue / totals.impressions) * 1000).toFixed(2)} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="key"
        loading={loading}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><strong>合计</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}>{totals.impressions.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={2}>{totals.clicks.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={3}>¥{totals.revenue.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={4}>¥{((totals.revenue / totals.impressions) * 1000).toFixed(2)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  )
}
