import { useEffect, useState } from 'react'
import { useQRHistory } from '@/hooks/useQRHistory'
import { QRHistoryItemComponent } from './QRHistoryItem'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { QRHistoryItem } from '@/types/history'

interface QRHistoryProps {
  onDownloadItem?: (item: QRHistoryItem) => void
}

export function QRHistory({ onDownloadItem }: QRHistoryProps) {
  const { items, loading, error, deleteQR, getImageUrl } = useQRHistory()
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({})
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // 각 항목의 이미지 URL 로드
  useEffect(() => {
    const loadImageUrls = async () => {
      const urls: Record<string, string | null> = {}
      for (const item of items) {
        const url = await getImageUrl(item.qr_image_storage_path, 'qr-images')
        urls[item.id] = url
      }
      setImageUrls(urls)
    }

    if (items.length > 0) {
      loadImageUrls()
    }
  }, [items, getImageUrl])

  const handleDelete = async (itemId: string) => {
    setDeletingIds((prev) => new Set(prev).add(itemId))
    await deleteQR(itemId)
    setDeletingIds((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const handleDownload = async (item: QRHistoryItem) => {
    if (onDownloadItem) {
      onDownloadItem(item)
      return
    }

    // 기본 다운로드 동작: Storage에서 이미지 다운로드
    const imageUrl = imageUrls[item.id]
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `qr-code-${item.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">저장된 QR 코드가 없습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          QR 코드를 생성하고 저장 버튼을 클릭하여 히스토리에 추가하세요.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <QRHistoryItemComponent
          key={item.id}
          item={item}
          imageUrl={imageUrls[item.id] || null}
          onDownload={handleDownload}
          onDelete={handleDelete}
          isDeleting={deletingIds.has(item.id)}
        />
      ))}
    </div>
  )
}

