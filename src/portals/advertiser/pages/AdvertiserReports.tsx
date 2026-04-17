import { useState } from 'react'
import { Card, DatePicker, Select, Table, Space, Typography, Button, Row, Col, Statistic } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

type GroupBy = 'campaign' | 'creative'

interface ReportRow {
  key: string
  name: string
  impressions: number
  clicks: number
  spend: number
  ctr: string
  ecpm: string
}

const generateMockData = (groupBy: GroupBy): ReportRow[] =>
  Array.from({ length: groupBy === 'campaign' ? 3 : 6 }, (_, i) => ({
    key: String(i),
    name: groupBy === 'campaign'
      ? [`品牌曝光春季活动`, `促销转化活动`, `新品发布活动`][i]
      : [`春季横幅广告`, `促销视频30s`, `信息流原生图`, `搜索广告文字版`, `移动端横幅`, `开屏广告`][i],
    impressions: Math.round(Math.random() * 200000 + 50000),
    clicks: Math.round(Math.random() * 5000 + 500),
    spend: Math.round(Math.random() * 20000 + 2000),
    ctr: '',
    ecpm: '',
  })).map((row) => ({
    ...row,
    ctr: ((row.clicks / row.impressions) * 100).toFixed(2) + '%',
    ecpm: ((row.spend / row.impressions) * 1000).toFixed(2),
  }))

export default function AdvertiserReports() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(7, 'day'), dayjs()])
  const [groupBy, setGroupBy] = useState<GroupBy>('campaign')
  const [data, setData] = useState<ReportRow[]>(generateMockData('campaign'))
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      setData(generateMockData(groupBy))
    } finally {
      setLoading(false)
    }
  }

  const totals = data.reduce((acc, r) => ({
    impressions: acc.impressions + r.impressions,
    clicks: acc.clicks + r.clicks,
    spend: acc.spend + r.spend,
  }), { impressions: 0, clicks: 0, spend: 0 })

  const columns = [
    { title: groupBy === 'campaign' ? '活动名称' : '素材名称', dataIndex: 'name', key: 'name' },
    { title: '曝光', dataIndex: 'impressions', key: 'impressions', render: (v: number) => v.toLocaleString() },
    { title: '点击', dataIndex: 'clicks', key: 'clicks', render: (v: number) => v.toLocaleString() },
    { title: 'CTR', dataIndex: 'ctr', key: 'ctr' },
    { title: '消耗(元)', dataIndex: 'spend', key: 'spend', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: 'eCPM', dataIndex: 'ecpm', key: 'ecpm', render: (v: string) => `¥${v}` },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>消耗报表</Title>

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
              { value: 'campaign', label: '按活动' },
              { value: 'creative', label: '按素材' },
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
            <Statistic title="总点击" value={totals.clicks} formatter={(v) => Number(v).toLocaleString()} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="总消耗" value={totals.spend} precision={2} prefix="¥" valueStyle={{ color: '#f5222d' }} />
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
            <Table.Summary.Cell index={3}>{((totals.clicks / totals.impressions) * 100).toFixed(2)}%</Table.Summary.Cell>
            <Table.Summary.Cell index={4}>¥{totals.spend.toLocaleString()}</Table.Summary.Cell>
            <Table.Summary.Cell index={5}>¥{((totals.spend / totals.impressions) * 1000).toFixed(2)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  )
}
