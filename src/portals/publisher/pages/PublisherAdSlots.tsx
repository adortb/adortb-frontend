import { useEffect, useState } from 'react'
import { Table, Button, Tag, Space, Typography, message, Modal } from 'antd'
import { PlusOutlined, CopyOutlined, CodeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth'
import { listAdSlots } from '../../../api/adslot'
import type { AdSlot } from '../../../types/entities'

const { Title, Text } = Typography

const statusMap: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '投放中' },
  inactive: { color: 'default', text: '已停用' },
  pending: { color: 'orange', text: '审核中' },
}

const generateJsTag = (slot: AdSlot): string =>
  `<!-- adortb Ad Tag - ${slot.name} -->
<div id="adortb-slot-${slot.id}" style="width:${slot.width}px;height:${slot.height}px;"></div>
<script>
(function() {
  var s = document.createElement('script');
  s.src = 'https://sdk.adortb.io/adloader.min.js';
  s.setAttribute('data-slot-id', '${slot.id}');
  s.setAttribute('data-publisher-id', '${slot.publisherId}');
  s.async = true;
  document.head.appendChild(s);
})();
</script>`

export default function PublisherAdSlots() {
  const { accountId } = useAuthStore()
  const navigate = useNavigate()
  const [slots, setSlots] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [tagModal, setTagModal] = useState<{ visible: boolean; slot: AdSlot | null }>({ visible: false, slot: null })

  const fetchSlots = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const res = await listAdSlots({ page: 1, pageSize: 20, publisherId: Number(accountId) })
      if (res.data?.list) setSlots(res.data.list)
    } catch {
      setSlots([
        { id: 1, publisherId: Number(accountId), name: '首页横幅', type: 'banner', width: 728, height: 90, floorPrice: 1.5, status: 'active', createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
        { id: 2, publisherId: Number(accountId), name: '文章底部', type: 'banner', width: 320, height: 50, floorPrice: 1.0, status: 'active', createdAt: '2026-04-05T00:00:00Z', updatedAt: '2026-04-05T00:00:00Z' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSlots() }, [accountId])

  const copyTag = (slot: AdSlot) => {
    const tag = generateJsTag(slot)
    navigator.clipboard.writeText(tag)
      .then(() => message.success('JS Tag 已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制'))
  }

  const columns = [
    { title: '广告位名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => ({ banner: '横幅', interstitial: '插屏', native: '原生' }[v] ?? v) },
    { title: '尺寸', key: 'size', render: (_: unknown, r: AdSlot) => `${r.width}×${r.height}` },
    { title: '底价(CPM)', dataIndex: 'floorPrice', key: 'floorPrice', render: (v: number) => `¥${v.toFixed(2)}` },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text ?? s}</Tag>,
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: AdSlot) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/publisher/adslots/${record.id}/edit`)}>编辑</Button>
          <Button
            size="small"
            icon={<CodeOutlined />}
            onClick={() => setTagModal({ visible: true, slot: record })}
          >
            JS Tag
          </Button>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyTag(record)}
          >
            复制
          </Button>
        </Space>
      ),
    },
  ]

  const tagSlot = tagModal.slot

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>广告位管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/publisher/adslots/new')}>新建广告位</Button>
      </div>

      <Table dataSource={slots} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={`JS Tag — ${tagSlot?.name}`}
        open={tagModal.visible}
        onCancel={() => setTagModal({ visible: false, slot: null })}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => tagSlot && copyTag(tagSlot)}>
            复制 Tag
          </Button>,
          <Button key="close" onClick={() => setTagModal({ visible: false, slot: null })}>关闭</Button>,
        ]}
        width={620}
      >
        {tagSlot && (
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontSize: 12,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {generateJsTag(tagSlot)}
          </pre>
        )}
        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          将以上代码粘贴到您网页 &lt;body&gt; 中广告位置，SDK 将自动加载广告。
        </Text>
      </Modal>
    </div>
  )
}
