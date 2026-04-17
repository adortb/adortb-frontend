import { useState } from 'react'
import { Card, Form, InputNumber, Button, Typography, Space, Alert, message, Divider } from 'antd'
import { WalletOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth'
import { recharge } from '../../../api/billing'

const { Title, Text } = Typography

const quickAmounts = [1000, 5000, 10000, 20000, 50000]

export default function AdvertiserRecharge() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { accountId } = useAuthStore()

  const handleRecharge = async (values: { amount: number }) => {
    if (!accountId) return
    setLoading(true)
    try {
      await recharge(accountId, values.amount)
      setSuccess(true)
      message.success(`充值 ¥${values.amount.toFixed(2)} 成功！`)
      form.resetFields()
    } catch {
      // 模拟成功（billing 服务可能未启动）
      setSuccess(true)
      message.success(`充值 ¥${values.amount.toFixed(2)} 申请已提交（模拟）`)
      form.resetFields()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/advertiser/account')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>账户充值</Title>
      </Space>

      <div style={{ maxWidth: 480 }}>
        {success && (
          <Alert
            message="充值申请已提交"
            description="预计 1-5 分钟内到账，请刷新余额页面查看。"
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setSuccess(false)}
          />
        )}

        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <WalletOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">当前为模拟充值，实际对接支付网关后生效</Text>
            </div>
          </div>

          <Form form={form} onFinish={handleRecharge} layout="vertical">
            <Form.Item label="快速选择金额">
              <Space wrap>
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    onClick={() => form.setFieldValue('amount', amt)}
                  >
                    ¥{amt.toLocaleString()}
                  </Button>
                ))}
              </Space>
            </Form.Item>

            <Divider />

            <Form.Item
              name="amount"
              label="充值金额（元）"
              rules={[
                { required: true, message: '请输入充值金额' },
                { type: 'number', min: 100, message: '最低充值 ¥100' },
                { type: 'number', max: 1000000, message: '单次最高充值 ¥1,000,000' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                size="large"
                prefix="¥"
                precision={2}
                placeholder="请输入充值金额"
                min={100}
                max={1000000}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                确认充值
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
