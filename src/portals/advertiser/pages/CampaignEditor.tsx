import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, DatePicker, Button, Card, Space, Typography, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth'
import { createCampaign, getCampaign, updateCampaign } from '../../../api/campaign'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

export default function CampaignEditor() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { accountId } = useAuthStore()
  const isEdit = Boolean(id && id !== 'new')

  useEffect(() => {
    if (!isEdit || !id) return
    setInitialLoading(true)
    getCampaign(Number(id))
      .then((res) => {
        if (res.data) {
          form.setFieldsValue({
            ...res.data,
            dateRange: [dayjs(res.data.startDate), dayjs(res.data.endDate)],
          })
        }
      })
      .catch(() => { /* 使用空表单 */ })
      .finally(() => setInitialLoading(false))
  }, [id, isEdit, form])

  const onFinish = async (values: {
    name: string
    budget: number
    dailyBudget: number
    dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  }) => {
    setLoading(true)
    const payload = {
      name: values.name,
      budget: values.budget,
      dailyBudget: values.dailyBudget,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      advertiserId: Number(accountId),
      status: 'active' as const,
    }
    try {
      if (isEdit && id) {
        await updateCampaign(Number(id), payload)
        message.success('活动已更新')
      } else {
        await createCampaign(payload)
        message.success('活动已创建')
      }
      navigate('/advertiser/campaigns')
    } catch {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/advertiser/campaigns')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>{isEdit ? '编辑活动' : '新建活动'}</Title>
      </Space>

      <Card style={{ maxWidth: 600 }} loading={initialLoading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
            <Input placeholder="如：品牌春季曝光活动" maxLength={50} />
          </Form.Item>

          <Form.Item name="budget" label="总预算（元）" rules={[{ required: true, message: '请输入总预算' }]}>
            <InputNumber style={{ width: '100%' }} min={100} prefix="¥" precision={2} placeholder="500" />
          </Form.Item>

          <Form.Item name="dailyBudget" label="日预算（元）" rules={[{ required: true, message: '请输入日预算' }]}>
            <InputNumber style={{ width: '100%' }} min={10} prefix="¥" precision={2} placeholder="100" />
          </Form.Item>

          <Form.Item name="dateRange" label="投放时间" rules={[{ required: true, message: '请选择投放时间' }]}>
            <RangePicker style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '保存修改' : '创建活动'}
              </Button>
              <Button onClick={() => navigate('/advertiser/campaigns')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
