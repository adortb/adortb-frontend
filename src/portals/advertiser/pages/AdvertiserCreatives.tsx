import { useEffect, useState } from 'react'
import { Table, Tag, Button, Upload, Typography, Space, Tooltip, message, Modal, Form, Input, Select } from 'antd'
import { UploadOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useAuthStore } from '../../../store/auth'
import { listCreativesWithReview } from '../../../api/review'
import type { CreativeWithReview } from '../../../api/review'
import type { ReviewStatus } from '../../../types/entities'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Dragger } = Upload

const reviewStatusConfig: Record<ReviewStatus, { color: string; text: string }> = {
  pending_review: { color: 'orange', text: '审核中' },
  approved: { color: 'green', text: '已通过' },
  rejected: { color: 'red', text: '已拒绝' },
}

const mockCreatives: CreativeWithReview[] = [
  { id: 1, name: '春季横幅广告', type: 'banner', url: 'https://cdn.example.com/c1.jpg', reviewStatus: 'approved', campaignId: 1, campaignName: '品牌曝光春季活动', createdAt: '2026-04-01T00:00:00Z' },
  { id: 2, name: '促销视频30s', type: 'video', url: 'https://cdn.example.com/c2.mp4', reviewStatus: 'pending_review', campaignId: 2, campaignName: '促销转化活动', createdAt: '2026-04-10T00:00:00Z' },
  { id: 3, name: '信息流原生图', type: 'native', url: 'https://cdn.example.com/c3.jpg', reviewStatus: 'rejected', rejectReason: '图片包含违禁词汇，请修改后重新提交', campaignId: 1, campaignName: '品牌曝光春季活动', createdAt: '2026-04-05T00:00:00Z' },
]

export default function AdvertiserCreatives() {
  const { accountId } = useAuthStore()
  const [creatives, setCreatives] = useState<CreativeWithReview[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadVisible, setUploadVisible] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)

  const fetchCreatives = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const res = await listCreativesWithReview(accountId, { page: 1, pageSize: 20 })
      if (res.data?.list) setCreatives(res.data.list)
    } catch {
      setCreatives(mockCreatives)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCreatives() }, [accountId])

  const handleUpload = async (values: { name: string; type: string; campaignId: number }) => {
    if (fileList.length === 0) { message.warning('请先选择素材文件'); return }
    setUploading(true)
    try {
      // 模拟上传成功
      await new Promise((r) => setTimeout(r, 800))
      message.success(`素材"${values.name}"上传成功，等待审核`)
      setUploadVisible(false)
      form.resetFields()
      setFileList([])
      fetchCreatives()
    } catch {
      message.error('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const columns = [
    { title: '素材名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => ({ banner: '横幅', video: '视频', native: '原生' }[v] ?? v) },
    { title: '所属活动', dataIndex: 'campaignName', key: 'campaignName' },
    {
      title: '审核状态', dataIndex: 'reviewStatus', key: 'reviewStatus',
      render: (s: ReviewStatus, record: CreativeWithReview) => {
        const cfg = reviewStatusConfig[s]
        if (s === 'rejected' && record.rejectReason) {
          return (
            <Tooltip title={<span>拒绝原因：{record.rejectReason}</span>}>
              <Tag color={cfg.color} style={{ cursor: 'help' }}>{cfg.text} ⓘ</Tag>
            </Tooltip>
          )
        }
        return <Tag color={cfg?.color}>{cfg?.text ?? s}</Tag>
      },
    },
    { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: CreativeWithReview) => (
        <Space>
          <Button size="small" href={record.url} target="_blank">预览</Button>
          {record.reviewStatus === 'rejected' && (
            <Button size="small" type="link" onClick={() => setUploadVisible(true)}>重新提交</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>素材管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadVisible(true)}>上传素材</Button>
      </div>

      <Table dataSource={creatives} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title="上传素材"
        open={uploadVisible}
        onCancel={() => { setUploadVisible(false); form.resetFields(); setFileList([]) }}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item name="name" label="素材名称" rules={[{ required: true, message: '请输入素材名称' }]}>
            <Input placeholder="如：春季横幅 728x90" maxLength={50} />
          </Form.Item>
          <Form.Item name="type" label="素材类型" rules={[{ required: true, message: '请选择素材类型' }]}>
            <Select options={[
              { value: 'banner', label: '横幅广告' },
              { value: 'video', label: '视频广告' },
              { value: 'native', label: '原生广告' },
            ]} />
          </Form.Item>
          <Form.Item label="素材文件">
            <Dragger
              fileList={fileList}
              beforeUpload={(file) => { setFileList([file]); return false }}
              onRemove={() => setFileList([])}
              accept="image/*,video/*"
              maxCount={1}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                <Text type="secondary">支持图片（JPG/PNG/GIF）或视频（MP4/MOV），单文件不超过 50MB</Text>
              </p>
            </Dragger>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={uploading} icon={<UploadOutlined />}>提交审核</Button>
              <Button onClick={() => { setUploadVisible(false); form.resetFields(); setFileList([]) }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
