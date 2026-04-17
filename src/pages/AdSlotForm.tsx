import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Select, Modal } from 'antd'
import type { AdSlot, Publisher } from '../types/entities'
import { listPublishers } from '../api/publisher'

interface Props {
  open: boolean
  record: AdSlot | null
  onOk: (values: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt' | 'publisherName'>) => Promise<void>
  onCancel: () => void
}

export default function AdSlotForm({ open, record, onOk, onCancel }: Props) {
  const [form] = Form.useForm()
  const [publishers, setPublishers] = useState<Publisher[]>([])

  useEffect(() => {
    listPublishers({ page: 1, pageSize: 100 })
      .then((r) => setPublishers(r.data?.list ?? []))
      .catch(() => setPublishers([]))
  }, [])

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        record ?? { status: 'active', type: 'banner', width: 300, height: 250, floorPrice: 0 },
      )
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
      title={record ? '编辑广告位' : '新建广告位'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="publisherId" label="所属媒体方" rules={[{ required: true }]}>
          <Select placeholder="请选择媒体方">
            {publishers.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="广告位名称" rules={[{ required: true }]}>
          <Input placeholder="请输入广告位名称" />
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="banner">Banner</Select.Option>
            <Select.Option value="interstitial">插屏</Select.Option>
            <Select.Option value="native">原生</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="width" label="宽度（px）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="height" label="高度（px）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="floorPrice" label="底价（元/CPM）" rules={[{ required: true }]}>
          <InputNumber min={0} precision={4} style={{ width: '100%' }} />
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
