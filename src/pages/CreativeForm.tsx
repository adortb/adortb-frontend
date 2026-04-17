import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Select, Modal } from 'antd'
import type { Creative, Campaign } from '../types/entities'
import { listCampaigns } from '../api/campaign'

interface Props {
  open: boolean
  record: Creative | null
  onOk: (values: Omit<Creative, 'id' | 'createdAt' | 'updatedAt' | 'campaignName'>) => Promise<void>
  onCancel: () => void
}

export default function CreativeForm({ open, record, onOk, onCancel }: Props) {
  const [form] = Form.useForm()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    listCampaigns({ page: 1, pageSize: 100 })
      .then((r) => setCampaigns(r.data?.list ?? []))
      .catch(() => setCampaigns([]))
  }, [])

  useEffect(() => {
    if (open) {
      form.setFieldsValue(record ?? { status: 'active', type: 'banner', width: 300, height: 250 })
    } else {
      form.resetFields()
    }
  }, [open, record, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onOk(values)
  }

  return (
    <Modal
      title={record ? '编辑素材' : '新建素材'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="campaignId" label="所属活动" rules={[{ required: true }]}>
          <Select placeholder="请选择活动">
            {campaigns.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="素材名称" rules={[{ required: true }]}>
          <Input placeholder="请输入素材名称" />
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="banner">Banner</Select.Option>
            <Select.Option value="video">视频</Select.Option>
            <Select.Option value="native">原生</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="url" label="素材地址" rules={[{ required: true }]}>
          <Input placeholder="请输入素材 URL" />
        </Form.Item>
        <Form.Item name="width" label="宽度（px）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="height" label="高度（px）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="active">启用</Select.Option>
            <Select.Option value="inactive">禁用</Select.Option>
            <Select.Option value="pending">待审核</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
