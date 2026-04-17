import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, Select, Tag, message, Typography } from 'antd'
import { PlusOutlined, SwapOutlined } from '@ant-design/icons'
import { useAgencyStore, type AgencyAdvertiser } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title } = Typography

export default function ClientManagement() {
  const { agencyId, advertisers, setAdvertisers, setCurrentAdvertiser } = useAgencyStore()
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchAdvertisers = async () => {
    if (!agencyId) return
    setLoading(true)
    try {
      const resp = await agencyApi.listAdvertisers(agencyId)
      setAdvertisers(resp.data ?? [])
    } catch {
      message.error('加载客户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdvertisers() }, [agencyId])

  const handleAdd = async (values: { advertiser_id: number; role: string }) => {
    if (!agencyId) return
    try {
      await agencyApi.addAdvertiser(agencyId, values.advertiser_id, values.role)
      message.success('客户已关联')
      setAddOpen(false)
      form.resetFields()
      fetchAdvertisers()
    } catch {
      message.error('关联失败')
    }
  }

  const handleSwitch = (advertiserId: number) => {
    setCurrentAdvertiser(advertiserId)
    message.success(`已切换到广告主 #${advertiserId}`)
  }

  const columns = [
    { title: '广告主 ID', dataIndex: 'advertiserId', key: 'advertiserId' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'manage' ? 'blue' : 'default'}>{role}</Tag>,
    },
    {
      title: '关联时间',
      dataIndex: 'addedAt',
      key: 'addedAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AgencyAdvertiser) => (
        <Button icon={<SwapOutlined />} size="small" onClick={() => handleSwitch(record.advertiserId)}>
          切换视图
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>客户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
          关联客户
        </Button>
      </div>
      <Table<AgencyAdvertiser>
        rowKey="id"
        columns={columns}
        dataSource={advertisers}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
      <Modal
        title="关联广告主账户"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="advertiser_id" label="广告主 ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="role" label="权限角色" initialValue="manage">
            <Select options={[
              { label: '管理', value: 'manage' },
              { label: '只读', value: 'readonly' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
