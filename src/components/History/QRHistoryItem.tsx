import { Card, CardContent } from '@/components/ui/card'
import { QRHistoryActions } from './QRHistoryActions'
import type { QRHistoryItem } from '@/types/history'

interface QRHistoryItemProps {
  item: QRHistoryItem
  imageUrl: string | null
  onDownload: (item: QRHistoryItem) => void
  onDelete: (itemId: string) => void
  isDeleting?: boolean
}

export function QRHistoryItemComponent({
  item,
  imageUrl,
  onDownload,
  onDelete,
  isDeleting = false,
}: QRHistoryItemProps) {
  const createdDate = new Date(item.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* QR 이미지 썸네일 */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="QR Code"
                className="h-32 w-32 rounded border object-contain"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded border bg-muted">
                <span className="text-sm text-muted-foreground">로딩 중...</span>
              </div>
            )}
          </div>

          {/* 정보 및 액션 */}
          <div className="flex flex-1 flex-col justify-between gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">URL</p>
              <p className="break-all text-sm">{item.url}</p>
              <p className="text-sm text-muted-foreground">생성일: {createdDate}</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className="h-4 w-4 rounded border"
                    style={{ backgroundColor: item.foreground_color }}
                  />
                  <span className="text-xs text-muted-foreground">전경</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="h-4 w-4 rounded border"
                    style={{ backgroundColor: item.background_color }}
                  />
                  <span className="text-xs text-muted-foreground">배경</span>
                </div>
              </div>
            </div>

            <QRHistoryActions
              item={item}
              onDownload={onDownload}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

