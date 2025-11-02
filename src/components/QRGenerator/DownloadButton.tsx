import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { QRFormat } from '@/types/qr'

interface DownloadButtonProps {
  onDownload: (format: QRFormat) => void
  disabled?: boolean
}

export function DownloadButton({
  onDownload,
  disabled,
}: DownloadButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled} size="lg" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDownload('png')}>
          PNG로 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload('svg')}>
          SVG로 다운로드
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

