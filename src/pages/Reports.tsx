import { useState } from 'react'
import { Tabs, DatePicker, Button, Table, Typography, Space, Card } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { getPublisherReport, getAdvertiserReport } from '../api/report'
import type { PublisherReport, AdvertiserReport } from '../types/entities'

const { Title } = Typography
const { RangePicker } = DatePicker

export default function Reports() {
  const defaultRange: [Dayjs, Dayjs] = [dayjs().subtract(7, 'day'), dayjs()]

  const [pubRange, setPubRange] = useState<[Dayjs, Dayjs]>(defaultRange)
  const [advRange, setAdvRange] = useState<[Dayjs, Dayjs]>(defaultRange)
  const [pubData, setPubData] = useState<PublisherReport[]>([])
  const [advData, setAdvData] = useState<AdvertiserReport[]>([])
  const [pubLoading, setPubLoading] = useState(false)
  const [advLoading, setAdvLoading] = useState(false)

  const fetchPublisher = async () => {
    setPubLoading(true)
    try {
      const res = await getPublisherReport({
        startDate: pubRange[0].format('YYYY-MM-DD'),
        endDate: pubRange[1].format('YYYY-MM-DD'),
      })
      setPubData(res.data ?? [])
    } finally {
      setPubLoading(false)
    }
  }

  const fetchAdvertiser = async () => {
    setAdvLoading(true)
    try {
      const res = await getAdvertiserReport({
        startDate: advRange[0].format('YYYY-MM-DD'),
        endDate: advRange[1].format('YYYY-MM-DD'),
      })
      setAdvData(res.data ?? [])
    } finally {
      setAdvLoading(false)
    }
  }

  const pubColumns: ColumnsType<PublisherReport> = [
    { title: '日期', dataIndex: 'date', width: 120 },
    { title: '媒体方', dataIndex: 'publisherName' },
    { title: '展示量', dataIndex: 'impressions', render: (v: number) => v.toLocaleString() },
    { title: '点击量', dataIndex: 'clicks', render: (v: number) => v.toLocaleString() },
    { title: '收入（元）', dataIndex: 'revenue', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: 'eCPM', dataIndex: 'ecpm', render: (v: number) => `¥${v.toFixed(4)}` },
  ]

  const advColumns: ColumnsType<AdvertiserReport> = [
    { title: '日期', dataIndex: 'date', width: 120 },
    { title: '广告主', dataIndex: 'advertiserName' },
    { title: '展示量', dataIndex: 'impressions', render: (v: number) => v.toLocaleString() },
    { title: '点击量', dataIndex: 'clicks', render: (v: number) => v.toLocaleString() },
    { title: '消耗（元）', dataIndex: 'spend', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: 'CTR', dataIndex: 'ctr', render: (v: number) => `${(v * 100).toFixed(2)}%` },
  ]

  const tabItems = [
    {
      key: 'publisher',
      label: 'Publisher 收入',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }}>
            <RangePicker
              value={pubRange}
              onChange={(dates) => {
                if (dates) setPubRange(dates as [Dayjs, Dayjs])
              }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchPublisher}
              loading={pubLoading}
            >
              查询
            </Button>
          </Space>
          <Table
            rowKey={(r) => `${r.date}-${r.publisherId}`}
            columns={pubColumns}
            dataSource={pubData}
            loading={pubLoading}
            pagination={{ showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
    {
      key: 'advertiser',
      label: 'Advertiser 消耗',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }}>
            <RangePicker
              value={advRange}
              onChange={(dates) => {
                if (dates) setAdvRange(dates as [Dayjs, Dayjs])
              }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchAdvertiser}
              loading={advLoading}
            >
              查询
            </Button>
          </Space>
          <Table
            rowKey={(r) => `${r.date}-${r.advertiserId}`}
            columns={advColumns}
            dataSource={advData}
            loading={advLoading}
            pagination={{ showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>数据报表</Title>
      <Tabs items={tabItems} />
    </div>
  )
}
