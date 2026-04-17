import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Select, DatePicker, Modal } from 'antd'
import dayjs from 'dayjs'
import type { Campaign, Advertiser } from '../types/entities'
import { listAdvertisers } from '../api/advertiser'

interface Props {
  open: boolean
  record: Campaign | null
  onOk: (values: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'advertiserName'>) => Promise<void>
  onCancel: () => void
}

export default function CampaignForm({ open, record, onOk, onCancel }: Props) {
  const [form] = Form.useForm()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])

  useEffect(() => {
    listAdvertisers({ page: 1, pageSize: 100 })
      .then((r) => setAdvertisers(r.data?.list ?? []))
      .catch(() => setAdvertisers([]))
  }, [])

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          ...record,
          startDate: dayjs(record.startDate),
          endDate: dayjs(record.endDate),
        })
      } else {
        form.setFieldsValue({ status: 'active', budget: 0, dailyBudget: 0 })
      }
    } else {
      form.resetFields()
    }
  }, [open, record, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onOk({
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
    })
  }

  return (
    <Modal
      title={record ? '编辑活动' : '新建活动'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="advertiserId" label="广告主" rules={[{ required: true }]}>
          <Select placeholder="请选择广告主">
            {advertisers.map((a) => (
              <Select.Option key={a.id} value={a.id}>
                {a.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="活动名称" rules={[{ required: true }]}>
          <Input placeholder="请输入活动名称" />
        </Form.Item>
        <Form.Item name="budget" label="总预算（元）" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="dailyBudget" label="日预算（元）" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="endDate" label="结束日期" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
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
