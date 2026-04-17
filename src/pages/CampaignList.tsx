import { useState, useCallback } from 'react'
import { Table, Button, Input, Popconfirm, Space, message, Typography } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useTableData } from '../hooks/useTableData'
import { listCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../api/campaign'
import type { Campaign } from '../types/entities'
import CampaignForm from './CampaignForm'
import { statusTag } from '../utils/statusTag'

const { Title } = Typography

export default function CampaignList() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      listCampaigns({ page, pageSize, name: search || undefined }),
    [search],
  )

  const { data, total, loading, page, pageSize, setPage, setPageSize, refresh } =
    useTableData<Campaign>(fetcher)

  const handleSave = async (
    values: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'advertiserName'>,
  ) => {
    if (editing) {
      await updateCampaign(editing.id, values)
      message.success('更新成功')
    } else {
      await createCampaign(values)
      message.success('创建成功')
    }
    setFormOpen(false)
    setEditing(null)
    refresh()
  }

  const handleDelete = async (id: number) => {
    await deleteCampaign(id)
    message.success('删除成功')
    refresh()
  }

  const columns: ColumnsType<Campaign> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '活动名称', dataIndex: 'name' },
    { title: '广告主', dataIndex: 'advertiserName' },
    {
      title: '总预算',
      dataIndex: 'budget',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '日预算',
      dataIndex: 'dailyBudget',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    { title: '开始日期', dataIndex: 'startDate', width: 120 },
    { title: '结束日期', dataIndex: 'endDate', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: Campaign['status']) => statusTag(s),
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => { setEditing(record); setFormOpen(true) }}>
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>活动管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索名称"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={refresh}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={refresh}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true) }}>
          新建
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps) },
        }}
      />

      <CampaignForm
        open={formOpen}
        record={editing}
        onOk={handleSave}
        onCancel={() => { setFormOpen(false); setEditing(null) }}
      />
    </div>
  )
}
