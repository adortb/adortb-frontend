import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Typography } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  FundOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { listPublishers } from '../api/publisher'
import { listAdvertisers } from '../api/advertiser'
import { listCampaigns } from '../api/campaign'
import { listAdSlots } from '../api/adslot'

const { Title } = Typography

interface Summary {
  publishers: number
  advertisers: number
  campaigns: number
  adslots: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>({
    publishers: 0,
    advertisers: 0,
    campaigns: 0,
    adslots: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, a, c, s] = await Promise.all([
          listPublishers({ page: 1, pageSize: 1 }),
          listAdvertisers({ page: 1, pageSize: 1 }),
          listCampaigns({ page: 1, pageSize: 1 }),
          listAdSlots({ page: 1, pageSize: 1 }),
        ])
        setSummary({
          publishers: p.data?.total ?? 0,
          advertisers: a.data?.total ?? 0,
          campaigns: c.data?.total ?? 0,
          adslots: s.data?.total ?? 0,
        })
      } catch {
        // 忽略，保持默认值
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const stats = [
    { title: '媒体方总数', value: summary.publishers, icon: <TeamOutlined style={{ fontSize: 24, color: '#1677ff' }} />, color: '#e6f4ff' },
    { title: '广告主总数', value: summary.advertisers, icon: <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#f6ffed' },
    { title: '活动总数', value: summary.campaigns, icon: <FundOutlined style={{ fontSize: 24, color: '#faad14' }} />, color: '#fffbe6' },
    { title: '广告位总数', value: summary.adslots, icon: <AppstoreOutlined style={{ fontSize: 24, color: '#722ed1' }} />, color: '#f9f0ff' },
  ]

  const quickLinks = [
    { key: '1', name: '媒体方管理', path: '/publishers', desc: '管理媒体方信息、广告位授权' },
    { key: '2', name: '广告主管理', path: '/advertisers', desc: '管理广告主账号、预算配置' },
    { key: '3', name: '活动管理', path: '/campaigns', desc: '创建和管理广告投放活动' },
    { key: '4', name: '数据报表', path: '/reports', desc: '查看收入消耗等统计数据' },
  ]

  const columns = [
    { title: '功能模块', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'desc', key: 'desc' },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>数据概览</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.title}>
            <Card loading={loading} style={{ background: s.color, border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Statistic title={s.title} value={s.value} />
                {s.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="快速导航">
        <Table
          dataSource={quickLinks}
          columns={columns}
          pagination={false}
          size="small"
          onRow={(record) => ({
            onClick: () => { window.location.hash = `#${record.path}` },
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  )
}
