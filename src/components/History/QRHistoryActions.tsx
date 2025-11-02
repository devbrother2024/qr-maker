import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QRHistoryItem } from '@/types/history'

interface QRHistoryActionsProps {
  item: QRHistoryItem
  onDownload: (item: QRHistoryItem) => void
  onDelete: (itemId: string) => void
  isDeleting?: boolean
}

export function QRHistoryActions({
  item,
  onDownload,
  onDelete,
  isDeleting = false,
}: QRHistoryActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDownload(item)}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        다운로드
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(item.id)}
        disabled={isDeleting}
        className="flex-1"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        삭제
      </Button>
    </div>
  )
}

