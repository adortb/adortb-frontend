import { useEffect, useState } from 'react'
import { Table, Button, Tag, Space, Select, Typography, Popconfirm, message } from 'antd'
import { PlusOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth'
import { listCampaigns, updateCampaign } from '../../../api/campaign'
import type { Campaign } from '../../../types/entities'
import dayjs from 'dayjs'

const { Title } = Typography

type CampaignStatus = 'active' | 'inactive' | 'pending'

const statusConfig: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '投放中' },
  inactive: { color: 'orange', text: '已暂停' },
  pending: { color: 'red', text: '余额不足' },
}

export default function AdvertiserCampaigns() {
  const { accountId } = useAuthStore()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchCampaigns = async (p = 1) => {
    if (!accountId) return
    setLoading(true)
    try {
      const res = await listCampaigns({ page: p, pageSize: 10, advertiserId: Number(accountId) })
      if (res.data) {
        setCampaigns(res.data.list ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch {
      // 使用模拟数据
      setCampaigns([
        { id: 1, advertiserId: Number(accountId), name: '品牌曝光春季活动', budget: 50000, dailyBudget: 2000, startDate: '2026-04-01', endDate: '2026-04-30', status: 'active', createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
        { id: 2, advertiserId: Number(accountId), name: '促销转化活动', budget: 30000, dailyBudget: 1500, startDate: '2026-04-10', endDate: '2026-04-20', status: 'inactive', createdAt: '2026-04-10T00:00:00Z', updatedAt: '2026-04-10T00:00:00Z' },
      ])
      setTotal(2)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns(1) }, [accountId])

  const handleToggle = async (campaign: Campaign) => {
    const newStatus: CampaignStatus = campaign.status === 'active' ? 'inactive' : 'active'
    try {
      await updateCampaign(campaign.id, { status: newStatus })
      message.success(newStatus === 'active' ? '活动已恢复投放' : '活动已暂停')
      fetchCampaigns(page)
    } catch {
      message.error('操作失败，请重试')
    }
  }

  const filtered = statusFilter === 'all' ? campaigns : campaigns.filter((c) => c.status === statusFilter)

  const columns = [
    { title: '活动名称', dataIndex: 'name', key: 'name' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.text ?? s}</Tag>,
    },
    { title: '总预算', dataIndex: 'budget', key: 'budget', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '日预算', dataIndex: 'dailyBudget', key: 'dailyBudget', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', render: (v: string) => dayjs(v).format('MM-DD') },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', render: (v: string) => dayjs(v).format('MM-DD') },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: Campaign) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/advertiser/campaigns/${record.id}/edit`)}>编辑</Button>
          <Popconfirm
            title={record.status === 'active' ? '确认暂停该活动？' : '确认恢复该活动？'}
            onConfirm={() => handleToggle(record)}
          >
            <Button
              size="small"
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              danger={record.status === 'active'}
            >
              {record.status === 'active' ? '暂停' : '恢复'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>我的活动</Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '投放中' },
              { value: 'inactive', label: '已暂停' },
              { value: 'pending', label: '余额不足' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/advertiser/campaigns/new')}>
            新建活动
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          total,
          current: page,
          pageSize: 10,
          onChange: (p) => { setPage(p); fetchCampaigns(p) },
        }}
      />
    </div>
  )
}
