import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse, PageResult } from '../types/entities'

type Fetcher<T> = (page: number, pageSize: number) => Promise<ApiResponse<PageResult<T>>>

export function useTableData<T>(fetcher: Fetcher<T>, defaultPageSize = 10) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher(page, pageSize)
      .then((res) => {
        if (cancelled) return
        setData(res.data?.list ?? [])
        setTotal(res.data?.total ?? 0)
      })
      .catch(() => {
        if (!cancelled) setData([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, page, pageSize, version])

  return { data, total, loading, page, pageSize, setPage, setPageSize, refresh }
}
