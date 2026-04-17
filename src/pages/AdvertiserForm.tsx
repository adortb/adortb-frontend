import { useEffect } from 'react'
import { Form, Input, InputNumber, Select, Modal } from 'antd'
import type { Advertiser } from '../types/entities'

interface Props {
  open: boolean
  record: Advertiser | null
  onOk: (values: Omit<Advertiser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

export default function AdvertiserForm({ open, record, onOk, onCancel }: Props) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.setFieldsValue(record ?? { status: 'active', budget: 0 })
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
      title={record ? '编辑广告主' : '新建广告主'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="请输入广告主名称" />
        </Form.Item>
        <Form.Item
          name="email"
          label="联系邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入合法邮箱' },
          ]}
        >
          <Input placeholder="请输入联系邮箱" />
        </Form.Item>
        <Form.Item name="budget" label="总预算（元）" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
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
