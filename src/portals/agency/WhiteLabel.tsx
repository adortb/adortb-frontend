import { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Spin, ColorPicker } from 'antd'
import type { Color } from 'antd/es/color-picker'
import { useAgencyStore } from './store/agencyStore'
import { agencyApi } from './api/agencyApi'

const { Title, Text } = Typography

interface WLConfig {
  agencyId: number
  domain: string
  logoUrl: string
  primaryColor: string
  agencyName: string
}

export default function WhiteLabel() {
  const { agencyId } = useAgencyStore()
  const [form] = Form.useForm()

  useEffect(() => {
    if (!agencyId) return
    agencyApi.getWhiteLabel(agencyId).then((resp) => {
      const cfg: WLConfig = resp.data
      form.setFieldsValue({
        domain: cfg?.domain ?? '',
        logo_url: cfg?.logoUrl ?? '',
        primary_color: cfg?.primaryColor ?? '#1677ff',
      })
    }).catch(() => { /* ignore initial load error */ })
  }, [agencyId, form])

  const handleSave = async (values: { domain: string; logo_url: string; primary_color: string | Color }) => {
    if (!agencyId) return
    const color = typeof values.primary_color === 'string'
      ? values.primary_color
      : (values.primary_color as Color).toHexString()
    try {
      await agencyApi.updateWhiteLabel(agencyId, {
        domain: values.domain,
        logo_url: values.logo_url,
        primary_color: color,
      })
      message.success('白标配置已保存')
    } catch {
      message.error('保存失败')
    }
  }

  if (!agencyId) return <Spin />

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>白标设置</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        配置代理商品牌化设置，将 adortb 平台包装成您自己的品牌。
      </Text>
      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="domain" label="自定义域名" extra="例如: ads.youragency.com">
            <Input placeholder="your-domain.com" />
          </Form.Item>
          <Form.Item name="logo_url" label="Logo URL">
            <Input placeholder="https://your-cdn.com/logo.png" />
          </Form.Item>
          <Form.Item name="primary_color" label="品牌主色">
            <ColorPicker showText format="hex" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
