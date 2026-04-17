import { useState, useCallback } from 'react'
import { Table, Button, Input, Popconfirm, Space, message, Typography } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useTableData } from '../hooks/useTableData'
import {
  listAdvertisers,
  createAdvertiser,
  updateAdvertiser,
  deleteAdvertiser,
} from '../api/advertiser'
import type { Advertiser } from '../types/entities'
import AdvertiserForm from './AdvertiserForm'
import { statusTag } from '../utils/statusTag'

const { Title } = Typography

export default function AdvertiserList() {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Advertiser | null>(null)

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      listAdvertisers({ page, pageSize, name: search || undefined }),
    [search],
  )

  const { data, total, loading, page, pageSize, setPage, setPageSize, refresh } =
    useTableData<Advertiser>(fetcher)

  const handleSave = async (values: Omit<Advertiser, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      await updateAdvertiser(editing.id, values)
      message.success('更新成功')
    } else {
      await createAdvertiser(values)
      message.success('创建成功')
    }
    setFormOpen(false)
    setEditing(null)
    refresh()
  }

  const handleDelete = async (id: number) => {
    await deleteAdvertiser(id)
    message.success('删除成功')
    refresh()
  }

  const columns: ColumnsType<Advertiser> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '名称', dataIndex: 'name' },
    { title: '联系邮箱', dataIndex: 'email' },
    {
      title: '总预算',
      dataIndex: 'budget',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: Advertiser['status']) => statusTag(s),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditing(record)
              setFormOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>广告主管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索名称"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={refresh}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={refresh}>
          刷新
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
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
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />

      <AdvertiserForm
        open={formOpen}
        record={editing}
        onOk={handleSave}
        onCancel={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
