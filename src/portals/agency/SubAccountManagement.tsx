import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Tag, message, Typography } from 'antd'
import { PlusOutlined, LockOutlined } from '@ant-design/icons'
import { useAgencyStore } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title } = Typography

interface AgencyUser {
  id: number
  agencyId: number
  email: string
  name: string
  role: string
  status: string
  lastLoginAt?: string
  createdAt: string
}

const roleColors: Record<string, string> = {
  agency_admin: 'purple',
  media_buyer: 'blue',
  analyst: 'green',
}

const roleLabels: Record<string, string> = {
  agency_admin: '代理管理员',
  media_buyer: '媒介优化师',
  analyst: '数据分析师',
}

export default function SubAccountManagement() {
  const { agencyId } = useAgencyStore()
  const [users, setUsers] = useState<AgencyUser[]>([])
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    if (!agencyId) return
    setLoading(true)
    try {
      const resp = await agencyApi.listUsers(agencyId)
      setUsers(resp.data ?? [])
    } catch {
      message.error('加载子账号失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [agencyId])

  const handleCreate = async (values: { email: string; name: string; role: string; password: string }) => {
    if (!agencyId) return
    try {
      await agencyApi.createUser(agencyId, values)
      message.success('子账号创建成功')
      setAddOpen(false)
      form.resetFields()
      fetchUsers()
    } catch {
      message.error('创建失败')
    }
  }

  const columns = [
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '姓名', dataIndex: 'name', key: 'name', render: (v: string) => v || '-' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role] ?? 'default'}>{roleLabels[role] ?? role}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'success' : 'default'}>{v}</Tag>,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (v?: string) => v ? new Date(v).toLocaleString() : '从未登录',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>子账号管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
          新建子账号
        </Button>
      </div>
      <Table<AgencyUser>
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
      <Modal
        title="新建子账号"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="姓名">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={[
              { label: '代理管理员', value: 'agency_admin' },
              { label: '媒介优化师', value: 'media_buyer' },
              { label: '数据分析师', value: 'analyst' },
            ]} />
          </Form.Item>
          <Form.Item name="password" label="初始密码" rules={[{ required: true, min: 8 }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
