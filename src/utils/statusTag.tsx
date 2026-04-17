import { Tag } from 'antd'
import type { Status } from '../types/entities'

const STATUS_MAP: Record<Status, { color: string; label: string }> = {
  active: { color: 'success', label: '启用' },
  inactive: { color: 'default', label: '禁用' },
  pending: { color: 'warning', label: '待审核' },
}

export function statusTag(status: Status) {
  const cfg = STATUS_MAP[status] ?? { color: 'default', label: status }
  return <Tag color={cfg.color}>{cfg.label}</Tag>
}
