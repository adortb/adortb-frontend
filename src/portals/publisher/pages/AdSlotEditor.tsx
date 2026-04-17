import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Select, Button, Card, Space, Typography, message, Alert } from 'antd'
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth'
import { createAdSlot, getAdSlot, updateAdSlot } from '../../../api/adslot'
import type { AdSlot } from '../../../types/entities'

const { Title, Text } = Typography

const commonSizes = [
  { label: '728×90 横幅', width: 728, height: 90 },
  { label: '320×50 移动横幅', width: 320, height: 50 },
  { label: '300×250 矩形', width: 300, height: 250 },
  { label: '160×600 摩天楼', width: 160, height: 600 },
]

const generateJsTag = (slot: Partial<AdSlot & { id: number }>): string =>
  `<!-- adortb Ad Tag -->
<div id="adortb-slot-${slot.id ?? 'NEW'}" style="width:${slot.width ?? 0}px;height:${slot.height ?? 0}px;"></div>
<script>
(function() {
  var s = document.createElement('script');
  s.src = 'https://sdk.adortb.io/adloader.min.js';
  s.setAttribute('data-slot-id', '${slot.id ?? 'NEW'}');
  s.async = true;
  document.head.appendChild(s);
})();
</script>`

export default function AdSlotEditor() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [savedSlot, setSavedSlot] = useState<AdSlot | null>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { accountId } = useAuthStore()
  const isEdit = Boolean(id && id !== 'new')

  useEffect(() => {
    if (!isEdit || !id) return
    getAdSlot(Number(id))
      .then((res) => { if (res.data) form.setFieldsValue(res.data) })
      .catch(() => { /* 使用空表单 */ })
  }, [id, isEdit, form])

  const applyPreset = (preset: typeof commonSizes[0]) => {
    form.setFieldsValue({ width: preset.width, height: preset.height })
  }

  const onFinish = async (values: { name: string; type: 'banner' | 'interstitial' | 'native'; width: number; height: number; floorPrice: number }) => {
    setLoading(true)
    const payload = { ...values, publisherId: Number(accountId), status: 'active' as const }
    try {
      let slot: AdSlot
      if (isEdit && id) {
        const res = await updateAdSlot(Number(id), payload)
        slot = res.data
      } else {
        const res = await createAdSlot(payload)
        slot = res.data
      }
      setSavedSlot(slot)
      message.success(isEdit ? '广告位已更新' : '广告位已创建')
    } catch {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const copyTag = () => {
    if (!savedSlot) return
    const tag = generateJsTag(savedSlot)
    navigator.clipboard.writeText(tag)
      .then(() => message.success('JS Tag 已复制'))
      .catch(() => message.error('复制失败'))
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/publisher/adslots')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>{isEdit ? '编辑广告位' : '新建广告位'}</Title>
      </Space>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card style={{ flex: '1 1 400px', maxWidth: 540 }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="广告位名称" rules={[{ required: true, message: '请输入广告位名称' }]}>
              <Input placeholder="如：首页横幅广告位" maxLength={50} />
            </Form.Item>

            <Form.Item name="type" label="广告位类型" rules={[{ required: true, message: '请选择类型' }]}>
              <Select options={[
                { value: 'banner', label: '横幅 Banner' },
                { value: 'interstitial', label: '插屏' },
                { value: 'native', label: '原生广告' },
              ]} />
            </Form.Item>

            <Form.Item label="常用尺寸">
              <Space wrap>
                {commonSizes.map((p) => (
                  <Button key={p.label} size="small" onClick={() => applyPreset(p)}>{p.label}</Button>
                ))}
              </Space>
            </Form.Item>

            <Space>
              <Form.Item name="width" label="宽度(px)" rules={[{ required: true, message: '请输入宽度' }]}>
                <InputNumber min={1} max={2000} style={{ width: 120 }} />
              </Form.Item>
              <Form.Item name="height" label="高度(px)" rules={[{ required: true, message: '请输入高度' }]}>
                <InputNumber min={1} max={2000} style={{ width: 120 }} />
              </Form.Item>
            </Space>

            <Form.Item name="floorPrice" label="底价 CPM（元）" rules={[{ required: true, message: '请输入底价' }]}>
              <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} placeholder="1.00" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEdit ? '保存修改' : '创建广告位'}
                </Button>
                <Button onClick={() => navigate('/publisher/adslots')}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {savedSlot && (
          <Card title="JS Tag（已生成）" style={{ flex: '1 1 400px' }}
            extra={<Button icon={<CopyOutlined />} onClick={copyTag}>复制</Button>}
          >
            <Alert
              message="广告位创建成功！将以下 Tag 粘贴到您的网页中即可开始投放。"
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
            />
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: 12,
              borderRadius: 6,
              fontSize: 11,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {generateJsTag(savedSlot)}
            </pre>
            <Text type="secondary" style={{ fontSize: 12 }}>
              将以上代码粘贴到 &lt;body&gt; 标签内对应广告位置，SDK 将自动加载广告。
            </Text>
          </Card>
        )}
      </div>
    </div>
  )
}
